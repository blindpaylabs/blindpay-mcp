import { test } from 'node:test';
import assert from 'node:assert/strict';
import { manifestVersionProblem, manifestVersions, setManifestVersion } from './manifest-versions.mts';

// server.json's shape: two version fields, and one-line objects a JSON
// round trip would reformat.
const SERVER_JSON = `{
  "name": "com.blindpay/mcp",
  "icons": [{ "src": "https://example.com/icon.svg", "sizes": ["any"] }],
  "version": "1.8.0",
  "packages": [
    {
      "identifier": "@blindpay/mcp",
      "version": "1.8.0",
      "transport": { "type": "stdio" }
    }
  ]
}
`;
const SERVER = { path: 'server.json', versionFieldCount: 2 };

test('manifestVersions lists the version fields in file order', () => {
  assert.deepEqual(manifestVersions(SERVER_JSON), ['1.8.0', '1.8.0']);
  assert.deepEqual(manifestVersions('{ "name": "blindpay" }'), []);
});

test('setManifestVersion sets every version field and leaves the rest byte for byte', () => {
  const updated = setManifestVersion(SERVER, SERVER_JSON, '1.10.0');

  assert.deepEqual(manifestVersions(updated), ['1.10.0', '1.10.0']);
  assert.equal(updated, SERVER_JSON.replaceAll('"version": "1.8.0"', '"version": "1.10.0"'));
});

test('setManifestVersion refuses a file with a different number of version fields', () => {
  assert.throws(() => setManifestVersion({ ...SERVER, versionFieldCount: 1 }, SERVER_JSON, '1.10.0'), /server\.json has 2 "version" fields where 1/);
  assert.throws(() => setManifestVersion(SERVER, '{ "name": "blindpay" }', '1.10.0'), /has 0 "version" fields/);
});

test('manifestVersionProblem names a stale version or an unexpected field count', () => {
  assert.equal(manifestVersionProblem(SERVER, setManifestVersion(SERVER, SERVER_JSON, '1.10.0'), '1.10.0'), undefined);
  assert.equal(manifestVersionProblem(SERVER, SERVER_JSON, '1.10.0'), 'server.json is at 1.8.0, 1.8.0');
  assert.match(manifestVersionProblem({ ...SERVER, versionFieldCount: 3 }, SERVER_JSON, '1.8.0') ?? '', /has 2 "version" fields where 3/);
});
