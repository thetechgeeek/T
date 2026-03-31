-- pgTAP tests for schema integrity — tables, columns, constraints, foreign keys
-- Run with: supabase test db

BEGIN;

SELECT plan(30);

-- ─── Core Tables Exist ────────────────────────────────────────────────────────

SELECT has_table('public', 'customer',        'customer table exists');
SELECT has_table('public', 'invoice',         'invoice table exists');
SELECT has_table('public', 'invoice_line_item', 'invoice_line_item table exists');
SELECT has_table('public', 'inventory_item',  'inventory_item table exists');
SELECT has_table('public', 'stock_operation', 'stock_operation table exists');
SELECT has_table('public', 'payment',         'payment table exists');
SELECT has_table('public', 'expense',         'expense table exists');
SELECT has_table('public', 'supplier',        'supplier table exists');
SELECT has_table('public', 'notification',    'notification table exists');

-- ─── Primary Keys ─────────────────────────────────────────────────────────────

SELECT col_is_pk('public', 'customer',       'id', 'customer.id is PK');
SELECT col_is_pk('public', 'invoice',        'id', 'invoice.id is PK');
SELECT col_is_pk('public', 'inventory_item', 'id', 'inventory_item.id is PK');
SELECT col_is_pk('public', 'payment',        'id', 'payment.id is PK');
SELECT col_is_pk('public', 'expense',        'id', 'expense.id is PK');
SELECT col_is_pk('public', 'supplier',       'id', 'supplier.id is PK');

-- ─── NOT NULL constraints on required fields ───────────────────────────────

SELECT col_not_null('public', 'customer',       'name',           'customer.name NOT NULL');
SELECT col_not_null('public', 'invoice',        'customer_id',    'invoice.customer_id NOT NULL');
SELECT col_not_null('public', 'invoice',        'invoice_number', 'invoice.invoice_number NOT NULL');
SELECT col_not_null('public', 'inventory_item', 'design_name',    'inventory_item.design_name NOT NULL');
SELECT col_not_null('public', 'inventory_item', 'current_stock',  'inventory_item.current_stock NOT NULL');
SELECT col_not_null('public', 'expense',        'amount',         'expense.amount NOT NULL');
SELECT col_not_null('public', 'expense',        'category',       'expense.category NOT NULL');

-- ─── Foreign Keys ─────────────────────────────────────────────────────────────

SELECT fk_ok(
  'public', 'invoice', 'customer_id',
  'public', 'customer', 'id',
  'invoice.customer_id -> customer.id FK exists'
);

SELECT fk_ok(
  'public', 'invoice_line_item', 'invoice_id',
  'public', 'invoice', 'id',
  'invoice_line_item.invoice_id -> invoice.id FK exists'
);

SELECT fk_ok(
  'public', 'payment', 'invoice_id',
  'public', 'invoice', 'id',
  'payment.invoice_id -> invoice.id FK exists (nullable)'
);

SELECT fk_ok(
  'public', 'stock_operation', 'item_id',
  'public', 'inventory_item', 'id',
  'stock_operation.item_id -> inventory_item.id FK exists'
);

-- ─── RPC Functions Exist ──────────────────────────────────────────────────────

SELECT has_function('public', 'create_invoice_with_items_v1', 'create_invoice_with_items_v1 exists');
SELECT has_function('public', 'perform_stock_operation_v1',   'perform_stock_operation_v1 exists');
SELECT has_function('public', 'record_payment_with_invoice_update_v1', 'record_payment RPC exists');

SELECT * FROM finish();

ROLLBACK;
