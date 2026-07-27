/**
 * Pure helpers for extracting, renaming and validating the toolDefinitionMap
 * block that openapi-mcp-generator writes into its reference src/index.ts.
 * No I/O here so these are unit-testable and reused by scripts/sync.mts and
 * scripts/check-tool-names.mts.
 */

export const MAX_TOOL_NAME_LENGTH = 52;

const MAP_DECL = 'const toolDefinitionMap: Map<string, McpToolDefinition> = new Map([';
const MAP_CLOSE = ']);';

/**
 * Slices out the `const toolDefinitionMap = new Map([ ... ]);` block from a
 * generator-produced (or previously built) index.ts, returning the raw text
 * of the entries (without the wrapping `new Map([` / `]);`).
 *
 * The generator always emits the map declaration on its own line and closes
 * it with a bare `]);` line — this has held across the pinned generator
 * version and the current committed file. If that ever stops being true,
 * fail loudly rather than guess where the map ends.
 */
export function extractToolMapEntries(source: string): string {
  const lines = source.split('\n');
  const startIdx = lines.findIndex((l) => l.trim() === MAP_DECL);
  if (startIdx === -1) {
    throw new Error(
      `Could not find toolDefinitionMap declaration ("${MAP_DECL}") in generator output. ` +
        'The generator output shape may have changed; refusing to guess.',
    );
  }
  const closeIdx = lines.findIndex((l, i) => i > startIdx && l.trim() === MAP_CLOSE);
  if (closeIdx === -1) {
    throw new Error(
      `Could not find closing "${MAP_CLOSE}" for toolDefinitionMap after line ${startIdx + 1}. ` +
        'The generator output shape may have changed; refusing to guess.',
    );
  }
  return lines.slice(startIdx + 1, closeIdx).join('\n');
}

/**
 * Tool entries look like:  ["ToolName", { name: "ToolName", ... }],
 * The map key and the `name` field are always identical in generator output.
 */
export function extractToolNames(entriesText: string): string[] {
  const names: string[] = [];
  const re = /^\s*\["([A-Za-z0-9_]+)",\s*\{/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(entriesText)) !== null) {
    names.push(m[1]);
  }
  return names;
}

/**
 * Deterministic shortening rule for names over MAX_TOOL_NAME_LENGTH: drop the
 * literal "V1" segment that immediately follows the HTTP-verb prefix. Every
 * operation lives under /v1, so "V1" carries no disambiguating signal — it's
 * the cheapest, most mechanical thing to remove.
 *
 * Returns null if the name is already short enough or the rule can't apply
 * (no verb+V1 prefix found), so the caller can fail loudly instead of
 * emitting a name that's still too long.
 */
export function shortenToolName(name: string): string | null {
  if (name.length <= MAX_TOOL_NAME_LENGTH) return null;
  const shortened = name.replace(/^(Get|Post|Put|Patch|Delete)V1/, '$1');
  if (shortened === name || shortened.length > MAX_TOOL_NAME_LENGTH) return null;
  return shortened;
}

export interface RenameResult {
  text: string;
  renames: { from: string; to: string }[];
}

/**
 * Applies shortenToolName to every over-length name found in entriesText,
 * rewriting both the map-key string literal and the `name:` field literal.
 * Throws (fail loudly) if a name can't be shortened under the limit, or if
 * shortening produces a collision with another tool name.
 */
export function renameOverLongTools(entriesText: string): RenameResult {
  const names = extractToolNames(entriesText);
  const nameSet = new Set(names);
  const renames: { from: string; to: string }[] = [];
  let text = entriesText;

  for (const name of names) {
    if (name.length <= MAX_TOOL_NAME_LENGTH) continue;
    const shortened = shortenToolName(name);
    if (!shortened) {
      throw new Error(
        `Tool name "${name}" (${name.length} chars) exceeds the ${MAX_TOOL_NAME_LENGTH}-char ` +
          'limit and the deterministic V1-drop rule could not shorten it enough. ' +
          'This needs a source spec change (shorter operationId/path), not a generator workaround.',
      );
    }
    if (nameSet.has(shortened)) {
      throw new Error(
        `Shortening "${name}" to "${shortened}" collides with an existing tool name. Refusing to guess.`,
      );
    }
    // Both occurrences (map key and `name:` field) are the exact same string literal.
    const from = `"${name}"`;
    const to = `"${shortened}"`;
    text = text.split(from).join(to);
    nameSet.delete(name);
    nameSet.add(shortened);
    renames.push({ from: name, to: shortened });
  }

  return { text, renames };
}

/**
 * Fails loudly if any tool name in entriesText is still over the limit
 * (used as a final gate after renaming, and standalone by the CI check).
 */
export function assertToolNamesWithinLimit(names: string[]): void {
  const offenders = names.filter((n) => n.length > MAX_TOOL_NAME_LENGTH);
  if (offenders.length > 0) {
    throw new Error(
      `${offenders.length} tool name(s) exceed ${MAX_TOOL_NAME_LENGTH} chars: ` +
        offenders.map((n) => `${n} (${n.length})`).join(', '),
    );
  }
}

export type VersionBump = 'major' | 'minor' | 'patch';

/**
 * minor if the set of tool names changed (added or removed), patch otherwise.
 * Never major — major bumps for this package are a deliberate human decision.
 */
export function decideVersionBump(oldNames: string[], newNames: string[]): VersionBump {
  const oldSet = new Set(oldNames);
  const newSet = new Set(newNames);
  const added = newNames.some((n) => !oldSet.has(n));
  const removed = oldNames.some((n) => !newSet.has(n));
  return added || removed ? 'minor' : 'patch';
}

export function bumpSemver(version: string, bump: VersionBump): string {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!m) throw new Error(`Version "${version}" is not plain semver (major.minor.patch).`);
  let [major, minor, patch] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (bump === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (bump === 'minor') {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }
  return `${major}.${minor}.${patch}`;
}
