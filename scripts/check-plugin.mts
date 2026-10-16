#!/usr/bin/env node
/**
 * Static gate: fails if the Claude directory plugin (plugins/blindpay by
 * default) breaks a directory submission rule, such as a missing icon, a
 * non-https listing URL, or an MCP server other than the read-only endpoint.
 * Run on every PR (ci.yml) so the directory keeps picking up valid versions
 * from main.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { checkPluginReadiness, type PluginFile } from './lib/plugin-check.mts';

const root = resolve(process.cwd(), process.argv[2] ?? 'plugins/blindpay');
const label = relative(process.cwd(), root) || '.';

// Tracked files only: the directory reads the plugin from GitHub, so untracked
// local files (.DS_Store, build output) must not fail the check, and a
// committed one must.
function listTrackedFiles(): PluginFile[] {
  const out = execFileSync('git', ['ls-files', '-z', '--', '.'], { cwd: root, encoding: 'utf8' });
  return out
    .split('\0')
    .filter(Boolean)
    .map((path) => ({ path, size: statSync(join(root, path)).size }));
}

function readJson(path: string): unknown {
  const full = join(root, path);
  if (!existsSync(full)) return null;
  try {
    return JSON.parse(readFileSync(full, 'utf8'));
  } catch (err) {
    console.error(`${path} is not valid JSON: ${(err as Error).message}`);
    process.exit(1);
  }
}

if (!existsSync(join(root, '.claude-plugin/plugin.json'))) {
  console.error(`No .claude-plugin/plugin.json under ${root}. Refusing to pass a check that checked nothing.`);
  process.exit(1);
}

const readmePath = join(root, 'README.md');
const problems = checkPluginReadiness({
  manifest: readJson('.claude-plugin/plugin.json'),
  mcpConfig: readJson('.mcp.json'),
  readme: existsSync(readmePath) ? readFileSync(readmePath, 'utf8') : null,
  files: listTrackedFiles(),
});

if (problems.length > 0) {
  console.error(`${label} isn't ready for the Claude directory:`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(`OK: ${label} meets the Claude directory checks.`);
