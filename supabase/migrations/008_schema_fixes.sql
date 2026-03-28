-- 1.1a: Change invoice_line_items.quantity from INTEGER to NUMERIC
--        Tiles can be sold in fractional box quantities (e.g., 2.5 boxes)
--        Review §6.4
ALTER TABLE invoice_line_items ALTER COLUMN quantity TYPE NUMERIC USING quantity::NUMERIC;

-- 1.1b: Change purchase_line_items.quantity from INTEGER to NUMERIC (same reason)
ALTER TABLE purchase_line_items ALTER COLUMN quantity TYPE NUMERIC USING quantity::NUMERIC;

-- 1.1c: Add missing updated_at column + trigger to payments table
--        Review §6.5
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
CREATE TRIGGER handle_updated_at_payments
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

-- 1.1d: Add place_of_supply to invoices (required for GST inter-state determination)
--        Review §28.1
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS place_of_supply TEXT;

-- 1.1e: Add reverse_charge flag to invoices (required on GST invoices even if "No")
--        Review §28.1
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS reverse_charge BOOLEAN NOT NULL DEFAULT false;
