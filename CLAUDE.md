# BlindPay MCP - Agent Reference

## Commands

```
npm run typecheck     # tsc --noEmit
npm run build         # tsc + chmod the entry point
npm run generate      # Regenerate src/index.ts from .api-sync/openapi.mcp.json
```

## How updates work

This repo is auto-synced with the BlindPay API. Whenever a route tagged
`x-mcp` (or default-included via `x-sdk: true`) changes upstream, the
workflow at `.github/workflows/api-sync.yml` fires:

1. The blindpay-v2 `mcp-sync.yml` workflow filters the OpenAPI spec down to
   MCP-eligible routes and pushes it to this repo's `api-sync-data` branch
   at `.api-sync/openapi.mcp.json`. Then it fires a `repository_dispatch`
   `api-sync` event.
2. `api-sync.yml` consumes the event, runs `npm run generate` to produce a
   fresh reference file from the spec, then asks Claude to merge the
   regenerated tool definitions into `src/index.ts` while preserving the
   hand-written customizations listed below.
3. A PR is opened/updated on the `api-sync` branch for human review.

## File structure

```
src/index.ts                # Whole MCP server in one file. Generated entry,
                            # then hand-customized helpers.
.api-sync/openapi.mcp.json  # Filtered OpenAPI spec, written by upstream
                            # workflow on the api-sync-data branch.
scripts/generate.ts         # Runs openapi-mcp-generator to produce a
                            # reference index.ts at /tmp/mcp-generated/.
```

## src/index.ts layout

The file has three sections:

1. **Imports + server constants** (lines ~1-60). Constants `SERVER_NAME`,
   `SERVER_VERSION`, `API_BASE_URL`. SERVER_VERSION must be bumped on every
   sync.
2. **`toolDefinitionMap`** (lines ~60-6800). Pure data, derived 1:1 from the
   OpenAPI spec. This is what the generator produces. **Never hand-edit
   tool entries here** — fix them upstream in the API spec.
3. **Helpers + entrypoint** (`acquireOAuth2Token`, `executeApiTool`,
   `formatApiError`, `jsonSchemaToZodSchema`, `getZodSchemaFromJsonSchema`,
   `main`, `cleanup`). These contain the hand-written customizations.

## Customizations to preserve across regenerations

When merging a regenerated reference file into `src/index.ts`, **always
preserve** the following:

### 1. Custom `jsonSchemaToZodSchema` (security refactor)

The generator's stock output uses `json-schema-to-zod` which relies on
`eval()`. We replaced it with a hand-written `jsonSchemaToZodSchema` and
removed the `json-schema-to-zod` dependency. **Do not** add
`json-schema-to-zod` back. Keep our `jsonSchemaToZodSchema` and
`getZodSchemaFromJsonSchema` implementations.

### 2. Modern OAuth token cache initialization

```ts
global.__oauthTokenCache ??= {};
```

Not the verbose `if (typeof global.__oauthTokenCache === 'undefined')` block
the generator emits.

### 3. Auto-inject `instance_id` in `executeApiTool`

Inside `executeApiTool`, before validation, the following block must be
present:

```ts
// Auto-inject instance_id from environment if not provided
const defaultInstanceId = process.env.BLINDPAY_INSTANCE_ID;
if (
  defaultInstanceId &&
  definition.inputSchema?.required?.includes('instance_id') &&
  !toolArgs.instance_id
) {
  toolArgs.instance_id = defaultInstanceId;
  console.error(`Auto-injected instance_id from BLINDPAY_INSTANCE_ID env var`);
}
```

This makes the MCP usable from agents that have a single instance configured
without prompting the user every call.

## Sync workflow conventions

- Every api-sync run: bump `SERVER_VERSION` (patch by default; minor if the
  generator added new tools or removed any).
- Run `npm run typecheck` and `npm run build` after merging. Both must pass
  before pushing.
- Never write the full regenerated file directly to `src/index.ts` — the
  customizations above will be lost. Always merge.
- `.github/workflows/` is excluded from auto-commits. Do not modify it as
  part of an api-sync run.
