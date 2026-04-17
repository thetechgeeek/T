import type { ComponentDocsEntry, ComponentDocPropDefinition } from './componentContract';

function prop(
	name: string,
	type: string,
	description: string,
	defaultValue?: string,
): ComponentDocPropDefinition {
	return { name, type, description, defaultValue };
}

function doc(entry: ComponentDocsEntry): ComponentDocsEntry {
	return entry;
}

const COMMON_STYLE_PROP = prop(
	'style',
	'StyleProp<ViewStyle>',
	'Token-safe escape hatch for layout integration.',
);
const COMMON_TEST_ID_PROP = prop(
	'testID',
	'string',
	'Stable automation handle for Jest and Maestro.',
);
const COMMON_A11Y_PROP = prop(
	'accessibilityLabel',
	'string',
	'Stable English label for screen readers and device automation.',
);

export const DESIGN_SYSTEM_COMPONENT_DOCS: Record<string, ComponentDocsEntry> = {
	Badge: doc({
		name: 'Badge',
		filePath: 'src/components/atoms/Badge.tsx',
		summary:
			'Compact status, count, and metadata pill for inline emphasis without introducing heavy chrome.',
		exampleStories: [
			'neutral metadata chip',
			'success status pill',
			'dense invoice state badge',
		],
		variants: [
			'primary/default',
			'neutral',
			'success/paid',
			'warning/partial',
			'error/unpaid',
			'info',
		],
		sizes: ['sm', 'md'],
		states: ['default', 'dense list row', 'long localized label'],
		compositionExample: 'Customer list row with payment-status badge and quiet metadata.',
		usage: {
			relaxed: 'Use a medium badge beside hero stats or section-level metadata.',
			operational: 'Prefer small badges in dense rows, chips, and approval queues.',
			noMedia: 'Text-only pills remain legible without icons or illustration.',
		},
		propTable: [
			prop('label', 'string', 'Visible badge text.'),
			prop('variant', 'BadgeVariant', 'Semantic tone for status or metadata.', 'primary'),
			prop('size', "'sm' | 'md'", 'Density-safe badge sizing.', 'md'),
			COMMON_A11Y_PROP,
			COMMON_STYLE_PROP,
		],
		doList: [
			'Pair status color with readable text.',
			'Use size="sm" in dense tables and list rows.',
		],
		dontList: [
			'Do not use multiple saturated badges to compete for attention.',
			'Do not rely on color alone without readable text.',
		],
		accessibilityNotes: [
			'Accessible label defaults to the badge text.',
			'Badge content stays readable at large font scales because text is never icon-only.',
		],
		platformNotes: [
			'Rendering is identical on iOS and Android; platform differences come only from typography and color tokens.',
			'Semantic palettes remain harmonized in light, dark, and high-contrast themes.',
		],
	}),
	Button: doc({
		name: 'Button',
		filePath: 'src/components/atoms/Button.tsx',
		summary:
			'Primary action primitive with purpose-driven hierarchy props, density mapping, loading state, focus visibility, and forwarded native ref.',
		exampleStories: [
			'primary CTA',
			'secondary supporting action',
			'inverse hero action',
			'danger confirmation action',
		],
		variants: [
			'primary',
			'secondary',
			'outline',
			'ghost',
			'danger',
			'inverse',
			'tone + emphasis aliases',
		],
		sizes: ['sm', 'md', 'lg', 'density compact/default/relaxed'],
		states: ['default', 'disabled', 'loading', 'focused', 'inverse surface'],
		compositionExample:
			'Toolbar footer with primary save button, ghost secondary action, and destructive confirmation path.',
		usage: {
			relaxed: 'Use relaxed density for hero actions and spacious settings surfaces.',
			operational:
				'Use compact density in dense workflows while preserving the minimum touch target.',
			noMedia: 'Buttons remain fully legible with text-only labels and no icons.',
		},
		propTable: [
			prop('title', 'string', 'Visible button label.'),
			prop(
				'tone',
				"'brand' | 'neutral' | 'danger' | 'inverse'",
				'Purpose-first action tone.',
				'brand',
			),
			prop('emphasis', "'high' | 'medium' | 'low'", 'Separates hierarchy from tone.', 'high'),
			prop(
				'density',
				"'compact' | 'default' | 'relaxed'",
				'Maps to touch-safe button size.',
				'default',
			),
			prop('loading', 'boolean', 'Shows busy state and suppresses press handling.', 'false'),
			COMMON_A11Y_PROP,
		],
		doList: [
			'Use tone + emphasis for new call sites.',
			'Reserve inverse actions for dark hero or media surfaces.',
		],
		dontList: [
			'Do not stack multiple high-emphasis brand buttons in the same cluster.',
			'Do not use danger tone for non-destructive actions.',
		],
		accessibilityNotes: [
			'Forwards the native Pressable ref for programmatic focus.',
			'Exposes focused, disabled, and busy states to assistive technologies.',
		],
		platformNotes: [
			'Press animation respects reduced motion on both platforms.',
			'Hardware-keyboard focus ring is visible on iOS and Android where focusable Pressables are used.',
		],
	}),
	Card: doc({
		name: 'Card',
		filePath: 'src/components/atoms/Card.tsx',
		summary: 'Foundational surface container for raised, outlined, and quiet groupings.',
		exampleStories: ['raised detail card', 'outlined data card', 'flat section grouping'],
		variants: ['elevated', 'outlined', 'flat'],
		sizes: ['padding none', 'padding sm', 'padding md', 'padding lg'],
		states: ['default', 'dense stack', 'inverse-adjacent surface'],
		compositionExample: 'Metrics module card with title, value, and supporting metadata.',
		usage: {
			relaxed: 'Use elevated cards for premium overview modules and spaced settings blocks.',
			operational:
				'Use outlined cards for dense operational grouping where scan speed matters.',
			noMedia: 'Cards remain structurally complete with text-only headers and no artwork.',
		},
		propTable: [
			prop(
				'variant',
				"'elevated' | 'outlined' | 'flat'",
				'Surface treatment and separation.',
				'elevated',
			),
			prop('padding', "'none' | 'sm' | 'md' | 'lg'", 'Tokenized card padding.', 'md'),
			COMMON_A11Y_PROP,
			COMMON_STYLE_PROP,
			COMMON_TEST_ID_PROP,
		],
		doList: [
			'Prefer calm surfaces and spacing before adding extra borders.',
			'Use outlined cards for data-dense modules.',
		],
		dontList: [
			'Do not create giant-card-only layouts for dense workflows.',
			'Do not depend on images for card comprehension.',
		],
		accessibilityNotes: [
			'Optional accessibility label lets grouped content read as a single surface.',
			'Card itself stays non-interactive unless paired with TouchableCard.',
		],
		platformNotes: [
			'Elevation maps to iOS shadow recipes and Android elevation tokens.',
			'Outlined cards remain visible in dark and high-contrast themes.',
		],
	}),
	Chip: doc({
		name: 'Chip',
		filePath: 'src/components/atoms/Chip.tsx',
		summary:
			'Toggleable selection pill with controlled or uncontrolled selected state, focus visibility, and forwarded ref.',
		exampleStories: [
			'single-select filter chip',
			'dense compact chip',
			'chip with supportive icon',
		],
		variants: ['selected', 'unselected'],
		sizes: ['sm', 'md'],
		states: ['default', 'focused', 'selected', 'long label'],
		compositionExample: 'Scrollable filter row for status or ownership facets.',
		usage: {
			relaxed: 'Use medium chips for topical filters in roomy headers.',
			operational: 'Use small chips where many facets must stay scannable in one row.',
			noMedia: 'Works as text-only token; icon slot is optional.',
		},
		propTable: [
			prop('selected', 'boolean', 'Controlled selected state.'),
			prop('defaultSelected', 'boolean', 'Uncontrolled selected state.', 'false'),
			prop('onSelectedChange', '(selected: boolean) => void', 'Canonical toggle callback.'),
			prop('size', "'sm' | 'md'", 'Chip density.', 'md'),
			COMMON_A11Y_PROP,
		],
		doList: [
			'Use chips for mutually exclusive filters or lightweight toggles.',
			'Keep labels short and specific.',
		],
		dontList: [
			'Do not use chips as the only affordance for destructive actions.',
			'Do not rely on color alone for selected state.',
		],
		accessibilityNotes: [
			'Exposes togglebutton role and selected state.',
			'Forwards the native touchable ref for keyboard and screen-reader focus.',
		],
		platformNotes: [
			'TouchableOpacity focus handling is consistent across iOS and Android.',
			'Selected-state contrast is preserved in dark and high-contrast themes.',
		],
	}),
	Divider: doc({
		name: 'Divider',
		filePath: 'src/components/atoms/Divider.tsx',
		summary: 'Quiet separator for grouped content where spacing alone is not enough.',
		exampleStories: ['full-width divider', 'inset list divider'],
		variants: ['default', 'inset'],
		sizes: ['hairline'],
		states: ['default', 'dense list'],
		compositionExample: 'Settings list separators between grouped rows.',
		usage: {
			relaxed: 'Use sparingly in spacious settings or summary layouts.',
			operational: 'Use inset dividers for fast list scanning without heavy chrome.',
			noMedia: 'Divider is purely structural and never depends on icons or media.',
		},
		propTable: [
			prop('inset', 'boolean', 'Applies leading inset to align with row content.', 'false'),
			COMMON_STYLE_PROP,
			COMMON_TEST_ID_PROP,
		],
		doList: [
			'Prefer spacing before adding dividers.',
			'Use inset dividers to align with content columns.',
		],
		dontList: [
			'Do not use stacked dividers as decoration.',
			'Do not rely on dividers when spacing and surface tiers are sufficient.',
		],
		accessibilityNotes: [
			'Divider is non-interactive and should not enter the accessibility tree.',
			'Use semantic headings and grouping around dividers for structure.',
		],
		platformNotes: [
			'Hairline rendering follows native platform density rules.',
			'Color comes from separator tokens and stays consistent across themes.',
		],
	}),
	IconButton: doc({
		name: 'IconButton',
		filePath: 'src/components/atoms/IconButton.tsx',
		summary:
			'Compact icon-led action with optional caption, focus visibility, and forwarded native ref.',
		exampleStories: ['toolbar action', 'labeled quick action', 'floating action button'],
		variants: ['icon-only', 'icon with label', 'FAB companion'],
		sizes: ['minimum 48dp touch target'],
		states: ['default', 'disabled', 'focused'],
		compositionExample: 'Grid of quick actions for scan, share, and add-item tasks.',
		usage: {
			relaxed:
				'Use labels in showcase surfaces where icon meaning benefits from reinforcement.',
			operational:
				'Use icon-only actions in compact toolbars when the meaning is already established.',
			noMedia:
				'Icons are optional enhancements; the accessibility label remains the structural contract.',
		},
		propTable: [
			prop('icon', 'ReactNode', 'Visible icon content.'),
			prop('label', 'string', 'Optional caption under the icon.'),
			COMMON_A11Y_PROP,
			COMMON_TEST_ID_PROP,
			COMMON_STYLE_PROP,
		],
		doList: [
			'Always provide a stable accessibility label for icon-only usage.',
			'Keep iconography consistent with the shared stroke system.',
		],
		dontList: [
			'Do not use unfamiliar icons without labels in first-use flows.',
			'Do not shrink below the minimum touch target.',
		],
		accessibilityNotes: [
			'Forwards the native Pressable ref.',
			'Focus ring is visible for keyboard-accessible environments.',
		],
		platformNotes: [
			'Touch target is tokenized and density-aware on both platforms.',
			'FAB shares the same focus and label contract as IconButton.',
		],
	}),
	Screen: doc({
		name: 'Screen',
		filePath: 'src/components/atoms/Screen.tsx',
		summary: 'Safe-area, scroll, and keyboard-aware page shell for reusable mobile surfaces.',
		exampleStories: [
			'scrolling form screen',
			'static summary screen',
			'screen with footer actions',
		],
		variants: ['static', 'scrollable', 'keyboard-aware'],
		sizes: ['safe-area top', 'safe-area top+bottom'],
		states: ['default', 'with footer', 'with overlay'],
		compositionExample:
			'Settings page with header, scrollable body, and fixed footer action group.',
		usage: {
			relaxed:
				'Use roomier contentContainerStyle spacing for overview and onboarding surfaces.',
			operational: 'Use scrollable operational shells for dense forms and lists.',
			noMedia:
				'The screen shell is layout-only and remains useful without decorative content.',
		},
		propTable: [
			prop(
				'scrollable',
				'boolean',
				'Switches between static container and ScrollView.',
				'false',
			),
			prop('withKeyboard', 'boolean', 'Enables keyboard avoidance behavior.', 'true'),
			prop(
				'safeAreaEdges',
				"('top' | 'bottom' | 'left' | 'right')[]",
				'Safe-area edges to honor.',
				"['top']",
			),
			COMMON_A11Y_PROP,
			COMMON_TEST_ID_PROP,
		],
		doList: [
			'Use Screen for app-agnostic page shells instead of ad hoc safe-area wrappers.',
			'Prefer logical padding and contentContainerStyle overrides.',
		],
		dontList: [
			'Do not bypass Screen with raw SafeAreaView and ScrollView pairs.',
			'Do not hardcode top/bottom insets in feature screens.',
		],
		accessibilityNotes: [
			'Top-level accessibility label can identify the screen shell in automation.',
			'Keyboard avoidance keeps inputs reachable without requiring product-specific wrappers.',
		],
		platformNotes: [
			'Keyboard behavior differs by platform and is normalized through react-native-keyboard-controller.',
			'Safe-area handling uses native inset APIs on both platforms.',
		],
	}),
	TextInput: doc({
		name: 'TextInput',
		filePath: 'src/components/atoms/TextInput.tsx',
		summary:
			'Core single-line field with canonical value-change callback, helper/error messaging, focus visibility, and forwarded native input ref.',
		exampleStories: [
			'default field',
			'prefix/suffix icon field',
			'helper and error state field',
		],
		variants: ['default', 'helper text', 'error text', 'left/right icon'],
		sizes: ['default height'],
		states: ['default', 'focused', 'error', 'read-only', 'long localized label'],
		compositionExample:
			'Profile form field with leading icon, translated label, and inline validation.',
		usage: {
			relaxed: 'Use on spaced forms where helper text can breathe below the field.',
			operational:
				'Use in dense forms with helper or error text kept concise and token-aligned.',
			noMedia: 'Field remains complete with text labels only; icons are optional.',
		},
		propTable: [
			prop('value', 'string', 'Controlled field value.'),
			prop('defaultValue', 'string', 'Native uncontrolled field value.'),
			prop('onValueChange', '(value: string) => void', 'Canonical value-first callback.'),
			prop('error', 'string', 'Visual and announced error message.'),
			prop('helperText', 'string', 'Supportive helper copy announced with the field.'),
		],
		doList: [
			'Keep labels outside the placeholder.',
			'Use helper and error text through the shared contract.',
		],
		dontList: [
			'Do not use placeholder as the primary label.',
			'Do not hardcode raw borders or colors around the field.',
		],
		accessibilityNotes: [
			'Forwards the native input ref for focus control.',
			'Error and helper text are mirrored into accessibility hints.',
		],
		platformNotes: [
			'Keyboard and font scaling follow native input behavior on iOS and Android.',
			'Focus ring and border state are tokenized across platforms.',
		],
	}),
	ThemedText: doc({
		name: 'ThemedText',
		filePath: 'src/components/atoms/ThemedText.tsx',
		summary:
			'Typography primitive that binds semantic variants to tokenized type roles and accessibility-aware font weight handling.',
		exampleStories: ['section title', 'body copy', 'metadata label', 'code sample'],
		variants: [
			'display',
			'screenTitle',
			'sectionTitle',
			'body',
			'bodyStrong',
			'metadata',
			'metric',
			'label',
			'caption',
			'code',
			'h1-h3',
		],
		sizes: ['tokenized semantic sizes only'],
		states: ['default', 'bold-text enabled', 'large font scale'],
		compositionExample: 'Card header with section title, metric, and metadata stack.',
		usage: {
			relaxed: 'Use stronger role contrast for showcase headings and hero metrics.',
			operational: 'Limit views to a small set of text roles for scan speed.',
			noMedia:
				'Text remains the primary communication layer even when icons or images are absent.',
		},
		propTable: [
			prop('variant', 'TypographyVariant', 'Semantic text role used by the theme.', 'body'),
			prop(
				'weight',
				'TypographyWeight',
				'Optional weight override within accessible limits.',
			),
			prop('allowFontScaling', 'boolean', 'Respects native font-scale preferences.', 'true'),
			COMMON_STYLE_PROP,
		],
		doList: [
			'Use semantic variants rather than one-off font-size overrides.',
			'Keep hierarchy deliberate and limited.',
		],
		dontList: [
			'Do not import raw react-native Text into shared UI.',
			'Do not invent one-off text roles for single screens.',
		],
		accessibilityNotes: [
			'Heading variants announce as headings for screen readers.',
			'Accessible font-weight resolution keeps bold-text settings predictable.',
		],
		platformNotes: [
			'Dynamic Type and Android font scale flow through the same semantic variants.',
			'Platform font-family mapping remains centralized in the theme preset layer.',
		],
	}),
	TouchableCard: doc({
		name: 'TouchableCard',
		filePath: 'src/components/atoms/TouchableCard.tsx',
		summary:
			'Interactive card surface with reduced-motion-aware press feedback, visible focus ring, and forwarded native ref.',
		exampleStories: ['tap-to-open summary card', 'dense interactive list row card'],
		variants: ['default interactive card'],
		sizes: ['card radius md'],
		states: ['default', 'pressed', 'focused', 'disabled'],
		compositionExample: 'Invoice summary card that opens detail view when tapped.',
		usage: {
			relaxed: 'Use on premium overview cards that need calm motion and a clear target.',
			operational:
				'Use on dense tappable rows when full-card activation improves scan speed.',
			noMedia:
				'Interactive comprehension does not depend on imagery; text hierarchy carries the meaning.',
		},
		propTable: [
			COMMON_STYLE_PROP,
			COMMON_TEST_ID_PROP,
			prop('children', 'ReactNode', 'Interactive card contents.'),
		],
		doList: [
			'Use TouchableCard for full-surface activation instead of nesting many pressables.',
			'Keep the primary action obvious inside the card hierarchy.',
		],
		dontList: [
			'Do not stack multiple competing tap targets inside the same full-card region.',
			'Do not rely on press animation when reduced motion is enabled.',
		],
		accessibilityNotes: [
			'Forwards the Pressable ref for focus management.',
			'Focus ring remains visible in keyboard-accessible environments.',
		],
		platformNotes: [
			'Press animation uses spring feedback where motion is allowed, and degrades to static feedback when reduced motion is enabled.',
			'Card background and radius inherit shared platform theme tokens.',
		],
	}),
	AmountInput: doc({
		name: 'AmountInput',
		filePath: 'src/components/molecules/AmountInput.tsx',
		summary:
			'Currency field with Indian number normalization, controlled or uncontrolled state, error announcement, and forwarded input ref.',
		exampleStories: ['amount-only field', 'max-value validation', 'dense payment entry'],
		variants: ['default', 'max-value validation'],
		sizes: ['default field height'],
		states: ['default', 'focused', 'exceeded max', 'read-only'],
		compositionExample: 'Payment capture form with amount, method, and notes.',
		usage: {
			relaxed: 'Use in payment or pricing forms where the amount needs prominence.',
			operational: 'Use in dense operational forms with explicit max-value validation.',
			noMedia:
				'The currency prefix and label keep the field understandable without iconography.',
		},
		propTable: [
			prop('value', 'number', 'Controlled numeric value.'),
			prop('defaultValue', 'number', 'Uncontrolled numeric value.', '0'),
			prop('onValueChange', '(value: number) => void', 'Canonical numeric change callback.'),
			prop('maxValue', 'number', 'Optional validation ceiling.'),
			prop('allowDecimals', 'boolean', 'Allows decimal entry when needed.', 'false'),
		],
		doList: [
			'Use numeric validation through the shared API.',
			'Announce validation errors rather than showing color alone.',
		],
		dontList: [
			'Do not store formatted strings in state.',
			'Do not bypass the normalized value callback with raw text parsing in screens.',
		],
		accessibilityNotes: [
			'Validation errors are announced for screen-reader users.',
			'Forwards the native input ref for programmatic focus.',
		],
		platformNotes: [
			'Keyboard type follows native number-pad behavior on both platforms.',
			'Typography scales with font preferences while preserving amount prominence.',
		],
	}),
	BottomSheetPicker: doc({
		name: 'BottomSheetPicker',
		filePath: 'src/components/molecules/BottomSheetPicker.tsx',
		summary:
			'Searchable selection sheet with controlled or uncontrolled open/value state, selection announcements, and forwarded sheet ref.',
		exampleStories: [
			'single-select picker',
			'searchable options',
			'picker with add-new affordance',
		],
		variants: ['default', 'searchable', 'allow add new'],
		sizes: ['sheet max-height 80%'],
		states: ['closed', 'open', 'search filtered', 'selected option'],
		compositionExample: 'Entity selector used from a form field or command button.',
		usage: {
			relaxed: 'Use on showcase forms where selection needs context and space.',
			operational:
				'Use on dense forms when a full-screen picker would interrupt the workflow too much.',
			noMedia:
				'Search, selection, and confirmation remain clear without any iconography beyond text labels.',
		},
		propTable: [
			prop('open', 'boolean', 'Controlled open state for the sheet.'),
			prop('defaultOpen', 'boolean', 'Uncontrolled open state.', 'false'),
			prop('value', 'string', 'Controlled selected option value.'),
			prop('defaultValue', 'string', 'Uncontrolled selected option value.', "''"),
			prop('onValueChange', '(value: string) => void', 'Canonical selection callback.'),
		],
		doList: [
			'Use for option sets that benefit from search or add-new affordances.',
			'Close the sheet immediately after selection unless workflow requires confirmation.',
		],
		dontList: [
			'Do not overload the sheet with unrelated actions.',
			'Do not mix product-specific business logic into the picker surface.',
		],
		accessibilityNotes: [
			'Selections are announced to screen readers.',
			'Native ref points at the sheet surface for focus handoff if needed.',
		],
		platformNotes: [
			'Android back closes through onRequestClose; iOS uses the same modal presentation contract.',
			'Bottom-sheet animation remains modal-driven rather than gesture-dismissed.',
		],
	}),
	CollapsibleSection: doc({
		name: 'CollapsibleSection',
		filePath: 'src/components/molecules/CollapsibleSection.tsx',
		summary:
			'Expandable disclosure surface with controlled or uncontrolled expanded state, accessibility actions, announcements, and forwarded header ref.',
		exampleStories: [
			'collapsed disclosure',
			'expanded dense details',
			'reduced-motion expansion',
		],
		variants: ['default disclosure'],
		sizes: ['default spacing', 'dense content inside'],
		states: ['collapsed', 'expanded', 'focused'],
		compositionExample:
			'Advanced settings block revealing secondary controls only when needed.',
		usage: {
			relaxed: 'Use for optional explanatory or advanced content in roomy settings surfaces.',
			operational: 'Use to tuck dense secondary details behind a calm disclosure row.',
			noMedia:
				'Title, subtitle, and expanded content remain structurally clear with no icons beyond the chevron.',
		},
		propTable: [
			prop('expanded', 'boolean', 'Controlled expanded state.'),
			prop('defaultExpanded', 'boolean', 'Uncontrolled expanded state.', 'false'),
			prop(
				'onExpandedChange',
				'(expanded: boolean) => void',
				'Canonical disclosure callback.',
			),
			prop(
				'collapsedLabel',
				'string',
				'Assistive label when the section is collapsed.',
				'Show details',
			),
			prop(
				'expandedLabel',
				'string',
				'Assistive label when the section is expanded.',
				'Hide details',
			),
		],
		doList: [
			'Use for progressive disclosure, not for primary navigation.',
			'Keep titles concrete and action-oriented.',
		],
		dontList: [
			'Do not hide critical required input behind a collapsed section.',
			'Do not overload the disclosure with decorative content.',
		],
		accessibilityNotes: [
			'Exposes custom expand and collapse accessibility actions.',
			'Expansion state changes are announced for screen-reader users.',
		],
		platformNotes: [
			'Layout animation respects reduced motion across both platforms.',
			'Hardware-keyboard focus highlights the disclosure header.',
		],
	}),
	ConfirmationModal: doc({
		name: 'ConfirmationModal',
		filePath: 'src/components/molecules/ConfirmationModal.tsx',
		summary:
			'Decision modal with controlled or uncontrolled open state, focus handoff, screen-reader announcement, and confirm/cancel accessibility actions.',
		exampleStories: ['default confirm dialog', 'destructive delete dialog'],
		variants: ['default', 'destructive'],
		sizes: ['modal width full within horizontal padding'],
		states: ['closed', 'open', 'focused cancel', 'focused confirm'],
		compositionExample: 'Delete, archive, or permission-sensitive confirmation checkpoint.',
		usage: {
			relaxed: 'Use where the consequence needs space for description and user reassurance.',
			operational:
				'Use concise copy and clear action order in fast-moving destructive workflows.',
			noMedia: 'Dialog meaning is carried entirely by title, message, and action labels.',
		},
		propTable: [
			prop('open', 'boolean', 'Controlled modal visibility.'),
			prop('defaultOpen', 'boolean', 'Uncontrolled modal visibility.', 'false'),
			prop('onOpenChange', '(open: boolean) => void', 'Canonical visibility callback.'),
			prop(
				'variant',
				"'default' | 'destructive'",
				'Affects confirm action emphasis.',
				'default',
			),
			prop('confirmLabel', 'string', 'Visible confirm action label.', 'Confirm'),
		],
		doList: [
			'Place the safe cancel path first.',
			'Use destructive tone only when the action cannot be easily undone.',
		],
		dontList: [
			'Do not open confirmation modals for harmless actions.',
			'Do not hide the consequence of the action in vague copy.',
		],
		accessibilityNotes: [
			'Announces the title and message when opened and moves focus to the cancel action.',
			'Custom confirm and cancel accessibility actions are exposed on the modal overlay.',
		],
		platformNotes: [
			'Android back maps to cancel via onRequestClose.',
			'VoiceOver and TalkBack stay trapped inside the modal through accessibilityViewIsModal.',
		],
	}),
	DatePickerField: doc({
		name: 'DatePickerField',
		filePath: 'src/components/molecules/DatePickerField.tsx',
		summary:
			'Date field with controlled or uncontrolled value, shortcut actions, visible focus ring, and accessibility shortcut actions.',
		exampleStories: ['single date', 'today shortcut', 'yesterday shortcut'],
		variants: ['default', 'showShortcuts'],
		sizes: ['default field height'],
		states: ['empty', 'selected date', 'focused'],
		compositionExample:
			'Report filter row with date shortcut chips and explicit selected value.',
		usage: {
			relaxed: 'Use with shortcuts where date selection is part of a spacious filter panel.',
			operational: 'Use as a compact single-date trigger in dense search and report forms.',
			noMedia:
				'Label and formatted date make the field readable without relying on the calendar emoji.',
		},
		propTable: [
			prop('value', 'string', 'Controlled ISO date.'),
			prop('defaultValue', 'string', 'Uncontrolled ISO date.', "''"),
			prop('onValueChange', '(value: string) => void', 'Canonical date callback.'),
			prop('showShortcuts', 'boolean', 'Shows today and yesterday shortcuts.', 'false'),
			COMMON_TEST_ID_PROP,
		],
		doList: [
			'Keep display format short and scannable.',
			'Use shortcuts for common operational date picks.',
		],
		dontList: [
			'Do not store localized display text as the source of truth.',
			'Do not rely on the emoji icon for meaning.',
		],
		accessibilityNotes: [
			'Supports Today and Yesterday as custom accessibility actions.',
			'Shortcut changes are announced to screen readers.',
		],
		platformNotes: [
			'Current implementation is platform-agnostic display-first; native date picker integration can layer underneath without changing the API.',
			'Focus ring behavior is consistent across iOS and Android Pressables.',
		],
	}),
	EmptyState: doc({
		name: 'EmptyState',
		filePath: 'src/components/molecules/EmptyState.tsx',
		summary: 'Reusable no-data surface with optional icon and recovery action.',
		exampleStories: ['text-only empty state', 'icon-led empty state', 'empty state with CTA'],
		variants: ['default', 'with icon', 'with action'],
		sizes: ['full-screen centered'],
		states: ['default', 'no media', 'actionable'],
		compositionExample: 'Empty customer list with add-customer call to action.',
		usage: {
			relaxed: 'Use with descriptive guidance and optional iconography on spacious pages.',
			operational: 'Keep copy concise and CTA obvious in dense operational contexts.',
			noMedia: 'The icon is optional; hierarchy and CTA still work with text only.',
		},
		propTable: [
			prop('title', 'string', 'Primary empty-state heading.'),
			prop('description', 'string', 'Supporting empty-state guidance.'),
			prop('actionLabel', 'string', 'Optional CTA label.'),
			prop('onAction', '() => void', 'Optional CTA handler.'),
			COMMON_STYLE_PROP,
		],
		doList: [
			'Explain the empty condition and next best action.',
			'Keep CTAs singular and unambiguous.',
		],
		dontList: [
			'Do not rely on illustrations for comprehension.',
			'Do not show multiple competing recovery actions.',
		],
		accessibilityNotes: [
			'Title is exposed as the surface label when no explicit accessibility label is provided.',
			'CTA reuses the shared Button contract for a11y and focus behavior.',
		],
		platformNotes: [
			'Layout remains centered and token-driven on both platforms.',
			'Empty-state action behavior is inherited from the underlying Button primitive.',
		],
	}),
	FilterBar: doc({
		name: 'FilterBar',
		filePath: 'src/components/molecules/FilterBar.tsx',
		summary:
			'Horizontal selection rail with controlled or uncontrolled value, filter announcements, and focus visibility.',
		exampleStories: [
			'single-select filter bar',
			'clearable filter bar',
			'dense operational filters',
		],
		variants: ['default', 'with clear chip'],
		sizes: ['default chip rail'],
		states: ['default', 'selected chip', 'clearable', 'focused chip'],
		compositionExample: 'Search results toolbar with one active filter and a clear affordance.',
		usage: {
			relaxed: 'Use in roomy search and browse screens with a short, curated set of facets.',
			operational:
				'Use small filter sets for triage and queue management where quick scanning matters.',
			noMedia: 'Filter chips stay fully usable without icons or avatars.',
		},
		propTable: [
			prop('value', 'string', 'Controlled selected filter value.'),
			prop('defaultValue', 'string', 'Uncontrolled selected filter value.'),
			prop('onValueChange', '(value: string) => void', 'Canonical selection callback.'),
			prop('onClear', '() => void', 'Optional clear-all handler.'),
			COMMON_TEST_ID_PROP,
		],
		doList: [
			'Keep filter labels short and mutually exclusive.',
			'Announce filter changes for assistive technologies.',
		],
		dontList: [
			'Do not overload the rail with too many options.',
			'Do not rely on color alone to indicate the active filter.',
		],
		accessibilityNotes: [
			'Selected state is exposed on each chip and clear action is labeled explicitly.',
			'Selection and clear events are announced to screen readers.',
		],
		platformNotes: [
			'Horizontal scrolling uses the same ScrollView contract on iOS and Android.',
			'Focus ring appears on chips in hardware-keyboard environments.',
		],
	}),
	FormField: doc({
		name: 'FormField',
		filePath: 'src/components/molecules/FormField.tsx',
		summary:
			'Labeled form wrapper around the shared TextInput primitive for consistent helper and error presentation.',
		exampleStories: ['required field', 'helper text field', 'error field'],
		variants: ['default', 'required', 'error', 'helper'],
		sizes: ['default field spacing'],
		states: ['default', 'error', 'disabled', 'large text'],
		compositionExample: 'Settings form with required labels and helper copy under each field.',
		usage: {
			relaxed: 'Use in multi-field forms where label and helper rhythm matters.',
			operational:
				'Use the wrapper when dense forms still need shared label and error spacing.',
			noMedia: 'Label, helper, and error affordances work without any icon slots.',
		},
		propTable: [
			prop('label', 'string', 'Visible field label.'),
			prop('error', 'string', 'Visual and announced error copy.'),
			prop('helperText', 'string', 'Supporting helper copy.'),
			prop(
				'required',
				'boolean',
				'Marks the field as required in copy and accessibility hint.',
				'false',
			),
			prop('containerStyle', 'StyleProp<ViewStyle>', 'Wrapper layout override.'),
		],
		doList: [
			'Use for standard labeled fields instead of recreating label/error layout by hand.',
			'Keep helper and error copy concise.',
		],
		dontList: [
			'Do not mix ad hoc labels around the field wrapper.',
			'Do not duplicate validation messages in multiple places.',
		],
		accessibilityNotes: [
			'Required, helper, and error messaging are composed into the field hint.',
			'Underlying input inherits the shared TextInput accessibility contract.',
		],
		platformNotes: [
			'Platform differences are inherited from the core TextInput.',
			'Layout spacing remains token-driven in dense and relaxed themes.',
		],
	}),
	FormSection: doc({
		name: 'FormSection',
		filePath: 'src/components/molecules/FormSection.tsx',
		summary: 'Reusable labeled section wrapper for related form groups.',
		exampleStories: ['section with action', 'section with subtitle'],
		variants: ['default', 'uppercase header'],
		sizes: ['default section gap'],
		states: ['default', 'with action'],
		compositionExample: 'Billing form split into customer, payment, and notes sections.',
		usage: {
			relaxed: 'Use on spacious forms where grouped sections improve rhythm and clarity.',
			operational: 'Use compact section spacing to keep large forms scannable.',
			noMedia: 'Section meaning is fully carried by text headers and grouped fields.',
		},
		propTable: [
			prop('title', 'string', 'Section heading.'),
			prop('subtitle', 'string', 'Optional supporting subtitle.'),
			prop('actionLabel', 'string', 'Optional section-level action label.'),
			COMMON_STYLE_PROP,
			COMMON_TEST_ID_PROP,
		],
		doList: [
			'Group logically related fields together.',
			'Use section-level actions sparingly and clearly.',
		],
		dontList: [
			'Do not use form sections as generic page spacers.',
			'Do not overload a single section with unrelated actions.',
		],
		accessibilityNotes: [
			'SectionHeader inside preserves heading semantics and accessible actions.',
			'Grouped structure supports scan speed for assistive technologies.',
		],
		platformNotes: [
			'Platform behavior follows the shared SectionHeader and layout token contracts.',
			'Dense and relaxed spacing come from theme tokens, not platform forks.',
		],
	}),
	ListItem: doc({
		name: 'ListItem',
		filePath: 'src/components/molecules/ListItem.tsx',
		summary:
			'Reusable row primitive for list surfaces with optional media, metadata, and trailing content.',
		exampleStories: ['default list item', 'item with subtitle', 'item with trailing action'],
		variants: ['default', 'subtitle', 'leading icon/avatar', 'trailing content'],
		sizes: ['default row height'],
		states: ['default', 'dense list row', 'no media'],
		compositionExample: 'Customer list row with title, outstanding amount, and status badge.',
		usage: {
			relaxed: 'Use with larger spacing and richer metadata in showcase lists.',
			operational:
				'Use in dense rows where title and metadata must remain scannable at speed.',
			noMedia:
				'Leading media is optional; title and metadata layout remains aligned without it.',
		},
		propTable: [
			prop('title', 'string', 'Primary row label.'),
			prop('subtitle', 'string', 'Secondary metadata line.'),
			prop('leftIcon', 'ReactNode', 'Optional leading content.'),
			prop('rightContent', 'ReactNode', 'Optional trailing content.'),
			COMMON_TEST_ID_PROP,
		],
		doList: [
			'Keep primary information left-aligned and dominant.',
			'Use trailing content for concise status or action affordances.',
		],
		dontList: [
			'Do not overload a row with many competing badges and actions.',
			'Do not make media required for alignment.',
		],
		accessibilityNotes: [
			'Decorative leading content stays out of the accessibility tree.',
			'Trailing actions should carry their own stable labels when interactive.',
		],
		platformNotes: [
			'Padding and alignment come from logical spacing props for RTL safety.',
			'Typography and spacing adapt uniformly on iOS and Android.',
		],
	}),
	PaginatedList: doc({
		name: 'PaginatedList',
		filePath: 'src/components/molecules/PaginatedList.tsx',
		summary:
			'FlatList wrapper with loading, empty, error, retry, and load-more states for reusable data surfaces.',
		exampleStories: [
			'initial loading',
			'error with retry',
			'empty result set',
			'load-more footer',
		],
		variants: ['default', 'with header'],
		sizes: ['skeleton count configurable'],
		states: ['loading', 'error', 'empty', 'refreshing', 'load more'],
		compositionExample:
			'Invoices or customers list with query, filters, and retry handling above the rows.',
		usage: {
			relaxed: 'Use when list empty or error states need more explanatory space.',
			operational: 'Use concise empty and error copy in dense queue-style views.',
			noMedia: 'List shell proves loading, empty, and error surfaces without any imagery.',
		},
		propTable: [
			prop('data', 'T[]', 'Visible list data.'),
			prop('isLoading', 'boolean', 'Controls initial and footer loading states.'),
			prop('hasError', 'boolean', 'Switches to error state.'),
			prop('onRetry', '() => void', 'Retry handler for error state.'),
			COMMON_TEST_ID_PROP,
		],
		doList: [
			'Use shared loading, empty, and error states before custom feature wrappers.',
			'Keep retry affordances obvious and singular.',
		],
		dontList: [
			'Do not reimplement list state handling in feature screens.',
			'Do not hide empty or error states behind blank lists.',
		],
		accessibilityNotes: [
			'Retry action is explicitly labeled and keyboard/touch accessible.',
			'Loading and empty states remain readable at larger font scales.',
		],
		platformNotes: [
			'FlatList behavior is platform-native, while loading and error chrome stay tokenized.',
			'Pull-to-refresh integrates with native platform patterns through the shared API.',
		],
	}),
	PhoneInput: doc({
		name: 'PhoneInput',
		filePath: 'src/components/molecules/PhoneInput.tsx',
		summary:
			'Phone field with +91 prefix normalization, controlled or uncontrolled value, blur validation, error announcements, and forwarded ref.',
		exampleStories: [
			'default phone field',
			'validation on blur',
			'pasted number normalization',
		],
		variants: ['default'],
		sizes: ['default field height'],
		states: ['default', 'focused', 'invalid length', 'read-only'],
		compositionExample: 'Customer or supplier contact form with mobile number field.',
		usage: {
			relaxed: 'Use with label and helper context in profile or onboarding forms.',
			operational:
				'Use in dense account forms where normalized numeric entry matters more than decoration.',
			noMedia: 'Prefix and label make the field self-explanatory without icons.',
		},
		propTable: [
			prop('value', 'string', 'Controlled normalized phone number.'),
			prop('defaultValue', 'string', 'Uncontrolled normalized phone number.', "''"),
			prop(
				'onValueChange',
				'(phone: string) => void',
				'Canonical normalized value callback.',
			),
			prop('editable', 'boolean', 'Read-only toggle.', 'true'),
			COMMON_TEST_ID_PROP,
		],
		doList: [
			'Normalize pasted values through the shared input.',
			'Announce validation failures instead of relying on color only.',
		],
		dontList: [
			'Do not store punctuation-heavy phone formats in state.',
			'Do not duplicate +91 prefixes outside the field.',
		],
		accessibilityNotes: [
			'Validation failure is announced when the field blurs with too few digits.',
			'Forwards the native input ref for focus handoff.',
		],
		platformNotes: [
			'Uses phone-pad keyboard type on both platforms.',
			'Border, focus, and validation states stay token-consistent across iOS and Android.',
		],
	}),
	SearchBar: doc({
		name: 'SearchBar',
		filePath: 'src/components/molecules/SearchBar.tsx',
		summary:
			'Search field with controlled or uncontrolled value, canonical value callback, clear affordance announcement, focus ring, and forwarded ref.',
		exampleStories: ['empty search', 'filled search with clear', 'large-text search bar'],
		variants: ['default', 'clearable'],
		sizes: ['default height'],
		states: ['empty', 'focused', 'filled', 'cleared'],
		compositionExample:
			'Component inventory and checklist explorer search surfaces in the design-system workbench.',
		usage: {
			relaxed: 'Use in roomy browse headers or search-first dashboards.',
			operational: 'Use in compact toolbars with adjacent chips or filters.',
			noMedia:
				'Search affordance remains clear through label, field shape, and clear action even without extra art.',
		},
		propTable: [
			prop('value', 'string', 'Controlled search query.'),
			prop('defaultValue', 'string', 'Uncontrolled search query.', "''"),
			prop('onValueChange', '(value: string) => void', 'Canonical query callback.'),
			prop('clearAccessibilityLabel', 'string', 'Stable clear-action label.', 'Clear search'),
			COMMON_TEST_ID_PROP,
		],
		doList: [
			'Use stable English accessibility labels for search and clear actions.',
			'Keep placeholder concise and task-oriented.',
		],
		dontList: [
			'Do not hide the clear affordance when a query is present.',
			'Do not couple query logic to product-specific stores in the component.',
		],
		accessibilityNotes: [
			'Clear action announces when the query is reset.',
			'Forwards the native TextInput ref for focus management.',
		],
		platformNotes: [
			'Focus ring is visible in keyboard-accessible environments on both platforms.',
			'Keyboard behavior and auto-correction remain native while visual treatment stays tokenized.',
		],
	}),
	SectionHeader: doc({
		name: 'SectionHeader',
		filePath: 'src/components/molecules/SectionHeader.tsx',
		summary: 'Reusable titled row for sections with optional subtitle and trailing action.',
		exampleStories: ['default section header', 'uppercase label header', 'header with action'],
		variants: ['default', 'uppercase'],
		sizes: ['default spacing'],
		states: ['default', 'with subtitle', 'with action'],
		compositionExample:
			'Form section or list group heading with optional trailing link action.',
		usage: {
			relaxed: 'Use richer subtitles and breathing room for showcase sections.',
			operational: 'Keep titles short and actions compact in dense list and form views.',
			noMedia:
				'Header meaning is carried entirely by text hierarchy and optional action label.',
		},
		propTable: [
			prop('title', 'string', 'Primary section title.'),
			prop('subtitle', 'string', 'Optional supporting subtitle.'),
			prop('actionLabel', 'string', 'Optional trailing action label.'),
			prop('variant', "'default' | 'uppercase'", 'Header presentation style.', 'default'),
			COMMON_TEST_ID_PROP,
		],
		doList: [
			'Use section headers to reinforce hierarchy, not decoration.',
			'Keep trailing actions secondary and specific.',
		],
		dontList: [
			'Do not use uppercase mode for long body-style headings.',
			'Do not mix many trailing actions in the same header.',
		],
		accessibilityNotes: [
			'Trailing action is exposed as a button when provided.',
			'Typography role communicates section hierarchy without raw font overrides.',
		],
		platformNotes: [
			'Logical spacing keeps action alignment RTL-safe on both platforms.',
			'Typography and color tokens stay consistent across native themes.',
		],
	}),
	SettingsCard: doc({
		name: 'SettingsCard',
		filePath: 'src/components/molecules/SettingsCard.tsx',
		summary:
			'Composable settings surface for grouped preferences with optional title, body, and actions.',
		exampleStories: ['default settings card', 'card with footer action'],
		variants: ['default', 'flat accent grouping'],
		sizes: ['default padding'],
		states: ['default', 'dense grouped settings'],
		compositionExample:
			'Preference block containing toggles, descriptions, and one supporting action.',
		usage: {
			relaxed: 'Use for higher-level settings modules with explanatory copy.',
			operational: 'Use in stacked settings lists where calm grouping improves scan speed.',
			noMedia: 'Structure and hierarchy stay clear with text-only sections.',
		},
		propTable: [
			prop('title', 'string', 'Settings card heading.'),
			prop('description', 'string', 'Supporting card text.'),
			prop('children', 'ReactNode', 'Settings content.'),
			COMMON_STYLE_PROP,
			COMMON_TEST_ID_PROP,
		],
		doList: [
			'Group related preferences together.',
			'Keep descriptions shorter than the heading.',
		],
		dontList: [
			'Do not overload a single settings card with unrelated preferences.',
			'Do not use settings cards for urgent destructive actions.',
		],
		accessibilityNotes: [
			'Settings content inherits the semantics of the children placed inside.',
			'Card structure remains readable at high font scales.',
		],
		platformNotes: [
			'Surface treatment uses shared card tokens on both platforms.',
			'Spacing remains consistent across dense and relaxed presets.',
		],
	}),
	SkeletonBlock: doc({
		name: 'SkeletonBlock',
		filePath: 'src/components/molecules/SkeletonBlock.tsx',
		summary: 'Primitive skeleton placeholder block for loading surfaces.',
		exampleStories: ['text line skeleton', 'card media skeleton'],
		variants: ['default'],
		sizes: ['width/height configurable'],
		states: ['default', 'reduced motion'],
		compositionExample: 'Header metric placeholder or card-media placeholder block.',
		usage: {
			relaxed: 'Use to preserve layout on branded or showcase surfaces while data loads.',
			operational: 'Use to keep dense list and card structures stable during loading.',
			noMedia:
				'Skeletons intentionally remove content and media while preserving layout shape.',
		},
		propTable: [
			prop('width', 'number | string', 'Skeleton width token or percentage.'),
			prop('height', 'number', 'Skeleton height.'),
			COMMON_TEST_ID_PROP,
			COMMON_STYLE_PROP,
		],
		doList: [
			'Match the final layout silhouette closely.',
			'Respect reduced motion and avoid distracting shimmer when disabled.',
		],
		dontList: [
			'Do not use skeletons for error or permission-denied states.',
			'Do not create unrealistic placeholder layouts.',
		],
		accessibilityNotes: [
			'Skeletons should stay out of the semantic accessibility tree when purely decorative.',
			'Reduced-motion support prevents attention-stealing shimmer.',
		],
		platformNotes: [
			'Skeleton animation adapts to runtime reduced-motion signals on both platforms.',
			'Shape and spacing are token-driven rather than platform-specific.',
		],
	}),
	SkeletonRow: doc({
		name: 'SkeletonRow',
		filePath: 'src/components/molecules/SkeletonRow.tsx',
		summary: 'Row-shaped loading placeholder for lists and tables.',
		exampleStories: ['text row skeleton', 'avatar row skeleton'],
		variants: ['default', 'withAvatar'],
		sizes: ['one line', 'multiple lines'],
		states: ['default', 'reduced motion'],
		compositionExample: 'List placeholder while customer or invoice data loads.',
		usage: {
			relaxed: 'Use in hero or detail layouts with more breathing room between rows.',
			operational: 'Use compact row placeholders for dense tables and list queues.',
			noMedia: 'Avatar slot is optional; row skeleton remains aligned without it.',
		},
		propTable: [
			prop('withAvatar', 'boolean', 'Shows a circular avatar block.', 'false'),
			prop('lines', 'number', 'Number of text lines.', '2'),
			COMMON_TEST_ID_PROP,
			COMMON_STYLE_PROP,
		],
		doList: [
			'Keep skeleton rows aligned with the final row structure.',
			'Use avatar mode only when the final row actually has media.',
		],
		dontList: [
			'Do not use too many lines for compact operational rows.',
			'Do not animate aggressively when reduced motion is enabled.',
		],
		accessibilityNotes: [
			'Pure loading placeholders should not become semantic content for screen readers.',
			'Reduced-motion handling applies to shimmer behavior.',
		],
		platformNotes: [
			'Shimmer and layout are token-driven across platforms.',
			'Avatar and line spacing stay consistent in dense and relaxed themes.',
		],
	}),
	StatCard: doc({
		name: 'StatCard',
		filePath: 'src/components/molecules/StatCard.tsx',
		summary: 'KPI surface for value, context, icon, and optional trend metadata.',
		exampleStories: ['value only', 'value with trend', 'icon-led metric card'],
		variants: ['default', 'with trend', 'with icon'],
		sizes: ['default stat spacing'],
		states: ['default', 'comparison trend', 'long label'],
		compositionExample: 'Dashboard metric rail with KPI, trend, and contextual label.',
		usage: {
			relaxed: 'Use to showcase one dominant metric with optional supporting trend.',
			operational: 'Use compact stat cards in dashboard rails where scan speed matters.',
			noMedia: 'The icon is optional; metric hierarchy remains strong without it.',
		},
		propTable: [
			prop('label', 'string', 'Supporting metric label.'),
			prop('value', 'string | number', 'Primary metric value.'),
			prop('trend', 'string', 'Optional trend string, e.g. +12%.'),
			prop('icon', 'LucideIcon', 'Optional icon slot.'),
			COMMON_A11Y_PROP,
		],
		doList: [
			'Keep the metric dominant and the label concise.',
			'Use trend strings that are understandable without color alone.',
		],
		dontList: [
			'Do not stuff multiple unrelated metrics into one card.',
			'Do not depend on iconography for the main meaning.',
		],
		accessibilityNotes: [
			'Accessible label defaults to a readable metric summary.',
			'Long metric values use fit-to-width behavior while preserving readability.',
		],
		platformNotes: [
			'Card elevation and typography scale adapt through shared theme tokens.',
			'Trend color harmonizes with platform theme palettes across iOS and Android.',
		],
	}),
	SwipeableRow: doc({
		name: 'SwipeableRow',
		filePath: 'src/components/molecules/SwipeableRow.tsx',
		summary:
			'Action row with share, edit, and delete affordances plus accessibility actions for non-gesture users.',
		exampleStories: ['delete-only row', 'edit and delete row', 'share edit delete row'],
		variants: ['delete only', 'delete + edit', 'delete + edit + share'],
		sizes: ['fixed action width'],
		states: ['default', 'action triggered'],
		compositionExample: 'Queue row with inline destructive and supportive follow-up actions.',
		usage: {
			relaxed: 'Use where row actions need more breathing room or explanation.',
			operational:
				'Use in dense operational lists where quick edit/share/delete access matters.',
			noMedia: 'Action comprehension is preserved by labels and semantics rather than icons.',
		},
		propTable: [
			prop('onDelete', '() => void', 'Required destructive action handler.'),
			prop('onEdit', '() => void', 'Optional edit action handler.'),
			prop('onShare', '() => void', 'Optional share action handler.'),
			prop('deleteLabel', 'string', 'Accessible delete label.', 'Delete'),
			COMMON_TEST_ID_PROP,
		],
		doList: [
			'Expose every swipe-only action through a visible or accessible fallback.',
			'Keep destructive action labeling explicit.',
		],
		dontList: [
			'Do not hide the only edit path behind an inaccessible gesture.',
			'Do not use swipe rows for primary navigation.',
		],
		accessibilityNotes: [
			'Custom accessibility actions expose share, edit, and delete without requiring a swipe gesture.',
			'Triggered actions are announced for screen-reader users.',
		],
		platformNotes: [
			'Current shared-library fallback keeps actions visible for testability; production gesture integrations can layer in without changing the API.',
			'Action sizing remains touch-safe on both platforms.',
		],
	}),
	TableRow: doc({
		name: 'TableRow',
		filePath: 'src/components/molecules/TableRow.tsx',
		summary: 'Reusable data row surface for compact key-value or columnar table-like content.',
		exampleStories: ['two-column row', 'row with right-aligned metric'],
		variants: ['default'],
		sizes: ['dense operational row'],
		states: ['default', 'long label', 'numeric emphasis'],
		compositionExample: 'Invoice summary table row with label, amount, and quiet metadata.',
		usage: {
			relaxed: 'Use with more row spacing in showcase summaries.',
			operational: 'Use dense alignment and restrained chrome for transactional tables.',
			noMedia: 'Table comprehension relies on text alignment and hierarchy, not imagery.',
		},
		propTable: [
			prop('left', 'ReactNode', 'Left column content.'),
			prop('right', 'ReactNode', 'Right column content.'),
			COMMON_STYLE_PROP,
			COMMON_TEST_ID_PROP,
		],
		doList: ['Align numbers and code-like values consistently.', 'Keep row chrome quiet.'],
		dontList: [
			'Do not introduce heavy borders between every table row.',
			'Do not mix many text roles in a single row.',
		],
		accessibilityNotes: [
			'Use readable cell text and labels so the row stays understandable when linearized by assistive tech.',
			'RTL-safe alignment should use logical-direction styles.',
		],
		platformNotes: [
			'Layout is flex-based and platform-neutral.',
			'Dense spacing stays tokenized across native themes.',
		],
	}),
	TextAreaField: doc({
		name: 'TextAreaField',
		filePath: 'src/components/molecules/TextAreaField.tsx',
		summary:
			'Multiline field with controlled or uncontrolled value, visible focus ring, character counting, and forwarded ref.',
		exampleStories: ['default textarea', 'character counter', 'required notes field'],
		variants: ['default', 'maxLength counter', 'required'],
		sizes: ['default min height', 'maxLines constrained'],
		states: ['default', 'focused', 'read-only', 'counter active'],
		compositionExample: 'Approval notes field inside a compact review form.',
		usage: {
			relaxed:
				'Use where supporting context and helper copy can sit around the field comfortably.',
			operational: 'Constrain max lines and keep labels short in dense workflow forms.',
			noMedia: 'Textarea comprehension is text-first and needs no supporting media.',
		},
		propTable: [
			prop('value', 'string', 'Controlled textarea value.'),
			prop('defaultValue', 'string', 'Uncontrolled textarea value.', "''"),
			prop('onValueChange', '(value: string) => void', 'Canonical multiline callback.'),
			prop('maxLength', 'number', 'Optional character limit.'),
			prop('maxLines', 'number', 'Maximum visible line count before clipping.', '6'),
		],
		doList: [
			'Use labels above the field and keep counters secondary.',
			'Constrain max lines on dense operational surfaces.',
		],
		dontList: [
			'Do not rely on placeholder text as the label.',
			'Do not remove focus visibility in premium surfaces.',
		],
		accessibilityNotes: [
			'Forwards the native multiline input ref.',
			'Focus ring remains visible for keyboard-accessible environments.',
		],
		platformNotes: [
			'Text scaling and multiline behavior follow native input conventions.',
			'Counter and border states remain token-consistent across iOS and Android.',
		],
	}),
	Toast: doc({
		name: 'Toast',
		filePath: 'src/components/molecules/Toast.tsx',
		summary:
			'Transient feedback banner with semantic variants, alert semantics, and sticky-error behavior.',
		exampleStories: ['success toast', 'warning toast', 'sticky error toast'],
		variants: ['success', 'info', 'warning', 'error'],
		sizes: ['default bottom offset'],
		states: ['hidden', 'visible', 'auto-dismiss', 'sticky error'],
		compositionExample:
			'Post-save confirmation or validation failure feedback after an action completes.',
		usage: {
			relaxed: 'Use for lightweight, contextual feedback on showcase and settings surfaces.',
			operational: 'Use concise, high-signal feedback in queues and workflow-heavy screens.',
			noMedia: 'Toasts rely on text hierarchy and semantic tone rather than illustration.',
		},
		propTable: [
			prop('visible', 'boolean', 'Controls whether the toast is shown.'),
			prop('variant', "'success' | 'info' | 'warning' | 'error'", 'Semantic feedback tone.'),
			prop(
				'duration',
				'number',
				'Optional auto-dismiss duration in milliseconds.',
				'3000 except sticky errors',
			),
			prop('message', 'string', 'Toast body text.'),
			COMMON_TEST_ID_PROP,
		],
		doList: [
			'Keep copy concise and action-specific.',
			'Use sticky errors when the user must acknowledge the issue.',
		],
		dontList: [
			'Do not use toasts for complex multi-step recovery instructions.',
			'Do not rely on color alone for urgency.',
		],
		accessibilityNotes: [
			'Exposes alert semantics and live-region behavior for screen readers.',
			'Sticky error toasts stay visible until dismissed or replaced.',
		],
		platformNotes: [
			'Positioning respects shared mobile bottom offset tokens on both platforms.',
			'Announcement behavior stays consistent through shared accessibility helpers.',
		],
	}),
};

export const DESIGN_SYSTEM_COMPONENT_DOC_LIST = Object.values(DESIGN_SYSTEM_COMPONENT_DOCS);
