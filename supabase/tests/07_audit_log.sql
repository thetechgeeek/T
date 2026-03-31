-- pgTAP tests for audit trail / stock operation log
-- Verifies stock_operation log entries are created for stock changes
-- Run with: supabase test db

BEGIN;

SELECT plan(10);

-- ─── Setup ────────────────────────────────────────────────────────────────────

-- Create test inventory item
INSERT INTO inventory_item (
  id, design_name, base_item_number, category, size, brand,
  grade, current_stock, pcs_per_box, cost_price, selling_price, gst_rate
)
VALUES (
  'audit001-0000-0000-0000-000000000001',
  'Audit Test Item', 'AUDIT-001', 'GLOSSY', '600x600', 'TestBrand',
  'A', 20, 10, 100.00, 150.00, 18
)
ON CONFLICT (id) DO UPDATE SET current_stock = 20;

-- ─── Tests ────────────────────────────────────────────────────────────────────

-- 1. stock_operation table exists
SELECT has_table('public', 'stock_operation', 'stock_operation table exists');

-- 2. stock_operation has item_id column
SELECT has_column('public', 'stock_operation', 'item_id', 'stock_operation.item_id exists');

-- 3. stock_operation has operation_type column
SELECT has_column('public', 'stock_operation', 'operation_type', 'stock_operation.operation_type exists');

-- 4. stock_operation has quantity column
SELECT has_column('public', 'stock_operation', 'quantity', 'stock_operation.quantity exists');

-- 5. Performing stock_in creates an audit row
SELECT perform_stock_operation_v1(
  'audit001-0000-0000-0000-000000000001'::uuid,
  'stock_in'::stock_op_type, 5, 'Audit test stock_in', null, null
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM stock_operation
    WHERE item_id = 'audit001-0000-0000-0000-000000000001'
      AND operation_type = 'stock_in'
      AND quantity = 5
  ),
  'stock_in creates audit log row'
);

-- 6. stock_in audit row has correct quantity
SELECT is(
  (SELECT quantity FROM stock_operation
   WHERE item_id = 'audit001-0000-0000-0000-000000000001'
     AND operation_type = 'stock_in'
   ORDER BY created_at DESC LIMIT 1),
  5,
  'stock_in audit log has quantity = 5'
);

-- 7. Performing stock_out creates a separate audit row
SELECT perform_stock_operation_v1(
  'audit001-0000-0000-0000-000000000001'::uuid,
  'stock_out'::stock_op_type, 3, 'Audit test stock_out', null, null
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM stock_operation
    WHERE item_id = 'audit001-0000-0000-0000-000000000001'
      AND operation_type = 'stock_out'
      AND quantity = 3
  ),
  'stock_out creates audit log row'
);

-- 8. Two audit rows exist for this item (stock_in + stock_out)
SELECT ok(
  (SELECT count(*)::int FROM stock_operation
   WHERE item_id = 'audit001-0000-0000-0000-000000000001') >= 2,
  'Two audit rows exist for item'
);

-- 9. Audit row has notes/reason saved
SELECT ok(
  EXISTS (
    SELECT 1 FROM stock_operation
    WHERE item_id = 'audit001-0000-0000-0000-000000000001'
      AND notes ILIKE '%Audit test stock_in%'
  ),
  'Audit row stores reason/notes'
);

-- 10. Inventory current_stock is updated correctly (20 + 5 - 3 = 22)
SELECT is(
  (SELECT current_stock FROM inventory_item WHERE id = 'audit001-0000-0000-0000-000000000001'),
  22,
  'current_stock is 22 after +5 and -3 operations'
);

SELECT * FROM finish();

ROLLBACK;
