-- Migration 019: Enterprise Idempotency and Resilient ID Generation

-- 1. Add idempotency_key to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS idempotency_key UUID UNIQUE;

-- 2. Update generate_invoice_number to be self-healing
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  v_id UUID;
  v_prefix TEXT;
  v_seq BIGINT;
  v_fy TEXT;
  v_last_fy TEXT;
  v_formatted TEXT;
BEGIN
  -- Lock the business profile row to prevent concurrent generation
  SELECT id, invoice_prefix, invoice_sequence, last_invoice_fy
  INTO v_id, v_prefix, v_seq, v_last_fy
  FROM business_profile
  LIMIT 1
  FOR UPDATE;

  -- Calculate financial year (e.g., 2026-27)
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

  -- SELF-HEALING: If the sequence number is already used (e.g. due to manual entry or out-of-sync),
  -- keep incrementing until we find a free one.
  v_formatted := v_prefix || '/' || v_fy || '/' || LPAD(v_seq::TEXT, 4, '0');
  WHILE EXISTS (SELECT 1 FROM invoices WHERE invoice_number = v_formatted) LOOP
    v_seq := v_seq + 1;
    v_formatted := v_prefix || '/' || v_fy || '/' || LPAD(v_seq::TEXT, 4, '0');
  END LOOP;

  -- Update sequence and FY marker
  UPDATE business_profile
  SET invoice_sequence = v_seq, last_invoice_fy = v_fy
  WHERE id = v_id;

  RETURN v_formatted;
END;
$$ LANGUAGE plpgsql;

-- 3. Update create_invoice_with_items to support idempotency
CREATE OR REPLACE FUNCTION create_invoice_with_items(
  p_invoice JSONB,
  p_line_items JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_invoice_number TEXT;
  v_invoice_id UUID;
  v_item JSONB;
  v_idempotency_key UUID;
  v_existing_id UUID;
  v_existing_number TEXT;
BEGIN
  -- 1. Idempotency Check
  v_idempotency_key := (p_invoice->>'idempotency_key')::UUID;
  
  IF v_idempotency_key IS NOT NULL THEN
    SELECT id, invoice_number INTO v_existing_id, v_existing_number
    FROM invoices
    WHERE idempotency_key = v_idempotency_key;

    IF FOUND THEN
      RETURN jsonb_build_object(
        'id', v_existing_id,
        'invoice_number', v_existing_number,
        'is_duplicate', true
      );
    END IF;
  END IF;

  -- 2. Generate invoice number (now self-healing)
  v_invoice_number := generate_invoice_number();

  -- 3. Insert invoice
  INSERT INTO invoices (
    invoice_number, idempotency_key, invoice_date, customer_id, customer_name,
    customer_gstin, customer_phone, customer_address,
    subtotal, cgst_total, sgst_total, igst_total, discount_total, grand_total,
    is_inter_state, place_of_supply, reverse_charge,
    payment_status, payment_mode, amount_paid, notes, terms
  )
  SELECT
    v_invoice_number,
    v_idempotency_key,
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

  -- 4. Insert all line items in one batch
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

  -- 5. Stock deductions
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

  RETURN jsonb_build_object(
    'id', v_invoice_id,
    'invoice_number', v_invoice_number
  );
END;
$$ LANGUAGE plpgsql;
