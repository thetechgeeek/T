-- Migration 007: Views, Reporting Functions, RLS, and Storage Buckets
-- ─── Views ───────────────────────────────────────────────────────

CREATE OR REPLACE VIEW customer_ledger_summary AS
SELECT
  c.id AS customer_id,
  c.name AS customer_name,
  COALESCE(SUM(i.grand_total), 0) AS total_invoiced,
  COALESCE(SUM(i.amount_paid), 0) AS total_paid,
  COALESCE(SUM(i.grand_total - i.amount_paid), 0) AS outstanding_balance,
  MAX(i.invoice_date) AS last_invoice_date,
  MAX(p.payment_date) AS last_payment_date
FROM customers c
LEFT JOIN invoices i ON i.customer_id = c.id
LEFT JOIN payments p ON p.customer_id = c.id AND p.direction = 'received'
GROUP BY c.id, c.name;

CREATE OR REPLACE VIEW supplier_ledger_summary AS
SELECT
  s.id AS supplier_id,
  s.name AS supplier_name,
  COALESCE(SUM(pu.grand_total), 0) AS total_purchased,
  COALESCE(SUM(pu.amount_paid), 0) AS total_paid,
  COALESCE(SUM(pu.grand_total - pu.amount_paid), 0) AS outstanding_balance
FROM suppliers s
LEFT JOIN purchases pu ON pu.supplier_id = s.id
GROUP BY s.id, s.name;

CREATE OR REPLACE VIEW daily_sales AS
SELECT
  i.invoice_date AS date,
  COUNT(*) AS invoice_count,
  SUM(i.grand_total) AS total_revenue,
  COALESCE(SUM(CASE WHEN i.payment_mode = 'cash' THEN i.amount_paid ELSE 0 END), 0) AS cash_amount,
  COALESCE(SUM(CASE WHEN i.payment_mode = 'upi' THEN i.amount_paid ELSE 0 END), 0) AS upi_amount,
  COALESCE(SUM(CASE WHEN i.payment_status IN ('unpaid', 'partial') THEN (i.grand_total - i.amount_paid) ELSE 0 END), 0) AS credit_amount
FROM invoices i
GROUP BY i.invoice_date
ORDER BY i.invoice_date DESC;

CREATE OR REPLACE VIEW low_stock_items AS
SELECT *
FROM inventory_items
WHERE low_stock_threshold > 0 AND box_count <= low_stock_threshold
ORDER BY box_count ASC;

-- ─── Reporting Functions ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_aging_report(p_customer_id UUID DEFAULT NULL)
RETURNS TABLE (
  customer_id UUID,
  customer_name TEXT,
  current_0_30 NUMERIC,
  overdue_31_60 NUMERIC,
  overdue_61_90 NUMERIC,
  overdue_90_plus NUMERIC,
  total_outstanding NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    COALESCE(SUM(CASE 
      WHEN (CURRENT_DATE - i.invoice_date) BETWEEN 0 AND 30 
      THEN i.grand_total - i.amount_paid ELSE 0 END), 0),
    COALESCE(SUM(CASE 
      WHEN (CURRENT_DATE - i.invoice_date) BETWEEN 31 AND 60 
      THEN i.grand_total - i.amount_paid ELSE 0 END), 0),
    COALESCE(SUM(CASE 
      WHEN (CURRENT_DATE - i.invoice_date) BETWEEN 61 AND 90 
      THEN i.grand_total - i.amount_paid ELSE 0 END), 0),
    COALESCE(SUM(CASE 
      WHEN (CURRENT_DATE - i.invoice_date) > 90 
      THEN i.grand_total - i.amount_paid ELSE 0 END), 0),
    COALESCE(SUM(i.grand_total - i.amount_paid), 0)
  FROM customers c
  LEFT JOIN invoices i ON i.customer_id = c.id 
    AND i.payment_status IN ('unpaid', 'partial')
  WHERE (p_customer_id IS NULL OR c.id = p_customer_id)
  GROUP BY c.id, c.name
  HAVING COALESCE(SUM(i.grand_total - i.amount_paid), 0) > 0
  ORDER BY COALESCE(SUM(i.grand_total - i.amount_paid), 0) DESC;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_profit_loss(p_start DATE, p_end DATE)
RETURNS TABLE (
  total_revenue NUMERIC,
  total_cogs NUMERIC,
  gross_profit NUMERIC,
  total_expenses NUMERIC,
  net_profit NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE((SELECT SUM(grand_total) FROM invoices WHERE invoice_date BETWEEN p_start AND p_end), 0),
    COALESCE((
      SELECT SUM(ili.quantity * ii.cost_price)
      FROM invoice_line_items ili
      JOIN invoices inv ON inv.id = ili.invoice_id
      JOIN inventory_items ii ON ii.id = ili.item_id
      WHERE inv.invoice_date BETWEEN p_start AND p_end
    ), 0),
    COALESCE((SELECT SUM(grand_total) FROM invoices WHERE invoice_date BETWEEN p_start AND p_end), 0)
    - COALESCE((
      SELECT SUM(ili.quantity * ii.cost_price)
      FROM invoice_line_items ili
      JOIN invoices inv ON inv.id = ili.invoice_id
      JOIN inventory_items ii ON ii.id = ili.item_id
      WHERE inv.invoice_date BETWEEN p_start AND p_end
    ), 0),
    COALESCE((SELECT SUM(amount) FROM expenses WHERE expense_date BETWEEN p_start AND p_end), 0),
    (
      COALESCE((SELECT SUM(grand_total) FROM invoices WHERE invoice_date BETWEEN p_start AND p_end), 0)
      - COALESCE((
        SELECT SUM(ili.quantity * ii.cost_price)
        FROM invoice_line_items ili
        JOIN invoices inv ON inv.id = ili.invoice_id
        JOIN inventory_items ii ON ii.id = ili.item_id
        WHERE inv.invoice_date BETWEEN p_start AND p_end
      ), 0)
      - COALESCE((SELECT SUM(amount) FROM expenses WHERE expense_date BETWEEN p_start AND p_end), 0)
    );
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  v_today_sales NUMERIC;
  v_today_count INTEGER;
  v_outstanding NUMERIC;
  v_outstanding_customers INTEGER;
  v_low_stock INTEGER;
  v_monthly_revenue NUMERIC;
  v_month_start DATE;
BEGIN
  v_month_start := DATE_TRUNC('month', CURRENT_DATE)::DATE;

  SELECT COALESCE(SUM(grand_total), 0), COUNT(*)
  INTO v_today_sales, v_today_count
  FROM invoices
  WHERE invoice_date = CURRENT_DATE;

  SELECT COALESCE(SUM(grand_total - amount_paid), 0), COUNT(DISTINCT customer_id)
  INTO v_outstanding, v_outstanding_customers
  FROM invoices
  WHERE payment_status IN ('unpaid', 'partial');

  SELECT COUNT(*) INTO v_low_stock FROM low_stock_items;

  SELECT COALESCE(SUM(grand_total), 0) INTO v_monthly_revenue
  FROM invoices
  WHERE invoice_date >= v_month_start;

  RETURN json_build_object(
    'today_sales', v_today_sales,
    'today_invoice_count', v_today_count,
    'total_outstanding_credit', v_outstanding,
    'total_outstanding_customers', v_outstanding_customers,
    'low_stock_count', v_low_stock,
    'monthly_revenue', v_monthly_revenue
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ─── Row Level Security ──────────────────────────────────────────

ALTER TABLE business_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated users (single-user app)
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'business_profile','customers','suppliers','orders',
    'inventory_items','stock_operations','invoices','invoice_line_items',
    'purchases','purchase_line_items','payments','expenses'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('CREATE POLICY "auth_full_access" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;

-- ─── Storage Buckets ─────────────────────────────────────────────
-- Run these in the Supabase dashboard > Storage, or via the API:

-- INSERT INTO storage.buckets (id, name, public) VALUES ('tile-images', 'tile-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('invoices', 'invoices', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('order-pdfs', 'order-pdfs', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('business', 'business', false);
