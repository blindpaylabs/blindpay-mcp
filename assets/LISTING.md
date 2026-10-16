# Listing copy

Paste these into store forms as written. When one changes, change it here and in `server.json`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` and `gemini-extension.json`.

## Identity

| Field | Value |
| --- | --- |
| Name | BlindPay |
| Registry name | `com.blindpay/mcp` |
| npm package | `@blindpay/mcp` |
| Remote URL | `https://mcp.blindpay.com/mcp` (Streamable HTTP, OAuth 2.1 with PKCE) |
| Local command | `npx -y @blindpay/mcp` (stdio, needs `BLINDPAY_API_KEY`) |
| Category | Finance / Payments |
| License | MIT |

## Descriptions

**Short (under 100 characters)**

> Official BlindPay MCP server: stablecoin payouts, payins, quotes and receivers for global payments.

**Long (2 sentences)**

> Connect your AI assistant to BlindPay to create receivers, quote FX rates, and send stablecoin payouts and payins across multiple blockchains. Sign in with your BlindPay account over OAuth, or run it locally with an API key and a readonly profile when the assistant must not move money.

**Tagline (under 40 characters)**

> Stablecoin payments for AI agents

## Links

| Field | URL |
| --- | --- |
| Website | https://blindpay.com |
| Docs | https://blindpay.com/docs |
| Repository | https://github.com/blindpaylabs/blindpay-mcp |
| Privacy policy | https://blindpay.com/privacy-policy |
| Terms of service | https://blindpay.com/terms-of-service |
| Support | support@blindpay.com |
| Security contact | security@blindpay.com |
| X | https://x.com/blindpay |
| LinkedIn | https://www.linkedin.com/company/blindpay |

## Claude directory (read-only)

Anthropic's directory doesn't accept connectors that transfer money, so the
Claude connector and the Claude plugin both use the read-only endpoint. Use
this copy instead of the descriptions above, which mention sending payouts.
`npm run check-plugin` fails if `plugins/blindpay` points anywhere else.

| Field | Value |
| --- | --- |
| Connector URL | `https://mcp.blindpay.com/mcp/readonly` |
| Authentication | OAuth with client ID metadata documents (CIMD) through `clerk.blindpay.com` |
| Plugin bundle | Repository `blindpaylabs/blindpay-mcp`, path `plugins/blindpay`, branch `main` |
| Slug | `blindpay` (permanent once published) |
| Category | Finance |
| Icon | `icon-square-1024.png` for the connector; the plugin reads `plugins/blindpay/assets/logo.png` |

**One-liner (under 200 characters)**

> Read-only access to your BlindPay stablecoin payment operations: payouts, payins, transfers, wallets, customers, bank accounts, fees, limits and payment rails.

**Description (under 2,000 characters)**

> Ask Claude about your BlindPay stablecoin payment operations in plain language. Sign in with your BlindPay account and pick the instance to connect. Claude can then look up payouts, payins and transfers and explain their status, check wallet balances and yield, review customers, bank accounts, blockchain wallets and virtual accounts, and show the fees, limits and payment rails available in each country. The connector is read-only: it can't send payouts, move funds, create records or change settings, and it never returns webhook signing secrets or signs wallet messages. Access is limited to the instance you choose and your role on it.

## Keywords

blindpay, stablecoin, payments, payouts, payins, fx, usdc, fintech, mcp

## Icons

See [README.md](./README.md). Default upload: `icon-square-1024.png`.
