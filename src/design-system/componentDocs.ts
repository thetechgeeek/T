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
		filePath: 'src/design-system/components/atoms/Badge.tsx',
		summary:
			'Compact status, count, and metadata pill for inline emphasis without introducing heavy chrome.',
		exampleStories: ['neutral metadata chip', 'success status pill', 'dense status badge'],
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
		compositionExample: 'Entity list row with status badge and quiet metadata.',
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
		filePath: 'src/design-system/components/atoms/Button.tsx',
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
		filePath: 'src/design-system/components/atoms/Card.tsx',
		summary:
			'Foundational card surface with header/body/footer grammar, horizontal media layout, and featured hero treatment.',
		exampleStories: [
			'raised detail card',
			'outlined data card',
			'horizontal media card',
			'featured hero card',
		],
		variants: ['elevated', 'outlined', 'flat', 'featured'],
		sizes: [
			'padding none',
			'padding sm',
			'padding md',
			'padding lg',
			'density compact/default/relaxed',
		],
		states: ['default', 'dense stack', 'header/footer slots', 'horizontal layout'],
		compositionExample:
			'Metrics or media module card with title, body content, and a quiet footer action band.',
		usage: {
			relaxed: 'Use elevated cards for premium overview modules and spaced settings blocks.',
			operational:
				'Use compact outlined cards for dense operational grouping where scan speed matters.',
			noMedia:
				'Cards remain structurally complete with text-only headers, body, and footer slots when media is missing.',
		},
		propTable: [
			prop(
				'variant',
				"'elevated' | 'outlined' | 'flat'",
				'Surface treatment and separation.',
				'elevated',
			),
			prop('header', 'ReactNode', 'Optional top section slot.'),
			prop('footer', 'ReactNode', 'Optional bottom section slot.'),
			prop('media', 'ReactNode', 'Optional media slot for hero or horizontal layouts.'),
			prop(
				'orientation',
				"'vertical' | 'horizontal'",
				'Controls media/content layout.',
				'vertical',
			),
			prop('featured', 'boolean', 'Applies restrained hero emphasis styling.', 'false'),
			prop('padding', "'none' | 'sm' | 'md' | 'lg'", 'Tokenized card padding.', 'md'),
			prop(
				'density',
				"'compact' | 'default' | 'relaxed'",
				'Maps to operational or showcase spacing.',
				'default',
			),
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
	Checkbox: doc({
		name: 'Checkbox',
		filePath: 'src/design-system/components/atoms/Checkbox.tsx',
		summary:
			'Selection control for independent boolean or multi-select choices, with indeterminate support, group composition, focus visibility, and announced state changes.',
		exampleStories: [
			'default checkbox',
			'indeterminate bulk-select checkbox',
			'checkbox group with helper copy',
		],
		variants: ['default', 'checked', 'indeterminate', 'disabled', 'group'],
		sizes: ['touch-safe default'],
		states: ['unchecked', 'checked', 'mixed', 'disabled', 'grouped options'],
		compositionExample:
			'Bulk-action preferences section with several independent delivery-channel toggles.',
		usage: {
			relaxed: 'Use helper copy when the consequence of a checked state needs context.',
			operational:
				'Use concise labels and dense vertical rhythm in settings lists and bulk edit panels.',
			noMedia:
				'Checkboxes remain explicit through text labels and state icons without illustration.',
		},
		propTable: [
			prop('label', 'string', 'Visible option label.'),
			prop('description', 'string', 'Optional helper copy under the label.'),
			prop('checked', 'boolean', 'Controlled checked state.'),
			prop('defaultChecked', 'boolean', 'Uncontrolled checked state.', 'false'),
			prop('indeterminate', 'boolean', 'Renders the mixed-selection state.', 'false'),
			prop('onCheckedChange', '(checked: boolean) => void', 'Canonical toggle callback.'),
			prop('disabled', 'boolean', 'Disables interaction and dims the control.', 'false'),
			COMMON_A11Y_PROP,
			COMMON_STYLE_PROP,
			COMMON_TEST_ID_PROP,
		],
		doList: [
			'Use indeterminate state for partial bulk selection.',
			'Keep option labels specific enough that checked state reads clearly out of context.',
		],
		dontList: [
			'Do not use checkboxes for mutually exclusive choices.',
			'Do not rely on color alone to communicate selection.',
		],
		accessibilityNotes: [
			'Uses checkbox role with checked, mixed, and disabled state mapping.',
			'Announces checked and unchecked changes through the shared accessibility helper.',
		],
		platformNotes: [
			'Visual treatment stays consistent across iOS and Android while keeping native accessibility semantics.',
			'Minimum touch target is preserved through the shared mobile control spacing tokens.',
		],
	}),
	Chip: doc({
		name: 'Chip',
		filePath: 'src/design-system/components/atoms/Chip.tsx',
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
		filePath: 'src/design-system/components/atoms/Divider.tsx',
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
		filePath: 'src/design-system/components/atoms/IconButton.tsx',
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
	Radio: doc({
		name: 'Radio',
		filePath: 'src/design-system/components/atoms/Radio.tsx',
		summary:
			'Single-choice selector for mutually exclusive options, with group composition, focus visibility, and announced selection changes.',
		exampleStories: ['standalone selected radio', 'disabled radio option', 'radio group'],
		variants: ['default', 'selected', 'disabled', 'group'],
		sizes: ['touch-safe default'],
		states: ['unselected', 'selected', 'disabled', 'grouped choices'],
		compositionExample:
			'Preference panel where exactly one scheduling mode can be active at a time.',
		usage: {
			relaxed:
				'Use descriptive helper copy when users need more context before choosing one option.',
			operational: 'Use radios for compact, mutually exclusive configuration choices.',
			noMedia:
				'State remains clear through dot fill and text labels without extra iconography.',
		},
		propTable: [
			prop('label', 'string', 'Visible option label.'),
			prop('description', 'string', 'Optional helper copy under the label.'),
			prop('selected', 'boolean', 'Controlled selected state.'),
			prop('defaultSelected', 'boolean', 'Uncontrolled selected state.', 'false'),
			prop(
				'onSelectedChange',
				'(selected: boolean) => void',
				'Canonical selection callback.',
			),
			prop('disabled', 'boolean', 'Disables interaction and dims the control.', 'false'),
			COMMON_A11Y_PROP,
			COMMON_STYLE_PROP,
			COMMON_TEST_ID_PROP,
		],
		doList: [
			'Use radios when only one option may be active.',
			'Group related options under one visible question or section title.',
		],
		dontList: [
			'Do not use radios for independent toggles.',
			'Do not allow one radio group to represent unrelated choices.',
		],
		accessibilityNotes: [
			'Uses radio role with selected and disabled states.',
			'Announces newly selected options for screen-reader users.',
		],
		platformNotes: [
			'Rendering is intentionally identical across iOS and Android for enterprise consistency.',
			'Touch target stays above the shared minimum on both platforms.',
		],
	}),
	Screen: doc({
		name: 'Screen',
		filePath: 'src/design-system/components/atoms/Screen.tsx',
		summary: 'Safe-area, scroll, and keyboard-aware page shell for reusable mobile surfaces.',
		exampleStories: [
			'scrolling form screen',
			'static summary screen',
			'screen with footer actions',
			'input screen with keyboard dismissal on background tap',
		],
		variants: ['static', 'scrollable', 'keyboard-aware', 'keyboard-dismissable'],
		sizes: ['safe-area top', 'safe-area top+bottom'],
		states: ['default', 'with footer', 'with overlay', 'keyboard open'],
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
				'dismissKeyboardOnBackgroundTap',
				'boolean',
				'Dismisses the native keyboard when the background shell is tapped.',
				'false',
			),
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
			'Optional background-tap dismissal preserves native keyboard escape behavior.',
		],
		platformNotes: [
			'Keyboard behavior differs by platform and is normalized through react-native-keyboard-controller.',
			'Safe-area handling uses native inset APIs on both platforms.',
		],
	}),
	TextInput: doc({
		name: 'TextInput',
		filePath: 'src/design-system/components/atoms/TextInput.tsx',
		summary:
			'Core single-line field with canonical value-change callback, helper/error messaging, clearable and loading states, mobile autofill hooks, and forwarded native input ref.',
		exampleStories: [
			'default field',
			'prefix/suffix icon field',
			'helper and error state field',
			'clearable character-count field',
			'loading async-validation field',
			'secure autofill field',
		],
		variants: [
			'default',
			'helper text',
			'warning text',
			'error text',
			'left/right icon',
			'clearable',
			'loading',
		],
		sizes: ['default height'],
		states: [
			'default',
			'focused',
			'warning',
			'error',
			'loading',
			'disabled',
			'read-only',
			'long localized label',
		],
		compositionExample:
			'Profile form field with leading icon, translated label, async validation, and mobile autofill hints.',
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
			prop('warningText', 'string', 'Optional warning message without error styling.'),
			prop('helperText', 'string', 'Supportive helper copy announced with the field.'),
			prop(
				'clearable',
				'boolean',
				'Shows a clear affordance when the field has content.',
				'false',
			),
			prop('showCharacterCount', 'boolean', 'Displays current/max character count.', 'false'),
			prop(
				'loading',
				'boolean',
				'Shows async validation or pending-state indicator.',
				'false',
			),
		],
		doList: [
			'Keep labels outside the placeholder.',
			'Use helper, warning, and error text through the shared contract.',
			'Use clearable or loading states instead of product-specific ad hoc trailing controls.',
		],
		dontList: [
			'Do not use placeholder as the primary label.',
			'Do not hardcode raw borders or colors around the field.',
		],
		accessibilityNotes: [
			'Forwards the native input ref for focus control.',
			'Error, warning, and helper text are mirrored into accessibility hints.',
			'Loading and disabled state are surfaced through native accessibilityState.',
		],
		platformNotes: [
			'Keyboard, autofill, return key, and secure-entry behavior flow straight through to the native input on iOS and Android.',
			'Focus ring, clear affordance, and border state are tokenized across platforms.',
		],
	}),
	ThemedText: doc({
		name: 'ThemedText',
		filePath: 'src/design-system/components/atoms/ThemedText.tsx',
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
	ToggleSwitch: doc({
		name: 'ToggleSwitch',
		filePath: 'src/design-system/components/atoms/ToggleSwitch.tsx',
		summary:
			'Binary setting control with optional label and helper copy, focus visibility, and announced on/off state changes.',
		exampleStories: [
			'bare switch',
			'labeled policy toggle',
			'disabled toggle with helper copy',
		],
		variants: ['default', 'on', 'off', 'disabled', 'labeled'],
		sizes: ['touch-safe default'],
		states: ['on', 'off', 'disabled', 'with helper copy'],
		compositionExample:
			'Settings row that enables a workflow rule and explains the downstream behavior.',
		usage: {
			relaxed: 'Use labeled toggles with helper copy when a setting needs explanation.',
			operational:
				'Use concise labels in dense settings panels and operational preferences lists.',
			noMedia:
				'The switch remains legible through track/thumb contrast and text-only labeling.',
		},
		propTable: [
			prop('label', 'string', 'Visible setting label.'),
			prop('description', 'string', 'Optional helper copy under the label.'),
			prop('value', 'boolean', 'Controlled on/off state.'),
			prop('defaultValue', 'boolean', 'Uncontrolled on/off state.', 'false'),
			prop('onValueChange', '(value: boolean) => void', 'Canonical toggle callback.'),
			prop('disabled', 'boolean', 'Disables interaction and dims the control.', 'false'),
			COMMON_A11Y_PROP,
			COMMON_STYLE_PROP,
			COMMON_TEST_ID_PROP,
		],
		doList: [
			'Use switches for immediate boolean settings.',
			'Add helper text when the effect of a rule needs explanation.',
		],
		dontList: [
			'Do not use switches for actions that require confirmation.',
			'Do not hide the setting meaning behind an unlabeled switch when a visible label is possible.',
		],
		accessibilityNotes: [
			'Uses switch role with checked and disabled state mapping.',
			'Announces on and off state changes through the shared accessibility helper.',
		],
		platformNotes: [
			'Track and thumb styling stay token-driven across iOS and Android for consistent output.',
			'The touch-safe row container gives reliable toggling on both platforms and keyboard environments.',
		],
	}),
	TouchableCard: doc({
		name: 'TouchableCard',
		filePath: 'src/design-system/components/atoms/TouchableCard.tsx',
		summary:
			'Interactive card surface with reduced-motion-aware press feedback, visible focus ring, and forwarded native ref.',
		exampleStories: ['tap-to-open summary card', 'dense interactive list row card'],
		variants: ['default interactive card'],
		sizes: ['card radius md'],
		states: ['default', 'pressed', 'focused', 'disabled'],
		compositionExample: 'Summary card that opens a detail view when tapped.',
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
		filePath: 'src/design-system/components/molecules/AmountInput.tsx',
		summary:
			'Currency field with Indian number normalization, controlled or uncontrolled state, error announcement, and forwarded input ref.',
		exampleStories: ['amount-only field', 'max-value validation', 'dense amount entry'],
		variants: ['default', 'max-value validation'],
		sizes: ['default field height'],
		states: ['default', 'focused', 'exceeded max', 'read-only'],
		compositionExample: 'Settlement form with amount, method, and notes.',
		usage: {
			relaxed: 'Use in pricing or settlement forms where the amount needs prominence.',
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
		filePath: 'src/design-system/components/molecules/BottomSheetPicker.tsx',
		summary:
			'Searchable selection sheet with controlled or uncontrolled open/value state, snap-point sizing, drag-to-dismiss, keyboard-aware height promotion, selection announcements, and forwarded sheet ref.',
		exampleStories: [
			'single-select picker',
			'searchable options',
			'picker with add-new affordance',
			'drag-dismissable 90% sheet',
		],
		variants: ['default', 'searchable', 'allow add new', 'drag dismiss'],
		sizes: ['25% snap point', '50% snap point', '90% snap point'],
		states: ['closed', 'open', 'search filtered', 'selected option', 'keyboard raised'],
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
			prop(
				'snapPoint',
				"'25%' | '50%' | '90%'",
				'Primary snap point used by the sheet surface.',
				"'50%'",
			),
			prop(
				'dragToDismiss',
				'boolean',
				'Allows the handle area to dismiss with downward drag velocity.',
				'true',
			),
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
			'Drag dismissal, backdrop tap, and nested scrolling stay aligned with mobile sheet expectations on both platforms.',
		],
	}),
	CollapsibleSection: doc({
		name: 'CollapsibleSection',
		filePath: 'src/design-system/components/molecules/CollapsibleSection.tsx',
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
		filePath: 'src/design-system/components/molecules/ConfirmationModal.tsx',
		summary:
			'Decision modal with controlled or uncontrolled open state, size variants, focus handoff and restore, optional hard confirmation field, screen-reader announcement, and confirm/cancel accessibility actions.',
		exampleStories: [
			'default confirm dialog',
			'destructive delete dialog',
			'hard confirmation publish dialog',
		],
		variants: ['default', 'destructive'],
		sizes: ['small', 'medium', 'large'],
		states: ['closed', 'open', 'focused cancel', 'focused confirm', 'hard confirm gated'],
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
			prop('size', "'sm' | 'md' | 'lg'", 'Shared modal width variants.', "'md'"),
			prop(
				'variant',
				"'default' | 'destructive'",
				'Affects confirm action emphasis.',
				'default',
			),
			prop('confirmLabel', 'string', 'Visible confirm action label.', 'Confirm'),
			prop(
				'hardConfirmValue',
				'string',
				'Optional exact-match value required before confirm becomes active.',
			),
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
			'VoiceOver and TalkBack stay trapped inside the modal through accessibilityViewIsModal, and focus can be restored to the trigger on close.',
		],
	}),
	DatePickerField: doc({
		name: 'DatePickerField',
		filePath: 'src/design-system/components/molecules/DatePickerField.tsx',
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
		filePath: 'src/design-system/components/molecules/EmptyState.tsx',
		summary: 'Reusable no-data surface with optional icon and recovery action.',
		exampleStories: ['text-only empty state', 'icon-led empty state', 'empty state with CTA'],
		variants: ['default', 'with icon', 'with action'],
		sizes: ['full-screen centered'],
		states: ['default', 'no media', 'actionable'],
		compositionExample: 'Empty records list with add-item call to action.',
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
		filePath: 'src/design-system/components/molecules/FilterBar.tsx',
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
		filePath: 'src/design-system/components/molecules/FormField.tsx',
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
		filePath: 'src/design-system/components/molecules/FormSection.tsx',
		summary: 'Reusable labeled section wrapper for related form groups.',
		exampleStories: ['section with action', 'section with subtitle'],
		variants: ['default', 'uppercase header'],
		sizes: ['default section gap'],
		states: ['default', 'with action'],
		compositionExample: 'Multi-part form split into profile, settlement, and notes sections.',
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
		filePath: 'src/design-system/components/molecules/ListItem.tsx',
		summary:
			'Reusable row primitive for list surfaces with optional media, metadata, and trailing content.',
		exampleStories: ['default list item', 'item with subtitle', 'item with trailing action'],
		variants: ['default', 'subtitle', 'leading icon/avatar', 'trailing content'],
		sizes: ['default row height'],
		states: ['default', 'dense list row', 'no media'],
		compositionExample: 'Entity list row with title, outstanding amount, and status badge.',
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
		filePath: 'src/design-system/components/molecules/PaginatedList.tsx',
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
		compositionExample: 'Records list with query, filters, and retry handling above the rows.',
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
		filePath: 'src/design-system/components/molecules/PhoneInput.tsx',
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
		compositionExample: 'Contact or profile form with mobile number field.',
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
	Popover: doc({
		name: 'Popover',
		filePath: 'src/design-system/components/molecules/Popover.tsx',
		summary:
			'Anchored overlay with controlled or uncontrolled open state, press or long-press trigger modes, optional haptic feedback, focus handoff, and interactive content support.',
		exampleStories: ['quick-edit popover', 'anchored action menu', 'long-press context menu'],
		variants: ['press trigger', 'long-press trigger', 'with title and description'],
		sizes: ['default max-width 320'],
		states: ['closed', 'open', 'focus moved inside'],
		compositionExample:
			'Anchored secondary editing or action surface launched from a nearby card, chip, or toolbar trigger.',
		usage: {
			relaxed:
				'Use when a roomy parent surface still benefits from anchored editing or helper content.',
			operational:
				'Use for fast secondary actions or inline adjustments without forcing a full modal jump.',
			noMedia:
				'Popover clarity comes from hierarchy, spacing, and action sequencing rather than artwork.',
		},
		propTable: [
			prop('open', 'boolean', 'Controlled popover visibility.'),
			prop('defaultOpen', 'boolean', 'Uncontrolled popover visibility.', 'false'),
			prop('onOpenChange', '(open: boolean) => void', 'Canonical visibility callback.'),
			prop(
				'triggerMode',
				"'press' | 'longPress'",
				'Launch gesture used by the trigger wrapper.',
				"'press'",
			),
			prop(
				'hapticFeedback',
				'DesignSystemHaptic',
				'Optional haptic feedback when the popover opens.',
				"'none'",
			),
			prop('maxWidth', 'number', 'Maximum anchored surface width.', '320'),
			COMMON_TEST_ID_PROP,
		],
		doList: [
			'Use popovers for anchored secondary work that should stay visually tied to its trigger.',
			'Move focus inside when the popover opens if it contains interactive controls.',
		],
		dontList: [
			'Do not turn a popover into a full-screen workflow.',
			'Do not bury primary destructive actions in an unlabeled anchored surface.',
		],
		accessibilityNotes: [
			'Moves accessibility focus into the anchored surface when opened.',
			'Outside tap and native back both dismiss the popover.',
		],
		platformNotes: [
			'Anchor position is derived from trigger layout measurements for mobile-safe placement.',
			'Long-press mode can add haptic confirmation for context-menu style affordances.',
		],
	}),
	SearchBar: doc({
		name: 'SearchBar',
		filePath: 'src/design-system/components/molecules/SearchBar.tsx',
		summary:
			'Search field with controlled or uncontrolled value, canonical value callback, clear affordance announcement, debounced query hook, loading state, focus ring, and forwarded ref.',
		exampleStories: [
			'empty search',
			'filled search with clear',
			'loading search',
			'debounced query search',
			'large-text search bar',
		],
		variants: ['default', 'clearable', 'loading', 'debounced'],
		sizes: ['default height'],
		states: ['empty', 'focused', 'filled', 'loading', 'cleared', 'debounced'],
		compositionExample:
			'Component inventory and checklist explorer search surfaces in the design-system workbench.',
		usage: {
			relaxed: 'Use in roomy browse headers or search-first overview surfaces.',
			operational: 'Use in compact toolbars with adjacent chips or filters.',
			noMedia:
				'Search affordance remains clear through label, field shape, and clear action even without extra art.',
		},
		propTable: [
			prop('value', 'string', 'Controlled search query.'),
			prop('defaultValue', 'string', 'Uncontrolled search query.', "''"),
			prop('onValueChange', '(value: string) => void', 'Canonical query callback.'),
			prop(
				'onDebouncedChange',
				'(value: string) => void',
				'Optional debounced query callback.',
			),
			prop('debounceMs', 'number', 'Debounce delay for onDebouncedChange.', '0'),
			prop(
				'loading',
				'boolean',
				'Shows pending-search indicator in place of clear action.',
				'false',
			),
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
			'Loading state is surfaced through native accessibilityState busy hints.',
		],
		platformNotes: [
			'Focus ring is visible in keyboard-accessible environments on both platforms.',
			'Keyboard behavior and auto-correction remain native while visual treatment stays tokenized.',
		],
	}),
	SectionHeader: doc({
		name: 'SectionHeader',
		filePath: 'src/design-system/components/molecules/SectionHeader.tsx',
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
		filePath: 'src/design-system/components/molecules/SettingsCard.tsx',
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
		filePath: 'src/design-system/components/molecules/SkeletonBlock.tsx',
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
		filePath: 'src/design-system/components/molecules/SkeletonRow.tsx',
		summary: 'Row-shaped loading placeholder for lists and tables.',
		exampleStories: ['text row skeleton', 'avatar row skeleton'],
		variants: ['default', 'withAvatar'],
		sizes: ['one line', 'multiple lines'],
		states: ['default', 'reduced motion'],
		compositionExample: 'List placeholder while record data loads.',
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
		filePath: 'src/design-system/components/molecules/StatCard.tsx',
		summary:
			'KPI surface for one dominant metric, quiet comparison context, optional sparkline, and freshness/error states.',
		exampleStories: [
			'value only',
			'value with trend',
			'icon-led metric card',
			'sparkline metric card',
			'loading stat card',
		],
		variants: ['default', 'with trend', 'with icon', 'with sparkline'],
		sizes: ['default stat spacing', 'compact'],
		states: ['default', 'comparison trend', 'long label', 'loading', 'stale', 'error'],
		compositionExample:
			'Overview metric rail with KPI, quiet comparison baseline, sparkline, and last-updated metadata.',
		usage: {
			relaxed: 'Use to showcase one dominant metric with optional supporting trend.',
			operational: 'Use compact stat cards in overview rails where scan speed matters.',
			noMedia: 'The icon is optional; metric hierarchy remains strong without it.',
		},
		propTable: [
			prop('label', 'string', 'Supporting metric label.'),
			prop('value', 'string | number', 'Primary metric value.'),
			prop('trend', 'string', 'Optional trend string, e.g. +12%.'),
			prop('icon', 'LucideIcon', 'Optional icon slot.'),
			prop('sparklineValues', 'number[]', 'Optional compact sparkline data.'),
			prop(
				'comparisonBaseline',
				'string',
				'Quiet comparison context shown beneath the metric.',
			),
			prop('updatedAtLabel', 'string', 'Stale-data or freshness metadata.'),
			prop('isLoading', 'boolean', 'Switches to skeleton loading state.', 'false'),
			prop('errorMessage', 'string', 'Inline error or delayed-feed note.'),
			prop('density', "'compact' | 'default'", 'Operational spacing control.', 'default'),
			COMMON_A11Y_PROP,
			COMMON_STYLE_PROP,
			COMMON_TEST_ID_PROP,
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
		filePath: 'src/design-system/components/molecules/SwipeableRow.tsx',
		summary:
			'Action row that reveals archive, edit, share, and delete affordances while still exposing accessible fallback actions.',
		exampleStories: [
			'delete-only row',
			'archive and delete row',
			'edit archive delete row',
			'share edit archive delete row',
		],
		variants: [
			'delete only',
			'delete + archive',
			'delete + archive + edit',
			'full action rail',
		],
		sizes: ['fixed action width'],
		states: ['default', 'revealed actions', 'action triggered'],
		compositionExample: 'Queue row with inline destructive and supportive follow-up actions.',
		usage: {
			relaxed: 'Use where row actions need more breathing room or explanation.',
			operational:
				'Use in dense operational lists where quick edit/share/delete access matters.',
			noMedia: 'Action comprehension is preserved by labels and semantics rather than icons.',
		},
		propTable: [
			prop('onDelete', '() => void', 'Required destructive action handler.'),
			prop('onArchive', '() => void', 'Optional archive action handler.'),
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
		filePath: 'src/design-system/components/molecules/TableRow.tsx',
		summary: 'Reusable data row surface for compact key-value or columnar table-like content.',
		exampleStories: ['two-column row', 'row with right-aligned metric'],
		variants: ['default'],
		sizes: ['dense operational row'],
		states: ['default', 'long label', 'numeric emphasis'],
		compositionExample: 'Summary table row with label, amount, and quiet metadata.',
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
		filePath: 'src/design-system/components/molecules/TextAreaField.tsx',
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
		filePath: 'src/design-system/components/molecules/Toast.tsx',
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
	Tooltip: doc({
		name: 'Tooltip',
		filePath: 'src/design-system/components/molecules/Tooltip.tsx',
		summary:
			'Non-interactive anchored helper overlay with controlled or uncontrolled open state, max-width enforcement, and touch-friendly press or long-press trigger modes.',
		exampleStories: ['long-press helper tooltip', 'press-trigger tooltip'],
		variants: ['top', 'bottom', 'long press', 'press'],
		sizes: ['default max-width 240'],
		states: ['closed', 'open', 'focused trigger'],
		compositionExample:
			'Short supporting copy attached to a nearby badge, icon, or quiet helper affordance.',
		usage: {
			relaxed:
				'Use for brief supporting notes where the parent surface has enough breathing room.',
			operational:
				'Keep tooltip copy terse and factual so it stays useful in dense operational UI.',
			noMedia:
				'Tooltip meaning is carried entirely by text; the component intentionally avoids interactive content.',
		},
		propTable: [
			prop('open', 'boolean', 'Controlled tooltip visibility.'),
			prop('defaultOpen', 'boolean', 'Uncontrolled tooltip visibility.', 'false'),
			prop('onOpenChange', '(open: boolean) => void', 'Canonical visibility callback.'),
			prop(
				'triggerMode',
				"'press' | 'longPress'",
				'Trigger gesture used to reveal the tooltip.',
				"'longPress'",
			),
			prop(
				'placement',
				"'top' | 'bottom'",
				'Tooltip placement relative to the trigger.',
				"'top'",
			),
			prop('maxWidth', 'number', 'Maximum tooltip width.', '240'),
			COMMON_TEST_ID_PROP,
		],
		doList: [
			'Keep tooltip copy short, precise, and supportive.',
			'Prefer long-press on touch surfaces instead of hover-only disclosure.',
		],
		dontList: [
			'Do not place interactive controls inside a tooltip.',
			'Do not use a tooltip for critical primary-task instructions.',
		],
		accessibilityNotes: [
			'Tooltip content is announced when opened.',
			'Focus-visible trigger styling supports keyboard-accessible environments.',
		],
		platformNotes: [
			'Anchors to trigger measurements for stable mobile positioning.',
			'Long-press mode gives touch devices a hover-free tooltip pattern.',
		],
	}),
	ActionMenuSheet: doc({
		name: 'ActionMenuSheet',
		filePath: 'src/design-system/components/molecules/ActionMenuSheet.tsx',
		summary:
			'Bottom-sheet secondary action menu for mobile-safe destructive and supporting actions.',
		exampleStories: ['secondary action sheet', 'destructive menu item'],
		variants: ['default', 'destructive action'],
		sizes: ['default bottom sheet'],
		states: ['closed', 'open', 'disabled action'],
		compositionExample: 'Overflow action menu from a row toolbar or split button.',
		usage: {
			relaxed:
				'Use when secondary actions should stay tucked away from spacious hero CTA layouts.',
			operational: 'Prefer for dense workflows where extra buttons would crowd the surface.',
			noMedia: 'Action clarity depends on labels and hierarchy, not artwork.',
		},
		propTable: [
			prop('title', 'string', 'Sheet heading shown above the action list.'),
			prop('actions', 'ActionMenuSheetItem[]', 'Available secondary actions.'),
			prop('open', 'boolean', 'Controlled open state.'),
			prop('defaultOpen', 'boolean', 'Uncontrolled open state.', 'false'),
			prop('onOpenChange', '(open: boolean) => void', 'Canonical open-state callback.'),
			COMMON_TEST_ID_PROP,
		],
		doList: ['Group secondary actions here instead of adding more high-emphasis buttons.'],
		dontList: ['Do not hide primary save/confirm actions inside the sheet.'],
		accessibilityNotes: [
			'Menu actions remain exposed as standard buttons with stable labels.',
			'Open state can be controlled for automation and assistive flow.',
		],
		platformNotes: [
			'Presentation matches mobile bottom-sheet expectations on iOS and Android.',
			'Destructive action styling stays semantic across themes.',
		],
	}),
	AlertBanner: doc({
		name: 'AlertBanner',
		filePath: 'src/design-system/components/molecules/AlertBanner.tsx',
		summary:
			'Inline or page-level banner for calm, actionable info, success, warning, or error communication.',
		exampleStories: ['inline warning banner', 'page-level error banner'],
		variants: ['info', 'success', 'warning', 'error'],
		sizes: ['inline', 'page-level'],
		states: ['persistent', 'dismissible', 'action CTA'],
		compositionExample:
			'Import review surface with a warning banner and inline remediation action.',
		usage: {
			relaxed: 'Use for ambient guidance in setup and settings flows.',
			operational: 'Use terse titles and immediate next-step CTAs in data-heavy workflows.',
			noMedia: 'Banner communication remains text-led and self-contained.',
		},
		propTable: [
			prop('title', 'string', 'Banner heading.'),
			prop('description', 'string', 'Optional supporting copy.'),
			prop('variant', 'AlertBannerVariant', 'Semantic banner tone.', 'info'),
			prop('actionLabel', 'string', 'Optional CTA label.'),
			prop('dismissible', 'boolean', 'Shows a dismiss affordance when true.', 'false'),
			COMMON_TEST_ID_PROP,
			COMMON_STYLE_PROP,
		],
		doList: ['Keep warning and error banners calm, direct, and actionable.'],
		dontList: ['Do not use banners as permanent decorative color blocks.'],
		accessibilityNotes: [
			'Error banners expose alert semantics while other tones remain readable inline content.',
			'Action and dismiss affordances are standard buttons.',
		],
		platformNotes: [
			'Banner chrome stays restrained across light, dark, and high-contrast themes.',
			'Layout remains stable in dense mobile content regions.',
		],
	}),
	AutocompleteField: doc({
		name: 'AutocompleteField',
		filePath: 'src/design-system/components/molecules/AutocompleteField.tsx',
		summary:
			'Typeahead combobox with synchronous or async options, inline create, and optional multi-select token display.',
		exampleStories: ['local typeahead', 'async search', 'multi-select owner picker'],
		variants: ['single select', 'multi-select', 'create new'],
		sizes: ['default field + option list'],
		states: ['idle', 'matching results', 'no matches', 'create inline'],
		compositionExample:
			'Owner or label picker with fast keyboard filtering inside a dense form.',
		usage: {
			relaxed:
				'Use when exploratory search benefits from helper copy and visible result grouping.',
			operational: 'Prefer concise labels and quick keyboard filtering in workflow forms.',
			noMedia: 'Option discovery relies on text matching and hierarchy, not iconography.',
		},
		propTable: [
			prop('options', 'AutocompleteOption[]', 'Static option source.'),
			prop(
				'onAsyncSearch',
				'(query: string) => Promise<AutocompleteOption[]>',
				'Optional async result loader.',
			),
			prop('multiple', 'boolean', 'Allows selecting more than one option.', 'false'),
			prop('allowCreate', 'boolean', 'Shows inline create action for new values.', 'false'),
			prop('value', 'string | string[]', 'Controlled selected value or values.'),
			prop('defaultValue', 'string | string[]', 'Uncontrolled selected value or values.'),
			prop('onValueChange', '(value) => void', 'Canonical selection callback.'),
			COMMON_TEST_ID_PROP,
			COMMON_STYLE_PROP,
		],
		doList: ['Use async search for large or remote option sets.'],
		dontList: [
			'Do not force users to scroll giant static lists when typeahead would be faster.',
		],
		accessibilityNotes: [
			'The field keeps a standard text-input label while results remain button-like options.',
			'Multi-select mode still exposes selected values as readable text tokens.',
		],
		platformNotes: [
			'Debounce behavior is shared across iOS and Android.',
			'Inline create stays in the same result lane rather than opening a separate modal.',
		],
	}),
	ColorPicker: doc({
		name: 'ColorPicker',
		filePath: 'src/design-system/components/molecules/ColorPicker.tsx',
		summary:
			'Controlled color surface supporting hex, RGB, HSL, and swatch-driven edits from one reusable control.',
		exampleStories: ['hex edit', 'rgb channels', 'hsl channels'],
		variants: ['hex', 'rgb', 'hsl', 'swatch preset'],
		sizes: ['default control'],
		states: ['editing channels', 'swatch selected'],
		compositionExample: 'Theme accent customizer or label-color assignment control.',
		usage: {
			relaxed: 'Use where users are intentionally customizing a visual system choice.',
			operational:
				'Prefer swatches first in dense workflows; expose channel editing as secondary detail.',
			noMedia: 'Selected color is always paired with readable textual values.',
		},
		propTable: [
			prop('value', 'string', 'Controlled hex value.'),
			prop(
				'defaultValue',
				'string',
				'Uncontrolled hex value.',
				'primitiveColorPalettes.primary[600]',
			),
			prop('onValueChange', '(value: string) => void', 'Canonical color callback.'),
			COMMON_TEST_ID_PROP,
			COMMON_STYLE_PROP,
		],
		doList: ['Pair swatches with textual color values for precise edits.'],
		dontList: ['Do not rely on swatches alone for precise enterprise configuration.'],
		accessibilityNotes: [
			'Mode switching is text-labeled and swatches expose stable button labels.',
			'Hex/RGB/HSL fields remain editable without gesture-only interaction.',
		],
		platformNotes: [
			'Color math is shared across platforms for predictable values.',
			'Swatch sizing respects the same token scale on iOS and Android.',
		],
	}),
	DateRangePickerField: doc({
		name: 'DateRangePickerField',
		filePath: 'src/design-system/components/molecules/DateRangePickerField.tsx',
		summary:
			'Two-ended date range control with preset shortcuts and min/max guardrails between start and end.',
		exampleStories: ['last 7 days preset', 'this month preset', 'custom range'],
		variants: ['preset-driven', 'custom range'],
		sizes: ['two-field stack'],
		states: ['preset active', 'custom start/end'],
		compositionExample: 'Reporting filter bar with quick presets and manual date overrides.',
		usage: {
			relaxed: 'Use when a reporting surface can afford visible presets above the fields.',
			operational: 'Keep presets concise and stack start/end pickers for scannability.',
			noMedia: 'Range selection is expressed fully through labels and date values.',
		},
		propTable: [
			prop('value', 'DateRangeValue', 'Controlled date range.'),
			prop('defaultValue', 'Partial<DateRangeValue>', 'Uncontrolled initial range.'),
			prop('presets', 'DateRangePreset[]', 'Shortcut range presets.'),
			prop('onValueChange', '(value: DateRangeValue) => void', 'Canonical range callback.'),
			COMMON_TEST_ID_PROP,
			COMMON_STYLE_PROP,
		],
		doList: ['Offer preset ranges for common reporting windows.'],
		dontList: ['Do not let the end date silently precede the start date.'],
		accessibilityNotes: [
			'Each boundary keeps its own labeled date picker for assistive clarity.',
			'Preset shortcuts remain standard pressable controls.',
		],
		platformNotes: [
			'Works with the shared date picker contract on both platforms.',
			'Preset chips keep the same spacing rhythm as filter bars and chip groups.',
		],
	}),
	ErrorState: doc({
		name: 'ErrorState',
		filePath: 'src/design-system/components/molecules/ErrorState.tsx',
		summary:
			'Reusable calm-error surface for server, not-found, and offline failures with optional recovery CTA.',
		exampleStories: ['server error', 'not found', 'offline retry'],
		variants: ['server', 'not-found', 'offline'],
		sizes: ['card-like recovery block'],
		states: ['default', 'with retry action'],
		compositionExample: 'Failed data module with a retry CTA inside a dashboard panel.',
		usage: {
			relaxed: 'Use where an error surface should still feel composed and premium.',
			operational: 'Keep copy concise and offer the most direct recovery action.',
			noMedia: 'The state remains understandable with icon, title, and copy only.',
		},
		propTable: [
			prop('variant', 'ErrorStateVariant', 'Preset error type.', 'server'),
			prop('title', 'string', 'Optional custom title override.'),
			prop('description', 'string', 'Optional custom supporting copy.'),
			prop('actionLabel', 'string', 'Optional recovery CTA label.', 'Retry'),
			COMMON_TEST_ID_PROP,
			COMMON_STYLE_PROP,
		],
		doList: ['Use specific variants so support copy stays consistent across the app.'],
		dontList: ['Do not dump raw server payloads into the visible state.'],
		accessibilityNotes: [
			'Recovery actions remain standard buttons with readable labels.',
			'The state stays readable even when iconography is ignored by assistive tech.',
		],
		platformNotes: [
			'Icon sizing and spacing remain tokenized across iOS and Android.',
			'Variant tone stays consistent through shared semantic colors.',
		],
	}),
	FileUploadField: doc({
		name: 'FileUploadField',
		filePath: 'src/design-system/components/molecules/FileUploadField.tsx',
		summary:
			'Document and image upload field with picker integration, per-file progress, cancellation, and validation states.',
		exampleStories: ['single document upload', 'multi-image upload', 'failed upload row'],
		variants: ['document picker', 'image picker', 'multi-file'],
		sizes: ['default upload stack'],
		states: [
			'uploading',
			'uploaded',
			'cancelled',
			'invalid format',
			'size exceeded',
			'upload failed',
		],
		compositionExample: 'Attachment section on an expense, import, or approval workflow.',
		usage: {
			relaxed: 'Use where uploads benefit from visible status rows and clear source actions.',
			operational: 'Keep rows compact and preserve per-file status at a glance.',
			noMedia:
				'File handling remains fully understandable through text rows and progress bars.',
		},
		propTable: [
			prop('multiple', 'boolean', 'Allows selecting multiple assets.', 'true'),
			prop('maxFileSizeBytes', 'number', 'Validation limit for file size.', '5242880'),
			prop('allowedMimeTypes', 'string[]', 'Optional format allowlist.'),
			prop('value', 'UploadItem[]', 'Controlled file list.'),
			prop('defaultValue', 'UploadItem[]', 'Uncontrolled file list.'),
			prop(
				'onValueChange',
				'(files: UploadItem[]) => void',
				'Canonical upload-list callback.',
			),
			COMMON_TEST_ID_PROP,
			COMMON_STYLE_PROP,
		],
		doList: [
			'Show per-file progress and failure states instead of a single ambiguous spinner.',
		],
		dontList: ['Do not hide validation failures behind generic error copy.'],
		accessibilityNotes: [
			'Upload buttons remain explicit document/image actions.',
			'Each file row exposes readable progress and cancel affordances.',
		],
		platformNotes: [
			'Integrates with Expo document and image pickers on mobile.',
			'Per-file states stay consistent across native platforms.',
		],
	}),
	NotificationCenter: doc({
		name: 'NotificationCenter',
		filePath: 'src/design-system/components/molecules/NotificationCenter.tsx',
		summary:
			'Grouped inbox surface for read/unread notification review with mark-all-as-read support.',
		exampleStories: ['system section', 'mentions section', 'empty inbox'],
		variants: ['grouped inbox', 'empty state'],
		sizes: ['default list stack'],
		states: ['unread', 'read', 'mark all as read', 'empty'],
		compositionExample: 'Shared updates inbox for task, approval, and system events.',
		usage: {
			relaxed: 'Use where a messaging surface can breathe with grouped categories.',
			operational: 'Keep category labels short and unread markers restrained.',
			noMedia: 'Read status uses text and subtle badges without relying on artwork.',
		},
		propTable: [
			prop('items', 'NotificationItem[]', 'Controlled inbox items.'),
			prop('defaultItems', 'NotificationItem[]', 'Uncontrolled inbox items.'),
			prop(
				'onValueChange',
				'(items: NotificationItem[]) => void',
				'Canonical item-state callback.',
			),
			COMMON_TEST_ID_PROP,
			COMMON_STYLE_PROP,
		],
		doList: ['Group notifications by category so scan paths stay predictable.'],
		dontList: ['Do not let unread markers overpower titles or route meaning.'],
		accessibilityNotes: [
			'Unread state is paired with text labels and accessible badges.',
			'Mark-all action remains a standard button, not a hidden gesture.',
		],
		platformNotes: [
			'Grouping is section-list driven and platform-neutral.',
			'Empty state falls back to the shared EmptyState component.',
		],
	}),
	NumericStepper: doc({
		name: 'NumericStepper',
		filePath: 'src/design-system/components/molecules/NumericStepper.tsx',
		summary:
			'Increment/decrement control for bounded numeric values with locale-aware formatted display.',
		exampleStories: ['whole number stepper', 'decimal-friendly locale stepper'],
		variants: ['default'],
		sizes: ['touch-safe control'],
		states: ['min bound', 'max bound', 'increment', 'decrement'],
		compositionExample: 'Quantity, retry count, or reminder interval selector.',
		usage: {
			relaxed:
				'Use where value changes are small and users benefit from obvious increment controls.',
			operational:
				'Prefer in dense forms where free-form numeric input would slow users down.',
			noMedia: 'Meaning is carried by the label and formatted value only.',
		},
		propTable: [
			prop('min', 'number', 'Minimum allowed value.', '0'),
			prop('max', 'number', 'Maximum allowed value.', '999'),
			prop('step', 'number', 'Increment/decrement amount.', '1'),
			prop('locale', 'string', 'Locale used for number formatting.', 'en-US'),
			prop('value', 'number', 'Controlled numeric value.'),
			prop('defaultValue', 'number', 'Uncontrolled numeric value.', '0'),
			prop('onValueChange', '(value: number) => void', 'Canonical value callback.'),
			COMMON_TEST_ID_PROP,
			COMMON_STYLE_PROP,
		],
		doList: ['Use explicit bounds so users understand the valid range.'],
		dontList: ['Do not use a free-form field when only a few step values are valid.'],
		accessibilityNotes: [
			'Separate increment and decrement controls stay readable for assistive tech.',
			'Formatted value remains visible between the two actions.',
		],
		platformNotes: [
			'Locale formatting works the same way on both native platforms.',
			'Touch targets stay above the mobile minimum.',
		],
	}),
	OtpCodeInput: doc({
		name: 'OtpCodeInput',
		filePath: 'src/design-system/components/molecules/OtpCodeInput.tsx',
		summary:
			'Cell-based one-time code input with auto-advance, paste splitting, masking, and mobile autofill hints.',
		exampleStories: ['6-digit code', 'masked code'],
		variants: ['default', 'masked'],
		sizes: ['4 digit', '6 digit'],
		states: ['empty', 'partially filled', 'fully pasted'],
		compositionExample: 'Login verification or step-up approval challenge.',
		usage: {
			relaxed: 'Use where verification is a dedicated step and spacing can stay generous.',
			operational: 'Keep cells compact and predictable in auth or approval flows.',
			noMedia: 'Cell structure and labels fully communicate the task without illustration.',
		},
		propTable: [
			prop('length', 'number', 'Number of code cells to render.', '6'),
			prop('masked', 'boolean', 'Displays filled cells as bullets.', 'false'),
			prop('value', 'string', 'Controlled code value.'),
			prop('defaultValue', 'string', 'Uncontrolled code value.', "''"),
			prop('onValueChange', '(value: string) => void', 'Canonical code callback.'),
			COMMON_TEST_ID_PROP,
			COMMON_STYLE_PROP,
		],
		doList: ['Use with platform SMS/autofill hints on the first cell.'],
		dontList: ['Do not force users to type a code into one long unlabeled field.'],
		accessibilityNotes: [
			'Each cell exposes a stable per-digit accessibility label.',
			'Paste splitting still keeps a plain text-input fallback path.',
		],
		platformNotes: [
			'Uses native one-time-code autofill hints on iOS and Android.',
			'Backspace and focus behavior stay consistent across both platforms.',
		],
	}),
	ProgressIndicator: doc({
		name: 'ProgressIndicator',
		filePath: 'src/design-system/components/molecules/ProgressIndicator.tsx',
		summary:
			'Determinate or indeterminate progress primitive supporting both linear and circular presentation.',
		exampleStories: ['linear determinate', 'linear indeterminate', 'circular determinate'],
		variants: ['linear', 'circular'],
		sizes: ['default'],
		states: ['determinate', 'indeterminate'],
		compositionExample: 'Upload progress, background sync, or wizard completion signal.',
		usage: {
			relaxed: 'Use circular progress for spacious, singular loading moments.',
			operational: 'Use linear progress for dense lists or stacked upload rows.',
			noMedia: 'The label and numeric percentage remain enough for comprehension.',
		},
		propTable: [
			prop('variant', "'linear' | 'circular'", 'Visual progress treatment.'),
			prop('value', 'number', 'Determinate value from 0-100.', '0'),
			prop(
				'indeterminate',
				'boolean',
				'Renders busy feedback instead of a numeric fill.',
				'false',
			),
			prop('label', 'string', 'Optional supporting label.'),
			COMMON_TEST_ID_PROP,
			COMMON_STYLE_PROP,
		],
		doList: ['Pair progress bars with concise labels when the task is not self-evident.'],
		dontList: ['Do not fake determinate percentages when no real value exists.'],
		accessibilityNotes: [
			'Indeterminate mode falls back to a native activity indicator for assistive clarity.',
			'Determinate values remain readable as text when using the circular treatment.',
		],
		platformNotes: [
			'Linear and circular styles use shared token spacing across platforms.',
			'Indeterminate mode leans on native spinner affordances.',
		],
	}),
	RangeSlider: doc({
		name: 'RangeSlider',
		filePath: 'src/design-system/components/molecules/RangeSlider.tsx',
		summary:
			'Gesture-driven slider supporting single or dual handles, step snapping, and drag-value tooltips.',
		exampleStories: ['single threshold slider', 'dual range slider'],
		variants: ['single handle', 'dual handle'],
		sizes: ['default track'],
		states: ['idle', 'dragging tooltip', 'step snapped'],
		compositionExample: 'Price, threshold, or budget range filter control.',
		usage: {
			relaxed: 'Use where a value range benefits from tactile exploration.',
			operational: 'Keep slider width constrained and pair it with visible numeric values.',
			noMedia: 'Tooltip and label carry the meaning without any decorative flourish.',
		},
		propTable: [
			prop('range', 'boolean', 'Enables dual-handle range selection.', 'false'),
			prop('min', 'number', 'Minimum slider value.', '0'),
			prop('max', 'number', 'Maximum slider value.', '100'),
			prop('step', 'number', 'Step snapping increment.', '5'),
			prop('value', 'number | [number, number]', 'Controlled slider value or range.'),
			prop('defaultValue', 'number | [number, number]', 'Uncontrolled value or range.', '25'),
			prop('showTooltip', 'boolean', 'Shows the active handle value while dragging.', 'true'),
			COMMON_TEST_ID_PROP,
			COMMON_STYLE_PROP,
		],
		doList: ['Snap values to a meaningful step so the control stays precise.'],
		dontList: ['Do not use a slider when users need exact free-form numeric entry.'],
		accessibilityNotes: [
			'Handles use adjustable semantics rather than relying on gesture-only discovery.',
			'Tooltip values remain visible as text while dragging.',
		],
		platformNotes: [
			'Uses react-native-gesture-handler for native-feeling drag behavior.',
			'Single and dual-handle modes share the same tokenized track treatment.',
		],
	}),
	SegmentedControl: doc({
		name: 'SegmentedControl',
		filePath: 'src/design-system/components/molecules/SegmentedControl.tsx',
		summary:
			'Single-select segmented choice control for compact mutually exclusive view or mode switching.',
		exampleStories: ['list vs board mode', 'compact metric toggle'],
		variants: ['single select'],
		sizes: ['default'],
		states: ['selected', 'unselected'],
		compositionExample: 'Mode switcher in a header or report toolbar.',
		usage: {
			relaxed: 'Use for calm view switching without adding heavy navigation chrome.',
			operational: 'Prefer for compact mode toggles in dense toolbars.',
			noMedia: 'Each segment remains readable text-first content.',
		},
		propTable: [
			prop('options', 'ToggleButtonOption[]', 'Segment choices.'),
			prop('value', 'string', 'Controlled selected segment.'),
			prop('defaultValue', 'string', 'Uncontrolled selected segment.'),
			prop('onValueChange', '(value: string) => void', 'Canonical segment callback.'),
			COMMON_TEST_ID_PROP,
			COMMON_STYLE_PROP,
		],
		doList: ['Use when choices are few and mutually exclusive.'],
		dontList: ['Do not overload with many long segment labels.'],
		accessibilityNotes: [
			'Selection state is exposed through the underlying toggle group semantics.',
			'Segments remain keyboard and assistive-tech reachable.',
		],
		platformNotes: [
			'Leverages the same native-safe button treatment as the toggle group.',
			'Spacing and selected-state contrast stay consistent across themes.',
		],
	}),
	SplitButton: doc({
		name: 'SplitButton',
		filePath: 'src/design-system/components/molecules/SplitButton.tsx',
		summary:
			'Primary action button paired with a secondary-action disclosure for overflow choices.',
		exampleStories: ['save + draft actions', 'publish + schedule actions'],
		variants: ['primary + menu'],
		sizes: ['default'],
		states: ['idle', 'secondary menu open'],
		compositionExample:
			'Create or edit footer where one action is primary and others are nearby but secondary.',
		usage: {
			relaxed: 'Use when a premium CTA still needs a small set of adjacent alternatives.',
			operational: 'Keep the primary label decisive and the secondary menu focused.',
			noMedia: 'Action hierarchy comes from button treatment and labels only.',
		},
		propTable: [
			prop('label', 'string', 'Primary action label.'),
			prop('secondaryActions', 'ActionMenuSheetItem[]', 'Overflow action list.'),
			prop('onSecondaryAction', '(value: string) => void', 'Secondary action callback.'),
			COMMON_TEST_ID_PROP,
			COMMON_STYLE_PROP,
		],
		doList: ['Use when one action is primary and the rest are genuinely secondary.'],
		dontList: ['Do not hide critical destructive confirmation paths behind the split toggle.'],
		accessibilityNotes: [
			'Primary and secondary triggers remain separate labeled buttons.',
			'Secondary actions inherit the accessible action-sheet menu contract.',
		],
		platformNotes: [
			'The main button uses the shared action hierarchy tokens.',
			'Secondary actions open the same mobile-safe sheet on both platforms.',
		],
	}),
	Stepper: doc({
		name: 'Stepper',
		filePath: 'src/design-system/components/molecules/Stepper.tsx',
		summary:
			'Reusable step navigation surface supporting horizontal or vertical layouts and explicit step states.',
		exampleStories: ['horizontal onboarding steps', 'vertical approval wizard'],
		variants: ['horizontal', 'vertical'],
		sizes: ['compact row', 'stacked flow'],
		states: ['completed', 'active', 'upcoming', 'error'],
		compositionExample: 'Wizard header or side-rail progress summary.',
		usage: {
			relaxed: 'Use where users benefit from visible progress and roomy copy.',
			operational: 'Keep labels terse and rely on state markers for quick scanning.',
			noMedia: 'Progress remains obvious through numbers, labels, and states alone.',
		},
		propTable: [
			prop('steps', 'StepperStep[]', 'Ordered step descriptors and states.'),
			prop('orientation', "'horizontal' | 'vertical'", 'Layout direction.', 'horizontal'),
			prop(
				'onStepPress',
				'(value: string) => void',
				'Optional non-linear navigation callback.',
			),
			COMMON_TEST_ID_PROP,
			COMMON_STYLE_PROP,
		],
		doList: ['Mark completed and errored steps explicitly.'],
		dontList: ['Do not allow jumping to incomplete steps without clear rules.'],
		accessibilityNotes: [
			'Completed steps can be exposed as buttons for non-linear return paths.',
			'Step labels remain readable even when badges are ignored by assistive tech.',
		],
		platformNotes: [
			'Orientation changes remain purely layout-driven and platform-neutral.',
			'Step badges use the shared semantic badge palette.',
		],
	}),
	Tabs: doc({
		name: 'Tabs',
		filePath: 'src/design-system/components/molecules/Tabs.tsx',
		summary: 'Quiet tab navigation surface with optional icons and restrained badge counts.',
		exampleStories: ['text tabs', 'icon tabs', 'tabs with badge counts'],
		variants: ['text only', 'with icon', 'with badge'],
		sizes: ['horizontal tab strip'],
		states: ['selected', 'unselected'],
		compositionExample: 'Top-level sub-navigation inside a feature module or detail screen.',
		usage: {
			relaxed:
				'Use when tabbed sections should feel light and premium rather than shell-heavy.',
			operational: 'Keep active indication clear but restrained for dense shells.',
			noMedia: 'Route clarity comes from labels and selected state, not decoration.',
		},
		propTable: [
			prop('options', 'TabOption[]', 'Available tabs with optional icons and counts.'),
			prop('value', 'string', 'Controlled selected tab.'),
			prop('defaultValue', 'string', 'Uncontrolled selected tab.'),
			prop('onValueChange', '(value: string) => void', 'Canonical tab change callback.'),
			COMMON_TEST_ID_PROP,
			COMMON_STYLE_PROP,
		],
		doList: ['Keep badges secondary to the route label and active state.'],
		dontList: ['Do not saturate the entire tab chrome to show selection.'],
		accessibilityNotes: [
			'Tabs expose explicit selected state to assistive technologies.',
			'Badge counts remain supplemental and not the only indicator of importance.',
		],
		platformNotes: [
			'Scrollable horizontal tabs behave consistently across platforms.',
			'Optional icons align to the same token rhythm as the rest of the DS.',
		],
	}),
	TimePickerField: doc({
		name: 'TimePickerField',
		filePath: 'src/design-system/components/molecules/TimePickerField.tsx',
		summary:
			'Native-backed time picker field with formatted display and minute-interval support.',
		exampleStories: ['meeting time', '15-minute interval picker'],
		variants: ['default'],
		sizes: ['default field'],
		states: ['idle', 'native picker open'],
		compositionExample: 'Meeting scheduler or reminder time configuration.',
		usage: {
			relaxed: 'Use when time choice is part of a spacious scheduling surface.',
			operational: 'Keep it compact and paired with adjacent date controls in dense forms.',
			noMedia: 'Selected time remains fully readable as text.',
		},
		propTable: [
			prop('value', 'string', 'Controlled time value in HH:mm format.'),
			prop('defaultValue', 'string', 'Uncontrolled time value.', '09:00'),
			prop('minuteInterval', '1 | 5 | 10 | 15 | 30', 'Native picker minute increment.', '5'),
			prop('locale', 'string', 'Locale used for time formatting.', 'en-US'),
			prop('onValueChange', '(value: string) => void', 'Canonical time callback.'),
			COMMON_TEST_ID_PROP,
			COMMON_STYLE_PROP,
		],
		doList: ['Use minute intervals that match the business workflow.'],
		dontList: ['Do not ask users to type times manually when a picker will be faster.'],
		accessibilityNotes: [
			'The field remains a labeled button that opens a native time control.',
			'Selected time stays available as plain text.',
		],
		platformNotes: [
			'Backs onto the native platform time picker on iOS and Android.',
			'Formatting respects locale while maintaining shared DS field styling.',
		],
	}),
	Avatar: doc({
		name: 'Avatar',
		filePath: 'src/design-system/components/atoms/Avatar.tsx',
		summary:
			'Identity primitive with remote image support, initials fallback, size variants, and status indicator.',
		exampleStories: ['image avatar', 'initials fallback avatar', 'avatar with presence status'],
		variants: ['image', 'fallback initials', 'status indicator'],
		sizes: ['sm', 'md', 'lg', 'xl'],
		states: ['image loaded', 'image failed fallback', 'online', 'busy', 'offline'],
		compositionExample:
			'List row or board card assignee chip with resilient fallback handling.',
		usage: {
			relaxed: 'Use larger sizes on showcase cards and overview panels.',
			operational: 'Prefer md or sm avatars in dense lists and comparison surfaces.',
			noMedia:
				'Initials fallback and deterministic background color preserve identity when media is missing.',
		},
		propTable: [
			prop('name', 'string', 'Identity label used for initials and accessible name.'),
			prop('source', 'string', 'Optional remote image URL.'),
			prop('size', 'AvatarSize', 'Tokenized avatar scale.', 'md'),
			prop('status', 'AvatarStatus', 'Optional presence or status dot.'),
			COMMON_A11Y_PROP,
			COMMON_STYLE_PROP,
			COMMON_TEST_ID_PROP,
		],
		doList: ['Rely on name initials when image quality is poor or absent.'],
		dontList: ['Do not treat imagery as required for identity recognition.'],
		accessibilityNotes: [
			'Accessible label defaults to the person or entity name.',
			'Status indicator is purely visual and should be paired with nearby text when critical.',
		],
		platformNotes: [
			'Remote image rendering uses the same DS media path on iOS and Android.',
			'Presence dot sizing scales with the avatar token size.',
		],
	}),
	ActivityFeed: doc({
		name: 'ActivityFeed',
		filePath: 'src/design-system/components/molecules/ActivityFeed.tsx',
		summary:
			'Timeline surface with date separators, load-more handling, and queued real-time injection.',
		exampleStories: ['dated activity feed', 'feed with pending updates', 'load older events'],
		variants: ['default', 'pending updates banner'],
		sizes: ['default'],
		states: ['default', 'new items waiting', 'older events load more'],
		compositionExample:
			'Operational approval timeline showing who changed what and when across multiple dates.',
		usage: {
			relaxed: 'Use more descriptive event copy in activity summaries and audit views.',
			operational:
				'Keep event titles sharp and date separators compact in review queues and logs.',
			noMedia: 'Meaning is fully preserved through text hierarchy and status labels.',
		},
		propTable: [
			prop('items', 'ActivityFeedItem[]', 'Controlled timeline items.'),
			prop('defaultItems', 'ActivityFeedItem[]', 'Uncontrolled timeline items.', '[]'),
			prop(
				'pendingItems',
				'ActivityFeedItem[]',
				'Queued real-time items awaiting injection.',
				'[]',
			),
			prop(
				'onItemsChange',
				'(items: ActivityFeedItem[]) => void',
				'Canonical feed callback.',
			),
			prop(
				'onLoadMore',
				'() => void',
				'Load older events when the footer or end threshold is reached.',
			),
			COMMON_STYLE_PROP,
			COMMON_TEST_ID_PROP,
		],
		doList: ['Group events by date and keep real-time additions explicit.'],
		dontList: ['Do not silently prepend new events while someone is reading older activity.'],
		accessibilityNotes: [
			'Queued updates announce themselves when injected.',
			'Date separators preserve context when the feed is linearized by assistive tech.',
		],
		platformNotes: [
			'SectionList semantics stay native on both platforms.',
			'Load-more affordances remain explicit even when infinite scroll is wired in.',
		],
	}),
	AvatarGroup: doc({
		name: 'AvatarGroup',
		filePath: 'src/design-system/components/molecules/AvatarGroup.tsx',
		summary:
			'Overlapping avatar stack with +N overflow and tap-to-expand behavior for hidden members.',
		exampleStories: ['three visible avatars', 'overflow group', 'expanded group'],
		variants: ['compact overlap', 'expanded all members'],
		sizes: ['sm', 'md', 'lg', 'xl'],
		states: ['default', 'overflow', 'expanded'],
		compositionExample: 'Assignee cluster or approval audience summary on a card or board.',
		usage: {
			relaxed: 'Use larger sizes and more breathing room on overview cards.',
			operational: 'Use md or sm avatars with restrained overlap in dense rows.',
			noMedia: 'Initials fallback ensures hidden or failed images still remain identifiable.',
		},
		propTable: [
			prop('items', 'AvatarGroupItem[]', 'Visible avatar members.'),
			prop(
				'maxVisible',
				'number',
				'How many avatars remain visible before +N overflow.',
				'3',
			),
			prop('size', 'AvatarSize', 'Shared avatar size token.', 'md'),
			prop('expanded', 'boolean', 'Controlled expanded state.'),
			prop('defaultExpanded', 'boolean', 'Uncontrolled expanded state.', 'false'),
			prop('onExpandedChange', '(expanded: boolean) => void', 'Expansion callback.'),
			COMMON_A11Y_PROP,
			COMMON_STYLE_PROP,
			COMMON_TEST_ID_PROP,
		],
		doList: ['Use overflow to keep clusters compact until someone asks for more detail.'],
		dontList: ['Do not force every member to be visible in dense comparison layouts.'],
		accessibilityNotes: [
			'Overflow control exposes a stable label describing how many avatars are hidden.',
			'Expanded state announces itself for screen-reader users.',
		],
		platformNotes: [
			'Overlap spacing is tokenized and scales across native densities.',
			'Tap-to-expand behavior works on touch-first environments without hover affordances.',
		],
	}),
	DataChart: doc({
		name: 'DataChart',
		filePath: 'src/design-system/components/molecules/DataChart.tsx',
		summary:
			'Shared chart renderer covering line, bar, area, pie, donut, scatter, heatmap, and sparkline variants.',
		exampleStories: [
			'line chart',
			'bar comparison',
			'donut chart',
			'scatter plot',
			'heatmap',
			'sparkline',
		],
		variants: ['line', 'bar', 'area', 'pie', 'donut', 'scatter', 'heatmap', 'sparkline'],
		sizes: ['compact metadata', 'default chart frame'],
		states: ['default', 'loading', 'empty', 'error', 'focused series'],
		compositionExample:
			'Executive metric surface with a primary trend line, quiet comparison series, and threshold markers.',
		usage: {
			relaxed: 'Use richer titles and descriptions when the chart needs interpretation help.',
			operational:
				'Keep legend chips concise and rely on focus-series emphasis instead of saturated scaffolding.',
			noMedia:
				'Every chart has text title, description, and fallback states without decorative media.',
		},
		propTable: [
			prop('variant', 'DataChartVariant', 'Chart family to render.'),
			prop('title', 'string', 'Chart heading.'),
			prop('description', 'string', 'Supporting explanation or reading instruction.'),
			prop('series', 'DataChartSeries[]', 'Line, bar, area, or sparkline data.'),
			prop('slices', 'DataChartSlice[]', 'Pie and donut data.'),
			prop('points', 'DataChartPoint[]', 'Scatter plot points.'),
			prop('heatmap', 'DataChartHeatmapCell[]', 'Heatmap matrix values.'),
			prop('annotations', 'DataChartAnnotation[]', 'Threshold or target markers.', '[]'),
			prop('focusedSeriesId', 'string', 'Controlled focused series identifier.'),
			prop('defaultFocusedSeriesId', 'string', 'Uncontrolled focused series identifier.'),
			prop('onFocusedSeriesChange', '(seriesId: string) => void', 'Legend focus callback.'),
			prop('isLoading', 'boolean', 'Switches to skeleton loading state.', 'false'),
			prop('hasError', 'boolean', 'Switches to error state.', 'false'),
			prop('density', "'compact' | 'default'", 'Metadata density.', 'default'),
			COMMON_STYLE_PROP,
			COMMON_TEST_ID_PROP,
		],
		doList: [
			'Use the focused-series pattern to reduce clutter when multiple series compete.',
			'Prefer annotations and explicit thresholds over heavy decoration.',
		],
		dontList: [
			'Do not saturate every line and marker at full emphasis simultaneously.',
			'Do not rely on color alone without a title and description.',
		],
		accessibilityNotes: [
			'Title and description remain outside the SVG so assistive tech can read the chart intent.',
			'Fallback states keep chart surfaces understandable even without any visual marks.',
		],
		platformNotes: [
			'Rendering is SVG-backed for parity on iOS and Android.',
			'Palette and grid styling come from shared DS visual data tokens.',
		],
	}),
	DescriptionList: doc({
		name: 'DescriptionList',
		filePath: 'src/design-system/components/molecules/DescriptionList.tsx',
		summary:
			'Key-value display surface with horizontal or vertical layout, copy actions, and masked-value reveal support.',
		exampleStories: [
			'vertical metadata list',
			'horizontal metadata list',
			'masked sensitive value',
		],
		variants: ['vertical', 'horizontal'],
		sizes: ['default', 'compact'],
		states: ['default', 'copyable', 'sensitive hidden', 'sensitive revealed'],
		compositionExample:
			'Entity detail panel or invoice metadata summary with copyable identifiers.',
		usage: {
			relaxed: 'Use vertical layout when explanations and long values need room.',
			operational: 'Use compact horizontal layout in dense detail summaries or side panels.',
			noMedia:
				'The pattern is fully text-first and does not assume any icon or artwork support.',
		},
		propTable: [
			prop('items', 'DescriptionListItem[]', 'Rows of key-value metadata.'),
			prop('layout', "'vertical' | 'horizontal'", 'Presentation layout.', 'vertical'),
			prop('density', "'compact' | 'default'", 'Operational density mode.', 'default'),
			prop('copyLabel', 'string', 'Accessible copy-action prefix.', 'Copy value'),
			prop('revealLabel', 'string', 'Accessible reveal-action prefix.', 'Reveal value'),
			prop('hideLabel', 'string', 'Accessible hide-action prefix.', 'Hide value'),
			COMMON_STYLE_PROP,
			COMMON_TEST_ID_PROP,
		],
		doList: ['Mask sensitive values by default and let people reveal them intentionally.'],
		dontList: ['Do not dump long raw identifiers into a layout without copy support.'],
		accessibilityNotes: [
			'Copy and reveal controls expose stable labels tied to the field name.',
			'Reveal state is announced so assistive-tech users know the value changed.',
		],
		platformNotes: [
			'Uses the native clipboard bridge available on both mobile platforms.',
			'Layout remains RTL-safe through logical spacing and flex alignment.',
		],
	}),
	KanbanBoard: doc({
		name: 'KanbanBoard',
		filePath: 'src/design-system/components/molecules/KanbanBoard.tsx',
		summary:
			'Horizontal board layout with tokenized columns, WIP hints, drag-reorder inside columns, and explicit cross-column move controls.',
		exampleStories: [
			'three-column board',
			'board with WIP warning',
			'column reorder interactions',
		],
		variants: ['default', 'column over WIP limit'],
		sizes: ['default column width'],
		states: ['default', 'reordering card', 'over limit'],
		compositionExample:
			'Operational workflow board for queued, in-progress, and completed tasks.',
		usage: {
			relaxed: 'Use on overview boards where cards need more descriptive copy.',
			operational:
				'Keep card copy compact and column widths stable for fast scanning on mobile.',
			noMedia:
				'Board comprehension relies on titles, descriptions, and status labels without artwork.',
		},
		propTable: [
			prop('columns', 'KanbanBoardColumn[]', 'Controlled board columns.'),
			prop('defaultColumns', 'KanbanBoardColumn[]', 'Uncontrolled board columns.', '[]'),
			prop(
				'onColumnsChange',
				'(columns: KanbanBoardColumn[]) => void',
				'Canonical board callback.',
			),
			COMMON_STYLE_PROP,
			COMMON_TEST_ID_PROP,
		],
		doList: ['Keep WIP limits visible and use quiet warnings when a column is overloaded.'],
		dontList: ['Do not rely on drag alone when cards also need accessible move controls.'],
		accessibilityNotes: [
			'Column transfer buttons preserve a non-drag path for assistive-tech users.',
			'Card ordering itself is powered by the shared sortable-list accessibility actions.',
		],
		platformNotes: [
			'Columns live inside a horizontal ScrollView so they remain touch-friendly on mobile.',
			'Cards reuse the shared sortable-list gesture contract within each lane.',
		],
	}),
	MediaViewer: doc({
		name: 'MediaViewer',
		filePath: 'src/design-system/components/molecules/MediaViewer.tsx',
		summary:
			'Gallery viewer with progressive image loading, pinch zoom, swipe navigation, swipe-to-dismiss, and text-first fallback.',
		exampleStories: [
			'gallery item with thumbnail',
			'swipe between images',
			'missing-media fallback',
		],
		variants: ['gallery', 'fallback card'],
		sizes: ['default modal frame'],
		states: ['open', 'closed', 'loaded', 'missing media fallback'],
		compositionExample: 'Evidence or attachment viewer launched from a detail surface.',
		usage: {
			relaxed: 'Use when high-resolution imagery or attachments need roomy focus treatment.',
			operational:
				'Keep captions concise and rely on progressive loading when media is large.',
			noMedia:
				'Fallback copy keeps the viewer usable even when the image is missing or fails to load.',
		},
		propTable: [
			prop('items', 'MediaViewerItem[]', 'Gallery items to view.'),
			prop('index', 'number', 'Controlled active gallery index.'),
			prop('defaultIndex', 'number', 'Uncontrolled active gallery index.', '0'),
			prop('onIndexChange', '(index: number) => void', 'Gallery index callback.'),
			prop('open', 'boolean', 'Controlled open state.'),
			prop('defaultOpen', 'boolean', 'Uncontrolled open state.', 'true'),
			prop('onOpenChange', '(open: boolean) => void', 'Viewer open-state callback.'),
			COMMON_STYLE_PROP,
			COMMON_TEST_ID_PROP,
		],
		doList: ['Provide captions and alt-like labels so imagery never stands alone.'],
		dontList: [
			'Do not assume image availability or quality when the workflow depends on the content.',
		],
		accessibilityNotes: [
			'Close, previous, and next affordances all expose explicit labels.',
			'Fallback text preserves meaning when the image path fails.',
		],
		platformNotes: [
			'Pinch and pan gestures rely on the native gesture-handler stack on iOS and Android.',
			'Progressive loading uses the shared Expo image component for consistency.',
		],
	}),
	SortableList: doc({
		name: 'SortableList',
		filePath: 'src/design-system/components/molecules/SortableList.tsx',
		summary:
			'Gesture-driven reorder surface with drag handle, move up/down fallbacks, and announced ordering changes.',
		exampleStories: ['short reorder list', 'active dragged row', 'keyboard or button fallback'],
		variants: ['default'],
		sizes: ['default item height'],
		states: ['default', 'active drag', 'empty'],
		compositionExample: 'Priority queue or board lane where item ordering matters.',
		usage: {
			relaxed: 'Use when cards need more descriptive space while still being reorderable.',
			operational:
				'Use consistent row heights so drag thresholds remain predictable in dense lists.',
			noMedia: 'Reorder affordances work without any decorative imagery.',
		},
		propTable: [
			prop('items', 'T[]', 'Controlled sortable list items.'),
			prop('defaultItems', 'T[]', 'Uncontrolled sortable list items.', '[]'),
			prop('onItemsChange', '(items: T[]) => void', 'Canonical reorder callback.'),
			prop('renderItem', '(item, index, active) => ReactNode', 'Row renderer.'),
			prop('itemHeight', 'number', 'Expected row height for reorder thresholding.', '76'),
			COMMON_STYLE_PROP,
			COMMON_TEST_ID_PROP,
		],
		doList: ['Keep row heights reasonably consistent for predictable drag results.'],
		dontList: ['Do not hide every reorder path behind a gesture-only affordance.'],
		accessibilityNotes: [
			'Rows expose move-up and move-down accessibility actions.',
			'Ordering changes announce the new position for assistive-tech users.',
		],
		platformNotes: [
			'Drag thresholding uses gesture-handler pan gestures on both platforms.',
			'Touch-safe fallback buttons remain available even when gestures are reduced or unavailable.',
		],
	}),
	TokenInput: doc({
		name: 'TokenInput',
		filePath: 'src/design-system/components/molecules/TokenInput.tsx',
		summary:
			'Multi-tag field with add/remove flow, tag limits, and swipe-to-remove token rows on mobile.',
		exampleStories: ['simple tags', 'max-tag limit', 'swipe-remove token'],
		variants: ['default', 'limit reached'],
		sizes: ['default field'],
		states: ['empty', 'has tokens', 'limit reached'],
		compositionExample:
			'Label editor, notification audience picker, or metadata tagging field.',
		usage: {
			relaxed: 'Use where visible token rows help people understand structured tags.',
			operational: 'Keep limits explicit and token rows compact.',
			noMedia: 'Token meaning is fully expressed through text badges and counts.',
		},
		propTable: [
			prop('values', 'string[]', 'Controlled token list.'),
			prop('defaultValues', 'string[]', 'Uncontrolled token list.', '[]'),
			prop('maxTags', 'number', 'Maximum number of tokens.', '5'),
			prop('placeholder', 'string', 'Input placeholder.', 'Add a tag'),
			prop('onValueChange', '(values: string[]) => void', 'Canonical token-list callback.'),
			COMMON_TEST_ID_PROP,
			COMMON_STYLE_PROP,
		],
		doList: ['Show the current count relative to the limit.'],
		dontList: ['Do not let hidden overflow silently swallow user input.'],
		accessibilityNotes: [
			'Tokens remain readable badges and each row exposes a delete action.',
			'Swipe-to-remove still keeps a visible accessible delete affordance.',
		],
		platformNotes: [
			'Mobile token rows compose the shared swipeable-row gesture contract.',
			'Limit styling stays calm and warning-toned rather than alarmist.',
		],
	}),
	ToggleButtonGroup: doc({
		name: 'ToggleButtonGroup',
		filePath: 'src/design-system/components/molecules/ToggleButtonGroup.tsx',
		summary:
			'Grouped toggle buttons supporting either radio-style single select or checkbox-style multi-select.',
		exampleStories: ['single select group', 'multi-select facet group'],
		variants: ['single select', 'multi-select'],
		sizes: ['default'],
		states: ['selected', 'unselected'],
		compositionExample: 'Mode filters, facet toggles, or compact preference groups.',
		usage: {
			relaxed: 'Use for mode switches that should still feel tactile and premium.',
			operational:
				'Use concise labels and restrained selected-state color in dense toolbars.',
			noMedia: 'Selection meaning comes from label and state, not icons alone.',
		},
		propTable: [
			prop('options', 'ToggleButtonOption[]', 'Available toggle buttons.'),
			prop('multiple', 'boolean', 'Switches to checkbox-style multi-select.', 'false'),
			prop('value', 'string | string[]', 'Controlled selected value or values.'),
			prop('defaultValue', 'string | string[]', 'Uncontrolled selected value or values.'),
			prop('onValueChange', '(value) => void', 'Canonical group callback.'),
			COMMON_TEST_ID_PROP,
			COMMON_STYLE_PROP,
		],
		doList: ['Choose single or multi-select behavior intentionally.'],
		dontList: ['Do not mix mutually exclusive and additive choices in the same group.'],
		accessibilityNotes: [
			'Selected state remains explicit on every button.',
			'Single and multi-select behaviors use the same readable control pattern.',
		],
		platformNotes: [
			'Spacing and selected treatment reuse the shared button tokens.',
			'Behavior is consistent across iOS and Android without depending on platform shell chrome.',
		],
	}),
	VirtualizedList: doc({
		name: 'VirtualizedList',
		filePath: 'src/design-system/components/molecules/VirtualizedList.tsx',
		summary:
			'FlashList/SectionList wrapper for long datasets with selection, load more, refresh, empty, and skeleton behavior.',
		exampleStories: ['skeleton state', 'flat flash list', 'sectioned list with headers'],
		variants: ['flash list', 'section list'],
		sizes: ['compact', 'default'],
		states: ['loading', 'empty', 'selected rows', 'refreshing', 'load more'],
		compositionExample: 'Dense operational dataset with section headers and selectable rows.',
		usage: {
			relaxed:
				'Use richer empty descriptions and larger item heights on spacious overview surfaces.',
			operational:
				'Turn on compact density and fixed item height when scan speed and virtualization matter most.',
			noMedia: 'Empty and skeleton states remain understandable without imagery.',
		},
		propTable: [
			prop('data', 'T[]', 'Flat dataset for FlashList rendering.', '[]'),
			prop('sections', 'VirtualizedListSection<T>[]', 'Optional sectioned dataset.'),
			prop(
				'renderItem',
				'(context) => ReactElement | null',
				'Item renderer with selection helpers.',
			),
			prop('keyExtractor', '(item, index) => string', 'Stable row identity.'),
			prop('selectedKeys', 'string[]', 'Controlled selected row ids.'),
			prop('defaultSelectedKeys', 'string[]', 'Uncontrolled selected row ids.', '[]'),
			prop('onSelectedKeysChange', '(keys: string[]) => void', 'Selection callback.'),
			prop('itemHeight', 'number', 'Fixed-height optimization for getItemLayout.'),
			prop('estimatedItemSize', 'number', 'FlashList estimated item size.', '72'),
			prop('onLoadMore', '() => void', 'Load-more callback at list end.'),
			prop('onRefresh', '() => void', 'Pull-to-refresh callback.'),
			prop('isRefreshing', 'boolean', 'Refresh state.', 'false'),
			prop('isLoading', 'boolean', 'Initial loading state.', 'false'),
			prop('density', "'compact' | 'default'", 'Skeleton and row density.', 'default'),
			COMMON_STYLE_PROP,
			prop(
				'contentContainerStyle',
				'StyleProp<ViewStyle>',
				'List container layout overrides.',
			),
			COMMON_TEST_ID_PROP,
		],
		doList: ['Use a fixed item height when the dataset truly supports it.'],
		dontList: ['Do not drop back to ScrollView for long datasets that need virtualization.'],
		accessibilityNotes: [
			'Selection state is explicit and exposed through the shared renderItem contract.',
			'Empty and skeleton states stay readable under large text settings.',
		],
		platformNotes: [
			'Flat datasets use FlashList, while grouped datasets use SectionList on native platforms.',
			'Refresh and end-reached behaviors align with mobile list conventions.',
		],
	}),
};

export const DESIGN_SYSTEM_COMPONENT_DOC_LIST = Object.values(DESIGN_SYSTEM_COMPONENT_DOCS);
