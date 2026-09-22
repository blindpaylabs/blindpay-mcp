# Claude Connectors Directory — draft listing

Portal: https://claude.ai/admin-settings/directory/submissions/new (Team/Enterprise org Owner only).
Submit the **read-only** server. Reference: https://claude.com/docs/connectors/building/submission

## Connection
- Server URL: `https://mcp.blindpay.com/mcp/readonly`
- Transport: Streamable HTTP
- Reach: Universal URL

## Tools
Synced from the server. 43 tools, all `readOnlyHint: true`, all with `title`.
Before submitting, exclude `GetV1InstancesCustomersBlockchainWalletsSignMessage`
and `GetV1InstancesWebhookEndpointsSecret` from the read-only surface (see README).

## Listing
- Name: `BlindPay`
- Tagline (≤55): `Stablecoin payments data for your BlindPay instance`
- Description (≤2000):

  BlindPay is a stablecoin API for global payments. This connector gives Claude
  read-only access to your BlindPay instance so you can ask about your payment
  operations in plain language: look up receivers, bank accounts, blockchain
  wallets and virtual accounts; check wallet balances and yield history; review
  payouts, payins and transfers and their current status; inspect fees, limits,
  RFI (request for information) status and webhook endpoints; and browse the
  bank rails, SWIFT codes and NAICS codes BlindPay supports.

  The connector never moves money. It exposes only GET operations of the
  BlindPay API, each annotated `readOnlyHint: true`. To create payouts, payins
  or receivers, use the BlindPay dashboard at app.blindpay.com or the full MCP
  server for developer tools (see docs).

  You sign in with your BlindPay account (OAuth 2.1). Access is scoped to the
  instance you pick during connection and to your role on it. Disconnect at any
  time from the BlindPay dashboard under Connected apps.

- Categories: Finance; Developer tools; Data & analytics
- Documentation URL: `https://github.com/blindpaylabs/blindpay-mcp#readme` (or a blindpay.com/docs page before publish)
- Privacy policy URL: `https://blindpay.com/privacy-policy`
- Terms URL: `https://blindpay.com/terms-of-service`
- Support contact: `eric@blindpay.com`
- Icon: `assets/logo-512.png` in this repo
- Slug: `blindpay` (permanent)

## Use cases
- Primary: check the status of a payout, payin or transfer; list recent payouts for a receiver; check a wallet balance; look up which rails and bank details a country supports; review fees and limits on the instance.
- Prerequisites: a BlindPay account (app.blindpay.com) with at least one instance.
- Reads data only.

## Company
- BlindPay, `https://blindpay.com`
- Primary contact: [Owner name], [owner email]

## Authentication
- OAuth 2.1 with **client ID metadata documents** (CIMD). Authorization server: `https://clerk.blindpay.com`.
  PRM: `https://mcp.blindpay.com/.well-known/oauth-protected-resource/mcp/readonly`.
- No dynamic client registration (deliberate; enable on Clerk if the reviewer's client cannot use CIMD).
- Server requires auth from the first request.

## Data handling
- First-party API (api.blindpay.com), same company, same domain.
- No health data, no sponsored content.

## Test & launch
Reviewer account (owner creates):
- Development instance `in_...` on a dedicated account, e.g. `mcp-review@blindpay.com`.
- Sign-in without email code or 2FA (see README blocker 1). Credentials: [to be filled by owner, share via portal only].
- Populated with: 2 receivers (one individual, one business) with bank account and blockchain wallet; 3 payouts in different statuses; 2 payins; 1 virtual account; 1 webhook endpoint.
- Steps: connect `https://mcp.blindpay.com/mcp/readonly` → sign in → choose the review instance on the consent screen → back in Claude ask "list my payouts".
- Confirmation: every tool exercised via MCP Inspector and as a custom connector in Claude on [date].

## Compliance (seven acknowledgments)
1. Directory guidelines: yes.
2. First-party API: yes, api.blindpay.com.
3. Financial transactions: **the read-only server does not transfer money or assets**. Transfer tools live on the separate `/mcp` endpoint, which is not submitted. See `anthropic-4a-email.md` if we later want them listed.
4. AI media generation: none.
5. Prompt injection: tool descriptions are the OpenAPI operation descriptions; no behavioral instructions.
6. Conversation data: the server receives only tool arguments; no chat history, memory or files.
7. Public documentation: README in the public repo; a blindpay.com/docs page before publish.
