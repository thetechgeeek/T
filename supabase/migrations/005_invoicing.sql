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
CREATE TABLE invoices (
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
CREATE TABLE invoice_line_items (
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
CREATE INDEX idx_invoices_date ON invoices (invoice_date DESC);
CREATE INDEX idx_invoices_customer ON invoices (customer_id);
CREATE INDEX idx_invoices_payment_status ON invoices (payment_status);
CREATE INDEX idx_invoice_line_items_invoice ON invoice_line_items (invoice_id);

CREATE TRIGGER handle_updated_at_invoices
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);
