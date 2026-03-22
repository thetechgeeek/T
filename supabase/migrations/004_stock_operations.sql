-- Migration 004: Stock Operations

CREATE TABLE stock_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  operation_type stock_op_type NOT NULL,
  quantity_change INTEGER NOT NULL,
  previous_quantity INTEGER,
  new_quantity INTEGER,
  reason TEXT,
  reference_type TEXT CHECK (reference_type IN ('invoice', 'purchase', 'adjustment', 'transfer', 'return')),
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient history queries per item
CREATE INDEX idx_stock_ops_item_date ON stock_operations (item_id, created_at DESC);

-- Atomic stock operation function
-- Returns the new stock count or raises an error if stock would go negative
CREATE OR REPLACE FUNCTION perform_stock_operation(
  p_item_id UUID,
  p_operation_type stock_op_type,
  p_quantity_change INTEGER,
  p_reason TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_current_qty INTEGER;
  v_new_qty INTEGER;
BEGIN
  -- Lock the row for update
  SELECT box_count INTO v_current_qty
  FROM inventory_items
  WHERE id = p_item_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item % not found', p_item_id;
  END IF;

  v_new_qty := v_current_qty + p_quantity_change;

  -- Validate non-negative stock
  IF v_new_qty < 0 THEN
    RAISE EXCEPTION 'Insufficient stock. Current: %, Requested change: %', v_current_qty, p_quantity_change;
  END IF;

  -- Insert stock operation record
  INSERT INTO stock_operations (
    item_id, operation_type, quantity_change,
    previous_quantity, new_quantity, reason,
    reference_type, reference_id
  ) VALUES (
    p_item_id, p_operation_type, p_quantity_change,
    v_current_qty, v_new_qty, p_reason,
    p_reference_type, p_reference_id
  );

  -- Update inventory
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
