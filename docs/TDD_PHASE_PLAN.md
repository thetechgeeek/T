# TDD Phase Plan — Test-First Development Guide

> Companion document to [BUILD_ROADMAP.md](./BUILD_ROADMAP.md).
> Every feature is built **red → green → refactor**: write the failing test first, implement the minimum code to pass, then clean up.

---

## Testing Stack & Conventions

| Layer                 | Tool                        | Location                                                | Pattern                                      |
| --------------------- | --------------------------- | ------------------------------------------------------- | -------------------------------------------- |
| **Unit (pure logic)** | Jest 29 + jest-expo         | `src/<module>/__tests__/<name>.test.ts`                 | Direct import, no mocks unless external I/O  |
| **Unit (repository)** | Jest + `createSupabaseMock` | `src/repositories/__tests__/<name>.test.ts`             | Mock Supabase chainable builder              |
| **Unit (service)**    | Jest + mocked repos         | `src/services/__tests__/<name>.test.ts`                 | `jest.mock('../repositories/...')`           |
| **Unit (store)**      | Jest + mocked services      | `src/stores/__tests__/<name>.test.ts`                   | `useXStore.getState()` assertions            |
| **Unit (hook)**       | Jest + `renderHook`         | `src/hooks/__tests__/<name>.test.ts`                    | `@testing-library/react-native`              |
| **Component**         | Jest + RNTL                 | `src/components/<tier>/__tests__/<Name>.test.tsx`       | `renderWithTheme`, `fireEvent`, `waitFor`    |
| **Screen**            | Jest + RNTL                 | `src/__tests__/ui/<domain>/<screen>.test.tsx`           | Full screen render, mock stores + navigation |
| **Integration**       | Jest + real Supabase        | `src/__tests__/integration/<flow>.test.ts`              | `createTestSupabaseClient`, prefix cleanup   |
| **E2E**               | Maestro                     | `.maestro/<flow>.yaml`                                  | Device-level user journey                    |
| **Visual**            | jest-image-snapshot         | `src/__tests__/visual/<name>.test.tsx`                  | Snapshot comparison                          |
| **Schema**            | pgTAP / Jest                | `supabase/tests/<name>.sql` or `src/schemas/__tests__/` | Zod parse assertions                         |

### Shared Utilities (already exist)

| File                                    | Provides                                                      |
| --------------------------------------- | ------------------------------------------------------------- |
| `__tests__/utils/supabaseMock.ts`       | `createSupabaseMock()` chainable query builder                |
| `__tests__/utils/renderWithTheme.tsx`   | `renderWithTheme(component)` wraps in `ThemeProvider`         |
| `__tests__/utils/mockStore.ts`          | `resetAllStores()` via `useXStore.setState(...)`              |
| `__tests__/utils/testUtils.ts`          | `resetAllStores()` + `AsyncStorage.clear()`                   |
| `__tests__/utils/integrationHelpers.ts` | Real Supabase client, `cleanupByPrefix`, `signInTestUser`     |
| `__tests__/fixtures/*.ts`               | `makeInvoice()`, `makeCustomer()`, `makeInventoryItem()` etc. |

### Naming Rules

- Test file mirrors source: `src/utils/gstCalculator.ts` → `src/utils/__tests__/gstCalculator.test.ts`
- `describe` block = module/component name
- `it` block = behaviour statement: `it('formats ₹1,00,000 with Indian grouping')`
- One assertion-theme per `it` (avoid God-tests)
- Fixture factories prefixed `make*`: `makeInvoice()`, `makeCustomer()`

### Phase Exit Criteria

Every phase must pass before the next begins:

1. All tests in the phase are green
2. No lint errors in new/modified files
3. Coverage ≥ 80% lines on new code (enforced by `--collectCoverageFrom` glob)
4. All Hindi strings have `en.json` + `hi.json` parity (tested by i18n parity test)
5. One Maestro E2E flow per major screen in the phase

---

## P0 — Foundation & Design System

### P0.1 Typography & Contrast

**File: `src/theme/__tests__/tokens.test.ts`** (new)

```
describe('ThemeTokens', () => {
  describe('typography sizes', () => {
    it('body size is at least 16')
    it('caption size is at least 14')
    it('amount variant exists with size ≥ 20')
    it('amountLarge variant exists with size ≥ 24')
  })

  describe('contrast ratios', () => {
    it('primary text on light background meets WCAG AA (≥ 4.5:1)')
    it('primary text on dark background meets WCAG AA')
    it('caption text on light background meets WCAG AA')
    it('caption text on dark background meets WCAG AA')
    it('amount text on card background meets WCAG AA')
    it('error text on light background meets WCAG AA')
  })

  describe('font scaling', () => {
    it('maxFontSizeMultiplier caps at 1.3')
  })
end
```

**File: `src/components/atoms/__tests__/ThemedText.test.tsx`** (enhance existing)

```
describe('ThemedText', () => {
  it('renders amount variant with ≥ 20sp font size')
  it('renders amountLarge variant with ≥ 24sp font size and bold weight')
  it('renders body variant with ≥ 16sp font size')
  it('applies terracotta colour on amount variant')
  it('limits maxFontSizeMultiplier to 1.3')
end
```

**Utility: `src/utils/__tests__/contrast.test.ts`** (new)

```
describe('contrastRatio', () => {
  it('returns ratio ≥ 4.5 for #1A1A1A on #FFFFFF')
  it('returns ratio < 3 for #CCCCCC on #FFFFFF')
  it('calculates relative luminance correctly for black')
  it('calculates relative luminance correctly for white')
end
```

### P0.2 Touch & Interaction

**File: `src/components/atoms/__tests__/Button.test.tsx`** (enhance existing)

```
describe('Button touch targets', () => {
  it('has minimum height of 48dp')
  it('has minimum width of 48dp for icon-only variant')
  it('calls Haptics.impactAsync on press for primary variant')
  it('calls Haptics.notificationAsync(Success) on submit success variant')
  it('applies pressed-state opacity 0.85 via Reanimated')
  it('applies pressed-state scale 0.97 via Reanimated')
end
```

**File: `src/components/atoms/__tests__/Pressable.test.tsx`** (new — shared animated pressable)

```
describe('AnimatedPressable', () => {
  it('wraps children in Animated.View')
  it('calls onPress callback when pressed')
  it('does not call onPress when disabled')
  it('has accessible role "button"')
  it('supports accessibilityLabel')
end
```

### P0.3 Navigation Shell

**File: `src/__tests__/ui/navigation/tabBar.test.tsx`** (new)

```
describe('Tab Bar', () => {
  it('renders exactly 5 tabs: Home, Sale, Purchase, Reports, More')
  it('each tab shows both icon and label text')
  it('no tab is icon-only')
  it('Home tab is active by default')
  it('each tab label has ≥ 12sp font size')
end
```

**File: `src/components/atoms/__tests__/ConfirmationModal.test.tsx`** (new)

```
describe('ConfirmationModal', () => {
  it('renders title and message')
  it('renders Cancel and Confirm buttons')
  it('Cancel button calls onCancel')
  it('Confirm button calls onConfirm')
  it('destructive variant renders Confirm in red')
  it('modal is accessible with role "alert"')
  it('close on overlay tap calls onCancel')
end
```

**File: `src/components/atoms/__tests__/ToastNotification.test.tsx`** (new)

```
describe('ToastNotification', () => {
  it('renders success variant with ✓ icon and green background')
  it('renders error variant with ✕ icon and red background')
  it('renders info variant with ℹ icon and blue background')
  it('auto-dismisses after 3 seconds')
  it('manual dismiss on swipe-up gesture')
  it('positions above bottom tab bar (bottom offset ≥ 60dp)')
  it('message text is ≥ 14sp')
end
```

**File: `src/components/molecules/__tests__/ScreenHeader.test.tsx`** (new / enhance)

```
describe('ScreenHeader', () => {
  it('renders back arrow when canGoBack is true')
  it('renders title text')
  it('renders optional right action component')
  it('back arrow calls router.back()')
  it('back arrow has ≥ 48dp touch target')
  it('title uses h2 typography variant')
end
```

### P0.4 Forms & Data Entry

**File: `src/components/molecules/__tests__/FormField.test.tsx`** (enhance existing)

```
describe('FormField', () => {
  it('renders label always visible (not as placeholder)')
  it('renders error message in red below input')
  it('renders helper text in caption style below input')
  it('label font size ≥ 14sp')
  it('error message announces to screen reader')
  it('input is associated with label via accessibilityLabelledBy')
end
```

**File: `src/components/atoms/__tests__/AmountInput.test.tsx`** (new)

```
describe('AmountInput', () => {
  it('renders ₹ prefix')
  it('forces numeric keyboard (keyboardType = "number-pad")')
  it('formats 100000 as "1,00,000" (Indian grouping) while typing')
  it('formats 1234567 as "12,34,567"')
  it('strips non-numeric characters on paste')
  it('calls onChange with raw number value (not formatted string)')
  it('renders empty for zero when allowEmpty is true')
  it('has ≥ 20sp font size')
  it('supports maxValue prop: disallows input beyond max')
end
```

**File: `src/components/atoms/__tests__/DatePickerField.test.tsx`** (new)

```
describe('DatePickerField', () => {
  it('displays date in DD/MM/YYYY format by default')
  it('defaults to today when no value provided')
  it('opens native date picker on press')
  it('calls onChange with ISO date string on selection')
  it('displays date in user-configured format (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)')
  it('has ≥ 48dp touch target')
end
```

**File: `src/components/atoms/__tests__/BottomSheetPicker.test.tsx`** (new)

```
describe('BottomSheetPicker', () => {
  it('opens full-screen sheet on press')
  it('renders searchable list of options')
  it('filters options by search text (case-insensitive)')
  it('selects option and closes sheet')
  it('calls onChange with selected value')
  it('shows "Add new" button when allowAdd is true')
  it('renders empty state when no options match search')
  it('selected option shows checkmark')
end
```

**File: `src/components/atoms/__tests__/PhoneInput.test.tsx`** (new)

```
describe('PhoneInput', () => {
  it('renders +91 prefix (non-editable)')
  it('limits input to 10 digits')
  it('shows error for < 10 digits on blur')
  it('forces numeric keyboard')
  it('auto-formats as "98765 43210" (5+5 groups)')
  it('calls onChange with 10-digit raw number')
end
```

**File: `src/components/atoms/__tests__/SearchBar.test.tsx`** (enhance existing)

```
describe('SearchBar', () => {
  it('debounces onSearch callback by 300ms')
  it('renders clear button when text is present')
  it('clear button empties input and calls onSearch with empty string')
  it('supports Hindi text input')
  it('has ≥ 48dp touch target on clear button')
end
```

### P0.5 List Screens

**File: `src/components/organisms/__tests__/PaginatedList.test.tsx`** (new)

```
describe('PaginatedList', () => {
  it('renders FlashList with provided data')
  it('shows skeleton rows when loading')
  it('shows EmptyState when data is empty and not loading')
  it('calls onRefresh on pull-to-refresh gesture')
  it('calls onLoadMore when scrolled to end and hasMore is true')
  it('does not call onLoadMore when hasMore is false')
  it('shows error state with retry button on error')
  it('retry button calls onRetry')
end
```

**File: `src/components/molecules/__tests__/FilterBar.test.tsx`** (new)

```
describe('FilterBar', () => {
  it('renders horizontal scroll of filter chips')
  it('active chip has filled style, inactive has outline')
  it('tapping chip calls onFilterChange with filter key')
  it('renders "Clear all" chip when any filter is active')
  it('Clear all resets all filters')
  it('date range chip opens date range picker')
end
```

**File: `src/components/molecules/__tests__/SwipeActions.test.tsx`** (new)

```
describe('SwipeableRow', () => {
  it('reveals Edit action (blue) on swipe left')
  it('reveals Delete action (red) on swipe left')
  it('Edit calls onEdit with item id')
  it('Delete shows ConfirmationModal before calling onDelete')
  it('swipe distance threshold is 80dp')
  it('snap-back animation on partial swipe')
end
```

### P0.6 Offline & Sync

**File: `src/services/__tests__/writeQueue.test.ts`** (new)

```
describe('WriteQueueService', () => {
  describe('enqueue', () => {
    it('adds mutation to persisted queue when offline')
    it('executes mutation immediately when online')
    it('assigns unique id to each queued mutation')
    it('persists queue to AsyncStorage')
  })

  describe('replay', () => {
    it('replays queued mutations in FIFO order on reconnect')
    it('removes mutation from queue on success')
    it('retries failed mutation up to 3 times')
    it('moves permanently failed mutation to dead-letter queue')
    it('deduplicates mutations with same idempotency key')
  })

  describe('conflict detection', () => {
    it('detects version conflict when server version > local version')
    it('emits "sync:conflict" event with both versions')
    it('does not replay mutation with detected conflict')
  })
end
```

**File: `src/components/atoms/__tests__/OfflineBanner.test.tsx`** (enhance existing)

```
describe('OfflineBanner', () => {
  it('shows when useNetworkStatus returns offline')
  it('hides when network is online')
  it('displays message in Hindi: "इंटरनेट नहीं है — आपका काम सेव है, कनेक्ट होने पर sync होगा"')
  it('displays message in English when locale is en')
  it('shows sync status: pending count badge')
end
```

**File: `src/components/molecules/__tests__/SyncIndicator.test.tsx`** (new)

```
describe('SyncIndicator', () => {
  it('shows cloud-check icon when synced')
  it('shows spinner icon when syncing')
  it('shows cloud-off icon when offline')
  it('tap shows sync details sheet with pending mutation count')
end
```

### P0.7 Indian Number Formatting

**File: `src/utils/__tests__/currency.test.ts`** (enhance existing)

```
describe('formatCurrency', () => {
  it('formats 1000 as "₹ 1,000"')
  it('formats 100000 as "₹ 1,00,000"')
  it('formats 10000000 as "₹ 1,00,00,000"')
  it('formats 0 as "₹ 0"')
  it('formats negative -5000 as "- ₹ 5,000"')
  it('formats 1234.56 as "₹ 1,234.56" when decimals enabled')
  it('formats 1234.56 as "₹ 1,235" when decimals disabled (rounds)')
end

describe('formatLakhCrore', () => {
  it('formats 1500000 as "₹ 15 लाख" in Hindi')
  it('formats 1500000 as "₹ 15 Lakh" in English')
  it('formats 15000000 as "₹ 1.5 करोड़" in Hindi')
  it('formats 15000000 as "₹ 1.5 Crore" in English')
  it('formats 99999 as "₹ 99,999" (no lakh suffix below 1 lakh)')
end

describe('formatQuantity', () => {
  it('formats 100 Pcs as "100 Pcs"')
  it('formats 1.5 Kg as "1.5 Kg" when quantity decimals are 1')
  it('formats 2 Box as "2 Box"')
  it('uses secondary unit when configured: "2 Box (48 Pcs)"')
end
```

### P0.8 Error & Empty States

**File: `src/components/molecules/__tests__/EmptyState.test.tsx`** (enhance existing)

```
describe('EmptyState', () => {
  it('renders illustration image when provided')
  it('renders title text')
  it('renders description text')
  it('renders action button when onAction provided')
  it('action button has ≥ 48dp touch target')
  it('supports Hindi text rendering')
end
```

**File: `src/errors/__tests__/AppError.test.ts`** (new)

```
describe('AppError', () => {
  it('maps Supabase PGRST116 to "कोई data नहीं मिला" in Hindi')
  it('maps Supabase 23505 (unique violation) to readable duplicate message')
  it('maps network timeout to "कनेक्शन timeout — कृपया retry करें"')
  it('maps 401 to session-expired message')
  it('falls back to generic error for unknown codes')
  it('includes original error code in debug property')
end
```

**File: `src/hooks/__tests__/useSessionExpiry.test.ts`** (new)

```
describe('useSessionExpiry', () => {
  it('redirects to login on 401 Supabase error')
  it('shows session-expired toast message')
  it('clears auth store on redirect')
end
```

### P0 i18n Parity

**File: `src/i18n/__tests__/parity.test.ts`** (new)

```
describe('i18n string parity', () => {
  it('en.json and hi.json have identical key sets')
  it('no empty string values in en.json')
  it('no empty string values in hi.json')
  it('all interpolation variables in en match hi (e.g., {{name}})')
end
```

### P0 Maestro E2E

**File: `.maestro/foundation_navigation.yaml`** (new)

```
flow:
  - assertVisible: "Home"      # tab label
  - assertVisible: "Sale"      # tab label
  - assertVisible: "Purchase"  # tab label
  - assertVisible: "Reports"   # tab label
  - assertVisible: "More"      # tab label
  - tapOn: "Sale"
  - assertVisible: tab becomes active
  - tapOn: "More"
  - assertVisible: grid of module cards
```

---

## P1 — Onboarding & Business Identity

### P1.1 Language Selection

**File: `src/__tests__/ui/auth/languageSelection.test.tsx`** (new)

```
describe('LanguageSelectionScreen', () => {
  it('renders two language cards: "हिंदी" and "English"')
  it('each card fills at least 45% of screen width')
  it('tapping "हिंदी" sets i18next lng to "hi" and persists to AsyncStorage')
  it('tapping "English" sets i18next lng to "en" and persists')
  it('navigates to login screen after selection')
  it('shows "Change later in Settings" help text below cards')
  it('screen is shown only on first install (checks AsyncStorage flag)')
  it('skips directly to login on subsequent launches')
end
```

### P1.2 Business Setup Wizard

**File: `src/schemas/__tests__/businessProfile.test.ts`** (enhance existing)

```
describe('BusinessProfileSchema', () => {
  it('requires business_name (min 2 chars)')
  it('validates phone as 10-digit number')
  it('validates GSTIN format: 2-digit state + 10-char PAN + 1 + Z + check digit')
  it('rejects invalid GSTIN checksum')
  it('validates PAN format: 5 alpha + 4 digit + 1 alpha')
  it('validates pincode as 6-digit number in range 100000–999999')
  it('accepts all 36 Indian state codes')
  it('rejects unknown state code')
  it('requires owner_name')
  it('invoice_prefix defaults to "INV-"')
  it('fy_start_month defaults to 4 (April)')
end
```

**File: `src/__tests__/ui/auth/setupWizard.test.tsx`** (new)

```
describe('BusinessSetupWizard', () => {
  describe('step navigation', () => {
    it('renders 4 progress dots')
    it('step 1 is active by default')
    it('Next button advances to step 2')
    it('Back button returns to step 1')
    it('step 1 is not skip-able (Next disabled when business name empty)')
    it('steps 2–4 are skip-able')
  end)

  describe('step 1 — business identity', () => {
    it('renders business name field with placeholder')
    it('renders owner name field')
    it('renders phone field pre-filled from auth user')
    it('shows error on Next when business name is empty')
  end)

  describe('step 2 — address', () => {
    it('renders business type icon-cards (5 types)')
    it('selecting a type highlights the card')
    it('renders state picker with 36 Indian states/UTs')
    it('renders pincode field')
    it('valid 6-digit pincode auto-fills city (mocked API)')
  end)

  describe('step 3 — GST', () => {
    it('renders GSTIN field with format hint')
    it('renders "I don\'t have GST" skip button')
    it('validates GSTIN on blur')
    it('shows error for invalid GSTIN format')
    it('renders PAN field')
  end)

  describe('step 4 — branding', () => {
    it('renders logo upload button')
    it('renders invoice prefix field with default "INV-"')
    it('shows sample invoice number "INV-001" preview')
    it('renders FY start selector (April / January)')
  end)

  describe('completion', () => {
    it('calls businessProfileService.create on finish')
    it('navigates to home screen on success')
    it('shows error toast on API failure')
  end)
end
```

**File: `src/services/__tests__/businessProfileService.test.ts`** (new)

```
describe('BusinessProfileService', () => {
  describe('create', () => {
    it('inserts business profile row via repository')
    it('returns created profile with generated id')
    it('throws AppError on duplicate business name for same user')
  end)

  describe('update', () => {
    it('updates specified fields only')
    it('recalculates invoice prefix if changed')
    it('validates GSTIN if provided')
  end)

  describe('getByUserId', () => {
    it('returns profile for authenticated user')
    it('returns null when no profile exists')
  end)
end
```

**File: `src/repositories/__tests__/businessProfileRepository.test.ts`** (new)

```
describe('BusinessProfileRepository', () => {
  it('inserts into business_profile table')
  it('selects by user_id with RLS')
  it('updates by id')
  it('handles Supabase error gracefully')
end
```

### P1.3 Business Profile Screen

**File: `src/__tests__/ui/settings/businessProfile.test.tsx`** (new)

```
describe('BusinessProfileScreen', () => {
  it('loads profile data from businessProfileStore on mount')
  it('populates all form fields with existing profile data')
  it('validates GSTIN on save')
  it('validates pincode on save')
  it('shows "Preview Invoice Header" button')
  it('preview button opens invoice header preview modal')
  it('save calls businessProfileService.update')
  it('shows success toast on save')
  it('shows error toast on failure')
  it('logo upload opens image picker (camera/gallery options)')
  it('bank details section: account name, number, IFSC, bank name, branch all editable')
  it('UPI ID field generates QR preview')
end
```

### P1.4 App Preferences

**File: `src/__tests__/ui/settings/preferences.test.tsx`** (new)

```
describe('AppPreferencesScreen', () => {
  it('language toggle switches between Hindi and English')
  it('language switch re-renders all text immediately (no restart)')
  it('decimal places toggle switches between 0 and 2')
  it('date format selector shows 3 options')
  it('theme toggle shows Light / Dark / Follow System')
  it('theme change persists to AsyncStorage')
  it('unsaved changes warning toggle default is ON')
end
```

**File: `src/hooks/__tests__/useLocale.test.ts`** (new)

```
describe('useLocale', () => {
  it('returns t function for current language')
  it('returns formatCurrency bound to current decimal settings')
  it('returns currentLanguage matching i18next lng')
  it('changing language updates all consumers reactively')
end
```

### P1 Maestro E2E

**File: `.maestro/onboarding_flow.yaml`** (new)

```
flow:
  - assertVisible: "हिंदी"
  - tapOn: "हिंदी"
  - assertVisible: login screen elements
  - sign in (use test credentials)
  - assertVisible: wizard step 1
  - inputText: "Sharma Tiles" into business name
  - tapOn: "Next"
  - assertVisible: wizard step 2
  - tapOn: "Skip"
  - assertVisible: wizard step 3
  - tapOn: "I don't have GST"
  - tapOn: "Next"
  - assertVisible: wizard step 4
  - tapOn: "Finish"
  - assertVisible: Dashboard / Home
```

---

## P2 — Item / Product Master

### P2 Schemas

**File: `src/schemas/__tests__/inventory.test.ts`** (enhance existing)

```
describe('InventoryItemSchema', () => {
  describe('core fields', () => {
    it('requires item_name (min 1 char, max 100)')
    it('accepts optional item_code')
    it('validates item_code uniqueness hint (schema level)')
    it('accepts optional description (max 500 chars)')
  end)

  describe('pricing', () => {
    it('requires sale_price ≥ 0')
    it('accepts optional purchase_price ≥ 0')
    it('accepts optional mrp ≥ sale_price')
    it('validates gst_inclusive toggle as boolean')
    it('accepts optional default_discount 0–100')
  end)

  describe('tax', () => {
    it('validates gst_rate is one of [0, 5, 12, 18, 28]')
    it('validates hsn_code format (4–8 digits)')
    it('accepts optional cess_rate ≥ 0')
  end)

  describe('stock', () => {
    it('opening_stock defaults to 0')
    it('low_stock_threshold defaults to 0')
    it('validates primary_unit is non-empty string')
    it('validates conversion_factor > 0 when secondary unit exists')
    it('validates barcode as optional string')
  end)

  describe('batch tracking', () => {
    it('batch_no is required when batch tracking enabled')
    it('expiry_date must be after manufacturing_date')
    it('serial_number is unique per item when serial tracking enabled')
    it('batch and serial tracking are mutually exclusive')
  end)
end
```

### P2 Repository

**File: `src/repositories/__tests__/inventoryRepository.test.ts`** (enhance existing)

```
describe('InventoryRepository', () => {
  describe('create', () => {
    it('inserts item row into inventory_items table')
    it('returns item with generated UUID')
    it('handles unique constraint on item_code')
  end)

  describe('list', () => {
    it('fetches paginated items with default limit 20')
    it('applies search filter on item_name (ilike)')
    it('applies category filter')
    it('applies sort by name ASC')
    it('applies sort by stock ASC')
    it('applies sort by sale_price ASC')
    it('applies sort by created_at DESC')
  end)

  describe('getById', () => {
    it('returns single item by id')
    it('returns null for non-existent id')
  end)

  describe('update', () => {
    it('updates specified fields')
    it('does not modify unspecified fields')
  end)

  describe('delete', () => {
    it('soft deletes item')
    it('rejects deletion if item has invoice line items')
  end)

  describe('stockOperations', () => {
    it('creates stock_operation row for adjustment')
    it('updates current_stock on item after operation')
    it('records opening_stock operation')
  end)

  describe('categories', () => {
    it('fetches distinct categories with item counts')
    it('creates new category')
    it('renames category (updates all items)')
    it('deletes empty category')
    it('rejects deletion of category with items')
  end)
end
```

### P2 Service

**File: `src/services/__tests__/inventoryService.test.ts`** (enhance existing)

```
describe('InventoryService', () => {
  describe('createItem', () => {
    it('validates input via schema before repository call')
    it('generates item_code when auto-generate is true')
    it('creates opening stock operation when opening_stock > 0')
    it('emits "inventory:itemCreated" event')
    it('throws validation error for missing item_name')
  end)

  describe('updateItem', () => {
    it('validates partial input')
    it('emits "inventory:itemUpdated" event')
    it('recalculates stock value if purchase_price changed')
  end)

  describe('adjustStock', () => {
    it('creates stock_operation with reason')
    it('updates item current_stock')
    it('emits "inventory:stockAdjusted" event')
    it('rejects negative resulting stock')
  end)

  describe('getItemDetail', () => {
    it('returns item with stock movement history')
    it('calculates last purchase price')
    it('calculates last sold price')
    it('calculates item-wise profit')
  end)

  describe('importItems', () => {
    it('parses CSV with column mapping')
    it('validates each row against schema')
    it('returns success count and error rows')
    it('creates items in batch transaction')
  end)

  describe('exportItems', () => {
    it('generates CSV with selected fields')
    it('generates PDF catalogue format')
    it('includes stock quantities when selected')
  end)

  describe('categories', () => {
    it('lists categories with item counts')
    it('creates category with colour and icon')
    it('merges category into target (moves all items)')
  end)

  describe('units', () => {
    it('lists all units (system + custom)')
    it('creates custom unit with name and abbreviation')
    it('prevents deletion of unit in use')
  end)

  describe('partyWisePricing', () => {
    it('sets special price for party + item combination')
    it('returns party price when available, else default price')
    it('lists all party rates for an item')
  end)
end
```

### P2 Store

**File: `src/stores/__tests__/inventoryStore.test.ts`** (enhance existing)

```
describe('InventoryStore', () => {
  it('sets loading state while fetching items')
  it('stores fetched items in state')
  it('paginates via fetchMore action')
  it('applies filters and refetches')
  it('createItem adds to local list optimistically')
  it('createItem rolls back on error')
  it('updateItem updates local item optimistically')
  it('deleteItem removes from local list')
  it('adjustStock updates item stock locally')
  it('setSearchQuery triggers debounced refetch')
  it('reset clears all state')
end
```

### P2 Component Tests

**File: `src/__tests__/ui/inventory/itemList.test.tsx`** (new)

```
describe('ItemListScreen', () => {
  it('renders search bar at top')
  it('renders category filter chips')
  it('renders item list with name, price, stock')
  it('low stock items show red stock text')
  it('renders FAB "Add Item" button')
  it('tapping item navigates to /inventory/[id]')
  it('tapping FAB navigates to /inventory/add')
  it('pull-to-refresh calls store.fetchItems')
  it('shows skeleton rows while loading')
  it('shows empty state when no items')
  it('sort button opens sort options sheet')
end
```

**File: `src/__tests__/ui/inventory/itemAdd.test.tsx`** (new)

```
describe('AddItemScreen', () => {
  describe('core fields', () => {
    it('renders item name field (required)')
    it('renders item code field with auto-generate toggle')
    it('renders category picker')
    it('renders description field')
    it('renders image upload button')
  end)

  describe('pricing', () => {
    it('renders sale price AmountInput (required)')
    it('renders purchase price AmountInput (optional)')
    it('renders MRP field (optional)')
    it('GST inclusive toggle recalculates base price')
    it('base price = sale_price / (1 + gst_rate/100) when inclusive')
  end)

  describe('tax', () => {
    it('renders GST rate picker with slabs 0, 5, 12, 18, 28')
    it('renders HSN code field')
    it('HSN search shows matching codes from master')
    it('renders additional cess field when setting enabled')
  end)

  describe('stock', () => {
    it('renders Track Stock toggle (default ON)')
    it('shows stock fields when Track Stock is ON')
    it('hides stock fields when Track Stock is OFF')
    it('renders opening stock quantity field')
    it('renders low stock threshold field')
    it('renders primary unit picker')
    it('renders secondary unit toggle')
    it('secondary unit shows conversion formula fields')
    it('barcode field accepts scan or manual input')
  end)

  describe('batch/serial', () => {
    it('shows batch tracking toggle when Track Stock is ON')
    it('batch fields appear when batch tracking enabled')
    it('serial tracking toggle is mutually exclusive with batch')
  end)

  describe('save', () => {
    it('validates all required fields before save')
    it('shows validation errors inline')
    it('calls inventoryService.createItem on save')
    it('shows success toast and navigates to item detail')
    it('shows error toast on failure')
    it('Save Draft stores to AsyncStorage on back press')
  end)
end
```

**File: `src/__tests__/ui/inventory/itemDetail.test.tsx`** (new)

```
describe('ItemDetailScreen', () => {
  it('renders item image, name, category')
  it('renders current stock prominently')
  it('renders pricing card with sale/purchase price, GST, HSN')
  it('renders stock movement ledger')
  it('Adjust Stock button navigates to stock adjustment')
  it('Edit button navigates to edit screen (pre-filled)')
  it('shows last purchased price and date')
  it('shows last sold price and date')
  it('shows item-wise profit calculation')
  it('Party Rates tab shows special pricing table')
end
```

### P2 Integration

**File: `src/__tests__/integration/inventoryFlow.test.ts`** (enhance existing)

```
describe('Inventory Integration Flow', () => {
  it('creates item → verifies in list → updates price → checks updated price')
  it('creates item with opening stock → adjusts stock → verifies new balance')
  it('creates two items → filters by category → sees only matching items')
  it('creates item with batch → creates second batch → verifies both in detail')
  it('deletes item without transactions → succeeds')
  it('deletes item with invoice line → rejects with error')
  it('imports 10 items from CSV → verifies count → exports Excel → compares row count')
end
```

### P2 Maestro E2E

**File: `.maestro/item_management.yaml`** (enhance existing)

```
flow:
  - navigate to Inventory tab
  - assert empty state shown
  - tap "Add Item"
  - fill item name: "Floor Tile 60x60"
  - fill sale price: "450"
  - select GST rate: "18%"
  - fill HSN: "6908"
  - fill opening stock: "100"
  - select unit: "Box"
  - tap "Save"
  - assert navigated to item detail
  - assert stock shows "100"
  - go back to list
  - assert item appears in list
  - search "Floor Tile"
  - assert item appears
```

---

## P3 — Party Master (Customers & Suppliers)

### P3 Schemas

**File: `src/schemas/__tests__/customer.test.ts`** (enhance existing)

```
describe('CustomerSchema', () => {
  it('requires name (min 1 char)')
  it('validates phone as 10-digit number')
  it('rejects duplicate phone (schema-level hint)')
  it('validates GSTIN format when provided')
  it('validates state code against Indian states list')
  it('validates email format when provided')
  it('credit_limit defaults to 0')
  it('opening_balance defaults to 0')
  it('opening_balance_type must be "Dr" or "Cr"')
  it('validates pincode as 6-digit number')
end

describe('SupplierSchema', () => {
  it('requires name')
  it('validates gst_type as Regular | Composition | Unregistered')
  it('validates GSTIN when gst_type is Regular')
end
```

### P3 Repository

**File: `src/repositories/__tests__/customerRepository.test.ts`** (enhance existing)

```
describe('CustomerRepository', () => {
  describe('create', () => {
    it('inserts customer row')
    it('returns customer with generated UUID')
    it('rejects duplicate phone number')
  end)

  describe('list', () => {
    it('paginates with limit and offset')
    it('filters by search (name or phone ilike)')
    it('filters by group')
    it('filters by hasBalance (outstanding > 0)')
    it('sorts by name, balance, or last_transaction_date')
  end)

  describe('getById', () => {
    it('returns customer with outstanding balance computed')
  end)

  describe('getLedger', () => {
    it('returns chronological transactions with running balance')
    it('filters by date range')
  end)

  describe('groups', () => {
    it('lists groups with customer count and total outstanding')
    it('creates group')
    it('assigns customers to group')
    it('removes customers from group')
    it('deletes empty group')
  end)
end

describe('SupplierRepository', () => {
  # Same structure as customer but for supplier table
  it('inserts supplier row')
  it('fetches paginated suppliers')
  it('returns supplier with outstanding payable')
end
```

### P3 Service

**File: `src/services/__tests__/customerService.test.ts`** (enhance existing)

```
describe('CustomerService', () => {
  describe('create', () => {
    it('validates via schema')
    it('checks for duplicate phone and warns')
    it('creates opening balance entry if provided')
    it('emits "customer:created" event')
  end)

  describe('getDetail', () => {
    it('returns customer with outstanding, last transaction, invoice count')
  end)

  describe('getLedger', () => {
    it('returns ledger with opening balance at top')
    it('includes invoices, payments, credit notes in sequence')
    it('calculates running balance correctly')
  end)

  describe('generateStatement', () => {
    it('generates PDF with business header and party details')
    it('includes date range heading')
    it('shows closing balance prominently')
  end)

  describe('groups', () => {
    it('creates group and returns with id')
    it('assigns customer to group')
    it('returns group-wise outstanding totals')
  end)

  describe('selfRegistration', () => {
    it('generates unique invite link')
    it('creates pending customer on form submission')
    it('notifies app owner of pending approval')
  end)

  describe('importFromExcel', () => {
    it('parses Excel with column mapping')
    it('validates each row')
    it('skips duplicates when skipDuplicates is true')
    it('updates existing when updateExisting is true')
    it('returns import summary (success, skipped, errors)')
  end)
end
```

### P3 Store

**File: `src/stores/__tests__/customerStore.test.ts`** (enhance existing)

```
describe('CustomerStore', () => {
  it('fetches customers and stores in state')
  it('paginates with fetchMore')
  it('creates customer and adds to list')
  it('updates customer in list')
  it('deletes customer and removes from list')
  it('sets filters and triggers refetch')
  it('stores selected customer for detail view')
  it('reset clears all state')
end
```

### P3 Screen Tests

**File: `src/__tests__/ui/customers/customerList.test.tsx`** (new)

```
describe('CustomerListScreen', () => {
  it('renders search bar')
  it('renders filter chips: All, With Balance, No Balance, By Group')
  it('renders customer rows with name, phone, outstanding')
  it('outstanding > 0 shows in red')
  it('outstanding < 0 (advance) shows in green')
  it('FAB "Add Customer" navigates to add screen')
  it('tapping row navigates to customer detail /customers/[id]')
  it('swipe-left shows Call, Edit, Delete actions')
  it('Call action opens tel: link')
  it('Delete disabled for customer with transactions')
  it('sort options: A-Z, Highest Balance, Recently Transacted')
  it('shows empty state when no customers')
end
```

**File: `src/__tests__/ui/customers/customerAdd.test.tsx`** (new)

```
describe('AddCustomerScreen', () => {
  it('renders name field (required)')
  it('renders PhoneInput with +91')
  it('shows duplicate warning when phone matches existing customer')
  it('renders GSTIN field when party setting enabled')
  it('renders state picker pre-filled from business state')
  it('renders billing address fields')
  it('shipping address toggle shows additional address fields')
  it('renders customer group picker')
  it('renders credit limit AmountInput')
  it('renders opening balance with Dr/Cr toggle')
  it('save validates and calls customerService.create')
  it('navigates to customer detail on success')
  it('shows validation errors inline')
end
```

**File: `src/__tests__/ui/customers/customerDetail.test.tsx`** (enhance existing)

```
describe('CustomerDetailScreen', () => {
  it('renders header with name, phone, outstanding balance')
  it('outstanding balance colour: red if Dr, green if Cr')
  it('phone tap opens tel: link')
  it('action row: New Sale, Receive Payment, WhatsApp')
  it('New Sale navigates to /invoices/create with customer pre-filled')
  it('Receive Payment navigates to payment-in screen')
  it('WhatsApp opens WhatsApp with pre-filled message')
  it('Ledger tab shows chronological transactions with running balance')
  it('Invoices tab shows customer invoices')
  it('Payments tab shows customer payments')
  it('Send Statement generates and shares PDF')
end
```

### P3 Integration

**File: `src/__tests__/integration/customerFlow.test.ts`** (new)

```
describe('Customer Integration Flow', () => {
  it('creates customer → adds opening balance → verifies ledger')
  it('creates customer with group → filters by group → appears')
  it('creates customer → creates invoice → outstanding updates')
  it('duplicate phone creation → returns warning')
  it('deletes customer without transactions → succeeds')
  it('deletes customer with invoice → fails')
end
```

### P3 Maestro

**File: `.maestro/customer_management.yaml`** (enhance existing)

```
flow:
  - navigate to More → Parties
  - assert empty state
  - tap "Add Customer"
  - fill name: "Rajesh Sharma"
  - fill phone: "9876543210"
  - tap "Save"
  - assert navigated to customer detail
  - assert name shows "Rajesh Sharma"
  - assert outstanding shows "₹ 0"
  - go back
  - assert customer in list
  - search "Rajesh"
  - assert customer found
```

---

## P4 — Sale Invoice (Enhance Existing)

### P4 Schema & Calculation Tests

**File: `src/schemas/__tests__/invoice.test.ts`** (enhance existing)

```
describe('InvoiceSchema', () => {
  it('requires at least one line item')
  it('validates invoice_number format (prefix + digits)')
  it('validates invoice_date as ISO date string')
  it('validates due_date ≥ invoice_date when provided')
  it('validates customer_id as UUID or null (cash sale)')
  it('validates each line item: item_id, qty > 0, unit_price ≥ 0')
  it('validates line item discount 0–100%')
  it('validates payment_amount ≤ grand_total')
  it('validates payment_mode is valid enum')
end
```

**File: `src/utils/__tests__/gstCalculator.test.ts`** (enhance existing)

```
describe('gstCalculator', () => {
  describe('calculateLineItemGST', () => {
    it('intra-state: splits GST 50/50 into CGST + SGST')
    it('inter-state: full GST as IGST, CGST/SGST = 0')
    it('18% on ₹1000: CGST=90, SGST=90 (intra)')
    it('18% on ₹1000: IGST=180 (inter)')
    it('0% GST: all components = 0')
    it('28% on ₹5000: CGST=700, SGST=700 (intra)')
    it('handles GST inclusive: base = price / (1 + rate/100)')
    it('18% inclusive on ₹1180: base=1000, CGST=90, SGST=90')
  end)

  describe('calculateInvoiceTotals', () => {
    it('sums line item subtotals correctly')
    it('applies transaction-level % discount to subtotal')
    it('applies transaction-level ₹ discount to subtotal')
    it('sums all line GST amounts')
    it('adds additional charges to grand total')
    it('rounds off grand total to nearest ₹')
    it('grand total = subtotal - discount + GST + charges + round_off')
    it('calculates profit when purchase prices available')
  end)

  describe('generateHSNSummary', () => {
    it('groups line items by HSN code')
    it('sums taxable value per HSN')
    it('sums GST per HSN per slab')
    it('returns array sorted by HSN code')
  end)

  describe('determineSupplyType', () => {
    it('returns "intra" when customer state == business state')
    it('returns "inter" when customer state != business state')
    it('returns "intra" for cash sale (no customer state)')
  end)
end
```

### P4 Repository

**File: `src/repositories/__tests__/invoiceRepository.test.ts`** (enhance existing)

```
describe('InvoiceRepository', () => {
  describe('create', () => {
    it('calls create_invoice_v1 RPC with header + line items + payment')
    it('returns created invoice with ID')
    it('RPC handles stock deduction atomically')
    it('RPC creates payment record when amount > 0')
    it('RPC updates customer outstanding')
  end)

  describe('list', () => {
    it('paginates by created_at DESC')
    it('filters by status: paid, unpaid, partial, overdue')
    it('filters by customer_id')
    it('filters by date range')
    it('search by invoice_number or customer name')
  end)

  describe('getById', () => {
    it('returns invoice with line items and payment history')
  end)

  describe('update', () => {
    it('rejects if invoice has linked payments')
    it('updates header and line items')
    it('recalculates stock on line item changes')
  end)

  describe('void', () => {
    it('soft-deletes invoice')
    it('restores stock for all line items')
    it('reverses customer outstanding')
    it('marks linked payments as reversed')
  end)

  describe('getNextInvoiceNumber', () => {
    it('returns prefix + next sequence from business_profile')
    it('increments sequence after generation')
  end)
end
```

### P4 Service

**File: `src/services/__tests__/invoiceService.test.ts`** (enhance existing)

```
describe('InvoiceService', () => {
  describe('createInvoice', () => {
    it('validates input via InvoiceSchema')
    it('generates next invoice number')
    it('calculates totals via gstCalculator')
    it('calls repository.create with computed data')
    it('emits "invoice:created" event with invoice id')
    it('warns if customer credit limit exceeded')
    it('rejects if any line item qty > available stock')
  end)

  describe('updateInvoice', () => {
    it('validates edit eligibility (no payments, not in locked period)')
    it('recalculates totals')
    it('calls repository.update')
    it('emits "invoice:updated" event')
  end)

  describe('voidInvoice', () => {
    it('validates void eligibility')
    it('calls repository.void')
    it('emits "invoice:voided" event')
  end)

  describe('duplicateInvoice', () => {
    it('copies all fields except id, number, date')
    it('generates new invoice number')
    it('sets status to draft')
  end)

  describe('getInvoiceDetail', () => {
    it('returns invoice with formatted totals')
    it('includes payment history')
    it('computes status from payments vs total')
  end)

  describe('generatePDF', () => {
    it('calls pdfService with invoice data and business profile')
    it('includes logo when available')
    it('includes QR code when UPI id is set')
    it('handles thermal layout (58mm / 80mm)')
    it('handles A4 / A5 layout')
  end)

  describe('shareViaWhatsApp', () => {
    it('generates PDF then shares via Sharing API')
    it('constructs WhatsApp deep link with message template')
  end)
end
```

### P4 Store

**File: `src/stores/__tests__/invoiceStore.test.ts`** (enhance existing)

```
describe('InvoiceStore', () => {
  it('fetches invoices and stores in state')
  it('paginates with fetchMore')
  it('createInvoice adds to list optimistically')
  it('createInvoice rolls back on error')
  it('createInvoice sets loading then success state')
  it('updateInvoice updates in list')
  it('voidInvoice removes from list')
  it('filters by status and refetches')
  it('filters by date range and refetches')
  it('filters by customer and refetches')
  it('getNextNumber returns formatted invoice number')
  it('reset clears all state')
end
```

### P4 Feature Tests (Invoice Create Flow)

**File: `src/features/invoice-create/__tests__/InvoiceCreateScreen.test.tsx`** (enhance existing)

```
describe('InvoiceCreateScreen', () => {
  it('renders 3-step stepper: Customer → Items → Review')
  it('step 1 active by default')
  it('Next button disabled when no customer selected and not cash sale')
  it('Cash Sale toggle hides party selector')
  it('step progress persists on back navigation')
end
```

**File: `src/features/invoice-create/__tests__/CustomerStep.test.tsx`** (enhance existing)

```
describe('CustomerStep', () => {
  it('renders date picker defaulting to today')
  it('renders invoice number field with auto-incremented value')
  it('invoice number is editable')
  it('renders Cash Sale toggle')
  it('Cash Sale toggle hides customer search')
  it('renders customer search field')
  it('search results show customer name, phone, outstanding')
  it('selecting customer fills details')
  it('shows "Add new customer" option below search results')
  it('inter-state toggle appears after customer selected')
  it('inter-state auto-set based on customer state vs business state')
end
```

**File: `src/features/invoice-create/__tests__/LineItemsStep.test.tsx`** (enhance existing)

```
describe('LineItemsStep', () => {
  it('renders item search field')
  it('search shows matching items from inventory')
  it('selecting item adds row with name, qty=1, unit price, GST')
  it('qty spinner increments/decrements')
  it('unit price is editable inline')
  it('line discount field shown when setting enabled')
  it('GST shows CGST+SGST for intra-state')
  it('GST shows IGST for inter-state')
  it('stock warning shown when qty > available stock')
  it('swipe-left removes line item')
  it('running subtotal updates as items are added/removed')
  it('running GST total updates')
  it('barcode scan button opens camera (when setting enabled)')
  it('free item qty field shown when setting enabled')
end
```

**File: `src/features/invoice-create/__tests__/PaymentStep.test.tsx`** (enhance existing)

```
describe('PaymentStep', () => {
  it('renders totals summary card')
  it('subtotal, discount, GST, charges, round-off, grand total displayed')
  it('grand total is large bold text')
  it('renders payment amount AmountInput')
  it('"Paid in Full" button sets amount to grand total')
  it('"No Payment / Credit" button sets amount to 0')
  it('renders payment mode chips')
  it('only one mode selectable at a time')
  it('bank account selector appears for bank/cheque modes')
  it('cheque fields appear for cheque mode')
  it('balance due banner shows when amount < total')
  it('additional charges "Add Charge" button appends row')
  it('transaction discount field shown when setting enabled')
  it('round-off auto-calculated')
  it('profit indicator shown when setting enabled')
  it('Create button calls store.createInvoice')
  it('shows loading spinner during creation')
  it('navigates to invoice detail on success')
  it('shows error toast on failure')
end
```

### P4 PDF & Print Tests

**File: `src/services/__tests__/pdfService.test.ts`** (enhance existing)

```
describe('PdfService', () => {
  describe('generateInvoicePDF', () => {
    it('generates HTML with business header (name, address, GSTIN, logo)')
    it('includes invoice number and date')
    it('includes party details section')
    it('includes line items table with columns: item, HSN, qty, rate, GST, amount')
    it('includes HSN summary table')
    it('includes totals section')
    it('includes payment information')
    it('includes footer with terms and signature')
    it('includes UPI QR code when UPI id is set')
    it('A4 layout has two-column header')
    it('thermal 58mm layout condenses all sections to single column')
    it('thermal 80mm layout condenses to narrower format')
    it('amount in words in Hindi when locale is hi')
    it('amount in words in English when locale is en')
    it('"Original" / "Duplicate" stamp when selected')
  end)

  describe('generatePaymentReceipt', () => {
    it('includes business header')
    it('includes party name and amount')
    it('includes payment mode and reference')
  end)
end
```

### P4 Integration

**File: `src/__tests__/integration/invoiceCreationChain.test.ts`** (enhance existing)

```
describe('Invoice Creation Chain', () => {
  it('creates customer → creates items → creates invoice → stock decremented → outstanding updated')
  it('creates cash sale (no customer) → stock decremented → cash balance increased')
  it('creates invoice with full payment → status = paid')
  it('creates invoice with partial payment → status = partial')
  it('creates invoice with no payment → status = unpaid')
  it('creates inter-state invoice → IGST calculated correctly')
  it('creates invoice with 3 items → HSN summary has correct grouping')
  it('creates invoice then voids → stock restored, outstanding reversed')
  it('creates invoice with additional charges → grand total includes charges')
  it('creates invoice with round-off → grand total rounded to nearest ₹')
end
```

### P4 Maestro

**File: `.maestro/invoice_create_full.yaml`** (enhance existing)

```
flow:
  - tap "New Sale" on dashboard
  - assert step 1 visible
  - search customer "Rajesh"
  - select customer
  - tap "Next"
  - search item "Floor Tile"
  - select item
  - set qty = 10
  - assert subtotal shows ₹ 4,500
  - assert GST shows ₹ 810
  - tap "Next"
  - assert grand total ₹ 5,310
  - tap "Paid in Full"
  - select "Cash"
  - tap "Create"
  - assert invoice detail screen
  - assert status "Paid"
  - assert stock reduced by 10
```

---

## P5 — Payment-In

### P5 Schema

**File: `src/schemas/__tests__/payment.test.ts`** (enhance existing)

```
describe('PaymentInSchema', () => {
  it('requires customer_id')
  it('requires amount > 0')
  it('requires payment_mode')
  it('validates date as ISO string')
  it('validates invoice_allocations: each allocation amount > 0')
  it('validates sum of allocations ≤ amount')
  it('excess over total outstanding allowed (advance payment)')
  it('cheque fields required when mode is cheque')
  it('reference_number required when mode is upi or bank_transfer')
end
```

### P5 Repository

**File: `src/repositories/__tests__/paymentRepository.test.ts`** (enhance existing)

```
describe('PaymentRepository', () => {
  describe('recordPaymentIn', () => {
    it('calls record_payment_v1 RPC')
    it('creates payment row with direction "received"')
    it('creates payment-to-invoice linkage rows')
    it('updates invoice payment_status')
    it('updates customer outstanding')
  end)

  describe('listPaymentsIn', () => {
    it('filters by direction = "received"')
    it('paginates and sorts by date DESC')
    it('filters by customer, date range, payment mode')
    it('includes linked invoice count')
  end)

  describe('deletePaymentIn', () => {
    it('reverses invoice linkage')
    it('restores customer outstanding')
    it('soft-deletes payment record')
  end)
end
```

### P5 Service

**File: `src/services/__tests__/paymentService.test.ts`** (enhance existing)

```
describe('PaymentService', () => {
  describe('receivePayment', () => {
    it('validates via PaymentInSchema')
    it('auto-allocates to oldest invoices when no manual allocation')
    it('creates advance payment entry when amount > total outstanding')
    it('calls repository.recordPaymentIn')
    it('emits "payment:received" event')
    it('generates receipt for sharing')
  end)

  describe('getPaymentDetail', () => {
    it('returns payment with linked invoices')
    it('returns receipt data for PDF generation')
  end)

  describe('deletePayment', () => {
    it('confirms before deletion')
    it('calls repository.deletePaymentIn')
    it('emits "payment:deleted" event')
  end)
end
```

### P5 Screen Tests

**File: `src/__tests__/ui/finance/receivePayment.test.tsx`** (new)

```
describe('ReceivePaymentScreen', () => {
  it('renders customer search with outstanding balance')
  it('"Receive Full Outstanding" button sets amount to total outstanding')
  it('renders payment mode chips')
  it('bank account selector for bank/cheque modes')
  it('cheque fields for cheque mode')
  it('renders date picker default today')
  it('invoice allocation section shows open invoices with checkboxes')
  it('auto-allocates oldest-first')
  it('manual allocation overrides auto')
  it('shows advance payment warning when amount > outstanding')
  it('Save calls paymentService.receivePayment')
  it('success shows receipt sharing options')
end
```

**File: `src/__tests__/ui/finance/paymentInList.test.tsx`** (new)

```
describe('PaymentInListScreen', () => {
  it('renders payments sorted by date DESC')
  it('each row: date, party, amount, mode icon, linked invoice count')
  it('filter chips: date range, customer, payment mode')
  it('tap navigates to payment detail')
  it('swipe-left delete shows confirmation')
  it('shows empty state when no payments')
end
```

### P5 Integration

**File: `src/__tests__/integration/paymentFlow.test.ts`** (new)

```
describe('Payment-In Integration', () => {
  it('creates unpaid invoice → receives full payment → invoice status = paid')
  it('creates 3 invoices → receives partial payment → oldest invoice marked paid, second partial')
  it('receives advance payment → customer outstanding goes negative (advance)')
  it('deletes payment → invoice status reverts to unpaid')
end
```

### P5 Maestro

**File: `.maestro/payment_receive.yaml`** (new)

```
flow:
  - navigate to Receive Payment
  - search customer "Rajesh Sharma"
  - assert outstanding shows ₹ 5,310
  - tap "Receive Full Outstanding"
  - select "Cash"
  - tap "Save"
  - assert success toast
  - assert share options visible
```

---

## P6 — Purchase Bill

### P6 Schema

**File: `src/schemas/__tests__/purchase.test.ts`** (new)

```
describe('PurchaseBillSchema', () => {
  it('requires supplier_id')
  it('requires bill_number (supplier reference)')
  it('requires at least one line item')
  it('validates bill_date as ISO date')
  it('validates line item: item_id, qty > 0, purchase_rate ≥ 0, gst_rate')
  it('validates payment_amount ≤ total_payable')
  it('validates payment_mode')
end
```

### P6 Repository

**File: `src/repositories/__tests__/purchaseRepository.test.ts`** (new)

```
describe('PurchaseRepository', () => {
  describe('create', () => {
    it('inserts purchase_bill row with header')
    it('inserts purchase_line_items rows')
    it('creates stock_operation (type: purchase_in) per item')
    it('updates item current_stock')
    it('creates payment record when amount > 0')
    it('updates supplier outstanding')
  end)

  describe('list', () => {
    it('paginates by date DESC')
    it('filters by supplier, status, date range')
    it('includes summary totals')
  end)

  describe('getById', () => {
    it('returns bill with line items and payment history')
  end)

  describe('update', () => {
    it('recalculates stock differences')
    it('updates supplier outstanding')
  end)

  describe('delete', () => {
    it('reverses stock operations')
    it('reverses supplier outstanding')
    it('soft-deletes bill')
  end)
end
```

### P6 Service

**File: `src/services/__tests__/purchaseService.test.ts`** (new)

```
describe('PurchaseService', () => {
  describe('createBill', () => {
    it('validates via PurchaseBillSchema')
    it('calculates input GST credit per line item')
    it('calls repository.create')
    it('emits "purchase:created" event')
  end)

  describe('updateBill', () => {
    it('validates edit eligibility')
    it('recalculates totals')
  end)

  describe('deleteBill', () => {
    it('confirms before deletion')
    it('calls repository.delete')
  end)

  describe('attachPhoto', () => {
    it('uploads image to storage')
    it('links URL to purchase bill')
  end)
end
```

### P6 Screen Tests

**File: `src/__tests__/ui/finance/purchaseCreate.test.tsx`** (new)

```
describe('PurchaseBillCreateScreen', () => {
  it('renders supplier search with "Add new supplier" option')
  it('renders bill number field (supplier reference)')
  it('renders date picker')
  it('renders item search (same component as invoice)')
  it('line item rows show: item, qty, purchase rate, GST')
  it('running total payable shown at bottom')
  it('payment section: amount, mode, bank account')
  it('notes field')
  it('attach photo button opens camera/gallery')
  it('Save validates and creates bill')
  it('Save Draft stores to AsyncStorage on back press')
  it('success navigates to bill detail')
end
```

**File: `src/__tests__/ui/finance/purchaseList.test.tsx`** (enhance existing)

```
describe('PurchaseBillListScreen', () => {
  it('renders bills sorted by date DESC')
  it('each row: bill no, supplier, date, total, balance, status')
  it('filter chips: date range, supplier, payment status')
  it('summary card: total purchases, total payable')
  it('tap navigates to bill detail')
  it('swipe-left: Edit, Delete')
end
```

**File: `src/__tests__/ui/finance/purchaseDetail.test.tsx`** (new)

```
describe('PurchaseBillDetailScreen', () => {
  it('renders bill header: number, supplier, date, status')
  it('renders line items with qty, rate, GST')
  it('renders totals and GST breakdown')
  it('renders payment history')
  it('Record Payment action')
  it('Edit action')
  it('Delete action with confirmation')
  it('View attached photo')
end
```

### P6 Integration

**File: `src/__tests__/integration/purchaseFlow.test.ts`** (new)

```
describe('Purchase Bill Integration', () => {
  it('creates supplier → creates items → creates bill → stock incremented → payable updated')
  it('creates bill with full payment → status = paid')
  it('creates bill with partial payment → status = partial')
  it('deletes bill → stock reversed, payable reversed')
end
```

---

## P7 — Payment-Out

### P7 Tests

**File: `src/repositories/__tests__/paymentRepository.test.ts`** (extend — same file as P5)

```
describe('PaymentRepository — Payment Out', () => {
  describe('recordPaymentOut', () => {
    it('creates payment row with direction "made"')
    it('creates payment-to-bill linkage rows')
    it('updates purchase bill payment_status')
    it('updates supplier outstanding')
  end)

  describe('listPaymentsOut', () => {
    it('filters by direction = "made"')
    it('paginates and sorts by date DESC')
    it('filters by supplier, date range, payment mode')
  end)

  describe('deletePaymentOut', () => {
    it('reverses bill linkage')
    it('restores supplier outstanding')
  end)
end
```

**File: `src/__tests__/ui/finance/makePayment.test.tsx`** (new)

```
describe('MakePaymentScreen', () => {
  it('renders supplier search with outstanding payable')
  it('renders amount input')
  it('renders payment mode chips')
  it('bill allocation section shows open bills')
  it('auto-allocates oldest-first')
  it('Save calls paymentService.makePayment')
  it('success shows payment confirmation shareable via WhatsApp')
end
```

---

## P8 — Business Dashboard

### P8 Service

**File: `src/services/__tests__/dashboardService.test.ts`** (enhance existing)

```
describe('DashboardService', () => {
  describe('getDashboardStats', () => {
    it('returns cash_in_hand from cash transactions')
    it('returns bank_balance as sum of all bank accounts')
    it('returns to_receive as total customer outstanding')
    it('returns to_pay as total supplier outstanding')
    it('returns today_sale and today_invoice_count')
    it('returns today_collection (cash received today)')
    it('returns this_month_sale and last_month_sale')
    it('returns this_month_purchase')
    it('returns net_profit (sale - purchase - expense)')
    it('returns low_stock_count')
    it('returns expiring_items_count (≤ 30 days)')
    it('returns overdue_invoice_count and overdue_total')
  end)

  describe('getAlerts', () => {
    it('returns low stock items list')
    it('returns expiring items list')
    it('returns overdue invoices list')
    it('returns cheques due this week')
    it('returns loan EMIs due this month')
  end)

  describe('getRecentTransactions', () => {
    it('returns last 10 transactions across all types')
    it('each item has type, party, amount, timestamp')
    it('sorted by timestamp DESC')
  end)
end
```

### P8 Store

**File: `src/stores/__tests__/dashboardStore.test.ts`** (enhance existing)

```
describe('DashboardStore', () => {
  it('fetches stats and stores in state')
  it('sets loading state during fetch')
  it('stores alerts data')
  it('stores recent transactions')
  it('refresh action refetches all data')
  it('computes month-over-month trend arrow direction')
  it('computes trend percentage change')
  it('reset clears all state')
end
```

### P8 Component Tests

**File: `src/components/organisms/__tests__/DashboardHeader.test.tsx`** (enhance existing)

```
describe('DashboardHeader', () => {
  it('renders greeting with owner name from businessProfile')
  it('renders Hindi greeting when locale is hi')
  it('renders current date in DD MMMM YYYY Hindi format')
  it('renders business name from store (not hardcoded)')
  it('renders sync indicator in header')
end
```

**File: `src/components/organisms/__tests__/QuickActionsGrid.test.tsx`** (enhance existing)

```
describe('QuickActionsGrid', () => {
  it('renders 6 action buttons in 2-column grid')
  it('New Sale Invoice is primary/highlighted')
  it('each action navigates to correct route')
  it('each button has ≥ 48dp touch target')
  it('each button shows icon + label')
end
```

### P8 Screen Tests

**File: `src/__tests__/ui/dashboard/dashboard.test.tsx`** (new)

```
describe('DashboardScreen', () => {
  describe('stats cards', () => {
    it('renders Cash in Hand card with amount')
    it('renders Bank Balance card')
    it('renders To Receive card')
    it('renders To Pay card')
    it('tapping Cash in Hand navigates to cash ledger')
    it('tapping To Receive navigates to receivables')
  end)

  describe('summary tiles', () => {
    it('renders today sale with count')
    it('renders today collection')
    it('renders month-over-month with trend arrow')
    it('renders net profit')
  end)

  describe('alerts section', () => {
    it('renders low stock badge with count')
    it('renders overdue invoices badge')
    it('tapping low stock navigates to low stock list')
    it('hides alert section when all counts are 0')
  end)

  describe('recent transactions', () => {
    it('renders last 10 transactions')
    it('sale amounts in green, expenses in red')
    it('"View All" navigates to all transactions report')
  end)

  describe('refresh', () => {
    it('pull-to-refresh triggers dashboardStore.refresh')
    it('shows skeleton during loading')
  end)
end
```

### P8 Maestro

**File: `.maestro/dashboard_full.yaml`** (enhance existing)

```
flow:
  - assertVisible: "Cash in Hand"
  - assertVisible: "Bank Balance"
  - assertVisible: "To Receive"
  - assertVisible: "To Pay"
  - assertVisible: today sale amount
  - assertVisible: "New Sale Invoice" quick action
  - scroll down
  - assertVisible: recent transactions section
  - pull to refresh
  - assert data reloads
```

---

## P9 — Expense & Other Income

### P9 Schema

**File: `src/schemas/__tests__/expense.test.ts`** (enhance existing)

```
describe('ExpenseSchema', () => {
  it('requires amount > 0')
  it('requires category')
  it('requires payment_mode')
  it('validates date as ISO string')
  it('validates gst_rate as optional valid slab')
  it('validates vendor_gstin format when provided')
  it('accepts optional description')
end

describe('OtherIncomeSchema', () => {
  it('requires amount > 0')
  it('requires category')
  it('requires payment_mode')
  it('validates date as ISO string')
end
```

### P9 Repository

**File: `src/repositories/__tests__/expenseRepository.test.ts`** (enhance existing)

```
describe('ExpenseRepository', () => {
  it('inserts expense row')
  it('lists with pagination, filter by category/date/mode')
  it('returns period total')
  it('updates expense')
  it('deletes expense')
  it('manages categories: list, create, update, delete')
end

describe('OtherIncomeRepository', () => {
  it('inserts income row')
  it('lists with pagination and filters')
  it('returns period total')
  it('manages income categories')
end
```

### P9 Service & Store

**File: `src/services/__tests__/expenseService.test.ts`** (new)

```
describe('ExpenseService', () => {
  it('validates and creates expense')
  it('deducts from cash/bank balance based on mode')
  it('calculates input GST credit when GST on expense enabled')
  it('emits "expense:created" event')
  it('attaches receipt photo to storage')
  it('lists expenses with category totals')
  it('creates default expense categories on first use')
end

describe('OtherIncomeService', () => {
  it('validates and creates income entry')
  it('adds to cash/bank balance based on mode')
  it('emits "income:created" event')
end
```

**File: `src/stores/__tests__/financeStore.test.ts`** (enhance existing)

```
describe('FinanceStore — Expenses', () => {
  it('fetches expenses and stores in state')
  it('creates expense and adds to list')
  it('deletes expense and removes from list')
  it('fetches expense categories')
end

describe('FinanceStore — Other Income', () => {
  it('fetches income entries')
  it('creates income entry')
  it('fetches income categories')
end
```

### P9 Screen Tests

**File: `src/__tests__/ui/finance/expenseList.test.tsx`** (new)

```
describe('ExpenseListScreen', () => {
  it('renders expense list with date, category, amount, mode')
  it('amounts shown in red')
  it('summary card shows total expenses in period')
  it('filter chips: date range, category, payment mode')
  it('FAB "Add Expense" navigates to add screen')
  it('swipe-left: Edit, Delete')
end
```

**File: `src/__tests__/ui/finance/expenseAdd.test.tsx`** (new)

```
describe('AddExpenseScreen', () => {
  it('renders amount input')
  it('renders category picker with default categories')
  it('"Add new category" option in picker')
  it('renders payment mode chips')
  it('renders bank account for non-cash modes')
  it('GST toggle shows GST rate picker and vendor GSTIN')
  it('attach receipt opens camera/gallery')
  it('save validates and creates expense')
end
```

---

## P10 — Cash, Bank & Cheque Management

### P10 Tests (abbreviated — follow same pattern)

**File: `src/repositories/__tests__/bankAccountRepository.test.ts`** (new)

```
describe('BankAccountRepository', () => {
  it('creates bank account')
  it('lists all accounts with balances')
  it('gets account ledger with running balance')
  it('creates e-wallet account')
  it('records fund transfer between accounts')
  it('deactivates account (not delete if has transactions)')
end
```

**File: `src/repositories/__tests__/chequeRepository.test.ts`** (new)

```
describe('ChequeRepository', () => {
  it('creates cheque received entry')
  it('lists cheques by status (open, deposited, bounced)')
  it('marks cheque as deposited (updates bank balance)')
  it('marks cheque as bounced (creates debit in party ledger)')
  it('lists cheques issued (to suppliers)')
  it('queries cheques due within N days')
end
```

**File: `src/__tests__/ui/finance/cashInHand.test.tsx`** (new)

```
describe('CashInHandScreen', () => {
  it('renders current cash balance prominently')
  it('renders cash transaction list: green for in, red for out')
  it('opening balance entry editable')
  it('filter by date range')
  it('summary: cash received vs cash paid')
end
```

**File: `src/__tests__/ui/finance/bankAccounts.test.tsx`** (new)

```
describe('BankAccountsScreen', () => {
  it('renders bank list with name, masked account number, balance')
  it('add bank: name picker, account number, IFSC, branch')
  it('opening balance entry')
  it('"Set as primary" toggle')
  it('tap account navigates to account ledger')
end
```

---

## P11–P15 — Reports (Pattern Template)

> All report screens follow a common test pattern. Each report gets:
>
> 1. **Service test**: query logic, aggregation, export format
> 2. **Screen test**: filter rendering, data display, export/share buttons
> 3. **Export test**: PDF layout, Excel column mapping

### Report Test Template

**File: `src/services/__tests__/reportService.test.ts`** (enhance existing, add per report)

```
describe('ReportService', () => {
  describe('getSaleReport', () => {         // P11.1
    it('queries invoices in date range')
    it('aggregates: total amount, GST, discount, collected, balance')
    it('filters by customer, item, payment mode, status')
    it('returns tabular rows: date, inv no, party, items, total, GST, discount, paid, balance')
    it('exports to Excel with correct column headers')
    it('exports to PDF with summary row')
  end)

  describe('getPurchaseReport', () => {     // P11.2
    it('queries purchases in date range')
    it('aggregates: total, input GST, paid, balance')
    it('filters by supplier, item, status')
  end)

  describe('getDayBook', () => {            // P11.3
    it('queries all transactions for a single date')
    it('separates into received (in) and paid (out) columns')
    it('calculates opening and closing balance')
  end)

  describe('getAllTransactions', () => {     // P11.4
    it('combines invoices, purchases, payments, expenses, income')
    it('filters by transaction type')
    it('sorts by date')
    it('optional running balance column')
  end)

  describe('getBillWiseProfit', () => {      // P11.5
    it('per invoice: sale amount, COGS (purchase price × qty), profit, margin %')
    it('sorts by margin % descending')
  end)

  describe('getProfitLoss', () => {         // P11.6
    it('calculates revenue from sales + other income')
    it('calculates COGS from purchases')
    it('calculates gross profit')
    it('calculates operating expenses by category')
    it('calculates net profit/loss')
  end)

  describe('getCashflow', () => {           // P11.7
    it('opening balance = prior period closing')
    it('inflows: sale collections, income, loans')
    it('outflows: purchases, expenses, repayments')
    it('closing balance = opening + inflows - outflows')
  end)

  describe('getBalanceSheet', () => {       // P11.8
    it('assets: cash + bank + receivables + stock value')
    it('liabilities: payables + loans + GST payable')
    it('assets = liabilities + capital')
  end)

  describe('getPartyStatement', () => {     // P12.1
    it('returns ledger with opening/closing balance')
    it('generates PDF with business header')
  end)

  describe('getPartyWiseProfitLoss', () => { // P12.2
    it('per party: total sale, cost, profit, margin')
  end)

  describe('getGSTR1', () => {              // P13.2
    it('B2B: invoices grouped by receiver GSTIN')
    it('B2C Large: invoices > ₹2.5L to unregistered, by state')
    it('B2C Small: consolidated remaining')
    it('HSN summary')
    it('credit notes')
    it('exports JSON for GST portal')
    it('exports Excel')
  end)

  describe('getGSTR3B', () => {             // P13.4
    it('table 3.1: outward supplies breakdown')
    it('table 4: ITC available')
    it('table 6: tax payable computation')
  end)

  describe('getStockSummary', () => {       // P14.1
    it('per item: opening, purchased, sold, adjusted, current stock, value')
    it('total stock value')
  end)

  describe('getItemWiseProfitLoss', () => { // P14.3
    it('per item: qty sold, avg sale, avg purchase, revenue, cost, profit, margin')
  end)

  describe('getLowStockReport', () => {     // P14.4
    it('items where current_stock ≤ threshold')
    it('includes last purchase price')
  end)
end
```

### Report Screen Test Template (apply per report)

**File: `src/__tests__/ui/reports/<reportName>.test.tsx`** (new, one per report)

```
describe('<ReportName>Screen', () => {
  it('renders date range filter at top')
  it('renders additional filters specific to this report')
  it('renders summary row/card at top')
  it('renders tabular data rows')
  it('tap row navigates to detail (where applicable)')
  it('Export PDF button calls export service')
  it('Export Excel button calls export service')
  it('Share WhatsApp button generates and shares summary')
  it('shows loading skeleton while fetching')
  it('shows empty state when no data')
end
```

---

## P16 — Advanced Transactions

### P16.1 Sale Return (Credit Note)

**File: `src/schemas/__tests__/creditNote.test.ts`** (new)

```
describe('CreditNoteSchema', () => {
  it('requires original_invoice_id or standalone link')
  it('requires at least one return item')
  it('return qty ≤ original invoice qty per item')
  it('requires reason')
  it('validates credit_note_number format')
end
```

**File: `src/services/__tests__/creditNoteService.test.ts`** (new)

```
describe('CreditNoteService', () => {
  it('pre-fills from original invoice data')
  it('validates return qty against original')
  it('restores stock on save')
  it('creates credit in customer ledger')
  it('generates credit note PDF')
  it('includes in GSTR-1 credit notes section')
end
```

**File: `src/__tests__/ui/transactions/saleReturn.test.tsx`** (new)

```
describe('SaleReturnScreen', () => {
  it('pre-fills items from linked invoice')
  it('return qty spinners max at original qty')
  it('reason field required')
  it('totals recalculate as return items selected')
  it('Save creates credit note and restores stock')
end
```

### P16.2 Purchase Return (Debit Note)

```
Same structure as P16.1 but for purchase returns — debit note schema, service, screen tests.
```

### P16.3 Estimate / Quotation

**File: `src/services/__tests__/estimateService.test.ts`** (new)

```
describe('EstimateService', () => {
  it('creates estimate with same line items as invoice')
  it('no payment section in estimate')
  it('sets expiry date ("Valid until")')
  it('status lifecycle: Open → Accepted/Rejected/Expired')
  it('convertToInvoice creates invoice pre-filled from estimate')
  it('estimate number uses separate sequence')
  it('generates estimate PDF')
end
```

### P16.4 Delivery Challan

**File: `src/services/__tests__/challanService.test.ts`** (new)

```
describe('ChallanService', () => {
  it('creates challan with items, qty, transport details')
  it('no pricing or GST on challan')
  it('status lifecycle: Pending → Delivered → Converted')
  it('convertToInvoice creates invoice pre-filled from challan with pricing')
  it('generates challan PDF')
end
```

### P16.5 Purchase Order

**File: `src/services/__tests__/purchaseOrderService.test.ts`** (new)

```
describe('PurchaseOrderService', () => {
  it('creates PO with supplier, items, expected rates')
  it('PO number auto-incremented')
  it('status: Open → Partially Received → Fully Received → Cancelled')
  it('receiveAgainstPO creates purchase bill pre-filled from PO')
  it('partial receipt keeps PO open for remaining')
  it('generates PO PDF for supplier sharing')
end
```

---

## P17–P18 — Settings

### Settings Test Pattern

**File: `src/stores/__tests__/settingsStore.test.ts`** (new)

```
describe('SettingsStore', () => {
  describe('transaction settings', () => {
    it('persists each toggle to AsyncStorage')
    it('loads saved settings on app start')
    it('defaults are sensible (auto-increment ON, round-off ON, etc.)')
    it('changing "Cash Sale default" persists')
    it('changing transaction prefix persists')
  end)

  describe('print settings', () => {
    it('persists printer type selection')
    it('persists theme selection')
    it('persists company info toggles')
    it('persists footer text')
  end)

  describe('GST settings', () => {
    it('GST master toggle hides all GST fields when OFF')
    it('composite scheme disables ITC')
    it('GSTIN syncs with business profile')
  end)

  describe('party settings', () => {
    it('GSTIN toggle controls field visibility on party form')
    it('grouping toggle controls groups feature')
    it('additional fields count (0-3)')
  end)

  describe('item settings', () => {
    it('stock maintenance toggle')
    it('barcode scanning toggle')
    it('categories toggle')
    it('quantity decimal places (0, 2, 3)')
  end)
end
```

**File: `src/__tests__/ui/settings/settingsMain.test.tsx`** (new)

```
describe('SettingsMainScreen', () => {
  it('renders section headers: General, Transaction, Print, Tax, Users, SMS, Reminders, Party, Item')
  it('each section navigates to sub-screen')
  it('each toggle has inline preview/example')
  it('changes auto-save (no explicit save button)')
end
```

### P18.3 User Management

**File: `src/services/__tests__/userManagementService.test.ts`** (new)

```
describe('UserManagementService', () => {
  it('invites salesperson via phone (sends SMS with access code)')
  it('salesperson role can only: create invoices, record payments, view own invoices')
  it('invites secondary admin with full access minus settings and user management')
  it('lists users with role, status, last active')
  it('revokes user access immediately')
  it('tracks invoices by creator user')
end
```

---

## P19 — Loan Accounts

**File: `src/services/__tests__/loanService.test.ts`** (new)

```
describe('LoanService', () => {
  it('creates loan with principal, rate, tenure')
  it('calculates EMI using standard formula: P × r × (1+r)^n / ((1+r)^n - 1)')
  it('generates amortisation schedule')
  it('records EMI payment (principal + interest split)')
  it('records prepayment and recalculates remaining schedule')
  it('calculates outstanding principal at any date')
  it('creates EMI reminders on dashboard')
  it('generates loan statement PDF')
end
```

---

## P20 — Security, Multi-firm & Backup

**File: `src/services/__tests__/securityService.test.ts`** (new)

```
describe('SecurityService', () => {
  it('sets 4-digit PIN with confirm step')
  it('rejects PIN if confirm does not match')
  it('enables biometric authentication')
  it('auto-lock after configured timeout')
  it('validates PIN on lock screen')
  it('forgot PIN sends OTP to registered number')
  it('passcode required for edit/delete when enabled')
end
```

**File: `src/services/__tests__/multiFirmService.test.ts`** (new)

```
describe('MultiFirmService', () => {
  it('creates new firm with independent data scope')
  it('lists all firms for current user')
  it('switches active firm and reloads data')
  it('maximum 5 firms enforced')
  it('each firm has independent RLS context')
end
```

**File: `src/services/__tests__/backupService.test.ts`** (new)

```
describe('BackupService', () => {
  describe('Google Drive', () => {
    it('authenticates via Google OAuth')
    it('creates encrypted backup file')
    it('uploads to Google Drive folder')
    it('schedules auto-backup (daily/weekly)')
    it('warns when backup overdue > 7 days')
  end)

  describe('local', () => {
    it('creates backup file in Downloads')
    it('file named: BusinessName_DDMMYYYY.backup')
    it('shareable via Files/WhatsApp/Email')
  end)

  describe('restore', () => {
    it('reads .backup / .vyp file')
    it('validates file format')
    it('warns user about data replacement')
    it('restores all data: transactions, items, parties, settings')
    it('app restarts with restored data')
  end)
end
```

---

## P21 — Utilities

**File: `src/services/__tests__/dataVerificationService.test.ts`** (new)

```
describe('DataVerificationService', () => {
  it('detects ledger balance mismatches')
  it('detects stock count anomalies (stock != sum of operations)')
  it('detects orphaned transactions (payment without invoice)')
  it('returns issues list with fix recommendations')
  it('auto-fix resolves simple mismatches')
end
```

**File: `src/utils/__tests__/calculator.test.ts`** (new)

```
describe('Calculator', () => {
  it('adds two numbers')
  it('subtracts two numbers')
  it('multiplies two numbers')
  it('divides two numbers')
  it('calculates percentage')
  it('GST shortcut: amount → inclusive and exclusive at selected slab')
  it('EMI shortcut: principal, rate, tenure → monthly EMI')
end
```

**File: `src/services/__tests__/financialYearService.test.ts`** (new)

```
describe('FinancialYearService', () => {
  it('detects when current date > FY end')
  it('generates FY summary: revenue, expenses, profit')
  it('freezes all transactions before FY start')
  it('creates opening balance entries for all parties')
  it('creates opening balance for cash and bank')
  it('resets invoice sequence when configured')
  it('archives old FY (viewable but not editable)')
end
```

---

## P22 — Standalone & Integration Features

**File: `src/services/__tests__/syncService.test.ts`** (new)

```
describe('SyncService', () => {
  it('detects offline → queues mutations')
  it('replays mutations on reconnect in FIFO order')
  it('handles conflict: shows both versions')
  it('Supabase Realtime: receives changes from other devices')
  it('emits sync status events: synced, syncing, offline')
end
```

**File: `src/services/__tests__/tallyExportService.test.ts`** (new)

```
describe('TallyExportService', () => {
  it('generates Tally XML for sale vouchers')
  it('generates Tally XML for purchase vouchers')
  it('generates Tally XML for payment vouchers')
  it('generates Tally XML for journal entries')
  it('exports party master XML')
  it('exports item master XML')
  it('validates XML structure before export')
  it('warns on missing ledger names')
end
```

**File: `src/services/__tests__/onlineStoreService.test.ts`** (new)

```
describe('OnlineStoreService', () => {
  it('creates store with slug URL')
  it('adds inventory items to store with online price')
  it('generates shareable store link')
  it('receives incoming orders from web form')
  it('converts online order to invoice')
  it('toggles store on/off')
end
```

**File: `src/__tests__/integration/whatsappSharing.test.ts`** (new)

```
describe('WhatsApp Integration', () => {
  it('generates invoice share link with message template')
  it('generates payment reminder message with Hindi template')
  it('generates statement share with PDF attachment')
  it('message variables interpolated: {Name}, {Amount}, {InvNo}, {DueDate}')
end
```

### P22 Keyboard Shortcuts (Desktop)

**File: `src/hooks/__tests__/useKeyboardShortcuts.test.ts`** (new)

```
describe('useKeyboardShortcuts', () => {
  it('Alt+S navigates to new sale invoice')
  it('Alt+P navigates to new purchase bill')
  it('Ctrl+F focuses search bar')
  it('Esc navigates back')
  it('shortcuts only active on web platform')
  it('shortcuts disabled when modal is open')
end
```

---

## Cross-Cutting Test Suites (Run Every Phase)

### Accessibility

**File: `src/__tests__/a11y/touchTargets.test.tsx`** (new)

```
describe('Touch Target Compliance', () => {
  it('all Button components have ≥ 48dp touch target')
  it('all ListItem components have ≥ 48dp row height')
  it('all tab bar items have ≥ 48dp touch target')
  it('all FAB buttons have ≥ 56dp touch target')
  it('all form inputs have ≥ 48dp height')
end
```

### i18n Parity (run at every phase)

**File: `src/i18n/__tests__/completeness.test.ts`** (new)

```
describe('i18n completeness', () => {
  it('every key in en.json exists in hi.json')
  it('every key in hi.json exists in en.json')
  it('no empty string values')
  it('all {{variable}} placeholders match between locales')
  it('new keys added in this phase have both en and hi values')
end
```

### UX Compliance (snapshot at every phase)

**File: `src/__tests__/ux/compliance.test.tsx`** (new)

```
describe('UX Compliance', () => {
  it('no screen uses icon-only navigation (every icon has a label)')
  it('all ₹ amounts use Indian number formatting')
  it('all destructive actions show ConfirmationModal')
  it('all forms have Save Draft on back-press')
  it('all amount fields use AmountInput component')
end
```

---

## Test Execution Commands

```bash
# Run all unit tests
npm test

# Run tests for a specific phase (use path filter)
npm test -- --testPathPattern="src/components/atoms"   # P0 atoms
npm test -- --testPathPattern="src/schemas"             # P2 schemas
npm test -- --testPathPattern="src/services"            # any service layer
npm test -- --testPathPattern="src/__tests__/ui/finance" # P5-P7 finance screens

# Run with coverage for new code
npm test -- --coverage --collectCoverageFrom="src/services/purchaseService.ts"

# Run integration tests (requires Supabase local)
npm run test:integration

# Run E2E (requires running app on device/emulator)
npm run test:e2e

# Run single Maestro flow
maestro test .maestro/invoice_create_full.yaml

# Run i18n parity check
npm test -- --testPathPattern="i18n"

# Run accessibility checks
npm test -- --testPathPattern="a11y"
```

---

## Phase Exit Gate Checklist

Before moving from phase N to phase N+1, all of these must pass:

- [ ] `npm test -- --testPathPattern="<phase paths>"` → 0 failures
- [ ] `npm test -- --coverage --collectCoverageFrom="<phase files>"` → ≥ 80% lines
- [ ] `npm run lint` → 0 new errors in phase files
- [ ] `npm test -- --testPathPattern="i18n"` → parity check passes
- [ ] Maestro flows for the phase → all pass on device
- [ ] Manual smoke test with Hindi locale → all new screens readable
- [ ] No regressions in previous phase Maestro flows

---

_Total test cases specified: ~1,100+_
_Covers all 764 feature checkpoints from BUILD_ROADMAP.md_
_Every layer tested: schema → repository → service → store → component → screen → integration → E2E_
