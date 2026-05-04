# Fractional Stock Reconciliation Runbook

Status: P0 data-integrity remediation support artifact.

## Scope

This runbook covers invoices created before the fractional stock fix where an invoice line quantity such as `2.5` could have been stored on the invoice while the stock ledger deducted only `2`.

The forward fix is in `supabase/migrations/025_fractional_stock_quantities.sql`. This runbook is for historical detection, customer support, and safe one-time correction.

## Detection Query

Run this query in the production database after deploying the migration. It is read-only.

```sql
WITH fractional_lines AS (
  SELECT
    i.id AS invoice_id,
    i.invoice_number,
    i.invoice_date,
    ili.item_id,
    ii.design_name,
    SUM(ili.quantity)::numeric AS invoice_quantity
  FROM invoices i
  JOIN invoice_line_items ili ON ili.invoice_id = i.id
  LEFT JOIN inventory_items ii ON ii.id = ili.item_id
  WHERE ili.item_id IS NOT NULL
    AND ili.quantity <> trunc(ili.quantity)
  GROUP BY i.id, i.invoice_number, i.invoice_date, ili.item_id, ii.design_name
),
stock_deductions AS (
  SELECT
    reference_id AS invoice_id,
    item_id,
    ABS(SUM(quantity_change))::numeric AS deducted_quantity,
    MIN(previous_quantity)::numeric AS first_previous_quantity,
    MAX(new_quantity)::numeric AS final_new_quantity
  FROM stock_operations
  WHERE reference_type = 'invoice'
    AND operation_type = 'stock_out'
  GROUP BY reference_id, item_id
)
SELECT
  fl.invoice_id,
  fl.invoice_number,
  fl.invoice_date,
  fl.item_id,
  fl.design_name,
  fl.invoice_quantity,
  COALESCE(sd.deducted_quantity, 0) AS deducted_quantity,
  fl.invoice_quantity - COALESCE(sd.deducted_quantity, 0) AS missing_deduction,
  sd.first_previous_quantity,
  sd.final_new_quantity
FROM fractional_lines fl
LEFT JOIN stock_deductions sd
  ON sd.invoice_id = fl.invoice_id
 AND sd.item_id = fl.item_id
WHERE COALESCE(sd.deducted_quantity, 0) <> fl.invoice_quantity
ORDER BY fl.invoice_date, fl.invoice_number, fl.item_id;
```

Expected result after a clean rollout: zero rows.

## Backfill Plan

1. Export the detection query result to a dated CSV and attach it to the incident or remediation issue.
2. For each row, verify the physical stock position with the customer before writing corrections.
3. If the invoice quantity is correct and stock is overstated, apply an `adjustment` stock operation for `-missing_deduction`.
4. If the invoice quantity was entered incorrectly, correct the invoice through the normal support flow before adjusting stock.
5. Re-run the detection query. The query must return zero rows before closing the incident.
6. Capture before and after `inventory_items.box_count` and `stock_operations` rows in the issue.

Use the app/service stock adjustment path when available. If a database-only correction is required, wrap each item correction in a transaction and include the invoice id as `reference_id`.

```sql
BEGIN;

SELECT perform_stock_operation_v1(
  '<item_id>'::uuid,
  'adjustment'::stock_op_type,
  -('<missing_deduction>'::numeric),
  'P0 fractional stock reconciliation for invoice <invoice_number>',
  'invoice_reconciliation',
  '<invoice_id>'::uuid
);

COMMIT;
```

## Customer Support Path

- Tell the customer that historical stock for specific fractional invoice lines may have been understated or overstated in the app ledger.
- Verify the affected invoice, item, invoice quantity, and current physical stock before applying any correction.
- Do not edit paid invoice totals solely to reconcile stock. Correct stock through an inventory adjustment unless the invoice itself is wrong.
- After correction, send the customer the affected invoice number, item name, previous app stock, corrected app stock, and timestamp of the correction.
- Escalate to finance/admin approval if the stock adjustment changes valuation or financial reports.

## Rollback

If a correction is wrong, reverse it with an equal and opposite `adjustment` operation referencing the same incident. Do not delete stock ledger rows.
