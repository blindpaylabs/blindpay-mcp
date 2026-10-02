# BlindPay

![BlindPay](assets/logo.png)

Ask Claude about your [BlindPay](https://blindpay.com) stablecoin payment operations in plain language. This plugin gives Claude read-only access to the BlindPay instance you choose: look up payouts, payins and transfers and their status, check wallet balances and yield, review customers, bank accounts, blockchain wallets and virtual accounts, and see fees, limits and the payment rails available in each country.

## What it connects to

The plugin adds one remote MCP server, `https://mcp.blindpay.com/mcp/readonly`, run by BlindPay. It runs nothing on your machine and installs no packages.

- **Read-only.** The server exposes only GET operations of the BlindPay API. It cannot send payouts, move funds, create records or change settings.
- **Sign-in.** On first use, Claude opens a browser sign-in with your BlindPay account (OAuth 2.1). You pick the instance to connect on the consent screen, and access is limited to that instance and your role on it. No API key is stored in the plugin.
- **Data.** The server receives only the arguments of each tool call (for example a payout id) and returns data from the BlindPay API (`api.blindpay.com`). It does not receive your conversation history or files.
- **Disconnect** at any time from the BlindPay dashboard at [app.blindpay.com](https://app.blindpay.com).

## Example prompts

- "List my payouts from the last 7 days and group them by status."
- "What's the status of payout po_... ?"
- "Which payout rails does BlindPay support for Brazil, and what bank details does PIX need?"
- "Show the balance of each wallet on my instance."

## Included skill

`blindpay-payments` tells Claude how BlindPay's ids and endpoints fit together, so it picks the right tool and chains lookups (for example, rails before bank details).

## Requirements

A BlindPay account with at least one instance. Sign up at [blindpay.com](https://blindpay.com).

## Support

- Docs: [blindpay.com/docs](https://blindpay.com/docs)
- Contact: [blindpay.com/contact](https://blindpay.com/contact)
- Privacy policy: [blindpay.com/privacy-policy](https://blindpay.com/privacy-policy)
- Terms of service: [blindpay.com/terms-of-service](https://blindpay.com/terms-of-service)

## License

MIT, see [LICENSE](LICENSE).
