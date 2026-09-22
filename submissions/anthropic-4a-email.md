# Draft email — permission for transfer tools under Software Directory Policy §4A

**Owner decides whether to send.** Only relevant if we want the full `/mcp` server
(payouts, payins, transfers) listed in the Claude Connectors Directory. The
read-only submission does not need this.

To: mcp-review@anthropic.com
Subject: BlindPay connector — request for §4A permission for payment-initiation tools

Hi,

BlindPay (https://blindpay.com) is a licensed stablecoin payments API. We are
submitting a read-only connector (https://mcp.blindpay.com/mcp/readonly) to the
Connectors Directory under our organization [org name].

We'd like to ask whether Anthropic would consider a second listing, or an upgrade
of the same listing, that includes our payment-initiation tools, under the
financial-transactions exception in section 4A of the Software Directory Policy.

Context:
- Every tool is a single HTTP operation with accurate `readOnlyHint` /
  `destructiveHint` annotations; write tools always prompt.
- Payouts and payins are created against a receiver the user has already
  onboarded and KYC'd in the BlindPay dashboard; the connector cannot add
  destinations, collect card numbers, or handle government IDs.
- Access is OAuth 2.1 scoped to one BlindPay instance and to the user's role on
  it; instance members can revoke a connection from the dashboard at any time.
- Compliance: [SOC 2 / licensing statements the owner is comfortable making].

If this is possible, what evidence or controls would you need from us? If not,
we're happy to keep the read-only listing as is.

Thanks,
[Owner name], [title], BlindPay
