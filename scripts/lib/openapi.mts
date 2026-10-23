/**
 * Pure OpenAPI helpers that keep this package 1:1 with the hosted server
 * (blindpay-v2 apps/api/src/shared/public-mcp). Each one is a port of the
 * hosted function named in its comment; change both together. No I/O here.
 */

type Schemas = Record<string, unknown>;

function componentSchemas(doc: { components?: unknown }): Schemas {
  return ((doc.components as { schemas?: Schemas } | undefined)?.schemas) ?? {};
}

/**
 * Inlines `#/components/schemas/*` $refs. A schema already on the resolution
 * stack becomes `{}`. Port of `dereference` in tool-gen.ts.
 */
export function dereference(node: unknown, schemas: Schemas, stack: string[] = []): unknown {
  if (Array.isArray(node)) return node.map((item) => dereference(item, schemas, stack));
  if (node === null || typeof node !== 'object') return node;

  const obj = node as Record<string, unknown>;
  const ref = obj.$ref;
  if (typeof ref === 'string' && ref.startsWith('#/components/schemas/')) {
    const name = ref.slice('#/components/schemas/'.length);
    if (stack.includes(name)) return {};
    const target = schemas[name];
    if (target === undefined) return {};
    return dereference(target, schemas, [...stack, name]);
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, dereference(value, schemas, stack)]),
  );
}

/**
 * True when a dereferenced body schema declares a required field, directly or
 * in an `allOf` branch. Port of `hasRequiredFields` in tool-gen.ts.
 */
export function hasRequiredFields(schema: unknown): boolean {
  if (schema === null || typeof schema !== 'object') return false;
  const node = schema as { required?: unknown; allOf?: unknown[] };
  if (Array.isArray(node.required) && node.required.length > 0) return true;
  return Array.isArray(node.allOf) && node.allOf.some(hasRequiredFields);
}

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;

interface Operation {
  'x-mcp'?: boolean;
  parameters?: unknown[];
  requestBody?: { required?: boolean; content?: Record<string, { schema?: unknown }> };
}

interface Parameter {
  name?: string;
  in?: string;
  required?: boolean;
  schema?: unknown;
}

export interface InputSchema {
  type: 'object';
  properties: Record<string, unknown>;
  required?: string[];
}

/** How inputSchemasFromOpenApi keys an operation: `post /v1/instances/{instance_id}/quotes`. */
export function routeKey(method: string, path: string): string {
  return `${method} ${path}`;
}

/**
 * Each operation's MCP inputSchema, keyed by routeKey: parameters by
 * name, then the JSON body under `requestBody`, required whenever it has
 * required fields. The spec's schemas are kept as they are, where
 * openapi-mcp-generator turns integer into number, drops examples and copies
 * the body's description in. Port of the inputSchema half of
 * `generateToolsFromOpenApi` in tool-gen.ts, minus its instance-param rewrite:
 * here that param keeps its spec schema and stays required, and
 * clientInputSchema relaxes it when BLINDPAY_INSTANCE_ID is set.
 */
export function inputSchemasFromOpenApi(doc: { paths?: unknown; components?: unknown }): Map<string, InputSchema> {
  const schemas = componentSchemas(doc);
  const inputSchemas = new Map<string, InputSchema>();

  for (const [path, item] of Object.entries((doc.paths ?? {}) as Record<string, Record<string, Operation>>)) {
    for (const method of HTTP_METHODS) {
      const op = item[method];
      if (!op || op['x-mcp'] === false) continue;

      const properties: Record<string, unknown> = {};
      const required: string[] = [];
      for (const raw of op.parameters ?? []) {
        const param = dereference(raw, schemas) as Parameter;
        if (!param.name || !param.in) continue;
        properties[param.name] = param.schema ?? {};
        if (param.required) required.push(param.name);
      }

      const bodySchema = op.requestBody?.content?.['application/json']?.schema;
      if (bodySchema !== undefined) {
        const body = dereference(bodySchema, schemas);
        properties.requestBody = body;
        if (op.requestBody?.required || hasRequiredFields(body)) required.push('requestBody');
      }

      inputSchemas.set(routeKey(method, path), { type: 'object', properties, ...(required.length > 0 ? { required } : {}) });
    }
  }

  return inputSchemas;
}

export const WEBHOOK_EVENTS_URI = 'blindpay://webhooks/events';

export interface WebhookEvent {
  event: string;
  description: string;
  uri: string;
  payloadSchema: unknown;
}

interface WebhookOperation {
  requestBody?: { description?: string; content?: Record<string, { schema?: unknown }> };
  responses?: Record<string, { description?: string }>;
}

/**
 * Every event in the spec's `webhooks` section with its self-contained
 * payload schema, sorted by name. Port of `webhookEventsFromOpenApi` in
 * webhook-resources.ts.
 */
export function webhookEventsFromOpenApi(doc: { webhooks?: unknown; components?: unknown }): WebhookEvent[] {
  const schemas = componentSchemas(doc);
  return Object.entries((doc.webhooks ?? {}) as Record<string, { post?: WebhookOperation }>)
    .map(([event, item]) => {
      const op = item.post;
      return {
        event,
        // The 200 description reads as the event ("Payout completed").
        description: op?.responses?.['200']?.description ?? op?.requestBody?.description ?? event,
        uri: `${WEBHOOK_EVENTS_URI}/${event}`,
        payloadSchema: dereference(op?.requestBody?.content?.['application/json']?.schema ?? {}, schemas),
      };
    })
    .sort((a, b) => (a.event < b.event ? -1 : a.event > b.event ? 1 : 0));
}
