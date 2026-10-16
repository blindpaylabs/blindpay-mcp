import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkPluginReadiness, type PluginSnapshot } from './plugin-check.mts';

const README = `# BlindPay\n\n${'Ask Claude about your BlindPay payouts and payins. '.repeat(10)}`;

function validSnapshot(): PluginSnapshot {
  return {
    manifest: {
      name: 'blindpay',
      version: '1.1.1',
      description: 'Read-only access to your BlindPay payment operations.',
      author: { name: 'BlindPay' },
      license: 'MIT',
      icon: './assets/logo.png',
      documentationUrl: 'https://blindpay.com/docs',
      supportUrl: 'https://blindpay.com/contact',
      privacyPolicyUrl: 'https://blindpay.com/privacy-policy',
      termsOfServiceUrl: 'https://blindpay.com/terms-of-service',
      mcpServers: './.mcp.json',
    },
    mcpConfig: {
      mcpServers: { blindpay: { type: 'http', url: 'https://mcp.blindpay.com/mcp/readonly' } },
    },
    readme: README,
    files: [
      { path: '.claude-plugin/plugin.json', size: 858 },
      { path: '.mcp.json', size: 125 },
      { path: 'LICENSE', size: 1070 },
      { path: 'README.md', size: README.length },
      { path: 'assets/logo.png', size: 16055 },
      { path: 'skills/blindpay-payments/SKILL.md', size: 6592 },
    ],
  };
}

function withManifest(patch: Record<string, unknown>): PluginSnapshot {
  const s = validSnapshot();
  return { ...s, manifest: { ...(s.manifest as Record<string, unknown>), ...patch } };
}

function problemsMatching(snapshot: PluginSnapshot, pattern: RegExp): string[] {
  return checkPluginReadiness(snapshot).filter((p) => pattern.test(p));
}

test('a plugin that meets every rule has no problems', () => {
  assert.deepEqual(checkPluginReadiness(validSnapshot()), []);
});

test('the icon must be set, since the directory listing reads it', () => {
  const { icon: _icon, ...manifest } = validSnapshot().manifest as Record<string, unknown>;
  assert.equal(problemsMatching({ ...validSnapshot(), manifest }, /icon/).length, 1);
});

test('the icon must point at an image that exists inside the plugin folder', () => {
  assert.equal(problemsMatching(withManifest({ icon: './assets/missing.png' }), /icon/).length, 1);
  assert.equal(problemsMatching(withManifest({ icon: '../assets/logo.png' }), /icon/).length, 1);
  assert.equal(problemsMatching(withManifest({ icon: './README.md' }), /icon/).length, 1);
});

test('each listing URL must be an https URL', () => {
  assert.equal(problemsMatching(withManifest({ supportUrl: undefined }), /supportUrl/).length, 1);
  assert.equal(problemsMatching(withManifest({ privacyPolicyUrl: 'http://blindpay.com/privacy-policy' }), /privacyPolicyUrl/).length, 1);
  assert.equal(problemsMatching(withManifest({ documentationUrl: 'not a url' }), /documentationUrl/).length, 1);
});

test('name, version, description and author must be set', () => {
  assert.equal(problemsMatching(withManifest({ name: 'BlindPay Plugin' }), /name/).length, 1);
  assert.equal(problemsMatching(withManifest({ version: '' }), /version/).length, 1);
  assert.equal(problemsMatching(withManifest({ description: undefined }), /description/).length, 1);
  assert.equal(problemsMatching(withManifest({ author: {} }), /author/).length, 1);
});

test('the full MCP server is rejected, because the directory refuses connectors that move money', () => {
  const snapshot = {
    ...validSnapshot(),
    mcpConfig: { mcpServers: { blindpay: { type: 'http', url: 'https://mcp.blindpay.com/mcp' } } },
  };
  assert.equal(problemsMatching(snapshot, /mcp\.blindpay\.com\/mcp\b/).length, 1);
});

test('a local or non-https MCP server is rejected', () => {
  const snapshot = {
    ...validSnapshot(),
    mcpConfig: {
      mcpServers: {
        local: { command: 'npx', args: ['-y', '@blindpay/mcp'] },
        plain: { type: 'http', url: 'http://mcp.blindpay.com/mcp/readonly' },
      },
    },
  };
  assert.equal(problemsMatching(snapshot, /"local"|"plain"/).length, 2);
});

test('a plugin with no MCP server is rejected, since it would list nothing to connect to', () => {
  assert.equal(problemsMatching({ ...validSnapshot(), mcpConfig: { mcpServers: {} } }, /MCP server/).length, 1);
});

test('the README needs at least 40 words outside code blocks', () => {
  const readme = `# BlindPay\n\nShort.\n\n\`\`\`\n${'word '.repeat(100)}\n\`\`\`\n`;
  assert.equal(problemsMatching({ ...validSnapshot(), readme }, /README/).length, 1);
});

test('a LICENSE file or a license field is required', () => {
  const s = withManifest({ license: undefined });
  const files = s.files.filter((f) => f.path !== 'LICENSE');
  assert.equal(problemsMatching({ ...s, files }, /licen[cs]e/i).length, 1);
  assert.deepEqual(problemsMatching(s, /licen[cs]e/i), []);
});

test('OS junk files, a top-level bin directory and oversized files are rejected', () => {
  const s = validSnapshot();
  const files = [
    ...s.files,
    { path: 'assets/.DS_Store', size: 6148 },
    { path: 'bin/blindpay', size: 100 },
    { path: 'skills/blindpay-payments/references/huge.md', size: 300 * 1024 },
  ];
  const problems = checkPluginReadiness({ ...s, files });
  assert.equal(problems.filter((p) => p.includes('.DS_Store')).length, 1);
  assert.equal(problems.filter((p) => p.includes('bin/')).length, 1);
  assert.equal(problems.filter((p) => p.includes('huge.md')).length, 1);
});

test('images may exceed the 256 KiB text limit, up to 5 MiB', () => {
  const s = validSnapshot();
  const files = s.files.map((f) => (f.path === 'assets/logo.png' ? { ...f, size: 1024 * 1024 } : f));
  assert.deepEqual(checkPluginReadiness({ ...s, files }), []);
  const tooBig = s.files.map((f) => (f.path === 'assets/logo.png' ? { ...f, size: 6 * 1024 * 1024 } : f));
  assert.equal(problemsMatching({ ...s, files: tooBig }, /logo\.png/).length, 1);
});

test('binary formats the scanner cannot inspect are rejected', () => {
  const s = validSnapshot();
  const files = [...s.files, { path: 'assets/favicon.ico', size: 4000 }, { path: 'server.mcpb', size: 4000 }];
  assert.equal(problemsMatching({ ...s, files }, /favicon\.ico|server\.mcpb/).length, 2);
});
