# BlindPay for Cursor

Connects Cursor to the official hosted [BlindPay](https://blindpay.com) MCP server, the stablecoin API for global payments.

## Setup

1. Install the plugin, then open Cursor's MCP settings and select **Needs login** next to `blindpay` (and `blindpay-readonly` if you use it).
2. Sign in with your BlindPay account, pick the instance the agent may use, and allow access. No API key is involved.

Cursor can't register itself with BlindPay's sign-in, so the plugin carries BlindPay's public OAuth client ID for Cursor (`4c2rAa08DqbVvnon`) and the scopes `profile email offline_access`. Keep both: a request for any other scope fails with `invalid_scope`.

## Servers

| Server | URL | Tools |
| --- | --- | --- |
| `blindpay` | `https://mcp.blindpay.com/mcp` | Every public API operation, including ones that create payouts and move funds |
| `blindpay-readonly` | `https://mcp.blindpay.com/mcp/readonly` | GET operations only, so nothing can be created, changed or sent |

Turn off `blindpay` in Cursor's MCP settings if the agent should only read data. Picking a development instance at sign-in is the safe way to try the full server.

## Example prompts

- List my last 5 payouts with their status and amount.
- Which payment rails can I use to pay out to Brazil?
- Get a quote to send 1,000 USDC as BRL to my first customer's bank account.

Docs: https://blindpay.com/docs. Source and issues: https://github.com/blindpaylabs/blindpay-mcp.
