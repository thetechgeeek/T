-- pgTAP tests for create_invoice_with_items_v1
-- Run with: supabase test db

BEGIN;

SELECT plan(6);

-- ─── Setup ────────────────────────────────────────────────────────────────────

-- Customer
INSERT INTO customer (id, name, phone)
VALUES ('11111111-1111-1111-1111-111111111111', 'Test Customer', '9999999999')
ON CONFLICT (id) DO NOTHING;

-- Inventory item
INSERT INTO inventory_item (
  id, design_name, base_item_number, category, size, brand,
  grade, current_stock, pcs_per_box, cost_price, selling_price, gst_rate
)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Test Floor Tile', 'FLOOR-001', 'FLOOR', '600x600', 'TestBrand',
  'A', 50, 10, 200.00, 300.00, 18
)
ON CONFLICT (id) DO UPDATE SET current_stock = 50;

-- ─── Helper ───────────────────────────────────────────────────────────────────

\set invoice_json '{"customer_id": "11111111-1111-1111-1111-111111111111", "invoice_date": "2026-03-29", "is_inter_state": false, "payment_mode": "cash", "payment_status": "paid", "amount_paid": 3186.00}'

\set items_json '[{"inventory_item_id": "22222222-2222-2222-2222-222222222222", "quantity": 10, "rate": 300.00, "discount_percent": 0, "gst_rate": 18, "taxable_amount": 3000.00, "cgst_amount": 270.00, "sgst_amount": 270.00, "igst_amount": 0.00, "total_amount": 3540.00}]'

-- ─── Tests ────────────────────────────────────────────────────────────────────

-- 1. Function returns success=true
SELECT ok(
  (SELECT (create_invoice_with_items_v1(:'invoice_json'::jsonb, :'items_json'::jsonb) ->> 'success')::bool),
  'create_invoice_with_items_v1 returns success=true'
);

-- 2. Invoice row is persisted
SELECT is(
  (SELECT count(*)::int FROM invoice
   WHERE customer_id = '11111111-1111-1111-1111-111111111111'
   AND invoice_date = '2026-03-29'),
  1,
  'Invoice row was inserted'
);

-- 3. Line item row is persisted
SELECT ok(
  EXISTS(
    SELECT 1 FROM invoice_line_item li
    JOIN invoice i ON i.id = li.invoice_id
    WHERE i.customer_id = '11111111-1111-1111-1111-111111111111'
    AND li.inventory_item_id = '22222222-2222-2222-2222-222222222222'
  ),
  'Line item row was inserted'
);

-- 4. Stock is decremented by quantity
SELECT is(
  (SELECT current_stock FROM inventory_item WHERE id = '22222222-2222-2222-2222-222222222222'),
  40,
  'Inventory stock was decremented by 10'
);

-- 5. Invoice number is auto-generated (not null)
SELECT ok(
  (SELECT invoice_number IS NOT NULL FROM invoice
   WHERE customer_id = '11111111-1111-1111-1111-111111111111'
   AND invoice_date = '2026-03-29'),
  'Invoice number was auto-generated'
);

-- 6. v1 alias and direct function produce consistent schema
SELECT ok(
  (create_invoice_with_items_v1(
    jsonb_build_object(
      'customer_id', '11111111-1111-1111-1111-111111111111',
      'invoice_date', '2026-03-28',
      'is_inter_state', false,
      'payment_mode', 'cash',
      'payment_status', 'unpaid',
      'amount_paid', 0
    ),
    jsonb_build_array(
      jsonb_build_object(
        'inventory_item_id', '22222222-2222-2222-2222-222222222222',
        'quantity', 2, 'rate', 300.00, 'discount_percent', 0,
        'gst_rate', 18, 'taxable_amount', 600.00,
        'cgst_amount', 54.00, 'sgst_amount', 54.00,
        'igst_amount', 0.00, 'total_amount', 708.00
      )
    )
  ) ? 'invoice_id'),
  'v1 result contains invoice_id key'
);

SELECT * FROM finish();

ROLLBACK;
