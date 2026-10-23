# OpenAI Plugins Directory submission: BlindPay

The directory now takes a ZIP, shared by ChatGPT and Codex. `npm run pack:openai` builds `build-plugins/blindpay-openai.zip` from `plugins/openai` plus the `blindpay-payments` skill. It holds the manifest (listing copy and review cases), `mcp.json` (the read-only server and its OAuth settings: CIMD, with `defaultScopes` pinned to `openid profile email offline_access`) and the icons. Upload it with **Create draft from ZIP**. In the portal you then connect the server, which runs the OAuth sign-in and domain verification, and enter the reviewer credentials, the demo recording URL and the attestations. The recording link isn't committed, because anyone with the link can watch it and this repo is public. `chatgpt-app-submission.json` is the earlier Apps SDK form, kept for its per-tool justifications.

Brief for Codex. Use these values to run the `$chatgpt-app-submission` skill (OpenAI Developers plugin) in this repo and produce `chatgpt-app-submission.json`. Use the values below exactly as written. If a field is not covered here, stop and ask; do not make one up.

## Rejected on 2026-10-22: the reviewer couldn't sign in

Version 1.1.6 came back "Changes required" with one reason: "We're unable to complete your sign-in or OAuth flow. Please ensure valid, working credentials are included and that they include no additional setup or verification to access your service."

- **The package.** 1.1.6 was the Oct 6 Codex-layout ZIP (`.codex-plugin/plugin.json` plus a `.mcp.json` listing only the URL). Its MCP card in the portal still shows "Endpoint unavailable" and "Configuration incomplete", and no tools were discovered, so the server connection was never completed. 1.2.0 is the Agent Plugins package in `plugins/openai`: a `streamable-http` server with its OAuth settings declared. `npm run check-openai-plugin` gates it in CI.
- **The OAuth flow.** Clerk returns `iss` on authorization responses, so ChatGPT signs in as `https://chatgpt.com/oauth/client.json` with the redirect `https://chatgpt.com/connector_platform_oauth_redirect`. By default it also asks for the OIDC scopes the authorization server advertises. Clerk answers `invalid_scope` if that client asks for `public_metadata` or `private_metadata`, which it also advertises, so `mcp.json` pins `defaultScopes`. `npm run check-connector` walks ChatGPT's request to the BlindPay sign-in page.
- **The credentials.** Clerk signs in with email and password, an email code, a passkey, or Google, GitHub or Apple, and MFA is off. A reviewer can only get in without "additional verification" with a **password**. An account that has only an email code, a social login or a passkey fails the way 1.1.6 did. Clerk's `+clerk_test` addresses and their fixed code `424242` need test mode, which is off by default on production instances and which Clerk calls "highly discouraged" there. A code step is still extra verification, too. The account also needs:
  - an instance to pick on the consent screen, with no unfinished onboarding;
  - sample payouts, payins, customers, bank accounts and blockchain wallets, the data the five review cases read.
- **Before resubmitting.** Sign in to ChatGPT in developer mode with the reviewer credentials (Settings, Apps, Advanced, Developer mode, then create an app with the server URL and OAuth). Run the five positive prompts. Only then submit.

## Hard rule: submit the read-only server

OpenAI's plugin guidelines list "Execution of money transfers, crypto transfers, or investment trades" as a prohibited service. The full endpoint `https://mcp.blindpay.com/mcp` creates payouts and transfers, so it would be rejected.

- Server URL for every field: `https://mcp.blindpay.com/mcp/readonly`
- Auth: OAuth 2.1 with PKCE (sign in with a BlindPay account, then pick an instance)
- Surface: 42 GET tools, annotated `readOnlyHint: true`, `destructiveHint: false`, `openWorldHint: true`. Wallet message signing, the webhook signing secret and the webhook portal-access link are excluded, and JSON responses come back without a top-level `trace_id`. `/mcp/readonly` is shared with every client that uses it (Claude, auth.md discovery), so this submission must match it as deployed; responses are returned in full. Rebuild the `tools` block in `chatgpt-app-submission.json` from the public server card (`https://mcp.blindpay.com/.well-known/mcp/server-card.json`: read-only tools minus those three) whenever the API changes.
- Copy must never say the plugin sends, pays, or moves money.

## Step 1: Info

| # | Field | Value | Notes |
| --- | --- | --- | --- |
| 1 | Directory icon | `assets/icon-square-1024.png` | Square PNG, at least 256 × 256. Full bleed, the directory rounds the corners. If the preview looks cropped, use `assets/icon-512.png`. |
| 2 | ChatGPT composer icon | `assets/icon-square-128.png` | Square PNG, at least 48 × 48. |
| 3 | Name | `BlindPay` | |
| 4 | Version | `1.2.0` | 1.1.2 to 1.1.6 were uploaded from Oct 6 builds. Separate from the npm version. Raise it on every resubmission. |
| 5 | Subtitle | `Read-only BlindPay payments` | 27 of 30 characters. Says read-only up front, as 1.1.6 did. |
| 6 | Description | see below | Public on the directory page. |
| 7 | Category | `Finance` | If there is no finance option, use `Business`. |
| 8 | Developer Identity | The verified BlindPay business | Not a personal identity. |
| 9 | Plugin Author | `Blind Pay, Inc.` | The verified developer identity in the portal. `author.name` and `developerName` in `plugins/openai/plugin.json` match it character for character. |
| 10 | Website URL | `https://blindpay.com` | |
| 11 | Customer support URL | `https://blindpay.com/contact` | `/support` and `/help` return 404. Support email: `support@blindpay.com`. |
| 12 | Privacy policy URL | `https://blindpay.com/privacy-policy` | `/privacy` returns 404. |
| 13 | Terms of Service URL | `https://blindpay.com/terms-of-service` | `/terms` returns 404. |
| 14 | Demo Recording URL | Entered in the portal | The Google Drive recording submitted with 1.1.6. It isn't committed, because anyone with the link can watch it. Re-record it if the sign-in or consent screens change. |
| 15 | Commerce & Purchasing | Unchecked | The plugin sells nothing and links to no checkout. |

### Description (field 6)

```
Check your BlindPay stablecoin payment operations without leaving ChatGPT. Look up payouts, payins and transfers and their status, see wallet balances and yield, review customers, bank accounts and virtual accounts, and check fees, limits and the payment rails available in each country.

Sign in with your BlindPay account and pick the instance you want to query. The plugin only reads data: it cannot send payouts, move funds or change any setting. It is made for teams already using BlindPay who want quick answers about their payment activity.
```

Every claim maps to a tool on `/mcp/readonly`. Do not add speed or "best" claims.

## Test prompts (Prompts and Testing steps, and the demo video)

The review cases live in `plugins/openai/plugin.json` (`extensions.com.openai.review.test_cases`), and `chatgpt-app-submission.json` mirrors them.

- **Positive (5):**
  - recent payouts grouped by status;
  - one payout's details;
  - payout rails and the bank details PIX needs;
  - the first two customers' blockchain wallets;
  - customers and the first one's bank accounts.
- **Negative (3):** send 500 USDC, create a customer, delete webhook endpoints. Each is answered with a refusal.

Demo recording steps (for the human, not Codex):

1. In ChatGPT, open Settings, then Apps, then Advanced, and turn on Developer mode.
2. Create an app with the URL `https://mcp.blindpay.com/mcp/readonly` and OAuth.
3. Record the connect and sign-in, then the five positive prompts and one negative.
4. Share the recording on Google Drive or Loom with link access, and paste the link in the portal.

## Other steps (prep only, these screens were not reviewed)

- **MCP:** URL and auth as above.
- **Testing:** OpenAI requires "a login and password for a fully featured demo account" and rejects any step the reviewer cannot complete. Use a dedicated reviewer user that signs in with email and password and has no MFA. It needs access to one instance with the sample data listed under the rejection notes above. Enter the credentials in the portal only, never in this repo or in chat.
- **Global:** English listing. BlindPay serves 100+ countries.

## Before submitting

- Rebuild the `tools` block from the live server card if the API shipped new GET endpoints since the last rebuild.
- Personal data risk: OpenAI says plugins must not collect government IDs. `GetV1InstancesCustomersById`, `GetV1InstancesOnboardingOwnershipDocuments` and the bank account tools can return tax IDs, document data and account numbers. The reviewer may flag this; the fix would live in `READ_ONLY_EXCLUDED_PATHS` in blindpay-v2 (closed attempt: blindpay-v2 #2548).
- Sign in to ChatGPT developer mode with the reviewer credentials and run the five positive prompts.
- Reuse the 1.1.6 demo recording unless the sign-in or consent screens changed, and paste its link in the portal.
- Verify that the privacy policy covers the data categories, recipients, and user controls required by OpenAI.

## Asset files

All under `assets/` in this repo. File map and per-store usage: `assets/README.md`. Shared listing copy: `assets/LISTING.md`.
