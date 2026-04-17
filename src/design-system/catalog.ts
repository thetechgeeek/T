import {
	DESIGN_SYSTEM_COMPONENTS,
	DESIGN_SYSTEM_COMPONENT_STATS,
	type DesignSystemComponent,
	type DesignSystemComponentKind,
} from './generated/componentCatalog';
import {
	UI_LIBRARY_ITEMS,
	UI_LIBRARY_STATS,
	type UiLibraryChecklistItem,
} from './generated/uiLibraryCatalog';

export type LibraryPlatformFilter = 'common-mobile' | 'common' | 'mobile' | 'web' | 'all';
export type LibraryCompletionFilter = 'all' | 'open' | 'completed';
export type ComponentKindFilter = 'all' | DesignSystemComponentKind;

export const DESIGN_LIBRARY_PREVIEW_LABELS = [
	'Text Field',
	'Textarea',
	'Select / Dropdown',
	'Combobox / Autocomplete',
	'Search Input',
	'Date Picker',
	'Time Picker',
	'Date-Range Picker',
	'Token / Pill Input (multi-tag)',
	'File Upload / Dropzone',
	'Slider',
	'Numeric Stepper',
	'OTP / Code Input',
	'Color Picker',
	'Checkbox',
	'Radio',
	'Toggle Switch',
	'Button',
	'High-emphasis / inverse CTA variant exists for media, hero, and dark surfaces',
	'Icon Button',
	'Split Button (primary + dropdown for secondary actions)',
	'Toggle Button Group',
	'Segmented Control',
	'Toast / Snackbar',
	'Alert / Banner',
	'Progress Indicator — Circular',
	'Progress Indicator — Linear',
	'Skeleton Loader',
	'Badge',
	'Empty State',
	'Error State',
	'Notification Center / Inbox',
	'Tabs',
	'Stepper / Wizard Navigation',
	'List',
	'Card',
	'Metrics / Stat Card',
	'Timeline / Activity Feed',
	'Avatar',
	'Avatar Group',
	'Description List / Key-Value Pairs',
	'Charts',
	'Virtualized List via `FlatList` / `FlashList`',
	'Sortable List (drag-to-reorder)',
	'Swipe-to-reveal actions on list rows (swipe-to-delete, swipe-to-archive)',
	'Charts: `react-native-svg` or `victory-native` based',
	'Avatar Group: tap to expand hidden members',
	'Image / Media Viewer',
	'Kanban Board with horizontal `ScrollView` + draggable cards (gesture handler)',
	'Modal / Dialog',
	'Confirmation Dialog',
	'Focus trap / accessibility focus',
	'Focus restore to trigger on close',
	'Small / Medium / Large size variants',
	'Hard confirmation (type entity name)',
	'Tooltip',
	'Popover',
	'With interactive content (forms, links)',
	'Focus moves inside on open',
	'Modal: animated entry (slide up / fade in via Reanimated)',
	'Bottom Sheet (`@gorhom/bottom-sheet` or equivalent)',
	'Snap points (25%, 50%, 90%)',
	'Drag-to-dismiss with velocity threshold',
	'Backdrop tap to close',
	'Keyboard-aware (adjusts snap point when keyboard appears)',
	'Nested scrolling within sheet content',
	'Tooltip: shown on long-press (no hover on touch devices)',
	'Context Menu: long-press trigger with haptic feedback',
	'iOS-style Action Sheet (share, copy, delete…)',
	'Alert dialog: `Alert.alert()` for native OS dialogs (simple confirmations)',
	'Inline field error message (below field, linked to field for screen readers)',
	'Filter chips (horizontal scrollable strip)',
	'Accordion / Collapsible with `LayoutAnimation` or `Reanimated`',
	'Expandable / collapsible sections (accordion)',
	'Height Expand: `LayoutAnimation.configureNext()` or Reanimated layout animations',
] as const;

const PREVIEW_LABEL_SET = new Set<string>(DESIGN_LIBRARY_PREVIEW_LABELS);
const LIVE_PREVIEW_COMPONENTS = [
	'AmountInput',
	'ActionMenuSheet',
	'ActivityFeed',
	'AlertBanner',
	'AutocompleteField',
	'Avatar',
	'AvatarGroup',
	'Badge',
	'BottomSheetPicker',
	'Button',
	'Card',
	'Checkbox',
	'Chip',
	'CollapsibleSection',
	'ConfirmationModal',
	'ColorPicker',
	'DataChart',
	'DatePickerField',
	'DateRangePickerField',
	'DescriptionList',
	'EmptyState',
	'ErrorState',
	'FileUploadField',
	'FilterBar',
	'IconButton',
	'KanbanBoard',
	'ListItem',
	'MediaViewer',
	'NotificationCenter',
	'NumericStepper',
	'OtpCodeInput',
	'PhoneInput',
	'Popover',
	'ProgressIndicator',
	'RangeSlider',
	'Radio',
	'Screen',
	'SearchBar',
	'SegmentedControl',
	'SkeletonBlock',
	'SkeletonRow',
	'SortableList',
	'SplitButton',
	'Stepper',
	'StatCard',
	'SwipeableRow',
	'Tabs',
	'TextInput',
	'TextAreaField',
	'ThemedText',
	'TimePickerField',
	'Tooltip',
	'TokenInput',
	'ToggleSwitch',
	'ToggleButtonGroup',
	'Toast',
	'VirtualizedList',
] as const;
const LIVE_PREVIEW_COMPONENT_SET = new Set<string>(LIVE_PREVIEW_COMPONENTS);

export const COMPONENT_KIND_LABELS: Record<DesignSystemComponentKind, string> = {
	atoms: 'Atoms',
	molecules: 'Molecules',
	organisms: 'Organisms',
	skeletons: 'Skeletons',
};

export interface LibraryOverview {
	total: number;
	completed: number;
	open: number;
	common: number;
	mobile: number;
	web: number;
	commonMobile: number;
	sections: typeof UI_LIBRARY_STATS.sections;
	previewable: number;
}

export const DESIGN_LIBRARY_OVERVIEW: LibraryOverview = {
	...UI_LIBRARY_STATS,
	previewable: DESIGN_LIBRARY_PREVIEW_LABELS.length,
};

export interface DesignLibraryComponentOverview {
	total: number;
	tested: number;
	livePreviewCount: number;
	byKind: typeof DESIGN_SYSTEM_COMPONENT_STATS.byKind;
}

export const DESIGN_LIBRARY_COMPONENT_OVERVIEW: DesignLibraryComponentOverview = {
	...DESIGN_SYSTEM_COMPONENT_STATS,
	livePreviewCount: DESIGN_SYSTEM_COMPONENTS.filter((component) =>
		LIVE_PREVIEW_COMPONENT_SET.has(component.name),
	).length,
};

export function filterLibraryItems(
	query: string,
	platformFilter: LibraryPlatformFilter,
	completionFilter: LibraryCompletionFilter = 'all',
): UiLibraryChecklistItem[] {
	const normalizedQuery = query.trim().toLowerCase();

	return UI_LIBRARY_ITEMS.filter((item) => {
		const matchesPlatform =
			platformFilter === 'all' ||
			(platformFilter === 'common' && item.platform === 'Common') ||
			(platformFilter === 'mobile' && item.platform === 'Mobile (React Native)') ||
			(platformFilter === 'web' && item.platform === 'Web') ||
			(platformFilter === 'common-mobile' &&
				(item.platform === 'Common' || item.platform === 'Mobile (React Native)'));

		if (!matchesPlatform) {
			return false;
		}

		const matchesCompletion =
			completionFilter === 'all' ||
			(completionFilter === 'open' && !item.completed) ||
			(completionFilter === 'completed' && item.completed);

		if (!matchesCompletion) {
			return false;
		}

		if (!normalizedQuery) {
			return true;
		}

		const haystack =
			`${item.section} ${item.subsection} ${item.title} ${item.platform}`.toLowerCase();
		return haystack.includes(normalizedQuery);
	});
}

export function isPreviewableItem(item: UiLibraryChecklistItem) {
	return PREVIEW_LABEL_SET.has(item.title);
}

export function formatSectionKey(item: UiLibraryChecklistItem) {
	return `${item.section}__${item.subsection}`;
}

export function filterCatalogComponents(
	query: string,
	kindFilter: ComponentKindFilter,
): DesignSystemComponent[] {
	const normalizedQuery = query.trim().toLowerCase();

	return DESIGN_SYSTEM_COMPONENTS.filter((component) => {
		const matchesKind = kindFilter === 'all' || component.kind === kindFilter;
		if (!matchesKind) {
			return false;
		}

		if (!normalizedQuery) {
			return true;
		}

		const haystack = `${component.name} ${component.kind} ${component.filePath}`.toLowerCase();
		return haystack.includes(normalizedQuery);
	});
}

export function isLivePreviewComponent(component: DesignSystemComponent) {
	return LIVE_PREVIEW_COMPONENT_SET.has(component.name);
}
