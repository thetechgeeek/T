-- Phase 3 performance indexes for the hot mobile query paths documented in
-- docs/DATABASE_INDEX_PROFILE.md. Keep these narrow and aligned to actual
-- filters/sorts so write overhead stays predictable.

-- Order list/detail screens filter orders by supplier.
CREATE INDEX IF NOT EXISTS idx_orders_supplier_id ON orders (supplier_id);
COMMENT ON INDEX idx_orders_supplier_id IS
  'Supports supplier-scoped order lookup and supplier ledger joins.';

-- Purchase payment screens join payments back to purchases.
CREATE INDEX IF NOT EXISTS idx_payments_purchase_id ON payments (purchase_id);
COMMENT ON INDEX idx_payments_purchase_id IS
  'Supports purchase payment lookup without scanning all payment records.';

-- Stock operation replay and audit trails filter by external reference id.
CREATE INDEX IF NOT EXISTS idx_stock_operations_reference_id
  ON stock_operations (reference_id)
  WHERE reference_id IS NOT NULL;
COMMENT ON INDEX idx_stock_operations_reference_id IS
  'Supports stock history lookup by invoice, purchase, transfer, or adjustment reference.';

-- Invoice list applies customer/status/date filters and sorts newest-first.
CREATE INDEX IF NOT EXISTS idx_invoices_customer_status_date
  ON invoices (customer_id, payment_status, invoice_date DESC, created_at DESC);
COMMENT ON INDEX idx_invoices_customer_status_date IS
  'Supports customer invoice history and status-filtered invoice list queries.';

-- Customer list applies type filters and stable name ordering.
CREATE INDEX IF NOT EXISTS idx_customers_type_name
  ON customers (type, name);
COMMENT ON INDEX idx_customers_type_name IS
  'Supports typed customer list queries ordered by customer name.';

-- Inventory list filters by legacy enum category and stock count.
CREATE INDEX IF NOT EXISTS idx_inventory_category_stock_sort
  ON inventory_items (category, box_count, created_at DESC);
COMMENT ON INDEX idx_inventory_category_stock_sort IS
  'Supports category-filtered inventory list and low-stock ordering.';

-- Inventory list also supports dynamic categories added in migration 022.
CREATE INDEX IF NOT EXISTS idx_inventory_category_id_stock_sort
  ON inventory_items (category_id, box_count, created_at DESC)
  WHERE category_id IS NOT NULL;
COMMENT ON INDEX idx_inventory_category_id_stock_sort IS
  'Supports dynamic category-filtered inventory list and low-stock ordering.';

-- Supplier-filtered inventory list is a high-cardinality support path.
CREATE INDEX IF NOT EXISTS idx_inventory_supplier_stock_sort
  ON inventory_items (supplier_id, box_count, created_at DESC)
  WHERE supplier_id IS NOT NULL;
COMMENT ON INDEX idx_inventory_supplier_stock_sort IS
  'Supports supplier-filtered inventory list queries.';
