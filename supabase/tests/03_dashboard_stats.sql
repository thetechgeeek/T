-- pgTAP tests for get_dashboard_stats_v1
-- Run with: supabase test db

BEGIN;

SELECT plan(11);

-- 1. Function returns a JSON object
SELECT ok(
  pg_typeof(get_dashboard_stats_v1()) = 'jsonb'::regtype OR
  pg_typeof(get_dashboard_stats_v1()) = 'json'::regtype,
  'get_dashboard_stats_v1 returns JSON type'
);

-- 2. Result contains expected keys
SELECT ok(
  get_dashboard_stats_v1() ? 'today_sales',
  'result contains today_sales key'
);

SELECT ok(
  get_dashboard_stats_v1() ? 'outstanding_credit',
  'result contains outstanding_credit key'
);

SELECT ok(
  get_dashboard_stats_v1() ? 'low_stock_count',
  'result contains low_stock_count key'
);

-- 5. Monthly revenue key exists
SELECT ok(
  get_dashboard_stats_v1() ? 'monthly_revenue',
  'result contains monthly_revenue key'
);

-- ─── Extended Tests (DB-003 additions) ───────────────────────────────────────

-- 6. today_sales is numeric (not null, >= 0)
SELECT ok(
  (get_dashboard_stats_v1() ->> 'today_sales')::numeric >= 0,
  'today_sales is a non-negative number'
);

-- 7. low_stock_count is an integer >= 0
SELECT ok(
  (get_dashboard_stats_v1() ->> 'low_stock_count')::int >= 0,
  'low_stock_count is a non-negative integer'
);

-- 8. outstanding_credit is numeric >= 0
SELECT ok(
  (get_dashboard_stats_v1() ->> 'outstanding_credit')::numeric >= 0,
  'outstanding_credit is a non-negative number'
);

-- 9. monthly_revenue is numeric >= 0
SELECT ok(
  (get_dashboard_stats_v1() ->> 'monthly_revenue')::numeric >= 0,
  'monthly_revenue is a non-negative number'
);

-- 10. Result does not contain unexpected null values for core keys
SELECT ok(
  (get_dashboard_stats_v1() ->> 'today_sales') IS NOT NULL
  AND (get_dashboard_stats_v1() ->> 'outstanding_credit') IS NOT NULL
  AND (get_dashboard_stats_v1() ->> 'low_stock_count') IS NOT NULL,
  'Core stat keys are not null'
);

-- 11. invoice_count_today key exists
SELECT ok(
  get_dashboard_stats_v1() ? 'invoice_count_today' OR
  get_dashboard_stats_v1() ? 'today_invoice_count',
  'result contains invoice count for today key'
);

SELECT * FROM finish();

ROLLBACK;
