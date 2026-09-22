# ChatGPT / Codex Plugins Directory — draft submission

Portal: https://platform.openai.com/plugins → Create plugin → **With MCP**.
Reference: https://developers.openai.com/plugins/deploy/submission and .../app-review

## Prerequisites (owner)
- Business identity verified in the OpenAI Platform under the BlindPay org; submitter has **Apps Management** write access in the same org/project.
- Developer Mode enabled in the ChatGPT workspace; server tested end to end as a connector.
- Domain verification: portal issues a token; serve it as plain text at `https://mcp.blindpay.com/.well-known/openai-apps-challenge` (blindpay-v2 change) or at `https://blindpay.com/.well-known/openai-apps-challenge` (www change).

## Info
- Plugin name: `BlindPay`
- Short description: `Read-only view of your BlindPay stablecoin payment operations.`
- Long description: same text as the Claude listing description (`claude.md`, "Description").
- Developer identity: BlindPay (business)
- Logo: `assets/logo-512.png`
- Category: Finance
- Website `https://blindpay.com` · Support `mailto:eric@blindpay.com` · Privacy `https://blindpay.com/privacy-policy` · Terms `https://blindpay.com/terms-of-service`

## MCP
- URL type: Universal
- MCP Server URL: `https://mcp.blindpay.com/mcp/readonly`
- Auth: OAuth 2.1 (CIMD) against `https://clerk.blindpay.com`; demo credentials from the reviewer account (no MFA/email code, see `README.md`).
- CSP: not applicable (no UI components).
- Scan Tools → 43 tools; every tool has `readOnlyHint: true`, `destructiveHint: false`, `openWorldHint: true`.
- Workspace domain restrictions: Clerk advertises `openid` and `email` scopes; confirm a UserInfo endpoint returning `email` and `email_verified` if OpenAI asks.

## Starter prompts
- "What's the status of payout po_… and when was it last updated?"
- "List the payouts on my instance from the last 7 days and group them by status."
- "Show the balance and yield history of wallet wa_… ."
- "Which bank rails and required bank details does BlindPay support for Brazil?"
- "Do any of my receivers have an open RFI or a pending limit increase?"

## Positive test cases (5)
| # | Prompt | Expected tool | Expected result | Fixture |
| --- | --- | --- | --- | --- |
| 1 | "List my payouts" | `GetV1InstancesPayouts` | Table of payouts with id, amount, status | 3 payouts on the review instance |
| 2 | "Show payout {id}" | `GetV1InstancesPayoutsById` | Single payout with tracking/status fields | payout id from fixture |
| 3 | "What rails are available?" | `GetV1AvailableRails` | List of rails with countries and currencies | none |
| 4 | "Balance of wallet {id}" | `GetV1InstancesCustomersWalletsBalance` | Token balances for the wallet | 1 wallet with balance |
| 5 | "List receivers and their bank accounts" | `GetV1InstancesCustomers`, `GetV1InstancesCustomersBankAccounts` | Two receivers, each with bank accounts | 2 receivers |

## Negative test cases (3)
| # | Prompt / scenario | Expected behavior | Why |
| --- | --- | --- | --- |
| 1 | "Send 500 USDC to receiver {id}" | No tool available; model explains this plugin is read-only and points to app.blindpay.com | Directory bans money movement; write tools are not exposed |
| 2 | "Create a new receiver named X" | Same as above | No POST tools on this surface |
| 3 | Call any tool with an instance id the user is not a member of | HTTP 401/403 error result, no data | Access is bound to the OAuth grant's instance and role |

## Global
- Availability: [owner decides; start with US and BR, or all countries where BlindPay onboards customers]

## Release notes
Initial submission. Read-only MCP server (43 GET tools) for BlindPay, a stablecoin API for global payments. Test account details in the credentials field. The full server with write tools exists at `/mcp` but is deliberately not submitted.

## Policy checks
- No tool collects card numbers or government IDs; KYC happens in the BlindPay dashboard.
- No transaction is initiated from the plugin; any "how do I pay" question links out to `https://app.blindpay.com`.
- Tool responses: review `GetV1InstancesWebhookEndpointsSecret` (returns a secret) and exclude it from the read-only surface before Scan Tools.
