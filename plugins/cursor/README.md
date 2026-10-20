# BlindPay for Cursor

Connects Cursor to the official hosted [BlindPay](https://blindpay.com) MCP server, the stablecoin API for global payments.

## Setup

1. In the BlindPay dashboard at https://app.blindpay.com, open your instance and create a key under **API Keys**. The key decides which instance the tools act on.
2. In Cursor, open the plugin's settings (**Plugins**, then **Configure**) and set `BLINDPAY_API_KEY` to that key.

## Servers

| Server | URL | Tools |
| --- | --- | --- |
| `blindpay` | `https://mcp.blindpay.com/mcp` | Every public API operation, including ones that create payouts and move funds |
| `blindpay-readonly` | `https://mcp.blindpay.com/mcp/readonly` | GET operations only, so nothing can be created, changed or sent |

Turn off `blindpay` in Cursor's MCP settings if the agent should only read data. A development instance key is the safe way to try the full server.

## Example prompts

- List my last 5 payouts with their status and amount.
- Which payment rails can I use to pay out to Brazil?
- Get a quote to send 1,000 USDC as BRL to my first receiver.

Docs: https://blindpay.com/docs. Source and issues: https://github.com/blindpaylabs/blindpay-mcp.
