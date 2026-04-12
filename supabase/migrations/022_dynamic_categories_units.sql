-- Migration 022: Dynamic Item Categories and Units
-- Supports generic Item Master (P2.9, P2.10)

-- 1. Create item_categories table
CREATE TABLE item_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_hi TEXT NOT NULL,
    name_en TEXT NOT NULL,
    color TEXT, -- Hex code or preset name
    icon TEXT, -- Emoji or icon name
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create item_units table
CREATE TABLE item_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,           -- e.g. "Kilogram"
    abbreviation TEXT NOT NULL,   -- e.g. "Kg"
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Update inventory_items to support dynamic master data
ALTER TABLE inventory_items ADD COLUMN category_id UUID REFERENCES item_categories(id) ON DELETE SET NULL;
ALTER TABLE inventory_items ADD COLUMN unit_id UUID REFERENCES item_units(id) ON DELETE SET NULL;

-- 4. Data Migration: Seed initial categories from old enum
-- We can't easily auto-migrate without knowing the business mapping, but we can seed defaults.
INSERT INTO item_categories (name_en, name_hi, color) VALUES 
('Glossy Tiles', 'ग्लॉसी टाइल्स', '#F59E0B'),
('Floor Tiles', 'फ्लोर टाइल्स', '#10B981'),
('Matt Tiles', 'मैट टाइल्स', '#3B82F6'),
('Satin Tiles', 'सैटिन टाइल्स', '#8B5CF6'),
('Wooden Tiles', 'वुडन टाइल्स', '#78350F'),
('Elevation', 'एलिवेशन', '#EF4444'),
('Other', 'अन्य', '#6B7280');

-- 5. Data Migration: Seed system units
INSERT INTO item_units (name, abbreviation, is_default) VALUES 
('Box', 'Box', true),
('Piece', 'Pcs', false),
('Square Feet', 'Sqft', false),
('Kilogram', 'Kg', false),
('Gram', 'g', false),
('Liter', 'Ltr', false),
('Meter', 'Mtr', false);

-- Enable RLS for new tables
ALTER TABLE item_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_units ENABLE ROW LEVEL SECURITY;

-- Simple RLS Policies (Allow authenticated users to read/write for now, or match business_id if added)
CREATE POLICY "Allow public select on categories" ON item_categories FOR SELECT USING (true);
CREATE POLICY "Allow auth all on categories" ON item_categories FOR ALL WITH CHECK (true);

CREATE POLICY "Allow public select on units" ON item_units FOR SELECT USING (true);
CREATE POLICY "Allow auth all on units" ON item_units FOR ALL WITH CHECK (true);

-- Functions
CREATE TRIGGER handle_updated_at_categories
  BEFORE UPDATE ON item_categories
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at_units
  BEFORE UPDATE ON item_units
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);
