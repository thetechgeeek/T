-- pgTAP smoke tests for Phase 3 hot-path query indexes.
-- Run with: supabase test db

BEGIN;

SELECT plan(8);

SELECT ok(
  EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_supplier_id'),
  'orders.supplier_id has a lookup index'
);

SELECT ok(
  EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payments_purchase_id'),
  'payments.purchase_id has a lookup index'
);

SELECT ok(
  EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_stock_operations_reference_id'),
  'stock_operations.reference_id has a partial lookup index'
);

SELECT ok(
  EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invoices_customer_status_date'),
  'invoices customer/status/date composite index exists'
);

SELECT ok(
  EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_customers_type_name'),
  'customers type/name composite index exists'
);

SELECT ok(
  EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_inventory_category_stock_sort'),
  'inventory legacy category/stock composite index exists'
);

SELECT ok(
  EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_inventory_category_id_stock_sort'),
  'inventory dynamic category/stock composite index exists'
);

SELECT ok(
  EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_inventory_supplier_stock_sort'),
  'inventory supplier/stock composite index exists'
);

SELECT * FROM finish();

ROLLBACK;
