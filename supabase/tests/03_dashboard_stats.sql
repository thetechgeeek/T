-- pgTAP tests for get_dashboard_stats_v1
-- Run with: supabase test db

BEGIN;

SELECT plan(5);

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

SELECT * FROM finish();

ROLLBACK;
