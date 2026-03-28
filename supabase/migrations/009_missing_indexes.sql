-- Payment direction lookups (customer_ledger_summary view)
CREATE INDEX IF NOT EXISTS idx_payments_direction ON payments (direction);

-- Expense category aggregation (finance reports)
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category);

-- Supplier lookups on purchases (supplier ledger)
CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON purchases (supplier_id);

-- Line item → inventory item joins (COGS, stock history)
CREATE INDEX IF NOT EXISTS idx_line_items_item ON invoice_line_items (item_id);

-- Purchase line item → purchase joins
CREATE INDEX IF NOT EXISTS idx_purchase_line_items_purchase ON purchase_line_items (purchase_id);
