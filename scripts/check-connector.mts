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
import { evaluateConnector, parseResourceMetadataUrl } from './lib/connector-check.mts';

const CLAUDE_AI_CLIENT = 'https://claude.ai/oauth/mcp-oauth-client-metadata';
const CLAUDE_AI_CALLBACK = 'https://claude.ai/api/mcp/auth_callback';
const CLAUDE_CODE_CLIENT = 'https://claude.ai/oauth/claude-code-client-metadata';
const CLAUDE_CODE_CALLBACK = 'http://localhost:3118/callback';

const serverUrl = process.argv[2] ?? 'https://mcp.blindpay.com/mcp/readonly';
const timings: number[] = [];

async function timed(url: string, init?: RequestInit): Promise<Response> {
  const started = performance.now();
  const response = await fetch(url, init);
  timings.push(performance.now() - started);
  return response;
}

async function json(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

async function fetchAuthServerMetadata(issuer: string): Promise<unknown> {
  const oauth = await timed(`${issuer}/.well-known/oauth-authorization-server`);
  if (oauth.ok) return json(oauth);
  return json(await timed(`${issuer}/.well-known/openid-configuration`));
}

async function finalAuthorizeStatus(authorizeUrl: string, clientId: string, redirectUri: string): Promise<number> {
  const verifier = randomBytes(32).toString('base64url');
  const url = new URL(authorizeUrl);
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge: createHash('sha256').update(verifier).digest('base64url'),
    code_challenge_method: 'S256',
    state: randomBytes(8).toString('hex'),
    resource: serverUrl,
  }).toString();
  return (await fetch(url, { redirect: 'follow' })).status;
}

async function observe() {
  const challenge = await timed(serverUrl, {
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
  const resourceMetadata = metadataUrl === null ? null : await json(await timed(metadataUrl));
  const issuer = (resourceMetadata as { authorization_servers?: string[] } | null)?.authorization_servers?.[0];
  if (issuer === undefined) {
    return { serverUrl, wwwAuthenticate, challengeStatus: challenge.status, resourceMetadata, authServerMetadata: null };
  }
  const authServerMetadata = (await fetchAuthServerMetadata(issuer)) as { token_endpoint?: string; authorization_endpoint?: string } | null;
  return { serverUrl, wwwAuthenticate, challengeStatus: challenge.status, resourceMetadata, authServerMetadata };
}

const seen = await observe().catch((err: Error) => {
  console.error(`Couldn't reach ${serverUrl}: ${(err.cause as Error | undefined)?.message ?? err.message}`);
  process.exit(1);
});
const endpoints = seen.authServerMetadata ?? {};
if (!endpoints.token_endpoint || !endpoints.authorization_endpoint) {
  console.error(`Couldn't reach authorization server metadata for ${serverUrl}; stopping before the token and authorize checks.`);
  console.error(JSON.stringify({ status: seen.challengeStatus, wwwAuthenticate: seen.wwwAuthenticate, resourceMetadata: seen.resourceMetadata }, null, 2));
  process.exit(1);
}

const refresh = await fetch(endpoints.token_endpoint, {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: 'check-connector-invalid', client_id: CLAUDE_AI_CLIENT }),
});

const problems = evaluateConnector({
  serverUrl,
  challenge: { status: seen.challengeStatus, wwwAuthenticate: seen.wwwAuthenticate },
  resourceMetadata: seen.resourceMetadata,
  authServerMetadata: seen.authServerMetadata,
  slowestDiscoveryMs: Math.round(Math.max(...timings)),
  bogusRefresh: { status: refresh.status, error: ((await json(refresh)) as { error?: unknown } | null)?.error },
  authorize: {
    claudeAi: await finalAuthorizeStatus(endpoints.authorization_endpoint, CLAUDE_AI_CLIENT, CLAUDE_AI_CALLBACK),
    claudeCode: await finalAuthorizeStatus(endpoints.authorization_endpoint, CLAUDE_CODE_CLIENT, CLAUDE_CODE_CALLBACK),
    mismatchedRedirect: await finalAuthorizeStatus(endpoints.authorization_endpoint, CLAUDE_CODE_CLIENT, CLAUDE_AI_CALLBACK),
  },
});

if (problems.length > 0) {
  console.error(`${serverUrl} would fail Claude's sign-in:`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(`OK: Claude can sign in to ${serverUrl} (slowest discovery request ${Math.round(Math.max(...timings))} ms).`);
