/**
 * Pure rules for the ChatGPT/Codex plugin package in plugins/openai: the
 * limits OpenAI's submission portal enforces
 * (https://developers.openai.com/plugins/deploy/submission) and the policy
 * that keeps the money-moving server out of the directory. No I/O here;
 * scripts/check-openai-plugin.mts reads the package and passes it in.
 */

import { asObject, asStrings, type Json } from './json.mts';
import { DIRECTORY_SAFE_MCP_URLS } from './plugin-check.mts';

/** The shape the tests build; the rules still read every field defensively. */
export interface OpenAiManifest {
  [key: string]: unknown;
  extensions: { 'com.openai': { [key: string]: unknown; interface: Json } };
}

export interface OpenAiPluginSnapshot {
  manifest: OpenAiManifest;
  /** Parsed mcp.json. */
  mcp: unknown;
  /** Package-relative paths of every file that would go into the ZIP. */
  filePaths: string[];
}

const TEXT_LIMITS: Record<string, number> = { displayName: 30, shortDescription: 30, longDescription: 4000, developerName: 80 };
const LISTING_URLS = ['websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL'];
const ICONS = ['logo', 'composerIcon'];
const MAX_DEFAULT_PROMPTS = 3;
const MAX_PROMPT_LENGTH = 128;
// The scopes Clerk lets ChatGPT's client (https://chatgpt.com/oauth/client.json)
// request. It answers invalid_scope to public_metadata and private_metadata,
// which Clerk also advertises, so the plugin pins ChatGPT to these.
const CHATGPT_SCOPES = ['openid', 'profile', 'email', 'offline_access'];
const POSITIVE_CASES = 5;
const NEGATIVE_CASES = 3;

function filled(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

// Clerk has no dynamic client registration, so ChatGPT has to identify itself
// with its client metadata document, and it must not fall back to asking for
// every scope Clerk advertises.
function checkAuth(name: string, server: Json): string[] {
  const auth = asObject(asObject(asObject(server.extensions)['com.openai']).auth);
  if (auth.type !== 'oauth') {
    return [`MCP server "${name}" must declare extensions["com.openai"].auth with type "oauth"; BlindPay signs users in with OAuth.`];
  }
  const problems: string[] = [];
  if (asObject(auth.client).mode !== 'cimd') {
    problems.push(`MCP server "${name}" must set auth.client.mode to "cimd": Clerk accepts client metadata documents and has no dynamic registration.`);
  }
  const scopes = asStrings(auth.defaultScopes);
  const refused = scopes.filter((scope) => !CHATGPT_SCOPES.includes(scope));
  if (scopes.length === 0) {
    problems.push(`MCP server "${name}" must pin auth.defaultScopes to ${CHATGPT_SCOPES.join(', ')}, or ChatGPT asks for every scope Clerk advertises.`);
  } else if (refused.length > 0) {
    problems.push(`MCP server "${name}" asks for ${refused.join(', ')} in auth.defaultScopes; Clerk refuses those for ChatGPT's client with invalid_scope.`);
  }
  return problems;
}

function checkServers(mcp: unknown): string[] {
  const servers = Object.entries(asObject(asObject(mcp).mcpServers));
  if (servers.length === 0) return ['mcp.json declares no MCP server, so the plugin has nothing to connect to.'];
  return servers.flatMap(([name, raw]) => {
    const server = asObject(raw);
    if (server.type !== 'streamable-http') return [`MCP server "${name}" must have type "streamable-http"; OpenAI requires a remote HTTPS endpoint.`];
    if (!DIRECTORY_SAFE_MCP_URLS.includes(server.url as string)) {
      return [
        `MCP server "${name}" points at ${String(server.url)}. OpenAI prohibits plugins that execute money or crypto transfers, ` +
          `so the plugin may only use ${DIRECTORY_SAFE_MCP_URLS.join(', ')}.`,
      ];
    }
    return checkAuth(name, server);
  });
}

function checkListing(listing: Json, filePaths: Set<string>): string[] {
  const problems: string[] = [];
  for (const [field, limit] of Object.entries(TEXT_LIMITS)) {
    const value = listing[field];
    if (!filled(value)) problems.push(`interface.${field} is required.`);
    else if (value.length > limit) problems.push(`interface.${field} is ${value.length} characters; OpenAI allows ${limit}.`);
  }
  if (!filled(listing.category)) problems.push('interface.category is required.');
  for (const field of LISTING_URLS) {
    const value = listing[field];
    if (!filled(value) || !value.startsWith('https://')) problems.push(`interface.${field} must be an https:// URL.`);
  }
  const prompts = Array.isArray(listing.defaultPrompt) ? listing.defaultPrompt : [listing.defaultPrompt].filter((p) => p !== undefined);
  if (prompts.length > MAX_DEFAULT_PROMPTS || prompts.some((p) => !filled(p) || p.length > MAX_PROMPT_LENGTH)) {
    problems.push(`interface.defaultPrompt allows at most ${MAX_DEFAULT_PROMPTS} prompts of up to ${MAX_PROMPT_LENGTH} characters each.`);
  }
  for (const field of ICONS) {
    const value = listing[field];
    if (!filled(value) || !value.startsWith('./') || !filePaths.has(value.slice(2))) {
      problems.push(`interface.${field} must be a ./ path to an image inside the package; got ${JSON.stringify(value)}.`);
    }
  }
  return problems;
}

function checkTestCases(review: Json): string[] {
  const cases = asObject(review.test_cases);
  const positive = Array.isArray(cases.positive) ? cases.positive : [];
  const negative = Array.isArray(cases.negative) ? cases.negative : [];
  const problems: string[] = [];
  if (positive.length !== POSITIVE_CASES) problems.push(`review.test_cases needs exactly ${POSITIVE_CASES} positive cases; found ${positive.length}.`);
  if (negative.length !== NEGATIVE_CASES) problems.push(`review.test_cases needs exactly ${NEGATIVE_CASES} negative cases; found ${negative.length}.`);
  positive.forEach((raw, i) => {
    const c = asObject(raw);
    const hasTools = Array.isArray(c.tools_triggered) ? c.tools_triggered.length > 0 : filled(c.tools_triggered);
    if (!filled(c.description) || !filled(c.prompt) || !hasTools || !filled(c.expected_behavior)) {
      problems.push(`review positive case ${i + 1} needs description, prompt, tools_triggered and expected_behavior.`);
    }
  });
  negative.forEach((raw, i) => {
    const c = asObject(raw);
    if (!filled(c.description) || !filled(c.prompt)) problems.push(`review negative case ${i + 1} needs description and prompt.`);
  });
  return problems;
}

/** Returns one human-readable problem per broken rule; an empty list means the package is ready to upload. */
export function checkOpenAiPlugin({ manifest, mcp, filePaths }: OpenAiPluginSnapshot): string[] {
  const root = asObject(manifest);
  const openai = asObject(asObject(root.extensions)['com.openai']);
  const problems: string[] = [];
  if (!filled(root.name)) problems.push('plugin.json needs a name.');
  if (!filled(root.version)) problems.push('plugin.json needs an explicit version; raise it on every resubmission.');
  return [
    ...problems,
    ...checkServers(mcp),
    ...checkListing(asObject(openai.interface), new Set(filePaths)),
    ...checkTestCases(asObject(openai.review)),
  ];
}
