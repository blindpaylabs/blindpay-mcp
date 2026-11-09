/**
 * The store manifests whose "version" follows package.json (listed in
 * VERSIONED_MANIFESTS below). Pure helpers, used by scripts/sync.mts (which
 * writes them) and scripts/check-versions.mts (the CI gate).
 * plugins/blindpay and plugins/openai are not here: each carries its own
 * version, raised on every directory submission.
 */

export interface VersionedManifest {
  path: string;
  /** How many "version" fields the file holds; every one follows package.json. */
  versionFieldCount: number;
}

export const VERSIONED_MANIFESTS: readonly VersionedManifest[] = [
  // The server and its npm package.
  { path: 'server.json', versionFieldCount: 2 },
  { path: 'gemini-extension.json', versionFieldCount: 1 },
  { path: '.claude-plugin/plugin.json', versionFieldCount: 1 },
  { path: '.claude-plugin/marketplace.json', versionFieldCount: 1 },
  { path: '.grok-plugin/plugin.json', versionFieldCount: 1 },
  { path: 'plugins/cursor/.cursor-plugin/plugin.json', versionFieldCount: 1 },
];

const VERSION_FIELD = /("version":\s*")(\d+\.\d+\.\d+)(")/g;

/** The versions a manifest's "version" fields hold, in file order. */
export function manifestVersions(source: string): string[] {
  return [...source.matchAll(VERSION_FIELD)].map((match) => match[2]);
}

// A new field may not follow package.json, so neither the sync nor the gate guesses.
function fieldCountProblem(manifest: VersionedManifest, found: number): string | undefined {
  return found === manifest.versionFieldCount
    ? undefined
    : `${manifest.path} has ${found} "version" fields where ${manifest.versionFieldCount} were expected`;
}

/** Why a manifest's versions don't all equal `expected`, or undefined when they do. */
export function manifestVersionProblem(manifest: VersionedManifest, source: string, expected: string): string | undefined {
  const versions = manifestVersions(source);
  const countProblem = fieldCountProblem(manifest, versions.length);
  if (countProblem) return countProblem;
  return versions.every((version) => version === expected) ? undefined : `${manifest.path} is at ${versions.join(', ')}`;
}

/**
 * Sets every "version" field of a manifest to `version` and leaves the rest of
 * the file byte for byte. Throws when the file holds a different number of
 * fields than expected.
 */
export function setManifestVersion(manifest: VersionedManifest, source: string, version: string): string {
  const countProblem = fieldCountProblem(manifest, manifestVersions(source).length);
  if (countProblem) throw new Error(`${countProblem}. Refusing to guess which ones follow package.json.`);
  return source.replace(VERSION_FIELD, (_field, open: string, _old: string, close: string) => `${open}${version}${close}`);
}
