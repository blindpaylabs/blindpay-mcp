import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkOpenAiPlugin, type OpenAiPluginSnapshot } from './openai-plugin-check.mts';

const POSITIVE = { description: 'd', prompt: 'p', tools_triggered: ['GetV1InstancesPayouts'], expected_behavior: 'e' };
const NEGATIVE = { description: 'd', prompt: 'p' };
const AUTH = { type: 'oauth', client: { mode: 'cimd' }, defaultScopes: ['openid', 'profile', 'email', 'offline_access'] };

function withAuth(auth: unknown): OpenAiPluginSnapshot {
  const url = 'https://mcp.blindpay.com/mcp/readonly';
  return { ...validSnapshot(), mcp: { mcpServers: { blindpay: { type: 'streamable-http', url, extensions: { 'com.openai': { auth } } } } } };
}

function validSnapshot(): OpenAiPluginSnapshot {
  return {
    manifest: {
      $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
      name: 'blindpay',
      version: '1.0.0',
      extensions: {
        'com.openai': {
          interface: {
            displayName: 'BlindPay',
            shortDescription: 'Track stablecoin payments',
            longDescription: 'Reads payouts.',
            developerName: 'BlindPay',
            category: 'Finance',
            websiteURL: 'https://blindpay.com',
            supportURL: 'https://blindpay.com/contact',
            privacyPolicyURL: 'https://blindpay.com/privacy-policy',
            termsOfServiceURL: 'https://blindpay.com/terms-of-service',
            defaultPrompt: ['List my payouts.'],
            logo: './assets/logo.png',
            composerIcon: './assets/composer-icon.png',
          },
          review: { test_cases: { positive: [POSITIVE, POSITIVE, POSITIVE, POSITIVE, POSITIVE], negative: [NEGATIVE, NEGATIVE, NEGATIVE] } },
        },
      },
    },
    mcp: { mcpServers: { blindpay: { type: 'streamable-http', url: 'https://mcp.blindpay.com/mcp/readonly', extensions: { 'com.openai': { auth: AUTH } } } } },
    filePaths: ['plugin.json', 'mcp.json', 'assets/logo.png', 'assets/composer-icon.png'],
  };
}

function withInterface(changes: Record<string, unknown>): OpenAiPluginSnapshot {
  const snapshot = validSnapshot();
  const openai = snapshot.manifest.extensions['com.openai'];
  return { ...snapshot, manifest: { ...snapshot.manifest, extensions: { 'com.openai': { ...openai, interface: { ...openai.interface, ...changes } } } } };
}

function problemsMatching(snapshot: OpenAiPluginSnapshot, pattern: RegExp): string[] {
  return checkOpenAiPlugin(snapshot).filter((p) => pattern.test(p));
}

test('a complete read-only package passes', () => {
  assert.deepEqual(checkOpenAiPlugin(validSnapshot()), []);
});

test('the money-moving server is refused, and so is a package with no server', () => {
  const full = { ...validSnapshot(), mcp: { mcpServers: { blindpay: { type: 'streamable-http', url: 'https://mcp.blindpay.com/mcp' } } } };
  assert.equal(problemsMatching(full, /money/).length, 1);
  assert.equal(problemsMatching({ ...validSnapshot(), mcp: { mcpServers: {} } }, /no MCP server/).length, 1);
});

test('the server must declare OAuth through a client metadata document', () => {
  assert.equal(problemsMatching(withAuth(undefined), /OAuth/).length, 1);
  assert.equal(problemsMatching(withAuth({ ...AUTH, client: { mode: 'dcr' } }), /cimd/).length, 1);
  assert.equal(problemsMatching(withAuth({ ...AUTH, type: 'api_key' }), /OAuth/).length, 1);
});

test('defaultScopes may only ask for scopes Clerk lets ChatGPT request', () => {
  assert.equal(problemsMatching(withAuth({ ...AUTH, defaultScopes: ['openid', 'public_metadata'] }), /public_metadata/).length, 1);
  assert.equal(problemsMatching(withAuth({ ...AUTH, defaultScopes: [] }), /defaultScopes/).length, 1);
  assert.equal(problemsMatching(withAuth({ ...AUTH, defaultScopes: undefined }), /defaultScopes/).length, 1);
});

test('a server must be streamable-http', () => {
  const sse = { ...validSnapshot(), mcp: { mcpServers: { blindpay: { type: 'sse', url: 'https://mcp.blindpay.com/mcp/readonly' } } } };
  assert.equal(problemsMatching(sse, /streamable-http/).length, 1);
});

test('listing text over OpenAI limits fails', () => {
  assert.equal(problemsMatching(withInterface({ displayName: 'B'.repeat(31) }), /displayName/).length, 1);
  assert.equal(problemsMatching(withInterface({ shortDescription: 'S'.repeat(31) }), /shortDescription/).length, 1);
  assert.equal(problemsMatching(withInterface({ defaultPrompt: ['a', 'b', 'c', 'd'] }), /defaultPrompt/).length, 1);
  assert.equal(problemsMatching(withInterface({ defaultPrompt: ['p'.repeat(129)] }), /defaultPrompt/).length, 1);
});

test('missing listing fields and non-https URLs fail', () => {
  assert.equal(problemsMatching(withInterface({ developerName: '' }), /developerName/).length, 1);
  assert.equal(problemsMatching(withInterface({ supportURL: 'http://blindpay.com/contact' }), /supportURL/).length, 1);
});

test('icons must be ./ paths to files in the package', () => {
  assert.equal(problemsMatching(withInterface({ logo: 'assets/logo.png' }), /logo/).length, 1);
  assert.equal(problemsMatching(withInterface({ composerIcon: './assets/missing.png' }), /composerIcon/).length, 1);
});

test('review needs exactly five complete positive cases and three negative cases', () => {
  const snapshot = validSnapshot();
  const openai = snapshot.manifest.extensions['com.openai'];
  const withCases = (positive: unknown[], negative: unknown[]): OpenAiPluginSnapshot => ({
    ...snapshot,
    manifest: { ...snapshot.manifest, extensions: { 'com.openai': { ...openai, review: { test_cases: { positive, negative } } } } },
  });
  assert.equal(problemsMatching(withCases([POSITIVE], [NEGATIVE, NEGATIVE, NEGATIVE]), /positive/).length, 1);
  assert.equal(problemsMatching(withCases(Array(5).fill(POSITIVE), [NEGATIVE]), /negative/).length, 1);
  const incomplete = [{ ...POSITIVE, expected_behavior: '' }, POSITIVE, POSITIVE, POSITIVE, POSITIVE];
  assert.equal(problemsMatching(withCases(incomplete, [NEGATIVE, NEGATIVE, NEGATIVE]), /positive case 1/).length, 1);
});
