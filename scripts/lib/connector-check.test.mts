import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateConnector, parseResourceMetadataUrl, type ConnectorObservations } from './connector-check.mts';

const SERVER = 'https://mcp.blindpay.com/mcp/readonly';
const ISSUER = 'https://clerk.blindpay.com';

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
    slowestDiscoveryMs: 950,
    bogusRefresh: { status: 400, error: 'invalid_grant' },
    authorize: { claudeAi: 200, claudeCode: 200, mismatchedRedirect: 400 },
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

test('discovery must answer well inside the 10 second limit', () => {
  assert.equal(problemsMatching({ ...validObservations(), slowestDiscoveryMs: 9500 }, /10 s|second/).length, 1);
});

test('an invalid refresh token must get invalid_grant from a form-encoded token request', () => {
  const o = validObservations();
  assert.equal(problemsMatching({ ...o, bogusRefresh: { status: 415, error: undefined } }, /invalid_grant/).length, 1);
  assert.equal(problemsMatching({ ...o, bogusRefresh: { status: 400, error: 'invalid_request' } }, /invalid_grant/).length, 1);
});

test('sign-in must start for claude.ai and Claude Code, and refuse a redirect the client never declared', () => {
  const o = validObservations();
  assert.equal(problemsMatching({ ...o, authorize: { ...o.authorize, claudeAi: 400 } }, /claude\.ai/).length, 1);
  assert.equal(problemsMatching({ ...o, authorize: { ...o.authorize, claudeCode: 400 } }, /Claude Code/).length, 1);
  assert.equal(problemsMatching({ ...o, authorize: { ...o.authorize, mismatchedRedirect: 200 } }, /redirect/).length, 1);
});
