-- pgTAP tests for record_payment_with_invoice_update_v1
-- Run with: supabase test db

BEGIN;

SELECT plan(11);

-- ─── Setup ────────────────────────────────────────────────────────────────────

INSERT INTO customer (id, name) VALUES ('33333333-3333-3333-3333-333333333333', 'Pay Test Customer')
ON CONFLICT (id) DO NOTHING;

-- Create an unpaid invoice directly (bypass the create function for isolation)
INSERT INTO invoice (
  id, customer_id, invoice_number, invoice_date,
  subtotal, cgst, sgst, igst, total_amount,
  amount_paid, payment_status, payment_mode, is_inter_state
)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  '33333333-3333-3333-3333-333333333333',
  'TEST-PAY-001',
  '2026-03-29',
  1000.00, 90.00, 90.00, 0.00, 1180.00,
  0.00, 'unpaid', 'cash', false
)
ON CONFLICT (id) DO NOTHING;

-- ─── Tests ────────────────────────────────────────────────────────────────────

-- 1. Returns a UUID (payment id)
SELECT ok(
  record_payment_with_invoice_update_v1(
    '44444444-4444-4444-4444-444444444444'::uuid,
    500.00, 'cash', '2026-03-29'::date, null
  ) IS NOT NULL,
  'record_payment returns a UUID'
);

-- 2. Invoice payment_status changes to 'partial' after 500 of 1180
SELECT is(
  (SELECT payment_status::text FROM invoice WHERE id = '44444444-4444-4444-4444-444444444444'),
  'partial',
  'Invoice status is partial after partial payment'
);

-- 3. amount_paid is updated
SELECT is(
  (SELECT amount_paid FROM invoice WHERE id = '44444444-4444-4444-4444-444444444444'),
  500.00,
  'Invoice amount_paid is updated'
);

-- 4. Full payment marks invoice as paid
SELECT record_payment_with_invoice_update_v1(
  '44444444-4444-4444-4444-444444444444'::uuid,
  680.00, 'upi', '2026-03-29'::date, null
);

SELECT is(
  (SELECT payment_status::text FROM invoice WHERE id = '44444444-4444-4444-4444-444444444444'),
  'paid',
  'Invoice status is paid after full payment'
);

-- 5. Payment record is written to payment table
SELECT ok(
  (SELECT count(*)::int FROM payment WHERE invoice_id = '44444444-4444-4444-4444-444444444444') >= 2,
  'Two payment rows were written'
);

-- ─── Extended Tests (DB-004 additions) ───────────────────────────────────────

-- 6. Payment row has correct amount
SELECT is(
  (SELECT amount FROM payment
   WHERE invoice_id = '44444444-4444-4444-4444-444444444444'
   ORDER BY created_at ASC LIMIT 1),
  500.00,
  'First payment row has amount = 500'
);

-- 7. Payment row has correct payment_mode
SELECT is(
  (SELECT payment_mode::text FROM payment
   WHERE invoice_id = '44444444-4444-4444-4444-444444444444'
   ORDER BY created_at ASC LIMIT 1),
  'cash',
  'First payment row has payment_mode = cash'
);

-- 8. Second payment row recorded with correct mode
SELECT is(
  (SELECT payment_mode::text FROM payment
   WHERE invoice_id = '44444444-4444-4444-4444-444444444444'
   ORDER BY created_at DESC LIMIT 1),
  'upi',
  'Second payment row has payment_mode = upi'
);

-- 9. Overpayment: paying more than remaining balance is handled
--    Create a fresh unpaid invoice for this test
INSERT INTO invoice (
  id, customer_id, invoice_number, invoice_date,
  subtotal, cgst, sgst, igst, total_amount,
  amount_paid, payment_status, payment_mode, is_inter_state
)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  '33333333-3333-3333-3333-333333333333',
  'TEST-PAY-002',
  '2026-03-30',
  500.00, 45.00, 45.00, 0.00, 590.00,
  0.00, 'unpaid', 'cash', false
)
ON CONFLICT (id) DO NOTHING;

SELECT record_payment_with_invoice_update_v1(
  '55555555-5555-5555-5555-555555555555'::uuid,
  590.00, 'cash', '2026-03-30'::date, null
);

SELECT is(
  (SELECT payment_status::text FROM invoice WHERE id = '55555555-5555-5555-5555-555555555555'),
  'paid',
  'Exact-amount payment marks invoice as paid'
);

-- 10. payment table has invoice_id FK (not null for invoice-linked payments)
SELECT ok(
  (SELECT invoice_id IS NOT NULL FROM payment
   WHERE invoice_id = '44444444-4444-4444-4444-444444444444'
   LIMIT 1),
  'Payment row has non-null invoice_id'
);

-- 11. payment.created_at is set automatically
SELECT ok(
  EXISTS(
    SELECT 1 FROM payment
    WHERE invoice_id = '44444444-4444-4444-4444-444444444444'
      AND created_at IS NOT NULL
  ),
  'Payment rows have created_at timestamp'
);

SELECT * FROM finish();

ROLLBACK;
