# BlindPay read-only tools

All 41 tools the read-only BlindPay MCP server exposes, grouped by what they answer. "Needs" lists the required arguments; "Filters" lists the optional ones.

"Paging" means `limit`, `offset` (a string from 0, 10, 50, 100, 200, 500, 1000), `starting_after` and `ending_before`; those lists return `{ data, pagination }`. Lists without paging return a plain array.

## Payouts (stablecoin → bank account)

| Tool | Needs | Filters | Returns |
| --- | --- | --- | --- |
| `GetV1InstancesPayouts` | | `status`, `customer_id`, `customer_name`, `bank_account_id`, `payment_method` (rail), `country`, `network`, `token`, paging | Payouts with amounts in cents, `status` and `tracking_*` stages |
| `GetV1InstancesPayoutsById` | `id` (`po_`) | | One payout, including the recipient bank details used |

## Payins (bank transfer → stablecoin)

| Tool | Needs | Filters | Returns |
| --- | --- | --- | --- |
| `GetV1InstancesPayins` | | `status`, `customer_id`, `customer_name`, `bank_account_id`, `payment_method`, `country`, `network`, `token`, paging | Payins with amounts in cents, the deposit instructions (`blindpay_bank_details`, `pix_code`, `clabe`, `memo_code`) and tracking |
| `GetV1InstancesPayinsById` | `id` (`pi_`) | | One payin |

## Transfers (wallet → wallet)

| Tool | Needs | Filters | Returns |
| --- | --- | --- | --- |
| `GetV1InstancesTransfers` | | paging only | Transfers with `status` and tracking |
| `GetV1InstancesTransfersById` | `id` | | One transfer |

## Payables (bills paid by a payout)

| Tool | Needs | Filters | Returns |
| --- | --- | --- | --- |
| `GetV1InstancesPayables` | | `status` (`draft`, `processing`, `completed`, `canceled`), `customer_id`, paging | Payables; `amount` is in cents, `payout_id` links the payout that paid it |
| `GetV1InstancesPayablesById` | `id` (`pb_`) | | One payable with line items, taxes and due date |

## Customers (receivers)

| Tool | Needs | Filters | Returns |
| --- | --- | --- | --- |
| `GetV1InstancesCustomers` | | `customer_name`, `full_name`, `status` (KYC status), `customer_id`, `bank_account_id`, `country`, paging | Customers with `type` (individual or business), `kyc_status` and `limit` in cents. Includes personal data. |
| `GetV1InstancesCustomersById` | `id` (`re_`) | | One customer |
| `GetV1InstancesLimitsCustomersById` | `id` (`re_`) | | Payin and payout limits, daily and monthly, in cents |
| `GetV1InstancesCustomersLimitIncrease` | `customer_id` | | Limit increase requests with requested and approved amounts in cents |
| `GetV1InstancesCustomersRfi` | `customer_id` | | The open request for information, or `null` |

## Customer bank accounts

| Tool | Needs | Filters | Returns |
| --- | --- | --- | --- |
| `GetV1InstancesCustomersBankAccounts` | `customer_id` | `status`, `type` (rail), `name`, `bank_account_id`, `country` | Bank accounts with rail-specific fields |
| `GetV1InstancesCustomersBankAccountsById` | `customer_id`, `id` (`ba_`) | | One bank account |
| `GetV1InstancesCustomersBankAccountsOfframpWallets` | `customer_id`, `bank_account_id` | | Deposit addresses that pay out to this bank account automatically |
| `GetInstancesCustomersBankAccountsOfframpWalletsById` | `customer_id`, `bank_account_id`, `id` | | One offramp wallet |

## Wallets, balances and yield

| Tool | Needs | Filters | Returns |
| --- | --- | --- | --- |
| `GetV1InstancesCustomersWallets` | `customer_id` | | BlindPay-managed wallets (`bl_`) with address, network and `yield_status` |
| `GetV1InstancesCustomersWalletsById` | `customer_id`, `id` | | One wallet |
| `GetV1InstancesCustomersWalletsBalance` | `customer_id`, `id` (`bl_`) | | Balance per token (USDC, USDT, USDB) in **decimal token units**, not cents |
| `GetV1InstancesCustomersWalletsYield` | `customer_id`, `id` | | Yield status, `fee_bps` and positions |
| `GetV1InstancesCustomersWalletsYieldHistory` | `customer_id`, `id` | `token`, `from`, `to` (UTC dates `YYYY-MM-DD`, at most 366 days; defaults to the last 30) | Daily yield history |
| `GetV1InstancesCustomersWalletsYieldTransactions` | `customer_id`, `id` | `token`, paging | Yield accrual transactions |
| `GetV1InstancesCustomersBlockchainWallets` | `customer_id` | | External wallets the customer registered (`bw_`) |
| `GetV1InstancesCustomersBlockchainWalletsById` | `customer_id`, `id` | | One external wallet |
| `GetV1InstancesCustomersVirtualAccounts` | `customer_id` | | Virtual bank accounts (`va_`) that convert incoming fiat to a token |
| `GetV1InstancesCustomersVirtualAccountsById` | `customer_id`, `id` | | One virtual account |

## Fees and pricing

| Tool | Needs | Filters | Returns |
| --- | --- | --- | --- |
| `GetV1InstancesBillingFees` | | | Fee schedule per rail and network: `*_flat` in cents, `*_percentage` in basis points |
| `GetV1InstancesPartnerFees` | | | Partner fees this instance adds on top of BlindPay's |
| `GetV1InstancesPartnerFeesById` | `id` | | One partner fee |

## Rails, banks and reference data (no account data)

| Tool | Needs | Filters | Returns |
| --- | --- | --- | --- |
| `GetV1AvailableRails` | | | Every payout rail as `{ label, value, country }`; `country` is a display hint, not coverage |
| `GetV1AvailableBankDetails` | `rail` (a `value` from rails) | | Fields a bank account on that rail needs: `label`, `key`, `regex`, `required`, and `items` for picklists |
| `GetV1AvailableSwiftBySwift` | `swift` | | Bank name, city, branch and country for a SWIFT/BIC code |
| `GetV1AvailableNaics` | | | NAICS industry codes as `{ label, value }` |

## Instance, team and compliance

| Tool | Needs | Filters | Returns |
| --- | --- | --- | --- |
| `GetV1InstancesMembers` | | | Team members with email, name and role |
| `GetV1InstancesRfi` | | | The instance's open request for information, or `null` |
| `GetV1InstancesOnboardingBusinessDetails` | | | The instance's legal entity details |
| `GetV1InstancesOnboardingBusinessProfile` | | | The instance's business profile |
| `GetV1InstancesOnboardingOwnershipDocuments` | | | Ownership documents submitted during onboarding |
| `GetV1InstancesWebhookEndpoints` | | | Webhook endpoint URLs and the events they receive |
| `GetV1InstancesWebhookEndpointsPortalAccess` | | | A sign-in URL for the webhook portal. Share it only on explicit request |

## Outside this server

Writes of any kind, quotes, wallet message signing and webhook signing secrets live on the full BlindPay API and dashboard (https://app.blindpay.com), not here.
