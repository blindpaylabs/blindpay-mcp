/**
 * Pure rules for the remote MCP connector the Claude directory lists
 * (https://mcp.blindpay.com/mcp/readonly). They encode the parts of Claude's
 * OAuth client that are stricter than the MCP spec: see
 * https://claude.com/docs/connectors/building/authentication. No I/O here;
 * scripts/check-connector.mts makes the requests and passes what it saw.
 */

export const DISCOVERY_TIMEOUT_MS = 10_000;
// Leave headroom under Claude's hard limit, so a slow day doesn't fail sign-in.
const DISCOVERY_BUDGET_MS = DISCOVERY_TIMEOUT_MS / 2;

export interface ConnectorObservations {
  serverUrl: string;
  /** The response to an unauthenticated MCP initialize request. */
  challenge: { status: number; wwwAuthenticate: string | null };
  resourceMetadata: unknown;
  authServerMetadata: unknown;
  slowestDiscoveryMs: number;
  /** The token endpoint's answer to a form-encoded refresh with a made-up token. */
  bogusRefresh: { status: number; error: unknown };
  /** Final HTTP status after following /authorize redirects for each client. */
  authorize: { claudeAi: number; claudeCode: number; mismatchedRedirect: number };
}

type Json = Record<string, unknown>;

function asObject(value: unknown): Json {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Json) : {};
}

function asStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function isSuccess(status: number): boolean {
  return status >= 200 && status < 300;
}

export function parseResourceMetadataUrl(wwwAuthenticate: string | null): string | null {
  const match = wwwAuthenticate?.match(/resource_metadata="([^"]+)"/);
  return match ? match[1] : null;
}

function checkChallenge({ challenge }: ConnectorObservations): string[] {
  if (challenge.status !== 401) {
    return [`An unauthenticated request got ${challenge.status}; Claude starts sign-in only on a 401.`];
  }
  if (parseResourceMetadataUrl(challenge.wwwAuthenticate) === null) {
    return ['The 401 has no WWW-Authenticate resource_metadata pointer, so Claude can only guess where the metadata lives.'];
  }
  return [];
}

function checkResourceMetadata({ serverUrl, resourceMetadata, authServerMetadata }: ConnectorObservations): string[] {
  const metadata = asObject(resourceMetadata);
  const problems: string[] = [];
  if (metadata.resource !== serverUrl) {
    problems.push(`Protected resource metadata says resource ${JSON.stringify(metadata.resource)}; it must equal ${serverUrl} exactly.`);
  }
  const [first] = asStrings(metadata.authorization_servers);
  if (first === undefined || first !== asObject(authServerMetadata).issuer) {
    problems.push(`authorization_servers must list the issuer first, since Claude uses only the first entry; got ${JSON.stringify(metadata.authorization_servers)}.`);
  }
  return problems;
}

function checkAuthServer({ authServerMetadata }: ConnectorObservations): string[] {
  const metadata = asObject(authServerMetadata);
  const problems: string[] = [];
  if (!asStrings(metadata.code_challenge_methods_supported).includes('S256')) {
    problems.push('The authorization server must advertise S256 in code_challenge_methods_supported.');
  }
  const cimd = metadata.client_id_metadata_document_supported === true && asStrings(metadata.token_endpoint_auth_methods_supported).includes('none');
  if (!cimd && typeof metadata.registration_endpoint !== 'string') {
    problems.push('Claude has no way to register: advertise CIMD with "none" in token_endpoint_auth_methods_supported, or expose a registration_endpoint.');
  }
  return problems;
}

function checkLatency({ slowestDiscoveryMs }: ConnectorObservations): string[] {
  if (slowestDiscoveryMs <= DISCOVERY_BUDGET_MS) return [];
  return [`Slowest discovery request took ${slowestDiscoveryMs} ms; Claude gives up after ${DISCOVERY_TIMEOUT_MS / 1000} s, so keep it under ${DISCOVERY_BUDGET_MS / 1000} s.`];
}

function checkTokenEndpoint({ bogusRefresh }: ConnectorObservations): string[] {
  if (bogusRefresh.status === 400 && bogusRefresh.error === 'invalid_grant') return [];
  return [
    `A form-encoded refresh with an invalid token got ${bogusRefresh.status} ${JSON.stringify(bogusRefresh.error)}; ` +
      'Claude needs 400 invalid_grant to know the user must sign in again.',
  ];
}

function checkAuthorize({ authorize }: ConnectorObservations): string[] {
  const problems: string[] = [];
  if (!isSuccess(authorize.claudeAi)) {
    problems.push(`Sign-in from claude.ai ended with ${authorize.claudeAi}; the authorization server must accept its client metadata document and callback.`);
  }
  if (!isSuccess(authorize.claudeCode)) {
    problems.push(`Sign-in from Claude Code ended with ${authorize.claudeCode}; accept loopback redirects on any port.`);
  }
  if (isSuccess(authorize.mismatchedRedirect)) {
    problems.push('The authorization server accepted a redirect the client never declared; it must check redirect_uri against the client metadata.');
  }
  return problems;
}

/** Returns one human-readable problem per broken rule; an empty list means Claude can sign in. */
export function evaluateConnector(observations: ConnectorObservations): string[] {
  return [
    ...checkChallenge(observations),
    ...checkResourceMetadata(observations),
    ...checkAuthServer(observations),
    ...checkLatency(observations),
    ...checkTokenEndpoint(observations),
    ...checkAuthorize(observations),
  ];
}
