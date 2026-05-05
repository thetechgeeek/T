-- pgTAP test for server-authoritative invoice totals.
-- Run with: supabase test db

BEGIN;

SELECT plan(10);

INSERT INTO business_profile (
  id, business_name, invoice_prefix, invoice_sequence
)
VALUES (
  '91000000-0000-0000-0000-000000000001',
  'Server Authoritative Totals Test',
  'SAT',
  0
)
ON CONFLICT (id) DO UPDATE
SET business_name = EXCLUDED.business_name,
    invoice_prefix = EXCLUDED.invoice_prefix,
    invoice_sequence = 0;

INSERT INTO customers (id, name, phone)
VALUES (
  '91000000-0000-0000-0000-000000000002',
  'Server Totals Test Customer',
  '9100000002'
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    phone = EXCLUDED.phone;

INSERT INTO inventory_items (
  id, design_name, base_item_number, category, box_count,
  cost_price, selling_price, gst_rate, hsn_code, low_stock_threshold
)
VALUES (
  '91000000-0000-0000-0000-000000000003',
  'Server Totals Test Tile',
  'SAT-001',
  'OTHER',
  10,
  100,
  100,
  18,
  '6908',
  1
)
ON CONFLICT (id) DO UPDATE
SET box_count = 10,
    cost_price = EXCLUDED.cost_price,
    selling_price = EXCLUDED.selling_price,
    gst_rate = EXCLUDED.gst_rate;

SELECT ok(
  create_invoice_with_items_v1(
    jsonb_build_object(
      'idempotency_key', '91000000-0000-0000-0000-000000000004',
      'customer_id', '91000000-0000-0000-0000-000000000002',
      'customer_name', 'Server Totals Test Customer',
      'customer_phone', '9100000002',
      'invoice_date', '2026-05-05',
      'subtotal', 1,
      'cgst_total', 1,
      'sgst_total', 1,
      'igst_total', 1,
      'discount_total', 1,
      'grand_total', 1,
      'is_inter_state', false,
      'payment_status', 'paid',
      'amount_paid', 1
    ),
    jsonb_build_array(
      jsonb_build_object(
        'item_id', '91000000-0000-0000-0000-000000000003',
        'design_name', 'Server Totals Test Tile',
        'quantity', 2,
        'rate_per_unit', 100,
        'discount', 10,
        'taxable_amount', 1,
        'gst_rate', 18,
        'cgst_amount', 1,
        'sgst_amount', 1,
        'igst_amount', 1,
        'line_total', 1,
        'sort_order', 99
      )
    )
  ) ? 'id',
  'invoice creation returns an id while client totals are tampered'
);

SELECT is(
  (SELECT subtotal FROM invoices WHERE idempotency_key = '91000000-0000-0000-0000-000000000004'),
  200::numeric,
  'invoice subtotal is recomputed from line quantity and rate'
);

SELECT is(
  (SELECT discount_total FROM invoices WHERE idempotency_key = '91000000-0000-0000-0000-000000000004'),
  10::numeric,
  'invoice discount_total is recomputed from line discount'
);

SELECT is(
  (SELECT cgst_total FROM invoices WHERE idempotency_key = '91000000-0000-0000-0000-000000000004'),
  17.10::numeric,
  'invoice CGST total is recomputed server-side'
);

SELECT is(
  (SELECT sgst_total FROM invoices WHERE idempotency_key = '91000000-0000-0000-0000-000000000004'),
  17.10::numeric,
  'invoice SGST total is recomputed server-side'
);

SELECT is(
  (SELECT grand_total FROM invoices WHERE idempotency_key = '91000000-0000-0000-0000-000000000004'),
  224.20::numeric,
  'invoice grand_total ignores tampered client grand_total'
);

SELECT is(
  (SELECT amount_paid FROM invoices WHERE idempotency_key = '91000000-0000-0000-0000-000000000004'),
  224.20::numeric,
  'paid invoice amount_paid is derived from the recomputed grand_total'
);

SELECT is(
  (
    SELECT line_total
    FROM invoice_line_items
    WHERE item_id = '91000000-0000-0000-0000-000000000003'
    ORDER BY id DESC
    LIMIT 1
  ),
  224.20::numeric,
  'line_total ignores tampered client line_total'
);

SELECT is(
  (SELECT box_count FROM inventory_items WHERE id = '91000000-0000-0000-0000-000000000003'),
  8::numeric,
  'stock is decremented by the server-side invoice transaction'
);

SELECT ok(
  EXISTS(
    SELECT 1
    FROM audit_log
    WHERE table_name = 'invoices'
      AND record_id = (
        SELECT id FROM invoices WHERE idempotency_key = '91000000-0000-0000-0000-000000000004'
      )
      AND action = 'INSERT'
  ),
  'invoice insert writes an audit_log record'
);

SELECT * FROM finish();

ROLLBACK;
