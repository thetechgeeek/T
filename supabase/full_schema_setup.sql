-- Migration 001: Extensions and Enums
-- Run this in Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS moddatetime;

-- Enums
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tile_category') THEN
        CREATE TYPE tile_category AS ENUM ('GLOSSY', 'FLOOR', 'MATT', 'SATIN', 'WOODEN', 'ELEVATION', 'OTHER');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gst_slab') THEN
        CREATE TYPE gst_slab AS ENUM ('5', '12', '18', '28');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('paid', 'partial', 'unpaid');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_mode') THEN
        CREATE TYPE payment_mode AS ENUM ('cash', 'upi', 'bank_transfer', 'credit', 'cheque');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customer_type') THEN
        CREATE TYPE customer_type AS ENUM ('retail', 'contractor', 'builder', 'dealer');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('ordered', 'partially_received', 'fully_received', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stock_op_type') THEN
        CREATE TYPE stock_op_type AS ENUM ('stock_in', 'stock_out', 'adjustment', 'transfer', 'return');
    END IF;
END $$;

-- Business Profile (singleton)
CREATE TABLE IF NOT EXISTS business_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  gstin TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  state_code TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  invoice_prefix TEXT NOT NULL DEFAULT 'TM',
  invoice_sequence BIGINT NOT NULL DEFAULT 0,
  financial_year_start DATE,
  terms_and_conditions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER handle_updated_at
  BEFORE UPDATE ON business_profile
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);
-- Migration 002: Customers and Suppliers

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  gstin TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  type customer_type NOT NULL DEFAULT 'retail',
  credit_limit NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  gstin TEXT,
  address TEXT,
  city TEXT,
  payment_terms TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fuzzy search and quick lookup
CREATE INDEX IF NOT EXISTS idx_customers_name_trgm ON customers USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_suppliers_name_trgm ON suppliers USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers (phone);

-- Updated_at triggers
CREATE OR REPLACE TRIGGER handle_updated_at_customers
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

CREATE OR REPLACE TRIGGER handle_updated_at_suppliers
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);
-- Migration 003: Orders and Inventory Items

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  party_name TEXT,
  city TEXT,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_weight NUMERIC,
  total_quantity INTEGER,
  status order_status NOT NULL DEFAULT 'ordered',
  source_pdf_url TEXT,
  raw_llm_response JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Function to extract base item number from design_name
-- Strips suffixes like -D, -L, -F, -HL, -HL-1-A, -ELE, -ELEVATION
CREATE OR REPLACE FUNCTION extract_base_item_number(design_name TEXT)
RETURNS TEXT AS $$
DECLARE
  stripped TEXT;
  base_match TEXT;
BEGIN
  -- Strip known suffixes (case-insensitive)
  stripped := regexp_replace(
    design_name,
    '-(?:HL(?:-\d+(?:-[A-Z])?)?|ELEVATION|ELE|[DLFABCM]\d*).*$',
    '',
    'i'
  );
  
  -- Extract the first 4+ digit numeric sequence
  base_match := (regexp_match(stripped, '\d{4,}'))[1];
  
  IF base_match IS NOT NULL THEN
    RETURN base_match;
  ELSE
    RETURN stripped;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Inventory Items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_name TEXT NOT NULL UNIQUE,
  base_item_number TEXT,           -- auto-populated by trigger
  brand_name TEXT,
  category tile_category NOT NULL DEFAULT 'OTHER',
  size_name TEXT,
  grade TEXT,
  pcs_per_box INTEGER,
  weight_per_box NUMERIC,
  sqft_per_box NUMERIC,
  sqm_per_box NUMERIC,
  tile_image_url TEXT,
  box_count INTEGER NOT NULL DEFAULT 0,
  cost_price NUMERIC NOT NULL DEFAULT 0,
  selling_price NUMERIC NOT NULL DEFAULT 0,
  gst_rate INTEGER NOT NULL DEFAULT 18,
  hsn_code TEXT NOT NULL DEFAULT '6908',
  location TEXT,
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  party_name TEXT,
  last_restocked TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to auto-populate base_item_number
CREATE OR REPLACE FUNCTION set_base_item_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.base_item_number := extract_base_item_number(NEW.design_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_set_base_item_number
  BEFORE INSERT OR UPDATE OF design_name ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION set_base_item_number();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_base_number ON inventory_items (base_item_number);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items (category);
CREATE INDEX IF NOT EXISTS idx_inventory_design_trgm ON inventory_items USING GIN (design_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_inventory_box_count ON inventory_items (box_count);
CREATE INDEX IF NOT EXISTS idx_inventory_supplier ON inventory_items (supplier_id);

-- Updated_at triggers
CREATE OR REPLACE TRIGGER handle_updated_at_orders
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

CREATE OR REPLACE TRIGGER handle_updated_at_inventory
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);
-- Migration 004: Stock Operations

CREATE TABLE IF NOT EXISTS stock_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  operation_type stock_op_type NOT NULL,
  quantity_change INTEGER NOT NULL,
  previous_quantity INTEGER,
  new_quantity INTEGER,
  reason TEXT,
  reference_type TEXT CHECK (reference_type IN ('invoice', 'purchase', 'adjustment', 'transfer', 'return')),
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient history queries per item
CREATE INDEX IF NOT EXISTS idx_stock_ops_item_date ON stock_operations (item_id, created_at DESC);

-- Atomic stock operation function
-- Returns the new stock count or raises an error if stock would go negative
CREATE OR REPLACE FUNCTION perform_stock_operation(
  p_item_id UUID,
  p_operation_type stock_op_type,
  p_quantity_change INTEGER,
  p_reason TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_current_qty INTEGER;
  v_new_qty INTEGER;
BEGIN
  -- Lock the row for update
  SELECT box_count INTO v_current_qty
  FROM inventory_items
  WHERE id = p_item_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item % not found', p_item_id;
  END IF;

  v_new_qty := v_current_qty + p_quantity_change;

  -- Validate non-negative stock
  IF v_new_qty < 0 THEN
    RAISE EXCEPTION 'Insufficient stock. Current: %, Requested change: %', v_current_qty, p_quantity_change;
  END IF;

  -- Insert stock operation record
  INSERT INTO stock_operations (
    item_id, operation_type, quantity_change,
    previous_quantity, new_quantity, reason,
    reference_type, reference_id
  ) VALUES (
    p_item_id, p_operation_type, p_quantity_change,
    v_current_qty, v_new_qty, p_reason,
    p_reference_type, p_reference_id
  );

  -- Update inventory
  UPDATE inventory_items
  SET box_count = v_new_qty,
      last_restocked = CASE 
        WHEN p_quantity_change > 0 THEN now() 
        ELSE last_restocked 
      END
  WHERE id = p_item_id;

  RETURN v_new_qty;
END;
$$ LANGUAGE plpgsql;
-- Migration 005: Invoicing

-- Invoice number generator
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  v_id UUID;
  v_prefix TEXT;
  v_seq BIGINT;
  v_fy TEXT;
BEGIN
  SELECT id, invoice_prefix, invoice_sequence INTO v_id, v_prefix, v_seq
  FROM business_profile
  LIMIT 1
  FOR UPDATE;

  -- Calculate financial year string
  v_fy := CASE 
    WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 4 
    THEN EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' || LPAD((EXTRACT(YEAR FROM CURRENT_DATE) + 1 - 2000)::TEXT, 2, '0')
    ELSE (EXTRACT(YEAR FROM CURRENT_DATE) - 1)::TEXT || '-' || LPAD((EXTRACT(YEAR FROM CURRENT_DATE) - 2000)::TEXT, 2, '0')
  END;

  v_seq := v_seq + 1;

  UPDATE business_profile SET invoice_sequence = v_seq WHERE id = v_id;

  RETURN v_prefix || '/' || v_fy || '/' || LPAD(v_seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_gstin TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  cgst_total NUMERIC NOT NULL DEFAULT 0,
  sgst_total NUMERIC NOT NULL DEFAULT 0,
  igst_total NUMERIC NOT NULL DEFAULT 0,
  discount_total NUMERIC NOT NULL DEFAULT 0,
  grand_total NUMERIC NOT NULL DEFAULT 0,
  is_inter_state BOOLEAN NOT NULL DEFAULT false,
  payment_status payment_status NOT NULL DEFAULT 'unpaid',
  payment_mode payment_mode,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  terms TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invoice Line Items table
CREATE TABLE IF NOT EXISTS invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  design_name TEXT NOT NULL,
  description TEXT,
  hsn_code TEXT,
  quantity INTEGER NOT NULL,
  rate_per_unit NUMERIC NOT NULL,
  discount NUMERIC NOT NULL DEFAULT 0,
  taxable_amount NUMERIC NOT NULL,
  gst_rate INTEGER NOT NULL,
  cgst_amount NUMERIC NOT NULL DEFAULT 0,
  sgst_amount NUMERIC NOT NULL DEFAULT 0,
  igst_amount NUMERIC NOT NULL DEFAULT 0,
  line_total NUMERIC NOT NULL,
  tile_image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices (invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices (customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON invoices (payment_status);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice ON invoice_line_items (invoice_id);

CREATE OR REPLACE TRIGGER handle_updated_at_invoices
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);
-- Migration 006: Finance (Purchases, Payments, Expenses)

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_number TEXT,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_total NUMERIC NOT NULL DEFAULT 0,
  grand_total NUMERIC NOT NULL DEFAULT 0,
  payment_status payment_status NOT NULL DEFAULT 'unpaid',
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Purchase Line Items
CREATE TABLE IF NOT EXISTS purchase_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  design_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  rate_per_unit NUMERIC NOT NULL,
  amount NUMERIC NOT NULL
);

-- Payments (receivable from customers or payable to suppliers)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC NOT NULL,
  payment_mode payment_mode NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('received', 'made')),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Either customer or supplier, not both
  CONSTRAINT payment_direction_check CHECK (
    (customer_id IS NOT NULL AND supplier_id IS NULL) OR
    (supplier_id IS NOT NULL AND customer_id IS NULL) OR
    (customer_id IS NULL AND supplier_id IS NULL)
  )
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  receipt_image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments (customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_supplier ON payments (supplier_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments (invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments (payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (expense_date DESC);

CREATE OR REPLACE TRIGGER handle_updated_at_purchases
  BEFORE UPDATE ON purchases
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

CREATE OR REPLACE TRIGGER handle_updated_at_expenses
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);
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

DROP FUNCTION IF EXISTS get_aging_report(uuid);
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

DROP FUNCTION IF EXISTS get_profit_loss(date, date);
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

DROP FUNCTION IF EXISTS get_dashboard_stats();
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
    EXECUTE format('DROP POLICY IF EXISTS "auth_full_access" ON %I', t);
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
-- 1.1a: Change invoice_line_items.quantity from INTEGER to NUMERIC
--        Tiles can be sold in fractional box quantities (e.g., 2.5 boxes)
--        Review §6.4
ALTER TABLE invoice_line_items ALTER COLUMN quantity TYPE NUMERIC USING quantity::NUMERIC;

-- 1.1b: Change purchase_line_items.quantity from INTEGER to NUMERIC (same reason)
ALTER TABLE purchase_line_items ALTER COLUMN quantity TYPE NUMERIC USING quantity::NUMERIC;

-- 1.1c: Add missing updated_at column + trigger to payments table
--        Review §6.5
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
CREATE OR REPLACE TRIGGER handle_updated_at_payments
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

-- 1.1d: Add place_of_supply to invoices (required for GST inter-state determination)
--        Review §28.1
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS place_of_supply TEXT;

-- 1.1e: Add reverse_charge flag to invoices (required on GST invoices even if "No")
--        Review §28.1
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS reverse_charge BOOLEAN NOT NULL DEFAULT false;
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
DROP FUNCTION IF EXISTS get_profit_loss(date, date);
CREATE OR REPLACE FUNCTION get_profit_loss(p_start DATE, p_end DATE)
RETURNS TABLE (
  total_revenue NUMERIC,
  total_cogs NUMERIC,
  gross_profit NUMERIC,
  total_expenses NUMERIC,
  net_profit NUMERIC
) AS $$
DECLARE
  v_revenue NUMERIC;
  v_cogs NUMERIC;
  v_expenses NUMERIC;
BEGIN
  SELECT COALESCE(SUM(grand_total), 0) INTO v_revenue
  FROM invoices WHERE invoice_date BETWEEN p_start AND p_end;

  SELECT COALESCE(SUM(ili.quantity * ii.cost_price), 0) INTO v_cogs
  FROM invoice_line_items ili
  JOIN invoices inv ON inv.id = ili.invoice_id
  JOIN inventory_items ii ON ii.id = ili.item_id
  WHERE inv.invoice_date BETWEEN p_start AND p_end;

  SELECT COALESCE(SUM(amount), 0) INTO v_expenses
  FROM expenses WHERE expense_date BETWEEN p_start AND p_end;

  RETURN QUERY SELECT v_revenue, v_cogs, (v_revenue - v_cogs), v_expenses, (v_revenue - v_cogs - v_expenses);
END;
$$ LANGUAGE plpgsql STABLE;
CREATE OR REPLACE FUNCTION create_invoice_with_items(
  p_invoice JSONB,
  p_line_items JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_invoice_number TEXT;
  v_invoice_id UUID;
  v_item JSONB;
BEGIN
  -- 1. Generate invoice number (locked row — inside same transaction)
  v_invoice_number := generate_invoice_number();

  -- 2. Insert invoice
  INSERT INTO invoices (
    invoice_number, invoice_date, customer_id, customer_name,
    customer_gstin, customer_phone, customer_address,
    subtotal, cgst_total, sgst_total, igst_total, discount_total, grand_total,
    is_inter_state, place_of_supply, reverse_charge,
    payment_status, payment_mode, amount_paid, notes, terms
  )
  SELECT
    v_invoice_number,
    (p_invoice->>'invoice_date')::DATE,
    (p_invoice->>'customer_id')::UUID,
    p_invoice->>'customer_name',
    p_invoice->>'customer_gstin',
    p_invoice->>'customer_phone',
    p_invoice->>'customer_address',
    (p_invoice->>'subtotal')::NUMERIC,
    (p_invoice->>'cgst_total')::NUMERIC,
    (p_invoice->>'sgst_total')::NUMERIC,
    (p_invoice->>'igst_total')::NUMERIC,
    (p_invoice->>'discount_total')::NUMERIC,
    (p_invoice->>'grand_total')::NUMERIC,
    (p_invoice->>'is_inter_state')::BOOLEAN,
    p_invoice->>'place_of_supply',
    COALESCE((p_invoice->>'reverse_charge')::BOOLEAN, false),
    (p_invoice->>'payment_status')::payment_status,
    (p_invoice->>'payment_mode')::payment_mode,
    COALESCE((p_invoice->>'amount_paid')::NUMERIC, 0),
    p_invoice->>'notes',
    p_invoice->>'terms'
  RETURNING id INTO v_invoice_id;

  -- 3. Insert all line items in one batch
  INSERT INTO invoice_line_items (
    invoice_id, item_id, design_name, description, hsn_code,
    quantity, rate_per_unit, discount, taxable_amount,
    gst_rate, cgst_amount, sgst_amount, igst_amount, line_total,
    tile_image_url, sort_order
  )
  SELECT
    v_invoice_id,
    (item->>'item_id')::UUID,
    item->>'design_name',
    item->>'description',
    item->>'hsn_code',
    (item->>'quantity')::NUMERIC,
    (item->>'rate_per_unit')::NUMERIC,
    COALESCE((item->>'discount')::NUMERIC, 0),
    (item->>'taxable_amount')::NUMERIC,
    (item->>'gst_rate')::INTEGER,
    COALESCE((item->>'cgst_amount')::NUMERIC, 0),
    COALESCE((item->>'sgst_amount')::NUMERIC, 0),
    COALESCE((item->>'igst_amount')::NUMERIC, 0),
    (item->>'line_total')::NUMERIC,
    item->>'tile_image_url',
    (item->>'sort_order')::INTEGER
  FROM jsonb_array_elements(p_line_items) AS item;

  -- 4. Stock deductions — all or nothing
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_line_items)
  LOOP
    IF (v_item->>'item_id') IS NOT NULL THEN
      PERFORM perform_stock_operation(
        (v_item->>'item_id')::UUID,
        'stock_out',
        -((v_item->>'quantity')::INTEGER),
        'Invoice #' || v_invoice_number,
        'invoice',
        v_invoice_id
      );
    END IF;
  END LOOP;

  -- If ANY step above fails, the entire transaction rolls back
  RETURN jsonb_build_object(
    'id', v_invoice_id,
    'invoice_number', v_invoice_number
  );
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION record_payment_with_invoice_update(
  p_payment JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_payment_id UUID;
  v_invoice_id UUID;
  v_new_paid NUMERIC;
  v_grand_total NUMERIC;
  v_new_status payment_status;
BEGIN
  v_invoice_id := (p_payment->>'invoice_id')::UUID;

  -- 1. Insert payment
  INSERT INTO payments (
    payment_date, amount, payment_mode, direction,
    customer_id, supplier_id, invoice_id, purchase_id, notes
  )
  SELECT
    (p_payment->>'payment_date')::DATE,
    (p_payment->>'amount')::NUMERIC,
    (p_payment->>'payment_mode')::payment_mode,
    p_payment->>'direction',
    (p_payment->>'customer_id')::UUID,
    (p_payment->>'supplier_id')::UUID,
    v_invoice_id,
    (p_payment->>'purchase_id')::UUID,
    p_payment->>'notes'
  RETURNING id INTO v_payment_id;

  -- 2. If linked to an invoice, atomically update amount_paid + status
  IF v_invoice_id IS NOT NULL THEN
    SELECT grand_total, amount_paid + (p_payment->>'amount')::NUMERIC
    INTO v_grand_total, v_new_paid
    FROM invoices
    WHERE id = v_invoice_id
    FOR UPDATE;  -- row lock prevents concurrent payment race condition

    v_new_status := CASE
      WHEN v_new_paid >= v_grand_total THEN 'paid'::payment_status
      WHEN v_new_paid > 0 THEN 'partial'::payment_status
      ELSE 'unpaid'::payment_status
    END;

    UPDATE invoices
    SET amount_paid = v_new_paid, payment_status = v_new_status
    WHERE id = v_invoice_id;
  END IF;

  RETURN jsonb_build_object('id', v_payment_id, 'new_status', v_new_status);
END;
$$ LANGUAGE plpgsql;
-- Add last_fy column to track the financial year of the last invoice
ALTER TABLE business_profile ADD COLUMN IF NOT EXISTS last_invoice_fy TEXT;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  v_id UUID;
  v_prefix TEXT;
  v_seq BIGINT;
  v_fy TEXT;
  v_last_fy TEXT;
BEGIN
  SELECT id, invoice_prefix, invoice_sequence, last_invoice_fy
  INTO v_id, v_prefix, v_seq, v_last_fy
  FROM business_profile
  LIMIT 1
  FOR UPDATE;

  v_fy := CASE
    WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 4
    THEN EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' || LPAD((EXTRACT(YEAR FROM CURRENT_DATE) + 1 - 2000)::TEXT, 2, '0')
    ELSE (EXTRACT(YEAR FROM CURRENT_DATE) - 1)::TEXT || '-' || LPAD((EXTRACT(YEAR FROM CURRENT_DATE) - 2000)::TEXT, 2, '0')
  END;

  -- Reset sequence if financial year has changed
  IF v_last_fy IS NULL OR v_last_fy <> v_fy THEN
    v_seq := 1;
  ELSE
    v_seq := v_seq + 1;
  END IF;

  UPDATE business_profile
  SET invoice_sequence = v_seq, last_invoice_fy = v_fy
  WHERE id = v_id;

  RETURN v_prefix || '/' || v_fy || '/' || LPAD(v_seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_by UUID,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log (table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON audit_log (changed_at DESC);

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, record_id, action, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Attach to critical tables
CREATE OR REPLACE TRIGGER audit_invoices AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE OR REPLACE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE OR REPLACE TRIGGER audit_inventory AFTER INSERT OR UPDATE OR DELETE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE OR REPLACE TRIGGER audit_expenses AFTER INSERT OR UPDATE OR DELETE ON expenses
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

-- Enable RLS on audit_log (read-only for authenticated, no write from client)
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_read_only" ON audit_log FOR SELECT TO authenticated USING (true);
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications (read, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_full_access_notifications" ON notifications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Auto-notify when stock drops below threshold
CREATE OR REPLACE FUNCTION notify_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.low_stock_threshold > 0
     AND NEW.box_count <= NEW.low_stock_threshold
     AND (OLD.box_count > OLD.low_stock_threshold OR OLD.box_count IS NULL) THEN
    INSERT INTO notifications (type, title, body, metadata)
    VALUES (
      'low_stock',
      'Low Stock Alert',
      NEW.design_name || ' has only ' || NEW.box_count || ' boxes remaining',
      jsonb_build_object('item_id', NEW.id, 'current_stock', NEW.box_count, 'threshold', NEW.low_stock_threshold)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_notify_low_stock
  AFTER UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION notify_low_stock();
-- Migration 016: Materialized ledger summary views for performance
-- Replaces slow VIEW queries with pre-computed snapshots refreshed atomically
-- in the invoice/payment transaction RPCs.

-- ============================================================
-- 1. Customer ledger summary — materialized
-- ============================================================
DROP VIEW IF EXISTS customer_ledger_summary;

CREATE MATERIALIZED VIEW customer_ledger_summary AS
SELECT
    c.id                                                          AS customer_id,
    COALESCE(SUM(CASE WHEN il.type = 'invoice' THEN il.debit ELSE 0 END), 0)  AS total_invoiced,
    COALESCE(SUM(CASE WHEN il.type = 'payment' THEN il.credit ELSE 0 END), 0) AS total_paid,
    COALESCE(SUM(il.debit - il.credit), 0)                       AS outstanding_balance,
    MAX(CASE WHEN il.type = 'invoice' THEN il.date END)          AS last_invoice_date,
    MAX(CASE WHEN il.type = 'payment' THEN il.date END)          AS last_payment_date
FROM customers c
LEFT JOIN (
    SELECT
        customer_id,
        'invoice'         AS type,
        invoice_date      AS date,
        grand_total       AS debit,
        0                 AS credit
    FROM invoices
    WHERE customer_id IS NOT NULL
    UNION ALL
    SELECT
        customer_id,
        'payment'         AS type,
        payment_date      AS date,
        0                 AS debit,
        amount            AS credit
    FROM payments
    WHERE customer_id IS NOT NULL
      AND direction = 'received'
) il ON il.customer_id = c.id
GROUP BY c.id;

CREATE UNIQUE INDEX customer_ledger_summary_pkey ON customer_ledger_summary (customer_id);

-- ============================================================
-- 2. Supplier ledger summary — materialized
-- ============================================================
DROP VIEW IF EXISTS supplier_ledger_summary;

CREATE MATERIALIZED VIEW supplier_ledger_summary AS
SELECT
    s.id                                                          AS supplier_id,
    COALESCE(SUM(CASE WHEN sl.type = 'purchase' THEN sl.debit ELSE 0 END), 0)  AS total_purchased,
    COALESCE(SUM(CASE WHEN sl.type = 'payment'  THEN sl.credit ELSE 0 END), 0) AS total_paid,
    COALESCE(SUM(sl.debit - sl.credit), 0)                       AS outstanding_balance,
    MAX(CASE WHEN sl.type = 'purchase' THEN sl.date END)         AS last_purchase_date,
    MAX(CASE WHEN sl.type = 'payment'  THEN sl.date END)         AS last_payment_date
FROM suppliers s
LEFT JOIN (
    SELECT
        supplier_id,
        'purchase'        AS type,
        purchase_date     AS date,
        grand_total       AS debit,
        0                 AS credit
    FROM purchases
    WHERE supplier_id IS NOT NULL
    UNION ALL
    SELECT
        supplier_id,
        'payment'         AS type,
        payment_date      AS date,
        0                 AS debit,
        amount            AS credit
    FROM payments
    WHERE supplier_id IS NOT NULL
      AND direction = 'made'
) sl ON sl.supplier_id = s.id
GROUP BY s.id;

CREATE UNIQUE INDEX supplier_ledger_summary_pkey ON supplier_ledger_summary (supplier_id);

-- ============================================================
-- 3. Helper function to refresh both views concurrently
--    Called at the end of create_invoice_with_items() and
--    record_payment_with_invoice_update() RPCs.
-- ============================================================
CREATE OR REPLACE FUNCTION refresh_ledger_summaries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY customer_ledger_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY supplier_ledger_summary;
END;
$$;
-- Migration 017: Add _v1 versioned aliases for all public RPC functions
-- This allows deploying _v2 in the future without breaking existing clients.
-- The _v1 functions simply delegate to the unversioned implementations.
-- Clients should be updated to call _v1 names going forward.

-- perform_stock_operation_v1
CREATE OR REPLACE FUNCTION perform_stock_operation_v1(
  p_item_id UUID,
  p_operation_type stock_op_type,
  p_quantity_change INTEGER,
  p_reason TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT perform_stock_operation(
    p_item_id, p_operation_type, p_quantity_change,
    p_reason, p_reference_type, p_reference_id
  );
$$;

-- create_invoice_with_items_v1
CREATE OR REPLACE FUNCTION create_invoice_with_items_v1(
  p_invoice JSONB,
  p_line_items JSONB
)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT create_invoice_with_items(p_invoice, p_line_items);
$$;

-- record_payment_with_invoice_update_v1
DROP FUNCTION IF EXISTS record_payment_with_invoice_update_v1(uuid, numeric, text, date, text);
CREATE OR REPLACE FUNCTION record_payment_with_invoice_update_v1(
  p_payment JSONB
)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT record_payment_with_invoice_update(p_payment);
$$;

-- get_profit_loss_v1
CREATE OR REPLACE FUNCTION get_profit_loss_v1(p_start DATE, p_end DATE)
RETURNS TABLE (
  revenue NUMERIC,
  cogs NUMERIC,
  gross_profit NUMERIC,
  expenses NUMERIC,
  net_profit NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM get_profit_loss(p_start, p_end);
$$;

-- get_dashboard_stats_v1
CREATE OR REPLACE FUNCTION get_dashboard_stats_v1()
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT get_dashboard_stats();
$$;

-- get_aging_report_v1
CREATE OR REPLACE FUNCTION get_aging_report_v1(p_customer_id UUID DEFAULT NULL)
RETURNS TABLE (
  customer_id UUID,
  customer_name TEXT,
  current_balance NUMERIC,
  overdue_30 NUMERIC,
  overdue_60 NUMERIC,
  overdue_90 NUMERIC,
  total_outstanding NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM get_aging_report(p_customer_id);
$$;

-- Grant execute to authenticated role
GRANT EXECUTE ON FUNCTION perform_stock_operation_v1 TO authenticated;
GRANT EXECUTE ON FUNCTION create_invoice_with_items_v1 TO authenticated;
GRANT EXECUTE ON FUNCTION record_payment_with_invoice_update_v1 TO authenticated;
GRANT EXECUTE ON FUNCTION get_profit_loss_v1 TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_stats_v1 TO authenticated;
GRANT EXECUTE ON FUNCTION get_aging_report_v1 TO authenticated;
-- Migration 018: Create order-pdfs storage bucket for PDF uploads
-- Files are accessible only to the uploading authenticated user (via RLS).
-- The edge function downloads via service role key using the storage path.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'order-pdfs',
  'order-pdfs',
  false,
  10485760, -- 10 MB
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Users can only upload/read/delete their own files
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'order_pdfs_insert' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "order_pdfs_insert" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'order-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'order_pdfs_select' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "order_pdfs_select" ON storage.objects
      FOR SELECT TO authenticated
      USING (bucket_id = 'order-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'order_pdfs_delete' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "order_pdfs_delete" ON storage.objects
      FOR DELETE TO authenticated
      USING (bucket_id = 'order-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;

-- Seed Business Profile
INSERT INTO business_profile (business_name, invoice_prefix) VALUES ('TileMaster', 'TM') ON CONFLICT DO NOTHING;
