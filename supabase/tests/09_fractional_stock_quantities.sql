-- pgTAP test for P0 fractional stock preservation.
-- Run with: supabase test db

BEGIN;

SELECT plan(6);

INSERT INTO business_profile (
  id, business_name, invoice_prefix, invoice_sequence
)
VALUES (
  '90000000-0000-0000-0000-000000000001',
  'Fractional Stock Test Business',
  'FST',
  0
)
ON CONFLICT (id) DO UPDATE
SET business_name = EXCLUDED.business_name,
    invoice_prefix = EXCLUDED.invoice_prefix,
    invoice_sequence = 0;

INSERT INTO customers (id, name, phone)
VALUES (
  '90000000-0000-0000-0000-000000000002',
  'Fractional Stock Test Customer',
  '9000000002'
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    phone = EXCLUDED.phone;

INSERT INTO inventory_items (
  id, design_name, base_item_number, category, box_count,
  cost_price, selling_price, gst_rate, hsn_code, low_stock_threshold
)
VALUES (
  '90000000-0000-0000-0000-000000000003',
  'Fractional Stock Test Tile',
  'FST-001',
  'OTHER',
  10,
  100,
  100,
  0,
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
      'customer_id', '90000000-0000-0000-0000-000000000002',
      'customer_name', 'Fractional Stock Test Customer',
      'customer_phone', '9000000002',
      'invoice_date', '2026-05-04',
      'subtotal', 250,
      'cgst_total', 0,
      'sgst_total', 0,
      'igst_total', 0,
      'discount_total', 0,
      'grand_total', 250,
      'is_inter_state', false,
      'payment_status', 'unpaid',
      'amount_paid', 0
    ),
    jsonb_build_array(
      jsonb_build_object(
        'item_id', '90000000-0000-0000-0000-000000000003',
        'design_name', 'Fractional Stock Test Tile',
        'quantity', 2.5,
        'rate_per_unit', 100,
        'discount', 0,
        'taxable_amount', 250,
        'gst_rate', 0,
        'cgst_amount', 0,
        'sgst_amount', 0,
        'igst_amount', 0,
        'line_total', 250,
        'sort_order', 1
      )
    )
  ) ? 'id',
  'fractional invoice creation returns an invoice id'
);

SELECT is(
  (SELECT box_count FROM inventory_items WHERE id = '90000000-0000-0000-0000-000000000003'),
  7.5::numeric,
  'inventory_items.box_count is decremented by exactly 2.5'
);

SELECT is(
  (
    SELECT quantity
    FROM invoice_line_items
    WHERE item_id = '90000000-0000-0000-0000-000000000003'
    ORDER BY id DESC
    LIMIT 1
  ),
  2.5::numeric,
  'invoice_line_items.quantity stores the fractional quantity'
);

SELECT is(
  (
    SELECT quantity_change
    FROM stock_operations
    WHERE item_id = '90000000-0000-0000-0000-000000000003'
    ORDER BY created_at DESC
    LIMIT 1
  ),
  -2.5::numeric,
  'stock_operations.quantity_change records the exact fractional stock-out'
);

SELECT is(
  (
    SELECT previous_quantity
    FROM stock_operations
    WHERE item_id = '90000000-0000-0000-0000-000000000003'
    ORDER BY created_at DESC
    LIMIT 1
  ),
  10::numeric,
  'stock_operations.previous_quantity records the pre-sale quantity'
);

SELECT is(
  (
    SELECT new_quantity
    FROM stock_operations
    WHERE item_id = '90000000-0000-0000-0000-000000000003'
    ORDER BY created_at DESC
    LIMIT 1
  ),
  7.5::numeric,
  'stock_operations.new_quantity records the exact post-sale quantity'
);

SELECT * FROM finish();

ROLLBACK;
