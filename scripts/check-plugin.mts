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

const MANIFEST = '.claude-plugin/plugin.json';

const root = resolve(process.cwd(), process.argv[2] ?? 'plugins/blindpay');
const label = relative(process.cwd(), root) || '.';

// Tracked files only: the directory reads the plugin from GitHub, so untracked
// local files (.DS_Store, build output) must not fail the check, and a
// committed one must. A tracked file deleted locally isn't on disk to stat,
// and won't be on GitHub once the deletion is committed, so it's skipped.
function listTrackedFiles(): PluginFile[] {
  let out = '';
  try {
    out = execFileSync('git', ['ls-files', '-z', '--', '.'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    // Not a git checkout (or no such folder): no tracked files, so the
    // manifest guard below reports it.
  }
  return out
    .split('\0')
    .filter((path) => path !== '' && existsSync(join(root, path)))
    .map((path) => ({ path, size: statSync(join(root, path)).size }));
}

function parseJsonFiles(files: PluginFile[]): { jsonFiles: Record<string, unknown>; problems: string[] } {
  const jsonFiles: Record<string, unknown> = {};
  const problems: string[] = [];
  for (const { path } of files.filter((f) => f.path.endsWith('.json'))) {
    try {
      jsonFiles[path] = JSON.parse(readFileSync(join(root, path), 'utf8'));
    } catch (err) {
      problems.push(`${path} is not valid JSON: ${(err as Error).message}`);
    }
  }
  return { jsonFiles, problems };
}

const files = listTrackedFiles();

if (!files.some((f) => f.path === MANIFEST)) {
  console.error(`No tracked ${MANIFEST} under ${label}. Refusing to pass a check that checked nothing.`);
  process.exit(1);
}

const { jsonFiles, problems: jsonProblems } = parseJsonFiles(files);
const readmePath = join(root, 'README.md');
const problems = [
  ...jsonProblems,
  ...checkPluginReadiness({
    manifest: jsonFiles[MANIFEST],
    jsonFiles,
    readme: existsSync(readmePath) ? readFileSync(readmePath, 'utf8') : null,
    files,
  }),
];

if (problems.length > 0) {
  console.error(`${label} isn't ready for the Claude directory:`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(`OK: ${label} meets the Claude directory checks.`);
