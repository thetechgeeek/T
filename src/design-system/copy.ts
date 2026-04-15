import type { DesignSystemComponentKind } from './generated/componentCatalog';
import type {
	ComponentKindFilter,
	LibraryCompletionFilter,
	LibraryPlatformFilter,
} from './catalog';

export type DesignSystemLocale = 'en' | 'pseudo' | 'ar';
export type DesignSystemDirection = 'ltr' | 'rtl';

type Localizer = (value: string) => string;

const PSEUDO_CHAR_MAP: Record<string, string> = {
	a: 'á',
	b: 'ƀ',
	c: 'ç',
	d: 'ď',
	e: 'ë',
	f: 'ƒ',
	g: 'ğ',
	h: 'ħ',
	i: 'ï',
	j: 'ĵ',
	k: 'ķ',
	l: 'ľ',
	m: 'ɱ',
	n: 'ñ',
	o: 'õ',
	p: 'þ',
	q: 'ʠ',
	r: 'ř',
	s: 'š',
	t: 'ť',
	u: 'ü',
	v: 'ṽ',
	w: 'ŵ',
	x: 'ẋ',
	y: 'ÿ',
	z: 'ž',
	A: 'Á',
	B: 'ß',
	C: 'Ç',
	D: 'Ď',
	E: 'Ë',
	F: 'Ƒ',
	G: 'Ğ',
	H: 'Ħ',
	I: 'Ï',
	J: 'Ĵ',
	K: 'Ķ',
	L: 'Ľ',
	M: 'Ṁ',
	N: 'Ñ',
	O: 'Õ',
	P: 'Þ',
	Q: 'Ǫ',
	R: 'Ř',
	S: 'Š',
	T: 'Ť',
	U: 'Ü',
	V: 'Ṽ',
	W: 'Ŵ',
	X: 'Ẍ',
	Y: 'Ŷ',
	Z: 'Ž',
} as const;

const RTL_EMBED = '\u202B';
const RTL_POP = '\u202C';

function pseudoLocalize(value: string) {
	const transformed = value
		.split('')
		.map((char) => PSEUDO_CHAR_MAP[char] ?? char)
		.join('');
	return `[~ ${transformed} ~]`;
}

function createLocalizer(locale: DesignSystemLocale): Localizer {
	if (locale === 'pseudo') {
		return pseudoLocalize;
	}

	if (locale === 'ar') {
		return (value) => `${RTL_EMBED}${pseudoLocalize(value)}${RTL_POP}`;
	}

	return (value) => value;
}

function localizeOption<T extends string>(
	localize: Localizer,
	option: { label: string; value: T },
): { label: string; value: T } {
	return {
		label: localize(option.label),
		value: option.value,
	};
}

export interface DesignSystemCopy {
	locale: DesignSystemLocale;
	direction: DesignSystemDirection;
	meta: {
		localeBadge: string;
		directionBadge: string;
	};
	screen: {
		title: string;
		accessibilityLabel: string;
	};
	hero: {
		title: string;
		description: string;
		presetBadge: (presetLabel: string) => string;
		modeBadge: (mode: string) => string;
		densityBadge: (density: string) => string;
	};
	stats: {
		allChecklistItems: string;
		completed: string;
		open: string;
		commonMobile: string;
		libraryComponents: string;
		liveDemos: string;
	};
	runtimeTheming: {
		title: string;
		description: string;
		themePresets: string;
		appearanceMode: string;
		currentProfile: string;
		currentDensity: (density: string) => string;
		currentTouchTarget: (value: number) => string;
		currentSpacing: (value: number) => string;
		currentRadius: (value: number) => string;
		currentBody: (fontSize: number, lineHeight: number) => string;
		cycleLookAndFeel: string;
		nestedSubtreePreviews: string;
		boardroomSurface: string;
		creativeSurface: string;
		subtreeMode: (isDark: boolean) => string;
		subtreeSpacing: (value: number) => string;
		subtreeRadius: (value: number) => string;
		themeModeChips: ReadonlyArray<{ label: string; value: 'system' | 'light' | 'dark' }>;
	};
	componentGallery: {
		title: string;
		description: string;
		categoryBadges: {
			inputs: string;
			actions: string;
			feedback: string;
			dataDisplay: string;
		};
		buttons: {
			primary: string;
			secondary: string;
			outline: string;
			danger: string;
			openPicker: string;
		};
		iconButtons: {
			search: string;
			calendar: string;
			mode: string;
		};
		fields: {
			textField: string;
			textFieldHelper: string;
			searchPlaceholder: string;
			phoneInput: string;
			amountInput: string;
			datePicker: string;
		};
		filterOptions: ReadonlyArray<{ label: string; value: string }>;
		picker: {
			title: string;
			options: ReadonlyArray<{ label: string; value: string }>;
		};
		notesSeed: string;
	};
	patternSamples: {
		title: string;
		description: string;
		previewReadyComponents: string;
		previewReadyTrend: string;
		previewReadyTrendLabel: string;
		accessibilityCoverage: string;
		accessibilityTrend: string;
		accessibilityTrendLabel: string;
		emptyStateTitle: string;
		emptyStateDescription: string;
		emptyStateAction: string;
	};
	componentInventory: {
		title: string;
		description: string;
		searchPlaceholder: string;
		kindFilters: ReadonlyArray<{ label: string; value: ComponentKindFilter }>;
		kindLabels: Record<DesignSystemComponentKind, string>;
		componentsCount: (count: number) => string;
		testedCount: (count: number) => string;
		liveDemoCount: (count: number) => string;
		groupCount: (count: number) => string;
		tested: string;
		needsTests: string;
		liveDemo: string;
		registryOnly: string;
	};
	checklistExplorer: {
		title: string;
		description: string;
		searchPlaceholder: string;
		platformFilters: ReadonlyArray<{ label: string; value: LibraryPlatformFilter }>;
		statusFilters: ReadonlyArray<{ label: string; value: LibraryCompletionFilter }>;
		rowsCount: (count: number) => string;
		completedCount: (count: number) => string;
		openCount: (count: number) => string;
		sectionGroups: (count: number) => string;
		viewingAllPlatforms: string;
		viewingCommonOnly: string;
		viewingMobileOnly: string;
		viewingCommonMobile: string;
		itemPlatformMobile: string;
		itemCompleted: string;
		itemOpen: string;
		itemPreviewed: string;
		itemPlanned: string;
	};
	localization: {
		title: string;
		description: string;
		localeSelector: string;
		runtimeSignals: string;
		formatExamples: string;
		localeOptions: ReadonlyArray<{ label: string; value: DesignSystemLocale }>;
		detectedLocale: (value: string) => string;
		intlLocale: (value: string) => string;
		fontScale: (value: number) => string;
		reduceMotion: (enabled: boolean) => string;
		boldText: (enabled: boolean) => string;
		runtimeRtl: (enabled: boolean) => string;
		sampleLabels: {
			number: string;
			currency: string;
			dateTime: string;
			relativeTime: string;
			list: string;
			plural: string;
			sorted: string;
		};
	};
	toast: {
		themeActivated: (presetLabel: string) => string;
	};
}

export function getDesignSystemCopy(locale: DesignSystemLocale = 'en'): DesignSystemCopy {
	const localize = createLocalizer(locale);
	const direction: DesignSystemDirection = locale === 'ar' ? 'rtl' : 'ltr';
	const componentKindOptions: ReadonlyArray<{
		label: string;
		value: ComponentKindFilter;
	}> = [
		{ label: 'All Components', value: 'all' },
		{ label: 'Atoms', value: 'atoms' },
		{ label: 'Molecules', value: 'molecules' },
		{ label: 'Organisms', value: 'organisms' },
		{ label: 'Skeletons', value: 'skeletons' },
	];
	const platformOptions: ReadonlyArray<{ label: string; value: LibraryPlatformFilter }> = [
		{ label: 'Common + Mobile', value: 'common-mobile' },
		{ label: 'Common', value: 'common' },
		{ label: 'Mobile', value: 'mobile' },
		{ label: 'All 1239', value: 'all' },
	];
	const statusOptions: ReadonlyArray<{ label: string; value: LibraryCompletionFilter }> = [
		{ label: 'All Rows', value: 'all' },
		{ label: 'Open', value: 'open' },
		{ label: 'Completed', value: 'completed' },
	];
	const localeOptions: ReadonlyArray<{ label: string; value: DesignSystemLocale }> = [
		{ label: 'English', value: 'en' },
		{ label: 'Pseudo', value: 'pseudo' },
		{ label: 'Arabic (RTL)', value: 'ar' },
	];

	return {
		locale,
		direction,
		meta: {
			localeBadge: localize(`Locale: ${locale.toUpperCase()}`),
			directionBadge: localize(`Direction: ${direction.toUpperCase()}`),
		},
		screen: {
			title: localize('Design System'),
			accessibilityLabel: localize('Internal design system workbench'),
		},
		hero: {
			title: localize('Design System Workbench'),
			description: localize(
				'A live, app-agnostic mobile workbench for tokens, components, accessibility stress, and runtime look-and-feel presets.',
			),
			presetBadge: (presetLabel) => localize(`Preset: ${presetLabel}`),
			modeBadge: (mode) => localize(`Mode: ${mode}`),
			densityBadge: (density) => localize(`Density: ${density}`),
		},
		stats: {
			allChecklistItems: localize('All checklist items'),
			completed: localize('Completed'),
			open: localize('Open'),
			commonMobile: localize('Common + Mobile'),
			libraryComponents: localize('Supported components'),
			liveDemos: localize('Workbench demos'),
		},
		runtimeTheming: {
			title: localize('Runtime Theming'),
			description: localize(
				'These controls switch the entire active theme profile, not only the color mode.',
			),
			themePresets: localize('Theme presets'),
			appearanceMode: localize('Appearance mode'),
			currentProfile: localize('Current profile'),
			currentDensity: (density) => localize(`Density: ${density}`),
			currentTouchTarget: (value) => localize(`Touch: ${value}px`),
			currentSpacing: (value) => localize(`Spacing lg: ${value}`),
			currentRadius: (value) => localize(`Radius md: ${value}`),
			currentBody: (fontSize, lineHeight) => localize(`Body: ${fontSize}/${lineHeight}`),
			cycleLookAndFeel: localize('Cycle Look & Feel'),
			nestedSubtreePreviews: localize('Nested subtree previews'),
			boardroomSurface: localize('Boardroom surface'),
			creativeSurface: localize('Creative surface'),
			subtreeMode: (isDark) => localize(`Mode: ${isDark ? 'dark' : 'light'}`),
			subtreeSpacing: (value) => localize(`Spacing: ${value}`),
			subtreeRadius: (value) => localize(`Radius: ${value}`),
			themeModeChips: [
				{ label: localize('System'), value: 'system' },
				{ label: localize('Light'), value: 'light' },
				{ label: localize('Dark'), value: 'dark' },
			] as const,
		},
		componentGallery: {
			title: localize('Component Gallery'),
			description: localize(
				'A neutral preview deck for reusable atoms, molecules, feedback patterns, and mobile-ready surfaces.',
			),
			categoryBadges: {
				inputs: localize('Inputs'),
				actions: localize('Actions'),
				feedback: localize('Feedback'),
				dataDisplay: localize('Data display'),
			},
			buttons: {
				primary: localize('Primary'),
				secondary: localize('Secondary'),
				outline: localize('Outline'),
				danger: localize('Danger'),
				openPicker: localize('Open Bottom Sheet Picker'),
			},
			iconButtons: {
				search: localize('Search'),
				calendar: localize('Calendar'),
				mode: localize('Mode'),
			},
			fields: {
				textField: localize('Text Field'),
				textFieldHelper: localize('Primitive text input preview'),
				searchPlaceholder: localize('Search input preview'),
				phoneInput: localize('Phone Input'),
				amountInput: localize('Amount Input'),
				datePicker: localize('Date Picker'),
			},
			filterOptions: [
				{ label: 'All', value: 'all' },
				{ label: 'Popular', value: 'popular' },
				{ label: 'Previewed', value: 'previewed' },
				{ label: 'Foundation', value: 'foundation' },
			].map((option) => localizeOption(localize, option)),
			picker: {
				title: localize('Preview Picker'),
				options: [
					{ label: 'Foundation', value: 'foundation' },
					{ label: 'Inputs', value: 'inputs' },
					{ label: 'Feedback', value: 'feedback' },
					{ label: 'Navigation', value: 'navigation' },
				].map((option) => localizeOption(localize, option)),
			},
			notesSeed: localize('This workbench is validating the reusable UI surface.'),
		},
		patternSamples: {
			title: localize('Pattern Samples'),
			description: localize(
				'These are higher-level examples showing how library primitives compose into reusable mobile surfaces.',
			),
			previewReadyComponents: localize('Preview-ready components'),
			previewReadyTrend: localize('+6'),
			previewReadyTrendLabel: localize('added this sprint'),
			accessibilityCoverage: localize('Accessibility pass rate'),
			accessibilityTrend: localize('+4 pts'),
			accessibilityTrendLabel: localize('after the latest audit'),
			emptyStateTitle: localize('No quality regressions in this surface'),
			emptyStateDescription: localize(
				'Approved loading, empty, error, and success states should all be verified here before product features adopt them.',
			),
			emptyStateAction: localize('Trigger Toast'),
		},
		componentInventory: {
			title: localize('Supported Component Catalog'),
			description: localize(
				'This catalog is generated from the design-system registry, not from product feature screens.',
			),
			searchPlaceholder: localize('Search components by name, kind, or file path'),
			kindFilters: componentKindOptions.map((option) =>
				localizeOption<ComponentKindFilter>(localize, option),
			),
			kindLabels: {
				atoms: localize('Atoms'),
				molecules: localize('Molecules'),
				organisms: localize('Organisms'),
				skeletons: localize('Skeletons'),
			},
			componentsCount: (count) => localize(`${count} components`),
			testedCount: (count) => localize(`${count} with tests`),
			liveDemoCount: (count) => localize(`${count} live demos`),
			groupCount: (count) => localize(`${count} groups`),
			tested: localize('Tested'),
			needsTests: localize('Needs tests'),
			liveDemo: localize('Live demo'),
			registryOnly: localize('Registry only'),
		},
		checklistExplorer: {
			title: localize('Checklist Explorer'),
			description: localize(
				'Search and inspect the generated checklist data. Common + Mobile is the active native build target.',
			),
			searchPlaceholder: localize('Search checklist items, sections, or platforms'),
			platformFilters: platformOptions.map((option) =>
				localizeOption<LibraryPlatformFilter>(localize, option),
			),
			statusFilters: statusOptions.map((option) =>
				localizeOption<LibraryCompletionFilter>(localize, option),
			),
			rowsCount: (count) => localize(`${count} rows`),
			completedCount: (count) => localize(`${count} completed`),
			openCount: (count) => localize(`${count} open`),
			sectionGroups: (count) => localize(`${count} section groups`),
			viewingAllPlatforms: localize('Viewing all platforms'),
			viewingCommonOnly: localize('Common only'),
			viewingMobileOnly: localize('Mobile only'),
			viewingCommonMobile: localize('Common + Mobile'),
			itemPlatformMobile: localize('Mobile'),
			itemCompleted: localize('Completed'),
			itemOpen: localize('Open'),
			itemPreviewed: localize('Previewed'),
			itemPlanned: localize('Planned'),
		},
		localization: {
			title: localize('Localization and Accessibility'),
			description: localize(
				'Stress the workbench with locale switches, RTL mirroring, and runtime accessibility signals before product surfaces inherit the patterns.',
			),
			localeSelector: localize('Dashboard locale'),
			runtimeSignals: localize('Runtime quality signals'),
			formatExamples: localize('Locale-aware formatting'),
			localeOptions: localeOptions.map((option) =>
				localizeOption<DesignSystemLocale>(localize, option),
			),
			detectedLocale: (value) => localize(`Runtime locale: ${value}`),
			intlLocale: (value) => localize(`Intl locale: ${value}`),
			fontScale: (value) => localize(`Font scale: ${value.toFixed(2)}x`),
			reduceMotion: (enabled) => localize(`Reduce motion: ${enabled ? 'On' : 'Off'}`),
			boldText: (enabled) => localize(`Bold text: ${enabled ? 'On' : 'Off'}`),
			runtimeRtl: (enabled) => localize(`RTL runtime: ${enabled ? 'On' : 'Off'}`),
			sampleLabels: {
				number: localize('Number'),
				currency: localize('Currency'),
				dateTime: localize('Date and time'),
				relativeTime: localize('Relative time'),
				list: localize('List'),
				plural: localize('Plural'),
				sorted: localize('Sorted labels'),
			},
		},
		toast: {
			themeActivated: (presetLabel) =>
				localize(`Theme preset "${presetLabel}" is now active.`),
		},
	};
}
