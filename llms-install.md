# Installing the BlindPay MCP server

Instructions for an AI agent (Cline and similar) setting up the official BlindPay MCP server.

## 1. Get the user's API key

Ask the user for a BlindPay API key. They create one in the dashboard at https://app.blindpay.com: open the instance, then **API Keys**. The key decides which instance the tools act on. Never invent a key or put a placeholder in a working config.

Also ask for the instance ID (`in_` followed by 12 characters) if the user wants it set; it is optional.

## 2. Add the server

Prefer the local server. It needs Node.js 20 or newer (`node -v`). Add this entry to the MCP settings file (for Cline, `cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "blindpay": {
      "command": "npx",
      "args": ["-y", "@blindpay/mcp"],
      "env": {
        "BLINDPAY_API_KEY": "<the user's API key>",
        "BLINDPAY_INSTANCE_ID": "<the user's instance ID, or remove this line>"
      }
    }
  }
}
```

If Node.js isn't available, use the hosted server instead:

```json
{
  "mcpServers": {
    "blindpay": {
      "type": "streamableHttp",
      "url": "https://mcp.blindpay.com/mcp",
      "headers": {
        "Authorization": "Bearer <the user's API key>"
      }
    }
  }
}
```

## 3. Read-only option

If the user only wants to look up data and never create payouts or move funds, use read-only tools:

- Local server: add `"BLINDPAY_MCP_PROFILE": "readonly"` to `env`.
- Hosted server: use `https://mcp.blindpay.com/mcp/readonly` as the URL.

## 4. Check it works

1. Call `GetV1AvailableRails` with no arguments. It needs no key, so a list of payment rails shows the server is running.
2. Call `GetV1InstancesPayouts`, passing `instance_id` when `BLINDPAY_INSTANCE_ID` isn't set. It uses the key, so a 401 here means the API key is wrong or revoked. An empty list is fine for a new instance.

Docs: https://blindpay.com/docs
