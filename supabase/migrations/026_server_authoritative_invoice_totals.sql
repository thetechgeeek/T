-- Migration 026: Make invoice creation totals server-authoritative.
--
-- Clients may send draft invoice lines, but money/tax totals are derived here
-- so tampered client totals cannot become persisted invoice state.

CREATE OR REPLACE FUNCTION create_invoice_with_items(
  p_invoice JSONB,
  p_line_items JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_invoice_number TEXT;
  v_invoice_id UUID;
  v_item JSONB;
  v_line RECORD;
  v_idempotency_key UUID;
  v_existing_id UUID;
  v_existing_number TEXT;
  v_is_inter_state BOOLEAN;
  v_payment_status payment_status;
  v_payment_mode payment_mode;
  v_amount_paid NUMERIC;
  v_subtotal NUMERIC := 0;
  v_cgst_total NUMERIC := 0;
  v_sgst_total NUMERIC := 0;
  v_igst_total NUMERIC := 0;
  v_discount_total NUMERIC := 0;
  v_grand_total NUMERIC := 0;
  v_item_id UUID;
  v_design_name TEXT;
  v_quantity NUMERIC;
  v_rate_per_unit NUMERIC;
  v_discount NUMERIC;
  v_gst_rate NUMERIC;
  v_taxable_amount NUMERIC;
  v_cgst_amount NUMERIC;
  v_sgst_amount NUMERIC;
  v_igst_amount NUMERIC;
  v_line_total NUMERIC;
  v_sort_order INTEGER;
BEGIN
  IF COALESCE(jsonb_typeof(p_line_items), '') <> 'array' THEN
    RAISE EXCEPTION 'Invoice line items must be a JSON array';
  END IF;

  IF jsonb_array_length(p_line_items) = 0 THEN
    RAISE EXCEPTION 'Invoice must contain at least one line item';
  END IF;

  v_idempotency_key := NULLIF(p_invoice->>'idempotency_key', '')::UUID;

  IF v_idempotency_key IS NOT NULL THEN
    SELECT id, invoice_number INTO v_existing_id, v_existing_number
    FROM invoices
    WHERE idempotency_key = v_idempotency_key;

    IF FOUND THEN
      RETURN jsonb_build_object(
        'success', true,
        'id', v_existing_id,
        'invoice_id', v_existing_id,
        'invoice_number', v_existing_number,
        'is_duplicate', true
      );
    END IF;
  END IF;

  v_is_inter_state := COALESCE((p_invoice->>'is_inter_state')::BOOLEAN, false);

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_line_items)
  LOOP
    v_quantity := NULLIF(v_item->>'quantity', '')::NUMERIC;
    v_rate_per_unit := COALESCE(
      NULLIF(v_item->>'rate_per_unit', '')::NUMERIC,
      NULLIF(v_item->>'rate', '')::NUMERIC
    );
    v_gst_rate := COALESCE(NULLIF(v_item->>'gst_rate', '')::NUMERIC, 0);

    IF v_quantity IS NULL OR v_quantity <= 0 THEN
      RAISE EXCEPTION 'Invoice line quantity must be positive';
    END IF;

    IF v_rate_per_unit IS NULL OR v_rate_per_unit <= 0 THEN
      RAISE EXCEPTION 'Invoice line rate must be positive';
    END IF;

    IF v_gst_rate NOT IN (0, 5, 12, 18, 28) THEN
      RAISE EXCEPTION 'Invalid GST rate %', v_gst_rate;
    END IF;

    v_discount := CASE
      WHEN NULLIF(v_item->>'discount', '') IS NOT NULL THEN
        NULLIF(v_item->>'discount', '')::NUMERIC
      ELSE
        ROUND(
          v_quantity
          * v_rate_per_unit
          * COALESCE(NULLIF(v_item->>'discount_percent', '')::NUMERIC, 0)
          / 100,
          2
        )
    END;

    IF v_discount < 0 THEN
      RAISE EXCEPTION 'Invoice line discount must not be negative';
    END IF;

    IF v_discount > ROUND(v_quantity * v_rate_per_unit, 2) THEN
      RAISE EXCEPTION 'Invoice line discount must not exceed gross amount';
    END IF;

    v_taxable_amount := GREATEST((v_quantity * v_rate_per_unit) - v_discount, 0);

    IF v_is_inter_state THEN
      v_cgst_amount := 0;
      v_sgst_amount := 0;
      v_igst_amount := ROUND(v_taxable_amount * v_gst_rate / 100, 2);
    ELSE
      v_cgst_amount := ROUND(v_taxable_amount * v_gst_rate / 200, 2);
      v_sgst_amount := ROUND(v_taxable_amount * v_gst_rate / 200, 2);
      v_igst_amount := 0;
    END IF;

    v_line_total := ROUND(v_taxable_amount + v_cgst_amount + v_sgst_amount + v_igst_amount, 2);

    v_subtotal := v_subtotal + ROUND(v_quantity * v_rate_per_unit, 2);
    v_discount_total := v_discount_total + v_discount;
    v_cgst_total := v_cgst_total + v_cgst_amount;
    v_sgst_total := v_sgst_total + v_sgst_amount;
    v_igst_total := v_igst_total + v_igst_amount;
  END LOOP;

  v_subtotal := ROUND(v_subtotal, 2);
  v_discount_total := ROUND(v_discount_total, 2);
  v_cgst_total := ROUND(v_cgst_total, 2);
  v_sgst_total := ROUND(v_sgst_total, 2);
  v_igst_total := ROUND(v_igst_total, 2);
  v_grand_total := ROUND(
    v_subtotal - v_discount_total + v_cgst_total + v_sgst_total + v_igst_total,
    2
  );

  v_payment_status := COALESCE(
    NULLIF(p_invoice->>'payment_status', '')::payment_status,
    'unpaid'::payment_status
  );
  v_payment_mode := NULLIF(p_invoice->>'payment_mode', '')::payment_mode;
  v_amount_paid := COALESCE(NULLIF(p_invoice->>'amount_paid', '')::NUMERIC, 0);

  IF v_payment_status = 'paid' THEN
    v_amount_paid := v_grand_total;
  ELSIF v_payment_status = 'unpaid' THEN
    v_amount_paid := 0;
  ELSIF v_amount_paid < 0 OR v_amount_paid > v_grand_total THEN
    RAISE EXCEPTION 'Partial payment amount must be between 0 and the invoice total';
  END IF;

  v_invoice_number := generate_invoice_number();

  INSERT INTO invoices (
    invoice_number, idempotency_key, invoice_date, customer_id, customer_name,
    customer_gstin, customer_phone, customer_address,
    subtotal, cgst_total, sgst_total, igst_total, discount_total, grand_total,
    is_inter_state, place_of_supply, reverse_charge,
    payment_status, payment_mode, amount_paid, notes, terms
  )
  VALUES (
    v_invoice_number,
    v_idempotency_key,
    (p_invoice->>'invoice_date')::DATE,
    NULLIF(p_invoice->>'customer_id', '')::UUID,
    p_invoice->>'customer_name',
    NULLIF(p_invoice->>'customer_gstin', ''),
    p_invoice->>'customer_phone',
    NULLIF(p_invoice->>'customer_address', ''),
    v_subtotal,
    v_cgst_total,
    v_sgst_total,
    v_igst_total,
    v_discount_total,
    v_grand_total,
    v_is_inter_state,
    NULLIF(p_invoice->>'place_of_supply', ''),
    COALESCE((p_invoice->>'reverse_charge')::BOOLEAN, false),
    v_payment_status,
    v_payment_mode,
    v_amount_paid,
    NULLIF(p_invoice->>'notes', ''),
    NULLIF(p_invoice->>'terms', '')
  )
  RETURNING id INTO v_invoice_id;

  FOR v_line IN
    SELECT
      item,
      (ordinality - 1)::INTEGER AS index_sort_order
    FROM jsonb_array_elements(p_line_items) WITH ORDINALITY AS line(item, ordinality)
  LOOP
    v_item := v_line.item;
    v_item_id := NULLIF(
      COALESCE(v_item->>'item_id', v_item->>'inventory_item_id'),
      ''
    )::UUID;
    v_design_name := NULLIF(COALESCE(v_item->>'design_name', v_item->>'name'), '');

    IF v_design_name IS NULL AND v_item_id IS NOT NULL THEN
      SELECT design_name INTO v_design_name
      FROM inventory_items
      WHERE id = v_item_id;
    END IF;

    IF v_design_name IS NULL THEN
      RAISE EXCEPTION 'Invoice line design_name is required';
    END IF;

    v_quantity := NULLIF(v_item->>'quantity', '')::NUMERIC;
    v_rate_per_unit := COALESCE(
      NULLIF(v_item->>'rate_per_unit', '')::NUMERIC,
      NULLIF(v_item->>'rate', '')::NUMERIC
    );
    v_gst_rate := COALESCE(NULLIF(v_item->>'gst_rate', '')::NUMERIC, 0);
    v_discount := CASE
      WHEN NULLIF(v_item->>'discount', '') IS NOT NULL THEN
        NULLIF(v_item->>'discount', '')::NUMERIC
      ELSE
        ROUND(
          v_quantity
          * v_rate_per_unit
          * COALESCE(NULLIF(v_item->>'discount_percent', '')::NUMERIC, 0)
          / 100,
          2
        )
    END;
    v_taxable_amount := GREATEST((v_quantity * v_rate_per_unit) - v_discount, 0);

    IF v_is_inter_state THEN
      v_cgst_amount := 0;
      v_sgst_amount := 0;
      v_igst_amount := ROUND(v_taxable_amount * v_gst_rate / 100, 2);
    ELSE
      v_cgst_amount := ROUND(v_taxable_amount * v_gst_rate / 200, 2);
      v_sgst_amount := ROUND(v_taxable_amount * v_gst_rate / 200, 2);
      v_igst_amount := 0;
    END IF;

    v_line_total := ROUND(v_taxable_amount + v_cgst_amount + v_sgst_amount + v_igst_amount, 2);
    v_sort_order := COALESCE(NULLIF(v_item->>'sort_order', '')::INTEGER, v_line.index_sort_order);

    INSERT INTO invoice_line_items (
      invoice_id, item_id, design_name, description, hsn_code,
      quantity, rate_per_unit, discount, taxable_amount,
      gst_rate, cgst_amount, sgst_amount, igst_amount, line_total,
      tile_image_url, sort_order
    )
    VALUES (
      v_invoice_id,
      v_item_id,
      v_design_name,
      NULLIF(v_item->>'description', ''),
      NULLIF(v_item->>'hsn_code', ''),
      v_quantity,
      v_rate_per_unit,
      v_discount,
      ROUND(v_taxable_amount, 2),
      v_gst_rate::INTEGER,
      v_cgst_amount,
      v_sgst_amount,
      v_igst_amount,
      v_line_total,
      NULLIF(v_item->>'tile_image_url', ''),
      v_sort_order
    );

    IF v_item_id IS NOT NULL THEN
      PERFORM perform_stock_operation(
        v_item_id,
        'stock_out',
        -(v_quantity),
        'Invoice #' || v_invoice_number,
        'invoice',
        v_invoice_id
      );
    END IF;
  END LOOP;

  PERFORM refresh_ledger_summaries();

  RETURN jsonb_build_object(
    'success', true,
    'id', v_invoice_id,
    'invoice_id', v_invoice_id,
    'invoice_number', v_invoice_number
  );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_invoice_with_items(JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION create_invoice_with_items_v1(JSONB, JSONB) TO authenticated;
