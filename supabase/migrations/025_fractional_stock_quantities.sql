-- Migration 025: Preserve fractional stock quantities end to end.
--
-- Invoice and purchase line-item quantities are NUMERIC, but the stock operation
-- ledger and stock RPC still used INTEGER. That truncated fractional invoice
-- quantities during stock deduction (for example, 2.5 boxes deducted as 2).

DROP FUNCTION IF EXISTS perform_stock_operation_v1(
  UUID,
  stock_op_type,
  INTEGER,
  TEXT,
  TEXT,
  UUID
);

DROP FUNCTION IF EXISTS perform_stock_operation(
  UUID,
  stock_op_type,
  INTEGER,
  TEXT,
  TEXT,
  UUID
);

ALTER TABLE inventory_items
  ALTER COLUMN box_count TYPE NUMERIC USING box_count::NUMERIC;

ALTER TABLE stock_operations
  ALTER COLUMN quantity_change TYPE NUMERIC USING quantity_change::NUMERIC,
  ALTER COLUMN previous_quantity TYPE NUMERIC USING previous_quantity::NUMERIC,
  ALTER COLUMN new_quantity TYPE NUMERIC USING new_quantity::NUMERIC;

CREATE OR REPLACE FUNCTION perform_stock_operation(
  p_item_id UUID,
  p_operation_type stock_op_type,
  p_quantity_change NUMERIC,
  p_reason TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS NUMERIC AS $$
DECLARE
  v_current_qty NUMERIC;
  v_new_qty NUMERIC;
BEGIN
  SELECT box_count INTO v_current_qty
  FROM inventory_items
  WHERE id = p_item_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item % not found', p_item_id;
  END IF;

  v_new_qty := v_current_qty + p_quantity_change;

  IF v_new_qty < 0 THEN
    RAISE EXCEPTION 'Insufficient stock. Current: %, Requested change: %', v_current_qty, p_quantity_change;
  END IF;

  INSERT INTO stock_operations (
    item_id, operation_type, quantity_change,
    previous_quantity, new_quantity, reason,
    reference_type, reference_id
  ) VALUES (
    p_item_id, p_operation_type, p_quantity_change,
    v_current_qty, v_new_qty, p_reason,
    p_reference_type, p_reference_id
  );

  UPDATE inventory_items
  SET box_count = v_new_qty,
      last_restocked = CASE
        WHEN p_quantity_change > 0 THEN now()
        ELSE last_restocked
      END
  WHERE id = p_item_id;

  RETURN v_new_qty;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION perform_stock_operation_v1(
  p_item_id UUID,
  p_operation_type stock_op_type,
  p_quantity_change NUMERIC,
  p_reason TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS NUMERIC
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT perform_stock_operation(
    p_item_id, p_operation_type, p_quantity_change,
    p_reason, p_reference_type, p_reference_id
  );
$$;

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

  v_invoice_number := generate_invoice_number();

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

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_line_items)
  LOOP
    IF (v_item->>'item_id') IS NOT NULL THEN
      PERFORM perform_stock_operation(
        (v_item->>'item_id')::UUID,
        'stock_out',
        -((v_item->>'quantity')::NUMERIC),
        'Invoice #' || v_invoice_number,
        'invoice',
        v_invoice_id
      );
    END IF;
  END LOOP;

  PERFORM refresh_ledger_summaries();

  RETURN jsonb_build_object(
    'id', v_invoice_id,
    'invoice_number', v_invoice_number
  );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION perform_stock_operation(
  UUID,
  stock_op_type,
  NUMERIC,
  TEXT,
  TEXT,
  UUID
) TO authenticated;

GRANT EXECUTE ON FUNCTION perform_stock_operation_v1(
  UUID,
  stock_op_type,
  NUMERIC,
  TEXT,
  TEXT,
  UUID
) TO authenticated;
