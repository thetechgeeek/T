-- Migration 023: Batch Tracking, Serial Tracking, and Party-wise Pricing
-- Supports P2.6 and P2.11

-- 1. Updates to inventory_items
ALTER TABLE inventory_items ADD COLUMN has_batch_tracking BOOLEAN DEFAULT false;
ALTER TABLE inventory_items ADD COLUMN has_serial_tracking BOOLEAN DEFAULT false;

-- 2. Create item_batches table
CREATE TABLE item_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    batch_number TEXT NOT NULL,
    mfg_date DATE,
    expiry_date DATE,
    initial_quantity NUMERIC NOT NULL DEFAULT 0,
    current_quantity NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create item_serials table
CREATE TABLE item_serials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    serial_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_stock', -- 'in_stock', 'sold', 'returned', 'damaged'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(item_id, serial_number)
);

-- 4. Create item_party_rates table
CREATE TABLE item_party_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    custom_rate NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Ensure it's for either a customer or a supplier, but not both at once (though optional)
    CHECK (
        (customer_id IS NOT NULL AND supplier_id IS NULL) OR
        (customer_id IS NULL AND supplier_id IS NOT NULL)
    )
);

-- Enable RLS
ALTER TABLE item_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_serials ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_party_rates ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Simplistic for now, assuming user_id link is inherited via inventory_items)
-- Ideally we'd add business_id to these tables as well, but for consistency with previous migrations:
CREATE POLICY "Allow auth all on batches" ON item_batches FOR ALL WITH CHECK (true);
CREATE POLICY "Allow public select on batches" ON item_batches FOR SELECT USING (true);

CREATE POLICY "Allow auth all on serials" ON item_serials FOR ALL WITH CHECK (true);
CREATE POLICY "Allow public select on serials" ON item_serials FOR SELECT USING (true);

CREATE POLICY "Allow auth all on party_rates" ON item_party_rates FOR ALL WITH CHECK (true);
CREATE POLICY "Allow public select on party_rates" ON item_party_rates FOR SELECT USING (true);

-- Indexes
CREATE INDEX idx_item_batches_item_id ON item_batches(item_id);
CREATE INDEX idx_item_serials_item_id ON item_serials(item_id);
CREATE INDEX idx_item_party_rates_item_id ON item_party_rates(item_id);

-- Triggers
CREATE TRIGGER handle_updated_at_batches
  BEFORE UPDATE ON item_batches
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at_serials
  BEFORE UPDATE ON item_serials
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at_party_rates
  BEFORE UPDATE ON item_party_rates
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);
