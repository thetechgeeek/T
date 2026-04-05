-- Migration 020: Mandatory customer_phone and check constraint

-- 1. Fill placeholders for existing records without phone numbers
UPDATE invoices 
SET customer_phone = '0000000000' 
WHERE customer_phone IS NULL OR customer_phone = '';

-- 2. Make customer_phone NOT NULL
ALTER TABLE invoices ALTER COLUMN customer_phone SET NOT NULL;

-- 3. Add check constraint for common phone number length (e.g. 10 digits)
ALTER TABLE invoices ADD CONSTRAINT check_customer_phone_length 
  CHECK (length(customer_phone) >= 10);

-- 4. Ensure customers table phone index exists (supporting efficient service-layer lookups)
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers (phone);
