import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bumpSemver, decideVersionBump } from './tool-map.mts';

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
