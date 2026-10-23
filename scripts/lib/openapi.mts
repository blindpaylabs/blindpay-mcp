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
  requestBody?: { required?: boolean; content?: Record<string, { schema?: unknown }> };
}

/**
 * The hosted server requires `requestBody` whenever its JSON schema has
 * required fields; openapi-mcp-generator only honors `requestBody.required`,
 * which our routes almost never set. Setting the flag on a copy of the spec
 * before the generator runs gives both servers the same `required` list.
 * Returns the new spec and the tools-to-be whose flag was set.
 */
export function requireBodiesWithRequiredFields<T extends { paths?: unknown; components?: unknown }>(
  doc: T,
): { doc: T; changed: string[] } {
  const schemas = componentSchemas(doc);
  const copy = structuredClone(doc);
  const changed: string[] = [];

  for (const [path, item] of Object.entries((copy.paths ?? {}) as Record<string, Record<string, Operation>>)) {
    for (const method of HTTP_METHODS) {
      const body = item[method]?.requestBody;
      const schema = body?.content?.['application/json']?.schema;
      if (!body || body.required || schema === undefined) continue;
      if (!hasRequiredFields(dereference(schema, schemas))) continue;
      body.required = true;
      changed.push(`${method.toUpperCase()} ${path}`);
    }
  }

  return { doc: copy, changed };
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
