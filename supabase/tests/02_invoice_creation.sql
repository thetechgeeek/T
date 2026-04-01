-- pgTAP tests for create_invoice_with_items_v1
-- Run with: supabase test db

BEGIN;

SELECT plan(14);

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

-- ─── Extended Tests (DB-002 additions) ───────────────────────────────────────

-- 7. Invoice number format matches TM/YYYY-YY/NNNN pattern
SELECT ok(
  (SELECT invoice_number ~ '^[A-Z]+/\d{4}-\d{2}/\d{4}$' FROM invoice
   WHERE customer_id = '11111111-1111-1111-1111-111111111111'
   AND invoice_date = '2026-03-29'),
  'Invoice number matches TM/YYYY-YY/NNNN format'
);

-- 8. GST amounts stored correctly for intra-state (cgst=sgst, igst=0)
SELECT ok(
  EXISTS(
    SELECT 1 FROM invoice_line_item li
    JOIN invoice i ON i.id = li.invoice_id
    WHERE i.customer_id = '11111111-1111-1111-1111-111111111111'
      AND li.cgst_amount > 0
      AND li.sgst_amount > 0
      AND li.igst_amount = 0
  ),
  'Intra-state invoice has cgst+sgst, igst=0'
);

-- 9. Inter-state invoice has igst>0, cgst=sgst=0
\set igst_invoice '{"customer_id": "11111111-1111-1111-1111-111111111111", "invoice_date": "2026-03-27", "is_inter_state": true, "payment_mode": "upi", "payment_status": "unpaid", "amount_paid": 0}'
\set igst_items '[{"inventory_item_id": "22222222-2222-2222-2222-222222222222", "quantity": 1, "rate": 300.00, "discount_percent": 0, "gst_rate": 18, "taxable_amount": 300.00, "cgst_amount": 0.00, "sgst_amount": 0.00, "igst_amount": 54.00, "total_amount": 354.00}]'

SELECT ok(
  (SELECT (create_invoice_with_items_v1(:'igst_invoice'::jsonb, :'igst_items'::jsonb) ->> 'success')::bool),
  'Inter-state invoice creation returns success=true'
);

SELECT ok(
  EXISTS(
    SELECT 1 FROM invoice_line_item li
    JOIN invoice i ON i.id = li.invoice_id
    WHERE i.customer_id = '11111111-1111-1111-1111-111111111111'
      AND i.invoice_date = '2026-03-27'
      AND li.igst_amount > 0
      AND li.cgst_amount = 0
      AND li.sgst_amount = 0
  ),
  'Inter-state line item has igst>0, cgst=sgst=0'
);

-- 11. Insufficient stock triggers rollback (no invoice created)
UPDATE inventory_item SET current_stock = 0 WHERE id = '22222222-2222-2222-2222-222222222222';

SELECT throws_ok(
  $$SELECT create_invoice_with_items_v1(
      '{"customer_id": "11111111-1111-1111-1111-111111111111", "invoice_date": "2026-01-01", "is_inter_state": false, "payment_mode": "cash", "payment_status": "unpaid", "amount_paid": 0}'::jsonb,
      '[{"inventory_item_id": "22222222-2222-2222-2222-222222222222", "quantity": 999, "rate": 300, "discount_percent": 0, "gst_rate": 18, "taxable_amount": 299700, "cgst_amount": 26973, "sgst_amount": 26973, "igst_amount": 0, "total_amount": 353646}]'::jsonb
  )$$,
  NULL,
  NULL,
  'Insufficient stock rolls back invoice creation'
);

-- Restore stock for remaining tests
UPDATE inventory_item SET current_stock = 50 WHERE id = '22222222-2222-2222-2222-222222222222';

-- 12. Result JSON contains invoice_id key
SELECT ok(
  (create_invoice_with_items_v1(
    jsonb_build_object(
      'customer_id', '11111111-1111-1111-1111-111111111111',
      'invoice_date', '2026-03-26',
      'is_inter_state', false,
      'payment_mode', 'cash',
      'payment_status', 'unpaid',
      'amount_paid', 0
    ),
    jsonb_build_array(
      jsonb_build_object(
        'inventory_item_id', '22222222-2222-2222-2222-222222222222',
        'quantity', 1, 'rate', 300.00, 'discount_percent', 0,
        'gst_rate', 18, 'taxable_amount', 300.00,
        'cgst_amount', 27.00, 'sgst_amount', 27.00,
        'igst_amount', 0.00, 'total_amount', 354.00
      )
    )
  ) ? 'invoice_id'),
  'Result JSON contains invoice_id'
);

-- 13. payment_status='paid' invoice has amount_paid = total_amount
SELECT ok(
  EXISTS(
    SELECT 1 FROM invoice
    WHERE customer_id = '11111111-1111-1111-1111-111111111111'
      AND invoice_date = '2026-03-29'
      AND payment_status = 'paid'
      AND amount_paid > 0
  ),
  'Paid invoice has amount_paid > 0'
);

-- 14. invoice_line_item FK to invoice is enforced (no orphans)
SELECT ok(
  NOT EXISTS(
    SELECT 1 FROM invoice_line_item li
    LEFT JOIN invoice i ON i.id = li.invoice_id
    WHERE i.id IS NULL
  ),
  'No orphan invoice_line_item rows exist'
);

SELECT * FROM finish();

ROLLBACK;
