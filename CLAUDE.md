# BlindPay MCP - Agent Reference

## Commands

```
npm run typecheck        # tsc --noEmit
npm run build            # tsc + chmod the entry point
npm run generate         # Raw openapi-mcp-generator dump to /tmp/mcp-generated (debugging only)
npm run sync              # Full deterministic pipeline: writes src/index.ts + package.json
npm run sync:check        # Same pipeline, but diffs against committed files instead of writing (exit 2 on diff)
npm run check-tool-names  # Static gate: fails if any committed tool name exceeds 52 chars
```

## How updates work

This repo is auto-synced with the BlindPay public API surface, the same
set of routes shown on the public docs site (`/doc`). When that surface
changes upstream, `.github/workflows/api-sync.yml` fires. There is no LLM
anywhere in this path; every step is a plain script.

1. The blindpay-v2 `mcp-sync.yml` workflow generates `apps/api/openapi.json`
   (already filtered by `applyPublicTagFilter` to public-tagged routes)
   and pushes it to this repo's `api-sync-data` branch at
   `.api-sync/openapi.json`. Then it fires a `repository_dispatch`
   `api-sync` event.
2. `api-sync.yml` consumes the event and runs `npm run sync`
   (`scripts/sync.mts`), which:
   - runs `openapi-mcp-generator` against the fetched spec,
   - extracts its `toolDefinitionMap` block,
   - deterministically shortens any tool name over 52 chars (see below),
   - splices that map into `src/index.template.ts` to produce `src/index.ts`,
   - diffs the new tool-name set against the previously committed one to
     decide a minor (names added/removed) vs patch version bump, and writes
     that version into both `package.json` and `SERVER_VERSION`.
   Any spec shape the script can't map (missing map markers, a name it
   can't shorten under the limit, a duplicate name) is a hard failure, not
   a best guess.
3. CI (`ci.yml`, required on `main`) typechecks, builds and re-checks the
   52-char limit. The PR on the `api-sync` branch is opened/updated and
   `gh pr merge --auto --squash` is set on it, so it merges itself once CI
   is green, no human step.
4. `publish.yml` (unchanged) publishes to npm and tags a release on every
   push to `main` whose `package.json` version isn't already published.

## File structure

```
src/index.template.ts       # Hand-maintained template: everything in
                            # src/index.ts except the tool map and version,
                            # with /* __TOOL_DEFINITIONS__ */ and
                            # __SERVER_VERSION__ markers. Edit THIS for any
                            # behavioral change; src/index.ts is generated.
src/index.ts                # Built by scripts/sync.mts. Do not hand-edit.
.api-sync/openapi.json      # Public OpenAPI spec, written by upstream
                            # workflow on the api-sync-data branch.
scripts/sync.mts            # The deterministic build: generator -> extract
                            # -> rename -> splice -> version bump.
scripts/check-tool-names.mts  # Standalone 52-char gate, used by ci.yml too.
scripts/lib/tool-map.mts    # Pure helpers (extraction, renaming, semver
                            # bump) used by both scripts above.
scripts/generate.ts         # Legacy raw generator dump for manual debugging
                            # only; not used by the pipeline anymore.
```

## src/index.template.ts layout

Same three-section shape as before, minus the two things that are now
data-driven rather than hand-copied:

1. **Imports + server constants**. `SERVER_VERSION` is the literal string
   `__SERVER_VERSION__`, substituted at build time from `package.json`, so
   the two can never drift apart.
2. **`toolDefinitionMap`**. The array literal body is the literal comment
   `/* __TOOL_DEFINITIONS__ */`, replaced at build time with the freshly
   generated (and, where needed, renamed) tool entries. Never hand-edit
   tool entries, not even in the template, fix them upstream in the API
   spec.
3. **Helpers + entrypoint** (`acquireOAuth2Token`, `executeApiTool`,
   `formatApiError`, `jsonSchemaToZodSchema`, `getZodSchemaFromJsonSchema`,
   `main`, `cleanup`). Fully hand-written, never touched by the sync
   script. This is where you add new customizations.

## Customizations baked into the template

These used to be a checklist a human (or an LLM) had to remember to
preserve on every merge. Now they're just what the template says, so they
can't drift:

1. **`McpServer` instantiation.** `const mcpServer = new McpServer(...)`,
   `const server = mcpServer.server`, and `mcpServer.server.connect(transport)`
   in `main()`, instead of the generator's bare `Server`.
2. **Custom `jsonSchemaToZodSchema` / `getZodSchemaFromJsonSchema`.** The
   generator's stock output uses `json-schema-to-zod`, which relies on
   `eval()`. Do not add that dependency back.
3. **`global.__oauthTokenCache ??= {}`** instead of the generator's verbose
   `if (typeof ... === 'undefined')` block.
4. **`BLINDPAY_API_KEY` fallback** in both the bearer-auth check and the
   bearer-auth apply sections of `executeApiTool`.
5. **`BLINDPAY_INSTANCE_ID` auto-inject** at the top of `executeApiTool`.
6. **Hardcoded `API_BASE_URL = 'https://api.blindpay.com'`** instead of the
   generator's `process.env.API_BASE_URL || ''`.
7. **`SERVER_NAME = '@blindpay/mcp'`**, kept alongside the `__SERVER_VERSION__`
   marker described above.

## Tool name length limit (52 chars)

MCP tool names are combined with a `blindpay:` prefix under a 60-char total
limit by clients, leaving 52 chars for the name itself. Tool names are
derived from HTTP method + path (there's no `operationId` in the spec), so
a long path produces a long name.

`scripts/lib/tool-map.mts`'s `shortenToolName` applies one deterministic
rule to any name over 52 chars: drop the literal `V1` segment that
immediately follows the verb prefix (`GetV1...` -> `Get...`). Every
operation lives under `/v1`, so that segment carries no disambiguating
signal. If a name is still over the limit after that (or the rule can't
apply because there's no `V1` prefix to drop), `scripts/sync.mts` fails
loudly rather than guessing a name; the real fix at that point is a shorter
path in the API spec, not another shortening rule here.

## Version bump

`scripts/sync.mts` compares the new tool-name set against the previously
committed one: **minor** if any name was added or removed, **patch**
otherwise. Never major, that's a deliberate human decision made directly in
`package.json` outside the sync pipeline.
