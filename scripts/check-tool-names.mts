#!/usr/bin/env node
/**
 * Static gate: fails if any tool name in src/index.ts exceeds the MCP
 * combined-name limit. Run on every PR (ci.yml) so a hand edit can't
 * reintroduce an over-length name between syncs.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  extractToolMapEntries,
  extractToolNames,
  assertToolNamesWithinLimit,
  MAX_TOOL_NAME_LENGTH,
} from './lib/tool-map.mts';

const target = resolve(process.cwd(), process.argv[2] ?? 'src/index.ts');
const source = readFileSync(target, 'utf8');

const entries = extractToolMapEntries(source);
const names = extractToolNames(entries);

if (names.length === 0) {
  console.error(`No tool names found in ${target}. Refusing to pass a check that checked nothing.`);
  process.exit(1);
}

try {
  assertToolNamesWithinLimit(names);
} catch (err) {
  console.error((err as Error).message);
  process.exit(1);
}

console.log(`OK: ${names.length} tool names, all <= ${MAX_TOOL_NAME_LENGTH} chars.`);
