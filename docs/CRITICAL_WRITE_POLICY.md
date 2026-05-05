# Critical Write Policy

Status: Phase 2 runtime architecture contract.

## Rule

Clients send intent and draft values for critical writes. They do not send trusted final money,
stock, ledger, compliance, import/export, or auth-policy outcomes.

Services and RPCs own the server-authoritative lane:

- invoice creation and invoice edits that affect totals or stock
- payment recording and ledger updates
- stock mutations and reconciliation
- compliance/report exports and audit-grade export snapshots
- file parsing/import pipelines where trust matters
- auth-adjacent security policy and session ownership

## Invoice Creation

`invoiceService.createInvoice()` sends customer/payment intent plus draft line fields:

- `quantity`
- `rate_per_unit`
- `discount`
- `gst_rate`
- descriptive line metadata

It does not send trusted `subtotal`, `cgst_total`, `sgst_total`, `igst_total`,
`discount_total`, `grand_total`, `taxable_amount`, per-line tax amounts, or `line_total`.

`create_invoice_with_items_v1()` delegates to `create_invoice_with_items()`, which recomputes:

- invoice subtotal
- discount total
- CGST/SGST/IGST totals
- grand total
- per-line taxable amount
- per-line tax split
- per-line total
- paid amount for `payment_status = 'paid'`

The same transaction performs stock deduction via `perform_stock_operation()` and refreshes ledger
summaries. Existing audit triggers on `invoices`, `payments`, and `inventory_items` record critical
table changes, and invoice idempotency remains enforced by `invoices.idempotency_key`.

## Existing Server-Owned RPCs

- `create_invoice_with_items_v1`: invoice totals, line taxes, stock deduction, idempotency, ledger
  refresh.
- `record_payment_with_invoice_update_v1`: payment write plus invoice payment-state update.
- `perform_stock_operation_v1`: stock ledger mutation with insufficient-stock validation.

## Release Gate

Before release, changes to money, stock, ledger, compliance, imports, exports, or auth-adjacent
security must answer:

- Does the client send only intent and draft values?
- Does the server recompute or validate the final persisted outcome?
- Is the write idempotent where retries are possible?
- Are stock and payment invariants enforced in one transaction?
- Does an audit record exist for the critical state change?
- Is there a regression test proving tampered client totals are rejected or recomputed?
