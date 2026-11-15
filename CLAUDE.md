# BlindPay MCP - Agent Reference

## Commands

```
npm run typecheck        # tsc --noEmit
npm run build            # tsc + chmod the entry point
npm run generate         # Raw openapi-mcp-generator dump to /tmp/mcp-generated (debugging only)
npm run sync              # Full deterministic pipeline: writes src/index.ts, package.json and the store manifests' versions
npm run sync:check        # Same pipeline, but diffs against committed files instead of writing (exit 2 on diff)
npm run check-tool-names  # Static gate: fails if any committed tool name exceeds 52 chars
npm run check-plugin      # Static gate: fails if plugins/blindpay breaks a Claude directory rule
npm run check-openai-plugin  # Static gate: fails if plugins/openai breaks an OpenAI submission limit or leaves /mcp/readonly
npm run check-versions    # Static gate: fails if a store manifest's version differs from package.json
npm run check-connector   # Live check: walks the OAuth sign-in of Claude, Claude Code, VS Code, ChatGPT, Cursor and Grok Build against mcp.blindpay.com/mcp/readonly (not in CI)
npm test                  # Unit tests for scripts/lib, plus stdio wire tests for both MCP eras (node:test via tsx)
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
   - runs `openapi-mcp-generator` against the spec,
   - extracts its `toolDefinitionMap` block,
   - deterministically shortens any tool name over 52 chars (see below),
   - rebuilds every tool's `inputSchema` from the spec the way the hosted
     server does (see "Parity with the hosted server"),
   - splices that map, plus the spec's webhook events, into
     `src/index.template.ts` to produce `src/index.ts`,
   - picks the version bump (see "Version bump") and writes that version
     into `package.json`, `SERVER_VERSION` and the store manifests.
   Any spec shape the script can't map (missing map markers, a name it
   can't shorten under the limit, a duplicate name, a tool or parameter the
   generator and the hosted server's schema don't agree on) is a hard
   failure, not a best guess.
3. CI (`ci.yml`, required on `main`) typechecks, builds and re-checks the
   52-char limit and the manifest versions. The PR on the `api-sync` branch
   is opened/updated and `gh pr merge --auto --squash` is set on it, so it
   merges itself once CI is green, no human step.
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
                            # -> rename -> input schemas -> splice -> version bump.
scripts/check-tool-names.mts  # Standalone 52-char gate, used by ci.yml too.
scripts/check-versions.mts  # Manifest version gate, used by ci.yml.
scripts/lib/manifest-versions.mts  # The store manifests that follow
                            # package.json's version, and the pure helpers
                            # sync.mts writes them with and check-versions
                            # checks them with; manifest-versions.test.mts
                            # next to it.
scripts/lib/tool-map.mts    # Pure helpers (extraction, renaming, the
                            # input-schema swap, semver bump) used by both
                            # scripts above, with tool-map.test.mts next to it.
scripts/lib/openapi.mts     # Ports of the hosted server's spec helpers
                            # (dereference, input schemas, webhook events),
                            # with openapi.test.mts next to it.
scripts/stdio-server.test.mts  # Wire tests: spawns src/index.ts and speaks
                            # raw JSON-RPC in both MCP eras (2026-07-28 and
                            # the 2025 initialize fallback). Runs in npm test.
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
                            # .cursor-plugin/marketplace.json. OAuth through
                            # the pre-registered public Clerk client
                            # 4c2rAa08DqbVvnon (Clerk has no DCR, Cursor no
                            # CIMD); scopes must stay explicit. Its plugin.json
                            # version follows package.json (sync writes it).
.grok-plugin/               # Grok Build plugin, listed through
                            # xai-org/plugin-marketplace pinned to a commit.
                            # mcp.json signs in through the pre-registered
                            # public Clerk client S8w7ZxvMOl4Ws5LL (Grok has
                            # no CIMD and falls back to DCR); scopes must stay
                            # explicit. It's registered with
                            # http://127.0.0.1:8789/callback and Clerk matches
                            # 127.0.0.1 on any port, so mcp.json pins no
                            # callbackPort: Grok picks a free one. A change here
                            # needs a version bump, since xAI's daily pin bot
                            # only advances the commit when the version moves.
                            # The root .mcp.json stays client-free for Claude
                            # Code, which uses CIMD.
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
   generated tool entries (renamed where needed, schemas rebuilt from the
   spec). Never hand-edit tool entries, not even in the template, fix them
   upstream in the API spec. `WEBHOOK_EVENTS` works the same way through
   `/* __WEBHOOK_EVENTS__ */`.
3. **Helpers + entrypoint** (`instanceParamName`, `clientInputSchema`,
   `buildServer`, `registerWebhookResources`, `acquireOAuth2Token`,
   `executeApiTool`, `formatResponseBody`, `formatApiError`,
   `unsupportedVersionError`, `versionCheckedStdioTransport`, `main`,
   `cleanup`). Fully hand-written, never touched by the sync script. This is
   where you add new customizations.

## Customizations baked into the template

These used to be a checklist a human (or an LLM) had to remember to
preserve on every merge. Now they're just what the template says, so they
can't drift:

1. **MCP SDK v2 (`@modelcontextprotocol/server`), served by `serveStdio`.**
   The generator emits a v1 `@modelcontextprotocol/sdk` `Server` with raw
   ListTools/CallTool handlers; the template instead builds an `McpServer`
   in `buildServer()`, one `registerTool` per profile tool, and `main()`
   hands that factory to `serveStdio`. `serveStdio` serves MCP 2026-07-28
   natively (`server/discover`, per-request `_meta`, `resultType`,
   `ttlMs`/`cacheScope`) and still answers a 2025-era `initialize` from the
   same factory, so older clients keep working. Don't go back to a
   hand-wired `StdioServerTransport` + `connect`: that path is 2025-only
   (the one `StdioServerTransport` left is the one wrapped below, handed to
   `serveStdio`). `main()` passes `serveStdio` a `versionCheckedStdioTransport()`, which
   answers -32022 to any request whose `_meta` names a revision outside
   `MODERN_PROTOCOL_VERSIONS`: the spec checks the version on every request,
   and `serveStdio` 2.4.0 only checks the opening one. Keep
   `MODERN_PROTOCOL_VERSIONS` equal to what `server/discover` answers (a test
   fails when they drift), and delete the wrapper once the SDK checks every
   request itself. `buildServer()` advertises `listChanged: false` for tools
   and resources: both are fixed for the life of the process, and the SDK's
   default `true` promises notifications it never sends.
2. **No `eval` in argument validation.** Each tool's schema goes through
   `fromJsonSchema(schema, new CfWorkerJsonSchemaValidator())`. The SDK's Node
   default (Ajv) compiles schemas with `new Function`, and the generator's
   stock `json-schema-to-zod` uses `eval()`; don't switch to either. The SDK
   rejects invalid arguments (and unknown tools) before `executeApiTool`
   runs, as on the hosted server.
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

- **Input schemas.** Hosted keeps the spec's schemas as they are (integer
  types, examples) and requires `requestBody` whenever its schema has required
  fields. `openapi-mcp-generator` turns integer into number, drops examples,
  copies the body's description in and only honors the spec's `required`
  flag, so `sync.mts` swaps each generated schema for
  `inputSchemasFromOpenApi`'s.
- **Annotations.** The four hints derived from the HTTP verb; the title is
  only the tool's top-level `title`.
- **Instructions.** `SERVER_INSTRUCTIONS` and, for the readonly profile,
  `READ_ONLY_SERVER_INSTRUCTIONS` are hosted `instructions.ts` word for word,
  except the sentence about the instance id. The read-only text names no tool
  the read-only surface lacks.
- **Webhook resources.** Same names, URIs and text as hosted
  `webhook-resources.ts`; the data comes from the spec's `webhooks` section.
- **Readonly profile.** GET tools minus `READ_ONLY_EXCLUDED_PATHS`, the
  same list `/mcp/readonly` uses, and a top-level `trace_id` dropped from JSON
  responses, as `/mcp/readonly` does.
- **Tool results.** `HTTP <status>` then the full body, `isError` on 4xx/5xx.
- **Protocol.** Both run on SDK v2 and serve MCP 2026-07-28 with a 2025-era
  fallback (hosted through `createMcpHandler({ legacy: 'stateless' })`, this
  package through `serveStdio`). Hosted classifies each HTTP request on its
  own, so it checks the protocol version on every request; here
  `versionCheckedStdioTransport` does the same over one stdio connection.
  Neither sets `cacheHints`, so cacheable results carry the SDK default
  `ttlMs: 0`, `cacheScope: 'private'`.
  `scripts/stdio-server.test.mts` checks both eras on the wire and that they
  list the same tools and resources.

Deliberate differences:

- The instance param stays required without `BLINDPAY_INSTANCE_ID`
  (nothing else can fill it in). With it, the param's description says it
  comes from `BLINDPAY_INSTANCE_ID` where hosted says "your credential".
- `BLINDPAY_INSTANCE_ID` also fills `PostV1Presign`'s `instance_id` query
  param, as 1.8.0 did; hosted requires it.
- A non-JSON response body (a load balancer's HTML error page; the API
  itself answers in JSON) is cut at 2,000 characters. Hosted calls the API
  in-process, so it never sees one.
- `SERVER_NAME`, and the version, which is this package's npm semver, not
  the hosted tool-surface one.
- `capabilities.tools` and `capabilities.resources` say `listChanged: false`;
  hosted still advertises the SDK default `true` (its lists are fixed too,
  so it should follow).

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

The store manifests carry the same version, and `sync.mts` writes it into
them: `server.json` (MCP Registry), `gemini-extension.json` (Gemini CLI),
`.claude-plugin/plugin.json` and its `marketplace.json` entry (Claude Code),
`.grok-plugin/plugin.json` (Grok Build) and
`plugins/cursor/.cursor-plugin/plugin.json` (Cursor). Clients compare these
versions to decide whether an installed plugin has an update. A hand edit to
`package.json`'s version (a major bump, or a patch that ships a manifest-only
change such as listing copy or the Grok plugin's config) has to set
`SERVER_VERSION` in `src/index.ts` and these manifests to the same value by
hand: `npm run sync` would treat the edit as a changed build and bump again.
`npm run check-versions` fails CI until the manifests match. `plugins/blindpay`
and `plugins/openai` keep their own versions (see below).

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
the probe sends those too. Cursor and Grok Build sign in through their
pre-registered Clerk clients instead, on the callbacks those clients list.
`app.blindpay.com` answers scripts with a Cloudflare bot challenge, so a chain
that ends on that challenge at `app.blindpay.com` counts as reaching sign-in.
