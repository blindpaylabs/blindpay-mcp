import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dereference, hasRequiredFields, inputSchemasFromOpenApi, webhookEventsFromOpenApi } from './openapi.mts';

const components = {
  schemas: {
    QuoteIn: { type: 'object', properties: { quote_id: { type: 'string' } }, required: ['quote_id'] },
    PatchIn: { type: 'object', properties: { name: { type: 'string' } } },
    Refined: { allOf: [{ $ref: '#/components/schemas/QuoteIn' }] },
    Node: { type: 'object', properties: { child: { $ref: '#/components/schemas/Node' } } },
    PayoutEvent: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
  },
};

function jsonBody(schema: unknown, extra: Record<string, unknown> = {}) {
  return { ...extra, content: { 'application/json': { schema } } };
}

test('dereference inlines refs and cuts cycles to {}', () => {
  assert.deepEqual(dereference({ $ref: '#/components/schemas/Node' }, components.schemas), {
    type: 'object',
    properties: { child: {} },
  });
  assert.deepEqual(dereference({ $ref: '#/components/schemas/Missing' }, components.schemas), {});
});

test('hasRequiredFields looks at required and allOf branches', () => {
  assert.equal(hasRequiredFields({ required: ['a'] }), true);
  assert.equal(hasRequiredFields({ required: [] }), false);
  assert.equal(hasRequiredFields({ allOf: [{}, { required: ['a'] }] }), true);
  assert.equal(hasRequiredFields(null), false);
});

test('inputSchemasFromOpenApi keeps integer types, examples and the instance param as the spec has them', () => {
  const schemas = inputSchemasFromOpenApi({
    components,
    paths: {
      '/v1/instances/{instance_id}/quotes': {
        post: {
          parameters: [
            { name: 'instance_id', in: 'path', required: true, schema: { type: 'string', example: 'in_000000000000' } },
            { name: 'Idempotency-Key', in: 'header', schema: { type: 'string', example: 'key_1' } },
          ],
          requestBody: jsonBody(
            { type: 'object', properties: { request_amount: { type: 'integer', example: 1000 } }, required: ['request_amount'] },
            { description: 'Create a new quote' },
          ),
        },
      },
    },
  });

  // The body's own description is not copied in, as on the hosted server.
  assert.deepEqual(schemas.get('post /v1/instances/{instance_id}/quotes'), {
    type: 'object',
    properties: {
      instance_id: { type: 'string', example: 'in_000000000000' },
      'Idempotency-Key': { type: 'string', example: 'key_1' },
      requestBody: {
        type: 'object',
        properties: { request_amount: { type: 'integer', example: 1000 } },
        required: ['request_amount'],
      },
    },
    required: ['instance_id', 'requestBody'],
  });
});

test('inputSchemasFromOpenApi requires a body that has required fields or the spec flag', () => {
  const schemas = inputSchemasFromOpenApi({
    components,
    paths: {
      '/v1/refined': { post: { requestBody: jsonBody({ $ref: '#/components/schemas/Refined' }) } },
      '/v1/patch': { patch: { requestBody: jsonBody({ $ref: '#/components/schemas/PatchIn' }) } },
      '/v1/flagged': { put: { requestBody: jsonBody({ type: 'object' }, { required: true }) } },
    },
  });

  assert.deepEqual(schemas.get('post /v1/refined')?.required, ['requestBody']);
  assert.equal(schemas.get('patch /v1/patch')?.required, undefined);
  assert.deepEqual(schemas.get('put /v1/flagged')?.required, ['requestBody']);
});

test('inputSchemasFromOpenApi skips x-mcp: false operations and leaves non-JSON bodies out', () => {
  const schemas = inputSchemasFromOpenApi({
    components,
    paths: {
      '/v1/upload': { post: { 'x-mcp': false, requestBody: { content: { 'multipart/form-data': { schema: { type: 'object' } } } } } },
      '/v1/notes': { post: { requestBody: { content: { 'text/plain': { schema: { type: 'string' } } } } } },
      '/v1/list': { get: {} },
    },
  });

  assert.equal(schemas.has('post /v1/upload'), false);
  assert.deepEqual(schemas.get('post /v1/notes'), { type: 'object', properties: {} });
  assert.deepEqual(schemas.get('get /v1/list'), { type: 'object', properties: {} });
});

test('webhookEventsFromOpenApi sorts events and resolves payloads', () => {
  const events = webhookEventsFromOpenApi({
    components,
    webhooks: {
      'payout.update': {
        post: {
          requestBody: { description: 'Update payout from blindpay', ...jsonBody({ type: 'object' }) },
        },
      },
      'payout.complete': {
        post: {
          requestBody: jsonBody({ $ref: '#/components/schemas/PayoutEvent' }),
          responses: { '200': { description: 'Payout completed' } },
        },
      },
      'tos.accept': {},
    },
  });

  assert.deepEqual(
    events.map((e) => [e.event, e.description, e.uri]),
    [
      ['payout.complete', 'Payout completed', 'blindpay://webhooks/events/payout.complete'],
      ['payout.update', 'Update payout from blindpay', 'blindpay://webhooks/events/payout.update'],
      ['tos.accept', 'tos.accept', 'blindpay://webhooks/events/tos.accept'],
    ],
  );
  assert.deepEqual(events[0].payloadSchema, components.schemas.PayoutEvent);
  assert.deepEqual(events[2].payloadSchema, {});
});
