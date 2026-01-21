<h1>BlindPay MCP Server<img src="https://github.com/user-attachments/assets/c42b121d-adf1-467c-88ce-6f5be1efa93c" align="right" width="102"/></h1>

[![chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://discord.gg/2DFKYaxjpp)
[![twitter](https://img.shields.io/twitter/follow/blindpay?style=social)](https://twitter.com/intent/follow?screen_name=blindpay)
[![npm version](https://img.shields.io/npm/v/@blindpay/mcp.svg)](https://www.npmjs.com/package/@blindpay/mcp)

The official [Model Context Protocol](https://modelcontextprotocol.io/) server for [BlindPay](https://blindpay.com) - Stablecoin API for global payments.

## What This MCP Server Does

This MCP server provides AI coding assistants (Cursor, Claude Code, etc.) with access to BlindPay's stablecoin payment infrastructure. It exposes tools that allow AI assistants to:

- Create and manage receivers (individuals/businesses)
- Process payouts and payins on multiple blockchains
- Create quotes and get FX rates
- Manage virtual accounts and blockchain wallets
- Configure webhooks and API keys
- And more...

## Prerequisites

**Get your API key and Instance ID:**

1. [Create an account on BlindPay](https://app.blindpay.com/sign-up)
2. Create a development instance
3. Go to the [BlindPay Dashboard](https://app.blindpay.com/)
4. Select your instance and click on the **API Keys** tab
5. Create a new API key
6. Copy your instance ID (format: `in_xxxxxxxxxxxx`) from the dashboard url

## Installation

### Cursor

**One-click install:**

[Add MCP to Cursor](https://cursor.com/en-US/install-mcp?name=blindpay&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBibGluZHBheS9tY3AiXSwiZW52Ijp7IkJMSU5EUEFZX0FQSV9LRVkiOiJ5b3VyLWFwaS1rZXktaGVyZSIsIkJMSU5EUEFZX0lOU1RBTkNFX0lEIjoieW91ci1pbnN0YW5jZS1pZC1oZXJlIn19Cg==)

After installation, add your API key and instance ID to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "blindpay": {
      "command": "npx",
      "args": ["-y", "@blindpay/mcp"],
      "env": {
        "BLINDPAY_API_KEY": "your-api-key-here",
        "BLINDPAY_INSTANCE_ID": "your-instance-id-here"
      }
    }
  }
}
```

> **Note:** `BLINDPAY_INSTANCE_ID` is optional but recommended. When set, you won't need to specify the instance ID in every prompt. You can still override it per request if needed.

### Claude Code

Run the following command in your terminal:

```bash
claude mcp add --transport stdio blindpay --env BLINDPAY_API_KEY=your-api-key-here --env BLINDPAY_INSTANCE_ID=your-instance-id-here -- npx -y @blindpay/mcp
```

### Claude Desktop

Add to your Claude Desktop configuration file:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "blindpay": {
      "command": "npx",
      "args": ["-y", "@blindpay/mcp"],
      "env": {
        "BLINDPAY_API_KEY": "your-api-key-here",
        "BLINDPAY_INSTANCE_ID": "your-instance-id-here"
      }
    }
  }
}
```

## Example Prompts

Once configured, you can ask your AI assistant to interact with BlindPay:

```
"Get me a quote for sending 1000 USDC to a bank account in Brazil"

"List all my recent payouts from the last 7 days"

"Create a virtual account for receiver ID re_xxxxxxxxxxxx"

"Show me the available payment rails"

"Get all receivers" (instance_id is automatically used from environment if your environment variable is set)
```

## Documentation

- [Getting Started](https://blindpay.com/docs/getting-started/overview)
- [API Reference](https://api.blindpay.com/reference)

## Support

- Email: [eric@blindpay.com](mailto:eric@blindpay.com)
- Issues: [GitHub Issues](https://github.com/blindpaylabs/blindpay-mcp/issues)

## License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

Made with ❤️ by the [BlindPay](https://blindpay.com) team
