CREATE OR REPLACE FUNCTION get_profit_loss(p_start DATE, p_end DATE)
RETURNS TABLE (
  total_revenue NUMERIC,
  total_cogs NUMERIC,
  gross_profit NUMERIC,
  total_expenses NUMERIC,
  net_profit NUMERIC
) AS $$
DECLARE
  v_revenue NUMERIC;
  v_cogs NUMERIC;
  v_expenses NUMERIC;
BEGIN
  SELECT COALESCE(SUM(grand_total), 0) INTO v_revenue
  FROM invoices WHERE invoice_date BETWEEN p_start AND p_end;

  SELECT COALESCE(SUM(ili.quantity * ii.cost_price), 0) INTO v_cogs
  FROM invoice_line_items ili
  JOIN invoices inv ON inv.id = ili.invoice_id
  JOIN inventory_items ii ON ii.id = ili.item_id
  WHERE inv.invoice_date BETWEEN p_start AND p_end;

  SELECT COALESCE(SUM(amount), 0) INTO v_expenses
  FROM expenses WHERE expense_date BETWEEN p_start AND p_end;

  RETURN QUERY SELECT v_revenue, v_cogs, (v_revenue - v_cogs), v_expenses, (v_revenue - v_cogs - v_expenses);
END;
$$ LANGUAGE plpgsql STABLE;
