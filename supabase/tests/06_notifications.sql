-- pgTAP tests for notifications table and read/unread logic
-- Run with: supabase test db

BEGIN;

SELECT plan(10);

-- ─── Setup ────────────────────────────────────────────────────────────────────

-- Insert test notifications
INSERT INTO notification (id, title, body, type, read, created_at)
VALUES
  ('nt000001-0000-0000-0000-000000000001', 'Test Notif 1', 'Body 1', 'info', false, NOW() - INTERVAL '1 hour'),
  ('nt000001-0000-0000-0000-000000000002', 'Test Notif 2', 'Body 2', 'warning', false, NOW() - INTERVAL '30 min'),
  ('nt000001-0000-0000-0000-000000000003', 'Test Notif 3 Read', 'Body 3', 'info', true, NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO UPDATE SET read = EXCLUDED.read, title = EXCLUDED.title;

-- ─── Tests ────────────────────────────────────────────────────────────────────

-- 1. Notification row exists
SELECT ok(
  EXISTS (SELECT 1 FROM notification WHERE id = 'nt000001-0000-0000-0000-000000000001'),
  'Notification row created'
);

-- 2. Unread count = 2 (of our 3 test rows, 1 is read)
SELECT is(
  (SELECT count(*)::int FROM notification
   WHERE id IN (
     'nt000001-0000-0000-0000-000000000001',
     'nt000001-0000-0000-0000-000000000002',
     'nt000001-0000-0000-0000-000000000003'
   ) AND read = false),
  2,
  'Two unread notifications exist'
);

-- 3. Marking as read sets read = true
UPDATE notification SET read = true WHERE id = 'nt000001-0000-0000-0000-000000000001';

SELECT is(
  (SELECT read FROM notification WHERE id = 'nt000001-0000-0000-0000-000000000001'),
  true,
  'markAsRead sets read = true'
);

-- 4. After marking, only 1 unread remains
SELECT is(
  (SELECT count(*)::int FROM notification
   WHERE id IN (
     'nt000001-0000-0000-0000-000000000001',
     'nt000001-0000-0000-0000-000000000002',
     'nt000001-0000-0000-0000-000000000003'
   ) AND read = false),
  1,
  'One unread notification remains after marking one'
);

-- 5. Mark all as read
UPDATE notification
SET read = true
WHERE id IN (
  'nt000001-0000-0000-0000-000000000001',
  'nt000001-0000-0000-0000-000000000002',
  'nt000001-0000-0000-0000-000000000003'
);

SELECT is(
  (SELECT count(*)::int FROM notification
   WHERE id IN (
     'nt000001-0000-0000-0000-000000000001',
     'nt000001-0000-0000-0000-000000000002',
     'nt000001-0000-0000-0000-000000000003'
   ) AND read = false),
  0,
  'No unread notifications after markAllAsRead'
);

-- 6. Notification type column accepts 'info'
SELECT ok(
  EXISTS (SELECT 1 FROM notification WHERE id = 'nt000001-0000-0000-0000-000000000001' AND type = 'info'),
  'Notification type "info" accepted'
);

-- 7. Notification type column accepts 'warning'
SELECT ok(
  EXISTS (SELECT 1 FROM notification WHERE id = 'nt000001-0000-0000-0000-000000000002' AND type = 'warning'),
  'Notification type "warning" accepted'
);

-- 8. Title column is NOT NULL enforced
SELECT throws_ok(
  $$INSERT INTO notification (title, body, type, read) VALUES (NULL, 'body', 'info', false)$$,
  'null value in column "title" of relation "notification" violates not-null constraint'
);

-- 9. Ordering by created_at DESC returns newest first
SELECT is(
  (SELECT id::text FROM notification
   WHERE id IN (
     'nt000001-0000-0000-0000-000000000001',
     'nt000001-0000-0000-0000-000000000002'
   )
   ORDER BY created_at DESC LIMIT 1),
  'nt000001-0000-0000-0000-000000000002',
  'Most recent notification returned first'
);

-- 10. Table has correct columns
SELECT has_column('public', 'notification', 'id', 'notification has id column');

SELECT * FROM finish();

ROLLBACK;
