/**
 * Pure checks for the Claude directory plugin under plugins/blindpay. They
 * mirror the rules in Anthropic's plugin pre-submission checklist that this
 * repo can break by accident, plus one BlindPay-specific rule: the directory
 * refuses connectors that transfer money, so the plugin may only reach the
 * read-only MCP endpoint. No I/O here so the rules are unit-testable;
 * scripts/check-plugin.mts reads the folder and calls checkPluginReadiness.
 */

export const DIRECTORY_SAFE_MCP_URLS: readonly string[] = ['https://mcp.blindpay.com/mcp/readonly'];

export const LISTING_URL_FIELDS = ['documentationUrl', 'supportUrl', 'privacyPolicyUrl', 'termsOfServiceUrl'] as const;

const MIN_README_WORDS = 40;
const MAX_TEXT_FILE_BYTES = 256 * 1024;
const MAX_ANY_FILE_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 512;
const NAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;
const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']);
const FONT_EXTENSIONS = new Set(['woff', 'woff2', 'ttf', 'otf']);
const UNINSPECTABLE_EXTENSIONS = new Set(['ico', 'pdf', 'zip', 'gz', 'tgz', 'mcpb', 'dxt', 'exe', 'dll', 'so', 'dylib', 'wasm', 'jar']);
const OS_JUNK = new Set(['.DS_Store', 'Thumbs.db', 'desktop.ini']);

export interface PluginFile {
  /** Path relative to the plugin root, with forward slashes. */
  path: string;
  size: number;
}

export interface PluginSnapshot {
  manifest: unknown;
  /** Every tracked .json file, parsed, keyed by its path relative to the plugin root. */
  jsonFiles: Record<string, unknown>;
  readme: string | null;
  files: PluginFile[];
}

interface McpServerSource {
  /** Where the servers were declared, for error messages. */
  origin: string;
  servers: unknown;
}

type Json = Record<string, unknown>;

function asObject(value: unknown): Json {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Json) : {};
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function extensionOf(path: string): string {
  const base = path.split('/').pop() ?? '';
  const dot = base.lastIndexOf('.');
  return dot > 0 ? base.slice(dot + 1).toLowerCase() : '';
}

function isHttpsUrl(value: unknown): boolean {
  if (!nonEmptyString(value)) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function checkManifestBasics(manifest: Json): string[] {
  const problems: string[] = [];
  if (!nonEmptyString(manifest.name) || !NAME_PATTERN.test(manifest.name)) {
    problems.push(`plugin.json "name" must be lowercase letters, digits and hyphens, got ${JSON.stringify(manifest.name)}.`);
  }
  if (!nonEmptyString(manifest.version)) problems.push('plugin.json "version" is missing; raise it with every release.');
  if (!nonEmptyString(manifest.description)) problems.push('plugin.json "description" is missing.');
  if (!nonEmptyString(asObject(manifest.author).name)) problems.push('plugin.json "author.name" is missing.');
  return problems;
}

function checkIcon(manifest: Json, filePaths: Set<string>): string[] {
  const icon = manifest.icon;
  if (!nonEmptyString(icon)) {
    return ['plugin.json "icon" is missing, so the directory listing shows no logo. Point it at an image inside the plugin, such as "./assets/logo.png".'];
  }
  if (!icon.startsWith('./') || icon.split('/').includes('..')) {
    return [`plugin.json "icon" must be a "./" path inside the plugin folder, got "${icon}".`];
  }
  if (!IMAGE_EXTENSIONS.has(extensionOf(icon))) {
    return [`plugin.json "icon" must be a PNG, JPEG, GIF, WebP or SVG image, got "${icon}".`];
  }
  if (!filePaths.has(icon.slice(2))) {
    return [`plugin.json "icon" points at "${icon}", which isn't in the plugin folder.`];
  }
  return [];
}

function checkListingUrls(manifest: Json): string[] {
  return LISTING_URL_FIELDS.filter((field) => !isHttpsUrl(manifest[field])).map(
    (field) => `plugin.json "${field}" must be an https:// URL, got ${JSON.stringify(manifest[field])}.`,
  );
}

function isMcpBundle(path: string): boolean {
  return /\.(mcpb|dxt)$/i.test(path);
}

// Claude Code loads .mcp.json and then whatever plugin.json's mcpServers
// declares (a .json path, an inline map, a bundle, or an array of those), so a
// full-server entry can hide in any of them.
function resolveManifestEntry(entry: unknown, jsonFiles: Record<string, unknown>): McpServerSource | string {
  if (typeof entry !== 'string') return { origin: 'plugin.json mcpServers', servers: entry };
  if (isMcpBundle(entry)) return `plugin.json mcpServers names the MCP bundle "${entry}", which the directory can't inspect; declare servers with "url" instead.`;
  const path = entry.replace(/^\.\//, '');
  if (!(path in jsonFiles)) return `plugin.json mcpServers names "${entry}", which isn't a tracked JSON file in the plugin folder.`;
  return { origin: path, servers: asObject(jsonFiles[path]).mcpServers };
}

function collectMcpSources(manifest: Json, jsonFiles: Record<string, unknown>): { sources: McpServerSource[]; problems: string[] } {
  const declared = manifest.mcpServers === undefined ? [] : [manifest.mcpServers].flat();
  const isRootConfig = (e: unknown) => typeof e === 'string' && e.replace(/^\.\//, '') === '.mcp.json';
  const resolved = declared.filter((e) => !isRootConfig(e)).map((e) => resolveManifestEntry(e, jsonFiles));
  const rootConfig: McpServerSource[] = '.mcp.json' in jsonFiles ? [{ origin: '.mcp.json', servers: asObject(jsonFiles['.mcp.json']).mcpServers }] : [];
  return {
    sources: [...rootConfig, ...resolved.filter((r): r is McpServerSource => typeof r !== 'string')],
    problems: resolved.filter((r): r is string => typeof r === 'string'),
  };
}

function checkServer(name: string, raw: unknown, origin: string): string[] {
  const server = asObject(raw);
  if (server.type !== 'http' || !isHttpsUrl(server.url)) {
    return [`MCP server "${name}" in ${origin} must be a remote "http" server with an https:// URL.`];
  }
  if (!DIRECTORY_SAFE_MCP_URLS.includes(server.url as string)) {
    return [
      `MCP server "${name}" in ${origin} points at ${server.url as string}. The Claude directory refuses connectors that move money, ` +
        `so the plugin may only use ${DIRECTORY_SAFE_MCP_URLS.join(', ')}.`,
    ];
  }
  return [];
}

function checkMcpServers(manifest: Json, jsonFiles: Record<string, unknown>): string[] {
  const { sources, problems } = collectMcpSources(manifest, jsonFiles);
  const servers = sources.flatMap(({ origin, servers }) => Object.entries(asObject(servers)).map(([name, raw]) => ({ name, raw, origin })));
  if (servers.length === 0 && problems.length === 0) {
    return ['The plugin declares no MCP server, so it has nothing to connect to.'];
  }
  return [...problems, ...servers.flatMap(({ name, raw, origin }) => checkServer(name, raw, origin))];
}

function countReadmeWords(readme: string): number {
  const withoutCode = readme.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`\n]*`/g, ' ');
  return withoutCode.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
}

function checkReadmeAndLicense(snapshot: PluginSnapshot, manifest: Json, filePaths: Set<string>): string[] {
  const problems: string[] = [];
  const words = snapshot.readme === null ? 0 : countReadmeWords(snapshot.readme);
  if (words < MIN_README_WORDS) {
    problems.push(`README.md has ${words} words outside code blocks; the directory needs at least ${MIN_README_WORDS}.`);
  }
  if (!filePaths.has('LICENSE') && !nonEmptyString(manifest.license)) {
    problems.push('Add a LICENSE file or set "license" in plugin.json.');
  }
  return problems;
}

function checkFile(file: PluginFile): string[] {
  const name = file.path.split('/').pop() ?? '';
  const ext = extensionOf(file.path);
  if (OS_JUNK.has(name) || file.path.split('/').includes('__MACOSX')) {
    return [`Remove ${file.path}: OS system files block a directory submission.`];
  }
  if (file.path.startsWith('bin/')) {
    return [`Move ${file.path} out of the top-level bin/ directory: claude.ai rejects plugins that have one.`];
  }
  if (UNINSPECTABLE_EXTENSIONS.has(ext)) {
    return [`${file.path} is a binary format the directory scanner can't inspect; ship text, images or fonts only.`];
  }
  const isMedia = IMAGE_EXTENSIONS.has(ext) || FONT_EXTENSIONS.has(ext);
  const limit = isMedia ? MAX_ANY_FILE_BYTES : MAX_TEXT_FILE_BYTES;
  if (file.size > limit) {
    return [`${file.path} is ${file.size} bytes; keep ${isMedia ? 'images and fonts under 5 MiB' : 'text files under 256 KiB'}.`];
  }
  return [];
}

function checkFiles(files: PluginFile[]): string[] {
  const problems = files.flatMap(checkFile);
  if (files.length > MAX_FILES) problems.push(`The plugin has ${files.length} files; keep it to ${MAX_FILES} or fewer.`);
  return problems;
}

/** Returns one human-readable problem per broken rule; an empty list means ready to submit. */
export function checkPluginReadiness(snapshot: PluginSnapshot): string[] {
  const manifest = asObject(snapshot.manifest);
  const filePaths = new Set(snapshot.files.map((f) => f.path));
  return [
    ...checkManifestBasics(manifest),
    ...checkIcon(manifest, filePaths),
    ...checkListingUrls(manifest),
    ...checkMcpServers(manifest, snapshot.jsonFiles),
    ...checkReadmeAndLicense(snapshot, manifest, filePaths),
    ...checkFiles(snapshot.files),
  ];
}
