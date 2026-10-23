import { test } from 'node:test';
import assert from 'node:assert/strict';
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

test('replaceInputSchemas swaps each inputSchema for the one keyed by method and path', () => {
  const schema = { type: 'object', properties: { limit: { type: 'integer', example: 10 } } };
  const text = replaceInputSchemas(ENTRY, new Map([['get /v1/things/{id}', schema]]));

  assert.equal(text.match(INPUT_SCHEMA_LINE)?.[0], `    inputSchema: ${JSON.stringify(schema)},`);
  assert.equal(text.replace(INPUT_SCHEMA_LINE, ''), ENTRY.replace(INPUT_SCHEMA_LINE, ''));
});

test('replaceInputSchemas refuses an operation the spec has no schema for', () => {
  assert.throws(() => replaceInputSchemas(ENTRY, new Map()), /GET \/v1\/things\/\{id\}/);
});

test('replaceInputSchemas refuses an entry whose shape it does not recognise', () => {
  const moved = ENTRY.replace('    method: "get",\n', '').replace('securityRequirements: []', 'securityRequirements: [],\n    method: "get"');
  assert.throws(() => replaceInputSchemas(moved, new Map([['get /v1/things/{id}', {}]])), /0 of 1 tools/);
});
