# TileMaster — Implementation Plan

**Derived from**: `ARCHITECTURE_REVIEW.md` (Sections 1-31 + Appendices)
**Sequencing principle**: Every task builds on completed foundations. Later phases never require undoing earlier work. Database changes land before the code that calls them. Types land before the code that uses them. Infrastructure lands before the code it enforces.

> **Formatting convention for all code in this plan and in the codebase:**
> - **Indentation**: Tabs (displayed as 4 spaces) — matches IntelliJ `Default.xml` → `USE_TAB_CHARACTER: true`, `TAB_SIZE: 4`
> - **Quotes**: Single quotes (`'`) — matches codebase convention (488 single-quote imports vs 2 double-quote in Deno only)
> - **Semicolons**: Yes — matches codebase convention
> - **Trailing commas**: All — cleaner diffs, standard for modern TypeScript
> - **Bracket spacing**: Yes (`{ X }` not `{X}`) — matches IntelliJ `SPACES_WITHIN_IMPORTS: true`
> - **Print width**: 100 characters
>
> Code snippets in this plan may use spaces for readability in Markdown, but all actual implementation must follow the Prettier config in Phase 0.3.

---

## Table of Contents

- [Phase 0: Guard Rails & Tooling](#phase-0-guard-rails--tooling)
- [Phase 1: Database Migrations (Schema Fixes & New RPCs)](#phase-1-database-migrations-schema-fixes--new-rpcs)
- [Phase 2: Type System & Error Foundations](#phase-2-type-system--error-foundations)
- [Phase 3: Core Architecture (Repository + Service + Event Bus)](#phase-3-core-architecture-repository--service--event-bus)
- [Phase 4: Store Layer Overhaul](#phase-4-store-layer-overhaul)
- [Phase 5: Validation Layer (Zod + react-hook-form)](#phase-5-validation-layer-zod--react-hook-form)
- [Phase 6: Theme, Utilities & Shared Hooks](#phase-6-theme-utilities--shared-hooks)
- [Phase 7: Component Fixes (Atoms → Molecules → Organisms)](#phase-7-component-fixes-atoms--molecules--organisms)
- [Phase 8: Screen Refactors](#phase-8-screen-refactors)
- [Phase 9: Edge Functions & External Integrations](#phase-9-edge-functions--external-integrations)
- [Phase 10: Observability, Resilience & Offline](#phase-10-observability-resilience--offline)
- [Phase 11: Testing](#phase-11-testing)
- [Phase 12: Compliance & Production Readiness](#phase-12-compliance--production-readiness)
- [Dependency Graph (Visual)](#dependency-graph-visual)

---

## Phase 0: Guard Rails & Tooling

**Why first**: Every subsequent phase produces code. That code must be linted, formatted, and type-checked from the start. Setting up tooling now means every future commit is automatically cleaner.

**Depends on**: Nothing.
**Unlocks**: Everything — all subsequent phases benefit.

### ✅ 0.1 — Fix `.gitignore` to exclude `.env`

> Review §10.2

| Detail | Value |
|--------|-------|
| **Files** | `.gitignore` |
| **What** | Add `.env` to the ignore list (currently only `.env*.local` is ignored). |
| **Steps** | 1. Open `.gitignore`. 2. Add a line: `.env`. 3. If `.env` is already tracked, run `git rm --cached .env` to untrack it. |
| **Create** | `.env.example` with all required keys (blank values): `EXPO_PUBLIC_SUPABASE_URL=`, `EXPO_PUBLIC_SUPABASE_ANON_KEY=`, `GEMINI_API_KEY=`. |
| **Verify** | `git status` should not show `.env` as tracked. |

### ✅ 0.2 — Configure ESLint

> Review §11.1

| Detail | Value |
|--------|-------|
| **Files** | New: `.eslintrc.js` |
| **Install** | `npx expo install -- --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-native` |
| **Config highlights** | (a) `@typescript-eslint/no-explicit-any`: error — blocks new `any` from entering. (b) `@typescript-eslint/no-unused-vars`: error — catches dead imports. (c) `react-hooks/exhaustive-deps`: warn. (d) `react-native/no-unused-styles`: error — catches dead StyleSheet keys. |
| **Scope exclusions** | Exclude `supabase/functions/` (Deno, different runtime). |
| **Script** | Add `"lint": "eslint . --ext .ts,.tsx"` and `"lint:fix": "eslint . --ext .ts,.tsx --fix"` to `package.json` scripts. |
| **Note** | Do NOT auto-fix the existing codebase yet. Run `eslint .` once to generate a baseline count of violations. Record this count in a comment in the PR so regressions are measurable. |

### ✅ 0.3 — Configure Prettier

> Review §11.1

Must align with the IntelliJ code style (`intellij_settings/codestyles/Default.xml`) so that IDE auto-format and Prettier produce identical output — no format ping-pong between developers using the IDE vs CLI.

| Detail | Value |
|--------|-------|
| **Files** | New: `.prettierrc`, `.prettierignore` |
| **Install** | `npm install --save-dev prettier eslint-config-prettier` |

**`.prettierrc`** — derived from IntelliJ `Default.xml`:

```json
{
  "useTabs": true,
  "tabWidth": 4,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "semi": true,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**Rationale for each setting (mapped from IntelliJ → Prettier):**

| Prettier Option | Value | IntelliJ Source |
|-----------------|-------|-----------------|
| `useTabs` | `true` | `<option name="USE_TAB_CHARACTER" value="true" />` — set globally and per-language (JS, TS, HTML, XML, LESS, Scala) |
| `tabWidth` | `4` | IntelliJ default tab size is 4; Scala section explicitly sets `<option name="TAB_SIZE" value="4" />`. User confirms 4-space tabs. |
| `singleQuote` | `true` | IntelliJ has no explicit quote preference configured, but the codebase uses single quotes overwhelmingly (488 single-quote imports across 100 files vs 2 double-quote imports in the Deno Edge Function only). Single quotes are the React/React Native community standard. |
| `bracketSpacing` | `true` | `<option name="SPACES_WITHIN_IMPORTS" value="true" />` in both `JSCodeStyleSettings` and `TypeScriptCodeStyleSettings` — renders as `import { X } from '...'` (space after `{` and before `}`). |
| `trailingComma` | `"all"` | Not configured in IntelliJ. `"all"` is the TypeScript/modern JS standard — enables cleaner git diffs and prevents comma-insertion bugs. |
| `semi` | `true` | Not configured in IntelliJ. The codebase consistently uses semicolons. |
| `printWidth` | `100` | Not configured in IntelliJ. 100 is the industry standard for TypeScript projects (Airbnb, Google, Expo all use 80-120). |
| `arrowParens` | `"always"` | Prettier default. Consistent with TypeScript's type annotation style `(x: number) => x`. |
| `endOfLine` | `"lf"` | Standard for cross-platform projects to avoid `\r\n` diffs. |

**`.prettierignore`:**

```
node_modules
dist
.expo
android
ios
supabase/functions
```

(`supabase/functions` excluded because it's Deno runtime with different import conventions — double-quote URL imports are idiomatic in Deno.)

| Detail | Value |
|--------|-------|
| **Script** | Add `"format": "prettier --write \"**/*.{ts,tsx,json,md}\""` to `package.json`. |
| **Integration** | Add `eslint-config-prettier` to `.eslintrc.js` extends array (last position) so Prettier rules don't conflict with ESLint. |

**IntelliJ integration note**: If developers use IntelliJ's built-in formatter, they should enable **Settings → Languages & Frameworks → JavaScript → Prettier → Run on save** and set it to use the project's `.prettierrc`. This avoids the IntelliJ formatter and Prettier producing different output for edge cases (trailing commas, arrow parens) that IntelliJ's `Default.xml` doesn't explicitly configure. Alternatively, the EditorConfig integration (currently disabled: `<option name="ENABLED" value="false" />`) can be re-enabled alongside a `.editorconfig` file that mirrors the Prettier config for non-JS files.

### ✅ 0.4 — Configure Husky + lint-staged

> Review §11.1

| Detail | Value |
|--------|-------|
| **Install** | `npm install --save-dev husky lint-staged && npx husky init` |
| **`.husky/pre-commit`** | `npx lint-staged` |
| **`package.json` addition** | `"lint-staged": { "*.{ts,tsx}": ["eslint --fix --max-warnings=0", "prettier --write"], "*.{json,md}": ["prettier --write"] }` |
| **Verify** | Make a small change, commit. Husky should run lint-staged. If a lint error exists, the commit should be blocked. |

### ✅ 0.5 — Add `typecheck` and `validate` scripts

> Review §11.2

| Detail | Value |
|--------|-------|
| **Files** | `package.json` |
| **Add scripts** | `"typecheck": "tsc --noEmit"`, `"validate": "npm run typecheck && npm run lint && npm run test"` |
| **Verify** | `npm run typecheck` passes (it should — `strict: true` is already on). |

### ✅ 0.6 — GitHub Actions CI

> Review §11.3

| Detail | Value |
|--------|-------|
| **Files** | New: `.github/workflows/ci.yml` |
| **Workflow** | Trigger on push + PR to `main`. Steps: checkout → setup-node → `npm ci` → `npm run typecheck` → `npm run lint` → `npm run test -- --coverage`. |
| **Coverage** | Add `codecov/codecov-action@v4` step (optional, but recommended for tracking progress). |
| **Verify** | Push a branch, confirm the workflow runs green. |

### ✅ 0.7 — Run Prettier on entire codebase (one-time formatting commit)

| Detail | Value |
|--------|-------|
| **Why now** | After Prettier is configured, run it once across the entire codebase so that all subsequent diffs are formatting-noise-free. |
| **Command** | `npx prettier --write "**/*.{ts,tsx,json,md}"` |
| **Commit** | Single commit: `"chore: format entire codebase with Prettier"` — this commit is large but contains zero logic changes. It must land before any other code changes so git blame stays clean for functional commits. |

**Important — this is a significant reformat:** The existing codebase uses 2-space indentation (likely from Expo scaffolding defaults), but the IntelliJ config and your preference is tabs with 4-space width. Prettier will rewrite indentation across every file. To preserve meaningful `git blame`:

```bash
# After the formatting commit, record it as a blame-ignore revision:
echo "<commit-hash>" >> .git-blame-ignore-revs

# Configure git to use it:
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

Also commit `.git-blame-ignore-revs` to the repo so all developers benefit.

---

## Phase 1: Database Migrations (Schema Fixes & New RPCs)

**Why second**: All code changes in Phases 2-8 depend on the database schema being correct. Migrations must be deployed before the code that calls new functions or expects new columns.

**Depends on**: Phase 0 (tooling catches issues in migration SQL files if ESLint SQL plugin is added later, and CI will validate the repo state).
**Unlocks**: Phases 2-12 (every code layer depends on the DB schema).

### ✅ 1.1 — Migration `008_schema_fixes.sql`: Column type fixes & missing triggers

> Review §6.4, §6.5, §28.1

| Detail | Value |
|--------|-------|
| **File** | New: `supabase/migrations/008_schema_fixes.sql` |

**Contents:**

```sql
-- 1.1a: Change invoice_line_items.quantity from INTEGER to NUMERIC
--        Tiles can be sold in fractional box quantities (e.g., 2.5 boxes)
--        Review §6.4
ALTER TABLE invoice_line_items ALTER COLUMN quantity TYPE NUMERIC USING quantity::NUMERIC;

-- 1.1b: Change purchase_line_items.quantity from INTEGER to NUMERIC (same reason)
ALTER TABLE purchase_line_items ALTER COLUMN quantity TYPE NUMERIC USING quantity::NUMERIC;

-- 1.1c: Add missing updated_at column + trigger to payments table
--        Review §6.5
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
CREATE TRIGGER handle_updated_at_payments
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

-- 1.1d: Add place_of_supply to invoices (required for GST inter-state determination)
--        Review §28.1
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS place_of_supply TEXT;

-- 1.1e: Add reverse_charge flag to invoices (required on GST invoices even if "No")
--        Review §28.1
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS reverse_charge BOOLEAN NOT NULL DEFAULT false;
```

**Verify**: Run `supabase db push` or `supabase migration up` locally. Confirm no errors.

### ✅ 1.2 — Migration `009_missing_indexes.sql`: Performance indexes

> Review §6.3, §26.6

| Detail | Value |
|--------|-------|
| **File** | New: `supabase/migrations/009_missing_indexes.sql` |

**Contents:**

```sql
-- Payment direction lookups (customer_ledger_summary view)
CREATE INDEX IF NOT EXISTS idx_payments_direction ON payments (direction);

-- Expense category aggregation (finance reports)
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category);

-- Supplier lookups on purchases (supplier ledger)
CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON purchases (supplier_id);

-- Line item → inventory item joins (COGS, stock history)
CREATE INDEX IF NOT EXISTS idx_line_items_item ON invoice_line_items (item_id);

-- Purchase line item → purchase joins
CREATE INDEX IF NOT EXISTS idx_purchase_line_items_purchase ON purchase_line_items (purchase_id);
```

### ✅ 1.3 — Migration `010_fix_profit_loss.sql`: Rewrite `get_profit_loss()` to eliminate redundant subqueries

> Review §6.2

| Detail | Value |
|--------|-------|
| **File** | New: `supabase/migrations/010_fix_profit_loss.sql` |

**What**: Rewrite `get_profit_loss(p_start, p_end)` to use local variables instead of executing the same subquery 3x for revenue and 3x for COGS. |

**Contents:**

```sql
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
```

### ✅ 1.4 — Migration `011_transactional_invoice.sql`: Atomic invoice creation RPC

> Review §2 (full section), §24.5, §28.2

| Detail | Value |
|--------|-------|
| **File** | New: `supabase/migrations/011_transactional_invoice.sql` |

**This is the single most important migration. It solves:**
- Non-transactional 4-step invoice creation (§2)
- Invoice sequence gap risk (§24.5, §28.2)
- Stock deduction silent failure (Appendix A)

**Contents:**

```sql
CREATE OR REPLACE FUNCTION create_invoice_with_items(
  p_invoice JSONB,
  p_line_items JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_invoice_number TEXT;
  v_invoice_id UUID;
  v_item JSONB;
BEGIN
  -- 1. Generate invoice number (locked row — inside same transaction)
  v_invoice_number := generate_invoice_number();

  -- 2. Insert invoice
  INSERT INTO invoices (
    invoice_number, invoice_date, customer_id, customer_name,
    customer_gstin, customer_phone, customer_address,
    subtotal, cgst_total, sgst_total, igst_total, discount_total, grand_total,
    is_inter_state, place_of_supply, reverse_charge,
    payment_status, payment_mode, amount_paid, notes, terms
  )
  SELECT
    v_invoice_number,
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

  -- 3. Insert all line items in one batch
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

  -- 4. Stock deductions — all or nothing
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_line_items)
  LOOP
    IF (v_item->>'item_id') IS NOT NULL THEN
      PERFORM perform_stock_operation(
        (v_item->>'item_id')::UUID,
        'stock_out',
        -((v_item->>'quantity')::INTEGER),
        'Invoice #' || v_invoice_number,
        'invoice',
        v_invoice_id
      );
    END IF;
  END LOOP;

  -- If ANY step above fails, the entire transaction rolls back
  RETURN jsonb_build_object(
    'id', v_invoice_id,
    'invoice_number', v_invoice_number
  );
END;
$$ LANGUAGE plpgsql;
```

### ✅ 1.5 — Migration `012_transactional_payment.sql`: Atomic payment + invoice update RPC

> Review §2 (payment race condition)

| Detail | Value |
|--------|-------|
| **File** | New: `supabase/migrations/012_transactional_payment.sql` |

**Contents:**

```sql
CREATE OR REPLACE FUNCTION record_payment_with_invoice_update(
  p_payment JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_payment_id UUID;
  v_invoice_id UUID;
  v_new_paid NUMERIC;
  v_grand_total NUMERIC;
  v_new_status payment_status;
BEGIN
  v_invoice_id := (p_payment->>'invoice_id')::UUID;

  -- 1. Insert payment
  INSERT INTO payments (
    payment_date, amount, payment_mode, direction,
    customer_id, supplier_id, invoice_id, purchase_id, notes
  )
  SELECT
    (p_payment->>'payment_date')::DATE,
    (p_payment->>'amount')::NUMERIC,
    (p_payment->>'payment_mode')::payment_mode,
    p_payment->>'direction',
    (p_payment->>'customer_id')::UUID,
    (p_payment->>'supplier_id')::UUID,
    v_invoice_id,
    (p_payment->>'purchase_id')::UUID,
    p_payment->>'notes'
  RETURNING id INTO v_payment_id;

  -- 2. If linked to an invoice, atomically update amount_paid + status
  IF v_invoice_id IS NOT NULL THEN
    SELECT grand_total, amount_paid + (p_payment->>'amount')::NUMERIC
    INTO v_grand_total, v_new_paid
    FROM invoices
    WHERE id = v_invoice_id
    FOR UPDATE;  -- row lock prevents concurrent payment race condition

    v_new_status := CASE
      WHEN v_new_paid >= v_grand_total THEN 'paid'::payment_status
      WHEN v_new_paid > 0 THEN 'partial'::payment_status
      ELSE 'unpaid'::payment_status
    END;

    UPDATE invoices
    SET amount_paid = v_new_paid, payment_status = v_new_status
    WHERE id = v_invoice_id;
  END IF;

  RETURN jsonb_build_object('id', v_payment_id, 'new_status', v_new_status);
END;
$$ LANGUAGE plpgsql;
```

### ✅ 1.6 — Migration `013_fy_sequence_reset.sql`: Fix financial year sequence boundary

> Review §28.3

| Detail | Value |
|--------|-------|
| **File** | New: `supabase/migrations/013_fy_sequence_reset.sql` |

**What**: Modify `generate_invoice_number()` to reset the sequence to 1 when the financial year changes (April 1).

**Contents:**

```sql
-- Add last_fy column to track the financial year of the last invoice
ALTER TABLE business_profile ADD COLUMN IF NOT EXISTS last_invoice_fy TEXT;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  v_id UUID;
  v_prefix TEXT;
  v_seq BIGINT;
  v_fy TEXT;
  v_last_fy TEXT;
BEGIN
  SELECT id, invoice_prefix, invoice_sequence, last_invoice_fy
  INTO v_id, v_prefix, v_seq, v_last_fy
  FROM business_profile
  LIMIT 1
  FOR UPDATE;

  v_fy := CASE
    WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 4
    THEN EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' || LPAD((EXTRACT(YEAR FROM CURRENT_DATE) + 1 - 2000)::TEXT, 2, '0')
    ELSE (EXTRACT(YEAR FROM CURRENT_DATE) - 1)::TEXT || '-' || LPAD((EXTRACT(YEAR FROM CURRENT_DATE) - 2000)::TEXT, 2, '0')
  END;

  -- Reset sequence if financial year has changed
  IF v_last_fy IS NULL OR v_last_fy <> v_fy THEN
    v_seq := 1;
  ELSE
    v_seq := v_seq + 1;
  END IF;

  UPDATE business_profile
  SET invoice_sequence = v_seq, last_invoice_fy = v_fy
  WHERE id = v_id;

  RETURN v_prefix || '/' || v_fy || '/' || LPAD(v_seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
```

### ✅ 1.7 — Migration `014_audit_log.sql`: Audit trail table + triggers

> Review §28.4

| Detail | Value |
|--------|-------|
| **File** | New: `supabase/migrations/014_audit_log.sql` |

**Contents:**

```sql
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_by UUID,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_table_record ON audit_log (table_name, record_id);
CREATE INDEX idx_audit_log_changed_at ON audit_log (changed_at DESC);

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, record_id, action, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Attach to critical tables
CREATE TRIGGER audit_invoices AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_inventory AFTER INSERT OR UPDATE OR DELETE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_expenses AFTER INSERT OR UPDATE OR DELETE ON expenses
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

-- Enable RLS on audit_log (read-only for authenticated, no write from client)
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_read_only" ON audit_log FOR SELECT TO authenticated USING (true);
```

### ✅ 1.8 — Migration `015_low_stock_notification.sql`: Notification system + low stock trigger

> Review §30.5

| Detail | Value |
|--------|-------|
| **File** | New: `supabase/migrations/015_low_stock_notification.sql` |

**Contents:**

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_read ON notifications (read, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_full_access_notifications" ON notifications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Auto-notify when stock drops below threshold
CREATE OR REPLACE FUNCTION notify_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.low_stock_threshold > 0
     AND NEW.box_count <= NEW.low_stock_threshold
     AND (OLD.box_count > OLD.low_stock_threshold OR OLD.box_count IS NULL) THEN
    INSERT INTO notifications (type, title, body, metadata)
    VALUES (
      'low_stock',
      'Low Stock Alert',
      NEW.design_name || ' has only ' || NEW.box_count || ' boxes remaining',
      jsonb_build_object('item_id', NEW.id, 'current_stock', NEW.box_count, 'threshold', NEW.low_stock_threshold)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_low_stock
  AFTER UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION notify_low_stock();
```

---

## Phase 2: Type System & Error Foundations

**Why now**: Every subsequent file — repositories, services, stores, screens — imports types and errors. These must exist before any refactoring begins. This phase is pure additive (new files) with zero edits to existing code.

**Depends on**: Phase 1 (new DB columns like `place_of_supply` need corresponding types).
**Unlocks**: Phases 3-8 (all code layers import these).

### ✅ 2.1 — Create `AppError` hierarchy

> Review §12

| Detail | Value |
|--------|-------|
| **File** | New: `src/errors/AppError.ts` |

**Contents** (exact implementation from review §12):
- `AppError` base class with `code`, `userMessage`, `cause`
- `ValidationError` with `fieldErrors: Record<string, string[]>`
- `NetworkError` wrapping underlying cause
- `InsufficientStockError` with `itemName`, `available`, `requested`
- `NotFoundError` with `entity`, `id`
- `ConflictError` (for duplicate detection)

Also export a helper:

```typescript
export function toAppError(err: unknown): AppError {
	if (err instanceof AppError) return err;
	if (err instanceof Error) {
		return new AppError(err.message, 'UNKNOWN', 'An unexpected error occurred', err);
	}
	return new AppError(String(err), 'UNKNOWN', 'An unexpected error occurred');
}
```

### ✅ 2.2 — Create `src/errors/index.ts` barrel export

| Detail | Value |
|--------|-------|
| **File** | New: `src/errors/index.ts` |
| **Contents** | Re-export everything from `AppError.ts` for clean imports: `export * from './AppError';` |

### ✅ 2.3 — Fix all type files to match new DB schema

> Review §5.2, §5.4, §6.4, §28.1

**Files to update** (each is a separate sub-task):

#### 2.3a — `src/types/common.ts`

- Change `type UUID = string` to branded type:
  ```typescript
  declare const __brand: unique symbol;
  type Brand<T, B extends string> = T & { readonly [__brand]: B };
  export type UUID = Brand<string, 'UUID'>;
  ```
  (Note: Type-level code — indentation doesn't apply at top-level declarations.)
- Add helper: `export function toUUID(s: string): UUID { return s as UUID; }`
- Verify `LoadingState`, `ApiError`, `PaginationState` are exported (they exist but are underused).

#### 2.3b — `src/types/invoice.ts`

- Change `quantity: number` to explicitly allow decimal (`quantity: number` is fine in TS, but add JSDoc: `/** Can be fractional — e.g. 2.5 boxes */`).
- Add `place_of_supply?: string` to the `Invoice` interface.
- Add `reverse_charge: boolean` to the `Invoice` interface.
- Verify `InvoiceLineItemInput` has `gst_rate: number` (not hardcoded to 18).

#### 2.3c — `src/types/finance.ts`

- Add `updated_at: string` to the `Payment` interface.
- Verify `Expense`, `Purchase`, `ProfitLossSummary` types exist here.

#### 2.3d — Delete duplicate types from `src/services/financeService.ts` (lines 4-30)

> Review §5.2

- Remove the inline `Expense`, `Purchase`, `ProfitLossSummary` interfaces.
- Add `import type { Expense, Purchase, ProfitLossSummary } from '../types/finance';` at the top.

#### 2.3e — `src/types/order.ts`

- Replace `raw_llm_response: any` with:
  ```typescript
  raw_llm_response: Record<string, unknown> | null;
  ```

#### 2.3f — New: `src/types/businessProfile.ts`

- Create a proper `BusinessProfile` type matching the `business_profile` table schema.
- This replaces `businessProfile: any` in `pdfService.ts` (§18.3).

#### 2.3g — New: `src/types/notification.ts`

- Define `Notification` interface matching the new `notifications` table from migration 015.

### 🔧 2.4 — Remove all `any` types

> Review §5.1 (full audit list)

This is a file-by-file sweep. Each bullet is an atomic change:

| File | Line(s) | Current | Fix |
|------|---------|---------|-----|
| `invoiceService.ts` | 36 | `data as any[]` | Type the select query: `.select('*, line_items:invoice_line_items(*)')` returns `Invoice & { line_items: InvoiceLineItem[] }`. Use a typed response. |
| `inventoryStore.ts` | 19-20 | `createItem: (item: any)`, `updateItem: (id, updates: any)` | Change to `InventoryItemInsert` and `Partial<InventoryItemInsert>`. Create `InventoryItemInsert` type in `types/inventory.ts` if missing. |
| `financeService.ts` | 75 | `(p.suppliers as any)?.name` | Create a typed join interface: `PurchaseWithSupplier = Purchase & { suppliers: { name: string } | null }`. Use it in the select. |
| `orderService.ts` | 17 | `raw_llm_response: any` | Already fixed by 2.3e above. |
| `invoiceStore.ts` | 87 | `require('./inventoryStore')` — untyped | Will be replaced entirely in Phase 4 (event bus). For now, add a `// @ts-expect-error — replaced in Phase 4` or convert to static import. |
| `app/_layout.tsx` | 36 | `useTheme() as any` | Fix the `useTheme` return type in `ThemeProvider.tsx` to be properly typed (see Phase 6). |
| `pdfService.ts` | 29 | `businessProfile: any` | Change to `BusinessProfile` (created in 2.3f). |
| `pdfService.ts` | 7 | Dead `useLocale` import | Delete the import line. |
| `Screen.tsx` | 61 | `contentProps as any` | Fix in Phase 7 (§14.2 — split into two branches). |
| `invoices/create.tsx` | 39, 44, 115, 123, 131 | Multiple `any` casts | Will be replaced entirely in Phase 8 (screen decomposition). For now, add typed interfaces. |

---

## Phase 3: Core Architecture (Repository + Service + Event Bus)

**Why now**: With types and errors in place, we can build the architecture that every subsequent phase depends on. Repositories wrap Supabase. Services contain business logic. The event bus decouples stores.

**Depends on**: Phase 2 (types, errors).
**Unlocks**: Phase 4 (stores), Phase 5 (validation), Phase 8 (screens), Phase 11 (tests).

### ✅ 3.1 — Create base repository

> Review §3, step 1

| Detail | Value |
|--------|-------|
| **File** | New: `src/repositories/baseRepository.ts` |

**Implementation:**

```typescript
import { supabase } from '../config/supabase';
import { AppError } from '../errors';
import type { UUID } from '../types/common';

export interface QueryOptions {
	filters?: Record<string, unknown>;
	sort?: { column: string; ascending: boolean };
	pagination?: { page: number; pageSize: number };
	search?: { columns: string[]; term: string };
}

export interface PaginatedResult<T> {
	data: T[];
	total: number;
}

export function createRepository<T extends { id: UUID }>(tableName: string) {
	return {
		async findMany(options: QueryOptions = {}): Promise<PaginatedResult<T>> {
			let query = supabase.from(tableName).select('*', { count: 'exact' });
			query = applyFilters(query, options);
			const { data, count, error } = await query;
			if (error) {
				throw new AppError(
					error.message,
					error.code ?? 'DB_ERROR',
					'Failed to fetch data',
					error,
				);
			}
			return { data: (data ?? []) as T[], total: count ?? 0 };
		},
		async findById(id: UUID): Promise<T> { /* ... */ },
		async create(payload: Partial<T>): Promise<T> { /* ... */ },
		async update(id: UUID, payload: Partial<T>): Promise<T> { /* ... */ },
		async remove(id: UUID): Promise<void> { /* ... */ },
		async rpc<R>(fnName: string, params: Record<string, unknown>): Promise<R> { /* ... */ },
	};
}
```

Include a private `applyFilters` function that handles:
- `.ilike()` for search (with proper escaping of `%` and `_` — §10.1)
- `.eq()` / `.gte()` / `.lte()` for exact/range filters
- `.order()` for sorting
- `.range()` for pagination (initially OFFSET-based; keyset in Phase 12)

### ✅ 3.2 — Create domain repositories

> Review §3, step 2

One file per domain, each extending the base:

| File | Special Methods |
|------|-----------------|
| `src/repositories/invoiceRepository.ts` | `findWithLineItems(id)`, `createAtomic(invoice, lineItems)` (calls RPC from migration 011) |
| `src/repositories/paymentRepository.ts` | `recordWithInvoiceUpdate(payment)` (calls RPC from migration 012) |
| `src/repositories/inventoryRepository.ts` | `findLowStock()` (uses `low_stock_items` view — fixes §17.5), `performStockOp(...)` |
| `src/repositories/customerRepository.ts` | `search(term)` — searches both `name` AND `phone` (fixes §customerService.ts:19) |
| `src/repositories/financeRepository.ts` | `fetchProfitLoss(start, end)`, `fetchDashboardStats()` (calls existing RPCs) |
| `src/repositories/orderRepository.ts` | `findDuplicates(designName)` — case-insensitive (fixes §orderService.ts:91-94) |
| `src/repositories/supplierRepository.ts` | Base only. |
| `src/repositories/expenseRepository.ts` | Base only. |
| `src/repositories/notificationRepository.ts` | `markAsRead(id)`, `fetchUnread()`. |

Also create: `src/repositories/index.ts` — barrel export.

### ✅ 3.3 — Refactor services to use repositories

> Review §3, step 3

Each service becomes a factory function accepting its repository as a parameter (dependency injection):

#### 3.3a — `src/services/invoiceService.ts`

```typescript
import { invoiceRepository } from '../repositories/invoiceRepository';
import { InvoiceInputSchema } from '../schemas/invoice'; // Created in Phase 5
import { calculateInvoiceTotals } from '../utils/gstCalculator';

export function createInvoiceService(repo = invoiceRepository) {
	return {
		async fetchInvoices(filters, page, pageSize) {
			return repo.findMany({ filters, pagination: { page, pageSize } });
		},
		async fetchInvoiceDetail(id: UUID) {
			return repo.findWithLineItems(id);
		},
		async createInvoice(input: InvoiceInput) {
			// Validation will be added in Phase 5
			const totals = calculateInvoiceTotals(input.line_items, input.is_inter_state);
			return repo.createAtomic({ ...input, ...totals }, input.line_items);
		},
	};
}

// Default instance for production use
export const invoiceService = createInvoiceService();
```

**Key changes from current:**
- All Supabase calls go through `repo`, not direct `supabase.from()`
- The 4-step non-transactional flow is replaced by a single `repo.createAtomic()` call
- The silent `console.error` on stock deduction failure is gone (the RPC transaction handles it)
- `as any[]` is gone (typed via repository)
- Hardcoded English string in stock reason is gone (moved to RPC)

#### 3.3b — `src/services/paymentService.ts`

- Replace non-transactional read-modify-write with `repo.recordWithInvoiceUpdate()`
- Race condition eliminated

#### 3.3c — `src/services/inventoryService.ts`

- Fix broken `lowStockOnly` filter by delegating to `repo.findLowStock()`
- Fix SQL injection risk in `.or()` by using repo's safe `applyFilters`

#### 3.3d — `src/services/customerService.ts`

- Search on both `name` AND `phone` via `repo.search()`

#### 3.3e — `src/services/financeService.ts`

- Remove duplicate type definitions (already done in 2.3d)
- Remove `as any` cast (use typed join from repo)
- Use `repo.fetchProfitLoss()` instead of direct `.rpc()` call

#### 3.3f — `src/services/orderService.ts`

- Fix case-sensitive duplicate detection (delegate to `repo.findDuplicates()`)
- Type `raw_llm_response` (already fixed in 2.3e)

#### 3.3g — `src/services/pdfService.ts`

- Remove dead `useLocale` import (already done in 2.4)
- Replace `businessProfile: any` with `BusinessProfile` type (already done in 2.4)
- Replace `convertNumberToWords` stub with import from `currency.ts` (§17.2)
- Add `escapeHtml()` utility and apply to all interpolated values in HTML template (§18.1)

#### 3.3h — `src/services/authService.ts`

- No structural changes needed. Service is thin and correct.
- Session management improvements are in Phase 10.

#### 3.3i — New: `src/services/dashboardService.ts`

- Single-purpose service calling `repo.fetchDashboardStats()` (§15.3)
- Replaces client-side aggregation on partial data in `(tabs)/index.tsx`

#### 3.3j — New: `src/services/reportService.ts`

> Review §30.2

- Centralize all report-related RPC calls:
  ```typescript
  export const reportService = {
    getDashboardStats: () => financeRepo.fetchDashboardStats(),
    getProfitLoss: (start, end) => financeRepo.fetchProfitLoss(start, end),
    getAgingReport: (customerId?) => financeRepo.fetchAgingReport(customerId),
  };
  ```

### ✅ 3.4 — Create event bus for cross-store decoupling

> Review §4.1

| Detail | Value |
|--------|-------|
| **File** | New: `src/events/appEvents.ts` |

**Contents:**

```typescript
type EventHandler = (event: AppEvent) => void;

export type AppEvent =
	| { type: 'INVOICE_CREATED'; invoiceId: string }
	| { type: 'INVOICE_UPDATED'; invoiceId: string }
	| { type: 'PAYMENT_RECORDED'; paymentId: string; invoiceId?: string }
	| { type: 'STOCK_CHANGED'; itemId: string }
	| { type: 'CUSTOMER_UPDATED'; customerId: string }
	| { type: 'EXPENSE_CREATED'; expenseId: string };

const listeners = new Set<EventHandler>();

export const eventBus = {
	emit(event: AppEvent) {
		listeners.forEach((handler) => handler(event));
	},
	subscribe(handler: EventHandler) {
		listeners.add(handler);
		return () => listeners.delete(handler);
	},
};
```

---

## Phase 4: Store Layer Overhaul

**Why now**: Repositories and services are ready. Stores can now be rewritten to delegate to services and use the event bus.

**Depends on**: Phase 3 (repositories, services, event bus).
**Unlocks**: Phase 8 (screens consume stores).

### ✅ 4.1 — Create `createPaginatedStore` factory

> Review §4.2

| Detail | Value |
|--------|-------|
| **File** | New: `src/stores/createPaginatedStore.ts` |

**Implementation** (from review §4.2):
- Generic parameters: `<T, F extends Record<string, unknown>>`
- Config: `fetchFn`, `defaultFilters`, `pageSize`
- Built-in state: `items`, `totalCount`, `loading`, `error`, `filters`, `page`, `hasMore`, `initialized`
- Built-in actions: `setFilters()`, `fetch(reset?)`, `reset()`
- Uses Immer middleware
- Tracks `initialized: boolean` to prevent duplicate fetches (§19.2)

### ✅ 4.2 — Rewrite all stores using factory + event bus

Each store conversion follows this pattern:
1. Replace boilerplate with `createPaginatedStore()`
2. Replace `require()` cross-store coupling with `eventBus.subscribe()`
3. Replace `any` types with proper types
4. Remove direct Supabase calls — delegate to service

#### 4.2a — `src/stores/inventoryStore.ts`

- Use `createPaginatedStore<InventoryItem, InventoryFilters>()`
- Add `createItem` and `updateItem` actions with proper types (replacing `any`)
- Subscribe to `STOCK_CHANGED` event to refresh
- Remove `any` types from interface (§4.3)

#### 4.2b — `src/stores/invoiceStore.ts`

- Use `createPaginatedStore<Invoice, InvoiceFilters>()`
- Remove `require('./inventoryStore')` on line 87
- After `createInvoice` succeeds, emit `INVOICE_CREATED` event
- Subscribe to `PAYMENT_RECORDED` event to refresh invoice list

#### 4.2c — `src/stores/customerStore.ts`

- Use `createPaginatedStore<Customer, CustomerFilters>()`
- Subscribe to `CUSTOMER_UPDATED` event

#### 4.2d — `src/stores/financeStore.ts`

- Fix date range defaults calculated at module load time (§financeStore.ts lines 34-37) — calculate lazily on first fetch
- Combine `fetchExpenses`, `fetchPurchases`, `fetchSummary` into a single `initialize()` action (§19.1)
- Subscribe to `EXPENSE_CREATED` and `PAYMENT_RECORDED` events

#### 4.2e — `src/stores/orderStore.ts`

- Use factory for pagination
- Emit `STOCK_CHANGED` after order import

#### 4.2f — `src/stores/authStore.ts`

- Keep as-is structurally (auth is not paginated)
- Improve token refresh error handling: if refresh fails, call `logout()` and emit event
- Add session expiry detection (§27.5)

### ✅ 4.3 — New: `src/stores/dashboardStore.ts`

- Calls `dashboardService.fetchDashboardStats()` (§15.3)
- Replaces client-side aggregation on page 1 data
- Subscribes to `INVOICE_CREATED`, `PAYMENT_RECORDED`, `STOCK_CHANGED` to auto-refresh

### ✅ 4.4 — New: `src/stores/notificationStore.ts`

- Fetches from `notificationRepository`
- Tracks unread count
- Subscribes to `STOCK_CHANGED` for potential refresh

---

## Phase 5: Validation Layer (Zod + react-hook-form)

**Why now**: Services exist and have injection points for validation. Stores exist for form state. Zod schemas can be shared between service-layer validation and form-layer validation.

**Depends on**: Phase 2 (types), Phase 3 (services with injection points).
**Unlocks**: Phase 8 (screens wire forms to schemas).

### ✅ 5.1 — Create Zod schemas

> Review §9

One file per domain:

#### 5.1a — `src/schemas/invoice.ts`

```typescript
import { z } from 'zod';

export const InvoiceLineItemSchema = z.object({
	item_id: z.string().uuid().optional(),
	design_name: z.string().min(1, 'Design name is required'),
	quantity: z.number().positive('Quantity must be at least 1'),
	rate_per_unit: z.number().positive('Rate must be positive'),
	discount: z.number().min(0).default(0),
	gst_rate: z.number().refine((r) => [0, 5, 12, 18, 28].includes(r), 'Invalid GST rate'),
	hsn_code: z.string().optional(),
});

export const InvoiceInputSchema = z.object({
	invoice_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	customer_name: z.string().min(1, 'Customer name is required'),
	customer_gstin: z
		.string()
		.regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/, 'Invalid GSTIN format')
		.optional()
		.or(z.literal('')),
	customer_phone: z.string().optional(),
	customer_address: z.string().optional(),
	is_inter_state: z.boolean(),
	place_of_supply: z.string().optional(),
	line_items: z.array(InvoiceLineItemSchema).min(1, 'At least one line item required'),
	payment_status: z.enum(['paid', 'partial', 'unpaid']),
	payment_mode: z.enum(['cash', 'upi', 'bank_transfer', 'credit', 'cheque']).optional(),
	amount_paid: z.number().min(0).default(0),
	notes: z.string().max(1000).optional(),
	terms: z.string().max(2000).optional(),
});
```

#### 5.1b — `src/schemas/customer.ts`

- `name`: required, min 1
- `phone`: optional, regex for Indian mobile (`/^[6-9]\d{9}$/`)
- `gstin`: optional, regex for GSTIN format
- `email`: optional, `.email()`
- `address`: optional, max 500

#### 5.1c — `src/schemas/expense.ts`

> Review §8.2

- `amount`: required, positive number
- `category`: enum from `EXPENSE_CATEGORIES` constant (not freeform text)
- `expense_date`: required, date format regex
- `notes`: optional, max 500

#### 5.1d — `src/schemas/payment.ts`

- `amount`: required, positive
- `payment_mode`: enum from all 5 modes (including `credit`)
- `direction`: enum `['received', 'made']`
- Either `customer_id` or `supplier_id` (not both)

#### 5.1e — `src/schemas/inventory.ts`

- `design_name`: required, min 1
- `category`: enum from `TILE_CATEGORIES` constant
- `box_count`: non-negative number
- `cost_price`: positive number
- `selling_price`: positive number
- `gst_rate`: one of `[0, 5, 12, 18, 28]`
- `low_stock_threshold`: non-negative integer

#### 5.1f — `src/schemas/businessProfile.ts`

- `business_name`: required
- `gstin`: GSTIN regex
- `address`, `city`, `state`, `pincode`: required for GST compliance
- `phone`: Indian mobile regex
- `invoice_prefix`: required, max 5

#### 5.1g — `src/schemas/index.ts` — barrel export

### ✅ 5.2 — Wire Zod validation into services

For each service's write methods, add schema validation as the first step:

```typescript
// Example: invoiceService.createInvoice
async createInvoice(input: unknown) {
  const validated = InvoiceInputSchema.parse(input); // throws ZodError
  // ... rest of logic
}
```

Wrap `ZodError` into `ValidationError`:

```typescript
// src/utils/validation.ts
import { ZodError, type ZodSchema } from 'zod';
import { ValidationError } from '../errors';

export function validateWith<T>(schema: ZodSchema<T>, data: unknown): T {
	try {
		return schema.parse(data);
	} catch (e) {
		if (e instanceof ZodError) {
			const fieldErrors: Record<string, string[]> = {};
			e.errors.forEach((err) => {
				const path = err.path.join('.');
				if (!fieldErrors[path]) fieldErrors[path] = [];
				fieldErrors[path].push(err.message);
			});
			throw new ValidationError(fieldErrors);
		}
		throw e;
	}
}
```

---

## Phase 6: Theme, Utilities & Shared Hooks

**Why now**: With the architecture layers (repo → service → store) rebuilt, the UI layer is next. But before touching screens, fix the shared building blocks they all use: theme, utilities, hooks.

**Depends on**: Phase 2 (types).
**Unlocks**: Phase 7 (components), Phase 8 (screens).

### ✅ 6.1 — Fix `ThemeProvider.tsx` — memoize theme object

> Review §16.1

| Detail | Value |
|--------|-------|
| **File** | `src/theme/ThemeProvider.tsx` |
| **Change** | Line 55: Replace `const theme = buildTheme(isDark);` with `const theme = useMemo(() => buildTheme(isDark), [isDark]);` |
| **Impact** | Highest single-line performance fix in the codebase. Eliminates unnecessary re-renders of every component using `useTheme()`. |

### ✅ 6.2 — Fix theme type exports

> Review §16.2

| Detail | Value |
|--------|-------|
| **File** | `src/theme/index.ts` |
| **Change** | Replace `shadows: { sm: object; md: object; lg: object }` with `shadows: { sm: ViewStyle; md: ViewStyle; lg: ViewStyle }`. Import `ViewStyle` from `react-native`. |

### ✅ 6.3 — Extract static layout utilities from theme context

> Review §16.3

| Detail | Value |
|--------|-------|
| **File** | New: `src/theme/layout.ts` |

```typescript
import { StyleSheet } from 'react-native';

export const layout = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowEnd: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  center: { alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  absoluteFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});
```

Then remove `layout` from the theme context object in `colors.ts` (lines 135-141) and update all imports across the codebase from `theme.layout.X` to `layout.X`.

**Files to update** (search for `theme.layout`): ~20 screen files. Each is a simple find-replace.

### ✅ 6.4 — Fix `useTheme()` return type

> Review §5.1 — `app/_layout.tsx:36` uses `useTheme() as any`

| Detail | Value |
|--------|-------|
| **File** | `src/theme/ThemeProvider.tsx` |
| **What** | Ensure the `ThemeContext` is typed with the full `Theme` interface, so `useTheme()` returns `{ theme: Theme; isDark: boolean; toggleTheme: () => void; setThemeMode: (mode: ThemeMode) => void }` without needing `as any`. |
| **Then** | Remove `as any` from `app/_layout.tsx:36`. |

### ✅ 6.5 — Fix `currency.ts` — negative zero bug

> Review §17.1

| Detail | Value |
|--------|-------|
| **File** | `src/utils/currency.ts` |
| **Change** | Line 18: Replace `const sign = num < 0 ? '-' : '';` with `const sign = amount < 0 ? '-' : '';` (use original `amount` parameter, not parsed `num`). |

### ✅ 6.6 — Create `escapeHtml` utility

> Review §18.1

| Detail | Value |
|--------|-------|
| **File** | New: `src/utils/html.ts` |

```typescript
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

### ✅ 6.7 — Create `withOpacity` color utility

> Review §14.4

| Detail | Value |
|--------|-------|
| **File** | New: `src/utils/color.ts` |

```typescript
export function withOpacity(hexColor: string, opacity: number): string {
  // Parse 3, 4, 6, or 8 char hex → rgba
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
```

Then replace all `color + '20'` string concatenation across the codebase (~8 locations in Badge, QuickActionsGrid, DashboardHeader, invoices/create).

### ✅ 6.8 — Fix `dateUtils.ts` — i18n for "Today"/"Yesterday"

> Review §17.4

| Detail | Value |
|--------|-------|
| **File** | `src/utils/dateUtils.ts` |
| **Change** | Lines 18-19: Replace hardcoded `'Today'` and `'Yesterday'` with `i18n.t('common.today')` and `i18n.t('common.yesterday')`. Import `i18n` from the i18n config. |
| **Also** | Add `'common.today'` and `'common.yesterday'` keys to `src/i18n/locales/en.json` and `hi.json`. |

### ✅ 6.9 — Create shared hooks

> Review §22

#### 6.9a — `src/hooks/useDebounce.ts`

```typescript
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
```

#### 6.9b — `src/hooks/useThemeTokens.ts`

```typescript
export function useThemeTokens() {
  const { theme, isDark } = useTheme();
  return {
    theme, isDark,
    c: theme.colors, s: theme.spacing, r: theme.borderRadius, typo: theme.typography,
    shadows: theme.shadows,
  };
}
```

#### 6.9c — `src/hooks/useRefreshOnFocus.ts`

Uses React Navigation's `useFocusEffect` (or Expo Router equivalent) to refresh data when the screen is focused.

#### 6.9d — `src/hooks/useConfirmBack.ts`

Prevents accidental back navigation when there are unsaved form changes. Uses `beforeRemove` event from React Navigation.

### ✅ 6.10 — Fix `pdfService.ts` — import real `numberToIndianWords`

> Review §17.2, §18.4

| Detail | Value |
|--------|-------|
| **File** | `src/services/pdfService.ts` |
| **Steps** | 1. Delete the stub `convertNumberToWords` function (lines 289-291). 2. Add `import { numberToIndianWords } from '../utils/currency';` 3. Replace all calls to `convertNumberToWords(amount)` with `numberToIndianWords(amount)`. 4. Apply `escapeHtml()` to all interpolated values in the HTML template. |

### ✅ 6.11 — Create `src/config/featureFlags.ts`

> Review §30.4

```typescript
export const Features = {
  PURCHASE_RETURNS: false,
  AI_ORDER_PARSING: true,
  MULTI_WAREHOUSE: false,
  GST_E_INVOICE: false,
  NOTIFICATIONS: true,
} as const;
```

---

## Phase 7: Component Fixes (Atoms → Molecules → Organisms)

**Why now**: Theme is fixed, utilities exist, hooks are ready. Now fix the reusable building blocks before the screens that compose them.

**Depends on**: Phase 6 (theme, utilities, hooks).
**Unlocks**: Phase 8 (screens).

### ✅ 7.1 — Fix `TextInput.tsx` — dead focus state

> Review §14.1

| Detail | Value |
|--------|-------|
| **File** | `src/components/atoms/TextInput.tsx` |
| **Change** | Line 30: Replace `const isFocused = false;` with proper state tracking: `const [isFocused, setIsFocused] = useState(false);`. Wire `onFocus` and `onBlur` props to `setIsFocused(true)` / `setIsFocused(false)`, forwarding original callbacks. |

### ✅ 7.2 — Fix `Screen.tsx` — remove `as any`

> Review §14.2

| Detail | Value |
|--------|-------|
| **File** | `src/components/atoms/Screen.tsx` |
| **Change** | Line 61: Replace conditional content component with two explicit branches — one `ScrollView` path and one `View` path. No `as any` needed. |

### ✅ 7.3 — Fix `Button.tsx` — add accessibility

> Review §14.3

| Detail | Value |
|--------|-------|
| **File** | `src/components/atoms/Button.tsx` |
| **Add** | `accessibilityRole="button"`, `accessibilityLabel={title}`, `accessibilityState={{ disabled: isDisabled, busy: loading }}` to the `TouchableOpacity`. |

### ✅ 7.4 — Fix `Badge.tsx` — replace color string concatenation

> Review §14.4

| Detail | Value |
|--------|-------|
| **File** | `src/components/atoms/Badge.tsx` |
| **Change** | Replace all `c.primary + '20'` patterns with `withOpacity(c.primary, 0.12)` (import from `src/utils/color.ts`). |

### ✅ 7.5 — Fix `Chip.tsx` — add accessibility

| Detail | Value |
|--------|-------|
| **File** | `src/components/atoms/Chip.tsx` |
| **Add** | `accessibilityRole="togglebutton"`, `accessibilityState={{ selected }}` |

### ✅ 7.6 — Create `QueryBoundary` component

> Review §8.3

| Detail | Value |
|--------|-------|
| **File** | New: `src/components/atoms/QueryBoundary.tsx` |

```typescript
interface QueryBoundaryProps {
  loading: boolean;
  error: AppError | string | null;
  empty?: boolean;
  children: React.ReactNode;
  onRetry?: () => void;
  emptyState?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export function QueryBoundary({ loading, error, empty, children, onRetry, emptyState, loadingComponent }: QueryBoundaryProps) {
  if (loading && !React.Children.count(children)) return loadingComponent ?? <LoadingSpinner />;
  if (error) return <ErrorCard message={typeof error === 'string' ? error : error.userMessage} onRetry={onRetry} />;
  if (empty) return emptyState ?? <EmptyState />;
  return <>{children}</>;
}
```

### ✅ 7.7 — Create `ErrorBoundary` component

> Review §25.2

| Detail | Value |
|--------|-------|
| **File** | New: `src/components/atoms/ErrorBoundary.tsx` |

Class component implementing `componentDidCatch`. Shows a fallback UI with error message and "Try Again" button. Logs the error to the logger (Phase 10).

### ✅ 7.8 — Fix `PaymentModal.tsx`

> Review §14.5, §21.2

| Detail | Value |
|--------|-------|
| **File** | `src/components/organisms/PaymentModal.tsx` |
| **Changes** | 1. Lines 57-58: Replace `console.error(e)` with `Alert.alert('Payment Failed', e instanceof Error ? e.message : 'An unexpected error occurred')`. 2. Line 64: Add `'credit'` to payment mode options (derive from `PAYMENT_MODES` constant). 3. Remove unused StyleSheet keys `title`, `subtitle`, `label` (lines 155-170). |

### ✅ 7.9 — Fix `DashboardHeader.tsx` — locale-aware date

> Review §14.6

| Detail | Value |
|--------|-------|
| **File** | `src/components/organisms/DashboardHeader.tsx` |
| **Change** | Line 19: Replace hardcoded `'hi-IN'` with dynamic locale from `useLocale().currentLanguage`. |

### ✅ 7.10 — Fix `QuickActionsGrid.tsx` — remove dead styles

> Review §14.8

| Detail | Value |
|--------|-------|
| **File** | `src/components/organisms/QuickActionsGrid.tsx` |
| **Change** | Delete empty unused StyleSheet keys: `section`, `sectionTitle`, `actionBtn`, `actionIcon`, `actionLabel` (lines 63-69). Replace `color + '20'` with `withOpacity()`. |

### ✅ 7.11 — Add accessibility to all interactive molecules/organisms

> Review §20.1

For each file, add appropriate `accessibilityRole`, `accessibilityLabel`, and `accessibilityState`:

| Component | accessibilityRole |
|-----------|-------------------|
| `ListItem.tsx` | `"button"` |
| `StatCard.tsx` | `"summary"` |
| `SearchBar.tsx` | already handled by TextInput inside it |
| `TileSetCard.tsx` | `"button"` (if pressable) |

---

## Phase 8: Screen Refactors

**Why now**: All infrastructure is ready. Stores are clean. Components are fixed. Now decompose screens.

**Depends on**: Phases 4 (stores), 5 (validation), 6 (hooks), 7 (components).
**Unlocks**: Phase 11 (tests for screens).

### ✅ 8.1 — Decompose `invoices/create.tsx` (the 359-line god screen)

> Review §15.1

This is the largest single refactor. Create a feature module:

| File | Purpose | What it extracts from the god screen |
|------|---------|--------------------------------------|
| `src/features/invoice-create/schemas.ts` | Zod schemas for all 3 steps | Line item validation, customer validation, payment validation |
| `src/features/invoice-create/useInvoiceCreateFlow.ts` | State machine: step navigation, submission orchestration | `step` state, `handleNext`, `handleBack`, `handleSubmit` |
| `src/features/invoice-create/useCustomerStep.ts` | Customer search/selection + form state | Lines ~100-140 (customer `useState`, `as any` casts) |
| `src/features/invoice-create/useLineItemsStep.ts` | Line item CRUD, inventory search (debounced), item selection | Lines ~40-80 (`searchQuery`, `selectedItem`, `inputQuantity`, `inputDiscount`, `isAddingItem` — all `useState` hooks) |
| `src/features/invoice-create/usePaymentStep.ts` | Payment mode, amount, status derivation | Lines ~35-40 (`amountPaid`, `paymentMode`) |
| `src/features/invoice-create/CustomerStep.tsx` | Pure UI for step 1 | JSX from `{step === 1 && ...}` block |
| `src/features/invoice-create/LineItemsStep.tsx` | Pure UI for step 2 | JSX from `{step === 2 && ...}` block |
| `src/features/invoice-create/PaymentStep.tsx` | Pure UI for step 3 | JSX from `{step === 3 && ...}` block |
| `src/features/invoice-create/InvoiceCreateScreen.tsx` | Thin orchestrator (~40 lines) | Wires hooks to step components |

**Specific bugs fixed by this decomposition:**
- Line 39: `paymentMode` typed as `any` → properly typed in `usePaymentStep`
- Line 44: `selectedItem` typed as `any` → typed as `InventoryItem | null` in `useLineItemsStep`
- Lines 115, 123, 131: `as any` casts → proper typed customer state
- Line 244: GST rate hardcoded to 18 → read from `selectedItem.gst_rate || DEFAULT_GST_RATE`
- Line 329: Operator precedence ambiguity → explicit parentheses
- Manual setTimeout debounce → `useDebounce` hook

**Then**: Update `app/(app)/invoices/create.tsx` to:
```typescript
export { default } from '@/src/features/invoice-create/InvoiceCreateScreen';
```

### ✅ 8.2 — Fix `(tabs)/index.tsx` — use dashboard RPC

> Review §15.3

| Detail | Value |
|--------|-------|
| **File** | `app/(app)/(tabs)/index.tsx` |
| **Change** | Remove client-side `useMemo` aggregation on lines 42-58. Replace with `useDashboardStore()` (created in Phase 4.3) which calls the existing `get_dashboard_stats()` RPC. |

### ✅ 8.3 — Fix `(tabs)/inventory.tsx`

> Review §15.2, §21.1

| Detail | Value |
|--------|-------|
| **File** | `app/(app)/(tabs)/inventory.tsx` |
| **Changes** | 1. Line 15: Replace hardcoded `CATEGORIES` array with derived list from `TILE_CATEGORIES` constant (adds missing 'SATIN'). 2. Line 91: Replace hardcoded English fallback string with `t('inventory.emptyFilterHint')`. 3. Line 213: Remove empty unused `header` StyleSheet key. 4. Replace `theme.layout.X` with imported `layout.X`. 5. Replace 4-space indentation with 2-space. |

### ✅ 8.4 — Fix `(tabs)/more.tsx` and `_layout.tsx`

> Review §15.4

| Detail | Value |
|--------|-------|
| **File** | `app/(app)/(tabs)/_layout.tsx` |
| **Change** | Line 75: Replace hardcoded `'More'` with `t('tabs.more')`. Add key to `en.json` and `hi.json`. |

### ✅ 8.5 — Fix `app/_layout.tsx`

> Review §5.1

| Detail | Value |
|--------|-------|
| **File** | `app/_layout.tsx` |
| **Changes** | 1. Line 2: Remove duplicate `useCallback` import. 2. Line 36: Remove `as any` (fixed by Phase 6.4). 3. Wrap app in `<ErrorBoundary>` component (Phase 7.7). |

### ✅ 8.6 — Fix `app/(app)/_layout.tsx` — prefetch strategy

> Review §19.1, §24.3

| Detail | Value |
|--------|-------|
| **File** | `app/(app)/_layout.tsx` |
| **Changes** | 1. Replace `Promise.all` with `Promise.allSettled`. 2. Add per-domain error state tracking. 3. Prioritize critical path (dashboard stats, inventory) over deferred data (finance, orders). 4. Batch `financeStore.fetchExpenses/Purchases/Summary` into single `financeStore.initialize()`. 5. Add `AppState` listener for refresh-on-foreground (§19.1 fix #3). |

### ✅ 8.7 — Fix `(auth)/login.tsx`

> Review §login.tsx analysis

| Detail | Value |
|--------|-------|
| **File** | `app/(auth)/login.tsx` |
| **Changes** | 1. Add basic email format validation before submit. 2. Wire react-hook-form + Zod schema (from 5.1). 3. Replace `catch (e: any)` with typed error handling. |

### ✅ 8.8 — Fix `(auth)/setup.tsx` — move Supabase call to service layer

> Review §setup.tsx analysis

| Detail | Value |
|--------|-------|
| **File** | `app/(auth)/setup.tsx` |
| **Change** | Line 51: Replace direct `supabase.from('business_profile').upsert()` call with `businessProfileService.upsert()`. Wire react-hook-form + Zod schema from 5.1f. |

### ✅ 8.9 — Fix `finance/expenses.tsx` — form validation

> Review §8.2

| Detail | Value |
|--------|-------|
| **File** | `app/(app)/finance/expenses.tsx` |
| **Changes** | 1. Lines 37-39: Replace `parseFloat(amount)` without validation with Zod schema from 5.1c. 2. Replace freeform text category input with a picker using `EXPENSE_CATEGORIES` constant. |

### ✅ 8.10 — Add `RefreshControl` to screens missing it

> Review §20.4

| Files | `customers/index.tsx`, `finance/index.tsx`, `orders/index.tsx`, `finance/payments.tsx`, `finance/purchases.tsx` |
|-------|---|
| **Change** | Wrap list in `FlatList` (or `FlashList`) with `refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetch(true)} />}`. |

### ✅ 8.11 — Add `keyboardDismissMode` to scroll views

> Review §20.5

| Detail | Value |
|--------|-------|
| **Files** | All screens with `ScrollView` and text inputs |
| **Change** | Add `keyboardDismissMode="on-drag"` to `ScrollView` components. |

### ⬜ 8.12 — Replace `ScrollView` + `.map()` with `FlashList`

> Review §26.1

| Detail | Value |
|--------|-------|
| **Install** | `npx expo install @shopify/flash-list` |
| **Files** | `expenses.tsx`, `customers/index.tsx`, `orders/index.tsx`, `finance/payments.tsx`, `finance/purchases.tsx`, any other list screen using `ScrollView` + `.map()` |
| **Change** | Replace with `<FlashList data={items} renderItem={...} estimatedItemSize={80} />` |

### ✅ 8.13 — Replace bare `useXStore()` with slice selectors

> Review §26.3

| Detail | Value |
|--------|-------|
| **Files** | Every screen file that calls a store hook |
| **Change** | Replace `const { items, loading, error } = useInventoryStore();` with individual selectors: `const items = useInventoryStore(s => s.items);` etc. Or use `useShallow` from `zustand/react/shallow` for multi-property subscriptions. |

### ✅ 8.14 — Replace `useTheme()` + manual destructuring with `useThemeTokens()`

> Review §15.6

| Detail | Value |
|--------|-------|
| **Files** | All ~20 screen files that have the 4-line boilerplate pattern |
| **Change** | Replace: `const { theme } = useTheme(); const c = theme.colors; const s = theme.spacing; const r = theme.borderRadius;` with: `const { c, s, r, typo } = useThemeTokens();` |

### 🔧 8.15 — Audit and fix all remaining hardcoded i18n strings

> Review §13.1, §13.2

| Detail | Value |
|--------|-------|
| **What** | Grep for English strings in all `.tsx` files that are user-visible. Add missing keys to `en.json` and `hi.json`. |
| **Key targets** | `invoiceService.ts:130` ("Invoice #..."), `orderService.ts:103` ("Imported from Order..."), all `Alert.alert()` calls with hardcoded strings. |

---

## Phase 9: Edge Functions & External Integrations

**Why now**: The mobile app is fully refactored. Now fix the backend edge function.

**Depends on**: Phase 1 (migrations).
**Unlocks**: Phase 12 (compliance).

### ✅ 9.1 — Remove client-supplied `aiKey` from Edge Function

> Review §27.1

| Detail | Value |
|--------|-------|
| **File** | `supabase/functions/parse-order-pdf/index.ts` |
| **Change** | Line 55: Remove `aiKey` from the destructured request body. Line 61: Change `const geminiKey = aiKey || Deno.env.get('GEMINI_API_KEY');` to `const geminiKey = Deno.env.get('GEMINI_API_KEY');`. |

### ✅ 9.2 — Add input validation to Edge Function

> Review §27.4

| Detail | Value |
|--------|-------|
| **File** | `supabase/functions/parse-order-pdf/index.ts` |
| **Add after line 57** | Size check: `if (base64Data.length > 10_000_000) return errorResponse('File too large (max 7.5MB)', 413);`. MIME type check: `if (!['application/pdf', 'image/png', 'image/jpeg'].includes(mimeType)) return errorResponse('Unsupported file type', 415);` |

### ✅ 9.3 — Add request timeout to Gemini API call

> Review §24.4

| Detail | Value |
|--------|-------|
| **File** | `supabase/functions/parse-order-pdf/index.ts` |
| **Change** | Wrap the `fetch()` call with `AbortController` and a 30-second timeout. |

### ✅ 9.4 — Restrict CORS

> Review §27.2

| Detail | Value |
|--------|-------|
| **File** | `supabase/functions/parse-order-pdf/index.ts` |
| **Change** | Line 9: Replace `'Access-Control-Allow-Origin': '*'` with `'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? ''`. |

### ✅ 9.5 — Upgrade to modern `Deno.serve`

> Review §29.3

| Detail | Value |
|--------|-------|
| **File** | `supabase/functions/parse-order-pdf/index.ts` |
| **Changes** | 1. Remove `import { serve } from "https://deno.land/std@0.177.0/http/server.ts";`. 2. Replace `serve(async (req: any) => { ... })` with `Deno.serve(async (req: Request) => { ... })`. 3. Remove `declare var Deno: any` (line 6). 4. Update Supabase client import to use `npm:` specifier: `import { createClient } from 'npm:@supabase/supabase-js@2';` |

### ✅ 9.6 — Add request ID for log correlation

> Review §25.4

| Detail | Value |
|--------|-------|
| **File** | `supabase/functions/parse-order-pdf/index.ts` |
| **Changes** | 1. Read `x-request-id` header from the request (or generate one). 2. Include it in all `console.error` / `console.log` calls. 3. Return it in error response bodies for client-side correlation. |

---

## Phase 10: Observability, Resilience & Offline

**Why now**: The app works correctly. Now make it robust against real-world conditions.

**Depends on**: Phase 3 (services — retry wraps service calls), Phase 7 (ErrorBoundary component).
**Unlocks**: Phase 12 (production readiness depends on observability).

### ✅ 10.1 — Create structured logger

> Review §25.1

| Detail | Value |
|--------|-------|
| **File** | New: `src/utils/logger.ts` |

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMeta {
  [key: string]: unknown;
}

const logger = {
  debug(msg: string, meta?: LogMeta) { if (__DEV__) console.debug(`[DEBUG] ${msg}`, meta); },
  info(msg: string, meta?: LogMeta) { if (__DEV__) console.info(`[INFO] ${msg}`, meta); },
  warn(msg: string, meta?: LogMeta) { console.warn(`[WARN] ${msg}`, meta); },
  error(msg: string, error?: Error, meta?: LogMeta) {
    console.error(`[ERROR] ${msg}`, error, meta);
    // TODO: Wire to Sentry/Datadog when ready
  },
};

export default logger;
```

Then: Replace every `console.error`, `console.warn`, `console.log` across the codebase with `logger.X()`. (~20 files, grep for `console.`).

### ✅ 10.2 — Create retry utility

> Review §24.1

| Detail | Value |
|--------|-------|
| **File** | New: `src/utils/retry.ts` |

```typescript
interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  shouldRetry?: (error: unknown) => boolean;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  { maxAttempts = 3, baseDelay = 1000, shouldRetry = () => true }: RetryOptions = {},
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt === maxAttempts || !shouldRetry(e)) throw e;
      await new Promise(r => setTimeout(r, baseDelay * 2 ** (attempt - 1)));
    }
  }
  throw new Error('Unreachable');
}
```

Wire into repository `findMany` and `findById` methods (read operations only — writes should not auto-retry without idempotency keys).

### ✅ 10.3 — Wire `ErrorBoundary` into app layout

> Review §25.2

| Detail | Value |
|--------|-------|
| **File** | `app/_layout.tsx` |
| **Change** | Wrap the `<Stack>` in `<ErrorBoundary>`. Add per-tab boundaries in `app/(app)/(tabs)/_layout.tsx`. |

### ✅ 10.4 — Add network status detection + offline banner

> Review §24.2

| Detail | Value |
|--------|-------|
| **Install** | `npx expo install @react-native-community/netinfo` |
| **File** | New: `src/hooks/useNetworkStatus.ts` |
| **File** | New: `src/components/atoms/OfflineBanner.tsx` |
| **Wire** | Add `<OfflineBanner />` to `app/(app)/_layout.tsx` above the `<Stack>`. |

### ✅ 10.5 — Add session expiry handling

> Review §27.5

| Detail | Value |
|--------|-------|
| **File** | `src/stores/authStore.ts` (or `app/_layout.tsx`) |
| **Add** | `supabase.auth.onAuthStateChange` listener that: (a) on `TOKEN_REFRESHED` with null session → force logout. (b) on `SIGNED_OUT` → navigate to login. (c) Log events to structured logger. |

### ✅ 10.6 — Add performance instrumentation on critical paths

> Review §25.3

| Detail | Value |
|--------|-------|
| **File** | `src/repositories/baseRepository.ts` |
| **Change** | Wrap every query method with timing:
```typescript
const start = performance.now();
const result = await query;
logger.info('db_query', { table: tableName, duration_ms: Math.round(performance.now() - start) });
```

---

## Phase 11: Testing

**Why now**: The codebase is fully refactored. Tests can be written against clean interfaces with proper dependency injection. No more "mock Supabase at the module level" anti-patterns.

**Depends on**: Phases 3-8 (clean architecture with injection points).
**Unlocks**: Phase 12 (confidence for production).

### ✅ 11.1 — Utility tests (pure functions — no mocks needed)

> Review §7.4

| File | Test File | Key Cases |
|------|-----------|-----------|
| `currency.ts` | `currency.test.ts` | Negative zero bug (verify fix), lakhs/crores formatting, `numberToIndianWords` for 0, 1, 100000, boundary values |
| `dateUtils.ts` | `dateUtils.test.ts` | FY boundary (March 31 vs April 1), leap year, timezone, `formatRelativeDate` i18n |
| `itemNameParser.ts` | `itemNameParser.test.ts` | Various suffix patterns, edge cases matching the PostgreSQL regex |
| `gstCalculator.ts` | Expand existing | 0% rate, 100% discount, floating point precision, inter-state vs intra-state |
| `html.ts` | `html.test.ts` | `escapeHtml` with `<script>`, `&`, quotes, empty string |
| `color.ts` | `color.test.ts` | `withOpacity` for 3-char hex, 6-char hex, edge values |
| `retry.ts` | `retry.test.ts` | Success on first try, success on retry, max attempts exceeded, `shouldRetry` false |

### 🔧 11.2 — Service tests (inject mock repositories)

> Review §7.2, §7.3

For each service, inject a mock repository and test business logic:

| Service | Test File | Key Cases |
|---------|-----------|-----------|
| `invoiceService` | `invoiceService.test.ts` | Correct GST totals (intra/inter-state), rejects empty line items, rejects negative quantities, calculates correct payment status |
| `paymentService` | `paymentService.test.ts` | Correct status derivation (unpaid → partial → paid), rejects negative amounts |
| `inventoryService` | `inventoryService.test.ts` | Low stock filter delegates to view, search works across name + phone |
| `financeService` | `financeService.test.ts` | Date range passing, correct aggregation |
| `pdfService` | `pdfService.test.ts` | HTML escaping applied, `numberToIndianWords` used (not stub) |
| `dashboardService` | `dashboardService.test.ts` | Delegates to RPC, returns correct shape |

### 🔧 11.3 — Store tests (inject mock services)

> Review §7.2

For each store, test state transitions with mock services:

| Store | Key Cases |
|-------|-----------|
| `inventoryStore` | `setFilters` resets page, `fetch(true)` replaces items, `fetch(false)` appends, error handling sets error state, event subscription triggers refresh |
| `invoiceStore` | Same pattern + `createInvoice` emits `INVOICE_CREATED` event |
| `dashboardStore` | Calls RPC, stores stats, refreshes on events |

### ✅ 11.4 — Component tests

> Review §14.7

Using `@testing-library/react-native`:

| Component | Key Cases |
|-----------|-----------|
| `TextInput` | Focus border color changes, error state shows red, label renders |
| `Button` | Loading shows spinner, disabled prevents press, accessibility props present |
| `QueryBoundary` | Shows loader, shows error with retry, shows empty state, shows children |
| `ErrorBoundary` | Catches error, renders fallback, "Try Again" resets |
| `PaymentModal` | All 5 payment modes shown (including credit), error shown on failure |
| `DashboardHeader` | Date uses correct locale |

### ✅ 11.5 — Screen integration tests

| Screen | Key Cases |
|--------|-----------|
| `InvoiceCreateScreen` | Step navigation, customer selection, line item add/remove, GST rate from item, payment mode includes credit, submission calls service |
| `LoginScreen` | Email validation, submit disabled while loading |
| `DashboardScreen` | Uses RPC stats (not client-side aggregation) |

### ✅ 11.6 — Database function tests (pgTAP)

> Review §7.2

| Function | Key Cases |
|----------|-----------|
| `create_invoice_with_items` | Succeeds atomically, rolls back on stock failure, generates sequential numbers |
| `record_payment_with_invoice_update` | Updates status correctly (partial → paid), handles concurrent payments (row lock) |
| `generate_invoice_number` | Sequential, resets on FY boundary, locked row prevents race |
| `get_profit_loss` | Correct revenue/COGS/expenses for date range, handles empty range |
| `get_dashboard_stats` | Returns correct today_sales, outstanding, low_stock_count |
| `audit_trigger_fn` | INSERT/UPDATE/DELETE logged correctly, old_data and new_data captured |

### ✅ 11.7 — Fix existing broken tests

> Review §14.7

| Test | Issue | Fix |
|------|-------|-----|
| `Button.test.tsx` | Tests for `testID` that the implementation doesn't set | Update either test to use proper query (by text/role) or add `testID` to component |
| `financeService.test.ts` | Tests implementation details (`.ilike` call) | Rewrite to test behavior through injected mock repo |
| `customerStore.test.ts` | Structural tests (mock interactions) | Rewrite to test state transitions |

---

## Phase 12: Compliance & Production Readiness

**Why now**: The codebase is clean, tested, observable. Now add the finishing touches for production.

**Depends on**: All previous phases.

### ✅ 12.1 — Switch to keyset pagination

> Review §23.1

| Detail | Value |
|--------|-------|
| **Files** | `src/repositories/baseRepository.ts`, all repository `findMany` methods |
| **Change** | Replace `.range(from, to)` with keyset cursor: `.lt('created_at', cursor.lastDate).order('created_at', { ascending: false }).limit(pageSize)` |
| **Store changes** | `createPaginatedStore` needs a `cursor` field instead of `page` number. `hasMore` derived from result count < pageSize. |

### ✅ 12.2 — Materialize ledger summary views

> Review §23.2

| Detail | Value |
|--------|-------|
| **File** | New migration: `016_materialized_views.sql` |
| **Contents** | Convert `customer_ledger_summary` and `supplier_ledger_summary` to `MATERIALIZED VIEW`. Add `REFRESH MATERIALIZED VIEW CONCURRENTLY` calls in the invoice/payment RPCs. Or, add a denormalized `balance` column to `customers`/`suppliers` updated atomically in the transaction RPCs. |

### ✅ 12.3 — Image transforms for list views

> Review §23.3

| Detail | Value |
|--------|-------|
| **Files** | `TileSetCard.tsx`, any component displaying `tile_image_url` |
| **Change** | Use Supabase Storage transform URL: `?width=200&quality=75` for list views. Use `expo-image` for caching. |

### ✅ 12.4 — Add GSTR export capability

> Review §28.5

| Detail | Value |
|--------|-------|
| **Files** | New: `src/services/exportService.ts`, new screen `app/(app)/settings/export.tsx` |
| **What** | Export invoice data in GSTR-1 format (CSV with columns matching the GST portal upload template). |

### ✅ 12.5 — Add RLS policies for multi-tenant readiness

> Review §6.1, §10, §27.6

| Detail | Value |
|--------|-------|
| **When** | Only if multi-tenant is planned. Keep the `USING (true)` policies for single-tenant. |
| **Migration** | Add `user_id UUID NOT NULL DEFAULT auth.uid()` to all tables. Replace `USING (true)` with `USING (user_id = auth.uid())`. |

### ✅ 12.6 — Version RPC functions

> Review §29.4

| Detail | Value |
|--------|-------|
| **What** | Rename `create_invoice_with_items` → `create_invoice_with_items_v1`. Future changes create `_v2`. Old versions maintained for backward compatibility. |

### ⬜ 12.7 — Enable `pg_stat_statements`

> Review §25.5

| Detail | Value |
|--------|-------|
| **Where** | Supabase dashboard → Extensions → enable `pg_stat_statements`. |
| **What** | Baseline slow query monitoring. Set up alerts for queries > 500ms. |

### ✅ 12.8 — Upload PDF via Storage instead of base64 in request body

> Review §23.4

| Detail | Value |
|--------|-------|
| **Files** | Client-side: `orderService.ts` (or wherever `parse-order-pdf` is called). Server-side: `parse-order-pdf/index.ts` |
| **Change** | Client uploads PDF to Supabase Storage first, sends storage path to the Edge Function. Edge Function fetches from storage server-side. Eliminates 2MB body limit. |

---

## Dependency Graph (Visual)

```
Phase 0: Tooling (.gitignore, ESLint, Prettier, Husky, CI)
    │
    ▼
Phase 1: Database Migrations (schema fixes, RPCs, indexes, audit log)
    │
    ▼
Phase 2: Types & Errors (AppError hierarchy, type fixes, remove `any`)
    │
    ├──────────────────────────────┐
    ▼                              ▼
Phase 3: Core Architecture     Phase 6: Theme, Utils, Hooks
(repos, services, event bus)   (memoize, layout extract, hooks)
    │                              │
    ▼                              ▼
Phase 4: Store Overhaul        Phase 7: Component Fixes
(factory, selectors, events)   (atoms → molecules → organisms)
    │                              │
    ├──────────────────────────────┘
    ▼
Phase 5: Validation (Zod schemas, react-hook-form wiring)
    │
    ▼
Phase 8: Screen Refactors (decompose god screen, fix all screens)
    │
    ├────────────────────┬─────────────────────┐
    ▼                    ▼                     ▼
Phase 9: Edge Fn     Phase 10: Observability   Phase 11: Testing
(security, Deno)     (logger, retry, offline)  (all layers)
    │                    │                     │
    └────────────────────┴─────────────────────┘
                         │
                         ▼
              Phase 12: Compliance & Prod Readiness
              (keyset pagination, GSTR export, RLS)
```

**Critical path**: 0 → 1 → 2 → 3 → 4 → 5 → 8 → 11

**Parallelizable**:
- Phase 6 can run in parallel with Phase 3 (no dependencies between them)
- Phase 7 can run in parallel with Phase 4 (components don't depend on stores)
- Phases 9, 10, 11 can run in parallel with each other after Phase 8

---

## Estimated Timeline

| Phase | Effort | Parallelizable With |
|-------|--------|---------------------|
| 0: Tooling | 1 day | — |
| 1: Migrations | 2 days | — |
| 2: Types & Errors | 1.5 days | — |
| 3: Core Architecture | 4 days | Phase 6 |
| 4: Store Overhaul | 3 days | Phase 7 |
| 5: Validation | 2 days | — |
| 6: Theme/Utils/Hooks | 2 days | Phase 3 |
| 7: Component Fixes | 2 days | Phase 4 |
| 8: Screen Refactors | 5 days | — |
| 9: Edge Functions | 1 day | Phases 10, 11 |
| 10: Observability | 2 days | Phases 9, 11 |
| 11: Testing | 5 days | Phases 9, 10 |
| 12: Compliance | 3 days | — |
| **Total (sequential)** | **~33.5 days** | |
| **Total (with parallelism)** | **~24 days** | |

---

*Each phase is designed to leave the codebase in a shippable state. If you stop after any phase, the app still works — it's just progressively cleaner, safer, and more extensible.*
