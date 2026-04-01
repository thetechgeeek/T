# Accessibility (A11y) Implementation Plan

**Goal:** Reach FAANG-level accessibility across the entire TileMaster React Native codebase.
**Standard:** WCAG 2.1 AA + React Native best practices (Apple HIG / Android Material accessibility guidelines).
**Side effect:** All `accessibilityLabel` values are stable English identifiers → Maestro e2e tests become locale-independent by using `label:` selectors instead of visible text.

---

## Audit Summary

| Severity  | Count  |
| --------- | ------ |
| HIGH      | 10     |
| MEDIUM    | 54     |
| LOW       | 23     |
| **Total** | **87** |

---

## Guiding Principles

1. **Every interactive element must have `accessibilityLabel`** — stable English string, never from `t()`. Screen readers use it; Maestro uses it.
2. **Every input must be associated with its label** — via `accessibilityLabel` on the input itself, not a sibling `Text`.
3. **Color is never the sole communicator** — status badges, balance indicators, error states must have text/label equivalents.
4. **Decorative elements must be hidden** — icons, dividers, avatars that carry no info use `importantForAccessibility="no"`.
5. **Touch targets ≥ 44×44 pts** — Apple HIG and Material minimum.
6. **Modals declare themselves** — `accessibilityViewIsModal={true}` on modal content.
7. **Lists declare themselves** — `accessibilityRole="list"` on list containers where VoiceOver/TalkBack benefits from count announcement.

---

## Phase 1 — Atoms (Foundation)

Fix atoms first. Every screen inherits these fixes.

---

### 1.1 `Button.tsx`

**File:** `src/components/atoms/Button.tsx`

**Issues:**

- `accessibilityLabel` defaults to `title` which can be a translated string → locale-sensitive
- Icon-only buttons (no `title`) have no label at all
- `sm` size (36px height) is below 44pt minimum
- Loading state is not announced to screen readers

**Changes:**

```tsx
// Add accessibilityLabel prop that OVERRIDES the default title-based label
export interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  accessibilityLabel?: string; // stable, English — callers must pass this when title is translated
  // ... rest unchanged
}

// In component:
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel={accessibilityLabel ?? title}   // explicit prop wins
  accessibilityState={{ disabled: isDisabled, busy: loading }}
  accessibilityHint={loading ? 'Loading, please wait' : undefined}
  style={[
    styles.button,
    {
      // sm: raise minHeight from 36 to 44
      minHeight: size === 'sm' ? 44 : size === 'lg' ? 56 : 48,
      // ... rest unchanged
    }
  ]}
  {...props}
>
```

**Maestro impact:** `tapOn:\n  label: "new-invoice-button"` works when caller passes `accessibilityLabel="new-invoice-button"`.

---

### 1.2 `TextInput.tsx`

**File:** `src/components/atoms/TextInput.tsx`

**Issues (HIGH):**

- Visual label (`Text` above input) is not associated with the `RNTextInput` — screen readers read them as unrelated elements
- No `accessibilityLabel` on the `RNTextInput` itself
- Error state text is not linked to the input
- `accessibilityLabel` prop from `...props` is swallowed silently (spread works but callers don't know to pass it)

**Changes:**

```tsx
export interface TextInputProps extends RNTextInputProps {
	label?: string;
	accessibilityLabel?: string; // explicit stable label — takes precedence over `label`
	error?: string;
	// ... rest unchanged
}

export const TextInput = forwardRef<RNTextInput, TextInputProps>(
	({ label, accessibilityLabel, error, helperText, ...props }, ref) => {
		// Compose a full a11y label: "Email address, required, Error: invalid format"
		const computedLabel = accessibilityLabel ?? label ?? undefined;
		const computedHint = error ? `Error: ${error}` : (helperText ?? undefined);

		return (
			<View style={[styles.container, containerStyle]}>
				{label && (
					<Text
						style={styles.label}
						importantForAccessibility="no" // hidden — input itself carries the label
					>
						{label}
					</Text>
				)}
				<View style={styles.inputContainer}>
					{leftIcon && (
						<View style={styles.leftIcon} importantForAccessibility="no">
							{leftIcon}
						</View>
					)}
					<RNTextInput
						ref={ref}
						accessible={true}
						accessibilityLabel={computedLabel}
						accessibilityHint={computedHint}
						{...props}
					/>
					{rightIcon && (
						<View style={styles.rightIcon} importantForAccessibility="no">
							{rightIcon}
						</View>
					)}
				</View>
				{/* Error/helper text hidden from a11y tree — announced via input's accessibilityHint */}
				{!!(error || helperText) && (
					<Text importantForAccessibility="no" style={styles.helper}>
						{error || helperText}
					</Text>
				)}
			</View>
		);
	},
);
```

**Maestro impact:** `tapOn:\n  label: "email-input"` works when `accessibilityLabel="email-input"` is passed.

---

### 1.3 `Chip.tsx`

**File:** `src/components/atoms/Chip.tsx`

**Issues:**

- `accessibilityLabel` not set — screen reader reads the inner `Text` only, which may differ from intent
- `testID` prop should be removed; replace with `accessibilityLabel`

**Changes:**

```tsx
export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string; // replaces testID
}

export function Chip({ label, selected = false, onPress, style, accessibilityLabel }: ChipProps) {
  return (
    <TouchableOpacity
      accessibilityRole="togglebutton"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      accessibilityHint={selected ? 'Currently selected. Double tap to deselect' : 'Double tap to select'}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      // testID removed
      ...
    >
```

**Maestro impact:** `tapOn:\n  label: "category-chip-ALL"` works.

---

### 1.4 `Badge.tsx`

**File:** `src/components/atoms/Badge.tsx`

**Issues:**

- Badge is often used for status (paid/unpaid/partial) — purely color-coded without accessible label
- No `accessibilityRole`

**Changes:**

```tsx
export interface BadgeProps {
	label: string;
	// ...
	accessibilityLabel?: string;
}

// In render:
<View
	accessible={true}
	accessibilityRole="text"
	accessibilityLabel={accessibilityLabel ?? label}
	importantForAccessibility="yes"
>
	<Text>{label}</Text>
</View>;
```

---

### 1.5 `Divider.tsx`

**File:** `src/components/atoms/Divider.tsx`

**Issues:**

- Purely decorative — screen readers should skip it

**Changes:**

```tsx
<View style={[styles.divider, style]} importantForAccessibility="no" accessible={false} />
```

---

### 1.6 `ThemedText.tsx`

**File:** `src/components/atoms/ThemedText.tsx`

**Issues:**

- `h1`/`h2`/`h3` variants are styled as headings but not announced as headings by screen readers
- No `accessibilityRole="header"` on heading variants

**Changes:**

```tsx
// Map variant to accessibilityRole
const roleForVariant: Partial<Record<TextVariant, AccessibilityRole>> = {
  h1: 'header',
  h2: 'header',
  h3: 'header',
};

// In component:
<Text
  accessibilityRole={accessibilityRole ?? roleForVariant[variant] ?? undefined}
  {...props}
>
```

---

## Phase 2 — Molecules

---

### 2.1 `FormField.tsx`

**File:** `src/components/molecules/FormField.tsx`

**Issues (HIGH):**

- Required asterisk (`*`) is announced as a separate character — not as "required"
- Error message displayed visually but NOT linked to the input

**Changes:**

```tsx
export interface FormFieldProps extends TextInputProps {
	label: string;
	required?: boolean;
	error?: string;
	accessibilityLabel?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
	label,
	required,
	error,
	accessibilityLabel,
	...props
}) => {
	// Build a full, stable label for the input
	const inputLabel = accessibilityLabel ?? label;
	const inputHint =
		[required ? 'Required' : null, error ? `Error: ${error}` : null]
			.filter(Boolean)
			.join('. ') || undefined;

	return (
		<View style={styles.container}>
			{/* Visual label row — hidden from a11y, input carries the label */}
			<View importantForAccessibility="no" style={[layout.row, { marginBottom: 4 }]}>
				<ThemedText variant="label">{label}</ThemedText>
				{required && <ThemedText style={{ marginLeft: 2 }}>*</ThemedText>}
			</View>

			<AtomTextInput
				accessibilityLabel={inputLabel}
				accessibilityHint={inputHint}
				error={undefined} // error communicated via hint, not visual only
				label={undefined} // label communicated via accessibilityLabel
				{...props}
			/>

			{/* Visual error — hidden from a11y (announced via hint) */}
			{!!error && (
				<ThemedText
					importantForAccessibility="no"
					variant="caption"
					color={c.error}
					style={{ marginTop: 4 }}
				>
					{error}
				</ThemedText>
			)}
		</View>
	);
};
```

---

### 2.2 `ListItem.tsx`

**File:** `src/components/molecules/ListItem.tsx`

**Issues:**

- `accessibilityLabel={title}` ignores subtitle — screen reader misses context
- `ChevronRight` icon is announced separately as an unnamed element
- No `accessibilityHint`
- No `accessibilityLabel` prop override

**Changes:**

```tsx
interface ListItemProps {
  title: string;
  subtitle?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  // ...
}

<Pressable
  accessibilityRole="button"
  accessibilityLabel={accessibilityLabel ?? [title, subtitle].filter(Boolean).join(', ')}
  accessibilityHint={accessibilityHint ?? (onPress ? 'Double tap to open' : undefined)}
  ...
>
  {/* ChevronRight: decorative */}
  {onPress && showChevron && (
    <ChevronRight
      importantForAccessibility="no"
      ...
    />
  )}
```

---

### 2.3 `SearchBar.tsx`

**File:** `src/components/molecules/SearchBar.tsx`

**Issues (HIGH):**

- Input has no `accessibilityLabel`
- Clear button (`×`) has no label
- Search icon is decorative but not marked

**Changes:**

```tsx
// Pass accessibilityLabel to underlying TextInput
<TextInput
  accessibilityLabel="Search"
  accessibilityHint="Type to filter results"
  ...
/>

// Clear button:
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Clear search"
  onPress={onClear}
>

// Search icon wrapper:
<View importantForAccessibility="no">
  <Search ... />
</View>
```

---

### 2.4 `StatCard.tsx`

**File:** `src/components/molecules/StatCard.tsx`

**Issues:**

- `accessibilityLabel` is computed from translated `label` — locale-sensitive
- Icon not marked as decorative

**Changes:**

```tsx
interface StatCardProps {
  label: string;
  value: string | number;
  accessibilityLabel?: string; // stable override, e.g. "stat-today-sales"
  // ...
}

<View
  accessibilityRole="summary"
  accessibilityLabel={accessibilityLabel ?? `${label}: ${value}`}
  ...
>
  {Icon && (
    <View importantForAccessibility="no" style={styles.iconContainer}>
      <Icon ... />
    </View>
  )}
```

---

### 2.5 `EmptyState.tsx`

**File:** `src/components/molecules/EmptyState.tsx`

**Issues:**

- Title not marked as heading
- Icon is decorative

**Changes:**

```tsx
// Icon container:
<View importantForAccessibility="no">{icon}</View>

// Title:
<Text accessibilityRole="header">{title}</Text>
```

---

## Phase 3 — Organisms

---

### 3.1 `DashboardHeader.tsx`

**File:** `src/components/organisms/DashboardHeader.tsx`

**Issues:**

- No `accessibilityLabel` on the outer view — can't be identified by Maestro or screen readers as "the dashboard"
- Emoji `🙏` may not be announced correctly on all platforms
- Date badge is decorative context, not critical info

**Changes:**

```tsx
<View
  accessibilityLabel="dashboard-screen"
  accessibilityRole="header"
  ...
>
  <ThemedText
    accessibilityLabel="Greeting"
    importantForAccessibility="no"   // decorative — "Namaste 🙏"
  >
    {t('dashboard.greeting')} 🙏
  </ThemedText>

  <View style={layout.rowBetween}>
    <ThemedText variant="h2" accessibilityRole="header">
      {businessName}
    </ThemedText>
    <View
      accessibilityLabel={`Today: ${today}`}
      accessible={true}
      style={styles.dateBadge}
    >
      <ThemedText variant="caption" importantForAccessibility="no">
        {today}
      </ThemedText>
    </View>
  </View>
</View>
```

---

### 3.2 `PaymentModal.tsx`

**File:** `src/components/organisms/PaymentModal.tsx`

**Issues (HIGH):**

- `accessibilityViewIsModal` not set — VoiceOver doesn't trap focus inside modal
- Amount input has no `accessibilityLabel`
- Close button has no explicit label (overrides `testID` with `accessibilityLabel`)
- Payment mode buttons have labels from translated/uppercase text
- Submit button `testID` → replace with `accessibilityLabel`

**Changes:**

```tsx
<Modal visible={visible} transparent animationType="slide">
  <View style={styles.overlay} importantForAccessibility="no-hide-descendants">
    <View
      style={styles.content}
      accessibilityViewIsModal={true}   // traps VoiceOver focus
      accessible={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <ThemedText variant="h2" accessibilityRole="header">Record Payment</ThemedText>
        <Button
          variant="ghost"
          size="sm"
          onPress={onClose}
          accessibilityLabel="close-payment-modal"  // replaces testID
          leftIcon={<X ... />}
        />
      </View>

      {/* Amount input */}
      <TextInput
        label="Amount (₹)"
        accessibilityLabel="payment-amount-input"
        accessibilityHint="Enter the payment amount in rupees"
        ...
      />

      {/* Payment mode buttons */}
      {modes.map((mode) => (
        <Button
          key={mode}
          title={mode.replace('_', ' ').toUpperCase()}
          accessibilityLabel={`payment-mode-${mode}`}
          accessibilityState={{ selected: paymentMode === mode }}
          ...
        />
      ))}

      {/* Submit */}
      <Button
        title={loading ? 'Processing...' : 'Record Payment'}
        accessibilityLabel="submit-payment-button"  // replaces testID
        accessibilityState={{ busy: loading }}
        ...
      />
    </View>
  </View>
</Modal>
```

---

### 3.3 `QuickActionsGrid.tsx`

**File:** `src/components/organisms/QuickActionsGrid.tsx`

**Issues:**

- `accessibilityLabel={action.label}` uses translated text — locale-sensitive

**Changes:**

```tsx
export interface QuickAction {
  label: string;
  icon: LucideIcon;
  route: string;
  color: string;
  accessibilityLabel: string; // required stable identifier, e.g. "quick-action-new-invoice"
}

// In render:
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel={action.accessibilityLabel}
  ...
>
```

**Dashboard `index.tsx` must pass stable labels:**

```tsx
const quickActions = [
  { label: t('dashboard.newInvoice'),    accessibilityLabel: 'quick-action-new-invoice',    ... },
  { label: t('dashboard.scanItem'),      accessibilityLabel: 'quick-action-scan-item',       ... },
  { label: t('dashboard.addStock'),      accessibilityLabel: 'quick-action-add-stock',       ... },
  { label: t('dashboard.recordPayment'), accessibilityLabel: 'quick-action-record-payment',  ... },
];
```

---

### 3.4 `RecentInvoicesList.tsx`

**File:** `src/components/organisms/RecentInvoicesList.tsx`

**Issues:**

- No `accessibilityRole="list"` on container
- Invoice card labels don't include status (color-only)
- ChevronRight icons not marked decorative

**Changes:**

```tsx
<View accessibilityRole="list">
  {invoices.map((inv) => (
    <TouchableOpacity
      key={inv.id}
      accessibilityRole="button"
      accessibilityLabel={`Invoice ${inv.invoice_number}, ${inv.payment_status}, ${formatCurrency(inv.grand_total)}`}
      ...
    >
      {/* ChevronRight */}
      <ChevronRight importantForAccessibility="no" ... />
    </TouchableOpacity>
  ))}
</View>
```

---

### 3.5 `TileSetCard.tsx`

**File:** `src/components/organisms/TileSetCard.tsx`

**Issues:**

- Item variants not labeled with stock count
- Product images missing alt text
- Low-stock badge color-only indicator

**Changes:**

```tsx
// Each variant row:
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel={`${item.design_name}, ${item.box_count} boxes in stock`}
  accessibilityHint={item.box_count <= 5 ? 'Low stock' : undefined}
  ...
>
  {/* Product image */}
  <Image
    accessibilityLabel={item.design_name}
    accessible={true}
    ...
  />
```

---

## Phase 4 — Feature Components

---

### 4.1 `InvoiceCreateScreen.tsx`

**File:** `src/features/invoice-create/InvoiceCreateScreen.tsx`

**Issues (HIGH):**

- Step indicator not announced as a progress indicator
- Back/Next/Generate buttons use generic labels
- Step labels are visually clear but not distinguishable for screen readers

**Changes:**

```tsx
{/* Stepper — progress indicator */}
<View
  style={styles.stepper}
  accessibilityRole="progressbar"
  accessibilityValue={{ now: flow.step, min: 1, max: 3 }}
  accessibilityLabel={`Step ${flow.step} of 3: ${['Customer', 'Items', 'Review'][flow.step - 1]}`}
>
  {(['Customer', 'Items', 'Review'] as const).map((label, i) => (
    <ThemedText
      key={label}
      accessibilityLabel={`invoice-step-${i + 1}`}
      importantForAccessibility={flow.step === i + 1 ? 'yes' : 'no'}
      ...
    >
      {i + 1}. {label}
    </ThemedText>
  ))}
</View>

{/* Footer buttons */}
<Button
  title="Back"
  accessibilityLabel="invoice-back-button"
  accessibilityHint={flow.step > 1 ? `Go back to step ${flow.step - 1}` : undefined}
  ...
/>
{flow.step < 3 ? (
  <Button
    title="Next"
    accessibilityLabel="invoice-next-button"
    accessibilityHint={`Proceed to step ${flow.step + 1}`}
    ...
  />
) : (
  <Button
    title={flow.submitting ? 'Generating...' : 'Generate Invoice'}
    accessibilityLabel="generate-invoice-button"
    accessibilityState={{ busy: flow.submitting }}
    ...
  />
)}
```

---

### 4.2 `CustomerStep.tsx`

**File:** `src/features/invoice-create/CustomerStep.tsx`

**Issues:**

- Name `FormField` missing `accessibilityLabel`
- Inter-state toggle has no `accessibilityHint` explaining the tax implication

**Changes:**

```tsx
<FormField
  label="Name"
  accessibilityLabel="customer-name-input"
  required
  ...
/>
<FormField
  label="Phone"
  accessibilityLabel="customer-phone-input"
  ...
/>
<FormField
  label="GSTIN (Optional)"
  accessibilityLabel="customer-gstin-input"
  ...
/>

<TouchableOpacity
  accessibilityRole="switch"
  accessibilityLabel="inter-state-igst-toggle"
  accessibilityState={{ checked: isInterState }}
  accessibilityHint="Enable if customer is in a different state. Applies IGST instead of CGST+SGST"
  ...
>
```

---

### 4.3 `LineItemsStep.tsx`

**File:** `src/features/invoice-create/LineItemsStep.tsx`

**Issues:**

- "+ Add Item" button label is translatable text, not stable
- Inventory item list missing `accessibilityRole="list"`
- Confirm/Cancel buttons generic
- Remove button context missing (which item?)

**Changes:**

```tsx
<Button
  title="+ Add Item"
  accessibilityLabel="add-item-button"
  ...
/>

{/* Inventory selection list */}
<ScrollView accessibilityRole="list">
  {inventoryItems.map((item) => (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={item.design_name}
      accessibilityHint={`${item.box_count} boxes available at ₹${item.selling_price}`}
      ...
    >
```

```tsx
{/* Remove button — includes item name for context */}
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel={`remove-line-item-${index}`}
  accessibilityHint={`Remove ${item.design_name} from invoice`}
  ...
>
```

```tsx
{/* Quantity / Discount fields */}
<FormField
  label="Quantity"
  accessibilityLabel="item-quantity-input"
  ...
/>
<FormField
  label="Discount (₹ total)"
  accessibilityLabel="item-discount-input"
  ...
/>

{/* Confirm / Cancel */}
<Button title="Cancel"  accessibilityLabel="cancel-add-item"  ... />
<Button title="Confirm" accessibilityLabel="confirm-add-item" ... />
```

---

### 4.4 `PaymentStep.tsx`

**File:** `src/features/invoice-create/PaymentStep.tsx`

**Issues (HIGH):**

- Balance due is color-coded (green = paid, orange = balance) with no label
- Payment mode toggle buttons need stable labels

**Changes:**

```tsx
<FormField
  label="Amount Paid (₹)"
  accessibilityLabel="amount-paid-input"
  ...
/>

{/* Payment mode buttons */}
{PAYMENT_MODES.map((mode) => (
  <TouchableOpacity
    key={mode}
    accessibilityRole="togglebutton"
    accessibilityLabel={`payment-mode-${mode}`}
    accessibilityState={{ selected: paymentMode === mode }}
    accessibilityHint={`Select ${mode.replace('_', ' ')} as payment method`}
    ...
  >

{/* Balance due — not color-only */}
<View
  accessibilityRole="summary"
  accessibilityLabel={`balance-due-indicator`}
  accessibilityValue={{ text: `Balance due: ₹${balanceDue.toFixed(2)}` }}
  ...
>
  <ThemedText weight="bold">
    {isPaid ? 'Fully Paid' : `Balance Due: ₹${balanceDue.toFixed(2)}`}
  </ThemedText>
</View>
```

---

## Phase 5 — Screens

---

### 5.1 `app/(auth)/login.tsx`

**Changes:**

```tsx
{/* Sign In heading */}
<ThemedText
  variant="h2"
  accessibilityRole="header"
  accessibilityLabel="sign-in-heading"
>
  {t('auth.signIn')}
</ThemedText>

{/* Email input */}
<TextInput
  accessibilityLabel="email-input"
  accessibilityHint="Enter your registered email address"
  ...
/>

{/* Password input */}
<TextInput
  accessibilityLabel="password-input"
  accessibilityHint="Enter your account password"
  rightIcon={
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={showPassword ? 'hide-password-toggle' : 'show-password-toggle'}
      accessibilityHint={showPassword ? 'Hide password' : 'Show password'}
      onPress={() => setShowPassword(!showPassword)}
    >
  }
  ...
/>

{/* Sign In button — replace testID with accessibilityLabel */}
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="sign-in-button"
  accessibilityState={{ busy: loading }}
  // remove testID="sign-in-button"
  ...
>
```

---

### 5.2 `app/(app)/(tabs)/_layout.tsx`

**Issues:**

- Tab bar button labels come from translated `title` — locale-sensitive in Maestro
- Scan tab has `tabBarLabel={() => null}` — no label for screen readers

**Changes:**

```tsx
<Tabs.Screen
  name="index"
  options={{
    title: t('dashboard.greeting'),
    tabBarAccessibilityLabel: 'tab-dashboard',
    ...
  }}
/>
<Tabs.Screen
  name="inventory"
  options={{
    title: t('inventory.title'),
    tabBarAccessibilityLabel: 'tab-inventory',
    ...
  }}
/>
<Tabs.Screen
  name="scan"
  options={{
    tabBarAccessibilityLabel: 'tab-scan',
    tabBarLabel: () => null,
    ...
  }}
/>
<Tabs.Screen
  name="invoices"
  options={{
    title: t('invoice.title'),
    tabBarAccessibilityLabel: 'tab-invoices',
    ...
  }}
/>
<Tabs.Screen
  name="more"
  options={{
    title: t('tabs.more'),
    tabBarAccessibilityLabel: 'tab-more',
    ...
  }}
/>
```

---

### 5.3 `app/(app)/(tabs)/more.tsx`

**Changes:**

```tsx
{/* Screen heading */}
<ThemedText
  variant="h1"
  accessibilityRole="header"
  accessibilityLabel="more-screen"
>More</ThemedText>

{/* Menu items — add stable accessibilityLabel per route */}
const menuItems = [
  { ..., accessibilityLabel: 'menu-customers' },
  { ..., accessibilityLabel: 'menu-suppliers' },
  { ..., accessibilityLabel: 'menu-orders'    },
  { ..., accessibilityLabel: 'menu-finance'   },
  { ..., accessibilityLabel: 'menu-settings'  },
];

{menuItems.map((item, i) => (
  <TouchableOpacity
    accessibilityRole="button"
    accessibilityLabel={item.accessibilityLabel}
    accessibilityHint={`Open ${item.label}`}
    ...
  >

{/* Language toggle */}
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="language-toggle"
  accessibilityHint={currentLanguage === 'en' ? 'Switch app language to Hindi' : 'Switch app language to English'}
  ...
>

{/* Sign Out */}
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="sign-out-button"
  accessibilityHint="Logs you out of TileMaster"
  ...
>
```

---

### 5.4 `app/(app)/(tabs)/index.tsx` (Dashboard)

**Changes:**

```tsx
{/* Pass stable labels to StatCards */}
const dashboardStats = [
  { ..., accessibilityLabel: 'stat-today-sales'     },
  { ..., accessibilityLabel: 'stat-outstanding'     },
  { ..., accessibilityLabel: 'stat-low-stock'       },
];

{/* Pass stable labels to QuickActions */}
const quickActions = [
  { ..., accessibilityLabel: 'quick-action-new-invoice'    },
  { ..., accessibilityLabel: 'quick-action-scan-item'      },
  { ..., accessibilityLabel: 'quick-action-add-stock'      },
  { ..., accessibilityLabel: 'quick-action-record-payment' },
];
```

---

### 5.5 `app/(app)/(tabs)/invoices.tsx`

**Changes:**

```tsx
{/* Screen heading */}
<ThemedText
  variant="h1"
  accessibilityRole="header"
  accessibilityLabel="invoices-screen"
>Invoices</ThemedText>

{/* New Invoice button */}
<Button
  title="New Invoice"
  accessibilityLabel="new-invoice-button"
  ...
/>

{/* Invoice cards */}
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel={`invoice-${item.invoice_number}`}
  accessibilityHint={`${item.payment_status}, ${formatCurrency(item.grand_total)}. Double tap to open`}
  ...
>
```

---

### 5.6 `app/(app)/(tabs)/inventory.tsx`

**Changes:**

```tsx
{/* Screen heading */}
<ThemedText
  variant="h1"
  accessibilityRole="header"
  accessibilityLabel="inventory-screen"
>

{/* Search input */}
<TextInput
  accessibilityLabel="inventory-search-input"
  accessibilityHint="Search by design name or item number"
  ...
/>

{/* Filter button */}
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="inventory-filter-button"
  accessibilityHint="Open category and filter options"
  ...
>

{/* Category chips */}
<Chip
  label={item}
  accessibilityLabel={`category-chip-${item}`}
  ...
/>

{/* FAB */}
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="add-inventory-button"
  accessibilityHint="Add a new inventory item"
  ...
>
```

---

### 5.7 `app/(app)/(tabs)/scan.tsx`

**Changes:**

```tsx
{/* Grant permission button */}
<Button
  title="Grant Permission"
  accessibilityLabel="grant-camera-permission"
  accessibilityHint="Allow TileMaster to use your camera for scanning"
  ...
/>

{/* Capture button */}
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="capture-button"
  accessibilityHint="Take a photo to scan item text using OCR"
  ...
>

{/* Manual entry section */}
<View
  accessible={false}
  accessibilityLabel="manual-entry-section"
>
  <ThemedText
    weight="semibold"
    accessibilityRole="header"
  >Manual Entry</ThemedText>

  <TextInput
    accessibilityLabel="manual-entry-input"
    accessibilityHint="Type an item name or design number to search"
    ...
  />

  <Button
    accessibilityLabel="scan-search-button"
    accessibilityHint="Search inventory for entered text"
    ...
  />
</View>
```

---

### 5.8 `app/(app)/invoices/[id].tsx`

**Changes:**

```tsx
{/* Back arrow */}
<ArrowLeft
  accessibilityRole="button"   // or wrap in TouchableOpacity
  accessibilityLabel="back-button"
  accessibilityHint="Go back to invoice list"
  ...
/>

{/* Screen container */}
<View accessibilityLabel="invoice-detail-screen">
```

---

### 5.9 `app/(app)/customers/index.tsx`

**Changes:**

```tsx
{/* Screen heading */}
<ThemedText
  variant="h1"
  accessibilityRole="header"
  accessibilityLabel="customers-screen"
>Customers</ThemedText>

{/* Add customer button in header */}
<Button
  accessibilityLabel="add-customer-button"
  accessibilityHint="Add a new customer"
  ...
/>
```

---

### 5.10 `app/(app)/customers/add.tsx`

**Changes:**

```tsx
{/* All FormField components get stable accessibilityLabel */}
<FormField label="Customer Name" accessibilityLabel="customer-name-input"  required ... />
<FormField label="Phone Number"  accessibilityLabel="customer-phone-input"        ... />
<FormField label="GSTIN"         accessibilityLabel="customer-gstin-input"        ... />
<FormField label="City"          accessibilityLabel="customer-city-input"         ... />
<FormField label="State"         accessibilityLabel="customer-state-input"        ... />
<FormField label="Address"       accessibilityLabel="customer-address-input"      ... />
<FormField label="Credit Limit"  accessibilityLabel="customer-credit-limit-input" ... />

{/* Save button */}
<Button
  title={loading ? 'Saving...' : 'Save Customer'}
  accessibilityLabel="save-customer-button"
  accessibilityState={{ busy: loading }}
  ...
/>
```

---

### 5.11 `app/(app)/finance/index.tsx`

**Changes:**

```tsx
{/* Metric cards — pass stable label to StatCard */}
const metrics = [
  { title: 'Gross Profit',    accessibilityLabel: 'metric-gross-profit'   , ... },
  { title: 'Net Profit',      accessibilityLabel: 'metric-net-profit'     , ... },
  { title: 'Total Expenses',  accessibilityLabel: 'metric-total-expenses' , ... },
];

{/* The Stack.Screen title is already "Finance Overview" but add a View label */}
<View accessibilityLabel="finance-overview-screen">

{/* List items — ListItem already uses title as accessibilityLabel,
    but titles are hardcoded English so this works as-is.
    However, override for Maestro stability: */}
<ListItem
  title="Expenses"
  accessibilityLabel="finance-expenses-item"
  ...
/>
<ListItem
  title="Aging Report"
  accessibilityLabel="finance-aging-report-item"
  ...
/>
```

---

### 5.12 `app/(app)/settings/index.tsx`

**Changes:**

```tsx
{/* Screen heading */}
<ThemedText
  variant="h2"
  accessibilityRole="header"
  accessibilityLabel="settings-screen"
>Settings</ThemedText>

{/* Placeholder text */}
<ThemedText accessibilityLabel="settings-coming-soon">
  Settings — coming soon
</ThemedText>

{/* Back button */}
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="settings-back-button"
  accessibilityHint="Go back to More menu"
  ...
>
```

---

### 5.13 `app/(app)/orders/index.tsx`

**Changes:**

```tsx
{/* Screen heading */}
<ThemedText
  variant="h2"
  accessibilityRole="header"
  accessibilityLabel="orders-screen"
>Purchase Orders</ThemedText>

{/* Order cards */}
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel={`order-${item.id}`}
  accessibilityHint={`${item.party_name}, ${item.total_quantity} items imported. Double tap to open`}
  ...
>
```

---

## Phase 6 — Maestro YAML Updates

Once all `accessibilityLabel` values above are implemented, update every YAML file to replace text-based and placeholder-based selectors with `label:` selectors.

### Selector migration reference

| Old selector                                                 | New selector                                                |
| ------------------------------------------------------------ | ----------------------------------------------------------- |
| `assertVisible: "Sign In"`                                   | `assertVisible:\n    label: "sign-in-heading"`              |
| `tapOn: "Sign In"`                                           | `tapOn:\n    label: "sign-in-button"`                       |
| `tapOn:\n    id: "email-input"`                              | `tapOn:\n    label: "email-input"`                          |
| `tapOn:\n    id: "password-input"`                           | `tapOn:\n    label: "password-input"`                       |
| `assertVisible: "Dashboard"`                                 | `assertVisible:\n    label: "dashboard-screen"`             |
| `tapOn: "More"`                                              | `tapOn:\n    label: "tab-more"`                             |
| `tapOn: "Invoices"`                                          | `tapOn:\n    label: "tab-invoices"`                         |
| `tapOn: "Inventory"`                                         | `tapOn:\n    label: "tab-inventory"`                        |
| `tapOn: "Scan"`                                              | `tapOn:\n    label: "tab-scan"`                             |
| `tapOn: "Dashboard"`                                         | `tapOn:\n    label: "tab-dashboard"`                        |
| `assertVisible: "Sign Out"`                                  | `assertVisible:\n    label: "sign-out-button"`              |
| `tapOn: "Sign Out"`                                          | `tapOn:\n    label: "sign-out-button"`                      |
| `assertVisible: "Invoices"`                                  | `assertVisible:\n    label: "invoices-screen"`              |
| `tapOn: "New Invoice"`                                       | `tapOn:\n    label: "new-invoice-button"`                   |
| `tapOn: "Create Invoice"`                                    | `tapOn:\n    label: "new-invoice-button"`                   |
| `assertVisible: "1. Customer"`                               | `assertVisible:\n    label: "invoice-step-1"`               |
| `assertVisible: "2. Items"`                                  | `assertVisible:\n    label: "invoice-step-2"`               |
| `assertVisible: "3. Review"`                                 | `assertVisible:\n    label: "invoice-step-3"`               |
| `tapOn: "Next"`                                              | `tapOn:\n    label: "invoice-next-button"`                  |
| `tapOn: "Generate Invoice"`                                  | `tapOn:\n    label: "generate-invoice-button"`              |
| `assertVisible: "Invoice Created"`                           | `assertVisible:\n    label: "invoice-detail-screen"`        |
| `tapOn:\n    id: "customer-name-input"`                      | `tapOn:\n    label: "customer-name-input"`                  |
| `tapOn: "+ Add Item"`                                        | `tapOn:\n    label: "add-item-button"`                      |
| `tapOn: "Confirm"`                                           | `tapOn:\n    label: "confirm-add-item"`                     |
| `tapOn: "Cancel"`                                            | `tapOn:\n    label: "cancel-add-item"`                      |
| `assertVisible: "Inventory"`                                 | `assertVisible:\n    label: "inventory-screen"`             |
| `tapOn:\n    placeholder: "Search design or item number..."` | `tapOn:\n    label: "inventory-search-input"`               |
| `tapOn:\n    id: "fab-add-inventory"`                        | `tapOn:\n    label: "add-inventory-button"`                 |
| `assertVisible: "ALL"`                                       | `assertVisible:\n    label: "category-chip-ALL"`            |
| `assertVisible: "GLOSSY"`                                    | `assertVisible:\n    label: "category-chip-GLOSSY"`         |
| `tapOn: "Customers"`                                         | `tapOn:\n    label: "menu-customers"`                       |
| `tapOn:\n    id: "fab-add-customer"`                         | `tapOn:\n    label: "add-customer-button"`                  |
| `tapOn:\n    text: "Add Customer"`                           | `tapOn:\n    label: "add-customer-button"`                  |
| `tapOn:\n    text: "Save"`                                   | `tapOn:\n    label: "save-customer-button"`                 |
| `tapOn: "Finance"`                                           | `tapOn:\n    label: "menu-finance"`                         |
| `assertVisible: "Finance Overview"`                          | `assertVisible:\n    label: "finance-overview-screen"`      |
| `assertVisible: "Gross Profit"`                              | `assertVisible:\n    label: "metric-gross-profit"`          |
| `assertVisible: "Net Profit"`                                | `assertVisible:\n    label: "metric-net-profit"`            |
| `assertVisible: "Total Expenses"`                            | `assertVisible:\n    label: "metric-total-expenses"`        |
| `tapOn: "Expenses"`                                          | `tapOn:\n    label: "finance-expenses-item"`                |
| `tapOn: "Aging Report"`                                      | `tapOn:\n    label: "finance-aging-report-item"`            |
| `tapOn: "Orders"`                                            | `tapOn:\n    label: "menu-orders"`                          |
| `assertVisible: "Orders"`                                    | `assertVisible:\n    label: "orders-screen"`                |
| `tapOn: "Settings"`                                          | `tapOn:\n    label: "menu-settings"`                        |
| `assertVisible: "Settings"`                                  | `assertVisible:\n    label: "settings-screen"`              |
| `assertVisible: "Settings — coming soon"`                    | `assertVisible:\n    label: "settings-coming-soon"`         |
| `tapOn: "Back"`                                              | `tapOn:\n    label: "settings-back-button"` (settings only) |
| `tapOn: "Scan"`                                              | `tapOn:\n    label: "tab-scan"`                             |
| `tapOn:\n    text: "Grant Permission"`                       | `tapOn:\n    label: "grant-camera-permission"`              |
| `tapOn:\n    placeholder: "Enter item or design #"`          | `tapOn:\n    label: "manual-entry-input"`                   |
| `tapOn:\n    id: "search-button"`                            | `tapOn:\n    label: "scan-search-button"`                   |
| `assertVisible: "Today's Sales"`                             | `assertVisible:\n    label: "stat-today-sales"`             |
| `assertVisible: "New Invoice"`                               | `assertVisible:\n    label: "quick-action-new-invoice"`     |
| `assertVisible: "Add Stock"`                                 | `assertVisible:\n    label: "quick-action-add-stock"`       |
| `tapOn:\n    text: "Record Payment"`                         | `tapOn:\n    label: "submit-payment-button"`                |
| `tapOn:\n    placeholder: "Enter amount"`                    | `tapOn:\n    label: "payment-amount-input"`                 |
| `tapOn:\n    text: "upi"`                                    | `tapOn:\n    label: "payment-mode-upi"`                     |
| `tapOn:\n    text: "Save"` (payments)                        | `tapOn:\n    label: "submit-payment-button"`                |

---

## Execution Checklist

### Phase 1 — Atoms

- [ ] `Button.tsx` — add explicit `accessibilityLabel` prop, fix sm touch target
- [ ] `TextInput.tsx` — link label to input, hide visual label from a11y tree
- [ ] `Chip.tsx` — add `accessibilityLabel` prop, remove `testID`
- [ ] `Badge.tsx` — add `accessibilityRole="text"` and `accessibilityLabel`
- [ ] `Divider.tsx` — mark as `importantForAccessibility="no"`
- [ ] `ThemedText.tsx` — map heading variants to `accessibilityRole="header"`

### Phase 2 — Molecules

- [ ] `FormField.tsx` — pass error/required via `accessibilityHint`, hide visual label
- [ ] `ListItem.tsx` — combine title+subtitle in label, decorative chevron
- [ ] `SearchBar.tsx` — label input and clear button, hide search icon
- [ ] `StatCard.tsx` — add `accessibilityLabel` prop override, hide icon
- [ ] `EmptyState.tsx` — heading role on title, hide decorative icon

### Phase 3 — Organisms

- [ ] `DashboardHeader.tsx` — add `accessibilityLabel="dashboard-screen"` to outer View
- [ ] `PaymentModal.tsx` — `accessibilityViewIsModal`, stable labels, remove `testID`
- [ ] `QuickActionsGrid.tsx` — add `accessibilityLabel` to `QuickAction` interface
- [ ] `RecentInvoicesList.tsx` — list role, status in label, decorative chevrons
- [ ] `TileSetCard.tsx` — full item labels, image alt text, low-stock hint

### Phase 4 — Feature Components

- [ ] `InvoiceCreateScreen.tsx` — progressbar stepper, stable button labels
- [ ] `CustomerStep.tsx` — stable input labels, switch role on toggle
- [ ] `LineItemsStep.tsx` — list role, stable button labels, item-specific remove labels
- [ ] `PaymentStep.tsx` — stable payment mode labels, balance due label

### Phase 5 — Screens

- [ ] `login.tsx` — screen label, input labels, password toggle label, remove `testID`
- [ ] `_layout.tsx` — `tabBarAccessibilityLabel` on all tabs
- [ ] `more.tsx` — screen label, stable menu item labels, sign-out label
- [ ] `index.tsx` (dashboard) — pass stable labels to StatCards and QuickActions
- [ ] `invoices.tsx` — screen label, new-invoice button label, card labels
- [ ] `inventory.tsx` — screen label, search/filter/chip/FAB labels
- [ ] `scan.tsx` — permission button, capture button, manual entry labels
- [ ] `invoices/[id].tsx` — back button, screen container label
- [ ] `customers/index.tsx` — screen label, add customer button
- [ ] `customers/add.tsx` — all form field labels, save button
- [ ] `finance/index.tsx` — screen label, metric labels, list item labels
- [ ] `settings/index.tsx` — screen label, coming-soon label, back button
- [ ] `orders/index.tsx` — screen label, order card labels

### Phase 6 — Maestro YAML

- [ ] `auth_login.yaml`
- [ ] `auth_invalid_login.yaml`
- [ ] `auth_logout.yaml`
- [ ] `dashboard_full.yaml`
- [ ] `dashboard_visibility.yaml`
- [ ] `navigation_tabs.yaml`
- [ ] `invoice_list_detail.yaml`
- [ ] `create_invoice_flow.yaml`
- [ ] `invoice_create_full.yaml`
- [ ] `customer_management.yaml`
- [ ] `inventory_management.yaml`
- [ ] `finance_overview.yaml`
- [ ] `payments.yaml`
- [ ] `order_import.yaml`
- [ ] `settings_navigation.yaml`
- [ ] `scan_tab.yaml`
- [ ] `offline_behavior.yaml`

---

## Issue Count by Phase

| Phase              | HIGH   | MEDIUM | LOW    |
| ------------------ | ------ | ------ | ------ |
| Atoms              | 2      | 10     | 3      |
| Molecules          | 4      | 12     | 2      |
| Organisms          | 4      | 14     | 2      |
| Feature Components | 2      | 10     | 1      |
| Screens            | 0      | 16     | 14     |
| **Total**          | **12** | **62** | **22** |

---

_Generated: 2026-04-01 | Total issues: 96 | Target: WCAG 2.1 AA + FAANG standard_
