# OpenAI Plugins Directory submission: BlindPay

Brief for Codex. Use these values to run the `$chatgpt-app-submission` skill (OpenAI Developers plugin) in this repo and produce `chatgpt-app-submission.json`. Use the values below exactly as written. If a field is not covered here, stop and ask; do not make one up.

## Hard rule: submit the read-only server

OpenAI's plugin guidelines list "Execution of money transfers, crypto transfers, or investment trades" as a prohibited service. The full endpoint `https://mcp.blindpay.com/mcp` creates payouts and transfers, so it would be rejected.

- Server URL for every field: `https://mcp.blindpay.com/mcp/readonly`
- Auth: OAuth 2.1 with PKCE (sign in with a BlindPay account, then pick an instance)
- Surface: 44 GET tools, annotated `readOnlyHint: true`, `destructiveHint: false`, `openWorldHint: true`. Only wallet message signing and the webhook signing secret are excluded. `/mcp/readonly` is shared with every client that uses it (Claude, auth.md discovery), so this submission must match it as deployed; responses are returned in full. Rebuild the `tools` block in `chatgpt-app-submission.json` from the public server card (`https://mcp.blindpay.com/.well-known/mcp/server-card.json`: read-only tools minus those two) whenever the API changes.
- Copy must never say the plugin sends, pays, or moves money.

## Step 1: Info

| # | Field | Value | Notes |
| --- | --- | --- | --- |
| 1 | Directory icon | `assets/icon-square-1024.png` | Square PNG, at least 256 × 256. Full bleed, the directory rounds the corners. If the preview looks cropped, use `assets/icon-512.png`. |
| 2 | ChatGPT composer icon | `assets/icon-square-128.png` | Square PNG, at least 48 × 48. |
| 3 | Name | `BlindPay` | |
| 4 | Version | `1.0.0` | First OpenAI submission. Separate from the npm version (1.8.0). Bump it on each resubmission. |
| 5 | Subtitle | `Track stablecoin payments` | 25 of 30 characters. Plain, functional. |
| 6 | Description | see below | Public on the directory page. |
| 7 | Category | `Finance` | If there is no finance option, use `Business`. |
| 8 | Developer Identity | The verified BlindPay business | Not a personal identity. |
| 9 | Plugin Author | `Blind Pay, Inc.` | **Unconfirmed.** The privacy policy names both "Blind Pay, Inc." and "Blind Pay, LLC". This must match the verified identity from field 8 character for character. |
| 10 | Website URL | `https://blindpay.com` | |
| 11 | Customer support URL | `https://blindpay.com/contact` | `/support` and `/help` return 404. Support email: `support@blindpay.com`. |
| 12 | Privacy policy URL | `https://blindpay.com/privacy-policy` | `/privacy` returns 404. |
| 13 | Terms of Service URL | `https://blindpay.com/terms-of-service` | `/terms` returns 404. |
| 14 | Demo Recording URL | *(pending)* | Record the demo and add an accessible link before submission. |
| 15 | Commerce & Purchasing | Unchecked | The plugin sells nothing and links to no checkout. |

### Description (field 6)

```
Check your BlindPay stablecoin payment operations without leaving ChatGPT. Look up payouts, payins and transfers and their status, see wallet balances and yield, review customers, bank accounts and virtual accounts, and check fees, limits and the payment rails available in each country.

Sign in with your BlindPay account and pick the instance you want to query. The plugin only reads data: it cannot send payouts, move funds or change any setting. It is made for teams already using BlindPay who want quick answers about their payment activity.
```

Every claim maps to a tool on `/mcp/readonly`. Do not add speed or "best" claims.

## Test prompts (Prompts and Testing steps, and the demo video)

| Prompt | Expected result |
| --- | --- |
| List my last 5 payouts with their status and amount. | Calls the payouts list tool and returns 5 payouts with status and amount. |
| What is the balance of each wallet for my first customer? | Lists customers, then the wallet balance tool for the first one. |
| Which payment rails can I use to pay out to Brazil? | Calls the available rails tool and lists the Brazil rails. |
| Send 100 USDC to my first receiver. | Declines: no tool can move money. Shows the reviewer the plugin is read-only. |

Demo recording steps (for the human, not Codex): ChatGPT Settings, then Apps, then Advanced, then turn on Developer mode. Create an app with the URL `https://mcp.blindpay.com/mcp/readonly` and OAuth. Record the connect and sign-in, then the four prompts. Upload to Loom or Google Drive ("anyone with the link").

## Other steps (prep only, these screens were not reviewed)

- **MCP:** URL and auth as above.
- **Testing:** OpenAI requires "a login and password for a fully featured demo account" and rejects 2FA the reviewer cannot complete. A dedicated reviewer user is needed (email and password, no MFA) with access to one test instance that has sample payouts and payins. The human supplies the credentials; never write them into this repo.
- **Global:** English listing. BlindPay serves 100+ countries.

## Before submitting

- Rebuild the `tools` block from the live server card if the API shipped new GET endpoints since the last rebuild.
- Personal data risk: OpenAI says plugins must not collect government IDs. `GetV1InstancesCustomersById`, `GetV1InstancesOnboardingOwnershipDocuments` and the bank account tools can return tax IDs, document data and account numbers. The reviewer may flag this; the fix would live in `READ_ONLY_EXCLUDED_PATHS` in blindpay-v2 (closed attempt: blindpay-v2 #2548).
- Provide a dedicated reviewer account with a password and no MFA, plus sample data in a test instance. Never commit or send credentials in chat; enter them directly in the submission portal.
- Record and upload the demo video to Loom or Google Drive with link access.
- Verify that the privacy policy covers the data categories, recipients, and user controls required by OpenAI.

## Asset files

All under `assets/` in this repo. File map and per-store usage: `assets/README.md`. Shared listing copy: `assets/LISTING.md`.
