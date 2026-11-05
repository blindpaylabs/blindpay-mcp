#!/usr/bin/env node
/**
 * Static gate: fails if a store manifest's version differs from package.json.
 * sync.mts writes them together; this catches a hand edit (a deliberate major
 * bump, say) that moves one without the others. Run on every PR (ci.yml).
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { manifestVersionProblem, VERSIONED_MANIFESTS } from './lib/manifest-versions.mts';

const root = process.cwd();
const expected = (JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string }).version;

const problems = VERSIONED_MANIFESTS.map((manifest) => {
  const path = resolve(root, manifest.path);
  if (!existsSync(path)) return `${manifest.path} is missing`;
  return manifestVersionProblem(manifest, readFileSync(path, 'utf8'), expected);
}).filter((problem) => problem !== undefined);

if (problems.length > 0) {
  console.error(`Manifest versions must match package.json (${expected}):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}

console.log(`OK: ${VERSIONED_MANIFESTS.length} manifests at ${expected}, like package.json.`);
