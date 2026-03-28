-- Migration 016: Materialized ledger summary views for performance
-- Replaces slow VIEW queries with pre-computed snapshots refreshed atomically
-- in the invoice/payment transaction RPCs.

-- ============================================================
-- 1. Customer ledger summary — materialized
-- ============================================================
DROP VIEW IF EXISTS customer_ledger_summary;

CREATE MATERIALIZED VIEW customer_ledger_summary AS
SELECT
    c.id                                                          AS customer_id,
    COALESCE(SUM(CASE WHEN il.type = 'invoice' THEN il.debit ELSE 0 END), 0)  AS total_invoiced,
    COALESCE(SUM(CASE WHEN il.type = 'payment' THEN il.credit ELSE 0 END), 0) AS total_paid,
    COALESCE(SUM(il.debit - il.credit), 0)                       AS outstanding_balance,
    MAX(CASE WHEN il.type = 'invoice' THEN il.date END)          AS last_invoice_date,
    MAX(CASE WHEN il.type = 'payment' THEN il.date END)          AS last_payment_date
FROM customers c
LEFT JOIN (
    SELECT
        customer_id,
        'invoice'         AS type,
        invoice_date      AS date,
        grand_total       AS debit,
        0                 AS credit
    FROM invoices
    WHERE customer_id IS NOT NULL
    UNION ALL
    SELECT
        customer_id,
        'payment'         AS type,
        payment_date      AS date,
        0                 AS debit,
        amount            AS credit
    FROM payments
    WHERE customer_id IS NOT NULL
      AND direction = 'received'
) il ON il.customer_id = c.id
GROUP BY c.id;

CREATE UNIQUE INDEX customer_ledger_summary_pkey ON customer_ledger_summary (customer_id);

-- ============================================================
-- 2. Supplier ledger summary — materialized
-- ============================================================
DROP VIEW IF EXISTS supplier_ledger_summary;

CREATE MATERIALIZED VIEW supplier_ledger_summary AS
SELECT
    s.id                                                          AS supplier_id,
    COALESCE(SUM(CASE WHEN sl.type = 'purchase' THEN sl.debit ELSE 0 END), 0)  AS total_purchased,
    COALESCE(SUM(CASE WHEN sl.type = 'payment'  THEN sl.credit ELSE 0 END), 0) AS total_paid,
    COALESCE(SUM(sl.debit - sl.credit), 0)                       AS outstanding_balance,
    MAX(CASE WHEN sl.type = 'purchase' THEN sl.date END)         AS last_purchase_date,
    MAX(CASE WHEN sl.type = 'payment'  THEN sl.date END)         AS last_payment_date
FROM suppliers s
LEFT JOIN (
    SELECT
        supplier_id,
        'purchase'        AS type,
        purchase_date     AS date,
        grand_total       AS debit,
        0                 AS credit
    FROM purchases
    WHERE supplier_id IS NOT NULL
    UNION ALL
    SELECT
        supplier_id,
        'payment'         AS type,
        payment_date      AS date,
        0                 AS debit,
        amount            AS credit
    FROM payments
    WHERE supplier_id IS NOT NULL
      AND direction = 'made'
) sl ON sl.supplier_id = s.id
GROUP BY s.id;

CREATE UNIQUE INDEX supplier_ledger_summary_pkey ON supplier_ledger_summary (supplier_id);

-- ============================================================
-- 3. Helper function to refresh both views concurrently
--    Called at the end of create_invoice_with_items() and
--    record_payment_with_invoice_update() RPCs.
-- ============================================================
CREATE OR REPLACE FUNCTION refresh_ledger_summaries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY customer_ledger_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY supplier_ledger_summary;
END;
$$;
