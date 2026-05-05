-- pgTAP regression guard for fractional purchase quantities and direct stock operations.
-- Run with: supabase test db

BEGIN;

SELECT plan(5);

SELECT col_type_is(
  'public',
  'purchase_line_items',
  'quantity',
  'numeric',
  'purchase_line_items.quantity accepts fractional quantities'
);

INSERT INTO suppliers (id, name, phone)
VALUES (
  '92000000-0000-0000-0000-000000000001',
  'Fractional Purchase Supplier',
  '9200000001'
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    phone = EXCLUDED.phone;

INSERT INTO purchases (
  id, purchase_number, supplier_id, purchase_date, subtotal, tax_total, grand_total
)
VALUES (
  '92000000-0000-0000-0000-000000000002',
  'FPO-001',
  '92000000-0000-0000-0000-000000000001',
  '2026-05-05',
  125,
  0,
  125
)
ON CONFLICT (id) DO UPDATE
SET subtotal = EXCLUDED.subtotal,
    tax_total = EXCLUDED.tax_total,
    grand_total = EXCLUDED.grand_total;

INSERT INTO purchase_line_items (
  id, purchase_id, design_name, quantity, rate_per_unit, amount
)
VALUES (
  '92000000-0000-0000-0000-000000000003',
  '92000000-0000-0000-0000-000000000002',
  'Fractional Purchase Tile',
  1.25,
  100,
  125
)
ON CONFLICT (id) DO UPDATE
SET quantity = EXCLUDED.quantity,
    amount = EXCLUDED.amount;

SELECT is(
  (
    SELECT quantity
    FROM purchase_line_items
    WHERE id = '92000000-0000-0000-0000-000000000003'
  ),
  1.25::numeric,
  'purchase line item preserves 1.25 quantity'
);

INSERT INTO inventory_items (
  id, design_name, base_item_number, category, box_count,
  cost_price, selling_price, gst_rate, hsn_code, low_stock_threshold
)
VALUES (
  '92000000-0000-0000-0000-000000000004',
  'Fractional Stock Operation Tile',
  'FSO-001',
  'OTHER',
  0,
  100,
  100,
  0,
  '6908',
  1
)
ON CONFLICT (id) DO UPDATE
SET box_count = 0;

SELECT is(
  perform_stock_operation_v1(
    '92000000-0000-0000-0000-000000000004',
    'stock_in',
    3.75,
    'fractional stock-in regression',
    'test',
    NULL::uuid
  ),
  3.75::numeric,
  'perform_stock_operation_v1 returns exact fractional new quantity'
);

SELECT is(
  (SELECT box_count FROM inventory_items WHERE id = '92000000-0000-0000-0000-000000000004'),
  3.75::numeric,
  'inventory box_count stores exact fractional stock-in quantity'
);

SELECT is(
  (
    SELECT quantity_change
    FROM stock_operations
    WHERE item_id = '92000000-0000-0000-0000-000000000004'
    ORDER BY created_at DESC
    LIMIT 1
  ),
  3.75::numeric,
  'stock operation history stores exact fractional stock-in delta'
);

SELECT * FROM finish();

ROLLBACK;
