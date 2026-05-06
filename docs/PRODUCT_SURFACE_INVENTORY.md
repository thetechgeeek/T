# Product Surface Inventory

Status: active Phase 10 truthfulness register.

Review date: 2026-05-06

State labels:

- `real-data`: wired to live stores/services/repositories.
- `beta`: exposed with known limitations documented here.
- `unavailable`: route renders `UnavailableProductSurface`.
- `hidden`: omitted from primary navigation by feature flag.
- `disabled`: action is visible but cannot run and exposes an accessibility explanation.

## Primary Navigation

| Surface   | Route                            | State                      | Actions                                                                   | Owner sign-off                           |
| --------- | -------------------------------- | -------------------------- | ------------------------------------------------------------------------- | ---------------------------------------- |
| Dashboard | `app/(app)/(tabs)/index.tsx`     | real-data                  | view and navigation actions implemented                                   | not required                             |
| Inventory | `app/(app)/(tabs)/inventory.tsx` | real-data                  | add/import/export/filter/search implemented; export is CSV                | not required                             |
| Scan      | `app/(app)/(tabs)/scan.tsx`      | beta                       | manual entry available; AI/OCR parsing remains feature-flagged separately | @product-owner required before AI claims |
| Invoices  | `app/(app)/(tabs)/invoices.tsx`  | real-data                  | create/view/share paths are implemented through invoice flows             | not required                             |
| More      | `app/(app)/(tabs)/more.tsx`      | real-data navigation shell | routes only to live hubs/settings                                         | not required                             |

## Finance

| Surface                            | Route                                                | State       | Save/export/share truthfulness                                       | Owner sign-off                          |
| ---------------------------------- | ---------------------------------------------------- | ----------- | -------------------------------------------------------------------- | --------------------------------------- |
| Finance overview                   | `app/(app)/finance/index.tsx`                        | real-data   | payment, purchase, expense, aging, and P&L navigation only           | not required                            |
| Receive payment                    | `app/(app)/finance/payments/receive.tsx`             | real-data   | save uses payment store/service chain                                | not required                            |
| Make payment                       | `app/(app)/finance/payments/make.tsx`                | real-data   | save uses payment store/service chain                                | not required                            |
| Payment receipt                    | `app/(app)/finance/payments/[id]/receipt.tsx`        | real-data   | receipt view/share is tied to payment record                         | not required                            |
| Expenses                           | `app/(app)/finance/expenses/index.tsx`               | real-data   | add/edit paths use finance store                                     | not required                            |
| Add expense                        | `app/(app)/finance/expenses/add.tsx`                 | real-data   | save uses finance store/service chain                                | not required                            |
| Purchases                          | `app/(app)/finance/purchases/index.tsx`              | real-data   | create/detail paths use finance store                                | not required                            |
| Purchase create/detail             | `app/(app)/finance/purchases/create.tsx`, `[id].tsx` | real-data   | save/share/detail paths are implemented                              | not required                            |
| Profit & Loss                      | `app/(app)/finance/profit-loss.tsx`                  | beta        | no fake export/save; excludes other-income and stock valuation feeds | @product-owner required before GA       |
| Bank accounts                      | `app/(app)/finance/bank-accounts/index.tsx`          | unavailable | no fake save                                                         | @product-owner required before exposure |
| Add bank account                   | `app/(app)/finance/bank-accounts/add.tsx`            | unavailable | former fake save removed                                             | @product-owner required before exposure |
| Cash, cheques, e-wallets, transfer | `app/(app)/finance/*.tsx`                            | unavailable | no operational placeholder actions                                   | @product-owner required before exposure |
| Loans                              | `app/(app)/finance/loans/*`                          | unavailable | no fake save/detail actions                                          | @product-owner required before exposure |
| Other income                       | `app/(app)/finance/other-income/*`                   | unavailable | former local-only save removed                                       | @product-owner required before exposure |

## Reports

| Surface                                     | Route                                                    | State                      | Export/share truthfulness                                                   | Owner sign-off                                   |
| ------------------------------------------- | -------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------ |
| Reports hub                                 | `app/(app)/reports/index.tsx`                            | real-data navigation shell | hidden report cards are filtered by feature flags                           | not required                                     |
| Sale report                                 | `app/(app)/reports/sale.tsx`                             | real-data                  | drilldowns route to invoice records                                         | not required                                     |
| Purchase report                             | `app/(app)/reports/purchase.tsx`                         | real-data                  | drilldowns route to purchase records                                        | not required                                     |
| Party outstanding                           | `app/(app)/reports/all-parties.tsx`                      | real-data                  | no fake export/share                                                        | not required                                     |
| Stock summary                               | `app/(app)/reports/stock-summary.tsx`                    | real-data                  | export action is disabled until `LIVE_REPORT_EXPORTS` ships                 | @product-owner required before export enablement |
| P&L report                                  | `app/(app)/reports/profit-loss.tsx`                      | beta re-export             | shares finance P&L limitations                                              | @product-owner required before GA                |
| Expense summary                             | `app/(app)/reports/expense-summary.tsx`                  | hidden + unavailable       | mock chart/export removed from live route                                   | @product-owner required before exposure          |
| Day book                                    | `app/(app)/reports/day-book.tsx`                         | unavailable                | former no-op export removed                                                 | @product-owner required before exposure          |
| Balance sheet                               | `app/(app)/reports/balance-sheet.tsx`                    | unavailable                | former cash-ledger coming-soon action removed                               | @product-owner required before exposure          |
| Party-wise P&L                              | `app/(app)/reports/party-profit.tsx`                     | unavailable                | deterministic fake profit rows removed                                      | @product-owner required before exposure          |
| GSTR-1, GSTR-3B, GST detail                 | `app/(app)/reports/gstr*.tsx`, `gst-detail.tsx`          | unavailable                | statutory reports are disabled until live statutory math/export tests exist | @product-owner + @security-owner required        |
| Item profit, order summary, party statement | `app/(app)/reports/*.tsx`                                | unavailable                | no placeholder export/share                                                 | @product-owner required before exposure          |
| All transactions, cashflow                  | `app/(app)/reports/all-transactions.tsx`, `cashflow.tsx` | beta direct routes         | no fake export/share; payment/cash-ledger gaps documented                   | @product-owner required before primary nav       |

## Utilities

| Surface              | Route                                  | State                      | Operational truthfulness                           | Owner sign-off                          |
| -------------------- | -------------------------------------- | -------------------------- | -------------------------------------------------- | --------------------------------------- |
| Utilities hub        | `app/(app)/utilities/index.tsx`        | real-data navigation shell | hidden utility cards are filtered by feature flags | not required                            |
| Calculator           | `app/(app)/utilities/calculator.tsx`   | real-data                  | local calculator only; no persistence claims       | not required                            |
| Data verification    | `app/(app)/utilities/verify.tsx`       | hidden + unavailable       | no fake validation output                          | @product-owner required before exposure |
| Close financial year | `app/(app)/utilities/close-fy.tsx`     | hidden + unavailable       | former animated fake close workflow removed        | @product-owner + @data-owner required   |
| Tally export         | `app/(app)/utilities/tally-export.tsx` | hidden + unavailable       | former fake XML/share flow removed                 | @product-owner + @data-owner required   |

## Transactions

| Surface         | Route                                      | State       | Save/export truthfulness  | Owner sign-off                          |
| --------------- | ------------------------------------------ | ----------- | ------------------------- | --------------------------------------- |
| Credit notes    | `app/(app)/transactions/credit-notes/*`    | unavailable | no fake draft/export/save | @product-owner required before exposure |
| Estimates       | `app/(app)/transactions/estimates/*`       | unavailable | no fake draft/export/save | @product-owner required before exposure |
| Purchase orders | `app/(app)/transactions/purchase-orders/*` | unavailable | no fake draft/export/save | @product-owner required before exposure |

## Feature Flags

Disabled by default:

- `LIVE_FINANCE_BANKING_SURFACES`
- `LIVE_FINANCE_OTHER_INCOME`
- `LIVE_DATA_VERIFICATION`
- `LIVE_CLOSE_FINANCIAL_YEAR`
- `LIVE_TALLY_EXPORT`
- `LIVE_EXPENSE_SUMMARY_REPORT`
- `LIVE_DAY_BOOK_REPORT`
- `LIVE_BALANCE_SHEET_REPORT`
- `LIVE_PARTY_PROFIT_REPORT`
- `LIVE_STATUTORY_REPORTS`
- `LIVE_TRANSACTION_DOCUMENTS`
- `LIVE_REPORT_EXPORTS`

Before any disabled flag is enabled, product owner sign-off must confirm that data source, save path,
export/share path, accessibility state, English/Hindi copy, and regression tests match the UI claim.

## Enforcement

`npm run check:product-surfaces` fails when finance/report/utility/transaction routes expose:

- coming-soon alerts,
- placeholder export/share alerts,
- fake save success alerts,
- no-op operational export/print/share/save handlers.
