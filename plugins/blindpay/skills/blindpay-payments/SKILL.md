---
name: blindpay-payments
description: Use when the user asks about their BlindPay payment operations (payouts, payins, transfers, wallets, customers, bank accounts, virtual accounts, fees, limits, rails or bank details) and the BlindPay MCP tools are available. Explains how BlindPay ids and read-only tools fit together.
---

# Answering questions about BlindPay

The BlindPay MCP server is read-only. It can look things up but cannot send payouts, move funds, create customers or change settings. If the user asks for one of those, say the plugin can't do it and point them to the BlindPay dashboard at https://app.blindpay.com.

## The instance is already chosen

The user picked one BlindPay instance when they signed in. Tools that take an `instance_id` fill it in from the sign-in, so never ask the user for it and don't invent one.

## Recognize ids by prefix

| Prefix | Resource | Tool to fetch one |
| --- | --- | --- |
| `po_` | Payout | `GetV1InstancesPayoutsById` |
| `pi_` | Payin | `GetV1InstancesPayinsById` |
| `tr_` | Transfer | `GetV1InstancesTransfersById` |
| `re_` | Customer | `GetV1InstancesCustomersById` |
| `ba_` | Bank account | `GetV1InstancesCustomersBankAccountsById` (also needs the customer id) |
| `bw_` | Blockchain wallet | `GetV1InstancesCustomersBlockchainWalletsById` (also needs the customer id) |
| `va_` | Virtual account | `GetV1InstancesCustomersVirtualAccountsById` (also needs the customer id) |

When the user gives an id, fetch it directly. When they describe something ("my last payout", "Maria's bank account"), list first (`GetV1InstancesPayouts`, `GetV1InstancesCustomers`, ...) and then fetch the match.

## Chain lookups instead of guessing

- **Rails and bank details:** call `GetV1AvailableRails` to get the rail `value` (for example `pix`), then pass it as `rail` to `GetV1AvailableBankDetails` for the fields, validation patterns and picklists that rail needs.
- **Customer resources:** bank accounts, blockchain wallets, virtual accounts and wallets belong to a customer. Get the customer id first, then list the resource for that customer.
- **Status questions:** report the status field and the tracking fields as the API returns them. Don't infer a settlement time the data doesn't show.

## Present results plainly

- Show amounts with the currency or token the API returns next to them.
- For lists, prefer a short table (id, amount, currency, status, created date).
- If a tool returns an authorization error, the signed-in user's role may not allow that data. Say so instead of retrying with other ids.
