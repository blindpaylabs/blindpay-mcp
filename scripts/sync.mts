#!/usr/bin/env node
/**
 * Deterministic replacement for the old "generate + ask Claude to merge"
 * pipeline. Produces src/index.ts as: src/index.template.ts (frozen,
 * hand-maintained) with a freshly generated toolDefinitionMap spliced in,
 * and bumps package.json's version from a scripted diff of the tool-name
 * set. No LLM, no guessing: anything the generator output doesn't match the
 * expected shape for is a hard failure.
 *
 * Usage:
 *   node --import tsx scripts/sync.mts [--spec path] [--out-dir dir] [--check]
 *
 * --check: run the full pipeline into a scratch location and diff against
 *          the committed src/index.ts + package.json instead of writing.
 *          Exit 1 on any difference. Used for the determinism/equivalence
 *          proofs and can be wired into CI.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  extractToolMapEntries,
  extractToolNames,
  renameOverLongTools,
  assertToolNamesWithinLimit,
  decideVersionBump,
  bumpSemver,
} from './lib/tool-map.mts';

interface Args {
  spec: string;
  outDir: string;
  check: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    spec: resolve(process.cwd(), '.api-sync/openapi.json'),
    outDir: process.env.MCP_GENERATE_OUT ?? '/tmp/mcp-generated',
    check: false,
  };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--spec') args.spec = resolve(process.cwd(), argv[++i]);
    else if (argv[i] === '--out-dir') args.outDir = argv[++i];
    else if (argv[i] === '--check') args.check = true;
  }
  return args;
}

function runGenerator(specPath: string, outDir: string): void {
  if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const result = spawnSync(
    'npx',
    ['--yes', 'openapi-mcp-generator', '--input', specPath, '--output', outDir, '--force'],
    { stdio: 'inherit' },
  );
  if (result.status !== 0) {
    console.error('openapi-mcp-generator failed.');
    process.exit(result.status ?? 1);
  }
}

function fail(message: string): never {
  console.error(`\nsync.mts: ${message}`);
  process.exit(1);
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const repoRoot = process.cwd();

  if (!existsSync(args.spec)) {
    fail(
      `Spec not found at ${args.spec}. The api-sync workflow fetches it from the ` +
        'api-sync-data branch before running this script.',
    );
  }

  runGenerator(args.spec, args.outDir);

  const generatedPath = resolve(args.outDir, 'src/index.ts');
  if (!existsSync(generatedPath)) {
    fail(`Generator did not produce ${generatedPath}.`);
  }
  const generatedSource = readFileSync(generatedPath, 'utf8');

  let rawEntries: string;
  try {
    rawEntries = extractToolMapEntries(generatedSource);
  } catch (err) {
    fail((err as Error).message);
  }

  let renamed: ReturnType<typeof renameOverLongTools>;
  try {
    renamed = renameOverLongTools(rawEntries!);
  } catch (err) {
    fail((err as Error).message);
  }

  const newNames = extractToolNames(renamed!.text);
  try {
    assertToolNamesWithinLimit(newNames);
  } catch (err) {
    fail((err as Error).message);
  }
  if (new Set(newNames).size !== newNames.length) {
    fail('Generated tool map has duplicate tool names after renaming. Refusing to guess.');
  }

  const templatePath = resolve(repoRoot, 'src/index.template.ts');
  if (!existsSync(templatePath)) fail(`Template not found at ${templatePath}.`);
  const template = readFileSync(templatePath, 'utf8');
  if (!template.includes('/* __TOOL_DEFINITIONS__ */')) {
    fail('Template is missing the /* __TOOL_DEFINITIONS__ */ marker.');
  }
  if (!template.includes('__SERVER_VERSION__')) {
    fail('Template is missing the __SERVER_VERSION__ marker.');
  }

  const committedIndexPath = resolve(repoRoot, 'src/index.ts');
  let oldNames: string[] = [];
  if (existsSync(committedIndexPath)) {
    const committed = readFileSync(committedIndexPath, 'utf8');
    try {
      oldNames = extractToolNames(extractToolMapEntries(committed));
    } catch {
      // Committed file doesn't have a recognizable map yet (e.g. first run) — treat as empty.
      oldNames = [];
    }
  }

  const bump = decideVersionBump(oldNames, newNames);

  const packageJsonPath = resolve(repoRoot, 'package.json');
  const packageJsonSource = readFileSync(packageJsonPath, 'utf8');
  const versionMatch = /"version":\s*"(\d+\.\d+\.\d+)"/.exec(packageJsonSource);
  if (!versionMatch) fail(`Could not find a plain-semver "version" field in ${packageJsonPath}.`);
  const oldVersion = versionMatch![1];
  const newVersion = bumpSemver(oldVersion, bump);
  const newPackageJson = packageJsonSource.replace(
    /"version":\s*"\d+\.\d+\.\d+"/,
    `"version": "${newVersion}"`,
  );

  const builtIndex = template
    .replace('/* __TOOL_DEFINITIONS__ */', renamed!.text.trim())
    .replace('__SERVER_VERSION__', newVersion);

  const added = newNames.filter((n) => !oldNames.includes(n));
  const removed = oldNames.filter((n) => !newNames.includes(n));

  const summary = {
    bump,
    oldVersion,
    newVersion,
    toolCount: newNames.length,
    added,
    removed,
    renames: renamed!.renames,
  };

  if (args.check) {
    const committed = existsSync(committedIndexPath)
      ? readFileSync(committedIndexPath, 'utf8')
      : '';
    const indexDiffers = committed !== builtIndex;
    const versionDiffers = packageJsonSource !== newPackageJson;
    console.log(JSON.stringify(summary, null, 2));
    if (indexDiffers || versionDiffers) {
      console.error(
        '\n--check found differences between the committed files and a fresh regeneration ' +
          '(see summary above). This is expected when the spec changed; run without --check ' +
          'to apply.',
      );
      process.exit(indexDiffers || versionDiffers ? 2 : 0);
    }
    console.log('\nNo differences: committed src/index.ts and package.json already match the spec.');
    return;
  }

  writeFileSync(committedIndexPath, builtIndex);
  writeFileSync(packageJsonPath, newPackageJson);
  console.log(JSON.stringify(summary, null, 2));
}

main();
