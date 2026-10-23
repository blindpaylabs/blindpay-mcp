# BlindPay MCP - Agent Reference

## Commands

```
npm run typecheck        # tsc --noEmit
npm run build            # tsc + chmod the entry point
npm run generate         # Raw openapi-mcp-generator dump to /tmp/mcp-generated (debugging only)
npm run sync              # Full deterministic pipeline: writes src/index.ts + package.json
npm run sync:check        # Same pipeline, but diffs against committed files instead of writing (exit 2 on diff)
npm run check-tool-names  # Static gate: fails if any committed tool name exceeds 52 chars
npm run check-plugin      # Static gate: fails if plugins/blindpay breaks a Claude directory rule
npm run check-openai-plugin  # Static gate: fails if plugins/openai breaks an OpenAI submission limit or leaves /mcp/readonly
npm run check-connector   # Live check: walks the OAuth sign-in of Claude, Claude Code, VS Code and ChatGPT against mcp.blindpay.com/mcp/readonly (not in CI)
npm test                  # Unit tests for scripts/lib (node:test via tsx)
npm run pack:openai       # ZIP for the ChatGPT/Codex plugin directory, in build-plugins/
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
   - sets `requestBody.required` on a temp copy of the spec for every body
     whose schema has required fields (see "Parity with the hosted server"),
   - runs `openapi-mcp-generator` against that copy,
   - extracts its `toolDefinitionMap` block,
   - deterministically shortens any tool name over 52 chars (see below),
   - splices that map, plus the spec's webhook events, into
     `src/index.template.ts` to produce `src/index.ts`,
   - picks the version bump (see "Version bump") and writes that version
     into both `package.json` and `SERVER_VERSION`.
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
                            # src/index.ts except the tool map, webhook
                            # events and version, with
                            # /* __TOOL_DEFINITIONS__ */,
                            # /* __WEBHOOK_EVENTS__ */ and
                            # __SERVER_VERSION__ markers. Edit THIS for any
                            # behavioral change; src/index.ts is generated.
src/index.ts                # Built by scripts/sync.mts. Do not hand-edit.
.api-sync/openapi.json      # Public OpenAPI spec, written by upstream
                            # workflow on the api-sync-data branch.
scripts/sync.mts            # The deterministic build: generator -> extract
                            # -> rename -> splice -> version bump.
scripts/check-tool-names.mts  # Standalone 52-char gate, used by ci.yml too.
scripts/lib/tool-map.mts    # Pure helpers (extraction, renaming, semver
                            # bump) used by both scripts above, with
                            # tool-map.test.mts next to it.
scripts/lib/openapi.mts     # Ports of the hosted server's spec helpers
                            # (dereference, required bodies, webhook events),
                            # with openapi.test.mts next to it.
scripts/check-plugin.mts    # Claude directory gate for plugins/blindpay,
                            # used by ci.yml. Reads tracked files only.
scripts/lib/plugin-check.mts  # Pure rules behind check-plugin, with
                            # plugin-check.test.mts next to it.
scripts/check-connector.mts # Live sign-in check for the directory
                            # connector. Stops at the BlindPay sign-in page,
                            # so it creates no grants or tokens.
scripts/lib/connector-check.mts  # Pure rules behind check-connector
                            # (Claude's OAuth requirements), with tests.
plugins/blindpay/           # The Claude directory plugin (read-only MCP
                            # server + blindpay-payments skill). Listed from
                            # main; raise "version" in its plugin.json on
                            # every change.
plugins/openai/             # ChatGPT/Codex plugin (Agent Plugins format,
                            # read-only server). npm run pack:openai zips it
                            # with the blindpay-payments skill; raise
                            # "version" on every resubmission.
scripts/check-openai-plugin.mts  # OpenAI submission gate for plugins/openai,
                            # used by ci.yml. Rules (with tests) live in
                            # scripts/lib/openai-plugin-check.mts.
plugins/cursor/             # Cursor Marketplace plugin, listed through
                            # .cursor-plugin/marketplace.json. API key auth:
                            # Cursor's OAuth needs DCR, which Clerk doesn't offer.
llms-install.md             # Setup steps Cline (and other agents) follow.
glama.json                  # Glama ownership claim (GitHub maintainers).
scripts/generate.ts         # Legacy raw generator dump for manual debugging
                            # only; not used by the pipeline anymore.
```

## src/index.template.ts layout

Same three-section shape as before, minus the three things that are now
data-driven rather than hand-copied (the version, the tool map and the
webhook events):

1. **Imports + server constants**. `SERVER_VERSION` is the literal string
   `__SERVER_VERSION__`, substituted at build time from `package.json`, so
   the two can never drift apart.
2. **`toolDefinitionMap`**. The array literal body is the literal comment
   `/* __TOOL_DEFINITIONS__ */`, replaced at build time with the freshly
   generated (and, where needed, renamed) tool entries. Never hand-edit
   tool entries, not even in the template, fix them upstream in the API
   spec. `WEBHOOK_EVENTS` works the same way through
   `/* __WEBHOOK_EVENTS__ */`.
3. **Helpers + entrypoint** (`instanceParamName`, `clientInputSchema`,
   `registerWebhookResources`, `acquireOAuth2Token`, `executeApiTool`,
   `jsonOrText`, `formatApiError`, `jsonSchemaToZodSchema`,
   `getZodSchemaFromJsonSchema`, `main`, `cleanup`). Fully hand-written, never touched by the sync
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
5. **`BLINDPAY_INSTANCE_ID` auto-inject** in `executeApiTool`, right after
   the arguments are validated, into the instance param (`instance_id`,
   `id` on `/v1/instances/{id}` routes, or the `instance_id` query param of
   `PostV1Presign`). It overrides a model-supplied value, and `tools/list`
   then marks the param optional, as the hosted server does.
6. **Hardcoded `API_BASE_URL = 'https://api.blindpay.com'`** instead of the
   generator's `process.env.API_BASE_URL || ''`.
7. **`SERVER_NAME = '@blindpay/mcp'`**, kept alongside the `__SERVER_VERSION__`
   marker described above.

## Parity with the hosted server

`https://mcp.blindpay.com/mcp` is generated in-process from the same public
spec (blindpay-v2 `apps/api/src/shared/public-mcp`). Keep this package 1:1
with it. When one of these changes there, change it here too:

- **Required bodies.** Hosted requires `requestBody` whenever its schema has
  required fields; `openapi-mcp-generator` only honors the spec flag, so
  `sync.mts` sets the flag first (`requireBodiesWithRequiredFields`).
- **Instructions.** `SERVER_INSTRUCTIONS` is hosted `instructions.ts` word
  for word, except the sentence about the instance id.
- **Webhook resources.** Same names, URIs and text as hosted
  `webhook-resources.ts`; the data comes from the spec's `webhooks` section.
- **Readonly profile.** GET tools minus `READ_ONLY_EXCLUDED_PATHS`, the
  same list `/mcp/readonly` uses.
- **Tool results.** `HTTP <status>` then the full body, `isError` on 4xx/5xx.

Deliberate differences:

- The instance param stays required without `BLINDPAY_INSTANCE_ID`
  (nothing else can fill it in).
- `BLINDPAY_INSTANCE_ID` also fills `PostV1Presign`'s `instance_id` query
  param, as 1.8.0 did; hosted requires it.
- A non-JSON response body (a load balancer's HTML error page; the API
  itself answers in JSON) is cut at 2,000 characters. Hosted calls the API
  in-process, so it never sees one.
- `SERVER_NAME`, and the version, which is this package's npm semver, not
  the hosted tool-surface one.

Regenerate from the public spec the way blindpay-v2's `mcp-sync.yml` builds
it: `bun scripts/openapi-public-filter.ts --in apps/api/openapi.json --out
<file>` in blindpay-v2, then `npm run sync -- --spec <file>` here. The same
file belongs on the `api-sync-data` branch, or the next `api-sync` run
regenerates from an older spec.

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

`scripts/sync.mts` compares the build against the committed one: **none**
if `src/index.ts` would come out identical (re-syncing the same spec is a
no-op), else **minor** if any tool name was added or removed, else
**patch**. Never major, that's a deliberate human decision made directly in
`package.json` outside the sync pipeline.

## Claude directory plugin and connector

`plugins/blindpay` is submitted to Anthropic's directory as a plugin bundle,
and `https://mcp.blindpay.com/mcp/readonly` as an MCP connector. Two rules
the directory enforces and this repo can break:

- **Read-only only.** The directory refuses connectors that transfer money,
  so the plugin's `.mcp.json` may only point at `/mcp/readonly`. The full
  `/mcp` server stays in the root `.mcp.json` for Claude Code users and is
  never submitted to the directory.
- **Listing fields live in `plugin.json`.** The listing reads `icon`,
  `documentationUrl`, `supportUrl`, `privacyPolicyUrl` and
  `termsOfServiceUrl` from `plugins/blindpay/.claude-plugin/plugin.json`.
  Claude Code ignores them, so dropping one raises no error anywhere except
  `npm run check-plugin`. The org plugin library doesn't render `icon` yet
  (anthropics/claude-code#100818).

Listing copy for both submissions is in `assets/LISTING.md`.

Run `npm run check-connector` before a directory submission and after any
auth change in blindpay-v2 or Clerk. It checks what the OAuth clients of
Claude, VS Code and ChatGPT need and the MCP spec doesn't spell out: a 401 with a `resource_metadata`
pointer, `resource` equal to the URL exactly, CIMD with public-client auth
(Clerk has no DCR endpoint), S256, `invalid_grant` on a bad refresh token, and
that claude.ai's, Claude Code's, VS Code's and ChatGPT's client metadata
documents reach the sign-in page while an undeclared redirect is refused.
ChatGPT asks for every OIDC scope the authorization server advertises, so
the probe sends those too.
