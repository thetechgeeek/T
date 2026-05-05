# Database Denormalization Contract

Status: active Phase 6 data contract.

## Invoice Customer Snapshots

Invoice customer fields are legal and audit snapshots. They capture what was printed or shared on
the invoice at creation time.

- `invoices.customer_name` is denormalized so historical invoices keep the displayed party name.
- `invoices.customer_gstin` is denormalized so GST evidence is stable.
- `invoices.customer_phone` is denormalized so historical contact details remain tied to the invoice.
- `invoices.customer_address` is denormalized so invoice PDFs do not change when customer master data
  changes later.

Changing customer master data must not rewrite historical invoice snapshots unless a support-approved
correction is being made.

## Orders

`orders.party_name` is treated as an import-time/display snapshot of the order party. It should not
be used as the canonical current supplier/customer name. New workflows that need live party state
must add or use a foreign key.

## Inventory Items

`inventory_items.party_name` is treated as a supplier/rate snapshot attached to the item import or
party-rate context. It is not canonical current supplier state. New workflows that need current party
state must use `supplier_id`, `customer_id`, or a dedicated party-rate relation.

## Data Contract Checks

Database and service tests should preserve:

- invoice snapshots survive customer edits,
- order party display does not imply current master-data linkage,
- inventory party display does not imply current master-data linkage.
