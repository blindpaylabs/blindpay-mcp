/**
 * Wire-level checks of the stdio server against both protocol eras: the
 * 2026-07-28 revision (per-request `_meta`, `server/discover`, `resultType`,
 * cache fields) and the 2025-11-25 `initialize` handshake older clients still
 * open with. Raw JSON-RPC lines, not the SDK client, so the checks don't share
 * the server SDK's reading of the spec. No test reaches the BlindPay API: the
 * only tool calls made fail argument validation first.
 */
import assert from 'node:assert/strict';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { createInterface } from 'node:readline';
import { after, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ENTRY = fileURLToPath(new URL('../src/index.ts', import.meta.url));
const MODERN = '2026-07-28';
const LEGACY = '2025-11-25';
const META = {
  'io.modelcontextprotocol/protocolVersion': MODERN,
  'io.modelcontextprotocol/clientCapabilities': {},
};

type Message = { id?: number; result?: any; error?: { code: number; message: string; data?: any } };

interface Connection {
  request(method: string, params?: Record<string, unknown>): Promise<Message>;
  notify(method: string): void;
  close(): void;
}

const open: ChildProcessWithoutNullStreams[] = [];
after(() => open.forEach((child) => child.kill()));

/**
 * Starts the server from source. Every variable the server reads is set
 * explicitly, so a developer's .env (dotenv never overrides a set variable)
 * can't change what is tested.
 */
function startServer(env: { profile?: 'full' | 'readonly'; instanceId?: string } = {}): ChildProcessWithoutNullStreams {
  const child = spawn(process.execPath, ['--import', 'tsx', ENTRY], {
    env: {
      ...process.env,
      BLINDPAY_MCP_PROFILE: env.profile ?? 'full',
      BLINDPAY_INSTANCE_ID: env.instanceId ?? '',
      BLINDPAY_API_KEY: '',
    },
  });
  open.push(child);
  return child;
}

function connect(env: Parameters<typeof startServer>[0] = {}): Connection {
  const child = startServer(env);
  const waiting = new Map<number, (message: Message) => void>();
  createInterface({ input: child.stdout }).on('line', (line) => {
    if (!line.trim()) return;
    const message = JSON.parse(line) as Message;
    if (typeof message.id === 'number') waiting.get(message.id)?.(message);
  });
  let nextId = 0;
  const write = (message: object) => child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', ...message })}\n`);
  return {
    request(method, params) {
      const id = ++nextId;
      const reply = new Promise<Message>((resolve) => waiting.set(id, resolve));
      write({ id, method, ...(params && { params }) });
      return reply;
    },
    notify(method) {
      write({ method });
    },
    close() {
      child.kill();
    },
  };
}

/** A 2026-07-28 request: the `_meta` envelope travels on every call. */
function modern(conn: Connection, method: string, params: Record<string, unknown> = {}): Promise<Message> {
  return conn.request(method, { ...params, _meta: META });
}

/** A request's `_meta` claiming `version` instead of 2026-07-28. */
function claiming(version: unknown): Record<string, unknown> {
  return { _meta: { ...META, 'io.modelcontextprotocol/protocolVersion': version } };
}

const UNSUPPORTED = {
  code: -32022,
  message: 'Unsupported protocol version: 2099-01-01',
  data: { supported: [MODERN], requested: '2099-01-01' },
};

async function legacyHandshake(conn: Connection): Promise<Message> {
  const init = await conn.request('initialize', {
    protocolVersion: LEGACY,
    capabilities: {},
    clientInfo: { name: 'stdio-server-test', version: '0' },
  });
  conn.notify('notifications/initialized');
  return init;
}

describe('2026-07-28', () => {
  test('server/discover names the revision, the server and the instructions', async () => {
    const conn = connect();
    const { result } = await modern(conn, 'server/discover');
    // Exactly the revisions the per-request check accepts: when an SDK upgrade
    // adds one, this fails until MODERN_PROTOCOL_VERSIONS in the template
    // lists it.
    assert.deepEqual(result.supportedVersions, [MODERN]);
    assert.equal(result.resultType, 'complete');
    assert.equal(result._meta['io.modelcontextprotocol/serverInfo'].name, '@blindpay/mcp');
    // Both lists are fixed for the life of the process.
    assert.deepEqual(result.capabilities.tools, { listChanged: false });
    assert.deepEqual(result.capabilities.resources, { listChanged: false });
    assert.match(result.instructions, /^BlindPay moves money/);
    conn.close();
  });

  test('tools/list carries resultType and cache fields, in a stable order', async () => {
    const conn = connect();
    const first = (await modern(conn, 'tools/list')).result;
    const second = (await modern(conn, 'tools/list')).result;
    assert.equal(first.resultType, 'complete');
    assert.ok(Number.isSafeInteger(first.ttlMs) && first.ttlMs >= 0);
    assert.ok(['public', 'private'].includes(first.cacheScope));
    assert.ok(first.tools.length > 0);
    assert.deepEqual(
      first.tools.map((t: { name: string }) => t.name),
      second.tools.map((t: { name: string }) => t.name)
    );
    for (const tool of first.tools) {
      assert.match(tool.name, /^[A-Za-z0-9_.-]{1,52}$/, tool.name);
      assert.equal(tool.inputSchema.type, 'object', tool.name);
      assert.equal(typeof tool.title, 'string', tool.name);
    }
    conn.close();
  });

  test('once on 2026-07-28, a request without the _meta envelope is rejected with -32602', async () => {
    // As the opening message, serveStdio takes a claim-less request as a
    // 2025-era opening (an SDK choice the spec leaves open), so open on
    // 2026-07-28 first.
    const conn = connect();
    await modern(conn, 'tools/list');
    const reply = await conn.request('tools/list', {});
    assert.equal(reply.error?.code, -32602);
    conn.close();
  });

  test('an unsupported revision as the opening request gets -32022', async () => {
    const conn = connect();
    assert.deepEqual((await conn.request('tools/list', claiming('2099-01-01'))).error, UNSUPPORTED);
    conn.close();
  });

  test('the version is checked on every request, not only the first', async () => {
    const conn = connect();
    await modern(conn, 'tools/list');
    assert.deepEqual((await conn.request('tools/list', claiming('2099-01-01'))).error, UNSUPPORTED);
    // The connection keeps serving supported requests afterwards.
    assert.equal((await modern(conn, 'tools/list')).result.resultType, 'complete');
    conn.close();
  });

  test('a protocol version that is not a string is a malformed envelope, -32602', async () => {
    const conn = connect();
    await modern(conn, 'tools/list');
    assert.equal((await conn.request('tools/list', claiming(20260728))).error?.code, -32602);
    conn.close();
  });

  test('invalid arguments come back as a tool error, before any API call', async () => {
    const conn = connect();
    const { result } = await modern(conn, 'tools/call', { name: 'GetV1InstancesById', arguments: {} });
    assert.equal(result.resultType, 'complete');
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /"id"/);
    conn.close();
  });

  test('an unknown tool is a protocol error', async () => {
    const conn = connect();
    const reply = await modern(conn, 'tools/call', { name: 'NoSuchTool', arguments: {} });
    assert.equal(reply.error?.code, -32602);
    conn.close();
  });

  test('the webhook index resource reads back as JSON, and a missing one is -32602', async () => {
    const conn = connect();
    const { result } = await modern(conn, 'resources/read', { uri: 'blindpay://webhooks/events' });
    assert.equal(result.resultType, 'complete');
    const events = JSON.parse(result.contents[0].text);
    assert.ok(Array.isArray(events) && events.length > 0);
    const missing = await modern(conn, 'resources/read', { uri: 'blindpay://webhooks/nope' });
    assert.equal(missing.error?.code, -32602);
    conn.close();
  });

  test('the readonly profile lists only read-only tools and says so', async () => {
    const conn = connect({ profile: 'readonly' });
    const discover = (await modern(conn, 'server/discover')).result;
    assert.match(discover.instructions, /read-only connection/);
    const { tools } = (await modern(conn, 'tools/list')).result;
    assert.ok(tools.length > 0);
    for (const tool of tools) assert.equal(tool.annotations.readOnlyHint, true, tool.name);
    assert.equal(tools.some((t: { name: string }) => t.name.startsWith('Post')), false);
    conn.close();
  });

  test('BLINDPAY_INSTANCE_ID makes the instance param optional and says where it comes from', async () => {
    const conn = connect({ instanceId: 'in_000000000000' });
    const { tools } = (await modern(conn, 'tools/list')).result;
    const tool = tools.find((t: { name: string }) => t.name === 'GetV1InstancesById');
    assert.ok(!(tool.inputSchema.required ?? []).includes('id'));
    assert.match(tool.inputSchema.properties.id.description, /BLINDPAY_INSTANCE_ID/);
    conn.close();
  });
});

describe('process', () => {
  test('the server exits when stdin closes', async () => {
    const child = startServer();
    child.stdin.end();
    const code = await new Promise<number | null>((resolve) => child.on('exit', resolve));
    assert.equal(code, 0);
  });
});

describe('2025-11-25 fallback', () => {
  test('initialize negotiates 2025-11-25 and sends the instructions', async () => {
    const conn = connect();
    const { result } = await legacyHandshake(conn);
    assert.equal(result.protocolVersion, LEGACY);
    assert.equal(result.serverInfo.name, '@blindpay/mcp');
    assert.match(result.instructions, /^BlindPay moves money/);
    assert.deepEqual(await conn.request('ping'), { jsonrpc: '2.0', id: 2, result: {} });
    conn.close();
  });

  test('both eras list the same tools and resources', async () => {
    const legacy = connect({ profile: 'readonly' });
    await legacyHandshake(legacy);
    const legacyTools = (await legacy.request('tools/list')).result;
    const legacyResources = (await legacy.request('resources/list')).result;
    assert.equal(legacyTools.resultType, undefined);
    legacy.close();

    const current = connect({ profile: 'readonly' });
    const modernTools = (await modern(current, 'tools/list')).result;
    const modernResources = (await modern(current, 'resources/list')).result;
    current.close();

    assert.deepEqual(modernTools.tools, legacyTools.tools);
    assert.deepEqual(modernResources.resources, legacyResources.resources);
  });
});
