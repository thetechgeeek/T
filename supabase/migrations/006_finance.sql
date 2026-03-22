-- Migration 006: Finance (Purchases, Payments, Expenses)

-- Purchases table
CREATE TABLE purchases (
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
CREATE TABLE purchase_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  design_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  rate_per_unit NUMERIC NOT NULL,
  amount NUMERIC NOT NULL
);

-- Payments (receivable from customers or payable to suppliers)
CREATE TABLE payments (
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
CREATE TABLE expenses (
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
CREATE INDEX idx_payments_customer ON payments (customer_id);
CREATE INDEX idx_payments_supplier ON payments (supplier_id);
CREATE INDEX idx_payments_invoice ON payments (invoice_id);
CREATE INDEX idx_payments_date ON payments (payment_date DESC);
CREATE INDEX idx_expenses_date ON expenses (expense_date DESC);

CREATE TRIGGER handle_updated_at_purchases
  BEFORE UPDATE ON purchases
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at_expenses
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);
