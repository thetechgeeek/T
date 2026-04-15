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
	'Search Input',
	'Date Picker',
	'Button',
	'Icon Button',
	'Toast / Snackbar',
	'Alert / Banner',
	'Badge',
	'Tabs',
	'Card',
	'Metrics / Stat Card',
	'Modal / Dialog',
	'Bottom Tab Bar (React Navigation `BottomTabNavigator`)',
	'Inline field error message (below field, linked to field for screen readers)',
	'Filter chips (horizontal scrollable strip)',
] as const;

const PREVIEW_LABEL_SET = new Set<string>(DESIGN_LIBRARY_PREVIEW_LABELS);
const LIVE_PREVIEW_COMPONENTS = [
	'AmountInput',
	'Badge',
	'BottomSheetPicker',
	'Button',
	'Card',
	'Chip',
	'DatePickerField',
	'EmptyState',
	'FilterBar',
	'IconButton',
	'PhoneInput',
	'Screen',
	'ScreenHeader',
	'SearchBar',
	'StatCard',
	'TextInput',
	'ThemedText',
	'Toast',
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
