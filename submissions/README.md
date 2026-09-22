# Directory submissions

Drafts for the two consumer directories. Both ban tools that move money, so both
submit the read-only surface at `https://mcp.blindpay.com/mcp/readonly` only.
Nothing here is submitted automatically; an org owner presses the button.

| File | Directory | Portal |
| --- | --- | --- |
| `claude.md` | Claude Connectors Directory | https://claude.ai/admin-settings/directory/submissions/new |
| `openai.md` | ChatGPT / Codex Plugins Directory | https://platform.openai.com/plugins |
| `anthropic-4a-email.md` | Request to allow transfer tools later | mcp-review@anthropic.com |

## Blockers to clear before either submission

1. **Reviewer test account without a second factor.** Both directories require a
   reviewer to sign in with no MFA, SMS or email code. Clerk sign-in on
   clerk.blindpay.com currently uses an email code. The account needs a password
   sign-in path (or a Clerk test-mode account with a fixed code) plus a populated
   development instance.
2. **Two GET tools are not safe for a read-only listing** and should be excluded
   from `/mcp/readonly` before submission:
   `GetV1InstancesCustomersBlockchainWalletsSignMessage` (produces a signature, a
   side effect) and `GetV1InstancesWebhookEndpointsSecret` (returns a secret).
3. **OpenAI domain verification** needs a token served at
   `https://mcp.blindpay.com/.well-known/openai-apps-challenge` (or on
   `https://blindpay.com`). Small blindpay-v2 change once the portal issues it.
4. **Claude:** confirm the Team/Enterprise claude.ai org and its Owner.
   **OpenAI:** confirm business verification and Apps Management write access.
