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
	DatePickerField: [/\bvalue\??:/, /\bdefaultValue\??:/, /\bonValueChange\??:/],
	FilterBar: [/\bvalue\??:/, /\bdefaultValue\??:/, /\bonValueChange\??:/],
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

	it('exposes accessibility actions for components that would otherwise rely on custom gestures or alternate shortcuts', () => {
		for (const componentName of ACCESSIBILITY_ACTION_COMPONENTS) {
			expect(ACCESSIBILITY_ACTION_PATTERN.test(getSource(componentName))).toBe(true);
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
