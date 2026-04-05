-- Migration 021: Refresh materialized views in transactional RPCs

-- 1. Redefine create_invoice_with_items to refresh ledger summaries
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

  -- 2. Generate invoice number
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

  -- 4. Insert line items
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

  -- 6. REFRESH SUMMARIES
  PERFORM refresh_ledger_summaries();

  RETURN jsonb_build_object(
    'id', v_invoice_id,
    'invoice_number', v_invoice_number
  );
END;
$$ LANGUAGE plpgsql;

-- 2. Redefine record_payment_with_invoice_update to refresh ledger summaries
CREATE OR REPLACE FUNCTION record_payment_with_invoice_update(
  p_payment JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_payment_id UUID;
  v_invoice_id UUID;
  v_new_paid NUMERIC;
  v_grand_total NUMERIC;
  v_new_status payment_status;
BEGIN
  v_invoice_id := (p_payment->>'invoice_id')::UUID;

  -- 1. Lock invoice
  IF v_invoice_id IS NOT NULL THEN
    SELECT grand_total, amount_paid INTO v_grand_total, v_new_paid
    FROM invoices
    WHERE id = v_invoice_id
    FOR UPDATE;
  END IF;

  -- 2. Insert payment
  INSERT INTO payments (
    payment_date, amount, payment_mode, direction,
    customer_id, supplier_id, invoice_id, purchase_id, notes
  )
  SELECT
    (p_payment->>'payment_date')::DATE,
    (p_payment->>'amount')::NUMERIC,
    (p_payment->>'payment_mode')::payment_mode,
    p_payment->>'direction',
    (p_payment->>'customer_id')::UUID,
    (p_payment->>'supplier_id')::UUID,
    v_invoice_id,
    (p_payment->>'purchase_id')::UUID,
    p_payment->>'notes'
  RETURNING id INTO v_payment_id;

  -- 3. Update invoice status
  IF v_invoice_id IS NOT NULL THEN
    v_new_paid := v_new_paid + (p_payment->>'amount')::NUMERIC;
    v_new_status := CASE
      WHEN v_new_paid >= v_grand_total THEN 'paid'::payment_status
      WHEN v_new_paid > 0 THEN 'partial'::payment_status
      ELSE 'unpaid'::payment_status
    END;

    UPDATE invoices
    SET amount_paid = v_new_paid, payment_status = v_new_status
    WHERE id = v_invoice_id;
  END IF;

  -- 4. REFRESH SUMMARIES
  PERFORM refresh_ledger_summaries();

  RETURN jsonb_build_object('id', v_payment_id, 'new_status', v_new_status);
END;
$$ LANGUAGE plpgsql;

-- 3. Fix record_payment_with_invoice_update_v1 parameter mapping
CREATE OR REPLACE FUNCTION record_payment_with_invoice_update_v1(
  p_invoice_id UUID,
  p_amount NUMERIC,
  p_payment_mode TEXT,
  p_payment_date DATE DEFAULT CURRENT_DATE,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN record_payment_with_invoice_update(
    jsonb_build_object(
      'invoice_id', p_invoice_id,
      'amount', p_amount,
      'payment_mode', p_payment_mode,
      'payment_date', p_payment_date,
      'notes', p_notes,
      'direction', 'received',
      'customer_id', (SELECT customer_id FROM invoices WHERE id = p_invoice_id)
    )
  );
END;
$$;

-- 4. Initial sync: Refresh ledger summaries immediately to sync existing stale data
SELECT refresh_ledger_summaries();
