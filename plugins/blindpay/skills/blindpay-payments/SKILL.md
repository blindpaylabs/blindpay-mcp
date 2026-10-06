---
name: blindpay-payments
description: BlindPay account data through the read-only BlindPay MCP tools. Use when the user asks about their BlindPay payouts, payins, transfers, customers, bank accounts, wallets, fees, limits, rails or bank details; pastes a BlindPay id (po_, pi_, re_, ba_, bl_, bw_, va_, pb_); or asks BlindPay to send money or change something.
---

# Answering questions about BlindPay

BlindPay is a stablecoin payments API. A **payout** sends stablecoin (`token`: USDC, USDT, USDB) from a customer and delivers fiat (`currency`) to a bank account. A **payin** is the reverse: fiat in, stablecoin out. A **transfer** moves stablecoin between wallets. Customers are also called receivers.

## Read-only

Every tool is a GET. When the user asks to send, create, edit or delete anything:

1. Say this connection is read-only and can't do it.
2. Point them to the BlindPay dashboard at https://app.blindpay.com.
3. Offer the read-only help that fits, for example "I can list Maria's bank accounts so you can pick one in the dashboard."

Stop there, so the reply reads as a clear no rather than the start of a transfer.

The user picked one instance at sign-in, and every tool fills in `instance_id` (and the `id` of `GetV1InstancesMembers`) from it. Leave those arguments out.

## Cents

Most amounts are integer **cents**. Convert every number before showing it:

| Field | Unit | Example → display |
| --- | --- | --- |
| Payout, payin, transfer and payable amounts (`sender_amount`, `receiver_amount`, `*_fee_amount`, `partner_fee_amount`, `amount`) | Cents | `420460` → 4,204.60 |
| Customer limits and limit increase requests | Cents | `5000000` → 50,000.00 |
| Fee schedule `*_flat` (`GetV1InstancesBillingFees`, partner fees) | Cents | `40` → 0.40 |
| Fee schedule `*_percentage` | Basis points | `10` → 0.10% |
| `commercial_quotation`, `blindpay_quotation` | Rate × 100 | `495` → 1 USD = 4.95 BRL |
| Wallet balances (`GetV1InstancesCustomersWalletsBalance`) | Decimal token units | `9009.2` → 9,009.20 USDB |

A fee is flat + percentage × amount. For example, an ACH payout of 100.00 with `payout_flat: 40` and `payout_percentage: 10` costs 0.40 + 0.10% × 100.00 = 0.50.

**Done when:** every amount in the answer is converted with this table and has its token or currency beside it.

## Ids

| Prefix | Resource | Fetch one with |
| --- | --- | --- |
| `po_` | Payout | `GetV1InstancesPayoutsById` |
| `pi_` | Payin | `GetV1InstancesPayinsById` |
| `re_` | Customer | `GetV1InstancesCustomersById` |
| `ba_` | Bank account | `GetV1InstancesCustomersBankAccountsById` + customer id |
| `bl_` | BlindPay-managed wallet | `GetV1InstancesCustomersWalletsById` + customer id |
| `bw_` | External blockchain wallet | `GetV1InstancesCustomersBlockchainWalletsById` + customer id |
| `va_` | Virtual account | `GetV1InstancesCustomersVirtualAccountsById` + customer id |
| `pb_` | Payable | `GetV1InstancesPayablesById` |
| `qu_` | Quote | No read tool; it only links a payout or payin to its pricing |

Transfer ids come from `GetV1InstancesTransfers` and are fetched with `GetV1InstancesTransfersById`.

Bank accounts, wallets, blockchain wallets, virtual accounts, RFIs and limit increases belong to a customer, and their tools need the `customer_id`. Payouts and payins carry the `customer_id` to use.

## Finding records

- **Recent items:** lists come back newest first, with `limit` as a string from a fixed set (10, 50, 100, 200, 500, 1000). With no date filter available, read `created_at` and page only while the oldest item is still inside the user's window.
- **Paging:** while `pagination.has_more` is true, pass `pagination.next_page` as `starting_after`. Stop once the question is answered.
- **Narrowing:** payout and payin lists filter by `customer_name`, `customer_id`, `status`, `payment_method`, `network`, `token` and `country`. `GetV1InstancesCustomers` filters by `customer_name` or `full_name`. Filter on the server before scanning a list yourself.
- **Across customers:** call the per-customer tool once per customer, and say how many you checked if you stopped early.

When you need a tool's required arguments or filters, or a tool for something this page doesn't cover (payables, yield, offramp wallets, onboarding, members, webhooks, SWIFT or NAICS lookups), read `references/tools.md`.

## Status

Payouts and payins have a `status` of `processing`, `on_hold`, `completed`, `failed` or `refunded`; transfers use the same values except `on_hold`. Each one also has `tracking_*` stages, each with a `step` (`processing`, `on_hold`, `pending_review`, `pending_refund_review`, `completed`) and a `completed_at`.

- Locate a payout by its first stage that isn't `completed`, in this order: `tracking_transaction` (on-chain receipt), `tracking_liquidity`, `tracking_payment` (bank leg), `tracking_documents`, `tracking_complete`.
- Quote `transaction_hash`, `provider_status` and `provider_error_reason` when present.
- `on_hold` and `pending_review` mean BlindPay compliance is reviewing it. Check `GetV1InstancesCustomersRfi` (or `GetV1InstancesRfi`) for an open request for information.
- Report only what the fields show. When a settlement time, reason or outcome isn't in the data, say it isn't available.

## Rails

`GetV1AvailableRails` returns `{ label, value, country }`, and `country` is a display hint, not coverage: `international_swift` is tagged `US` and `sepa` `DE`, yet both work across countries. For "what works in Brazil", give the `BR` rails (`pix`, `pix_safe`, `ted`) and add that SWIFT works internationally. Pass a rail's `value` as `rail` to `GetV1AvailableBankDetails` for the fields, regexes and picklists that rail needs.

## Presenting results

- Lists: a short table of id, customer name, amount with unit, status and date. Keep every id so the user can find the record in the dashboard.
- Customer records hold personal data: tax id, date of birth, address, phone, and links to ID documents and selfies. Show those fields only when the user asks for them.
- `GetV1InstancesWebhookEndpointsPortalAccess` returns a sign-in URL for the webhook portal. Share it only when the user explicitly asks for portal access. Webhook signing secrets aren't available through this connection.

## Errors and empty results

- **401 or 403:** the user's role on this instance doesn't allow that data. Report it and move on.
- **404:** the id is wrong or belongs to another instance. Ask the user to check it.
- **Empty list, or `null` from an RFI tool:** that's the answer ("no bank accounts on file", "no open RFI").
