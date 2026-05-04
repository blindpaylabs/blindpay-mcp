#!/usr/bin/env node
/**
 * Runs openapi-mcp-generator against the filtered OpenAPI spec at
 * .api-sync/openapi.mcp.json and writes the generated reference output to
 * /tmp/mcp-generated/. The api-sync workflow then asks Claude to merge the
 * regenerated tool definitions into src/index.ts while preserving the
 * customizations documented in CLAUDE.md.
 *
 * Direct invocation:
 *   npm run generate
 *
 * Required input:
 *   .api-sync/openapi.mcp.json   (pulled from the api-sync-data branch)
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const SPEC_PATH = resolve(process.cwd(), '.api-sync/openapi.mcp.json');
const OUT_DIR = process.env.MCP_GENERATE_OUT ?? '/tmp/mcp-generated';

if (!existsSync(SPEC_PATH)) {
  console.error(`Spec not found at ${SPEC_PATH}.`);
  console.error('Fetch the api-sync-data branch first or set MCP_GENERATE_SPEC.');
  process.exit(1);
}

if (existsSync(OUT_DIR)) {
  rmSync(OUT_DIR, { recursive: true, force: true });
}
mkdirSync(OUT_DIR, { recursive: true });

const result = spawnSync(
  'npx',
  ['--yes', 'openapi-mcp-generator', '--input', SPEC_PATH, '--output', OUT_DIR],
  { stdio: 'inherit' },
);

if (result.status !== 0) {
  console.error('openapi-mcp-generator failed.');
  process.exit(result.status ?? 1);
}

console.log(`\nReference output written to ${OUT_DIR}/src/index.ts.`);
console.log('The api-sync workflow will merge it into src/index.ts.');
