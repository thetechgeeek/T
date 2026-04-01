-- pgTAP tests for perform_stock_operation_v1 / perform_stock_operation
-- Run with: supabase test db
-- Requires pgTAP extension

BEGIN;

SELECT plan(14);

-- ─── Setup ────────────────────────────────────────────────────────────────────

-- Create a test inventory item
INSERT INTO inventory_item (
  id, design_name, base_item_number, category, size, brand,
  grade, current_stock, pcs_per_box, cost_price, selling_price, gst_rate
)
VALUES (
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  'Test Marble', 'TEST-001', 'FLOOR', '600x600', 'TestBrand',
  'A', 10, 10, 100.00, 150.00, 18
)
ON CONFLICT (id) DO UPDATE SET current_stock = 10;

-- ─── Tests ────────────────────────────────────────────────────────────────────

-- 1. stock_in increases quantity
SELECT perform_stock_operation_v1(
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid,
  'stock_in'::stock_op_type, 5, 'Test restock', null, null
);

SELECT is(
  (SELECT current_stock FROM inventory_item WHERE id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'),
  15,
  'stock_in increases current_stock'
);

-- 2. stock_out decreases quantity
SELECT perform_stock_operation_v1(
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid,
  'stock_out'::stock_op_type, 3, 'Test sale', null, null
);

SELECT is(
  (SELECT current_stock FROM inventory_item WHERE id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'),
  12,
  'stock_out decreases current_stock'
);

-- 3. stock_out below zero is rejected
SELECT throws_ok(
  $$SELECT perform_stock_operation_v1(
      'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid,
      'stock_out'::stock_op_type, 999, 'over-sell', null, null
  )$$,
  'Insufficient stock'
);

-- 4. Stock operation log row is created
SELECT is(
  (SELECT count(*)::int FROM stock_operation
   WHERE item_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'),
  2,
  'Two stock_operation rows were written'
);

-- 5. adjustment operation sets stock to absolute value
SELECT perform_stock_operation_v1(
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid,
  'adjustment'::stock_op_type, 7, 'Counted', null, null
);

SELECT is(
  (SELECT current_stock FROM inventory_item WHERE id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'),
  7,
  'adjustment sets stock to absolute value'
);

-- 6. v1 alias returns same result as base function
SELECT is(
  perform_stock_operation_v1(
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid,
    'stock_in'::stock_op_type, 1, null, null, null
  ),
  perform_stock_operation(
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid,
    'stock_in'::stock_op_type, 1, null, null, null
  ) - 1, -- both already incremented, so _v1 result = base - 1
  'v1 alias delegates to base function'
);

-- 7. reason is stored in stock_operation
SELECT ok(
  EXISTS(
    SELECT 1 FROM stock_operation
    WHERE item_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
    AND reason = 'Test restock'
  ),
  'reason is persisted in stock_operation'
);

-- 8. nonexistent item raises error
SELECT throws_ok(
  $$SELECT perform_stock_operation_v1(
      '00000000-0000-0000-0000-000000000000'::uuid,
      'stock_in'::stock_op_type, 1, null, null, null
  )$$,
  NULL,
  NULL,
  'nonexistent item raises exception'
);

-- ─── Extended Tests (DB-001 additions) ───────────────────────────────────────

-- 9. stock_out exactly to 0 is allowed
SELECT perform_stock_operation_v1(
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid,
  'stock_out'::stock_op_type, 9, 'Sell remainder', null, null
);

SELECT is(
  (SELECT current_stock FROM inventory_item WHERE id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'),
  0,
  'stock_out to exactly 0 is allowed'
);

-- 10. stock_out below 0 is rejected (already 0, try -1)
SELECT throws_ok(
  $$SELECT perform_stock_operation_v1(
      'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid,
      'stock_out'::stock_op_type, 1, 'over-sell after zero', null, null
  )$$,
  'Insufficient stock'
);

-- 11. Multiple successive stock_in calls accumulate correctly
SELECT perform_stock_operation_v1('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid, 'stock_in'::stock_op_type, 10, null, null, null);
SELECT perform_stock_operation_v1('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid, 'stock_in'::stock_op_type, 5,  null, null, null);

SELECT is(
  (SELECT current_stock FROM inventory_item WHERE id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'),
  15,
  'Successive stock_in operations accumulate: 0+10+5=15'
);

-- 12. Each operation writes its own audit row (total rows ≥ 6 after all ops above)
SELECT ok(
  (SELECT count(*)::int FROM stock_operation
   WHERE item_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee') >= 6,
  'Each stock operation creates its own audit row'
);

-- 13. stock_operation row has a created_at timestamp
SELECT ok(
  EXISTS(
    SELECT 1 FROM stock_operation
    WHERE item_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
      AND created_at IS NOT NULL
  ),
  'stock_operation audit rows have created_at timestamp'
);

-- 14. item_id column references inventory_item (FK constraint present)
SELECT fk_ok(
  'public', 'stock_operation', 'item_id',
  'public', 'inventory_item', 'id',
  'stock_operation.item_id has FK to inventory_item.id'
);

SELECT * FROM finish();

ROLLBACK;
