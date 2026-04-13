-- Migration 024: customers.phone NOT NULL + UNIQUE
-- Row identity remains `id UUID PRIMARY KEY`. Phone is the stable business key (link-or-create
-- in invoiceService uses `.eq('phone', ...)`); duplicates are not allowed after this migration.

-- 1. Backfill NULL/empty phones with unique 10-digit placeholders (prefix 9)
UPDATE customers AS c
SET phone = '9' || LPAD(sub.row_num::text, 9, '0')
FROM (
	SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS row_num
	FROM customers
	WHERE phone IS NULL OR trim(phone) = ''
) AS sub
WHERE c.id = sub.id;

-- 2. De-duplicate: same normalized phone keeps earliest row; others get deterministic unique phones
UPDATE customers AS c
SET phone = '9' || LPAD((ABS(hashtext(c.id::text)) % 1000000000)::text, 9, '0')
WHERE c.id IN (
	SELECT id
	FROM (
		SELECT
			id,
			ROW_NUMBER() OVER (
				PARTITION BY trim(phone)
				ORDER BY created_at
			) AS rn
		FROM customers
	) AS ranked
	WHERE ranked.rn > 1
);

-- 3. Enforce NOT NULL (should already hold after step 1–2)
ALTER TABLE customers ALTER COLUMN phone SET NOT NULL;

-- 4. Replace non-unique index with unique index (phone is the business key)
DROP INDEX IF EXISTS idx_customers_phone;
CREATE UNIQUE INDEX idx_customers_phone ON customers (phone);
