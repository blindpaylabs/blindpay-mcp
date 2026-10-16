#!/usr/bin/env node
/**
 * Live check: walks the sign-in path Claude takes against the deployed
 * connector (https://mcp.blindpay.com/mcp/readonly by default) and fails on
 * anything Claude's OAuth client would reject. It stops at the BlindPay
 * sign-in page, so it creates no grants, tokens or clients. Not in ci.yml:
 * it depends on production being up; run it before a directory submission
 * and after auth changes.
 */
import { createHash, randomBytes } from 'node:crypto';
import {
  REQUEST_TIMEOUT_MS,
  classifyAuthorizeChain,
  evaluateConnector,
  parseResourceMetadataUrl,
  type AuthorizeHop,
  type AuthorizeObservations,
  type AuthorizeOutcome,
} from './lib/connector-check.mts';

interface OAuthClient {
  clientId: string;
  redirectUri: string;
}

const CLAUDE_AI = 'https://claude.ai/oauth/mcp-oauth-client-metadata';
const CLAUDE_AI_CALLBACK = 'https://claude.ai/api/mcp/auth_callback';
const CLAUDE_CODE = 'https://claude.ai/oauth/claude-code-client-metadata';

const CLAUDE_AI_SIGN_IN: OAuthClient = { clientId: CLAUDE_AI, redirectUri: CLAUDE_AI_CALLBACK };
// Claude Code picks a fresh port per session, so probe both loopback hosts it
// declares on ports that differ from each other.
const CLAUDE_CODE_SIGN_INS: OAuthClient[] = [
  { clientId: CLAUDE_CODE, redirectUri: 'http://localhost:3118/callback' },
  { clientId: CLAUDE_CODE, redirectUri: 'http://127.0.0.1:49152/callback' },
  { clientId: CLAUDE_CODE, redirectUri: 'http://localhost:61000/callback' },
];
// Each pairs a client with a redirect its metadata document doesn't list.
const UNDECLARED_REDIRECTS: OAuthClient[] = [
  { clientId: CLAUDE_CODE, redirectUri: CLAUDE_AI_CALLBACK },
  { clientId: CLAUDE_AI, redirectUri: 'http://localhost:3118/callback' },
  { clientId: CLAUDE_AI, redirectUri: 'https://attacker.example/callback' },
];
const MAX_REDIRECTS = 8;

interface AuthServerEndpoints {
  authorization_endpoint: string;
  token_endpoint: string;
}

const timings: number[] = [];

// One retry on a network-level failure only: Node's fetch occasionally reuses
// a keep-alive socket the server already closed and fails with a bare "fetch
// failed". HTTP responses, including errors, and timeouts are never retried,
// so a real problem still reaches the rules.
function request(url: string | URL, init: RequestInit = {}): Promise<Response> {
  const attempt = () => fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  return attempt().catch((err: Error) => (err.name === 'TimeoutError' ? Promise.reject(err) : attempt()));
}

// Timed requests are the ones Claude's 10 s limit applies to: discovery and token.
async function timedRequest(url: string, init?: RequestInit): Promise<Response> {
  const started = performance.now();
  try {
    return await request(url, init);
  } finally {
    timings.push(performance.now() - started);
  }
}

async function jsonOrNull(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

async function fetchAuthServerMetadata(issuer: string): Promise<unknown> {
  const oauth = await timedRequest(`${issuer}/.well-known/oauth-authorization-server`);
  if (oauth.ok) return jsonOrNull(oauth);
  return jsonOrNull(await timedRequest(`${issuer}/.well-known/openid-configuration`));
}

function endpointsOf(metadata: unknown): AuthServerEndpoints | null {
  const { authorization_endpoint, token_endpoint } = (metadata ?? {}) as Partial<AuthServerEndpoints>;
  if (typeof authorization_endpoint !== 'string' || typeof token_endpoint !== 'string') return null;
  return { authorization_endpoint, token_endpoint };
}

function authorizeUrl(endpoint: string, client: OAuthClient, resource: string): URL {
  const verifier = randomBytes(32).toString('base64url');
  const url = new URL(endpoint);
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: client.clientId,
    redirect_uri: client.redirectUri,
    code_challenge: createHash('sha256').update(verifier).digest('base64url'),
    code_challenge_method: 'S256',
    state: randomBytes(8).toString('hex'),
    resource,
  }).toString();
  return url;
}

// Follows redirects one hop at a time and stops before requesting the
// client's redirect URI, so a misbehaving server can't make this script
// deliver anything to claude.ai or a loopback port.
async function walkAuthorize(start: URL, redirectUri: string): Promise<AuthorizeHop[]> {
  const hops: AuthorizeHop[] = [];
  let next: URL | null = start;
  while (next !== null && hops.length < MAX_REDIRECTS) {
    if (next.href.startsWith(redirectUri)) {
      hops.push({ url: next.href, status: 0 });
      break;
    }
    const response = await request(next, { redirect: 'manual' });
    hops.push({ url: next.href, status: response.status });
    const location = response.headers.get('location');
    next = response.status >= 300 && response.status < 400 && location !== null ? new URL(location, next) : null;
  }
  return hops;
}

async function authorizeOutcome(endpoint: string, client: OAuthClient, resource: string): Promise<AuthorizeOutcome> {
  return classifyAuthorizeChain(await walkAuthorize(authorizeUrl(endpoint, client, resource), client.redirectUri), client.redirectUri);
}

async function observeAuthorize(endpoint: string, resource: string): Promise<AuthorizeObservations> {
  // One at a time: a burst of parallel /authorize chains can trip the
  // authorization server's rate limiting and fail the check for no real reason.
  const outcomes = async (clients: OAuthClient[]) => {
    const results: AuthorizeOutcome[] = [];
    for (const client of clients) results.push(await authorizeOutcome(endpoint, client, resource));
    return results;
  };
  return {
    claudeAi: await authorizeOutcome(endpoint, CLAUDE_AI_SIGN_IN, resource),
    claudeCode: await outcomes(CLAUDE_CODE_SIGN_INS),
    undeclaredRedirects: await outcomes(UNDECLARED_REDIRECTS),
  };
}

async function observeBogusRefresh(tokenEndpoint: string): Promise<{ status: number; error: unknown }> {
  const response = await timedRequest(tokenEndpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: 'check-connector-invalid', client_id: CLAUDE_AI }),
  });
  return { status: response.status, error: ((await jsonOrNull(response)) as { error?: unknown } | null)?.error };
}

async function observe(serverUrl: string) {
  const challenge = await timedRequest(serverUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'check-connector', version: '0' } },
    }),
  });
  const wwwAuthenticate = challenge.headers.get('www-authenticate');
  const metadataUrl = parseResourceMetadataUrl(wwwAuthenticate);
  const resourceMetadata = metadataUrl === null ? null : await jsonOrNull(await timedRequest(metadataUrl));
  const issuer = (resourceMetadata as { authorization_servers?: unknown[] } | null)?.authorization_servers?.[0];
  const authServerMetadata = typeof issuer === 'string' ? await fetchAuthServerMetadata(issuer) : null;
  const endpoints = endpointsOf(authServerMetadata);

  return {
    serverUrl,
    challenge: { status: challenge.status, wwwAuthenticate },
    resourceMetadata,
    authServerMetadata,
    bogusRefresh: endpoints === null ? null : await observeBogusRefresh(endpoints.token_endpoint),
    authorize: endpoints === null ? null : await observeAuthorize(endpoints.authorization_endpoint, serverUrl),
    slowestRequestMs: Math.round(Math.max(0, ...timings)),
  };
}

function parseServerUrl(arg: string | undefined): string {
  const value = arg ?? 'https://mcp.blindpay.com/mcp/readonly';
  if (!URL.canParse(value) || new URL(value).protocol !== 'https:') {
    console.error(`Expected an https:// MCP server URL, got "${value}".`);
    process.exit(1);
  }
  return value;
}

async function main(): Promise<void> {
  const serverUrl = parseServerUrl(process.argv[2]);
  const observations = await observe(serverUrl);
  const problems = evaluateConnector(observations);

  if (problems.length > 0) {
    console.error(`${serverUrl} would fail Claude's sign-in:`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  console.log(`OK: Claude can sign in to ${serverUrl} (slowest discovery or token request ${observations.slowestRequestMs} ms).`);
}

function describeFailure(err: Error): string {
  if (err.name === 'TimeoutError') return `no answer within ${REQUEST_TIMEOUT_MS / 1000} s`;
  const cause = err.cause as (Error & { code?: string }) | undefined;
  return [err.message, cause?.code, cause?.message].filter(Boolean).join(': ');
}

main().catch((err: Error) => {
  console.error(`Couldn't finish the check: ${describeFailure(err)}`);
  process.exit(1);
});
