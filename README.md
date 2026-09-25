<h1>BlindPay MCP Server<img src="./assets/logo-512.png" align="right" width="102"/></h1>

[![chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://discord.gg/2DFKYaxjpp)
[![twitter](https://img.shields.io/twitter/follow/blindpay?style=social)](https://twitter.com/intent/follow?screen_name=blindpay)
[![npm version](https://img.shields.io/npm/v/@blindpay/mcp.svg)](https://www.npmjs.com/package/@blindpay/mcp)
[![Install in VS Code](https://img.shields.io/badge/VS_Code-Install_MCP-0098FF?logo=visualstudiocode)](https://vscode.dev/redirect/mcp/install?name=blindpay&config=%7B%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fmcp.blindpay.com%2Fmcp%22%7D)

The official [Model Context Protocol](https://modelcontextprotocol.io/) server for [BlindPay](https://blindpay.com) - Stablecoin API for global payments.

## What This MCP Server Does

This MCP server provides AI assistants (Cursor, Claude Code, Codex, etc.) with access to BlindPay's stablecoin payment infrastructure. It exposes tools that allow AI assistants to:

- Create and manage receivers (individuals/businesses)
- Process payouts and payins on multiple blockchains
- Create quotes and get FX rates
- Manage virtual accounts and blockchain wallets
- Configure webhooks and API keys
- And more...

## Two ways to connect

| | Remote server (recommended) | Local `npx` server |
| --- | --- | --- |
| URL / command | `https://mcp.blindpay.com/mcp` | `npx -y @blindpay/mcp` |
| Auth | OAuth 2.1 sign-in with your BlindPay account (PKCE) | `BLINDPAY_API_KEY` env var |
| Transport | Streamable HTTP | stdio |
| Works in | Claude, ChatGPT, Cursor, VS Code, Grok, any remote-capable client | Any stdio MCP client |

Both expose the same tools. The remote server needs no API key: the client opens a browser, you sign in and pick an instance, and the token is scoped to your role on it.

### Tool profiles

Set `BLINDPAY_MCP_PROFILE` on the local server to choose which tools are exposed:

| Profile | Tools | Use when |
| --- | --- | --- |
| `full` (default) | Every public API operation, including payouts and transfers | Building or operating with an AI coding assistant |
| `readonly` | `GET` operations only: status, balances, quotes, history | Consumer assistants, or any place a tool that moves money is unwanted |

Every tool carries MCP annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`) derived from its HTTP verb, so clients can gate confirmations themselves.

## Prerequisites (local server only)

**Get your API key and Instance ID:**

1. [Create an account on BlindPay](https://app.blindpay.com/sign-up)
2. Create a development instance
3. Go to the [BlindPay Dashboard](https://app.blindpay.com/)
4. Select your instance and click on the **API Keys** tab
5. Create a new API key
6. Copy your instance ID (format: `in_xxxxxxxxxxxx`) from the dashboard url

**Dependencies you need to have installed:**

- [Node.js](https://nodejs.org/en/download)
- [Npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

You can check if you have Node.js installed by running `node -v`. Same for Npm, you can check by running `npm -v`.

## Installation

### Cursor

One-click install (remote server):

[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en-US/install-mcp?name=blindpay&config=eyJ1cmwiOiJodHRwczovL21jcC5ibGluZHBheS5jb20vbWNwIn0=)

One-click install (local server with API key):

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

### Claude Code

As a plugin (remote server, OAuth, no API key):

```bash
claude plugin marketplace add blindpaylabs/blindpay-mcp
claude plugin install blindpay@blindpay
```

Or as a plain MCP server:

```bash
claude mcp add --transport http blindpay https://mcp.blindpay.com/mcp
```

Local server with an API key:

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

### Codex

Remote server (OAuth, no API key):

```bash
codex mcp add blindpay --url https://mcp.blindpay.com/mcp
```

Local server with an API key:

```bash
codex mcp add blindpay --env BLINDPAY_API_KEY=your-api-key-here --env BLINDPAY_INSTANCE_ID=your-instance-id-here -- npx -y @blindpay/mcp
```

Or add to your `~/.codex/config.toml` (or project-scoped `.codex/config.toml`):

```toml
[mcp_servers.blindpay]
command = "npx"
args = ["-y", "@blindpay/mcp"]

[mcp_servers.blindpay.env]
BLINDPAY_API_KEY = "your-api-key-here"
BLINDPAY_INSTANCE_ID = "your-instance-id-here"
```

### VS Code

Click the **Install in VS Code** badge at the top, or add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "blindpay": {
      "type": "http",
      "url": "https://mcp.blindpay.com/mcp"
    }
  }
}
```

You can also search `@mcp blindpay` in the Extensions view once the gallery entry is live.

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "blindpay": {
      "serverUrl": "https://mcp.blindpay.com/mcp"
    }
  }
}
```

### Raycast

Open the **Model Context Protocol Registry** extension in Raycast, search for `BlindPay` and click **Install Server**. Or install manually with `Manage Servers → Add Server` using the local config from the Cursor section.

### Claude (claude.ai / Claude Desktop, remote)

In **Settings → Connectors → Add custom connector**, paste `https://mcp.blindpay.com/mcp` and complete the sign-in. Only read-only tools are exposed to consumer directories.

### ChatGPT

Enable **Developer Mode** in **Settings → Connectors → Advanced**, then **Create** a connector with `https://mcp.blindpay.com/mcp` and OAuth authentication.

### Grok

**Grok Build plugin (recommended):** install `blindpay` from the xAI plugin marketplace. The plugin ships both remote HTTP MCP endpoints:

| Server | URL | Scope |
| --- | --- | --- |
| `blindpay` | `https://mcp.blindpay.com/mcp` | Full (read + write) |
| `blindpay-readonly` | `https://mcp.blindpay.com/mcp/readonly` | Read-only |

Both use OAuth 2.1 (PKCE) with your BlindPay account — no API key to paste.

**Custom connector (paid Grok tier):** go to https://grok.com/connectors → **New Connector** → **Custom**, enter `https://mcp.blindpay.com/mcp` (or the readonly URL), leave client credentials empty, and complete the BlindPay sign-in when prompted.

### Gemini CLI

```bash
gemini extensions install https://github.com/blindpaylabs/blindpay-mcp
```

### Docker

Local stdio server in a container (also listed in the Docker MCP Registry):

```bash
docker run -i --rm -e BLINDPAY_API_KEY=your-api-key-here -e BLINDPAY_INSTANCE_ID=your-instance-id-here ghcr.io/blindpaylabs/blindpay-mcp
```

Build it yourself with `docker build -t blindpay-mcp .` from this repo.

### Any other MCP client

Remote: point the client at `https://mcp.blindpay.com/mcp` (Streamable HTTP, OAuth 2.1 discovery via `/.well-known/oauth-protected-resource`).
Local: run `npx -y @blindpay/mcp` over stdio with `BLINDPAY_API_KEY` set.

## Example Prompts

Once configured, you can ask your AI assistant to interact with BlindPay:

```
"Get me a quote for sending 1000 USDC to a bank account in Brazil"

"List all my recent payouts from the last 7 days"

"Create a virtual account for receiver with ID re_xxxxxxxxxxxx"

"Show me the available payment rails"

"Get all receivers for instance in_xxxxxxxxxxxx"
```

> [!TIP]
> You can specify `BLINDPAY_INSTANCE_ID` in your initial prompt or add it as an environment variable. However, some AI tools may not detect it automatically, so you may need to include it explicitly in your prompt.

## Documentation

- [Getting Started](https://blindpay.com/docs/getting-started/overview)
- [API Reference](https://api.blindpay.com/reference)

## Support

- Email: [eric@blindpay.com](mailto:eric@blindpay.com)
- Issues: [GitHub Issues](https://github.com/blindpaylabs/blindpay-mcp/issues)

## License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

Made with ❤️ by the [BlindPay](https://blindpay.com) team
