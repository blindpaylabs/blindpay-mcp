/**
 * Pure rules for the remote MCP connector the Claude directory lists
 * (https://mcp.blindpay.com/mcp/readonly). They encode the parts of Claude's
 * OAuth client that are stricter than the MCP spec: see
 * https://claude.com/docs/connectors/building/authentication. No I/O here;
 * scripts/check-connector.mts makes the requests and passes what it saw.
 */

import { asObject, asStrings } from './json.mts';

export const REQUEST_TIMEOUT_MS = 10_000;

/** Where an /authorize request ended up once its redirects were followed. */
export type AuthorizeOutcome = 'sign-in' | 'refused' | 'sent-to-redirect';

export interface AuthorizeHop {
  url: string;
  status: number;
}

export interface AuthorizeObservations {
  claudeAi: AuthorizeOutcome;
  /** One outcome per loopback form and port probed. */
  claudeCode: AuthorizeOutcome[];
  /**
   * VS Code's client metadata document, one outcome per redirect it declares.
   * Not a Claude requirement: VS Code is the client the GitHub MCP Registry
   * gallery installs into, and it signs in with CIMD too.
   */
  vscode: AuthorizeOutcome[];
  /** One outcome per redirect the client never declared; each must be refused. */
  undeclaredRedirects: AuthorizeOutcome[];
}

export interface ConnectorObservations {
  serverUrl: string;
  /** The response to an unauthenticated MCP initialize request. */
  challenge: { status: number; wwwAuthenticate: string | null };
  resourceMetadata: unknown;
  authServerMetadata: unknown;
  /** Slowest of the discovery and token requests Claude makes. */
  slowestRequestMs: number;
  /** The token endpoint's answer to a form-encoded refresh with a made-up token; null when discovery failed first. */
  bogusRefresh: { status: number; error: unknown } | null;
  /** null when discovery failed before /authorize could be found. */
  authorize: AuthorizeObservations | null;
}

export function parseResourceMetadataUrl(wwwAuthenticate: string | null): string | null {
  const match = wwwAuthenticate?.match(/resource_metadata="([^"]+)"/);
  return match ? match[1] : null;
}

// A 200 alone doesn't prove the sign-in page rendered: an authorization
// server can serve its error page with 200, or bounce the browser to the
// redirect URI with ?error=. Only a clean 2xx that never did either counts.
export function classifyAuthorizeChain(hops: AuthorizeHop[], redirectUri: string): AuthorizeOutcome {
  if (hops.some((hop) => hop.url.startsWith(redirectUri))) return 'sent-to-redirect';
  const last = hops[hops.length - 1];
  const sawError = hops.some((hop) => new URL(hop.url).searchParams.has('error'));
  if (last === undefined || sawError || last.status < 200 || last.status >= 300) return 'refused';
  return 'sign-in';
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
  const acceptsClientMetadataDocuments =
    metadata.client_id_metadata_document_supported === true && asStrings(metadata.token_endpoint_auth_methods_supported).includes('none');
  if (!acceptsClientMetadataDocuments && typeof metadata.registration_endpoint !== 'string') {
    problems.push('Claude has no way to register: advertise CIMD with "none" in token_endpoint_auth_methods_supported, or expose a registration_endpoint.');
  }
  return problems;
}

function checkLatency({ slowestRequestMs }: ConnectorObservations): string[] {
  if (slowestRequestMs < REQUEST_TIMEOUT_MS) return [];
  return [`The slowest discovery or token request took ${slowestRequestMs} ms; Claude gives up after ${REQUEST_TIMEOUT_MS / 1000} s.`];
}

// The token and authorize rules can only run once discovery yields both
// endpoints. Say so instead of passing, or a broken discovery chain would
// print OK without ever trying to sign in.
function checkSignInWasChecked({ bogusRefresh, authorize }: ConnectorObservations): string[] {
  if (bogusRefresh !== null && authorize !== null) return [];
  return ['Sign-in was not checked: the authorization server metadata names no authorization_endpoint or token_endpoint.'];
}

function checkTokenEndpoint({ bogusRefresh }: ConnectorObservations): string[] {
  if (bogusRefresh === null || (bogusRefresh.status === 400 && bogusRefresh.error === 'invalid_grant')) return [];
  return [
    `A form-encoded refresh with an invalid token got ${bogusRefresh.status} ${JSON.stringify(bogusRefresh.error)}; ` +
      'Claude needs 400 invalid_grant to know the user must sign in again.',
  ];
}

function checkAuthorize({ authorize }: ConnectorObservations): string[] {
  if (authorize === null) return [];
  const problems: string[] = [];
  if (authorize.claudeAi !== 'sign-in') {
    problems.push(`Sign-in from claude.ai ended as "${authorize.claudeAi}"; accept its client metadata document and https://claude.ai/api/mcp/auth_callback.`);
  }
  const claudeCodeMisses = authorize.claudeCode.filter((outcome) => outcome !== 'sign-in');
  if (claudeCodeMisses.length > 0) {
    problems.push(`Sign-in from Claude Code failed for ${claudeCodeMisses.length} of ${authorize.claudeCode.length} loopback redirects; match localhost and 127.0.0.1 with any port.`);
  }
  const vscodeMisses = authorize.vscode.filter((outcome) => outcome !== 'sign-in');
  if (vscodeMisses.length > 0) {
    problems.push(`Sign-in from VS Code failed for ${vscodeMisses.length} of ${authorize.vscode.length} redirects; accept its client metadata document and the redirects it declares.`);
  }
  const accepted = authorize.undeclaredRedirects.filter((outcome) => outcome !== 'refused');
  if (accepted.length > 0) {
    problems.push(`The authorization server let ${accepted.length} undeclared redirect(s) through (${accepted.join(', ')}); it must check redirect_uri against the client metadata.`);
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
    ...checkSignInWasChecked(observations),
    ...checkTokenEndpoint(observations),
    ...checkAuthorize(observations),
  ];
}
