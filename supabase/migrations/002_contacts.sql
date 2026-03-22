-- Migration 002: Customers and Suppliers

CREATE TABLE customers (
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

CREATE TABLE suppliers (
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
CREATE INDEX idx_customers_name_trgm ON customers USING GIN (name gin_trgm_ops);
CREATE INDEX idx_suppliers_name_trgm ON suppliers USING GIN (name gin_trgm_ops);
CREATE INDEX idx_customers_phone ON customers (phone);

-- Updated_at triggers
CREATE TRIGGER handle_updated_at_customers
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at_suppliers
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);
