#!/usr/bin/env node
/**
 * Static gate: fails if the ChatGPT/Codex plugin package (plugins/openai by
 * default) breaks an OpenAI submission limit or points at a server other than
 * the read-only endpoint. Run on every PR (ci.yml), since the package is
 * uploaded as it stands in the repo, plus the blindpay-payments skill.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { checkOpenAiPlugin, type OpenAiManifest } from './lib/openai-plugin-check.mts';

const root = resolve(process.cwd(), process.argv[2] ?? 'plugins/openai');
const label = relative(process.cwd(), root) || '.';

function readJson(name: string): unknown {
  try {
    return JSON.parse(readFileSync(join(root, name), 'utf8'));
  } catch (err) {
    console.error(`${label}/${name} could not be read as JSON: ${(err as Error).message}`);
    process.exit(1);
  }
}

const problems = checkOpenAiPlugin({
  manifest: readJson('plugin.json') as OpenAiManifest,
  mcp: readJson('mcp.json'),
  filePaths: readdirSync(root, { recursive: true, encoding: 'utf8' }).map((path) => path.split('\\').join('/')),
});

if (problems.length > 0) {
  console.error(`${label} isn't ready for OpenAI's plugin directory:`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(`OK: ${label} meets the OpenAI plugin directory checks.`);
