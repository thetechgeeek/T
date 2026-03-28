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

  -- 1. Insert payment
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

  -- 2. If linked to an invoice, atomically update amount_paid + status
  IF v_invoice_id IS NOT NULL THEN
    SELECT grand_total, amount_paid + (p_payment->>'amount')::NUMERIC
    INTO v_grand_total, v_new_paid
    FROM invoices
    WHERE id = v_invoice_id
    FOR UPDATE;  -- row lock prevents concurrent payment race condition

    v_new_status := CASE
      WHEN v_new_paid >= v_grand_total THEN 'paid'::payment_status
      WHEN v_new_paid > 0 THEN 'partial'::payment_status
      ELSE 'unpaid'::payment_status
    END;

    UPDATE invoices
    SET amount_paid = v_new_paid, payment_status = v_new_status
    WHERE id = v_invoice_id;
  END IF;

  RETURN jsonb_build_object('id', v_payment_id, 'new_status', v_new_status);
END;
$$ LANGUAGE plpgsql;
