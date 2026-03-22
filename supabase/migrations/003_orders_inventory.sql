-- Migration 003: Orders and Inventory Items

-- Orders table
CREATE TABLE orders (
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
CREATE TABLE inventory_items (
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

CREATE TRIGGER trg_set_base_item_number
  BEFORE INSERT OR UPDATE OF design_name ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION set_base_item_number();

-- Indexes
CREATE INDEX idx_inventory_base_number ON inventory_items (base_item_number);
CREATE INDEX idx_inventory_category ON inventory_items (category);
CREATE INDEX idx_inventory_design_trgm ON inventory_items USING GIN (design_name gin_trgm_ops);
CREATE INDEX idx_inventory_box_count ON inventory_items (box_count);
CREATE INDEX idx_inventory_supplier ON inventory_items (supplier_id);

-- Updated_at triggers
CREATE TRIGGER handle_updated_at_orders
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at_inventory
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);
