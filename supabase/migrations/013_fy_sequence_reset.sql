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
