import { test } from 'node:test';
import assert from 'node:assert/strict';
import { routeKey, type InputSchema } from './openapi.mts';
import { bumpSemver, decideVersionBump, replaceInputSchemas } from './tool-map.mts';

test('bumpSemver applies each bump', () => {
  assert.equal(bumpSemver('1.8.3', 'minor'), '1.9.0');
  assert.equal(bumpSemver('1.8.3', 'patch'), '1.8.4');
  assert.equal(bumpSemver('1.8.3', 'none'), '1.8.3');
});

test('decideVersionBump is minor only when the name set changes', () => {
  assert.equal(decideVersionBump(['A', 'B'], ['B', 'A']), 'patch');
  assert.equal(decideVersionBump(['A'], ['A', 'B']), 'minor');
  assert.equal(decideVersionBump(['A', 'B'], ['A']), 'minor');
});

// One entry as openapi-mcp-generator writes it.
const ENTRY = `  ["GetV1ThingsById", {
    name: "GetV1ThingsById",
    description: \`Reads a thing.\`,
    inputSchema: {"type":"object","properties":{"limit":{"type":"number"}}},
    method: "get",
    pathTemplate: "/v1/things/{id}",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: []
  }],`;
const INPUT_SCHEMA_LINE = /^ {4}inputSchema: .*$/m;
const THING = routeKey('get', '/v1/things/{id}');
const THING_SCHEMA: InputSchema = {
  type: 'object',
  properties: { id: { type: 'string', example: 'th_000000000000' }, limit: { type: 'integer', example: 10 } },
  required: ['id'],
};

test('replaceInputSchemas swaps each inputSchema for the one keyed by method and path', () => {
  const text = replaceInputSchemas(ENTRY, new Map([[THING, THING_SCHEMA]]));

  assert.equal(text.match(INPUT_SCHEMA_LINE)?.[0], `    inputSchema: ${JSON.stringify(THING_SCHEMA)},`);
  assert.equal(text.replace(INPUT_SCHEMA_LINE, ''), ENTRY.replace(INPUT_SCHEMA_LINE, ''));
});

test('replaceInputSchemas refuses an operation the spec has no schema for', () => {
  assert.throws(() => replaceInputSchemas(ENTRY, new Map()), /GET \/v1\/things\/\{id\}/);
});

test('replaceInputSchemas refuses a schema the generator wrote no tool for', () => {
  const extra = routeKey('delete', '/v1/things/{id}');
  assert.throws(() => replaceInputSchemas(ENTRY, new Map([[THING, THING_SCHEMA], [extra, THING_SCHEMA]])), /delete \/v1\/things\/\{id\}/);
});

test('replaceInputSchemas refuses a schema without a parameter or body the entry sends', () => {
  const noId: InputSchema = { type: 'object', properties: {} };
  assert.throws(() => replaceInputSchemas(ENTRY, new Map([[THING, noId]])), /sends id,/);
  const multipart = ENTRY.replace('requestBodyContentType: undefined', 'requestBodyContentType: "multipart/form-data"');
  assert.throws(() => replaceInputSchemas(multipart, new Map([[THING, THING_SCHEMA]])), /sends requestBody,/);
});

test('replaceInputSchemas refuses an entry whose shape it does not recognise', () => {
  const moved = ENTRY.replace('    method: "get",\n', '').replace('securityRequirements: []', 'securityRequirements: [],\n    method: "get"');
  assert.throws(() => replaceInputSchemas(moved, new Map([[THING, THING_SCHEMA]])), /0 of 1 tools/);
});
