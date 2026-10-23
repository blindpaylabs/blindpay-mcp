import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  dereference,
  hasRequiredFields,
  requireBodiesWithRequiredFields,
  webhookEventsFromOpenApi,
} from './openapi.mts';

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

test('requireBodiesWithRequiredFields flags only bodies with required fields', () => {
  const spec = {
    components,
    paths: {
      '/v1/payouts': { post: { requestBody: jsonBody({ $ref: '#/components/schemas/QuoteIn' }) } },
      '/v1/refined': { post: { requestBody: jsonBody({ $ref: '#/components/schemas/Refined' }) } },
      '/v1/patch': { patch: { requestBody: jsonBody({ $ref: '#/components/schemas/PatchIn' }) } },
      '/v1/upload': { post: { requestBody: { content: { 'multipart/form-data': { schema: { required: ['file'] } } } } } },
      '/v1/list': { get: {} },
    },
  };

  const { doc, changed } = requireBodiesWithRequiredFields(spec);

  assert.deepEqual(changed, ['POST /v1/payouts', 'POST /v1/refined']);
  assert.equal((doc.paths as any)['/v1/payouts'].post.requestBody.required, true);
  assert.equal((doc.paths as any)['/v1/patch'].patch.requestBody.required, undefined);
  assert.equal((doc.paths as any)['/v1/upload'].post.requestBody.required, undefined);
  // The input spec is left as it was.
  assert.equal((spec.paths['/v1/payouts'].post.requestBody as any).required, undefined);
});

test('requireBodiesWithRequiredFields leaves an explicit flag alone', () => {
  const spec = {
    components,
    paths: { '/v1/x': { put: { requestBody: jsonBody({ type: 'object' }, { required: true }) } } },
  };
  const { doc, changed } = requireBodiesWithRequiredFields(spec);
  assert.deepEqual(changed, []);
  assert.equal((doc.paths as any)['/v1/x'].put.requestBody.required, true);
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
