-- Migration 017: Add _v1 versioned aliases for all public RPC functions
-- This allows deploying _v2 in the future without breaking existing clients.
-- The _v1 functions simply delegate to the unversioned implementations.
-- Clients should be updated to call _v1 names going forward.

-- perform_stock_operation_v1
CREATE OR REPLACE FUNCTION perform_stock_operation_v1(
  p_item_id UUID,
  p_operation_type stock_op_type,
  p_quantity_change INTEGER,
  p_reason TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT perform_stock_operation(
    p_item_id, p_operation_type, p_quantity_change,
    p_reason, p_reference_type, p_reference_id
  );
$$;

-- create_invoice_with_items_v1
CREATE OR REPLACE FUNCTION create_invoice_with_items_v1(
  p_invoice JSONB,
  p_line_items JSONB
)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT create_invoice_with_items(p_invoice, p_line_items);
$$;

-- record_payment_with_invoice_update_v1
CREATE OR REPLACE FUNCTION record_payment_with_invoice_update_v1(
  p_invoice_id UUID,
  p_amount NUMERIC,
  p_payment_mode TEXT,
  p_payment_date DATE DEFAULT CURRENT_DATE,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT record_payment_with_invoice_update(
    p_invoice_id, p_amount, p_payment_mode, p_payment_date, p_notes
  );
$$;

-- get_profit_loss_v1
CREATE OR REPLACE FUNCTION get_profit_loss_v1(p_start DATE, p_end DATE)
RETURNS TABLE (
  revenue NUMERIC,
  cogs NUMERIC,
  gross_profit NUMERIC,
  expenses NUMERIC,
  net_profit NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM get_profit_loss(p_start, p_end);
$$;

-- get_dashboard_stats_v1
CREATE OR REPLACE FUNCTION get_dashboard_stats_v1()
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT get_dashboard_stats();
$$;

-- get_aging_report_v1
CREATE OR REPLACE FUNCTION get_aging_report_v1(p_customer_id UUID DEFAULT NULL)
RETURNS TABLE (
  customer_id UUID,
  customer_name TEXT,
  current_balance NUMERIC,
  overdue_30 NUMERIC,
  overdue_60 NUMERIC,
  overdue_90 NUMERIC,
  total_outstanding NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM get_aging_report(p_customer_id);
$$;

-- Grant execute to authenticated role
GRANT EXECUTE ON FUNCTION perform_stock_operation_v1 TO authenticated;
GRANT EXECUTE ON FUNCTION create_invoice_with_items_v1 TO authenticated;
GRANT EXECUTE ON FUNCTION record_payment_with_invoice_update_v1 TO authenticated;
GRANT EXECUTE ON FUNCTION get_profit_loss_v1 TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_stats_v1 TO authenticated;
GRANT EXECUTE ON FUNCTION get_aging_report_v1 TO authenticated;
