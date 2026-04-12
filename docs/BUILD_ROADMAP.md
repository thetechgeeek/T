# Build Roadmap — Complete Granular Feature Checklist

> **Target user:** Indian business owners 50 YO+, non-technical, running SMEs (retail, wholesale, manufacturing, trading). Comfortable with WhatsApp and basic Android smartphones. Uses the app primarily in Hindi. Mental model is paper Bahi-Khata and physical receipt books.
>
> **Design contract (non-negotiable, enforced at every phase):**
>
> - Minimum body font 16 sp; amount/total text ≥ 20 sp bold
> - Every tappable element ≥ 48 × 48 dp — no exceptions
> - Every icon must have a visible text label beside or below it
> - ₹ formatted with Indian grouping: 1,00,000 not 100,000
> - Confirmation modal before every destructive action (delete, void, restore)
> - Every multi-field form persists a local draft on back-press — zero data loss
> - All writes queued locally when offline and replayed on reconnect
> - Haptic feedback on every primary action button
> - "Share on WhatsApp" present on every document screen
> - Hindi and English string parity — every key in `en.json` has a `hi.json` match
> - All error messages user-readable, never raw technical strings
> - Every list screen has: loading skeleton, empty state illustration, error+retry state
>
> **Tech stack:** Expo Router (file-based nav), Supabase (Postgres + RLS + Edge Functions), Zustand, React Native Reanimated 3, i18next (hi default / en fallback), terracotta design system (`#C1440E` primary).
>
> **DB conventions:** Every table has `id uuid DEFAULT gen_random_uuid()`, `user_id uuid REFERENCES auth.users`, `business_id uuid`, `created_at timestamptz`, `updated_at timestamptz`, `deleted_at timestamptz` (soft delete). RLS policy: `user_id = auth.uid()`.

---

## Phase Map

```
P0   Foundation & Design System
P1   Onboarding & Business Identity
P2   Item / Product Master
P3   Party Master (Customers & Suppliers)
P4   Sale Invoice
P5   Payment-In (Received from Customers)
P6   Purchase Bill
P7   Payment-Out (Made to Suppliers)
P8   Business Dashboard
P9   Expense & Other Income
P10  Cash, Bank, E-wallet & Cheque Management
P11  Transaction Reports
P12  Party Reports
P13  GST & Tax Reports
P14  Item & Stock Reports
P15  Business Status, Expense, Order & Loan Reports
P16  Advanced Transactions (Returns, Estimates, Challans, Orders)
P17  Transaction & Print Settings
P18  GST / Tax / User / SMS / Reminder / Party / Item Settings
P19  Loan Accounts
P20  Security, Multi-firm & Backup
P21  Utilities
P22  Standalone & Integration Features
```

---

## P0 — Foundation & Design System

> **Goal:** Every screen in the app feels safe, readable, and consistent before any business logic is built. A 55-year-old shopkeeper who has never used a computer can tap confidently without fear of breaking something.
>
> **No business feature is built until P0 is complete and reviewed.**

---

### P0.1 Design Tokens & Theme

- [x] Define all spacing tokens: `xs=4`, `sm=8`, `md=12`, `lg=16`, `xl=24`, `2xl=32`, `3xl=48`, `4xl=64` — used consistently via `useThemeTokens().s`
- [x] Define all border radius tokens: `none=0`, `sm=4`, `md=8`, `lg=12`, `xl=16`, `full=9999`
- [x] Define touch target token: `touchTarget=48` — enforced on every interactive wrapper
- [x] Define shadow tokens: `sm`, `md`, `lg` — three elevation levels, platform-aware (iOS shadow props, Android elevation)
- [x] Define animation tokens: spring preset (damping 20, stiffness 200), timing preset (duration 200ms, easing ease-out) — used consistently via Reanimated
- [x] Build `buildTheme(isDark: boolean)` function that returns typed `ThemeColors` object for light and dark — no hardcoded hex values anywhere outside this function

### P0.2 Typography System

- [x] Define `ThemedText` component variants: `display` (30sp, bold), `h1` (24sp, bold), `h2` (20sp, semibold), `h3` (18sp, semibold), `body` (16sp, regular), `bodyBold` (16sp, bold), `caption` (14sp, regular), `captionBold` (14sp, bold), `amount` (20sp, bold, terracotta), `amountLarge` (28sp, bold, terracotta), `amountNegative` (20sp, bold, red), `label` (13sp, medium, secondary colour)
- [x] All `ThemedText` instances set `maxFontSizeMultiplier={1.3}` — prevents layout breaks when user has system large text enabled
- [x] Verify WCAG AA contrast ratio (≥ 4.5:1) for every colour pair: body-text on `surface`, body-text on `background`, caption on `surface`, amount on `surface`, white on `primary`, white on `success`, white on `error`
- [x] Dark theme: all colour pairs also pass WCAG AA
- [x] `allowFontScaling` is `true` on all `Text` components (respects user setting up to 1.3×)
- [x] Line height = 1.5× font size on all body/caption text for readability

### P0.3 Colour Palette

- [x] Primary / brand: `#C1440E` (light), `#E8622A` (dark)
- [x] Success green: `#1A8754` (light), `#2DB87A` (dark)
- [x] Warning amber: `#B45309` (light), `#F59E0B` (dark)
- [x] Error red: `#B91C1C` (light), `#EF4444` (dark)
- [x] Info blue: `#1D4ED8` (light), `#60A5FA` (dark)
- [x] Surface / card: `#FFFFFF` (light), `#1C1C1E` (dark)
- [x] Background: `#F5F0EB` (light), `#000000` (dark)
- [x] Border: `#E5DDD5` (light), `#38383A` (dark)
- [x] Secondary text: `#6B5E52` (light), `#98989E` (dark)
- [x] Paid status: success green background tint `#D1FAE5`, text `#065F46`
- [x] Unpaid status: error red tint `#FEE2E2`, text `#991B1B`
- [x] Partial status: warning amber tint `#FEF3C7`, text `#92400E`
- [x] Overdue status: dark red `#7F1D1D` tint `#FEE2E2`

### P0.4 Touch Targets & Interaction

- [x] Create `TouchableCard` component: wraps children in `Pressable` with Reanimated `useAnimatedStyle` for scale 0.97 + opacity 0.85 on press — used for all tappable cards
- [x] Create `PrimaryButton` component: full-width, terracotta background, white text 16sp bold, min-height 52dp, `Haptics.impactAsync(ImpactFeedbackStyle.Medium)` on press
- [x] Create `SecondaryButton` component: outlined, terracotta border and text, same sizing as `PrimaryButton`
- [x] Create `DestructiveButton` component: red background, same sizing, `Haptics.notificationAsync(NotificationFeedbackType.Error)` on press
- [x] Create `IconButton` component: icon + optional label below, min 48×48dp, `Haptics.impactAsync(Light)` on press
- [x] Create `FAB` (Floating Action Button) component: 56×56dp circle, terracotta, shadow-lg, `+` icon with optional label beside on tablet
- [x] All disabled buttons: opacity 0.4, no haptic, no press animation
- [x] Every `Pressable` and `TouchableOpacity` in the codebase audited — minimum `hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}` where needed to reach 48dp target
- [x] `Haptics.notificationAsync(Success)` fires on every successful form save
- [x] `Haptics.notificationAsync(Error)` fires on every form validation failure or API error

### P0.5 Navigation Shell

- [x] Bottom tab bar rebuilt: **5 tabs** — Home (house icon + "Home"/"होम"), Sale (receipt icon + "Sale"/"बिक्री"), Purchase (cart icon + "Purchase"/"खरीद"), Reports (chart icon + "Reports"/"रिपोर्ट"), More (grid icon + "More"/"और")
- [x] Tab bar background: `surface` colour with 1dp top border; safe-area inset applied below icons
- [x] Active tab: filled icon + terracotta label; inactive: outline icon + secondary label
- [x] Tab icon size: 24×24dp; label size: 11sp (min readable for 50YO)
- [x] Tab bar height: 64dp + safe area bottom (≥ 80dp total on most phones)
- [x] `More` tab shows a 3×N grid of module cards: Parties, Inventory, Expenses, Other Income, Loans, Cheques, Backup, Settings — each card: icon (48dp), Hindi/English label below, arrow icon
- [x] `ScreenHeader` component: safe-area aware top inset, terracotta background, back arrow (←, 28sp, `Haptics.impactAsync(Light)` on press), title in white `h2`, optional right-side icon button
- [x] Back press on any screen where data is entered: if form is dirty → `ConfirmationModal` asking "Changes not saved. Go back?" (Hindi: "बदलाव save नहीं हुए। वापस जाएं?") — only if `showWarningForUnsavedChanges` setting is ON
- [x] Global `ConfirmationModal`: dark overlay, white card, title `h3`, message `body`, two buttons side-by-side — Cancel (secondary) + Confirm (primary or destructive)
- [x] `ConfirmationModal` accessible: `role="dialog"`, `aria-modal="true"`, first focusable element is Cancel button
- [x] Global `Toast` component: appears at bottom above tab bar, auto-dismisses in 3 seconds, swipe-up to dismiss early; `success` (green left border), `error` (red left border), `info` (blue left border); message text 15sp

### P0.6 Form Components Library

#### FormField

- [x] `FormField` wrapper: renders visible `label` text (14sp, captionBold, secondary colour) always above the input — never floating placeholder
- [x] Shows `helperText` below input in 13sp caption style when provided
- [x] Shows `errorText` below input in 13sp red text when `error` prop is set — replaces helper text
- [x] Red left border on input container when in error state
- [x] `required` prop adds red asterisk beside label: "नाम \*"
- [x] `accessibilityLabel` automatically set to label text if not explicitly provided

#### AmountInput

- [x] Numeric-only input: `keyboardType="number-pad"`, no decimal key unless `allowDecimals` prop true
- [x] `₹` prefix rendered as non-editable text left of input (not a placeholder)
- [x] Formats display value with Indian grouping as user types: `12345` → `12,345`, `100000` → `1,00,000`
- [x] Internal value stored as raw number (not string) — `onChange(value: number)`
- [x] `maxValue` prop: shows inline error "₹ [maxValue] से अधिक नहीं हो सकता" if exceeded
- [x] When value is 0 and `showZero` is false: shows placeholder text instead of "₹ 0"
- [x] Font size: 20sp bold, terracotta colour
- [x] Height: 52dp minimum

#### DatePickerField

- [x] Displays date as "DD MMM YYYY" (e.g. "05 Apr 2025") — readable, not numbers-only
- [x] Calendar icon (20dp) on the right side of field
- [x] On tap: opens native `DateTimePicker` (iOS) or `DatePickerAndroid` (Android); falls back to modal picker if native unavailable
- [x] `minDate` and `maxDate` props for range constraints
- [x] `defaultValue` defaults to today
- [x] `shortcuts` prop: renders quick-tap chips "Today" / "Yesterday" / "This Month Start" above picker

#### SearchBar

- [x] Magnifier icon left, clear ×-button right (only when text present), clear button ≥ 48dp target
- [x] `debounceMs` prop (default 300) — `onSearch` fires after debounce
- [x] On first tap: keyboard opens, no full-screen overlay needed
- [x] Placeholder text in Hindi when locale is `hi`: "खोजें..."
- [x] Height: 48dp; border radius: 24dp (pill shape)

#### BottomSheetPicker

- [x] Opens a modal bottom sheet occupying 80% of screen height
- [x] Search bar at top of sheet for filtering options
- [x] Options list rendered in `FlashList` for performance
- [x] Selected option shows green checkmark on right
- [x] "+ नया जोड़ें" / "+ Add new" button at bottom of list when `allowAdd` prop is true — tapping it opens an inline mini-form
- [x] Sheet header: title text + close button (×)
- [x] Backdrop tap dismisses sheet (same as pressing close)
- [x] Keyboard-aware: sheet moves up when keyboard opens for search

#### PhoneInput

- [x] "+91" prefix rendered as static non-editable text
- [x] Input: exactly 10 digits; `keyboardType="phone-pad"`
- [x] Auto-formats as user types: after 5 digits inserts a space: "98765 43210"
- [x] On blur: validates length; shows "10 अंक चाहिए" error if incomplete
- [x] Paste handling: strips `+91`, spaces, dashes from pasted number, takes last 10 digits

#### TextAreaField

- [x] Multi-line `TextInput` with `multiline` and `numberOfLines={3}`
- [x] Character counter in bottom-right corner when `maxLength` is set: "45/200"
- [x] Minimum height 80dp; auto-grows up to `maxLines` prop

### P0.7 List Infrastructure

#### PaginatedList

- [x] Built on `FlashList` (not `FlatList`) for 60fps perf on long lists
- [x] `onEndReachedThreshold={0.3}`: fires `onLoadMore` when 30% from bottom
- [x] Shows `SkeletonRow` components (3 rows) while `isLoading && data.length === 0`
- [x] Shows `EmptyState` component when `!isLoading && data.length === 0`
- [x] `refreshControl` with `RefreshControl` — calls `onRefresh` on pull-to-refresh
- [x] Shows `ErrorRetry` component when `hasError === true`: error icon + message + "Retry" button
- [x] `ListHeaderComponent` slot for summary cards / filter bar
- [x] `estimatedItemSize` prop required for FlashList performance

#### SkeletonRow

- [x] Animated shimmer effect via Reanimated: gradient sweeps left-to-right repeatedly
- [x] Row height matches the list item it's replacing (configurable via `height` prop)
- [x] Two variants: `compact` (48dp) and `card` (80dp)

#### EmptyState

- [x] Illustration image (SVG or PNG, max 160×160dp)
- [x] Title text (h3, centred)
- [x] Description text (body, centred, secondary colour)
- [x] Optional primary action button below description
- [x] Unique illustration per context: no invoices (receipt illustration), no items (box), no parties (person), no reports data (chart)

#### FilterBar

- [x] Horizontal `ScrollView` (no scroll indicators visible) with chips
- [x] Chip: pill shape, 36dp height, 12dp horizontal padding, 13sp label
- [x] Active chip: filled terracotta background, white text
- [x] Inactive chip: white background, terracotta border and text
- [x] "Clear all" chip appears at end of bar when any non-default filter is active; tapping resets all filters
- [x] Date range chip: shows selected range as "01 Apr – 30 Apr" when active

#### SwipeableRow

- [x] Built with Reanimated `useAnimatedGestureHandler` + `GestureHandlerRootView`
- [x] Swipe left by ≥ 80dp: reveals action buttons
- [x] Swipe left by ≥ 60% of row width: auto-snaps to reveal (no need to hold)
- [x] Swipe right (or tap elsewhere): snaps back to closed
- [x] Behind row: right-aligned action buttons of equal width (max 3 actions)
- [x] Edit action: blue (`#1D4ED8`) background, pencil icon + "Edit"/"संपादन" label
- [x] Delete action: red background, trash icon + "Delete"/"हटाएं" label — tap triggers `ConfirmationModal` before firing `onDelete`
- [x] Additional action slot (e.g. "Share WhatsApp") with green background

### P0.8 Offline & Sync Infrastructure

- [x] `WriteQueueService`: singleton class initialized at app start
    - [x] `enqueue(mutation: QueuedMutation)`: adds to AsyncStorage-persisted queue; if online, executes immediately; if offline, stores with `pendingAt` timestamp
    - [x] `QueuedMutation` shape: `{ id: string, type: 'insert'|'update'|'delete', table: string, payload: object, idempotencyKey: string, retryCount: number }`
    - [x] `replay()`: called on network reconnect; executes mutations FIFO; skips if `idempotencyKey` already processed (deduplication)
    - [x] Failed mutations: retried up to 3 times with exponential backoff (1s, 3s, 9s); after 3 failures: moved to `deadLetterQueue` and user notified
    - [x] `getPendingCount()`: returns number of queued mutations — shown in `SyncIndicator`
- [x] `OfflineBanner` (enhance existing):
    - [x] Shows when `useNetworkStatus()` returns `isConnected: false`
    - [x] Hindi text: "इंटरनेट नहीं है — काम सेव हो रहा है, जल्द sync होगा"
    - [x] English text: "No internet — your work is saved, will sync when connected"
    - [x] Shows pending mutation count: "(3 changes pending)"
    - [x] Tap banner → opens sync log modal
- [x] `SyncIndicator` in `ScreenHeader`:
    - [x] Online + synced: green cloud-check icon (20dp)
    - [x] Syncing: animated spinning cloud icon
    - [x] Offline: grey cloud-off icon
    - [x] Tap → bottom sheet with pending mutations list (table, action, timestamp)
- [x] Conflict resolution: when `updated_at` on server > local version at time of offline edit:
    - [x] Show `ConflictModal`: side-by-side comparison "Your version" vs "Server version" for key fields
    - [x] "Keep mine" button: force-overwrites server version with user's edits
    - [x] "Use server" button: discards local edit, loads server version
    - [x] "View both" button: opens full diff view

### P0.9 Indian Number & Date Formatting

- [x] `formatCurrency(amount: number, opts?: {decimals?: 0|2, compact?: boolean}): string`
    - [x] Default: `₹ 1,00,000` (no decimals, Indian grouping)
    - [x] `decimals: 2`: `₹ 1,00,000.50`
    - [x] `compact: true` with `currentLanguage === 'hi'`: `₹ 1 लाख`, `₹ 10 लाख`, `₹ 1 करोड़`, `₹ 10 करोड़`
    - [x] `compact: true` with `currentLanguage === 'en'`: `₹ 1 Lakh`, `₹ 1 Crore`
    - [x] Negative amounts: `- ₹ 5,000` (space after minus, not parentheses)
    - [x] Zero: `₹ 0` (never blank)
- [x] `formatDate(isoString: string, format: 'DD/MM/YYYY'|'DD MMM YYYY'|'DD MMM YY'|'MMM YYYY'): string`
    - [x] Hindi month names when `currentLanguage === 'hi'`: जनवरी, फरवरी, मार्च, अप्रैल, मई, जून, जुलाई, अगस्त, सितंबर, अक्टूबर, नवंबर, दिसंबर
    - [x] Time format (when needed): 12-hour with AM/PM in Hindi: "दोपहर 2:30 बजे" style — or simpler "2:30 PM"
- [x] `formatQuantity(qty: number, unit: string, decimalPlaces: 0|2|3): string`
    - [x] `100 Pcs`, `2.5 Kg`, `10.500 Ltr`
- [x] `amountInWords(amount: number, language: 'hi'|'en'): string`
    - [x] Hindi: "दो हजार पाँच सौ रुपये मात्र"
    - [x] English: "Rupees Two Thousand Five Hundred Only"
    - [x] Used on invoice print footer

### P0.10 Error Mapping

- [x] `AppError` class with `code`, `message (hi)`, `message (en)`, `originalError` fields
- [x] Error code map:
    - [x] Supabase `PGRST116` (no rows): "कोई data नहीं मिला" / "No data found"
    - [x] Supabase `23505` (unique constraint): "यह पहले से exist करता है" / "This already exists" + field hint
    - [x] Supabase `23503` (foreign key violation): "यह delete नहीं हो सकता, इससे जुड़ा data है" / "Cannot delete — linked records exist"
    - [x] Supabase `42501` (RLS violation): "Access denied" / "आपको यह देखने की अनुमति नहीं है"
    - [x] Network timeout: "Connection timeout — please retry" / "कनेक्शन timeout — retry करें"
    - [x] `AuthApiError` 400: "Invalid login" / "गलत login details"
    - [x] `AuthApiError` 401: session expired — triggers auto-logout and redirect to login
    - [x] Storage upload error: "File upload failed. Please try again" / "File upload नहीं हुआ"
    - [x] All unmapped errors: "Something went wrong. Please try again." / "कुछ गलत हुआ। कृपया retry करें।"

### P0.11 i18n Infrastructure

- [x] All user-visible strings in `en.json` and `hi.json` — zero hardcoded strings in components
- [x] Automated parity check: CI step that errors if any key in `en.json` is missing from `hi.json` or vice versa
- [x] All `{{variable}}` interpolations present in both locales
- [x] Namespaces: `common`, `auth`, `dashboard`, `invoice`, `purchase`, `payment`, `customer`, `supplier`, `inventory`, `finance`, `expense`, `reports`, `gst`, `settings`, `backup`, `utilities`, `errors`, `pdf`, `scanner`
- [x] Language switch persists to `AsyncStorage` under key `@app/language`
- [x] RTL support not needed (Hindi is LTR) but `I18nManager.isRTL` check in place for future

### P0.12 Loading & Skeleton States

- [x] Every data-fetching screen shows skeleton immediately (no blank white flash)
- [x] Skeleton shimmer animation: `withRepeat(withTiming(...))` via Reanimated — 1.5s loop
- [x] `SkeletonBlock` atom: rectangular placeholder, configurable width/height/border-radius
- [x] Screen-specific skeleton layouts:
    - [x] Invoice list skeleton: 5 rows, each with 3-line layout (invoice no, customer, amount)
    - [x] Dashboard skeleton: 4 stat card boxes + 2 summary tiles + 3 quick action buttons
    - [x] Item list skeleton: 6 rows, each with image thumb + 2 text lines + price
    - [x] Report skeleton: summary card + 8 data rows

---

## P1 — Onboarding & Business Identity

> **Prerequisite:** P0 complete.
> **Goal:** A new user installs the app and has their business fully set up within 3 minutes. Zero confusion for a non-technical shopkeeper.

---

### P1.1 First-Launch Language Selection Screen

**Route:** `/(auth)/language-select`
**Shown:** Once on first install; flag `@app/languageSelected` in AsyncStorage; skips to login on subsequent launches

- [x] Full-screen layout: brand logo at top (48dp), tagline "आपका डिजिटल बही-खाता" below logo
- [x] Two language cards displayed side-by-side, each occupying 45% screen width, height 120dp
- [x] Hindi card: large "हिंदी" text (28sp bold), subtext "हिंदी में चलाएं" below
- [x] English card: large "English" text (28sp bold), subtext "Use in English" below
- [x] Selected card: terracotta border (3dp), light terracotta fill — visual confirmation
- [x] "Continue" / "आगे बढ़ें" primary button below cards — disabled until selection made
- [x] Small text at bottom: "आप बाद में Settings से भाषा बदल सकते हैं" / "You can change language in Settings later"
- [x] Tapping a card: sets `i18next.changeLanguage()`, persists to AsyncStorage, enables Continue button
- [x] Continue: sets `@app/languageSelected = true`, navigates to login

### P1.2 Auth — Phone Login Screen

**Route:** `/(auth)/login`

- [x] Brand logo centred at top (64dp)
- [x] "Vyapar में आपका स्वागत है" / "Welcome to Vyapar" heading (h2)
- [x] `PhoneInput` component with +91 prefix
- [x] "Send OTP" / "OTP भेजें" primary button — disabled until 10 digits entered
- [x] On "Send OTP": Supabase `signInWithOtp({ phone: '+91XXXXXXXXXX' })` called; show loading spinner in button
- [x] On OTP sent: navigate to OTP verification screen; show "OTP sent to +91 XXXXX XXXXX" toast
- [x] Error: "This phone number is not registered" → show inline error under phone field
- [x] "Having trouble? Contact support" link at bottom

### P1.3 Auth — OTP Verification Screen

**Route:** `/(auth)/verify`

- [x] 6-cell OTP input: each cell is an individual `TextInput`, auto-advances on digit entry, auto-backspaces on delete
- [x] OTP cells: 48×56dp each, 8dp gap, large text (24sp centred)
- [x] "Verify" / "Verify करें" primary button — enabled when all 6 cells filled
- [x] "Resend OTP" link: disabled for 30s countdown "30s में resend करें"; re-enables after countdown
- [x] On verify: `supabase.auth.verifyOtp(...)` called; on success: check if business profile exists
    - [x] If profile exists: navigate to `/(app)/(tabs)/` (home dashboard)
    - [x] If no profile: navigate to `/(auth)/setup` (business setup wizard)
- [x] Wrong OTP: shake animation on cells, red border, "गलत OTP — फिर से try करें" error

### P1.4 Business Setup Wizard

**Route:** `/(auth)/setup`
**Shown:** Only when `businessProfile` does not exist for the user

**Wizard Shell:**

- [x] Progress bar at top (thin, terracotta) — 4 segments, fills as steps complete
- [x] Step indicator below progress bar: "Step 1 of 4" / "चरण 1 / 4"
- [x] Step title as h2 below indicator
- [x] Content area (ScrollView) fills remaining space
- [x] Bottom action bar: "Back" secondary button (left) + "Next" / "Next →" primary button (right)
- [x] Step 1 is not skippable (Business Name required); steps 2–4 show "Skip" link beside Next on non-required steps
- [x] Wizard state persisted to AsyncStorage on each step — if user exits and returns, wizard resumes at last incomplete step

**Step 1 — Business Identity:**

- [x] Title: "आपके व्यापार का नाम" / "Your Business Name"
- [x] Business Name field (required, min 2 chars, max 100): large `FormField`, placeholder "जैसे: शर्मा टाइल्स एंड हार्डवेयर"
- [x] Owner Name field (required): placeholder "जैसे: रमेश शर्मा"
- [x] Mobile Number: `PhoneInput`, pre-filled from auth session phone, editable
- [x] Next: validates both required fields; shows inline errors if empty; saves step-1 data to wizard state

**Step 2 — Business Type & Location:**

- [x] Title: "व्यापार का प्रकार और पता" / "Business Type & Address"
- [x] Business Type: 5 large cards in 2-column grid (last card full-width)
    - [x] Retail Shop (दुकान) — shop icon
    - [x] Wholesale (थोक) — warehouse icon
    - [x] Manufacturing (उत्पादन) — factory icon
    - [x] Service (सेवा) — tools icon
    - [x] Other (अन्य) — more icon
    - [x] Selected card: terracotta border, light fill, checkmark overlay
- [x] Business Address field: multi-line `TextAreaField`, placeholder "दुकान/मकान नं., गली, मोहल्ला"
- [x] State picker: `BottomSheetPicker` with all 36 Indian states + UTs listed (Hindi names when locale is hi); pre-filled from device region if determinable
- [x] City field: text input; auto-filled via pincode lookup
- [x] Pincode field: 6-digit numeric field; on 6 digits entered: API call to `api.postalpincode.in/{pincode}` (or bundled JSON); auto-fills City and District fields; shows loading indicator while fetching
- [x] Next: saves step-2 data

**Step 3 — GST & Tax:**

- [x] Title: "GST जानकारी" / "GST Information"
- [x] "क्या आप GST में रजिस्टर हैं?" / "Are you registered for GST?" — YES / NO large button pair (YES pre-selected if user came from GST-eligible business type)
- [x] When YES: show GSTIN field
    - [x] GSTIN field: 15-character text input, all-caps, format hint below: "22AAAAA0000A1Z5 (15 अंक)"
    - [x] Validate on blur: regex `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$` + Luhn checksum
    - [x] Green checkmark when valid; red error when invalid: "GSTIN का format गलत है"
- [x] PAN field: 10-character, format AAAAA9999A, optional
- [x] Financial Year Start: two large cards "April (Apr–Mar)" and "January (Jan–Dec)" — April pre-selected
- [x] When NO: show informational card "आप बिना GST के भी invoices बना सकते हैं। Settings में बाद में जोड़ सकते हैं।"
- [x] Next: saves step-3 data

**Step 4 — Branding:**

- [x] Title: "Invoice की जानकारी" / "Invoice Setup"
- [x] Logo upload card: dashed-border box 100×100dp, camera icon centre
    - [x] On tap: action sheet — "Camera से लें" / "Gallery से चुनें" / "Cancel"
    - [x] Image picked → crop UI to 1:1 ratio → compressed to ≤ 300 KB → shown as preview in the box
    - [x] Remove logo: × button overlay on preview
- [x] Invoice Number Prefix: text field, default "INV-", max 10 chars; live preview below: "Preview: **INV-001**"
- [x] Invoice Starting Number: numeric, default 1; live preview updates: "Preview: **INV-042**" when 42 entered
- [x] "Finish Setup" / "Setup पूरी करें" primary button (replaces "Next" on last step)
- [x] On Finish: `businessProfileService.create(wizardData)` called; on success: navigate to Home with `replace` (no back stack); show confetti animation (`lottie-react-native` or CSS keyframe) + toast "सब तैयार है! आपका व्यापार शुरू करें 🎉"
- [x] On API error: show error toast; keep user on step 4 to retry

### P1.5 Business Profile — Edit Screen

**Route:** `/(app)/settings/business-profile`

- [x] All fields from wizard available for editing
- [x] Additional fields not in wizard:
    - [x] Business Email (optional)
    - [x] Business Website (optional)
    - [x] Alternate Phone (optional)
    - [x] Business Description (for online store — max 200 chars)
    - [x] Signature Image: upload (camera/gallery), shown on invoice print footer; "Remove" button
- [x] **Bank Details for Print section** (collapsible card):
    - [x] Bank Name (text field)
    - [x] Account Number (numeric, masked display: XXXXXX1234)
    - [x] IFSC Code (text, 11 chars, uppercase)
    - [x] Account Holder Name
    - [x] Branch Name
    - [x] "Shown on invoice so customer can do bank transfer" — helper text
- [x] **UPI for Invoice section**:
    - [x] UPI ID field (e.g. `9876543210@upi`)
    - [x] After valid UPI ID entered: live QR code preview (using `react-native-qrcode-svg`) — "यह QR invoice पर छपेगा"
- [x] **Invoice Sequence section**:
    - [x] Current prefix: editable
    - [x] Current sequence number: editable (with warning: "इसे बदलने से invoice numbers में gap आएगा")
    - [x] Reset sequence each financial year: toggle
- [x] "Preview Invoice Header" button: opens modal showing invoice header exactly as it will appear on print
- [x] Save button: calls `businessProfileService.update()`; success toast "Profile save हो गई"

### P1.6 App Preferences Screen

**Route:** `/(app)/settings/preferences`

- [x] **Language section:**
    - [x] Toggle between Hindi and English — large cards (same design as language select screen)
    - [x] Language switch is immediate — all visible text updates in place, no reload
    - [x] Persists to `AsyncStorage` and `i18next`
- [x] **Currency & Numbers section:**
    - [x] Currency: INR (₹) — shown as read-only; "Only INR supported currently"
    - [x] Decimal Places: `0` or `2` toggle — affects all amount display and input
    - [x] Number format preview: "Example: ₹ 1,00,000" or "₹ 1,00,000.00"
- [x] **Date Format section:**
    - [x] Three options shown as radio buttons with preview example:
        - [x] DD/MM/YYYY → "05/04/2025" (default)
        - [x] DD-MMM-YYYY → "05-Apr-2025"
        - [x] YYYY-MM-DD → "2025-04-05" (ISO, for advanced users)
- [x] **Theme section:**
    - [x] Three options: Light / Dark / Follow System Device
    - [x] Thumbnail preview of each (mini screenshot-style illustration)
    - [x] Selection immediately changes app theme
    - [x] Persists to `AsyncStorage`
- [x] **UX Behaviour section:**
    - [x] "Show warning for unsaved changes" toggle (default ON): shows `ConfirmationModal` on back-press when form is dirty
    - [x] "Show profit on dashboard": toggle (default OFF for privacy — a relative or employee might see screen)

---

## P2 — Item / Product Master

> **Prerequisite:** P1 (business profile with state for GST, financial year for stock reporting).
> **Goal:** Shopkeeper can add, manage, and track every product they buy and sell — with prices, taxes, and stock — in a single place.
>
> **DB tables:** `inventory_items`, `stock_operations`, `item_categories`, `item_units`, `item_party_rates`, `item_batches`, `item_serials`

---

### P2.1 Item List Screen

**Route:** `/(app)/(tabs)/inventory`

- [x] `SearchBar` at top: searches on `item_name`, `item_code`, `hsn_code`
- [x] `FilterBar` below search with chips:
    - [x] "All" / "सभी" (default)
    - [x] Category chips (dynamic from `item_categories` table) — horizontal scroll
    - [x] "Low Stock" / "कम स्टॉक" chip — filters to items where `current_stock ≤ low_stock_threshold`
    - [x] "No Stock" / "स्टॉक नहीं" chip — filters to `current_stock = 0`
- [x] Sort button (top-right, funnel icon): bottom sheet with options
    - [x] A–Z (item name)
    - [x] Z–A
    - [x] Price: Low to High
    - [x] Price: High to Low
    - [x] Stock: Low to High (default for inventory audit)
    - [x] Recently Added
- [x] Each list row (72dp height):
    - [x] Left: item image thumbnail (40×40dp, rounded 8dp; fallback = coloured initial letter avatar using item name)
    - [x] Middle: item name (bodyBold), category chip (small coloured pill), item code below (caption secondary)
    - [x] Right: sale price (amount style, right-aligned), stock quantity below (caption; red text + warning icon if at/below threshold)
- [x] Summary bar above list: "X items · Stock value: ₹ Y" — tapping stock value navigates to Stock Summary Report
- [x] Swipe-left: Edit (blue) + Delete (red; disabled with "Used in invoices" tooltip if item has transactions)
- [x] FAB "+ Item" bottom-right; tapping navigates to `/inventory/add`
- [x] Empty state: box illustration, "अभी तक कोई item नहीं जोड़ा" / "No items added yet", "Add First Item" button
- [x] Pull-to-refresh: refetches from Supabase
- [x] On screen focus (`useRefreshOnFocus`): background refresh without skeleton flash

### P2.2 Add / Edit Item — Core Fields

**Route:** `/(app)/inventory/add` and `/(app)/inventory/[id]?edit=true`
**Form sections displayed as expandable cards, all expanded by default on first add**

- [x] **Item Name** (required):
    - [x] Large `FormField`, min 1 char, max 100 chars
    - [x] Placeholder: "जैसे: सफेद ग्लॉसी टाइल 60×60"
    - [x] Hindi keyboard recommended note: "आप हिंदी या English में नाम लिख सकते हैं"
    - [x] Duplicate check on blur: if same name exists → "इस नाम का item पहले से है: [name]. फिर भी add करें?" warning chip (not blocking)
- [x] **Item Code / SKU** (optional):
    - [x] Text field, max 20 chars, auto-uppercase
    - [x] "Auto-generate" toggle beside label: generates code as `YYYYMMDD-XXXX` (date + 4-char random)
    - [x] Barcode scan button (camera icon, 28dp): scans barcode → fills item code field
    - [x] Uniqueness validated on save (not on blur to avoid server round-trip while typing)
- [x] **Category** (optional but recommended):
    - [x] `BottomSheetPicker` showing categories from `item_categories` table
    - [x] Each category shows colour dot + name in picker
    - [x] "+ Add new category" at bottom: opens mini-form (name + colour picker + emoji)
    - [x] If categories feature is OFF in settings: this field hidden
- [x] **Item Description** (optional):
    - [x] `TextAreaField`, max 500 chars, `numberOfLines={3}`
    - [x] If item description feature is OFF in settings: this field hidden
- [x] **Item Image** (optional):
    - [x] Dashed-border upload box 120×120dp with camera/image icon
    - [x] On tap: action sheet — Camera / Gallery / Remove
    - [x] Image compressed to ≤ 500 KB, uploaded to Supabase Storage bucket `item-images/[businessId]/[itemId].jpg`
    - [x] Thumbnail shown in box after upload; × button to remove
    - [x] Upload progress indicator (linear bar) during upload

### P2.3 Add / Edit Item — Pricing

- [x] **Sale Price** (required):
    - [x] `AmountInput`, must be > 0
    - [x] "Inclusive of GST" toggle inline: when ON, label changes to "MRP / Inclusive Price"; base price recalculated live and shown below: "Base Price (before GST): ₹ XXX"
    - [x] Formula: `base = salePrice / (1 + gstRate / 100)` — computed live as user types
- [x] **Purchase Price** (optional):
    - [x] `AmountInput`, label "Purchase / Cost Price"
    - [x] Shown/hidden by "Show Purchase Price" setting (P18.7)
    - [x] Helper text: "Invoice बनाते समय profit calculate करने के लिए"
    - [x] If entered: shows "Estimated Margin: ₹ X (Y%)" below — using sale price vs purchase price
- [x] **MRP (Maximum Retail Price)** (optional):
    - [x] `AmountInput`
    - [x] Shown on invoice print when enabled in settings
    - [x] Validation: MRP ≥ sale price (show warning if lower, not hard block)
- [x] **Default Discount** (optional):
    - [x] Numeric field, suffix "%", range 0–100
    - [x] This discount auto-applied when item added to invoice; user can override per-invoice
    - [x] Shown/hidden by item-wise discount setting (P18.7)
- [x] **Wholesale Price** (optional):
    - [x] Separate price for wholesale customers
    - [x] Applied when customer is tagged as "Wholesale" group

### P2.4 Add / Edit Item — Tax

- [x] **GST Rate** (required if GST is enabled):
    - [x] `BottomSheetPicker` with 6 options:
        - [x] Nil (0%) — for exempt goods
        - [x] 5% — for essential items, some food
        - [x] 12%
        - [x] 18% — most common for manufactured goods
        - [x] 28% — luxury/sin goods
        - [x] Custom rate — shows numeric input (for special items)
    - [x] Default: 18% (most common for tiles/hardware)
    - [x] Hidden entirely if GST is OFF in settings
- [x] **HSN / SAC Code**:
    - [x] Text field, 4–8 digits
    - [x] Bundled HSN lookup: type 2+ chars → shows matching codes from bundled JSON (~5000 common codes); tap to fill
    - [x] After filling: shows HSN description below field: "6908 — Glazed ceramic tiles"
    - [x] "Goods" vs "Services" toggle determines whether HSN (goods) or SAC (services) code is used
    - [x] Hidden if HSN/SAC feature is OFF in settings
- [x] **Additional Cess** (optional):
    - [x] Numeric field, suffix "%"
    - [x] Shown only if "Additional Cess" is enabled in GST settings (P18.1)
    - [x] Helper: "Pan masala, tobacco, coal etc. attract extra cess"
- [x] GST summary card (below fields, auto-computed): "On ₹ 1000 item: CGST ₹ 90 + SGST ₹ 90 = Total ₹ 1180"

### P2.5 Add / Edit Item — Stock & Units

- [x] **Track Stock toggle** (default ON):
    - [x] When OFF: hides all stock fields; item shows "Service item" chip in list; stock column blank
    - [x] When ON: shows all stock fields below
- [x] **Primary Unit**:
    - [x] `BottomSheetPicker` listing system units + custom units
    - [x] System units bundled: Pcs (पीस), Box (बॉक्स), Kg (किग्रा), Gram (ग्राम), Litre (लीटर), Meter (मीटर), Sq.ft (वर्ग फुट), Sq.meter (वर्ग मीटर), Dozen (दर्जन), Set (सेट), Pair (जोड़ी), Roll (रोल), Bag (बैग), Ton (टन), Number (नग)
    - [x] "+ Add custom unit": opens inline mini-form (full name, abbreviation); saves to `item_units` table
- [x] **Opening Stock Quantity** (shown when Track Stock is ON):
    - [x] Numeric field with unit suffix; decimal places from settings
    - [x] `DatePickerField` for "As on date" — the date from which this opening stock is recorded
    - [x] Helper: "यह आपके पास अभी जितना stock है वो enter करें"
    - [x] On save: creates a `stock_operation` row of type `opening`
- [x] **Low Stock Alert Threshold**:
    - [x] Numeric field with unit suffix
    - [x] Default: 5
    - [x] "Alert when stock falls below \_\_\_ [unit]"
    - [x] Shown in red in item list when `current_stock ≤ threshold`
- [x] **Secondary Unit toggle**:
    - [x] When ON: shows secondary unit configuration
    - [x] Secondary Unit Name: text field ("Box", "Carton", "Bundle")
    - [x] Conversion Formula: "1 [Secondary Unit] = \_\_\_ [Primary Unit]" — numeric input
    - [x] Example auto-shown: "1 Box = 8 Pcs"
    - [x] Default Unit for Sale: Primary / Secondary — `BottomSheetPicker` with both options
    - [x] Default Unit for Purchase: Primary / Secondary — same picker
- [x] **Barcode**:
    - [x] Text field (EAN-13, Code128, QR all accepted)
    - [x] Camera scan button: opens `BarcodeScanningView` from `expo-camera`
    - [x] "Generate Barcode" button: creates Code128 barcode from item code; shows preview; saves to field
    - [x] Barcode shown on item detail as scannable image

### P2.6 Add / Edit Item — Batch & Serial Tracking

> These features shown only when Track Stock is ON and respective settings enabled in P18.7

- [x] **Batch Tracking toggle**:
    - [x] When ON: every stock receipt and sale will require batch selection
    - [x] Cannot be ON simultaneously with Serial Tracking
    - [x] Toggle turns red with warning "Enabling batch tracking will require batch info for all future stock entries"
- [x] **Batch Fields (shown on item add/edit when batch tracking ON)**:
    - [x] Batch Number: text field
    - [x] Manufacturing Date: `DatePickerField`
    - [x] Expiry Date: `DatePickerField` (must be after manufacturing date)
    - [x] Opening quantity for this batch: numeric
    - [x] "+ Add another batch" button for multiple opening batches
- [x] **Serial Tracking toggle**:
    - [x] When ON: each individual unit has a unique serial number
    - [x] Opening serials: multi-line text area — "Enter one serial number per line or scan barcodes sequentially"
    - [x] Cannot be ON with Batch Tracking
- [x] **Expiry Alert**: when expiry date within 30 days of today → orange badge in item list + dashboard alert

### P2.7 Item Detail Screen

**Route:** `/(app)/inventory/[id]`

- [x] **Header card**:
    - [x] Item image (120×120dp, rounded 12dp) left; if no image: category-colour avatar
    - [x] Item name (h1) right of image
    - [x] Category chip below name
    - [x] Item code below category (caption)
    - [x] Current stock as large number (amountLarge) — colour: green if above threshold, red if at/below, grey if stock not tracked
    - [x] Unit beside stock number
- [x] **Pricing card**:
    - [x] Sale Price (amountLarge, terracotta)
    - [x] Purchase Price (body, secondary) — shown only if setting enabled
    - [x] MRP (caption) if set
    - [x] GST Rate badge chip ("GST 18%")
    - [x] HSN Code (caption)
    - [x] Margin: "Margin: ₹ X (Y%)" — green if positive
- [x] **Stock Summary card** (only when stock tracking ON):
    - [x] Opening Stock: X [unit]
    - [x] Total Purchased: + X [unit]
    - [x] Total Sold: − X [unit]
    - [x] Adjustments: ± X [unit]
    - [x] **Current Stock: X [unit]** (bold, large)
    - [x] Stock Value: ₹ X (current stock × purchase price)
    - [x] "Adjust Stock" button: navigates to stock adjustment screen
- [x] **Stock Movement ledger** (mini-list, last 10 entries):
    - [x] Each row: date (caption), transaction type icon, reference number, qty in/out (green/red), running balance
    - [x] "View All" link → Item Detail Report (P14.5)
- [x] **Last Transaction cards** (two side-by-side):
    - [x] "Last Purchased: ₹ X on DD MMM (from [Supplier])"
    - [x] "Last Sold: ₹ X on DD MMM (to [Customer])"
- [x] **Party Rates section** (only if party-wise pricing setting ON):
    - [x] List of special rates set for specific parties
    - [x] "+ Add Rate" button → party picker + rate input mini-form
- [x] **Action bar** (bottom sticky):
    - [x] "Edit" button (secondary)
    - [x] "Share on WhatsApp" button — shares item name, price, stock as text
    - [x] Kebab menu (⋮): Duplicate Item, View in Batches, View Serials, Delete

### P2.8 Stock Adjustment Screen

**Route:** `/(app)/inventory/stock-op` (enhance existing)

- [x] **Adjustment Type** (required): large card selection
    - [x] "Add Stock" / "स्टॉक बढ़ाएं" — for physical additions not from purchase
    - [x] "Remove Stock" / "स्टॉक घटाएं" — for wastage, theft, damage
    - [x] "Set Stock" / "स्टॉक set करें" — override current stock (for physical count reconciliation)
- [x] Item search (if not pre-filled from item detail)
- [x] Quantity: `AmountInput` with unit
- [x] For "Set Stock": shows "Current stock: X [unit]; New stock: Y [unit]; Difference: ±Z"
- [x] Reason (required): `BottomSheetPicker`: Damage / Theft / Expiry / Opening Stock / Physical Count / Other; "Other" shows text field
- [x] Date: `DatePickerField`, default today
- [x] Notes: optional text
- [x] For Batch-tracked items: Batch picker showing all open batches with quantities
- [x] For Serial-tracked items: serial number scanner/input
- [x] Save: creates `stock_operations` row; updates `current_stock` on item; shows success toast "Stock update हो गया"

### P2.9 Item Categories Management

**Route:** `/(app)/settings/item-categories` (accessible from item form and settings)

- [x] List of all categories: each row shows colour dot, name, item count
- [x] FAB "+ New Category"
- [x] **Add / Edit Category form**:
    - [x] Name (Hindi and English): two text fields labelled "हिंदी नाम" and "English Name"
    - [x] Colour picker: 12 preset colours shown as circles; tap to select; selected shows checkmark
    - [x] Icon: emoji picker (`@emoji-mart/react` equivalent or simpler) — optional
    - [x] Save button
- [x] **Merge Category**: from kebab menu on category row → "Merge into..." → `BottomSheetPicker` of other categories → all items from source moved to target → source deleted
- [x] **Delete Category**: only allowed when item count = 0; else: "पहले इन items को दूसरी category में move करें"; shows item list for reassignment
- [x] Reorder categories: long-press drag to reorder (order saved to `item_categories.sort_order`)

### P2.10 Item Units Management

**Route:** `/(app)/settings/item-units`

- [x] Lists all system units (non-editable, grey) and custom units
- [x] Custom unit rows: show name, abbreviation, usage count (how many items use it)
- [x] Edit custom unit: name and abbreviation only (abbreviation change propagates to all items)
- [x] Delete custom unit: disabled if `usage_count > 0` — shows "X items use this unit; reassign first"
- [x] Set default unit: radio button beside each custom unit; affects new item form default

### P2.11 Party-wise Item Pricing

**Accessed from:** Item Detail Screen → Party Rates section

- [x] Table listing all special rates: Party Name, Rate (₹), Rate Type (Fixed / % Discount off MRP), Active toggle
- [x] "+ Add Rate" button: bottom sheet form
    - [x] Party picker (customers + suppliers both, in case of supplier-specific purchase price)
    - [x] Rate type: Fixed Price / % Discount
    - [x] Rate value: `AmountInput` or percentage input
    - [x] Active toggle: default ON
    - [x] Effective From date (optional)
    - [x] Expiry date (optional)
- [x] When this item is added to an invoice for a matching party: rate auto-fills; "Special rate applied" badge shown on line item
- [x] Edit / delete party rates from the table

### P2.12 Item Import from Excel

**Route:** `/(app)/inventory/import`

- [x] **Step 1 — Download Template**: "Download Excel Template" button; downloads pre-formatted `.xlsx` from Supabase Storage or generates client-side; columns: Item Name, Item Code, Category, Sale Price, Purchase Price, MRP, GST Rate, HSN Code, Unit, Opening Stock, Low Stock Threshold, Description
- [x] **Step 2 — Upload File**: `expo-document-picker` button; accepts `.xlsx` and `.csv`; shows file name and size after selection
- [x] **Step 3 — Map Columns**: table showing detected columns → dropdown to map to app fields; auto-maps when header names match exactly
- [x] **Step 4 — Preview & Validate**: shows first 5 rows in a table; validation errors highlighted in red per cell; error count shown: "3 rows have errors — they will be skipped"
- [x] Options row: "Skip duplicates (matching item name)" toggle; "Update existing items" toggle
- [x] **Step 5 — Import**: "Import X items" button; progress bar shows row-by-row; "Importing... 45/200"; on complete: "200 items imported (195 new, 5 updated, 2 skipped due to errors)" summary card with "View Errors" expandable

### P2.13 Item Export

**Route:** Accessible from inventory list → kebab menu → "Export Items"

- [x] **Field selection**: checkboxes for columns to include: Name, Code, Category, Sale Price, Purchase Price, MRP, GST, HSN, Unit, Current Stock, Low Stock Threshold
- [x] **Format picker**: PDF (Catalogue style, printable) or Excel (.xlsx, full data)
- [x] **Filter options**: All items / Specific category / Low stock only / Zero stock
- [x] PDF output: A4 page, business header, date, items in table; can be printed as product catalogue for customers
- [x] Excel output: sheet per category or all in one sheet (toggle)
- [x] Share via: WhatsApp / Email / Files (device storage)

---

## P3 — Party Master (Customers & Suppliers)

> **Prerequisite:** P1 (business profile — state needed for GST supply determination).
> **Goal:** Every customer and supplier instantly findable; outstanding balance always visible without opening a ledger.
>
> **DB tables:** `customers`, `suppliers`, `party_groups`, `party_group_members`, `customer_addresses`

---

### P3.1 Customers List Screen

**Route:** `/(app)/customers`

- [x] `SearchBar`: searches on `name`, `phone`, `gstin`
- [x] `FilterBar` chips: All / With Balance / No Balance / By Group (shows group sub-picker) / Overdue
- [x] Sort: A–Z / Z–A / Highest Balance / Recently Transacted / Date Added
- [x] Each list row (80dp):
    - [x] Left: avatar circle (48dp) with initials — colour based on name hash (10 preset colours)
    - [x] Middle: customer name (bodyBold), phone (caption secondary)
    - [x] Right: outstanding amount (amountStyle); "Dr" or "Cr" badge; green if Cr (advance), red if Dr (owes)
- [x] Summary bar: "X customers · ₹ Y to receive (total Dr balance)"
- [x] Swipe-left actions: Call (tel: link, green), Edit (blue), Delete (red, disabled if has transactions)
- [x] FAB "+ Customer"
- [x] Section headers: A, B, C... with side index scrubber on right edge (A-Z tap to scroll)

### P3.2 Add / Edit Customer Screen

**Route:** `/(app)/customers/add` and `/(app)/customers/[id]?edit=true`

- [x] **Basic Details section**:
    - [x] Name (required, min 1 char, max 100): large `FormField`
    - [x] Phone: `PhoneInput` component
        - [x] On blur: API call to check existing customers with same number; if found: inline chip "Already exists: [Name] — View" with link
        - [ ] Multiple phones: "+ Add another number" link adds a second phone field (max 3)
    - [ ] Email (optional): email keyboard, format validation
    - [x] Customer Type: "Individual" / "Business" toggle — Business shows Company Name field
    - [x] Company Name (optional, shown when Business): text field
- [x] **GST Details section** (shown when GSTIN party setting ON in P18.6):
    - [x] GSTIN: 15-char field, uppercase, format validation, checksum validation
    - [ ] When GSTIN valid: auto-fills State from first 2 digits: "State: Maharashtra (27)"
    - [x] GST Type: Regular / Composition / Unregistered / Consumer — picker
- [x] **Address section**:
    - [x] Billing Address: multi-line text area
    - [ ] State: `BottomSheetPicker` (36 states/UTs) — determines CGST/SGST vs IGST on invoices
    - [x] City: text field
    - [ ] Pincode: 6-digit; auto-fills City + State on valid pincode
    - [ ] "Add Shipping Address" toggle → separate block:
        - [ ] "Same as billing" checkbox: copies billing address
        - [ ] Separate shipping address fields: line, city, state, pincode, contact name, contact phone
    - [ ] Shipping address shown on invoice when "Print Shipping Address" enabled in P18.6
- [x] **Group section** (shown when party grouping ON in P18.6):
    - [ ] Customer Group: `BottomSheetPicker` of groups; "+ Add group" inline
    - [ ] Multiple groups allowed (many-to-many)
- [x] **Credit & Balance section**:
    - [x] Credit Limit: `AmountInput` (0 = no limit); helper "Invoice बनाते समय warning मिलेगी अगर इससे ज़्यादा outstanding हो"
    - [x] Opening Balance: `AmountInput`
    - [x] Balance Type: "To Receive (Dr)" / "To Pay / Advance (Cr)" — large toggle buttons
    - [ ] Opening Balance Date: `DatePickerField`
    - [ ] Helper: "यह balance पिछले records को migrate करने के लिए है"
- [x] **Additional Fields section** (shown when Party Additional Fields setting ON and fields configured in P18.6):
    - [ ] Up to 3 custom fields with configured labels (e.g., "Vehicle No.", "District", "Agent Name")
    - [ ] Each is a simple text input
- [x] Save button: validates all required fields; on success: navigate to customer detail; show "Customer save हो गई ✓" toast

### P3.3 Customer Detail Screen

**Route:** `/(app)/customers/[id]`

- [x] **Header**:
    - [x] Avatar circle (64dp, large initials)
    - [x] Name (h1)
    - [x] Phone: tap to call (`Linking.openURL('tel:...')`); shows all phones if multiple
    - [x] Outstanding balance (amountLarge): red if Dr (they owe), green if Cr (advance with us)
    - [x] "Dr" / "Cr" label beside balance in smaller text (13sp)
    - [x] GSTIN (caption) if set; "Regular" / "Composition" badge
    - [ ] Group chips if any
- [x] **Quick Action row** (3 equal-width buttons, 52dp height each):
    - [x] "New Sale" — navigates to invoice create with this customer pre-filled
    - [x] "Receive Payment" — navigates to payment-in with this customer pre-filled
    - [x] "WhatsApp" — opens WhatsApp deep link: `https://wa.me/91XXXXXXXXXX?text=नमस्ते [Name] जी...`
- [x] **Tab bar** (3 tabs: Ledger / Invoices / Payments):
    - [x] **Ledger tab**:
        - [ ] `DatePickerField` "from" and "to" (default: current FY)
        - [x] Opening balance row (grey background): "Opening Balance — Dr/Cr ₹ X"
        - [x] Chronological list of all transactions: date, type icon + label, reference no., Dr/Cr amount, running balance
        - [x] Transaction types shown with distinct icons: Sale (receipt), Payment (cash), Credit Note (return), Adjustment (gear)
        - [x] Closing balance row (bold): "Closing Balance — Dr/Cr ₹ X"
        - [ ] "Send Statement" button below closing balance: calls `reportService.generatePartyStatement()` → PDF → share sheet
    - [ ] **Invoices tab**:
        - [ ] Filtered invoice list (same as P4.9 but pre-filtered by this customer)
        - [ ] Status filter chips: All / Paid / Unpaid / Partial / Overdue
        - [ ] Summary: "X invoices · Total ₹ Y · Outstanding ₹ Z"
    - [ ] **Payments tab**:
        - [ ] All payments received from this customer
        - [ ] Each row: date, amount, payment mode icon, reference, linked invoice count
- [x] **Credit Limit warning** (shown when outstanding > credit limit): amber banner "Credit limit ₹ X exceeded by ₹ Y"
- [x] Edit button: navigates to edit screen (pre-filled)
- [x] Delete: in kebab menu; disabled if has transactions

### P3.4 Customer Groups

**Route:** `/(app)/settings/customer-groups`

- [ ] Groups list: name, colour, member count, total outstanding
- [ ] FAB "+ New Group"
- [ ] **Add/Edit Group**:
    - [ ] Group name (Hindi + English)
    - [ ] Colour picker (12 presets)
    - [ ] Description (optional)
    - [ ] Save
- [ ] **Group Detail screen**:
    - [ ] Members list with outstanding per member
    - [ ] "Add Members" button: multi-select customer picker
    - [ ] Remove member: swipe-left on member row
    - [ ] Total group outstanding at top
    - [ ] "View Group Report" link → Sale/Purchase by Party Group report (P12.6)
- [ ] Delete group (only if no members OR after confirmation "Remove group but keep all customers")

### P3.5 Supplier List & Add/Edit

**Route:** `/(app)/suppliers`
**Structure:** Identical to customers (P3.1–P3.2) with these differences:

- [x] Labels: "Supplier" / "आपूर्तिकर्ता"; "To Pay" instead of "To Receive"; payable amounts in red
- [x] Quick action row: "New Purchase" / "Make Payment" / "WhatsApp"
- [x] Extra field: GST Type: Regular / Composition / Unregistered (affects ITC eligibility on purchase bills)
- [x] Extra field: "Supplies to us" checkbox (marks as vendor vs customer who buys from us)
- [x] Ledger tab shows: Purchase bills, Debit notes, Payments made
- [x] Purchases tab: purchase bills from this supplier
- [x] No credit limit field (suppliers don't get credit limits from us)

### P3.6 Supplier Detail Screen

**Route:** `/(app)/suppliers/[id]`
Identical structure to Customer Detail (P3.3) with supplier-specific data.

### P3.7 Party Self-Registration

**Route:** `/(app)/settings/party-invite`

- [ ] Toggle "Allow customers to add themselves"
- [ ] When ON: generates unique URL `https://app.domain/join/[businessSlug]`
- [ ] "Copy Link" button; "Share on WhatsApp" button
- [ ] Web form (served from Supabase Edge Function): customer fills name, phone, GSTIN, address → submits
- [ ] In-app: pending approvals count badge on Parties screen; "Pending Approvals" section at top of customer list
- [ ] Each pending: "Approve → adds as customer" or "Reject → deletes"

### P3.8 Import Parties from Excel

**Route:** `/(app)/parties/import`

- [ ] Two tabs in wizard: "Customers" and "Suppliers"
- [ ] Download template: separate Excel file with two sheets (Customers, Suppliers); columns: Name, Phone, Email, GSTIN, State, Address, City, Pincode, Group, Opening Balance, Balance Type (Dr/Cr)
- [ ] Upload: `.xlsx` or `.csv`; column mapping step same as item import
- [ ] Validation: phone format check, GSTIN format check, duplicate phone check
- [ ] Options: Skip duplicates (by phone) / Update existing
- [ ] Progress bar + result summary

---

## P4 — Sale Invoice

> **Prerequisite:** P2 (items with prices and GST), P3 (customers), P1 (business profile, invoice sequence, GSTIN).
> **Existing code:** 3-step wizard in `src/features/invoice-create/` — all steps enhanced here.
>
> **DB tables:** `invoices`, `invoice_line_items`, `payments`, `payment_invoice_links`
> **RPC:** `create_invoice_v1` — atomic transaction (invoice + line items + stock deduction + payment + ledger update)

---

### P4.1 Invoice Create — Wizard Shell

**Route:** `/(app)/invoices/create`

- [x] Stepper header: 3 dots at top; active dot filled terracotta, completed dot terracotta outline, pending dot grey
- [x] Step labels below dots: "Customer" / "Items" / "Review"
- [x] `ScreenHeader` with "New Sale Invoice" / "नई बिक्री" title and × close button (right side)
- [x] × close: if form dirty → `ConfirmationModal` "Draft save करें?" with "Save Draft" / "Discard" / "Cancel" options
    - [ ] "Save Draft": stores all entered data to AsyncStorage under key `@invoice_draft/[tempId]`; navigates to invoice list; shows "Draft saved" toast; draft entry appears at top of invoice list with "DRAFT" badge
- [x] Each step has a `ScrollView` content area (keyboard-aware via `KeyboardAvoidingView`)
- [x] Step navigation: "Back" button (left) and "Next" / "Create Invoice" button (right) in fixed bottom bar

### P4.2 Invoice Create — Step 1: Customer & Header

- [x] **Date field** (`DatePickerField`):
    - [ ] Default: today
    - [ ] Cannot set to future date (show warning, not hard block — backdated invoices are legal in India)
    - [ ] When date is older than 60 days: amber warning "This invoice date is more than 60 days old — are you sure?"
- [x] **Invoice Number field**:
    - [ ] Auto-populated with next sequence: `[prefix][paddedSequence]` → "INV-0042"
    - [ ] Editable: user can override; if they enter an already-used number → red error "यह number already use हो चुका है (INV-0038)"
    - [ ] Sequence auto-increments on successful save (not on open — to avoid gaps when user discards)
- [x] **"Cash Sale" toggle** (large, prominent):
    - [ ] Default: OFF unless "Cash Sale as default" setting is ON (P17.1)
    - [ ] When ON: hides customer search field entirely; shows "Cash / Walk-in Customer" label; invoice type = `cash_sale`
    - [ ] When OFF: shows customer selection
- [x] **Customer selection** (shown when not Cash Sale):
    - [ ] `SearchBar` placeholder "Customer का नाम या phone खोजें"
    - [ ] Search shows results as list below (not in sheet): each result shows avatar, name, phone, outstanding balance in red/green
    - [ ] "Add new customer" row at top of results (with + icon): navigates to customer add screen, returns with new customer pre-selected
    - [ ] When customer selected: compact customer card shown (name, phone, outstanding badge); × to deselect
    - [ ] Credit limit check: if `outstanding > creditLimit` → amber banner "Credit limit of ₹ X exceeded. Current outstanding: ₹ Y"
- [x] **Inter-state toggle** (shown when customer has state set):
    - [ ] Auto-set: ON if customer state ≠ business state; OFF if same state
    - [ ] User can override manually
    - [ ] Determines CGST+SGST (intra-state) or IGST (inter-state) calculation
    - [ ] Place of Supply picker (shown when "State of supply" setting ON in P17.1): defaults to customer state; user can override
- [x] **Reverse Charge toggle** (shown when "Reverse Charge" setting ON in P17.1):
    - [ ] When ON: GST not charged to customer; recipient pays GST directly to govt
- [x] **PO Number + Date** (shown when "PO Detail" setting ON in P17.1):
    - [ ] PO Number: text field
    - [ ] PO Date: `DatePickerField`
- [x] **Due Date** (shown when "Due date" setting ON in P17.1):
    - [ ] `DatePickerField`
    - [ ] Quick-set chips: Net 7 / Net 15 / Net 30 / Net 45 / On Delivery — tap sets date to today + N days
- [x] Next button: validates date is set and (if not cash sale) customer is selected; advances to Step 2

### P4.3 Invoice Create — Step 2: Line Items

- [x] **Item search bar** at top:
    - [ ] Placeholder "Item का नाम search करें या barcode scan करें"
    - [ ] Barcode scan icon on right (shown when barcode setting ON in P17.1): opens camera scanner
    - [ ] As user types (300ms debounce): shows items from inventory matching name/code
    - [ ] Each result row: item name, stock qty (red if low), sale price, GST rate badge
    - [ ] Tap result: adds item to line items with default qty=1; keyboard closes
    - [ ] "Item नहीं मिला?" text at bottom of search results → "+ New Item" link (navigates to add item, returns)
- [x] **Line Items List** (below search bar):
    - [ ] Each line item row (compact card, 88dp):
        - [ ] Item name (bodyBold) + category chip
        - [ ] Row 2: Qty input (numeric, +/− spinner buttons, 40dp each) + unit label
        - [ ] Row 3: Unit price (`AmountInput` inline, editable) + "× qty = ₹ total" live
        - [ ] Row 4 (when item discount ON): Discount field — toggleable between % and ₹ (small toggle beside field)
        - [ ] Row 5: GST breakdown (caption): "GST 18%: CGST ₹X + SGST ₹X" or "IGST ₹X"
        - [ ] Row for batch-tracked items: Batch picker showing available batches with qty
        - [ ] Row for serial-tracked items: serial number scan button
        - [ ] Swipe-left to remove line item (with haptic, no confirmation needed for line items)
    - [ ] Stock overage warning: if qty > current_stock → yellow inline banner on that row: "⚠ Only [stock] available (you're adding [qty])"
    - [ ] Free item qty row (shown when free-item setting ON): "+ Free qty: \_\_\_" below regular qty
- [x] **Running Totals bar** (sticky bottom, above keyboard):
    - [ ] "X items · Subtotal: ₹ Y · GST: ₹ Z"
    - [ ] Updated live as items added/qty changed/prices changed
- [x] Next button: validates at least one line item added; advances to Step 3

### P4.4 Invoice Create — Step 3: Review, Charges & Payment

**This step is the "checkout" step — all amounts finalised and payment mode captured**

#### Charges & Discounts section:

- [x] **Additional Charges** (shown when "Additional Charges" setting ON in P17.1):
    - [ ] List of charge rows: each has Name text field + Amount `AmountInput`
    - [ ] Default rows: "Freight", "Packaging" (configurable)
    - [ ] "+ Add Charge" link adds a new empty row
    - [ ] Remove charge: × button right of row
    - [ ] Charges are taxable or non-taxable toggle per row (affects GST computation)
- [x] **Transaction-level Discount** (shown when "Transaction-wise Discount" setting ON in P17.1):
    - [ ] Toggleable: % or ₹ amount
    - [ ] Applied after line-item discounts
    - [ ] "After discounts on individual items" helper text
- [x] **Round Off** (shown when "Round Off" setting ON in P17.1):
    - [ ] Shows auto-calculated round-off: "+ ₹ 0.50" or "− ₹ 0.32"
    - [ ] Override toggle: user can manually enter round-off amount
    - [ ] Cannot exceed ₹ 1.00 (validation)

#### Totals Summary card (large, prominent):

- [x] Item Subtotal: ₹ X
- [x] (−) Total Discount: ₹ X (shown only if discount applied)
- [x] (+) Additional Charges: ₹ X (shown only if charges added)
- [x] (+) Total GST: ₹ X
    - [ ] Breakdown: CGST ₹ X + SGST ₹ X (for intra-state) OR IGST ₹ X (for inter-state)
- [x] (+) Round Off: ±₹ X (shown only if non-zero)
- [x] Divider line
- [x] **Grand Total: ₹ X** — `amountLarge` variant, bold, terracotta
- [x] **Profit Indicator** (shown when "Show Profit" setting ON in P17.1): small green card "Profit on this sale: ₹ X (Y%)"

#### HSN/GST Breakdown table (collapsible, shown when GST enabled):

- [x] Table columns: HSN Code, Description (truncated), Taxable Value, Rate, CGST, SGST, IGST
- [x] One row per unique HSN × GST rate combination
- [x] Collapse/expand toggle: "GST Details ▼"

#### E-way Bill section (shown when E-way Bill setting ON):

- [x] E-way Bill No.: text field (12 digits)
- [x] E-way Bill Date: `DatePickerField`

#### Transportation Details section (shown when Transportation setting ON):

- [x] Transporter Name: text field
- [x] LR / GR Number: text field
- [x] Vehicle Number: text field (format hint "MH 01 AB 1234")
- [x] Date of Dispatch: `DatePickerField`
- [x] Mode of Transport: Road / Rail / Air / Ship picker

#### Invoice Notes section:

- [x] "Invoice Notes" text area (optional, shown on invoice print): "जैसे: Goods sold are not returnable"
- [x] "Terms & Conditions" text area: pre-filled from settings default; editable per invoice

#### Payment section:

- [x] **Payment Amount** (`AmountInput`, large):
    - [ ] Pre-filled with Grand Total (full payment assumption)
    - [ ] "Paid in Full ₹ X" chip: sets amount to grand total
    - [ ] "Credit / No Payment ₹ 0" chip: sets to 0; shows "₹ [grandTotal] will be added to [customer]'s balance"
- [x] **Balance Due banner** (visible when payment < grand total):
    - [ ] "Balance ₹ X will be added to [Customer Name]'s ledger"
    - [ ] If customer has existing balance: "Existing balance: ₹ Y. After this invoice: ₹ Z"
- [x] **Payment Mode chips** (horizontal scroll, only shown when payment amount > 0):
    - [ ] Cash (₹ icon) · UPI (phone icon) · Bank Transfer (bank icon) · Cheque (cheque icon) · Card (card icon)
    - [ ] Exactly one selectable at a time; selected chip: filled terracotta
    - [ ] Default: Cash
- [x] **Split Payment** (shown when "Multiple payment modes" feature ON):
    - [ ] "Split into multiple modes" toggle
    - [ ] When ON: replaces single amount with multiple rows; each row: mode selector + amount; must total to payment amount
- [x] **Bank Account selector** (appears when Bank Transfer or Cheque selected):
    - [ ] Picker showing bank accounts from `bank_accounts` table; "+ Add Bank Account" if empty
- [x] **UPI Reference** (appears when UPI selected):
    - [ ] Text field: "UTR / Reference Number (optional)"
- [x] **Cheque details** (appears when Cheque selected):
    - [ ] Cheque Number: numeric field
    - [ ] Cheque Date: `DatePickerField` (can be post-dated)
    - [ ] Bank Name: text field (e.g. "SBI", "HDFC")
    - [ ] Automatically creates a cheque record in the Cheques register (P10.6)

#### Link Previous Outstanding section (shown when customer has Dr balance):

- [x] "Adjust against existing balance" toggle
- [x] When ON: outstanding amount applied against oldest invoice(s) automatically
- [x] Shows: "Applying ₹ X against INV-001 (₹ Y pending)"

### P4.5 Invoice Create — Preview & Save

- [ ] "Preview" button (if "Invoice preview" setting ON): renders full invoice PDF preview in a modal `WebView`; "Edit" and "Create" buttons at bottom of preview
- [ ] **"Create Invoice" button** (primary, full-width, 52dp):
    - [ ] On tap: `invoiceService.createInvoice(data)` → `create_invoice_v1` RPC
    - [ ] Button shows spinner while creating; disabled to prevent double-tap
    - [ ] On success: navigate to Invoice Detail screen; show "Invoice बन गई ✓" toast
    - [ ] On error: show error toast with specific message; keep user on step 3 to retry
- [ ] **Post-creation share sheet** (bottom sheet appears automatically on success):
    - [ ] "Share on WhatsApp" — GREEN prominent button; calls `pdfService.generateInvoicePDF()` then shares via `expo-sharing`
    - [ ] "Share PDF" — secondary button
    - [ ] "Print" — secondary button; opens system print dialog via `expo-print`
    - [ ] "Share as Image" — secondary button (shown when setting ON); generates JPG from PDF
    - [ ] "Close" — dismiss sheet without sharing (shows as plain text link)
    - [ ] WhatsApp message pre-filled: "Dear [Name] ji, your invoice [INV-XXX] of ₹ [amount] is attached. Thank you! — [BusinessName]" (Hindi when locale hi)

### P4.6 Invoice Detail Screen

**Route:** `/(app)/invoices/[id]`

- [ ] **Status banner** (full-width, coloured by status): PAID (green), PARTIAL (amber), UNPAID (red), OVERDUE (dark red — past due date), DRAFT (grey), VOID (grey strikethrough)
- [ ] **Invoice header card**:
    - [ ] Business logo + name at top
    - [ ] "Invoice" / "Tax Invoice" label (h1)
    - [ ] Invoice No. and Date side-by-side
    - [ ] Due Date (if set): "Due by DD MMM YYYY"; shown in red if overdue
- [ ] **Billed To card** (customer details):
    - [ ] Name, phone (tap to call), GSTIN if set, address
- [ ] **Line items table**:
    - [ ] Columns: Item Description, HSN, Qty, Rate, Discount, GST %, Amount
    - [ ] Each row: item name bold, batch/serial info (if tracked), free qty (if any)
    - [ ] Scroll horizontally on small screens (table is too wide for mobile)
- [ ] **Totals section**: Subtotal, Discount, Charges, GST breakdown, Round Off, **Grand Total** (amountLarge)
- [ ] **Amount in words**: "Rupees Five Thousand Three Hundred Ten Only" (shown when setting ON)
- [ ] **Payment History section** (collapsible):
    - [ ] Each payment: date, mode icon, amount, reference, "Received" label
    - [ ] "Total Received: ₹ X · Balance: ₹ Y"
    - [ ] "+ Record Payment" button inline (navigates to Payment-In pre-filled)
- [ ] **E-way Bill info** (if filled), **Transport info** (if filled) — shown in collapsible sections
- [ ] **Action bar** (sticky bottom):
    - [ ] "Share WhatsApp" (green, primary)
    - [ ] "Print" (secondary)
    - [ ] Kebab menu: Share PDF, Share as Image, Edit, Duplicate, Void/Cancel, Download PDF
- [ ] **Edit restrictions**: edit button disabled (shows tooltip reason) if:
    - [ ] Invoice has linked payments: "पहले payment delete करें"
    - [ ] Invoice date is in a locked period (GST return filed)
- [ ] **Void/Cancel**: `DestructiveButton` in kebab; `ConfirmationModal` with reason text field; on confirm: soft-delete invoice, restore all stock, reverse all payment links, reverse customer ledger entry

### P4.7 Invoice List Screen

**Route:** `/(app)/(tabs)/invoices`

- [ ] Summary card at top: "This month: ₹ X billed · ₹ Y collected · ₹ Z pending"
- [ ] `FilterBar`:
    - [ ] Date range chips: Today / This Week / This Month / This FY / Custom
    - [ ] Status: All / Paid / Partial / Unpaid / Overdue / Draft / Void
    - [ ] Party filter: "All Customers" → opens customer picker
- [ ] `SearchBar`: by invoice number or customer name
- [ ] Each list row (88dp):
    - [ ] Left: status colour dot (8dp circle)
    - [ ] Col 1: Invoice No. (bodyBold), Customer Name (body), Date (caption secondary)
    - [ ] Col 2: Grand Total (amountStyle, right-aligned), Balance Due (caption red if >0), Status badge
- [ ] Swipe-left: Share WhatsApp (green) · Edit (blue) · Delete (red)
- [ ] Draft invoices shown at top with grey "DRAFT" badge; tap → resumes draft wizard
- [ ] FAB "+ New Invoice" (also reachable from Sale tab)

### P4.8 Invoice PDF / Print Specifications

- [ ] **A4 layout** (210×297mm):
    - [ ] Header: logo (left, 60×60pt) + business name/address/GSTIN (right column)
    - [ ] "TAX INVOICE" or "INVOICE" large heading (sans-serif, 20pt)
    - [ ] Two-column section: left = Billed To (customer), right = Invoice Details (no., date, due date, PO no.)
    - [ ] Line items table: full width, alternating row shading
    - [ ] Totals table: right-aligned, breakdown of subtotal, GST, charges, round-off, grand total
    - [ ] HSN Summary table (when GST enabled)
    - [ ] Amount in words: italic below totals
    - [ ] E-way Bill / Transport info (if filled)
    - [ ] QR code for UPI payment: bottom-left, 60×60pt with "Scan to Pay" label
    - [ ] Footer: terms/notes text, signature box ("Authorised Signatory"), bank details for NEFT
    - [ ] "Original for Recipient" / "Duplicate for Supplier" / "Triplicate for Transporter" watermark (small, top-right)
- [ ] **Thermal 58mm layout**:
    - [ ] Width: 384px (58mm × ~96dpi — standard thermal paper)
    - [ ] Business name centred, bold
    - [ ] Address in 2 lines max
    - [ ] Phone + GSTIN
    - [ ] Dashed separator
    - [ ] "BILL" header
    - [ ] Bill No + Date
    - [ ] Customer name (if not cash sale)
    - [ ] Line items: `[Name]     ₹[Rate]×[Qty]     ₹[Amt]` — compact, no GST details
    - [ ] Subtotal, GST (single line: "GST 18%: ₹X"), Grand Total (bold, large)
    - [ ] Payment: "Paid ₹ X via Cash"
    - [ ] "Thank you! Come again." footer
    - [ ] QR for UPI
- [ ] **Thermal 80mm layout**: same as 58mm but 576px wide; slightly more room for item names
- [ ] **Image export** (JPG/PNG): uses `expo-print` to generate PDF then `react-native-view-shot` or canvas to produce image; 1080px wide, shareable to WhatsApp
- [ ] **Print copy selector**: bottom sheet before printing — "Original" / "Duplicate" / "Triplicate" — stamps the label on the print

---

## P5 — Payment-In (Receive Payment from Customer)

> **Prerequisite:** P4 (invoices created), P3 (customers with balances), P10 partially (bank accounts for linking — can wire without P10 complete if bank account list is empty-handled).
>
> **DB tables:** `payments` (direction='received'), `payment_invoice_links`, updates `invoices.payment_status` and customer ledger via RPC.

---

### P5.1 Receive Payment Screen

**Route:** `/(app)/finance/payments/receive` and accessible as quick action from Dashboard, Customer Detail, Invoice Detail

- [x] **Party Selection**:
    - [ ] `SearchBar` with label "किस customer से payment मिली?"
    - [ ] Results show: avatar, name, outstanding balance (large red Dr amount) per customer
    - [ ] Pre-filled when navigating from customer detail or invoice detail
    - [ ] Once selected: compact card shown (name, outstanding, phone tap-to-call)
- [x] **Date**: `DatePickerField`, default today; cannot be future date
- [x] **Amount** (`AmountInput`, large, required):
    - [ ] "Full Amount (₹ [outstanding])" quick-fill button — fills entire outstanding balance
    - [ ] When amount > outstanding: inline amber notice "₹ X will be recorded as advance payment"
    - [ ] When amount = 0: disabled Save button
- [x] **Payment Mode chips** (same 5 as invoice): Cash / UPI / Bank Transfer / Cheque / Card
- [x] **Bank Account selector** (for Bank Transfer / Cheque): picker from `bank_accounts`; shows account name + masked number
- [x] **UPI Reference** (for UPI): optional text field
- [x] **Cheque Details** (for Cheque):
    - [ ] Cheque Number
    - [ ] Bank Name
    - [ ] Cheque Date: `DatePickerField`
    - [ ] Saves to `cheques` table with status "Open"
- [x] **Notes** (optional): `TextAreaField`, e.g. "Received by Ramesh ji personally"
- [x] **Apply to Invoices section** (shown when setting "Link Payment to Invoices" is ON in P17.1):
    - [ ] Expandable section header: "Allocate to specific invoices ▼" with badge showing count of open invoices
    - [ ] Default: auto-allocate to oldest open invoices (FIFO) — shown as read-only allocations
    - [ ] "Manual allocation" toggle: when ON, shows checkboxes + editable amounts
    - [ ] Each open invoice row: Invoice No., Date, Total, Outstanding, Allocation Input (AmountInput, max = outstanding)
    - [ ] Total allocated must equal payment amount (real-time validation): "Unallocated: ₹ X"
    - [ ] Over-allocation error: red border on allocation inputs that sum > payment amount
- [x] **Save button** (primary, full-width):
    - [ ] Calls `paymentService.receivePayment(...)` → RPC `record_payment_v1` (atomic: payment row + links + invoice status update + customer ledger)
    - [ ] On success: navigate to Payment Receipt screen → then back to wherever we came from
    - [ ] On error: toast with reason

### P5.2 Payment Receipt Screen

**Route:** `/(app)/finance/payments/[id]/receipt`

- [ ] **Receipt layout** (styled like a printed receipt):
    - [ ] Business logo + name at top
    - [ ] "RECEIPT" heading (h1)
    - [ ] Receipt number (auto-generated: "REC-001")
    - [ ] Date and time
    - [ ] "Received from: [Customer Name]" + phone
    - [ ] Amount in large: "₹ [Amount]" (amountLarge, terracotta)
    - [ ] "Amount in Words: [amountInWords]"
    - [ ] Payment mode: "Paid via [Mode]" + reference if any
    - [ ] "Against: INV-042 (₹ X), INV-038 (₹ Y)" (if linked to invoices)
    - [ ] Remaining balance: "New Balance: ₹ Z (Dr/Cr)"
    - [ ] "Thank You for your payment!" footer
- [ ] **Action buttons** below receipt:
    - [ ] "Share on WhatsApp" (primary, green, prominent) — generates PDF and shares
    - [ ] "Print" (secondary) — system print
    - [ ] "Share PDF" (secondary)
    - [ ] "Done" (text link) — navigates back

### P5.3 Payment-In Detail Screen

**Route:** `/(app)/finance/payments/[id]`

- [ ] Shows all payment details: date, customer, amount, mode, reference, cheque details if cheque
- [ ] "Allocated to invoices" section: list of linked invoices with amounts allocated per invoice
- [ ] "Advance payment" indicator if not fully allocated
- [ ] Edit: only allowed if no linked invoices (fully unallocated payments)
- [ ] Delete: `ConfirmationModal` "Deleting this payment will revert the invoice status to unpaid and restore the balance. Proceed?"; calls RPC to reverse all effects
- [ ] Share Receipt button

### P5.4 Payment-In List Screen

**Route:** `/(app)/finance/payments` (tab within Finance module)

- [x] `FilterBar`: date range / customer / payment mode / linked-to-invoice status
- [x] Summary card: "Received this month: ₹ X (Cash: ₹ Y · UPI: ₹ Z · Cheque: ₹ W)"
- [x] Each row (72dp):
    - [ ] Payment mode icon (left, coloured: green=cash, blue=UPI, orange=cheque)
    - [ ] Customer name (bodyBold), date (caption)
    - [ ] Amount (amountStyle, green)
    - [ ] Linked invoices count badge
- [x] Swipe-left: Delete (with confirmation)
- [x] Tap → Payment Detail screen

---

## P6 — Purchase Bill

> **Prerequisite:** P2 (items with purchase prices), P3 (suppliers), P1 (business profile).
> **Existing:** Purchase list screen exists; **no create flow exists** — built from scratch here.
>
> **DB tables:** `purchases`, `purchase_line_items`, `stock_operations` (type='purchase_in')

---

### P6.1 Purchase Bill Create Screen

**Route:** `/(app)/finance/purchases/create`

- [x] **Screen Header**: "New Purchase Bill" / "नई खरीद" with × close (draft save same as invoice)
- [x] Single scroll view (no steps — purchase entry is simpler than sale; most Indian shopkeepers prefer one-page entry)
- [x] **Supplier section**:
    - [ ] Supplier search (same pattern as customer in invoice)
    - [ ] "Add new supplier" inline
    - [ ] When selected: compact card (name, phone, outstanding payable)
- [x] **Bill Reference section**:
    - [ ] Bill Number: text field labelled "Supplier's Bill No." / "आपूर्तिकर्ता का bill नंबर" (required — this is the physical bill you received)
    - [ ] Bill Date: `DatePickerField` (date on the physical bill — may differ from today)
    - [ ] Our Reference Number (optional): auto-generated "PUR-0012" sequence for internal tracking
    - [ ] Due Date (optional): `DatePickerField`
- [x] **Line Items section**: identical to invoice step 2 (P4.3) with differences:
    - [ ] Default price used: `purchase_price` not `sale_price`
    - [ ] Column label: "Purchase Rate" not "Sale Rate"
    - [ ] GST here = input tax credit (ITC eligible)
    - [ ] Stock increases on save (not decreases)
    - [ ] For batch-tracked items: batch creation form shown inline (new batch number, mfg date, expiry date)
    - [ ] For serial-tracked items: serial numbers entry (multi-scan)
- [x] **Additional Charges section** (same as invoice)
- [x] **Totals Summary**: Subtotal + Input GST (ITC) + Charges = **Total Payable** (amountLarge)
- [x] **"Attach Bill Photo" section**:
    - [ ] Camera / Gallery button
    - [ ] Up to 3 photos
    - [ ] Photos uploaded to Supabase Storage `purchase-bills/[id]/[n].jpg`
    - [ ] Thumbnail previews shown with × to remove
    - [ ] Helper: "Original bill की photo रखें — GST audit में काम आएगी"
- [x] **Payment section** (same structure as invoice):
    - [ ] Amount, mode, bank account, reference
    - [ ] "Full Payment" / "Credit / No Payment" chips
    - [ ] Split payment option
- [x] **Notes**: `TextAreaField`
- [x] **Save button**: calls `purchaseService.createBill()` RPC; on success: navigate to Purchase Bill Detail; toast "Purchase bill save हो गया ✓"
- [x] Draft save on × / back press

### P6.2 Purchase Bill Detail Screen

**Route:** `/(app)/finance/purchases/[id]`

- [ ] Status banner: PAID / PARTIAL / UNPAID (same colour coding as invoices)
- [ ] Bill header: Bill No. (supplier's), Date, Our Ref No., Supplier Name
- [ ] Line items: item, HSN, qty, batch/serial, purchase rate, GST (ITC), amount
- [ ] GST breakdown: "Input Tax Credit (ITC): CGST ₹ X + SGST ₹ X = ₹ Y" — highlighted green (this reduces our GST liability)
- [ ] Totals section
- [ ] Attached bill photos: thumbnails; tap to view full screen
- [ ] Payment history
- [ ] Action bar: Record Payment · Edit · Kebab (Share, Duplicate, Delete)
- [ ] Edit restrictions: same as invoice (cannot edit if payments linked or locked period)

### P6.3 Purchase Bill List Screen

**Route:** `/(app)/finance/purchases`

- [x] Summary card: "This month: ₹ X purchased · ₹ Y paid · ₹ Z to pay · ITC ₹ W"
- [x] `FilterBar`: date range / supplier / status (Paid/Partial/Unpaid) / ITC eligible
- [x] Each row: Bill No. (supplier's) + Our Ref, Supplier, Date, Total, Outstanding, Status badge
- [x] Swipe-left: Edit · Delete
- [x] FAB "+ New Purchase"

---

## P7 — Payment-Out (Pay Supplier)

> **Prerequisite:** P6 (purchase bills creating payables), P3 (suppliers), P10 (bank accounts).

---

### P7.1 Make Payment Screen

**Route:** `/(app)/finance/payments/make`
Identical structure to P5.1 (Receive Payment) with these differences:

- [x] Label: "किस supplier को payment की?" / "Who did you pay?"
- [x] Shows payable (To Pay) balance of supplier in red
- [x] "Pay Full Outstanding" quick-fill button
- [x] Allocate to purchase bills (not invoices) — same FIFO logic
- [x] Cash account debited (or bank account debited) instead of credited
- [x] Cheque created in "issued" direction (to supplier)

### P7.2 Payment-Out List Screen

**Route:** Within Finance payments tab, filter Direction = "made"

- [ ] Summary: "Paid this month: ₹ X"
- [ ] Each row: mode icon, supplier name, date, amount (red), linked bill count

### P7.3 Payment Receipt (Paid to Supplier)

- [ ] Same receipt layout as P5.2 but labelled "PAYMENT VOUCHER" / "भुगतान पर्ची"
- [ ] "Paid to: [Supplier Name]"
- [ ] Share via WhatsApp (useful when emailing payment proof to supplier)

---

## P8 — Business Dashboard

> **Prerequisite:** P4–P7 fully functional so every transaction type feeds dashboard data.
> **Goal:** Owner opens app → within 5 seconds knows: cash in hand, who owes them, who they owe, today's business, profit this month.
>
> **DB:** Dashboard stats served by Supabase RPC `get_dashboard_stats_v2` returning all metrics in one round-trip.

---

### P8.1 Dashboard Header

- [ ] Safe-area aware, terracotta background
- [ ] Left: business logo (32dp circle, white border) OR business initial letter avatar
- [ ] Centre: greeting text (h3, white): "नमस्ते, [OwnerName] जी 🙏" (hi) / "Good morning, [OwnerName]" (en)
- [ ] Sub-greeting: current date in full — "मंगलवार, 8 अप्रैल 2025" (hi) / "Tuesday, 8 April 2025" (en)
- [ ] Right: notification bell icon with unread badge count; sync indicator (cloud icon)
- [ ] Below header: thin financial year bar — "FY 2024-25 · Apr – Mar" in small caption

### P8.2 Primary Stats Row (horizontal scroll on small screens)

Four stat cards in a row (each card: 120×90dp minimum):

- [ ] **Cash in Hand**: current cash balance (amountLarge, white text on terracotta); label "नकद" / "Cash"; tap → Cash Ledger screen (P10.1)
- [ ] **Bank Balance**: sum of all bank accounts (amountLarge); sub-label count "3 accounts"; tap → Bank Accounts list (P10.2)
- [ ] **To Receive**: total customer outstanding (amountLarge, red); sub-label "X customers"; tap → Aged Receivables list (filtered All Parties Report)
- [ ] **To Pay**: total supplier payable (amountLarge, red); sub-label "X suppliers"; tap → Payables list
- [ ] Each card: white shadow, rounded 16dp, tap has `TouchableCard` press animation

### P8.3 Today's Business Row (2 tiles side-by-side)

- [ ] **Today's Sale**: total sale amount + invoice count for today; "₹ X (Y invoices)"; tap → Invoice list filtered to Today; `↑ Y% vs yesterday` trend label
- [ ] **Today's Collection**: cash/payment received today; tap → Payment-In list filtered to Today

### P8.4 This Month Summary Section

- [ ] **Monthly Sale card**: ₹ X this month vs ₹ Y last month; trend arrow; bar chart (7-day sparkline)
- [ ] **Monthly Purchase card**: ₹ X this month
- [ ] **Net Profit card**: Sale − Purchase − Expense = ₹ X; green if positive, red if negative
- [ ] Profit card taps → P&L Report for current month

### P8.5 Alerts Section

- [x] Section header: "Alerts" / "सूचनाएं" with count badge
- [x] Shown only when at least one alert exists (otherwise section hidden):
    - [ ] **Low Stock**: "X items कम stock में हैं" (red icon) — tap → Low Stock Report (P14.4)
    - [ ] **Expiring Items**: "X items अगले 30 दिन में expire होंगे" (orange icon) — tap → Expiring Batches list (P14.9)
    - [ ] **Overdue Invoices**: "X invoices overdue — ₹ Y" (red icon) — tap → Invoice list filtered to Overdue
    - [ ] **Cheques Due**: "X cheques इस हफ्ते जमा करने हैं" (blue icon) — tap → Cheques list (P10.6)
    - [ ] **Loan EMI Due**: "EMI of ₹ X due on DD MMM" (yellow icon) — tap → Loan Detail (P19)
- [x] Each alert row: icon (left), description, amount/count (right), chevron arrow

### P8.6 Quick Actions Grid

- [x] 3-column grid of action buttons (each: icon 32dp + label below, card style, 80×80dp)
- [x] Actions (always visible, no overflow):
    - [ ] **New Sale** (invoice icon, terracotta background — primary emphasis)
    - [ ] **Receive Payment** (cash icon)
    - [ ] **New Purchase** (cart icon)
    - [ ] **Add Expense** (receipt icon)
    - [ ] **New Item** (box icon)
    - [ ] **New Party** (person icon)
- [x] "More →" link at bottom right → navigates to "More" tab

### P8.7 Recent Transactions Feed

- [ ] Section header: "Recent Activity" / "हाल की activity" + "View All" link (→ All Transactions report)
- [ ] Last 10 transactions, newest first
- [ ] Each row (56dp):
    - [ ] Left: coloured icon circle (sale=green, purchase=red, payment-in=teal, payment-out=orange, expense=purple)
    - [ ] Middle: party name (body) or "Cash Sale", transaction type (caption secondary)
    - [ ] Right: amount (amount variant, green=in, red=out), time (caption secondary, e.g. "2:30 PM" or "Yesterday")
- [ ] Tap row: navigates to relevant detail screen

### P8.8 Dashboard Behaviour

- [ ] Initial load: shows skeleton for each section while RPC fetches
- [ ] Pull-to-refresh: triggers background RPC refetch; replaces data without flash
- [ ] `useRefreshOnFocus`: dashboard refreshes every time it regains focus (navigating back from any screen)
- [ ] If business profile is incomplete (no GSTIN, no logo etc.): shows amber card "Complete your profile" with "Setup →" link
- [ ] Realtime subscription (when `useNetworkStatus().isConnected`): Supabase Realtime channel on `invoices` table — when new invoice created on another device, dashboard auto-refreshes

---

## P9 — Expense & Other Income

> **Prerequisite:** P1 (business profile), P10 (for cash/bank account linking — P9 partially works without bank accounts if only cash mode used).
>
> **DB tables:** `expenses`, `expense_categories`, `other_income`, `income_categories`

---

### P9.1 Expense List Screen

**Route:** `/(app)/finance/expenses`

- [x] Summary card: "Total spent [period]: ₹ X" with breakdown: "Rent ₹ A · Transport ₹ B · Other ₹ C"
- [x] `FilterBar`: date range / category / payment mode
- [x] Each row (72dp): date (caption left), category icon + colour dot, description (body), amount (red amountStyle right), mode icon
- [x] Sort: by date (default) / by amount
- [x] Swipe-left: Edit · Delete (with confirmation "यह expense delete होगी")
- [x] FAB "+ Expense"
- [x] Empty state: "अभी तक कोई expense नहीं जोड़ी" / "No expenses added yet"
- [x] Monthly total visible in summary card even when filtered to specific category

### P9.2 Add / Edit Expense Screen

**Route:** `/(app)/finance/expenses/add` and `/edit/[id]`

- [x] **Date**: `DatePickerField`, default today
- [x] **Amount** (`AmountInput`, required, > 0)
- [x] **Category** (`BottomSheetPicker`, required):
    - [ ] Default categories pre-seeded: Rent/किराया, Transport/परिवहन, Labour/मजदूरी, Utilities/बिजली-पानी, Packaging/पैकेजिंग, Maintenance/मरम्मत, Advertisement/विज्ञापन, Miscellaneous/विविध
    - [ ] "+ Add category" inline
- [x] **Payment Mode**: Cash / UPI / Bank Transfer / Cheque / Card chips
- [x] **Bank Account** (for non-cash modes): account picker
- [x] **Reference Number** (optional): UPI UTR, bank reference, cheque number
- [x] **Description / Notes** (`TextAreaField`, optional): up to 200 chars
- [x] **Paid To** (optional): party name (not linked to party master — free text) e.g. "Electricity Board", "Driver Ramesh"
- [x] **GST on Expense** toggle (shown when GST enabled):
    - [ ] When ON: shows GST rate picker + "Vendor GSTIN" field
    - [ ] Vendor GSTIN validated if entered
    - [ ] ITC eligible toggle: "क्या यह ITC के योग्य है?" (not all expenses qualify for ITC)
    - [ ] Computed: "Input Tax Credit: ₹ X (if ITC eligible)"
- [x] **Attach Receipt** button: camera/gallery, up to 2 photos, uploaded to Supabase Storage
- [x] **Save**: deducts from cash/bank balance; shows in expense list; fires `expense:created` event
- [x] **Error**: if bank account selected but no accounts configured: "Please add a bank account first" with "Add Bank" link

### P9.3 Expense Categories Management

**Route:** `/(app)/settings/expense-categories`
Identical structure to P2.9 (Item Categories) with expense-specific defaults.

- [ ] Categories list: name, icon, colour, total spent this month (from live aggregate)
- [ ] Add / edit categories: Hindi + English name, colour, icon/emoji
- [ ] Delete: only if no expense entries (else show count and ask to reassign)
- [ ] Reorder by drag

### P9.4 Other Income List Screen

**Route:** `/(app)/finance/other-income`

- [ ] Header label: "Other Income / अन्य आय" — differentiates from sale income
- [ ] Identical structure to Expense List but:
    - [ ] Amounts shown in green
    - [ ] FAB "+ Income"
    - [ ] Summary: "Total received [period]: ₹ X"
    - [ ] Empty state: "अभी तक कोई other income record नहीं है"

### P9.5 Add / Edit Other Income Screen

Same fields as Expense (P9.2) with these differences:

- [ ] Label: "Received From" (not "Paid To")
- [ ] No GST toggle for income (income is not input credit eligible — separate treatment)
- [ ] Income categories: Interest / Commission / Rent Received / Dividend / Miscellaneous + custom

### P9.6 Other Income Categories Management

Identical to Expense Categories (P9.3), separate `income_categories` table.

---

## P10 — Cash, Bank, E-wallet & Cheque Management

> **Prerequisite:** P4–P9 (transactions must exist before accounts show meaningful balances).
>
> **DB tables:** `cash_accounts`, `bank_accounts`, `ewallet_accounts`, `fund_transfers`, `cheques`

---

### P10.1 Cash in Hand Screen

**Route:** `/(app)/finance/cash`

- [x] Large balance display at top: "Cash in Hand" (h2), ₹ X (display variant, large)
- [x] Trend: "↑ ₹ X more than last week" or "↓ less"
- [x] Opening balance entry card (shown if not yet set): "Set opening cash balance to start tracking" — `AmountInput` + date + Save button
- [x] Date range filter (default: current month)
- [x] Transaction list — all cash transactions in period:
    - [x] Cash in rows (green): date, type icon, description/party, +₹ amount, running balance
    - [x] Cash out rows (red): date, type icon, description, −₹ amount, running balance
    - [x] Running balance column (rightmost, always current)
- [x] Summary footer: "Cash received: ₹ X · Cash paid: ₹ Y · Net: ₹ Z"
- [x] "Adjust Opening Balance" link: allows editing opening balance (with warning about impact on all calculations)

### P10.2 Bank Accounts List Screen

**Route:** `/(app)/finance/bank-accounts`

- [x] Summary card: "Total in banks: ₹ X" (sum of all account balances)
- [x] Each account card (80dp):
    - [x] Bank name + account type (Savings/Current)
    - [x] Account number masked: "XXXXXXXXXX1234"
    - [x] Current balance (amountStyle) — green if positive
    - [x] "Primary" badge if set as primary account
- [x] "Add Bank Account" button (prominent)
- [x] Tap account card → Bank Account Ledger (P10.3)
- [x] Long press account card → "Set as Primary" / "Edit" / "Deactivate" menu

### P10.3 Add / Edit Bank Account

- [x] Bank Name: `BottomSheetPicker` with major Indian banks:
    - [x] SBI, HDFC, ICICI, Axis, Kotak, PNB, BOB, Canara, Union, Indian, UCO, BOI, Syndicate, Allahabad, Central, Dena, Vijaya, Corporation, IDBI, Yes Bank, IndusInd, RBL, IDFC, Federal, South Indian, Karur Vysya, City Union, Lakshmi Vilas, DCB, Other
- [x] Account Number: numeric, 9–18 digits
- [x] IFSC Code: 11-char uppercase (bank + branch); "Verify IFSC" button — calls public API to verify and show bank/branch details
- [x] Account Type: Savings / Current / Overdraft / Cash Credit
- [x] Account Holder Name: text field
- [x] Branch Name: text field (optional)
- [x] Opening Balance: `AmountInput` + date
- [x] "Set as Primary Account": toggle (only one primary allowed; toggling ON deactivates previous primary)
- [x] Save button

### P10.4 Bank Account Ledger Screen

**Route:** `/(app)/finance/bank-accounts/[id]`

- [x] Account header: bank name, masked account number, current balance (amountLarge)
- [x] Date range filter: default current month; navigates months with ← →
- [x] Opening balance row (of period)
- [x] Transaction list: date, description/party, Debit (out), Credit (in), Balance
- [x] Totals bar: "Total In: ₹ X · Total Out: ₹ Y"
- [x] "Bank Statement" export button: PDF/Excel — navigates to Bank Statement Report (P15.1)
- [x] "Reconcile" button (advanced): mark transactions as reconciled with physical bank statement

### P10.5 E-wallet Accounts

**Route:** `/(app)/finance/ewallets`

- [x] List: PhonePe / GPay / Paytm / Razorpay / custom
- [x] Each wallet: name, type icon (colour-coded), current balance
- [x] Add e-wallet: type picker, wallet name (or mobile number linked), opening balance
- [x] Ledger same as bank account (P10.4)
- [x] All UPI transactions can be linked to a specific e-wallet account

### P10.6 Fund Transfer Between Accounts

**Route:** `/(app)/finance/transfer`

- [x] "From Account" picker: shows all accounts (Cash + Banks + Wallets) with balances
- [x] "To Account" picker: same list; cannot select same account as From
- [x] Transfer Amount: `AmountInput`
- [x] Date: `DatePickerField`
- [x] Notes (optional): e.g., "Cash deposited to HDFC"
- [x] "Transfer ₹ X from [From] to [To]" confirmation preview before save
- [x] Save: creates debit on "from" account + credit on "to" account; both appear in respective ledgers
- [x] Transfers list: date, from, to, amount — accessible from each account's ledger

### P10.7 Cheques Received (from Customers)

**Route:** `/(app)/finance/cheques` (tab: Received)

- [x] List with status filter: All / Open / Deposited / Bounced
- [x] Each row (72dp): party name, cheque no. (caption), bank name, cheque date, amount, status badge
- [x] Colour coding: Open (amber), Deposited (green), Bounced (red)
- [x] **Alerts**: cheques with date within 3 days → prominent amber banner "⚠ 2 cheques due to deposit soon" at list top
- [x] Swipe-left: "Mark Deposited" (green) · "Mark Bounced" (red) · Delete
- [x] **Mark Deposited action**:
    - [x] Modal: "Deposit date", "Credited to bank account" (bank picker)
    - [x] Confirm: updates cheque status; creates credit in bank account ledger; creates debit from "cheques receivable" account
- [x] **Mark Bounced action**:
    - [x] Modal: "Reason" (Insufficient Funds / Signature Mismatch / Account Closed / Other), "Bank charges incurred" (optional amount)
    - [x] Confirm: updates cheque status; reverses the original payment from customer (outstanding restored); creates expense for bank charges if entered; creates notification
- [x] **Add Cheque manually** (when cheque received not during invoice payment):
    - [x] Party picker, amount, cheque no., bank, cheque date
    - [x] Option to link to specific invoices

### P10.8 Cheques Issued (to Suppliers)

**Route:** `/(app)/finance/cheques` (tab: Issued)

Same structure as received cheques but:

- [x] Directions reversed: Deposited = supplier deposited our cheque (bank account debited)
- [x] Bounced: our cheque bounced (adds back to our payable; notify supplier)
- [x] List shows cheques we've given to suppliers

---

## P11 — Transaction Reports

> **Prerequisite:** P4–P10 (all transaction types operational).
> **UX contract for all reports:** Date range selector always at top. Export (PDF) and Export (Excel) buttons always visible. Share on WhatsApp button always present. Every number tappable to drill down.
>
> **DB:** All reports use Supabase RPCs or views. No reports computed client-side (too slow for large datasets).

---

### P11.1 Sale Report

**Route:** `/(app)/reports/sale`

**Filters (shown in `FilterBar` + expandable "More Filters" sheet):**

- [x] Date range: Today / This Week / This Month / This Quarter / This FY / Custom (with `DatePickerField` from–to)
- [x] Customer: "All Customers" (default) → customer picker (multi-select)
- [x] Item: "All Items" → item picker
- [x] Payment Mode: All / Cash / UPI / Bank Transfer / Cheque / Credit
- [x] Status: All / Paid / Partial / Unpaid / Overdue
- [x] Invoice type: All / Tax Invoice / Cash Sale
- [x] Created by user (when multi-user enabled): All / picker of users

**Summary Section (cards at top, always visible):**

- [x] Total Invoices: count (tappable → invoice list with same filters)
- [x] Total Sale Amount: ₹ X
- [x] Total GST: ₹ X (breakdown: CGST ₹ A + SGST ₹ B or IGST ₹ C)
- [x] Total Discount: ₹ X
- [x] Amount Collected: ₹ X (payments received against these invoices)
- [x] Outstanding Balance: ₹ X (red)
- [x] Net (after GST): taxable value ₹ X

**Table (scrollable horizontally on mobile, full-width on tablet/desktop):**

- [x] Columns: Date, Invoice No., Customer Name, Items (count), Taxable Amount, GST Amount, Discount, Total Amount, Paid, Balance, Status
- [x] Column headers: sortable by tap (Date ASC/DESC, Amount ASC/DESC)
- [x] Each row tap → Invoice Detail screen
- [x] "Total" row at bottom (sum of all numeric columns)

**Export:**

- [x] "Export PDF": generates paginated PDF with business header, filter description, summary, full table; all amounts formatted correctly
- [x] "Export Excel (.xlsx)": one row per invoice with all columns; summary in first row; filter description in header row
- [x] "Share on WhatsApp": generates a summary image (totals card + top 5 customers by value) shareable as WhatsApp Status or message

### P11.2 Purchase Report

**Route:** `/(app)/reports/purchase`

Identical structure to Sale Report (P11.1) with these differences:

**Filters:**

- [x] Supplier instead of Customer
- [x] Bill Status: Paid / Partial / Unpaid
- [x] ITC Eligible filter: Yes / No

**Summary Section:**

- [x] Total Bills, Total Purchase Amount, Total Input GST (ITC), Amount Paid, Outstanding Payable (red)
- [x] ITC Availed: ₹ X (the total input tax credit from all purchases in the period)

**Table Columns:** Date, Bill No. (Supplier's), Our Ref No., Supplier, Items Count, Taxable Amount, Input GST, Total Amount, Paid, Balance, Status

### P11.3 Day Book

**Route:** `/(app)/reports/day-book`

- [x] **Date picker** at top: single day, default today; ← → navigation arrows for previous/next day
- [x] "Jump to date" icon: opens calendar modal
- [x] **Two-column layout** (side-by-side on tablet; stacked on phone):
    - [x] **Left column: "Received" / "आय"** (inflows):
        - [x] Sale invoices (cash paid portion)
        - [x] Payment-In receipts
        - [x] Other Income entries
        - [x] Each row: time (if available), description, reference no., ₹ amount (green)
        - [x] "Total Received: ₹ X" at bottom of column
    - [x] **Right column: "Paid" / "व्यय"** (outflows):
        - [x] Purchase bills (cash paid portion)
        - [x] Payment-Out entries
        - [x] Expense entries
        - [x] Each row: time, description, reference no., ₹ amount (red)
        - [x] "Total Paid: ₹ X" at bottom
- [x] **Balance section** (below both columns):
    - [x] Opening Cash Balance: ₹ X (balance at start of day)
    - [x]   - Total Received: ₹ X
    - [x] − Total Paid: ₹ X
    - [x] = **Closing Cash Balance: ₹ X** (bold, large)
- [x] Tap any transaction row → detail screen
- [x] Export: "Print Day Book" → generates a traditional-style daily register PDF (landscape, two-column)

### P11.4 All Transactions Report

**Route:** `/(app)/reports/all-transactions`

- [x] **Type filter chips** (horizontal scroll): All / Sale / Purchase / Payment In / Payment Out / Expense / Other Income / Credit Note / Debit Note / Journal (fund transfers)
- [x] **Date range filter**
- [x] **Search**: by party name or reference number
- [x] Each row (64dp):
    - [x] Left: type icon in coloured circle (sale=green, purchase=red, expense=purple, payment-in=teal, payment-out=orange)
    - [x] Middle: reference no. (bodyBold), party/description (body), date (caption)
    - [x] Right: amount; green prefix (+) for in, red prefix (−) for out
    - [x] "Running Balance" column (optional toggle in header): shows cumulative balance
- [x] **Summary bar**: total in ₹ X vs total out ₹ X → net ₹ X
- [x] Tap row → respective detail screen
- [x] Export PDF/Excel

### P11.5 Bill-wise Profit Report

**Route:** `/(app)/reports/bill-profit`

> Shows profit (or loss) per sale invoice by comparing sale amount against cost of items sold.

- [x] **Filters**: date range, customer, item category; sort by Profit % (descending by default — most profitable first)
- [x] **Summary section**:
    - [x] Total Sale Amount: ₹ X
    - [x] Total Cost of Goods Sold (COGS): ₹ X (based on purchase prices of items sold)
    - [x] **Gross Profit: ₹ X (Y%)** — amountLarge, green or red
    - [x] Average Margin: Z%
- [x] **Table columns**: Date, Invoice No., Customer Name, Sale Amount (excl. GST), COGS, Gross Profit, Profit %
- [x] Profit % column: green if positive, red if negative (loss)
- [x] COGS calculation: uses the purchase price recorded on the item at time of sale (or weighted average if purchase prices varied)
- [x] "Items with no purchase price set": warning card at top if any items are missing purchase price — "These items are excluded from profit calculation"
- [x] Tap invoice row → Invoice Detail
- [x] Export PDF/Excel

### P11.6 Profit & Loss Report

**Route:** `/(app)/reports/profit-loss`

> The Indian shopkeeper's P&L — simple income-minus-expenses, not accrual accounting.

- [x] **Period selector** (prominent at top): Monthly (← → month navigation) / Quarterly / Half-Yearly / Full FY / Custom date range
- [x] **Revenue Section**:
    - [x] Sale Revenue (net of returns): ₹ X
    - [x] Other Income: ₹ X (from income entries)
    - [x] **Gross Revenue: ₹ X** (bold, amountLarge)
- [x] **Cost of Goods Sold Section**:
    - [x] Opening Stock Value: ₹ X
    - [x]   - Purchases (net of returns): ₹ X
    - [x] − Closing Stock Value: ₹ X
    - [x] = **COGS: ₹ X** (bold)
    - [x] **Gross Profit: ₹ X (Y%)** — highlighted card, green/red
- [x] **Expenses Section**:
    - [x] Each expense category on its own line: "Rent: ₹ X", "Transport: ₹ X", etc.
    - [x] **Total Expenses: ₹ X** (bold)
- [x] **Net Profit / Loss Section**:
    - [x] Gross Profit: ₹ X
    - [x] − Total Expenses: ₹ X
    - [x] = **Net Profit / Net Loss: ₹ X** — giant number, green if profit, red if loss
    - [x] Net Margin: Y% (small caption below)
- [x] **Month-over-Month Chart** (when Monthly view selected): simple bar chart, 6 bars (last 6 months), each bar split into revenue (full height) vs profit (hatched top portion)
    - [x] Tap bar → drill to that month's P&L
- [x] Export PDF (formatted as a financial statement, suitable for bank/CA submission)
- [x] Export Excel (with all line items for CA review)
- [x] "Share on WhatsApp" — generates summary image card

### P11.7 Cashflow Report

**Route:** `/(app)/reports/cashflow`

> Shows actual cash movement — money that physically came in and went out (not accrual).

- [x] **Period**: Monthly (← → navigation); This Month default
- [x] **Opening Balance** (cash + bank combined at start of period): ₹ X
- [x] **Inflows section**:
    - [x] Sale Collections (payments received from customers): ₹ X
    - [x] Other Income: ₹ X
    - [x] Loans Received: ₹ X
    - [x] Fund Transfers In: ₹ X
    - [x] **Total Inflows: ₹ X** (green bold)
- [x] **Outflows section**:
    - [x] Payments Made to Suppliers: ₹ X
    - [x] Expenses: ₹ X (broken by category)
    - [x] Loan Repayments (EMI principal): ₹ X
    - [x] Fund Transfers Out: ₹ X
    - [x] **Total Outflows: ₹ X** (red bold)
- [x] **Net Cashflow: ₹ X** (positive=green, negative=red)
- [x] **Closing Balance: ₹ X** = Opening + Net Cashflow
- [x] **Weekly Bar Chart**: 4–5 bars (one per week in the month), each split: inflow (green) vs outflow (red)
    - [x] Tap bar → day-level drill for that week
- [x] Export PDF/Excel

### P11.8 Balance Sheet

**Route:** `/(app)/reports/balance-sheet`

> Simplified balance sheet suitable for Indian SME / bank loan application.

- [x] **As-on-date picker**: default last day of current month; navigates by month
- [x] **ASSETS section**:
    - [x] **Current Assets**:
        - [x] Cash in Hand: ₹ X (tap → cash ledger)
        - [x] Bank Balances: ₹ X (tap → bank accounts list with individual balances)
        - [x] Trade Receivables (Debtors): ₹ X (tap → All Parties report filtered to customers with balance)
        - [x] Stock Value: ₹ X (tap → Stock Summary Report)
        - [x] Loans Given (if any): ₹ X
    - [x] **Fixed Assets** (manual entry section):
        - [x] Each row: asset name, purchase value, current book value
        - [x] "+ Add Fixed Asset" button (simple form: name, purchase date, purchase price)
    - [x] **Total Assets: ₹ X** (bold, amountLarge)
- [x] **LIABILITIES section**:
    - [x] **Current Liabilities**:
        - [x] Trade Payables (Creditors): ₹ X (tap → All Parties report filtered to suppliers with balance)
        - [x] GST Payable: ₹ X (output GST − input GST; tap → Tax Report)
        - [x] Loans Outstanding: ₹ X (tap → Loans list)
        - [x] Outstanding Expenses (accrued): ₹ X
    - [x] **Total Liabilities: ₹ X** (bold)
- [x] **CAPITAL section**:
    - [x] Opening Capital: ₹ X (carried from last FY or entered manually)
    - [x]   - Net Profit (Current FY): ₹ X
    - [x] − Drawings: ₹ X (manual entry)
    - [x] **Total Capital: ₹ X** (bold)
- [x] **Balance Check**: Assets = Liabilities + Capital — shows ✓ (green) if balanced, ✕ (red with difference amount) if not
- [x] Export PDF (formal balance sheet format, suitable for bank submission)

---

## P12 — Party Reports

> **Prerequisite:** P3 (parties), P4–P7 (transactions creating party balances).

---

### P12.1 Party Statement

**Route:** `/(app)/reports/party-statement`

- [ ] **Party Selector** at top: large `BottomSheetPicker` — lists all customers + suppliers with outstanding balance sorted first
    - [ ] Tabs: Customers / Suppliers / All
    - [ ] Shows party name + outstanding balance in picker list
- [ ] **Date Range filter**: default current FY
- [ ] **Statement body** (scrollable):
    - [ ] Business header: logo, name, address, GSTIN (for printed version)
    - [ ] Party header: name, address, GSTIN, phone
    - [ ] Statement period label: "Statement for April 2024 – March 2025"
    - [ ] **Opening Balance row** (shaded grey):
        - [ ] Date: [start of period]
        - [ ] Description: "Opening Balance"
        - [ ] Dr/Cr amount as appropriate
        - [ ] Running Balance: ₹ X Dr / ₹ X Cr
    - [ ] **Transaction rows** (chronological):
        - [ ] Date, Description (e.g. "Invoice INV-042", "Payment Received", "Credit Note CN-003"), Reference No., Debit (₹ — amount we charged or they owe us more), Credit (₹ — amount they paid or we reduced their balance), Running Balance
        - [ ] Transaction type colour-coding: invoices=default, payments=green row, credit notes=amber row
    - [ ] **Closing Balance row** (bold, highlighted):
        - [ ] "Closing Balance as on [end date]"
        - [ ] **₹ X Dr** (they owe us) or **₹ X Cr** (we owe them / advance)
- [ ] **Summary cards** below statement:
    - [ ] Total Invoiced: ₹ X | Total Received: ₹ X | **Net Outstanding: ₹ X**
- [ ] **Action buttons**:
    - [ ] "Share Statement on WhatsApp" (primary): generates PDF → WhatsApp pre-filled message "Dear [Name] ji, please find your account statement attached. Outstanding balance: ₹ X Dr. Please arrange payment. — [BusinessName]"
    - [ ] "Send Reminder" (shown when balance > 0): navigates to payment reminder compose screen (P18.5)
    - [ ] "Print" / "Share PDF"
    - [ ] "Export Excel"

### P12.2 Party-wise Profit & Loss

**Route:** `/(app)/reports/party-profit`

- [ ] **Mode toggle**: "Customers" (profit from each customer's sales) / "Suppliers" (cost per supplier)
- [ ] **Date range** filter
- [ ] **Sort**: by Profit Amount (desc default) / by Profit % / by Sale Amount / A-Z
- [ ] **Table (Customers mode)**:
    - [ ] Party Name, Total Sale (excl. GST), Total COGS (purchase price of items sold to them), Gr### P13.2 GSTR-1 (Outward Supplies Statement)

**Route:** `/(app)/reports/gstr1`

**Header:**

- [x] **Period selector**: Month + Year picker (combo); shows filing deadline: "Due: 11 May 2025"
- [x] GSTIN display: "Filing for: [businessGSTIN]"
- [x] Status indicator: "Not Filed" / "Pending" / "Filed" badge (manual toggle — app doesn't auto-file)
- [x] "Data Quality: X issues found" (amber chip when issues exist from P13.1 check)

**Section: B2B Invoices (Business to Business)**

- [x] Definition helper: "GST-registered customers only (have GSTIN)"
- [x] Summary: X invoices, ₹ Y taxable, ₹ Z IGST, ₹ W CGST, ₹ V SGST
- [x] Expandable list grouped by Receiver GSTIN:
    - [x] GSTIN + Receiver Name header row
    - [x] Under each GSTIN: each invoice as a row
    - [x] Columns per row: Invoice No., Invoice Date, Invoice Value (total incl. GST), Taxable Value, Tax Rate, IGST, CGST, SGST, Place of Supply (2-digit state code), Reverse Charge (Y/N), Invoice Type (Regular/Debit Note/Credit Note)
- [x] Amendments: if invoice was amended after filing the return it was first in, shows in B2B Amendments section

**Section: B2CL (Business to Consumer Large)**

- [x] Definition helper: "Unregistered customers, invoice value > ₹ 2,50,000"
- [x] Grouped by: State of customer (Place of Supply) → Interstate supply
- [x] Columns: Place of Supply, Invoice No., Date, Total Invoice Value, Taxable Value, Tax Rate, IGST Amount
- [x] Threshold logic: correctly identifies invoices crossing ₹ 2.5L threshold

**Section: B2CS (Business to Consumer Small)**

- [x] Consolidated (not invoice-wise): unregistered customers, value ≤ ₹ 2,50,000 OR intra-state
- [x] Grouped by: State, Tax Rate
- [x] Row per State+Rate combination: Taxable Value, CGST, SGST, IGST

**Section: CDNR (Credit/Debit Notes for Registered Parties)**

- [x] Credit notes (from Sale Returns P16.1) issued to GST-registered customers
- [x] Debit notes issued to GST-registered customers
- [x] Columns: GSTIN, Note No., Date, Invoice No. (original), Note Value, Taxable Value, Tax Rate, IGST, CGST, SGST

**Section: CDNUR (Credit/Debit Notes for Unregistered)**

- [x] Same as CDNR but for unregistered customers

**Section: HSN Summary**

- [x] Mandatory when annual turnover > ₹ 5 crore (4-digit HSN), or > ₹ 1.5 crore (mandatory if GSTIN registered)
- [x] Grouped by: HSN Code, Description, UoM (Unit of Measure)
- [x] Columns: HSN, Description, UoM, Total Qty, Total Taxable Value, Integrated Tax, Central Tax, State/UT Tax, Cess
- [x] One row per HSN code (regardless of rate — aggregated)

**Section: Nil/Exempt/Non-GST Supplies**

- [x] Consolidated totals of items sold with 0% GST rate (nil rated, exempt, non-GST)

**Export:**

- [x] "Export JSON" — GST portal upload format (validates JSON structure before export)
- [x] "Export Excel" — all sections in separate sheets
- [x] "Export PDF" — formatted summary for record keeping / CA sharing
- [x] "Share PDF via WhatsApp" — for sharing with CA/accountant

### P13.3 GSTR-2 (Inward Supplies)

**Route:** `/(app)/reports/gstr2`

Note: GSTR-2 filing was suspended by GST Council; this report serves as a reconciliation tool.

- [x] Period selector: month + year
- [x] **B2B Purchases section** (invoices from GST-registered suppliers):
    - [x] Grouped by Supplier GSTIN
    - [x] Per invoice: Supplier GSTIN, Supplier Name, Bill No., Bill Date, Invoice Value, Taxable Value, Rate, IGST, CGST, SGST, ITC Status (eligible/ineligible/blocked)
    - [x] "ITC Eligible Total: ₹ X" highlighted green
    - [x] "ITC Ineligible: ₹ X" (e.g. purchases for personal use, blocked credits under Section 17(5))
- [x] **CDNR (Debit/Credit Notes Received from Suppliers)**:
    - [x] Debit notes from suppliers (they billed us more)
    - [x] Credit notes received (purchase returns P16.2)
- [x] **ITC Summary card** (important for 3B):
    - [x] Total IGST ITC available: ₹ X
    - [x] Total CGST ITC available: ₹ X
    - [x] Total SGST ITC available: ₹ X
    - [x] ITC Reversed (for returns/corrections): ₹ X
    - [x] **Net ITC Available: ₹ X** (amountLarge, green)
- [x] Export JSON / Excel / PDF

### P13.4 GSTR-3B (Monthly Summary Return)

**Route:** `/(app)/reports/gstr3b`

> The monthly return — most important GST filing. Shows tax liability and payment.

- [x] Period: month + year; filing deadline shown: "Due: 20th [next month]"
- [x] **Table 3.1 — Details of Outward Supplies and Inward Supplies on Reverse Charge**:
    - [x] 3.1(a): Outward taxable supplies (other than zero rated / nil rated / exempted): Taxable Value, Integrated Tax, Central Tax, State/UT Tax, Cess
    - [x] 3.1(b): Outward taxable supplies (zero rated): Taxable Value, Integrated Tax
    - [x] 3.1(c): Other outward supplies (Nil rated, exempted): Taxable Value
    - [x] 3.1(d): Inward supplies (liable to reverse charge): Taxable Value, Integrated Tax, Central Tax, State/UT Tax, Cess
    - [x] 3.1(e): Non-GST outward supplies: Taxable Value
    - [x] All rows auto-populated from invoice data; editable fields for manual adjustment
- [x] **Table 3.2 — Supplies made to Unregistered Persons, Composition Taxable Persons and UIN Holders**:
    - [x] Interstate supplies to unregistered persons: state-wise breakdown
    - [x] Auto-populated from B2CL data in GSTR-1
- [x] **Table 4 — Eligible ITC**:
    - [x] 4(A): ITC Available: IGST + CGST + SGST per sub-head (imports, reverse charge, inputs from ISD, all other)
    - [x] 4(B): ITC Reversed: Rule 42/43, others
    - [x] 4(C): Net ITC available (4A − 4B): auto-computed
    - [x] 4(D): Ineligible ITC: amounts that cannot be claimed
- [x] **Table 5 — Exempt / Nil-rated / Non-GST supplies**:
    - [x] Interstate / Intrastate breakdown
- [x] **Table 6 — Payment of Tax**:
    - [x] Tax Payable: IGST, CGST, SGST, Cess (auto-computed from 3.1 − 4C)
    - [x] ITC offset: auto-fills from 4C (ITC applied against liability)
    - [x] Tax to be paid in cash: liability − ITC offset
    - [x] Interest (if filing late): computed at 18% p.a. on outstanding tax
    - [x] Late fee (if filing after due date): ₹ 50/day (₹ 25 CGST + ₹ 25 SGST), max ₹ 10,000
    - [x] Total cash to pay: prominent, amountLarge
- [x] "Save as Draft" button (saves computed values for reference; doesn't file)
- [x] Export PDF / JSON for portal

### P13.5 GST Detail Report

**Route:** `/(app)/reports/gst-detail`

- [x] **Filters**: date range / transaction type (Sale/Purchase/Both) / GST rate slab / party / supply type (intra/inter)
- [x] **Table columns**: Date, Reference No. (Invoice/Bill No.), Type (Sale/Purchase/Credit Note), Party Name, Party GSTIN, HSN, Taxable Amount, IGST, CGST, SGST, Cess, Total GST
- [x] **Column totals** row at bottom
- [x] Filter by slab: shows only 18% transactions, etc.
- [x] Useful for: reconciling GST paid vs collected, preparing for CA audit
- [x] Export Excel (each column clearly labelled)

### P13.6 GSTR-9 (Annual Return)

**Route:** `/(app)/reports/gstr9`

> The annual GST return — summary of the full financial year. Due by 31st December of next year.

- [x] **Financial Year** selector (not month — annual)
- [x] **Part I**: Basic details (auto-filled from business profile)
- [x] **Part II — Details of Outward and Inward Supplies declared in GSTR-1 and GSTR-3B** (Table 4–5):
    - [x] Table 4: Taxable outward supplies (B2B, B2C, zero-rated, nil/exempt, non-GST)
    - [x] Table 5: Outward supplies on which GST not payable
    - [x] All figures: auto-aggregated from the year's GSTR-1 data
- [x] **Part III — Details of ITC declared in GSTR-3B** (Table 6–8):
    - [x] Table 6: ITC availed through GSTR-3B
    - [x] Table 7: ITC reversed or lapsed
    - [x] Table 8: Other ITC related information (ITC from GSTR-2A vs actual claimed)
- [x] **Part IV — Details of tax paid** (Table 9): month-wise IGST, CGST, SGST, Cess paid via cash and ITC
- [x] **Part VI — Other Information** (Table 15–18): HSN-wise summary of outward/inward supplies
- [x] Amendment fields: all auto-computed fields are editable for manual corrections
- [x] Export PDF (official format for record keeping)

### P13.7 Sale Summary by HSN

**Route:** `/(app)/reports/hsn-summary`

> Required for GSTR-1 filing and commonly requested by CAs for tax audit.

- [x] **Date range** filter; default: current filing month
- [x] **Table**: HSN Code / SAC Code, Description (from item master), Unit of Measure, Total Quantity Sold, Total Taxable Value, Total IGST, Total CGST, Total SGST, Total Cess, Total Tax, Total Value (incl. tax)
- [x] One row per unique HSN code
- [x] Sorted by taxable value descending
- [x] "Unknown HSN" row at bottom for items with no HSN code set (data quality)
- [x] Similarly: Purchase Summary by HSN — same table but for purchases
- [x] Export Excel (suitable for direct use in GSTR-1 HSN table upload)
- [x] Export PDFo rated): Taxable Value, Integrated Tax
    - [ ] 3.1(c): Other outward supplies (Nil rated, exempted): Taxable Value
    - [ ] 3.1(d): Inward supplies (liable to reverse charge): Taxable Value, Integrated Tax, Central Tax, State/UT Tax, Cess
    - [ ] 3.1(e): Non-GST outward supplies: Taxable Value
    - [ ] All rows auto-populated from invoice data; editable fields for manual adjustment
- [ ] **Table 3.2 — Supplies made to Unregistered Persons, Composition Taxable Persons and UIN Holders**:
    - [ ] Interstate supplies to unregistered persons: state-wise breakdown
    - [ ] Auto-populated from B2CL data in GSTR-1
- [ ] **Table 4 — Eligible ITC**:
    - [ ] 4(A): ITC Available: IGST + CGST + SGST per sub-head (imports, reverse charge, inputs from ISD, all other)
    - [ ] 4(B): ITC Reversed: Rule 42/43, others
    - [ ] 4(C): Net ITC available (4A − 4B): auto-computed
    - [ ] 4(D): Ineligible ITC: amounts that cannot be claimed
- [ ] **Table 5 — Exempt / Nil-rated / Non-GST supplies**:
    - [ ] Interstate / Intrastate breakdown
- [ ] **Table 6 — Payment of Tax**:
    - [ ] Tax Payable: IGST, CGST, SGST, Cess (auto-computed from 3.1 − 4C)
    - [ ] ITC offset: auto-fills from 4C (ITC applied against liability)
    - [ ] Tax to be paid in cash: liability − ITC offset
    - [ ] Interest (if filing late): computed at 18% p.a. on outstanding tax
    - [ ] Late fee (if filing after due date): ₹ 50/day (₹ 25 CGST + ₹ 25 SGST), max ₹ 10,000
    - [ ] Total cash to pay: prominent, amountLarge
- [ ] "Save as Draft" button (saves computed values for reference; doesn't file)
- [ ] Export PDF / JSON for portal

### P13.5 GST Detail Report

**Route:** `/(app)/reports/gst-detail`

- [ ] **Filters**: date range / transaction type (Sale/Purchase/Both) / GST rate slab / party / supply type (intra/inter)
- [ ] **Table columns**: Date, Reference No. (Invoice/Bill No.), Type (Sale/Purchase/Credit Note), Party Name, Party GSTIN, HSN, Taxable Amount, IGST, CGST, SGST, Cess, Total GST
- [ ] **Column totals** row at bottom
- [ ] Filter by slab: shows only 18% transactions, etc.
- [ ] Useful for: reconciling GST paid vs collected, preparing for CA audit
- [ ] Export Excel (each column clearly labelled)

### P13.6 GSTR-9 (Annual Return)

**Route:** `/(app)/reports/gstr9`

> The annual GST return — summary of the full financial year. Due by 31st December of next year.

- [ ] **Financial Year** selector (not month — annual)
- [ ] **Part I**: Basic details (auto-filled from business profile)
- [ ] **Part II — Details of Outward and Inward Supplies declared in GSTR-1 and GSTR-3B** (Table 4–5):
    - [ ] Table 4: Taxable outward supplies (B2B, B2C, zero-rated, nil/exempt, non-GST)
    - [ ] Table 5: Outward supplies on which GST not payable
    - [ ] All figures: auto-aggregated from the year's GSTR-1 data
- [ ] **Part III — Details of ITC declared in GSTR-3B** (Table 6–8):
    - [ ] Table 6: ITC availed through GSTR-3B
    - [ ] Table 7: ITC reversed or lapsed
    - [ ] Table 8: Other ITC related information (ITC from GSTR-2A vs actual claimed)
- [ ] **Part IV — Details of tax paid** (Table 9): month-wise IGST, CGST, SGST, Cess paid via cash and ITC
- [ ] **Part VI — Other Information** (Table 15–18): HSN-wise summary of outward/inward supplies
- [ ] Amendment fields: all auto-computed fields are editable for manual corrections
- [ ] Export PDF (official format for record keeping)

### P13.7 Sale Summary by HSN

**Route:** `/(app)/reports/hsn-summary`

> Required for GSTR-1 filing and commonly requested by CAs for tax audit.

- [ ] **Date range** filter; default: current filing month
- [ ] **Table**: HSN Code / SAC Code, Description (from item master), Unit of Measure, Total Quantity Sold, Total Taxable Value, Total IGST, Total CGST, Total SGST, Total Cess, Total Tax, Total Value (incl. tax)
- [ ] One row per unique HSN code
- [ ] Sorted by taxable value descending
- [ ] "Unknown HSN" row at bottom for items with no HSN code set (data quality)
- [ ] Similarly: Purchase Summary by HSN — same table but for purchases
- [ ] Export Excel (suitable for direct use in GSTR-1 HSN table upload)
- [ ] Export PDF

---

## P14 — Item & Stock Reports

> **Prerequisite:** P2 (items with stock tracking), P4 (sales reducing stock), P6 (purchases increasing stock).

---

### P14.1 Stock Summary Report

**Route:** `/(app)/reports/stock-summary`

> The most used report for inventory management. A quick view of "what do I have and what is it worth?"

- [x] **Filters**: category / stock level (All / In Stock / Low Stock / Out of Stock)
- [x] **Sort**: by item name / stock value (desc) / quantity (asc for identifying low stock)
- [x] **Summary card**: Total Stock Value: ₹ X (sum of all items' current_stock × purchase_price); Total Items: N; Out of Stock: M items (red badge)
- [x] **Table columns**: Item Name, Category, Unit, Opening Stock (start of FY or selected date), Purchases (in), Sales (out), Adjustments (±), **Current Stock** (bold), Avg. Purchase Price, **Stock Value** (current stock × avg. purchase price)
- [x] Items with current stock = 0: grey text + "Out of Stock" badge
- [x] Items at/below threshold: stock quantity in red
- [x] "As on date" picker: shows stock position at any historical date (computed from stock operations up to that date)
- [x] Export PDF (printable stock register — common requirement for GST audit)
- [x] Export Excel

### P14.2 Item Report by Party

**Route:** `/(app)/reports/item-by-party`

- [x] **Mode** toggle: "Party → Items" / "Item → Parties"
- [x] **Mode 1 (Party → Items)**: select party → date range → table of items bought/sold
    - [x] Columns: Item Name, HSN, Total Qty, Sale Rate (avg), Purchase Rate (avg), Total Value, Last Txn Date
- [x] **Mode 2 (Item → Parties)**: select item → date range → table of parties
    - [x] Columns: Party Name, Type (Customer/Supplier), Total Qty, Total Value, Avg. Rate, Last Txn Date
- [x] Tap any row → drill to Party Statement or Item Detail Report

### P14.3 Item-wise Profit / Loss

**Route:** `/(app)/reports/item-profit`

- [x] **Filters**: date range / category / sort (by margin %, by profit amount, by revenue)
- [x] **Summary**: Total Revenue ₹ X, Total COGS ₹ X, **Total Profit ₹ X (Y%)**, Number of loss-making items
- [x] **Table**: Item Name, Category, Total Qty Sold, Avg. Sale Price, Avg. Purchase Price, Total Revenue, Total COGS, Gross Profit, **Profit %**
- [x] Profit % column: colour-coded (green ≥ 20%, amber 5–20%, red <5% or negative)
- [x] "No purchase price" items flagged: "Purchase price not set — cannot calculate profit"
- [x] Sort: profit % descending — identify your best and worst performing products
- [x] Export Excel / PDF

### P14.4 Low Stock Summary Report

**Route:** `/(app)/reports/low-stock`

- [x] **Filters**: category; "below threshold" (default) / "out of stock" / "all low stock"
- [x] **Table**: Item Name, Category, Unit, Current Stock, Low Stock Threshold, **Shortage** (threshold − current, if negative = stock below threshold by this much), Avg. Monthly Sales (last 3 months), **Suggested Reorder Qty** (avg. monthly sales × 1.5), Last Purchase Rate, Last Purchased From (supplier name)
- [x] **Highlight row**: completely out of stock items at top in red
- [x] "Create PO" button per row: opens Purchase Order (P16.5) pre-filled with that item and suggested qty
- [x] "Select All Low Stock" checkbox + "Create Bulk PO" button: creates one PO per supplier for all selected items
- [x] Export to share with suppliers: PDF or Excel
- [x] "Share on WhatsApp" generates a formatted list for WhatsApp message

### P14.5 Item Detail Report

**Route:** `/(app)/reports/item-detail/[id]`

- [x] **Item info header**: name, category, current stock, unit, purchase price, sale price
- [x] **Date range** filter
- [x] **Stock Movement table** (comprehensive ledger):
    - [x] Opening stock row (bold, grey background)
    - [x] All stock operations chronologically: Date, Type (Purchase Receipt / Sale / Stock Adjustment / Opening / Transfer), Reference No. (Invoice/Bill No. or "Manual"), Qty In (+), Qty Out (−), Running Balance
    - [x] Running balance column (always shows real-time stock after each transaction)
    - [x] Negative stock rows: highlighted in red (data integrity issue)
- [x] **Summary tab**: total purchased, total sold, total adjusted, opening vs closing
- [x] Export PDF / Excel

### P14.6 Stock Detail Report (All Items)

**Route:** `/(app)/reports/stock-detail`

- [x] All stock movements for ALL items in a period
- [x] **Filters**: item (multi-select) / category / movement type (Receipt / Issue / Adjustment / All)
- [x] **Table**: Date, Item Name, Category, Movement Type, Qty In, Qty Out, Rate (purchase/sale), Value, Reference No., Party Name
- [x] Useful for: monthly stock audit, GST audit of closing stock
- [x] Export Excel (large — recommend date range limit)

### P14.7 Sale / Purchase by Item Category

**Route:** `/(app)/reports/category-summary`

- [x] Date range filter
- [x] **Two-level table**:
    - [x] Level 1 (collapsed by default): Category row — name, total sale qty, total sale value, total purchase qty, total purchase value, net profit
    - [x] Level 2 (expand category): individual items within category — same columns
- [x] Visual: horizontal stacked bar per category (sale value vs purchase value)
- [x] Export PDF / Excel

### P14.8 Stock Summary by Item Category

**Route:** `/(app)/reports/stock-by-category`

- [x] Table: Category, Item Count, Total Current Stock (in primary units), Stock Value (₹)
- [x] Pie chart: stock value distribution across categories
- [x] Tap category → drill into Stock Summary filtered to that category
- [x] "As on date" picker
- [x] Export PDF / Excel

### P14.9 Item Batch Report

**Route:** `/(app)/reports/batch-report`
(Shown only when batch tracking enabled in settings)

- [x] **Filters**: item / category / expiry range (Next 30 days / Next 60 days / Next 90 days / All / Expired) / status (Open / Consumed / Expired)
- [x] **Table**: Item Name, Batch No., Manufacturing Date, Expiry Date, Opening Qty, Received Qty, Issued Qty, **Remaining Qty**, Current Value, Status, Days to Expiry
- [x] Expiry within 30 days: amber row highlight
- [x] Expired (past date): red row highlight, "Expired" badge
- [x] Zero remaining qty: grey text "Fully consumed"
- [x] "Adjust / Write Off Expired" button per expired row: creates negative stock adjustment with reason "Expiry write-off"
- [x] Export PDF / Excel

### P14.10 Item Serial Report

**Route:** `/(app)/reports/serial-report`
(Shown only when serial tracking enabled)

- [x] Search by serial number: instant lookup
- [x] **Filters**: item / status (In Stock / Sold / Returned / Written Off)
- [x] **Table**: Item Name, Serial Number, Status, Date Received (in), Date Sold (out), Customer Name (if sold), Invoice No., Current Location
- [x] Tap serial number → transaction history for that unit
- [x] Export Excel

### P14.11 Item-wise Discount Report

**Route:** `/(app)/reports/item-discount`

- [x] **Date range** filter
- [x] **Table**: Item Name, Category, Total Qty Sold, Total Sale Value (without discount), Total Discount Given, Net Sale Value (after discount), Discount %
- [x] Sorted by Total Discount descending
- [x] Highlights items where discount % > 15% (configurable threshold)
- [x] "Items with highest discounting might be overpriced or negotiated down too aggressively" — contextual insight card
- [x] Export Excel / PDF

---

## P15 — Business Status, Expense, Order & Loan Reports

---

### P15.1 Bank Statement Report

**Route:** `/(app)/reports/bank-statement`

- [ ] **Bank Account selector** at top (dropdown) — one statement per account
- [ ] **Date range**: default current month; month navigation ← →
- [ ] **Statement body**:
    - [ ] Account details header: Bank Name, Account No. (masked), IFSC, Account Holder
    - [ ] Opening balance row (bold): "Opening Balance on [date]: ₹ X"
    - [ ] Transaction rows: Date, Description/Narration, Cheque No. (if cheque), Debit (−), Credit (+), Balance
    - [ ] Transaction type icons: sale receipt (green), purchase payment (red), expense (purple), transfer (blue), cheque (orange)
    - [ ] Closing balance row (bold): "Closing Balance on [date]: ₹ X"
    - [ ] Summary below: Total Credits ₹ X · Total Debits ₹ X
- [ ] Export PDF (formatted as bank statement — shareable with CA/bank)
- [ ] Export Excel

### P15.2 Discount Report

**Route:** `/(app)/reports/discounts`

- [x] **Filters**: date range / item / customer / discount type (item-level / transaction-level / both)
- [x] **Summary**: Total Discount Given: ₹ X (Y% of total gross sales)
- [x] **Table**: Date, Invoice No., Customer, Discount Type (Item/Transaction), Items Affected, Gross Amount, Discount Amount, Discount %, Net Amount
- [x] Sorted by Discount Amount descending
- [x] "Total potential revenue lost to discounts: ₹ X" — insight card
- [x] Export PDF / Excel

### P15.3 Tax Report

**Route:** `/(app)/reports/tax-report`

- [x] **Period**: monthly / quarterly / FY; date range
- [x] **Output Tax Section** (tax collected from customers on sales):
    - [x] Month-by-month table: IGST Collected, CGST Collected, SGST Collected, Total Output Tax
    - [x] Period total row
- [x] **Input Tax Section** (tax paid on purchases — ITC):
    - [x] Month-by-month table: IGST Paid, CGST Paid, SGST Paid, Total Input Tax
    - [x] Period total row
- [x] **Net Tax Liability Section**:
    - [x] Output Tax − Input Tax = **Net Payable / Refundable** (amountLarge, red if payable, green if refundable)
- [x] **TDS Section** (manual entries only for now):
    - [x] TDS deducted by customer (if any): text entries by user
    - [x] TDS paid to TRACES (manual entry)
- [x] Export PDF (tax computation sheet for CA)

### P15.4 Tax Rate Report

**Route:** `/(app)/reports/tax-rate-report`

- [x] Date range filter
- [x] **Sections — one per GST slab** (only slabs with transactions are shown):
    - [x] "0% (Nil Rated) / Exempt / Non-GST": total taxable value, count of invoices
    - [x] "5% GST": total taxable value, IGST ₹, CGST ₹, SGST ₹
    - [x] "12% GST": same
    - [x] "18% GST": same (will usually be the largest for hardware/tiles)
    - [x] "28% GST": same
- [x] Pie chart: proportion of sales by GST rate
- [x] Separate Purchase section with same breakdown (input tax by rate)
- [x] Export Excel

### P15.5 Expense Transaction Report

**Route:** `/(app)/reports/expense-transactions`

- [x] **Filters**: date range / category (multi-select) / payment mode / amount range (min–max)
- [x] **Summary card**: Total Expenses ₹ X in period; Top category: "[Category] ₹ Y"
- [x] **Table**: Date, Category, Description, Paid To, Payment Mode, Reference, Amount, GST (if applicable), ITC
- [x] Month-by-month bar chart (sparkline)
- [x] Sorted by date descending
- [x] Export PDF / Excel

### P15.6 Expense Category Report

**Route:** `/(app)/reports/expense-categories`

- [x] **Period**: this month / last month / this quarter / this FY / custom
- [x] **Table**: Category Name, This Period ₹, Last Period ₹, Change (₹ and %), % of Total Expenses
- [x] **Pie chart** (simple, 6 segments max — smaller categories grouped as "Other"): rendered with `react-native-svg`
- [x] Tap category row → Expense Transaction Report filtered to that category
- [x] "Rent is your largest expense at 38% of total" — auto-generated insight
- [x] Export PDF (summary)

### P15.7 Expense Item Report

**Route:** `/(app)/reports/expense-items`

- [x] All individual expense entries for a period
- [x] Sorted by amount descending (largest expense at top)
- [x] Filters: category / payment mode / date range
- [x] Same columns as P15.5 (individual transaction level)

### P15.8 Sale / Purchase Order Transaction Report

**Route:** `/(app)/reports/order-transactions`

- [x] **Type toggle**: Sale Orders / Purchase Orders / Both
- [x] **Status filter**: Open / Converted to Invoice / Partially Converted / Cancelled
- [x] **Date range** filter (order date)
- [x] **Table**: Order No., Type, Party, Order Date, Expected Date, Total Value, Status, Converted Invoice/Bill No.
- [x] "Pending Value": total value of Open orders (items ordered but not yet billed)
- [x] Tap row → Order detail screen
- [x] Export PDF / Excel

### P15.9 Sale / Purchase Order Item Report

**Route:** `/(app)/reports/order-items`

- [x] **Filters**: item / category / status / date range
- [x] **Table**: Order No., Item Name, Ordered Qty, Delivered Qty, Remaining Qty, Unit Price, Total Value, Party, Status
- [x] "Pending delivery" items at top
- [x] Groups by item (multi-order aggregation)
- [x] Export Excel (useful for procurement planning)

### P15.10 Other Income Transaction Report

**Route:** `/(app)/reports/income-transactions`

Same structure as Expense Transaction Report (P15.5):

- [x] Columns: Date, Category, Description, Received From, Payment Mode, Reference, Amount
- [x] Summary: Total Other Income ₹ X in period
- [x] Export PDF / Excel

### P15.11 Other Income Category Report

**Route:** `/(app)/reports/income-categories`

Same structure as Expense Category Report (P15.6) but for income categories.

- [x] Category Name, This Period ₹, Last Period ₹, Change (₹ and %), % of Total Income
- [x] Pie chart of income categories
- [x] Export PDF (summary)

### P15.12 Other Income Item Report

Individual income entries sorted by amount — same as Expense Item Report format.

- [x] All individual income entries for a period
- [x] Sorted by amount descending (largest income at top)
- [x] Filters: category / payment mode / date range

### P15.13 Loan Statement

**Route:** `/(app)/reports/loan-statement`

- [x] **Loan selector** at top: dropdown of active loans (see P19)
- [x] **Loan Details card**: Lender, Loan Amount, Disbursement Date, Interest Rate, Tenure, EMI Amount
- [x] **Amortisation Schedule table**:
    - [x] Columns: EMI No., Due Date, Opening Balance, EMI Amount, Principal Component, Interest Component, Closing Balance, Status (Paid / Pending / Late)
    - [x] Paid EMIs: green row
    - [x] Current month EMI: highlighted amber
    - [x] Future EMIs: grey
- [x] **Summary cards**: Loan Amount ₹ X, Total Paid ₹ X, Outstanding Principal ₹ X, Total Interest Paid ₹ X, Remaining Tenure (months)
- [x] Export PDF (suitable for bank submission or tax records — interest is often tax deductible for business loans)

---

## P16 — Advanced Transactions

> **Prerequisite:** P4 (invoices), P6 (purchase bills), P3 (parties), P2 (items).

---

### P16.1 Sale Return (Credit Note)

**Route:** `/(app)/invoices/[id]/return` and `/(app)/transactions/credit-note/create`

**Background:**
A customer returns goods. We need to: (1) reduce the amount they owe us, (2) restore the stock, (3) record for GSTR-1 credit notes section.

#### From Invoice Detail:

- [ ] "Create Return" button in invoice action bar
- [ ] Pre-fills all items from the original invoice

#### Standalone Create:

- [ ] Customer picker
- [ ] "Link to invoice" field: `BottomSheetPicker` of customer's invoices; optional (can create standalone credit note)
- [ ] When linked: pre-fills items, dates, and GST details from that invoice

#### Credit Note Form:

- [ ] **Credit Note Number**: auto-generated "CN-001" sequence (separate from invoice)
- [ ] **Original Invoice Reference**: invoice number + date (auto-filled if created from invoice, else searchable)
- [ ] **Date**: `DatePickerField`; must be ≥ original invoice date
- [ ] **Reason for Return**: `BottomSheetPicker` + optional text:
    - [ ] Defective / Damaged goods
    - [ ] Wrong item supplied
    - [ ] Customer changed mind
    - [ ] Price difference / Rate correction
    - [ ] Short supply
    - [ ] Other (text field)
- [ ] **Items to Return** (pre-filled from original invoice if linked):
    - [ ] Each row: item name, original qty, return qty (numeric spinner, max = original qty), unit price, GST
    - [ ] **Cannot exceed original quantity per line item** — hard validation
    - [ ] "Return All Items" button: sets all return qtys to max
    - [ ] Partial return: only fill in items being returned (others leave at 0)
- [ ] **Return Totals**: taxable value, GST (negative), net credit amount
- [ ] **GST treatment**: same CGST+SGST or IGST determination as original invoice; credit note reduces output tax liability
- [ ] **How to apply credit**: bottom section
    - [ ] "Adjust against party balance" (default): reduces party's outstanding by the credit amount
    - [ ] "Refund via [mode]": creates a cash/UPI outflow back to customer
- [ ] **Stock restoration**: on save, items in credit note are added back to stock; shown as confirmation: "Stock restored: Floor Tile 60×60 +10 Pcs"
- [ ] **Credit Note List**:
    - [ ] Route: `/(app)/transactions/credit-notes`
    - [ ] Filters: date range / customer / status (Open/Adjusted/Refunded)
    - [ ] Columns: CN No., Date, Customer, Original Invoice, Return Amount, Reason, Status
    - [ ] Tap → Credit Note Detail

### P16.2 Purchase Return (Debit Note)

**Route:** `/(app)/purchases/[id]/return` and `/(app)/transactions/debit-note/create`

Identical flow to Sale Return (P16.1) with these differences:

- [ ] Labels: "Debit Note" / "डेबिट नोट"; "Return to Supplier"
- [ ] Supplier picker (not customer)
- [ ] Reduces our payable to supplier
- [ ] Stock reduces on return (we're sending items back)
- [ ] For GST: appears in GSTR-2 credit notes section (reduces ITC claimed)
- [ ] "Reason for return" same options
- [ ] Debit Note List: `/(app)/transactions/debit-notes`

### P16.3 Estimate / Quotation

**Route:** `/(app)/transactions/estimates`

**Background:**
Very common in Indian B2B — a customer asks "bolo, kya rate milega?" and gets a written estimate before placing an order.

#### Estimate List Screen:

- [ ] Tabs or filter: All / Open / Accepted / Rejected / Expired / Converted
- [ ] Each row: Estimate No., Customer, Date, Valid Until, Amount, Status
- [ ] FAB "+ Estimate"
- [ ] "Overdue / Expired" estimates highlighted (grey them out after expiry)

#### Estimate Create Screen:

- [ ] **Route:** `/(app)/transactions/estimates/create`
- [ ] **Estimate Number**: auto-sequence "EST-001" (configurable prefix, separate from invoice sequence)
- [ ] **Date**: today default
- [ ] **Valid Until (Expiry)**: `DatePickerField`; shortcuts "7 days" / "15 days" / "30 days"; after this date → auto-status "Expired"
- [ ] **Customer**: picker (same as invoice); "Add new customer" inline
- [ ] **Subject Line** (optional): "Quotation for Kitchen Tile Work - Sharma Residence"
- [ ] **Line Items**: identical to invoice (P4.3) — same item search, qty, price, discount, GST
- [ ] **Additional Charges**: same as invoice
- [ ] **Transaction-level Discount**: same
- [ ] **Totals**: identical layout to invoice
- [ ] **Terms** (below totals):
    - [ ] "Validity: This quotation is valid until [date]" — pre-filled, editable
    - [ ] Terms text area: "Delivery in 7-10 working days; 50% advance with order; balance before delivery"
    - [ ] Default terms from settings (editable per estimate)
- [ ] **Notes**: internal notes (not shown on print)
- [ ] **NO payment section** (this is a quotation, not a transaction)
- [ ] **Save**: creates estimate; navigate to Estimate Detail
- [ ] **Post-save actions** (same share sheet as invoice):
    - [ ] "Share on WhatsApp" (primary) — most common action for estimates
    - [ ] "Print"
    - [ ] "Share PDF"

#### Estimate Detail Screen:

- [ ] Displays full estimate in invoice-like format but watermarked "ESTIMATE" / "QUOTATION"
- [ ] Status badge: OPEN / ACCEPTED / REJECTED / EXPIRED / CONVERTED
- [ ] Action bar:
    - [ ] **"Convert to Invoice"** (primary button when status is Open/Accepted):
        - [ ] `ConfirmationModal`: "Confirm items and prices?" with summary
        - [ ] On confirm: creates invoice pre-filled from estimate, opens invoice create at Step 3 (review) — user can modify before creating
        - [ ] Estimate status → "Converted"; links invoice number in estimate detail
    - [ ] "Mark Accepted" / "Mark Rejected" (sets status accordingly)
    - [ ] Edit (only if not Converted)
    - [ ] Share WhatsApp / Print / Share PDF
    - [ ] Delete (with confirmation)

#### Estimate PDF Print:

- [ ] Same layout as invoice PDF but:
    - [ ] Heading: "ESTIMATE" / "QUOTATION" (large, watermark-style diagonal text if desired)
    - [ ] No "Payment Mode" section on print
    - [ ] "Validity" line above totals
    - [ ] "Terms & Conditions" section at bottom

### P16.4 Delivery Challan

**Route:** `/(app)/transactions/challans`

**Background:**
Used when goods leave the warehouse for delivery before billing (very common in manufacturing and wholesale). Not a tax document — just a dispatch record.

#### Challan List:

- [ ] Status filter: All / Pending / Delivered / Converted to Invoice / Cancelled
- [ ] Columns: Challan No., Date, Consignee (customer), Items Count, Status
- [ ] FAB "+ Challan"

#### Challan Create Screen:

**Route:** `/(app)/transactions/challans/create`

- [ ] **Challan Number**: auto-sequence "DC-001" (configurable prefix)
- [ ] **Date**: today default
- [ ] **Consignee** (customer receiving goods): picker
- [ ] **Billing Party** (may differ from consignee in B2B): optional separate picker
- [ ] **Line Items**: item search + qty (same as invoice items step) — **no pricing fields** (challan is not a tax document)
    - [ ] Batch selection for batch-tracked items
    - [ ] Serial scan for serial-tracked items
- [ ] **Transport Details section** (mandatory for challan — this is its purpose):
    - [ ] Transporter Name: text field
    - [ ] LR / GR Number: text field
    - [ ] Vehicle Number: text field
    - [ ] Driver Name and Phone: optional
    - [ ] Date of Dispatch: today default
    - [ ] Expected Delivery Date: `DatePickerField`
- [ ] **Notes / Delivery Instructions**: text area
- [ ] **Save**: stock is **not deducted** on challan save (stock deducts only when converted to invoice); instead, challan creates a "stock in transit" status for the items
- [ ] **Post-save actions**: Share WhatsApp (very common — send challan to driver or logistics partner)

#### Challan Detail Screen:

- [ ] Shows all fields including transport info
- [ ] "DELIVERY CHALLAN" watermark on print
- [ ] Action bar:
    - [ ] **"Convert to Invoice"** (primary):
        - [ ] Opens invoice create with items + customer pre-filled (at step 2 — items need pricing)
        - [ ] After pricing filled and invoice created → challan status → "Converted"
    - [ ] "Mark as Delivered" (updates status; sets delivery date)
    - [ ] Edit / Delete
    - [ ] Share WhatsApp / Print

#### Challan Print:

- [ ] No prices, no GST — only items + quantities
- [ ] Transport details prominently shown
- [ ] "NOT A TAX INVOICE" note at top (legal requirement)

### P16.5 Purchase Order (PO)

**Route:** `/(app)/transactions/purchase-orders`

**Background:**
A formal document sent to a supplier saying "please supply these items at this price by this date." Very common in wholesale and manufacturing.

#### PO List:

- [ ] Status filter: All / Open / Partially Received / Fully Received / Cancelled
- [ ] Columns: PO No., Supplier, Date, Expected Delivery, Total Value, Received %, Status
- [ ] FAB "+ PO"

#### PO Create Screen:

**Route:** `/(app)/transactions/purchase-orders/create`

- [ ] **PO Number**: auto-sequence "PO-001" (configurable prefix)
- [ ] **Date**: today default
- [ ] **Supplier**: picker; "Add new supplier" inline; shows last order date
- [ ] **Expected Delivery Date**: `DatePickerField`; "Urgent" chip sets to tomorrow
- [ ] **Delivery Address**: pre-filled from business address; editable (for drop-ship scenarios)
- [ ] **Line Items**:
    - [ ] Item search (same as purchase bill)
    - [ ] Qty (numeric + unit)
    - [ ] Expected Rate (purchase price): `AmountInput` (optional — may not know price until delivered)
    - [ ] Required By Date per line item (optional for mixed-urgency orders)
- [ ] **Terms** (text area): "Delivery within 7 days; Invoice to follow with dispatch"
- [ ] **Notes**: internal notes
- [ ] **Total Estimated Value**: sum of qty × expected rate (shown as "estimated" since prices may vary)
- [ ] Save: creates PO; navigate to PO Detail
- [ ] Share on WhatsApp (primary action — send PO to supplier)

#### PO Detail Screen:

- [ ] Shows full PO details
- [ ] **"PURCHASE ORDER"** heading on print
- [ ] Status progress indicator: "Open → Partially Received → Fully Received"
- [ ] Per line item: shows "Ordered: X · Received: Y · Remaining: Z"
- [ ] Action bar:
    - [ ] **"Receive Against PO"** (primary button when status is Open/Partially Received):
        - [ ] Bottom sheet: for each line item, enter "Received Qty" (default = remaining, user can reduce for partial receipt)
        - [ ] "Receive Date": date picker
        - [ ] "Create Purchase Bill" toggle: ON by default — creates purchase bill from received items
        - [ ] "Actual Rate" per item (may differ from PO rate): `AmountInput`
        - [ ] On confirm: creates purchase bill pre-filled; updates PO received qty; PO status auto-updates
    - [ ] "Cancel PO" (destructive)
    - [ ] Edit (only if no receipts yet)
    - [ ] Share WhatsApp / Print

#### PO Print:

- [ ] Business header + "PURCHASE ORDER" heading
- [ ] Supplier details: name, address, GSTIN
- [ ] PO Number, Date, Expected Delivery Date
- [ ] Line items table: Item Description, HSN, Qty, Unit, Expected Rate, Amount
- [ ] "Estimated Total Value: ₹ X" (noted as estimated)
- [ ] Terms & Conditions
- [ ] "Authorised by: [BusinessName]" signature line

---

## P17 — Transaction & Print Settings

> **Prerequisite:** P4–P16 must all exist so settings can toggle features on/off.
> **UX:** Each setting shows an inline preview or example of what changes. Toggles take effect immediately (no save button for this screen — every change auto-saves to settings store + AsyncStorage).

---

### P17.1 Transaction Settings Screen

**Route:** `/(app)/settings/transactions`

Each setting is a row with: setting name, description/example (caption), toggle switch or picker on right.

- [ ] **Invoice Number Settings section**:
    - [ ] "Auto-increment Invoice No.": toggle (default ON); when OFF: user manually enters invoice number
    - [ ] "Invoice Prefix": text field (e.g. "INV-"); applied to all new invoices
    - [ ] "Starting Invoice No.": numeric; "Current sequence: 042"; with warning when changed
    - [ ] "Reset invoice number each FY": toggle; when ON: sequence resets to 1 each April 1st
    - [ ] Same settings duplicated for: Purchase Bill No. (prefix: "PUR-"), Estimate No. (prefix: "EST-"), Challan No. (prefix: "DC-"), PO No. (prefix: "PO-"), Credit Note No. (prefix: "CN-"), Debit Note No. (prefix: "DN-"), Payment Receipt No. (prefix: "REC-")
- [ ] **Invoice Defaults section**:
    - [ ] "Default to Cash Sale": toggle; when ON: Invoice create step 1 defaults to Cash Sale mode
    - [ ] "Default Payment Mode": picker (Cash / UPI / Credit) — pre-selects on new invoice
    - [ ] "Invoice Preview Before Save": toggle; when OFF: bypasses preview → goes straight to created invoice after pressing Create
- [ ] **PO & Transport Fields section**:
    - [ ] "Show PO Number Field on Invoice": toggle; shows/hides PO No. + PO Date
    - [ ] "Show Transportation Details": toggle; shows/hides transporter/LR/vehicle fields
    - [ ] "Show E-way Bill Number": toggle; shows/hides e-way bill field
- [ ] **GST & Tax Fields section**:
    - [ ] "Show Place of Supply on Invoice": toggle
    - [ ] "Show Reverse Charge Toggle": toggle
    - [ ] "Transaction-wise Tax": toggle; when ON: a single GST rate can be applied to all items on the invoice (overriding item-level rates)
- [ ] **Pricing & Discount section**:
    - [ ] "Show Purchase Price During Sale": toggle; shows cost price as reference while making invoice (private — don't show to customer)
    - [ ] "Transaction-wise Discount": toggle; shows overall invoice discount field
    - [ ] "Show Profit While Making Invoice": toggle; shows live profit calculation during invoice creation
    - [ ] "Enable Free Item Quantity": toggle; shows "Free qty" field per line item
    - [ ] "Enable Item Count": toggle; shows total units count in invoice footer
    - [ ] "Discount During Payment": toggle; allows entering a discount when recording payment (e.g. "cash discount")
- [ ] **Additional Features section**:
    - [ ] "Add Time on Invoice": toggle; shows HH:MM on invoice alongside date
    - [ ] "Round Off Invoice Amount": picker — Auto / Manual / Off; Auto rounds to nearest ₹; Manual shows override field
    - [ ] "Link Payment to Specific Invoices": toggle; when ON, payment screen shows invoice allocation section
    - [ ] "Due Date & Payment Terms": toggle; shows due date field + Net 7/15/30 shortcuts
    - [ ] "Additional Party Fields on Invoice": numeric 0/1/2/3; configures how many custom party fields appear on invoice
    - [ ] "Additional Charges Section": toggle; shows/hides freight+packaging charges section
    - [ ] "Share Invoice as Image (JPG)": toggle; adds image export option in share sheet
    - [ ] "Passcode Required for Edit/Delete": toggle (wired to security settings P20.1)
    - [ ] "State of Supply Field": toggle (for GST inter-state, shows dropdown in invoice)
    - [ ] "Barcode Scanning in Item Search": toggle (shows camera scan button in item search)

### P17.2 Invoice Print Settings Screen

**Route:** `/(app)/settings/print`

- [ ] **Live Preview** pane (top half of screen, or side-by-side on tablet): mini-invoice preview that updates in real-time as settings change
- [ ] **Printer Type section** (affects page layout):
    - [ ] "Thermal 58mm" — compact receipt printer
    - [ ] "Thermal 80mm" — wider receipt
    - [ ] "A4 Paper" — full-size invoice
    - [ ] "A5 Paper" — half-size
    - [ ] "A4 Landscape" — rare but available
    - [ ] Changing printer type immediately updates live preview
- [ ] **Invoice Theme section**:
    - [ ] 6 theme thumbnails (mini-previews): Classic (black/white), Professional (blue header), Modern (terracotta), Minimal (no colours), Traditional (box borders), Colourful
    - [ ] Tap to select; selected shows checkmark border
    - [ ] "Primary colour" colour picker (shown for themes that support customisation)
- [ ] **Text Size section**: Small / Medium / Large radio buttons (scales font sizes)
- [ ] **Company Header section** (each toggle independently):
    - [ ] Show Logo: toggle
    - [ ] Show Business Name: toggle
    - [ ] Show Address: toggle
    - [ ] Show Phone: toggle
    - [ ] Show GSTIN: toggle
    - [ ] Show Email: toggle
    - [ ] Show Website: toggle
- [ ] **Invoice Fields section** (each toggle):
    - [ ] Show Item Code: toggle
    - [ ] Show Item Description: toggle
    - [ ] Show HSN Code: toggle
    - [ ] Show MRP: toggle
    - [ ] Show Item Images on Print (A4 only): toggle
    - [ ] Show Batch/Serial Info: toggle
    - [ ] Show Discount Column: toggle
- [ ] **Totals Section** (each toggle):
    - [ ] Show Item-wise GST: toggle (show GST per line vs just in totals)
    - [ ] Show GST Breakup (CGST/SGST separately): toggle
    - [ ] Show HSN Summary Table: toggle
    - [ ] Show Amount in Words: toggle + language selector (Hindi / English / Both)
    - [ ] Show UPI QR Code: toggle
    - [ ] QR Code size: Small / Medium / Large
- [ ] **Footer section**:
    - [ ] Footer line 1 (text area, max 100 chars): "Thank you for your business!"
    - [ ] Footer line 2 (optional): bank details for NEFT
    - [ ] Footer line 3 (optional): terms summary
    - [ ] "Show Signature Box": toggle + "Authorised Signatory" label (editable)
    - [ ] "Upload Signature Image": camera/gallery; shown above signature line

---

## P18 — GST, Tax, User, SMS, Reminder, Party & Item Settings

---

### P18.1 Taxes & GST Settings

**Route:** `/(app)/settings/gst`

- [ ] **Master GST Toggle**: "GST Registered Business" — large toggle at top
    - [ ] When OFF: ALL GST fields hidden app-wide (for non-GST businesses or businesses below ₹ 40L turnover threshold)
    - [ ] When ON: shows all sub-settings below
- [ ] **GSTIN field**: 15-char; validates format + checksum; "Same as in Business Profile" helper + "Edit Profile" link
- [ ] **GST Filing Period**: Monthly / Quarterly radio (quarterly for < ₹ 5 crore annual turnover)
- [ ] **Composite Scheme**: toggle
    - [ ] When ON: business charges flat tax (1–6% depending on type) instead of GST + ITC; disables ITC computation in all purchase bills; shows composite rate field (1% / 2% / 5% / 6%)
    - [ ] When OFF: regular GST (CGST + SGST or IGST)
- [ ] **Show HSN/SAC Code Fields**: toggle (required for annual turnover > ₹ 40L; optional below)
- [ ] **Additional Cess**: toggle; when ON, shows cess % field on item forms
- [ ] **E-invoice (GST IRN)**: toggle (currently disabled via featureFlag `GST_E_INVOICE: false`); when enabled in future: activates e-invoice generation via GST IRP API

### P18.2 Manage Tax Rates

**Route:** `/(app)/settings/tax-rates`

- [ ] **GST Slabs** (non-editable, shown for reference): 0%, 5%, 12%, 18%, 28%
- [ ] **Custom Tax Rates** (for non-GST taxes or special cases):
    - [ ] List: Name, Rate %, Used By (item count), Editable toggle
    - [ ] "+ Add Custom Rate": name (e.g. "VAT 4%"), percentage, description
    - [ ] Edit / delete (cannot delete if used by items)
- [ ] **Tax Groups** (combine CGST + SGST into a named group for display):
    - [ ] Example: "GST 18%" = CGST 9% + SGST 9%
    - [ ] List of existing groups: name, components, used by count
    - [ ] "+ Create Tax Group": name, select component rates, verify they sum correctly

### P18.3 User Management

**Route:** `/(app)/settings/users`

- [ ] **Current User section** (non-editable owner info): avatar, name, phone, "Owner" badge
- [ ] **Users List section**:
    - [ ] Each user row: name, phone, role badge (Owner/Admin/Salesperson), last active (relative: "2 hours ago"), status (Active/Revoked)
    - [ ] Swipe-left: Revoke Access (red)
- [ ] **"Invite User" button** → opens invite bottom sheet:
    - [ ] Role selection: "Salesperson (Limited)" / "Secondary Admin (Full except Settings)"
    - [ ] **Salesperson access scope**: Create invoices, Record payment in, View invoices they created, View inventory (read-only), Cannot delete transactions, Cannot access reports, Cannot change settings
    - [ ] **Secondary Admin access scope**: All of above + View all invoices, View all reports, Manage items, Manage parties, Cannot manage users, Cannot change settings
    - [ ] Phone number: `PhoneInput`
    - [ ] "Send Invite" button: sends SMS with deep link + access code
    - [ ] "Copy Invite Link" button: for WhatsApp sharing
- [ ] **Track Sales by User**: toggle; when ON: all invoices, payments tagged with creator `user_id`; reports gain "User" filter
- [ ] **User activity log**: per user, last 10 actions (invoice created, item added, etc.) — privacy-respecting (no keystroke logging)

### P18.4 Transaction SMS Settings

**Route:** `/(app)/settings/sms`

- [ ] **SMS Balance indicator** at top: "SMS Balance: 45 SMS remaining" + "Buy More" link
- [ ] **Master SMS Toggle**: "Send SMS to party on transactions"
- [ ] **SMS Settings** (shown when master toggle ON):
    - [ ] "Send SMS Copy to Myself": toggle + self phone number field (editable)
    - [ ] "Show Party's Current Balance in SMS": toggle; appends "Current balance: ₹ X" to message
    - [ ] "Include Web Invoice Link in SMS": toggle; appends shareable invoice URL
    - [ ] **Per-transaction type toggles**:
        - [ ] Sale Invoice Created: toggle
        - [ ] Payment Received: toggle
        - [ ] Credit Note Created: toggle
        - [ ] Purchase Bill Created: toggle (SMS to supplier — unusual but available)
        - [ ] Estimate Sent: toggle
        - [ ] Payment Reminder: toggle (auto-SMS on due date)
    - [ ] **SMS Template editor** (per type):
        - [ ] Template text area with variable chips: `{PartyName}`, `{InvoiceNo}`, `{Amount}`, `{BalanceAmount}`, `{BusinessName}`, `{DueDate}`, `{InvoiceLink}`
        - [ ] Tap variable chip to insert at cursor position
        - [ ] Character counter: "120/160 chars (1 SMS)"
        - [ ] Live preview: "Preview for: Rajesh Sharma" — shows rendered template with dummy data
        - [ ] "Test SMS" button: sends actual SMS to your own number

### P18.5 Payment Reminder Settings

**Route:** `/(app)/settings/reminders`

- [ ] **"Auto Reminders" Master toggle**: when ON, the app automatically sends reminders on the configured schedule
- [ ] **Reminder trigger** section:
    - [ ] "Remind me (in-app notification) for overdue invoices": toggle
    - [ ] "Send reminder to party (WhatsApp/SMS)": toggle
    - [ ] "First reminder": X days after due date; numeric picker (0 = on due date)
    - [ ] "Second reminder": Y days after (must be > first)
    - [ ] "Third reminder": Z days after (must be > second)
    - [ ] Each interval has its own ON/OFF toggle
- [ ] **Reminder Channel** per interval: WhatsApp / SMS / Both
- [ ] **Reminder Message Template**:
    - [ ] Template editor with variable chips: `{PartyName}`, `{Amount}`, `{DueDate}`, `{InvoiceNo}`, `{BusinessName}`, `{DaysOverdue}`
    - [ ] Default Hindi template: "नमस्ते {PartyName} जी, आपका ₹{Amount} का भुगतान {DaysOverdue} दिन से अधिक समय से बकाया है (Invoice: {InvoiceNo})। कृपया जल्द भुगतान करें। - {BusinessName}"
    - [ ] Default English template provided as alternative
    - [ ] Live preview
- [ ] **Self-notification settings**:
    - [ ] "Notify me of overdue invoices daily at [time]": toggle + time picker
    - [ ] "Weekly summary of outstanding": toggle + day-of-week picker (default: Monday morning)

### P18.6 Party Settings

**Route:** `/(app)/settings/party`

- [ ] **GSTIN Field on Party Forms**: toggle; when OFF: no GSTIN field when adding customers/suppliers
- [ ] **Party Grouping**: toggle; when OFF: no group field, group reports hidden
- [ ] **Additional Party Fields**: 0 / 1 / 2 / 3 picker; for each slot configured: label editor + field type (Text / Number / Date)
    - [ ] Example: Field 1 Label = "Vehicle No.", Field 2 Label = "District"
    - [ ] These fields appear on party add/edit form AND on invoice (when "Additional Party Fields on Invoice" is ON in P17.1)
- [ ] **Shipping Address**: toggle; when ON: shipping address fields appear on party form
- [ ] **Print Shipping Address on Invoice**: toggle; when ON: shipping address appears on invoice print (separate from billing address)
- [ ] **Party Self-Registration**: toggle + invite URL display (see P3.7)
- [ ] **Credit Limit Feature**: toggle; when OFF: credit limit field hidden on party form, credit limit warnings disabled

### P18.7 Item Settings

**Route:** `/(app)/settings/items`

- [ ] **Items Module**: master toggle; when OFF: Inventory tab hidden, item linking disabled in invoices (service businesses who don't track items)
- [ ] **Item Type default**: Goods / Services / Both picker; sets the default "type" for new items
- [ ] **Barcode Scanning**: toggle; when ON: camera scan icon appears in item search fields
- [ ] **Stock Maintenance default**: toggle; sets the default state of "Track Stock" toggle when adding new items
- [ ] **Item Categories**: toggle; when OFF: category field hidden from item form
- [ ] **Party-wise Item Rates**: toggle; when ON: Party Rates tab appears in item detail
- [ ] **Item Units**:
    - [ ] Default sale unit: picker from units list
    - [ ] Default purchase unit: picker from units list
    - [ ] "Manage Units" link → P2.10
- [ ] **Quantity Decimal Places**: 0 / 2 / 3 picker; affects qty entry and display in invoices
- [ ] **Item-wise Tax**: toggle; when ON: each item has its own GST rate; when OFF: single GST rate per invoice
- [ ] **Item-wise Discount**: toggle; when ON: each item has default discount % + discount field on invoice line item
- [ ] **Update Sale Price from Transaction**: toggle; when ON: after saving invoice, app asks "Do you want to update [Item]'s sale price to ₹ X?" if price differs from master
- [ ] **Additional Item Columns** (each independently toggled):
    - [ ] Batch Number: toggle (enables batch tracking feature)
    - [ ] MRP: toggle (shows MRP field on item form + invoice)
    - [ ] Manufacturing Date: toggle (batch-related)
    - [ ] Expiry Date: toggle (batch-related; enables expiry alerts)
    - [ ] Serial Number: toggle (enables serial tracking)
- [ ] **Item Description**: toggle; when ON: description field appears on item form + invoice line item

---

## P19 — Loan Accounts

> **Prerequisite:** P10 (bank accounts — loan disbursement credited to a bank account; EMI debited from a bank account).

---

### P19.1 Loan Account Setup

**Route:** `/(app)/finance/loans`

#### Loans List:

- [x] Summary card: Total Outstanding Loans: ₹ X; Next EMI Due: ₹ Y on [date]
- [x] Each loan card (100dp):
    - [x] Lender name (bodyBold) + loan type badge (Term Loan / OD / Personal)
    - [x] Loan amount vs outstanding: "₹ 5,00,000 → ₹ 3,20,000 remaining"
    - [x] Progress bar: % repaid (filled terracotta)
    - [x] Next EMI: "₹ 12,500 due DD MMM" — amber if within 7 days
- [x] FAB "+ Add Loan"

#### Add Loan Screen:

**Route:** `/(app)/finance/loans/add`

- [x] **Lender Name**: text field; "e.g. SBI, HDFC, Ramesh Bhai"
- [x] **Loan Type**: Term Loan (Fixed EMI) / Overdraft (Revolving) / Personal Loan / Mortgage / Vehicle Loan
- [x] **Loan Amount (Principal)**: `AmountInput`, required
- [x] **Disbursement Date**: `DatePickerField`; this is when money was received
- [x] **Interest Rate**: numeric + "% per annum" suffix; toggle between Simple / Compound (default Compound for term loans)
- [x] **Tenure (Months)**: numeric
- [x] **EMI Amount**: `AmountInput`; OR "Auto-calculate" toggle:
    - [x] When Auto-calculate ON: uses formula `P × r × (1+r)^n / ((1+r)^n - 1)` where r = monthly rate, n = months
    - [x] Shows calculated EMI: "Monthly EMI: ₹ 12,456"
    - [x] Shows amortisation preview: first row "Month 1: EMI ₹12,456 (Principal ₹8,456 + Interest ₹4,000)"
- [x] **EMI Date**: day of month (e.g. 5th); creates recurring reminder
- [x] **Link to Bank Account**: `BottomSheetPicker` of bank accounts (for disbursement credit + EMI debit)
- [x] **First EMI Date**: `DatePickerField`; defaults to disbursement date + 1 month
- [x] **Notes**: text area (e.g. "Home renovation loan — HDFC Branch Andheri")
- [x] **Save**: creates loan record; creates opening balance credit in linked bank account for loan amount; shows amortisation schedule preview

### P19.2 Loan EMI Recording

**Route:** `/(app)/finance/loans/[id]`

#### Loan Detail Screen:

- [x] Header card: lender name, loan type, principal ₹X, disbursement date
- [x] Outstanding Principal: ₹ X (amountLarge, prominent)
- [x] Total Interest Paid: ₹ X (caption)
- [x] Next EMI Card (amber background if within 7 days): "EMI Due on DD MMM: ₹ X"
    - [x] "Record EMI" button: tapping opens EMI recording form (P19.3)
- [x] Amortisation table (scrollable): each row = one EMI period (see P15.13 Loan Statement format)
- [x] Action bar: "Record EMI" (primary) + "Prepayment" + Edit Loan Details

#### Record EMI Screen:

**Route:** `/(app)/finance/loans/[id]/emi`

- [x] EMI Number indicator: "Paying EMI #12 of 36"
- [x] **EMI Date**: `DatePickerField` (actual payment date, not scheduled date)
- [x] **Total EMI Amount**: pre-filled from loan schedule; editable if late fee applies
- [x] **Principal Component**: auto-computed from amortisation schedule; editable
- [x] **Interest Component**: auto-computed (EMI − Principal); editable
- [x] **Late Fee** (optional): `AmountInput`; appears when actual date > scheduled date
- [x] **Paid from Bank Account**: picker
- [x] **Reference Number**: text field (bank reference for the EMI transfer)
- [x] **Save**: creates debit in bank account for total EMI; updates loan outstanding principal; marks EMI period as paid in amortisation table

#### Record Prepayment Screen:

**Route:** `/(app)/finance/loans/[id]/prepayment`

- [x] **Date**, **Amount**, **Bank Account**, **Reference**
- [x] Entire prepayment applied to principal reduction
- [x] **Effect preview**: "After this prepayment, outstanding reduces to ₹ X. New EMI: ₹ Y (if re-amortised)" OR "Remaining tenure reduces from 24 months to 18 months (if EMI kept same)"
- [x] Toggle: "Reduce EMI" / "Reduce Tenure" — user chooses re-amortisation approach
- [x] **Save**: adjusts amortisation schedule accordingly

### P19.3 Loan Statement

See P15.13 — accessible from Loan Detail screen as "View Full Statement".

---

## P20 — Security, Multi-firm & Backup

> **Prerequisite:** All of P1–P19 should be stable before building security/backup — we don't want to brick the app.

---

### P20.1 App Security Settings

**Route:** `/(app)/settings/security`

- [ ] **Set / Change PIN section**:
    - [ ] "Set 4-digit PIN": navigates to PIN setup screen
    - [ ] PIN Setup screen: 4 large input cells (same style as OTP), "Confirm PIN" step
    - [ ] PIN stored hashed in AsyncStorage (not sent to server)
    - [ ] "Change PIN": requires current PIN first
    - [ ] "Remove PIN": requires current PIN + `ConfirmationModal`
- [ ] **Biometric Authentication**:
    - [ ] "Use Fingerprint / Face ID": toggle (uses `expo-local-authentication`); only shown if device supports biometrics (`LocalAuthentication.hasHardwareAsync()`)
    - [ ] When ON: on app open/resume, shows fingerprint/face prompt first; PIN as fallback
- [ ] **Auto-lock section**:
    - [ ] "Lock app after": picker — Immediately / 1 minute / 5 minutes / 15 minutes / 30 minutes / Never
    - [ ] When locked: shows lock screen with PIN entry (and biometric option)
    - [ ] Business name shown on lock screen
- [ ] **Forgot PIN flow**:
    - [ ] On lock screen: "Forgot PIN?" link
    - [ ] Sends OTP ### P21.1 Data Verification

**Route:** `/(app)/utilities/verify`

- [x] **"Run Verification" button** (primary, prominent)
- [x] **Progress** (while running): "Checking ledger balances... (1/4)", "Checking stock counts... (2/4)", "Checking orphaned records... (3/4)", "Checking GST data... (4/4)"
- [x] **Results screen** (after run):
    - [x] Green "All Clear" card if no issues
    - [x] Amber "X issues found" card if issues exist
    - [x] **Issues list** with categories:
        - [x] Ledger Mismatch: "Customer [Name]'s ledger balance (₹ X) doesn't match sum of transactions (₹ Y)"
            - [x] "Fix Automatically" button: recalculates and corrects the stored balance
        - [x] Stock Anomaly: "Item [Name]: stored stock (X) doesn't match sum of stock operations (Y)"
            - [x] "Fix Automatically" button: recalculates running stock
        - [x] Orphaned Payment: "Payment REC-012 is linked to Invoice INV-045 but that invoice was deleted"
            - [x] "Mark as Unlinked" button: converts to advance payment
        - [x] Missing HSN: "X invoices have items without HSN codes — GSTR-1 will be incomplete"
            - [x] "View Affected Invoices" link
        - [x] Duplicate Invoice Numbers: "INV-042 appears twice"
            - [x] "View Duplicates" link
    - [x] Each issue: expandable with details + recommended action
- [x] **Auto-run trigger**: automatically runs on Close FY (P21.6) and when restoring backup

### P21.2 In-App Calculator

**Accessible from:** Anywhere via long-press on any `AmountInput` field, or from "More" tab

- [x] Full-screen modal calculator overlay (not a separate route)
- [x] Standard calculator layout: digits 0–9, `.`, `+`, `−`, `×`, `÷`, `%`, `C` (clear), `=`
- [x] Display: shows current expression + result
- [x] **Tax shortcut button** (labelled "GST"):
    - [x] Input amount → tap GST → shows dropdown of rate slabs
    - [x] On slab selection: shows "Base: ₹ X · GST 18%: ₹ Y · Total: ₹ Z"
    - [x] Toggle between "Add GST" (exclusive) and "Extract GST" (inclusive)
- [x] **EMI shortcut button**:
    - [x] Three inputs: Principal, Rate (% p.a.), Tenure (months)
    - [x] "Calculate" button → shows Monthly EMI: ₹ X, Total Payment: ₹ Y, Total Interest: ₹ Z
- [x] **"Use This Amount" button** at bottom: pastes result into the field that opened the calculator

### P21.3 Import Items from Excel

See P2.12 — accessible from Inventory list + More tab + here.

- [x] Excel file picker
- [x] Column mapping UI
- [x] Validation step (checking for duplicates, missing required fields)
- [x] Batch import processing with progress bar

### P21.4 Export Items to PDF / Excel

See P2.13 — accessible from Inventory list + here.

- [x] Export to PDF (formatted list)
- [x] Export to Excel (.xlsx)
- [x] Share sheet integration

### P21.5 Import Parties from Excel

See P3.8 — accessible from Parties screen + here.

- [x] Party Excel import with identical flow to item import

### P21.6 Close Financial Year

**Route:** `/(app)/utilities/close-fy`

- [x] **Trigger**: shown as a notification badge / prompt when current date is April 1st (or January 1st for Jan-Dec FY) of the next FY
- [x] **Step 1 — FY Summary**:
    - [x] "You are about to close FY 2024-25 (1 Apr 2024 – 31 Mar 2025)"
    - [x] Summary card: Total Sale ₹ X · Total Purchase ₹ X · Net Profit ₹ X
    - [x] Outstanding receivable ₹ X · Outstanding payable ₹ X
    - [x] Stock value ₹ X (carried forward)
    - [x] "Proceed" button
- [x] **Step 2 — Data Verification**:
    - [x] Automatically runs P21.1 verification
    - [x] If issues found: "Resolve issues before closing FY" (blocks FY close until resolved or explicitly overridden)
    - [x] "Override and close anyway" option (for advanced users)
- [x] **Step 3 — Configuration**:
    - [x] "Reset invoice number sequence to 1": toggle (default ON)
    - [x] "Keep all old FY data accessible in reports": always ON (info only)
    - [x] "Archive old FY (make read-only)": toggle (default ON)
- [x] **Step 4 — Confirmation**:
    - [x] `ConfirmationModal` with warning: "Closing FY 2024-25 will freeze all transactions before 1 Apr 2025. You cannot add or edit transactions in the closed FY."
    - [x] User types "2024-25" in text field to confirm
- [x] **Processing** (progress bar):
    - [x] "Creating opening balance entries for all parties..."
    - [x] "Creating opening cash balance for FY 2025-26..."
    - [x] "Creating opening bank balances..."
    - [x] "Archiving FY 2024-25..."
    - [x] "Resetting invoice sequence..."
    - [x] "Done ✓"
- [x] **Post-close**: app now operates in FY 2025-26; old FY accessible via "Previous FY" filter/toggle visible in all list screens and reportsfor irreversible action)
    - [ ] Progress bar: "Restoring... 45%" → "Almost done..." → "Restore complete ✓"
    - [ ] App restarts (navigate to login to re-auth with restored data)
- [ ] **"Restore from Google Drive"** button (when Drive connected): lists available backup files in Drive → user selects → same confirmation flow

---

## P21 — Utilities

---

### P21.1 Data Verification

**Route:** `/(app)/utilities/verify`

- [ ] **"Run Verification" button** (primary, prominent)
- [ ] **Progress** (while running): "Checking ledger balances... (1/4)", "Checking stock counts... (2/4)", "Checking orphaned records... (3/4)", "Checking GST data... (4/4)"
- [ ] **Results screen** (after run):
    - [ ] Green "All Clear" card if no issues
    - [ ] Amber "X issues found" card if issues exist
    - [ ] **Issues list** with categories:
        - [ ] Ledger Mismatch: "Customer [Name]'s ledger balance (₹ X) doesn't match sum of transactions (₹ Y)"
            - [ ] "Fix Automatically" button: recalculates and corrects the stored balance
        - [ ] Stock Anomaly: "Item [Name]: stored stock (X) doesn't match sum of stock operations (Y)"
            - [ ] "Fix Automatically" button: recalculates running stock
        - [ ] Orphaned Payment: "Payment REC-012 is linked to Invoice INV-045 but that invoice was deleted"
            - [ ] "Mark as Unlinked" button: converts to advance payment
        - [ ] Missing HSN: "X invoices have items without HSN codes — GSTR-1 will be incomplete"
            - [ ] "View Affected Invoices" link
        - [ ] Duplicate Invoice Numbers: "INV-042 appears twice"
            - [ ] "View Duplicates" link
    - [ ] Each issue: expandable with details + recommended action
- [ ] **Auto-run trigger**: automatically runs on Close FY (P21.6) and when restoring backup

### P21.2 In-App Calculator

**Accessible from:** Anywhere via long-press on any `AmountInput` field, or from "More" tab

- [ ] Full-screen modal calculator overlay (not a separate route)
- [ ] Standard calculator layout: digits 0–9, `.`, `+`, `−`, `×`, `÷`, `%`, `C` (clear), `=`
- [ ] Display: shows current expression + result
- [ ] **Tax shortcut button** (labelled "GST"):
    - [ ] Input amount → tap GST → shows dropdown of rate slabs
    - [ ] On slab selection: shows "Base: ₹ X · GST 18%: ₹ Y · Total: ₹ Z"
    - [ ] Toggle between "Add GST" (exclusive) and "Extract GST" (inclusive)
- [ ] **EMI shortcut button**:
    - [ ] Three inputs: Principal, Rate (% p.a.), Tenure (months)
    - [ ] "Calculate" button → shows Monthly EMI: ₹ X, Total Payment: ₹ Y, Total Interest: ₹ Z
- [ ] **"Use This Amount" button** at bottom: pastes result into the field that opened the calculator

### P21.3 Import Items from Excel

See P2.12 — accessible from Inventory list + More tab + here.

### P21.4 Export Items to PDF / Excel

See P2.13 — accessible from Inventory list + here.

### P21.5 Import Parties from Excel

See P3.8 — accessible from Parties screen + here.

### P21.6 Close Financial Year

**Route:** `/(app)/utilities/close-fy`

- [ ] **Trigger**: shown as a notification badge / prompt when current date is April 1st (or January 1st for Jan-Dec FY) of the next FY
- [ ] **Step 1 — FY Summary**:
    - [ ] "You are about to close FY 2024-25 (1 Apr 2024 – 31 Mar 2025)"
    - [ ] Summary card: Total Sale ₹ X · Total Purchase ₹ X · Net Profit ₹ X
    - [ ] Outstanding receivable ₹ X · Outstanding payable ₹ X
    - [ ] Stock value ₹ X (carried forward)
    - [ ] "Proceed" button
- [ ] **Step 2 — Data Verification**:
    - [ ] Automatically runs P21.1 verification
    - [ ] If issues found: "Resolve issues before closing FY" (blocks FY close until resolved or explicitly overridden)
    - [ ] "Override and close anyway" option (for advanced users)
- [ ] **Step 3 — Configuration**:
    - [ ] "Reset invoice number sequence to 1": toggle (default ON)
    - [ ] "Keep all old FY data accessible in reports": always ON (info only)
    - [ ] "Archive old FY (make read-only)": toggle (default ON)
- [ ] **Step 4 — Confirmation**:
    - [ ] `ConfirmationModal` with warning: "Closing FY 2024-25 will freeze all transactions before 1 Apr 2025. You cannot add or edit transactions in the closed FY."
    - [ ] User types "2024-25" in text field to confirm
- [ ] **Processing** (progress bar):
    - [ ] "Creating opening balance entries for all parties..."
    - [ ] "Creating opening cash balance for FY 2025-26..."
    - [ ] "Creating opening bank balances..."
    - [ ] "Archiving FY 2024-25..."
    - [ ] "Resetting invoice sequence..."
    - [ ] "Done ✓"
- [ ] **Post-close**: app now operates in FY 2025-26; old FY accessible via "Previous FY" filter/toggle visible in all list screens and reports

---

## P22 — Standalone & Integration Features

---

### P22.1 Online / Offline Operation

- [x] `WriteQueueService` (built in P0.8) hardened with:
    - [x] Maximum queue size: 500 mutations (prevent runaway offline usage)
    - [x] Queue persistence across app kills: stored in `AsyncStorage` not just memory
    - [x] Priority queue: write operations that block others execute first (e.g. `create_invoice` before `update_item`)
    - [x] **Sync log screen** (`/(app)/settings/sync-log`):
        - [x] List of pending + recent sync operations: type, table, timestamp, status
        - [x] Failed operations: retry button + error message
        - [x] "Clear failed" button
        - [x] Useful for diagnosing sync issues
- [x] **"Last synced: X minutes ago"** persistent header indicator: updates every minute when app is open
- [x] **Conflict resolution modal** (built in P0.8): fires when server version updated while offline

### P22.2 Multi-device Sync (Mobile ↔ Desktop)

- [ ] **Supabase Realtime subscription** on all critical tables: `invoices`, `payments`, `inventory_items`, `customers`, `suppliers`
    - [ ] On INSERT/UPDATE/DELETE events: update relevant Zustand store without full refetch
    - [ ] Debounced: max 1 store update per 2 seconds per table (prevent thrashing when bulk imports run)
- [ ] **Notification when another device acts**: "New invoice INV-042 created by Ramesh (Mobile)" → in-app notification badge; tap → navigate to that invoice
- [ ] **Expo Web target**: `npx expo export --platform web` produces a Progressive Web App
    - [ ] Desktop sidebar navigation (replaces bottom tabs when viewport > 768px)
    - [ ] Sidebar items: Dashboard, Invoices, Purchases, Payments, Inventory, Parties, Reports, Settings
    - [ ] Sidebar collapses to icon-only mode on narrow desktop windows
- [ ] **Keyboard shortcuts** (web/desktop only, via `useKeyboardShortcuts` hook):
    - [ ] `Alt + S`: New Sale Invoice
    - [ ] `Alt + P`: New Purchase Bill
    - [ ] `Alt + R`: Receive Payment
    - [ ] `Alt + E`: Add Expense
    - [ ] `Ctrl + F` / `Cmd + F`: Focus global search
    - [ ] `Escape`: Navigate back / close modal
    - [ ] `?`: Show keyboard shortcuts help overlay

### P22.3 Export Data to Tally

**Route:** `/(app)/utilities/tally-export`

- [ ] **Period selector**: date range (default: current FY)
- [ ] **What to export**: checkboxes — Sales Vouchers, Purchase Vouchers, Payment Vouchers, Receipt Vouchers, Journal Entries, Party Master (Customers/Suppliers), Item Master
- [ ] **Tally version**: TallyPrime / Tally ERP 9 (affects XML schema slightly)
- [ ] **Ledger mapping** (important for Tally import):
    - [ ] "Sales Account name in Tally": text field (default "Sales Account")
    - [ ] "Purchase Account name in Tally": text field
    - [ ] "Cash Account name in Tally": text field (default "Cash")
    - [ ] "Bank Account name in Tally": per bank account configured in app → Tally ledger name
    - [ ] "GST Output Tax ledger name": "Output CGST", "Output SGST", "Output IGST"
    - [ ] "GST Input Tax ledger name": "Input CGST", etc.
- [ ] **Validation before export**: checks for unmapped ledgers; shows warning list "5 transactions reference 'HDFC Bank' but no Tally ledger mapped — these will be skipped"
- [ ] **Generate XML button**: produces `TallyData_[period].xml`
- [ ] **Share/Save**: share to Files app, WhatsApp (for sending to CA/accountant), Email
- [ ] **Instructions card**: "How to import in TallyPrime" — expandable step-by-step:
    1. Open TallyPrime
    2. Gateway of Tally → Import Data → Vouchers
    3. Select this XML file
    4. Verify imported data

### P22.4 Low Stock Management

Built from P2.5 (threshold), P8.3 (dashboard alert), P14.4 (report):

- [ ] **Push notification** when item crosses threshold: triggered on `stock_operations` INSERT via Supabase Edge Function → sends push notification via Expo Push Notification Service (EPN)
    - [ ] Notification: "Low stock alert: [Item Name] is now at [qty] [unit] (threshold: [threshold])"
    - [ ] Tap notification → Item Detail screen
- [ ] **Low stock badge** on Inventory tab icon (bottom tab bar): count of low-stock items
- [ ] **"Create PO" from low stock report** (P14.4): see that section for details
- [ ] **Reorder quantity suggestion algorithm**: avg daily sales (last 30 days) × 30 (days of stock) × 1.2 (safety factor) — shown in Low Stock Report

### P22.5 Expiring Item Alerts

Built from P2.6 (expiry dates), P8.3 (dashboard alert), P14.9 (batch report):

- [ ] **Push notification** 30 days before earliest expiry: "⚠ [Item]: Batch [X] expires in 30 days ([qty] units remaining)"
- [ ] **10-day reminder**: second push notification 10 days before
- [ ] **Dashboard badge**: "X items expiring in 30 days" (from P8.3)
- [ ] **Expiry status in item list**: orange "EXP SOON" chip on items with batches expiring within 30 days
- [ ] **Write-off workflow**: from batch report, "Write Off Expired" button creates a stock adjustment for expired batches with reason "Expiry write-off" and updates stock

### P22.6 Business Logo on All Documents

Built from P1.3 (logo upload in business profile):

- [ ] Logo stored in Supabase Storage: `logos/[businessId]/logo.jpg`
- [ ] Logo included in `pdfService` on all document types: Invoice, Credit Note, Debit Note, Estimate, Delivery Challan, Purchase Order, Payment Receipt
- [ ] **Logo position setting** (in P17.2 — Print Settings):
    - [ ] Top-left (default)
    - [ ] Top-centre
    - [ ] Top-right
- [ ] **Logo size**: Small (32pt) / Medium (48pt) / Large (64pt)
- [ ] Logo shown on thermal print (scaled down appropriately)

### P22.7 Multiple Payment Modes on Single Invoice

Built from P4.4 (invoice payment section):

- [ ] **"Split Payment" toggle** in invoice payment section (P4.4): when ON:
    - [ ] Shows multiple payment rows
    - [ ] Each row: mode selector + amount `AmountInput`
    - [ ] "+ Add payment mode" button (max 4 modes per invoice)
    - [ ] All payment amounts must sum to total payment amount: "Unallocated: ₹ X" live counter
    - [ ] Save: creates separate `payment` records for each mode; all linked to same invoice
- [ ] **Print shows split**: "Received ₹ X via Cash + ₹ Y via UPI (Ref: UTR123)"
- [ ] **Payment mode filter in reports** correctly handles split-mode payments

### P22.8 My Online Store

**Route:** `/(app)/store`

#### Store Setup:

- [ ] Store intro screen (when no store set up yet): illustration + "Create your free online store" headline + "Setup My Store" button
- [ ] **Store Settings** (accessible via store kebab menu → Settings):
    - [ ] Store Name (defaults to business name)
    - [ ] Store Banner Image: camera/gallery, 16:9 ratio, compressed
    - [ ] Store Description: text area (shown to customers on web)
    - [ ] Contact Number: phone (defaults to business phone)
    - [ ] Store URL slug: auto-generated from business name (editable); shows full URL: "yourstore.in/shop/sharma-tiles"
    - [ ] "Store Active" toggle: when OFF, store page shows "Coming Soon"

#### Manage Store Items:

- [ ] **Store Items List**: subset of inventory items (those added to the store)
    - [ ] Each item: image thumbnail, name, online price, stock, "Active on store" toggle
- [ ] **"Add Items to Store" button**: opens multi-select inventory picker; tap to add
- [ ] **Per-item store settings** (tap item in store list):
    - [ ] Online Price: `AmountInput` (can differ from shop price — e.g. MRP for online, less for walk-in)
    - [ ] Online Description: text area (product detail for customers)
    - [ ] Images: up to 5 product photos (camera/gallery)
    - [ ] "Active on store": toggle (hide specific items without removing from store)
- [ ] **Store Preview button**: opens a `WebView` showing the actual store web page as customer sees it

#### Share Store:

- [ ] "Share Store Link" button (prominent): WhatsApp / Copy / QR Code
- [ ] QR code: high-res, downloadable, printable (for display at shop counter or business card)

#### Incoming Orders:

- [ ] **Orders List** (within Store screen):
    - [ ] Each order: customer name + phone, items + qty, order date, total value (estimated), status (New / Confirmed / Invoiced / Cancelled)
    - [ ] "New" orders: amber badge + push notification on order receipt
    - [ ] Tap order → Order Detail
- [ ] **Order Detail**:
    - [ ] Customer details (name, phone, address from web form)
    - [ ] Items list: item name, qty, online price per item, subtotal
    - [ ] Order total (estimated)
    - [ ] "Call Customer" button (tel: link)
    - [ ] "WhatsApp Customer" button: opens WhatsApp with pre-filled "Your order is confirmed" message
    - [ ] **"Create Invoice from Order" button** (primary): navigates to Invoice Create with customer + items pre-filled; user confirms prices and records payment

#### Store Web Page (served by Supabase Edge Function or Vercel):

- [ ] Public URL: `yourstore.in/shop/[slug]`
- [ ] Mobile-first responsive design
- [ ] Shows: store banner, store name, description, contact number
- [ ] Product grid: image, name, price, "Add to Cart"
- [ ] Simple cart: item list + qty + total
- [ ] Checkout form: Name, Phone, Address, "Place Order" button
- [ ] On submit: creates order in app database → app owner receives push notification

### P22.9 WhatsApp Business Integration

- [ ] **Share on WhatsApp** (present everywhere):
    - [ ] Uses `Linking.openURL('whatsapp://send?phone=91XXXXXXXXXX&text=[encoded_message]')` when party phone is known
    - [ ] Uses `Linking.openURL('whatsapp://send?text=[encoded_message]')` for direct share (user selects contact)
- [ ] **Message Templates** (configured in P18.4, P18.5):
    - [ ] Invoice created: "नमस्ते {Name} जी, आपकी invoice {InvNo} ₹{Amount} की बन गई है। PDF attached. — {Business}"
    - [ ] Payment received: "नमस्ते {Name} जी, ₹{Amount} payment receive हुआ। Balance: ₹{Balance}. — {Business}"
    - [ ] Payment reminder: "Dear {Name} ji, ₹{Amount} payment is due (Invoice {InvNo}). Please arrange payment. — {Business}"
    - [ ] Statement: "Dear {Name} ji, your account statement is attached. Outstanding: ₹{Balance}. — {Business}"
    - [ ] All templates editable in P18.4 / P18.5
- [ ] **Document attachment**: PDF generated in background → share to WhatsApp with file attachment (uses `expo-sharing` which delegates to native share sheet → user picks WhatsApp from share sheet)
- [ ] **WhatsApp Status / Story sharing** (for "Share as Image" feature): generates invoice as image → user can share to WhatsApp Status directly

---

## Feature × Phase Coverage Matrix

| Feature (from requirements)              | Phase(s)      |
| ---------------------------------------- | ------------- |
| View Cash-in-hand                        | P8.1, P10.1   |
| View Stock value                         | P8.2, P14.1   |
| View Bank balance                        | P8.1, P10.2   |
| View overall Business Status Dashboard   | P8            |
| Sale Report                              | P11.1         |
| Purchase Report                          | P11.2         |
| Day Book                                 | P11.3         |
| All Transactions                         | P11.4         |
| Bill wise Profit                         | P11.5         |
| Profit & Loss                            | P11.6         |
| Cashflow                                 | P11.7         |
| Balance Sheet                            | P11.8         |
| Party Statement                          | P12.1         |
| Party wise P&L                           | P12.2         |
| All Parties Report                       | P12.3         |
| Party Report by Items                    | P12.4         |
| Sale/Purchase by Party                   | P12.5         |
| Sale/Purchase by Party Group             | P12.6         |
| GSTR-1                                   | P13.2         |
| GSTR-2                                   | P13.3         |
| GSTR-3B                                  | P13.4         |
| GST Detail Report                        | P13.5         |
| GSTR-9                                   | P13.6         |
| Sale Summary by HSN                      | P13.7         |
| Stock Summary Report                     | P14.1         |
| Item Report by Party                     | P14.2         |
| Item Wise Profit/Loss                    | P14.3         |
| Low Stock Summary Report                 | P14.4         |
| Item Detail Report                       | P14.5         |
| Stock Detail Report                      | P14.6         |
| Sale/Purchase by Item Category           | P14.7         |
| Stock Summary by Item Category           | P14.8         |
| Item Batch Report                        | P14.9         |
| Item Serial Report                       | P14.10        |
| Item Wise Discount                       | P14.11        |
| Bank Statement                           | P15.1         |
| Discount Report                          | P15.2         |
| Tax Report                               | P15.3         |
| Tax Rate Report                          | P15.4         |
| Expense Transaction Report               | P15.5         |
| Expense Category Report                  | P15.6         |
| Expense Item Report                      | P15.7         |
| Sale/Purchase Order Transaction Report   | P15.8         |
| Sale/Purchase Order Item Report          | P15.9         |
| Other Income Transaction Report          | P15.10        |
| Other Income Category Report             | P15.11        |
| Other Income Item Report                 | P15.12        |
| Loan Statement                           | P15.13        |
| Create/View Sale Invoices                | P4            |
| Record/View Payment-In                   | P5            |
| Create/View Sale Return (Credit Notes)   | P16.1         |
| Create/View Estimate/Quotation           | P16.3         |
| Create/View Delivery Challan             | P16.4         |
| Create/View Purchase Bills               | P6            |
| Record/View Payment-Out                  | P7            |
| Create/View Purchase Return (Debit Note) | P16.2         |
| Create/View Purchase Order               | P16.5         |
| Track Business Expenses                  | P9.1–P9.2     |
| Create Expense Categories                | P9.3          |
| Track Other Income                       | P9.4–P9.5     |
| Create Other Income Categories           | P9.6          |
| Manage Bank Accounts / E-wallets         | P10.2–P10.5   |
| View Cash in Hand                        | P10.1         |
| Manage Cheques                           | P10.7–P10.8   |
| Manage Loan Accounts                     | P19           |
| My Online Store                          | P22.8         |
| Change App language                      | P1.1, P1.6    |
| Set Business currency                    | P1.6          |
| Configure Decimal Places                 | P1.6          |
| Configure Date Format                    | P1.6          |
| Toggle Warning for unsaved changes       | P1.6          |
| Change App Theme (Light/Dark)            | P1.6          |
| Enable Passcode/Fingerprint Security     | P20.1         |
| Enable Multi-firm management             | P20.2         |
| Enable Auto backup (Google Drive)        | P20.3         |
| Auto-increment Invoice/Bill Number       | P17.1         |
| Set "Cash Sale" as default               | P17.1         |
| Add PO Detail                            | P17.1         |
| Add/Print Time on Invoice                | P17.1         |
| Inclusive/Exclusive tax on rate          | P17.1         |
| Display Purchase Price during txn        | P17.1         |
| Free Item Quantity                       | P17.1         |
| Item Count on Invoice                    | P17.1         |
| Barcode Scanning for items               | P17.1         |
| Transaction Wise Tax                     | P17.1         |
| Transaction Wise Discount                | P17.1         |
| Round Off Transaction Amount             | P17.1         |
| Share invoice as Image                   | P17.1         |
| Passcode for edit/delete transactions    | P17.1         |
| Discount during payment                  | P17.1         |
| Link Payment to invoices                 | P17.1         |
| Due date and payment terms               | P17.1         |
| Invoice Preview before save              | P17.1         |
| Additional Fields (Party details)        | P17.1         |
| Transportation Details                   | P17.1         |
| Additional Charges                       | P17.1         |
| Show Profit while making Invoice         | P17.1         |
| Reverse Charge                           | P17.1         |
| State of Supply                          | P17.1         |
| E-way Bill no                            | P17.1         |
| Configure Transaction Pre-fixes          | P17.1         |
| Select Printer Type                      | P17.2         |
| Select Print Themes and Colors           | P17.2         |
| Configure Printer Settings               | P17.2         |
| Configure Print Company Info/header      | P17.2         |
| Configure Totals & Taxes display         | P17.2         |
| Configure Invoice Footer                 | P17.2         |
| Manage Tax List                          | P18.2         |
| Enable/Configure GST                     | P18.1         |
| Configure HSN/SAC Code                   | P18.1         |
| Enable Additional Cess                   | P18.1         |
| Enable Composite Scheme                  | P18.1         |
| Assign Salesperson (limited access)      | P18.3         |
| Assign Secondary Admin access            | P18.3         |
| Track sales and purchases by user        | P18.3         |
| Send SMS to Party                        | P18.4         |
| SMS Copy to self                         | P18.4         |
| Show party's balance in SMS              | P18.4         |
| Show web invoice link in SMS             | P18.4         |
| Configure auto-messaging                 | P18.4         |
| Enable Self Payment Reminder             | P18.5         |
| Configure trigger days for reminders     | P18.5         |
| In-app notifications for follow-ups      | P18.5         |
| Customize Reminder message               | P18.5         |
| Enable GSTIN number field (Party)        | P18.6         |
| Enable Party Grouping                    | P18.6         |
| Enable Party Additional Fields           | P18.6         |
| Enable Party Shipping Address            | P18.6         |
| Enable Print Shipping Address            | P18.6         |
| Invite parties via link                  | P18.6         |
| Enable Items module                      | P18.7         |
| Configure Item Type                      | P18.7         |
| Enable Barcode Scanning (Items)          | P18.7         |
| Enable Stock Maintenance                 | P18.7         |
| Configure Item Units                     | P18.7         |
| Configure Default Units                  | P18.7         |
| Enable Item Categories                   | P18.7         |
| Enable Party-wise item rates             | P18.7         |
| Configure Quantity decimal places        | P18.7         |
| Enable Item-wise tax                     | P18.7         |
| Enable Item-wise discounts               | P18.7         |
| Enable Update Sale Price from TXN        | P18.7         |
| Enable Additional item columns           | P18.7         |
| Enable Item Description                  | P18.7         |
| Auto Backup to Google Drive              | P20.3         |
| Backup to local phone storage            | P20.4         |
| Backup to email                          | P20.5         |
| Restore backup from file                 | P20.6         |
| Verify my data                           | P21.1         |
| Open Calculator                          | P21.2         |
| Import Items (from Excel)                | P2.12 / P21.3 |
| Export Items (to PDF/Excel)              | P2.13 / P21.4 |
| Import parties (from Excel)              | P3.8 / P21.5  |
| Close Financial Year                     | P21.6         |
| Operate companies Online/Offline         | P0.8, P22.1   |
| Multi-device Sync                        | P22.2         |
| Keyboard Shortcuts (Desktop)             | P22.2         |
| Export data to Tally                     | P22.3         |
| Manage low stock alerts                  | P22.4         |
| Manage expiring item alerts              | P22.5         |
| Brand invoices with logo                 | P22.6 / P1.5  |
| Collect payments via multiple modes      | P22.7 / P4.4  |

---

## Phase Exit Checklist (enforce before starting next phase)

Before marking any phase complete and beginning the next:

- [ ] All `- [ ]` checkpoints in the phase are implemented
- [ ] `npm test -- --testPathPattern="[phase paths]"` → 0 failures
- [ ] New code has ≥ 80% line coverage (checked via `--coverage`)
- [ ] `npm run lint` → 0 new errors
- [ ] i18n parity check passes: every new key in `en.json` present in `hi.json`
- [ ] Manual smoke test with `lng: 'hi'` (Hindi locale): all new screens readable and functional
- [ ] Manual test on low-end Android (≥ 2GB RAM): no UI jank, no crashes
- [ ] Maestro E2E flows for the phase pass on physical device
- [ ] No regressions on previous phase Maestro flows
- [ ] Every list screen has been tested with: 0 items (empty state), 1 item, 50+ items (pagination)
- [ ] Every form has been tested: required field empty → validation fires; back press with dirty form → confirmation modal

---

_Total checkpoints: 1,400+_
_All 163 product features from the original requirements covered._
_Every phase strictly ordered — no phase can begin until its prerequisites are implemented and passing._
_This document is the single source of truth for the complete enterprise application build._
