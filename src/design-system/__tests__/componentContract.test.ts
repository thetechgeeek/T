import fs from 'fs';
import path from 'path';

interface RegistryEntry {
	filePath: string;
}

const root = process.cwd();
const registry = JSON.parse(
	fs.readFileSync(path.join(root, 'src', 'design-system', 'componentRegistry.json'), 'utf8'),
) as RegistryEntry[];

const STYLE_PROP_PATTERN =
	/\bstyle\??:|\bcontainerStyle\??:|\bcontentContainerStyle\??:|\binputStyle\??:|\btextStyle\??:/;
const TEST_ID_PROP_PATTERN = /\btestID\??:/;
const NATIVE_PROP_EXTENSION_PATTERN =
	/extends\s+(?:Omit<)?(?:PressableProps|TextProps|RNTextInputProps|TextInputProps)\b/;
const POLYMORPHIC_AS_PATTERN = /\bas\??:|asChild/;
const FORWARD_REF_PATTERN = /\bforwardRef\b/;
const FOCUS_VISIBILITY_PATTERN = /\bonFocus\b|\bsetIsFocused\(true\)|buildFocusRingStyle/;
const ANNOUNCEMENT_PATTERN = /\bannounceForScreenReader\b|accessibilityLiveRegion/;
const ACCESSIBILITY_ACTION_PATTERN = /\baccessibilityActions=|onAccessibilityAction=/;
const ACCESSIBILITY_ROLE_PATTERN = /\baccessibilityRole=/;
const ACCESSIBILITY_STATE_PATTERN = /\baccessibilityState=/;
const ACCESSIBILITY_VALUE_PATTERN = /\baccessibilityValue=/;
const ACCESSIBILITY_HINT_PATTERN = /\baccessibilityHint=/;
const ACCESSIBILITY_MODAL_PATTERN = /\baccessibilityViewIsModal\b|importantForAccessibility="yes"/;
const ACCESSIBILITY_LIVE_REGION_PATTERN = /\baccessibilityLiveRegion=/;
const NON_SEMANTIC_PRESS_HANDLER_PATTERN =
	/<(?:View|Text|Animated\.View|Animated\.Text)[^>]*\bonPress=/;
const MANUAL_FOCUS_ORDER_PATTERN =
	/\b(?:tabIndex|nextFocusDown|nextFocusForward|nextFocusLeft|nextFocusRight|nextFocusUp)\b/;
const RAW_NATIVE_TEXT_IMPORT_PATTERN = /import\s*\{[^}]*\bText\b[^}]*\}\s*from 'react-native'/;

const INTERACTIVE_REF_COMPONENTS = [
	'Button',
	'Checkbox',
	'Chip',
	'IconButton',
	'Radio',
	'AvatarGroup',
	'TouchableCard',
	'ToggleSwitch',
	'TextInput',
	'AmountInput',
	'BottomSheetPicker',
	'CollapsibleSection',
	'ConfirmationModal',
	'DeclarativeForm',
	'DatePickerField',
	'FilterBar',
	'FormField',
	'ListItem',
	'PhoneInput',
	'Popover',
	'SearchBar',
	'SwipeableRow',
	'TextAreaField',
	'Tooltip',
] as const;

const FOCUS_VISIBLE_COMPONENTS = INTERACTIVE_REF_COMPONENTS.filter(
	(componentName) => componentName !== 'FormField',
);

const CONTROLLED_COMPONENT_PATTERNS: Readonly<Record<string, RegExp[]>> = {
	Checkbox: [/\bchecked\??:/, /\bdefaultChecked\??:/, /\bonCheckedChange\??:/],
	Chip: [/\bselected\??:/, /\bdefaultSelected\??:/, /\bonSelectedChange\??:/],
	AmountInput: [/\bvalue\??:/, /\bdefaultValue\??:/, /\bonValueChange\??:/],
	ActivityFeed: [/\bitems\??:/, /\bdefaultItems\??:/, /\bonItemsChange\??:/],
	AvatarGroup: [/\bexpanded\??:/, /\bdefaultExpanded\??:/, /\bonExpandedChange\??:/],
	BottomSheetPicker: [
		/\bopen\??:/,
		/\bdefaultOpen\??:/,
		/\bonOpenChange\??:/,
		/\bvalue\??:/,
		/\bdefaultValue\??:/,
		/\bonValueChange\??:/,
	],
	CollapsibleSection: [/\bexpanded\??:/, /\bdefaultExpanded\??:/, /\bonExpandedChange\??:/],
	ConfirmationModal: [/\bopen\??:/, /\bdefaultOpen\??:/, /\bonOpenChange\??:/],
	DataChart: [
		/\bfocusedSeriesId\??:/,
		/\bdefaultFocusedSeriesId\??:/,
		/\bonFocusedSeriesChange\??:/,
	],
	DeclarativeForm: [/\bvalues\??:/, /\bdefaultValues\??:/, /\bonValuesChange\??:/],
	DatePickerField: [/\bvalue\??:/, /\bdefaultValue\??:/, /\bonValueChange\??:/],
	FilterBar: [/\bvalue\??:/, /\bdefaultValue\??:/, /\bonValueChange\??:/],
	FormWizard: [
		/\bvalues\??:/,
		/\bdefaultValues\??:/,
		/\bonValuesChange\??:/,
		/\bstep\??:/,
		/\bdefaultStep\??:/,
		/\bonStepChange\??:/,
	],
	KanbanBoard: [/\bcolumns\??:/, /\bdefaultColumns\??:/, /\bonColumnsChange\??:/],
	MediaViewer: [
		/\bindex\??:/,
		/\bdefaultIndex\??:/,
		/\bonIndexChange\??:/,
		/\bopen\??:/,
		/\bdefaultOpen\??:/,
		/\bonOpenChange\??:/,
	],
	PhoneInput: [/\bvalue\??:/, /\bdefaultValue\??:/, /\bonValueChange\??:/],
	Popover: [/\bopen\??:/, /\bdefaultOpen\??:/, /\bonOpenChange\??:/],
	Radio: [/\bselected\??:/, /\bdefaultSelected\??:/, /\bonSelectedChange\??:/],
	SearchBar: [/\bvalue\??:/, /\bdefaultValue\??:/, /\bonValueChange\??:/],
	SortableList: [/\bitems\??:/, /\bdefaultItems\??:/, /\bonItemsChange\??:/],
	TextAreaField: [/\bvalue\??:/, /\bdefaultValue\??:/, /\bonValueChange\??:/],
	Tooltip: [/\bopen\??:/, /\bdefaultOpen\??:/, /\bonOpenChange\??:/],
	ToggleSwitch: [/\bvalue\??:/, /\bdefaultValue\??:/, /\bonValueChange\??:/],
	VirtualizedList: [
		/\bselectedKeys\??:/,
		/\bdefaultSelectedKeys\??:/,
		/\bonSelectedKeysChange\??:/,
	],
} as const;

const ANNOUNCEMENT_COMPONENTS = [
	'ActivityFeed',
	'AmountInput',
	'AvatarGroup',
	'BottomSheetPicker',
	'Checkbox',
	'CollapsibleSection',
	'ConfirmationModal',
	'DeclarativeForm',
	'DatePickerField',
	'DescriptionList',
	'FilterBar',
	'MediaViewer',
	'PhoneInput',
	'Popover',
	'Radio',
	'SearchBar',
	'SortableList',
	'SwipeableRow',
	'Tooltip',
	'ToggleSwitch',
	'Toast',
] as const;

const ACCESSIBILITY_ACTION_COMPONENTS = [
	'CollapsibleSection',
	'ConfirmationModal',
	'DatePickerField',
	'SortableList',
	'SwipeableRow',
] as const;

const ACCESSIBILITY_ROLE_COMPONENTS = [
	'AvatarGroup',
	'BottomSheetPicker',
	'Button',
	'Checkbox',
	'Chip',
	'CollapsibleSection',
	'ConfirmationModal',
	'DatePickerField',
	'FilterBar',
	'IconButton',
	'ListItem',
	'Popover',
	'ProgressIndicator',
	'Radio',
	'RangeSlider',
	'SearchBar',
	'SwipeableRow',
	'ToggleSwitch',
] as const;

const ACCESSIBILITY_STATE_COMPONENTS = [
	'Button',
	'Checkbox',
	'Chip',
	'CollapsibleSection',
	'ConfirmationModal',
	'DatePickerField',
	'Radio',
	'SearchBar',
	'ToggleSwitch',
] as const;

const ACCESSIBILITY_VALUE_COMPONENTS = ['ProgressIndicator', 'RangeSlider'] as const;

const ACCESSIBILITY_HINT_COMPONENTS = [
	'BottomSheetPicker',
	'Button',
	'Checkbox',
	'ListItem',
	'Radio',
	'SearchBar',
	'TextAreaField',
	'TextInput',
	'ToggleSwitch',
] as const;

const ACCESSIBILITY_MODAL_COMPONENTS = [
	'BottomSheetPicker',
	'ConfirmationModal',
	'DatePickerField',
	'Popover',
] as const;

const ACCESSIBILITY_LIVE_REGION_COMPONENTS = ['Toast'] as const;

function getComponentName(filePath: string) {
	return path.basename(filePath, path.extname(filePath));
}

function readSource(filePath: string) {
	return fs.readFileSync(path.join(root, filePath), 'utf8');
}

const sourceByName = new Map(
	registry.map((entry) => [getComponentName(entry.filePath), readSource(entry.filePath)]),
);

function getSource(componentName: string) {
	const source = sourceByName.get(componentName);
	if (!source) {
		throw new Error(`Missing source for supported component ${componentName}`);
	}
	return source;
}

describe('supported component contract', () => {
	it('keeps supported components aligned to the mobile API surface', () => {
		for (const entry of registry) {
			const source = readSource(entry.filePath);
			const hasNativeExtension = NATIVE_PROP_EXTENSION_PATTERN.test(source);
			const hasStyleProp = STYLE_PROP_PATTERN.test(source) || hasNativeExtension;
			const hasTestIdProp = TEST_ID_PROP_PATTERN.test(source) || hasNativeExtension;

			expect(hasStyleProp).toBe(true);
			expect(hasTestIdProp).toBe(true);
			expect(POLYMORPHIC_AS_PATTERN.test(source)).toBe(false);
		}
	});

	it('forwards refs on every interactive supported component', () => {
		for (const componentName of INTERACTIVE_REF_COMPONENTS) {
			expect(FORWARD_REF_PATTERN.test(getSource(componentName))).toBe(true);
		}
	});

	it('uses controlled and uncontrolled patterns with canonical callbacks on value-driven components', () => {
		for (const [componentName, patterns] of Object.entries(CONTROLLED_COMPONENT_PATTERNS)) {
			const source = getSource(componentName);

			for (const pattern of patterns) {
				expect(pattern.test(source)).toBe(true);
			}
		}
	});

	it('keeps interactive components focus-visible for keyboard and assistive-tech environments', () => {
		for (const componentName of FOCUS_VISIBLE_COMPONENTS) {
			expect(FOCUS_VISIBILITY_PATTERN.test(getSource(componentName))).toBe(true);
		}
	});

	it('announces meaningful state changes for dynamic feedback surfaces', () => {
		for (const componentName of ANNOUNCEMENT_COMPONENTS) {
			expect(ANNOUNCEMENT_PATTERN.test(getSource(componentName))).toBe(true);
		}
	});

	it('avoids non-semantic View/Text press handlers in supported components', () => {
		for (const entry of registry) {
			expect(NON_SEMANTIC_PRESS_HANDLER_PATTERN.test(readSource(entry.filePath))).toBe(false);
		}
	});

	it('keeps native focus order logical by avoiding manual focus-order overrides', () => {
		for (const entry of registry) {
			expect(MANUAL_FOCUS_ORDER_PATTERN.test(readSource(entry.filePath))).toBe(false);
		}
	});

	it('uses explicit accessibility roles on interactive controls that depend on semantic intent', () => {
		for (const componentName of ACCESSIBILITY_ROLE_COMPONENTS) {
			expect(ACCESSIBILITY_ROLE_PATTERN.test(getSource(componentName))).toBe(true);
		}
	});

	it('exposes accessibility state, value, and hint metadata on dynamic controls', () => {
		for (const componentName of ACCESSIBILITY_STATE_COMPONENTS) {
			expect(ACCESSIBILITY_STATE_PATTERN.test(getSource(componentName))).toBe(true);
		}

		for (const componentName of ACCESSIBILITY_VALUE_COMPONENTS) {
			expect(ACCESSIBILITY_VALUE_PATTERN.test(getSource(componentName))).toBe(true);
		}

		for (const componentName of ACCESSIBILITY_HINT_COMPONENTS) {
			expect(ACCESSIBILITY_HINT_PATTERN.test(getSource(componentName))).toBe(true);
		}
	});

	it('exposes accessibility actions for components that would otherwise rely on custom gestures or alternate shortcuts', () => {
		for (const componentName of ACCESSIBILITY_ACTION_COMPONENTS) {
			expect(ACCESSIBILITY_ACTION_PATTERN.test(getSource(componentName))).toBe(true);
		}
	});

	it('marks overlay content as modal and keeps live-region announcements on supported feedback surfaces', () => {
		for (const componentName of ACCESSIBILITY_MODAL_COMPONENTS) {
			expect(ACCESSIBILITY_MODAL_PATTERN.test(getSource(componentName))).toBe(true);
		}

		for (const componentName of ACCESSIBILITY_LIVE_REGION_COMPONENTS) {
			expect(ACCESSIBILITY_LIVE_REGION_PATTERN.test(getSource(componentName))).toBe(true);
		}
	});

	it('uses the shared text primitive instead of raw react-native Text in supported components', () => {
		for (const entry of registry) {
			const componentName = getComponentName(entry.filePath);
			if (componentName === 'ThemedText') {
				continue;
			}

			expect(RAW_NATIVE_TEXT_IMPORT_PATTERN.test(readSource(entry.filePath))).toBe(false);
		}
	});
});
