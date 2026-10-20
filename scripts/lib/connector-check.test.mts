import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyAuthorizeChain,
  evaluateConnector,
  parseResourceMetadataUrl,
  type AuthorizeObservations,
  type ConnectorObservations,
} from './connector-check.mts';

const SERVER = 'https://mcp.blindpay.com/mcp/readonly';
const ISSUER = 'https://clerk.blindpay.com';
const CALLBACK = 'https://claude.ai/api/mcp/auth_callback';

const AUTHORIZE: AuthorizeObservations = {
  claudeAi: 'sign-in',
  claudeCode: ['sign-in', 'sign-in', 'sign-in'],
  vscode: ['sign-in', 'sign-in'],
  undeclaredRedirects: ['refused', 'refused', 'refused'],
};

function validObservations(): ConnectorObservations {
  return {
    serverUrl: SERVER,
    challenge: {
      status: 401,
      wwwAuthenticate: `Bearer resource_metadata="https://mcp.blindpay.com/.well-known/oauth-protected-resource/mcp/readonly", scope="profile email offline_access"`,
    },
    resourceMetadata: { resource: SERVER, authorization_servers: [ISSUER] },
    authServerMetadata: {
      issuer: ISSUER,
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['client_secret_basic', 'none'],
      client_id_metadata_document_supported: true,
    },
    slowestRequestMs: 950,
    bogusRefresh: { status: 400, error: 'invalid_grant' },
    authorize: AUTHORIZE,
  };
}

function problemsMatching(o: ConnectorObservations, pattern: RegExp): string[] {
  return evaluateConnector(o).filter((p) => pattern.test(p));
}

test('parseResourceMetadataUrl reads the quoted resource_metadata parameter', () => {
  assert.equal(
    parseResourceMetadataUrl('Bearer error="invalid_token", resource_metadata="https://x.example/.well-known/oauth-protected-resource/mcp", scope="a b"'),
    'https://x.example/.well-known/oauth-protected-resource/mcp',
  );
  assert.equal(parseResourceMetadataUrl('Bearer realm="x"'), null);
  assert.equal(parseResourceMetadataUrl(null), null);
});

test('a chain that ends on a 2xx page with no error is the sign-in page', () => {
  const hops = [
    { url: `${ISSUER}/oauth/authorize?client_id=x`, status: 302 },
    { url: `${ISSUER}/oauth/authorize/continue?client_id=x`, status: 302 },
    { url: 'https://app.blindpay.com/sign-in/?redirect_url=x', status: 200 },
  ];
  assert.equal(classifyAuthorizeChain(hops, CALLBACK), 'sign-in');
});

test('a chain that ends on a 4xx or 5xx is a refusal', () => {
  const hops = [
    { url: `${ISSUER}/oauth/authorize?client_id=x`, status: 302 },
    { url: `${ISSUER}/oauth/authorize/continue?client_id=x`, status: 400 },
  ];
  assert.equal(classifyAuthorizeChain(hops, CALLBACK), 'refused');
});

test('an error page served with 200 is a refusal, not the sign-in page', () => {
  const hops = [
    { url: `${ISSUER}/oauth/authorize?client_id=x`, status: 302 },
    { url: `${ISSUER}/oauth/error?error=invalid_request`, status: 200 },
  ];
  assert.equal(classifyAuthorizeChain(hops, CALLBACK), 'refused');
});

test('a chain that sends the browser to the redirect URI is reported as such', () => {
  const hops = [
    { url: `${ISSUER}/oauth/authorize?client_id=x`, status: 302 },
    { url: `${CALLBACK}?error=invalid_request&state=s`, status: 200 },
  ];
  assert.equal(classifyAuthorizeChain(hops, CALLBACK), 'sent-to-redirect');
});

test('a connector that meets every rule has no problems', () => {
  assert.deepEqual(evaluateConnector(validObservations()), []);
});

test('unauthenticated requests must get a 401, since Claude ignores challenges on a 200', () => {
  const o = validObservations();
  assert.equal(problemsMatching({ ...o, challenge: { ...o.challenge, status: 200 } }, /401/).length, 1);
});

test('the 401 must point at the protected resource metadata', () => {
  const o = validObservations();
  assert.equal(problemsMatching({ ...o, challenge: { status: 401, wwwAuthenticate: 'Bearer' } }, /resource_metadata/).length, 1);
});

test('the metadata resource must equal the server URL exactly, path included', () => {
  const o = validObservations();
  const resourceMetadata = { resource: 'https://mcp.blindpay.com/mcp', authorization_servers: [ISSUER] };
  assert.equal(problemsMatching({ ...o, resourceMetadata }, /resource/).length, 1);
});

test('the first authorization server must be the issuer whose metadata was read', () => {
  const o = validObservations();
  const resourceMetadata = { resource: SERVER, authorization_servers: ['https://other.example', ISSUER] };
  assert.equal(problemsMatching({ ...o, resourceMetadata }, /authorization_servers/).length, 1);
  assert.equal(problemsMatching({ ...o, resourceMetadata: { resource: SERVER } }, /authorization_servers/).length, 1);
});

test('the authorization server must support S256 PKCE', () => {
  const o = validObservations();
  const authServerMetadata = { ...(o.authServerMetadata as object), code_challenge_methods_supported: ['plain'] };
  assert.equal(problemsMatching({ ...o, authServerMetadata }, /S256/).length, 1);
});

test('Claude needs CIMD with public-client auth, or a DCR endpoint, to register itself', () => {
  const o = validObservations();
  const noNone = { ...(o.authServerMetadata as object), token_endpoint_auth_methods_supported: ['client_secret_basic'] };
  assert.equal(problemsMatching({ ...o, authServerMetadata: noNone }, /CIMD|registration/).length, 1);
  const withDcr = { ...noNone, registration_endpoint: `${ISSUER}/oauth/register` };
  assert.deepEqual(evaluateConnector({ ...o, authServerMetadata: withDcr }), []);
});

test("every request must answer inside Claude's 10 second limit", () => {
  assert.deepEqual(evaluateConnector({ ...validObservations(), slowestRequestMs: 9500 }), []);
  assert.equal(problemsMatching({ ...validObservations(), slowestRequestMs: 10_500 }, /10 s/).length, 1);
});

test('an invalid refresh token must get invalid_grant from a form-encoded token request', () => {
  const o = validObservations();
  assert.equal(problemsMatching({ ...o, bogusRefresh: { status: 415, error: undefined } }, /invalid_grant/).length, 1);
  assert.equal(problemsMatching({ ...o, bogusRefresh: { status: 400, error: 'invalid_request' } }, /invalid_grant/).length, 1);
});

test('sign-in must start for claude.ai and for Claude Code on every loopback form', () => {
  const o = validObservations();
  assert.equal(problemsMatching({ ...o, authorize: { ...AUTHORIZE, claudeAi: 'refused' } }, /claude\.ai/).length, 1);
  assert.equal(problemsMatching({ ...o, authorize: { ...AUTHORIZE, claudeCode: ['sign-in', 'refused', 'sign-in'] } }, /Claude Code/).length, 1);
});

test('sign-in must start for VS Code on both its loopback and its web redirect', () => {
  const o = validObservations();
  assert.equal(problemsMatching({ ...o, authorize: { ...AUTHORIZE, vscode: ['sign-in', 'refused'] } }, /VS Code/).length, 1);
  assert.equal(problemsMatching(o, /VS Code/).length, 0);
});

test('every undeclared redirect must be refused, and never followed back to the client', () => {
  const o = validObservations();
  const accepted: AuthorizeObservations = { ...AUTHORIZE, undeclaredRedirects: ['refused', 'sign-in', 'refused'] };
  assert.equal(problemsMatching({ ...o, authorize: accepted }, /redirect/).length, 1);
  const followed: AuthorizeObservations = { ...AUTHORIZE, undeclaredRedirects: ['sent-to-redirect', 'refused', 'refused'] };
  assert.equal(problemsMatching({ ...o, authorize: followed }, /redirect/).length, 1);
});

test('when discovery fails, its problems are reported and the skipped sign-in checks are named, not passed', () => {
  const o = { ...validObservations(), resourceMetadata: null, authServerMetadata: null, bogusRefresh: null, authorize: null };
  const problems = evaluateConnector(o);
  assert.ok(problems.some((p) => /resource/.test(p)));
  assert.ok(!problems.some((p) => /invalid_grant|claude\.ai|Claude Code|VS Code/.test(p)));
  assert.equal(problems.filter((p) => /not checked/.test(p)).length, 1);
});

test('metadata that passes every rule but names no authorize or token endpoint still fails', () => {
  assert.equal(problemsMatching({ ...validObservations(), bogusRefresh: null, authorize: null }, /not checked/).length, 1);
});
