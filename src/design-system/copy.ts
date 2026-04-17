import type { DesignSystemComponentKind } from './generated/componentCatalog';
import {
	DESIGN_LIBRARY_OVERVIEW,
	type ComponentKindFilter,
	type LibraryCompletionFilter,
	type LibraryPlatformFilter,
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
	qualityBar: {
		title: string;
		description: string;
		doctrineCards: ReadonlyArray<{ title: string; description: string }>;
		visualLawCards: ReadonlyArray<{ title: string; description: string }>;
		antiPatternCards: ReadonlyArray<{ title: string; description: string }>;
	};
	runtimeTheming: {
		title: string;
		description: string;
		themePresets: string;
		appearanceMode: string;
		currentProfile: string;
		currentDensity: (density: string) => string;
		currentExpression: (expression: string) => string;
		currentAccentBudget: (count: number) => string;
		currentSurfaceBias: (bias: string) => string;
		currentBrandZones: (zones: readonly string[]) => string;
		currentInverseActionSurfaces: (surfaces: readonly string[]) => string;
		currentTouchTarget: (value: number) => string;
		currentSpacing: (value: number) => string;
		currentRadius: (value: number) => string;
		currentBody: (fontSize: number, lineHeight: number) => string;
		cycleLookAndFeel: string;
		nestedSubtreePreviews: string;
		operationalSurface: string;
		showcaseSurface: string;
		subtreeMode: (isDark: boolean) => string;
		subtreeExpression: (expression: string) => string;
		subtreeSpacing: (value: number) => string;
		subtreeRadius: (value: number) => string;
		themeModeChips: ReadonlyArray<{ label: string; value: 'system' | 'light' | 'dark' }>;
	};
	presentationModes: {
		title: string;
		description: string;
		accentBudget: (count: number) => string;
		defaultSurfaceBias: (bias: string) => string;
		inverseAction: string;
		surfaceTiersTitle: string;
		surfaceTiersDescription: string;
		tierLabels: {
			canvas: string;
			default: string;
			raised: string;
			overlay: string;
			inverse: string;
		};
		tierDescriptions: {
			canvas: string;
			default: string;
			raised: string;
			overlay: string;
			inverse: string;
		};
		relaxed: {
			title: string;
			description: string;
			primaryAction: string;
			secondaryAction: string;
			metricLabel: string;
			searchPlaceholder: string;
			filterLabels: readonly string[];
		};
		operational: {
			title: string;
			description: string;
			primaryAction: string;
			secondaryAction: string;
			metricLabel: string;
			searchPlaceholder: string;
			filterLabels: readonly string[];
		};
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
			inverse: string;
			inverseHint: string;
			openPicker: string;
			openDialog: string;
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
			textarea: string;
			errorField: string;
			errorFieldError: string;
		};
		accordion: {
			title: string;
			subtitle: string;
			collapsedLabel: string;
			expandedLabel: string;
			body: string;
			badge: string;
		};
		feedbackBanner: {
			label: string;
			title: string;
			description: string;
			actionLabel: string;
		};
		dialog: {
			title: string;
			message: string;
			confirmLabel: string;
			cancelLabel: string;
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
	stateProof: {
		title: string;
		description: string;
		loading: {
			title: string;
			description: string;
		};
		empty: {
			title: string;
			description: string;
			actionLabel: string;
		};
		error: {
			title: string;
			description: string;
			retryLabel: string;
			supportLabel: string;
		};
		readOnly: {
			title: string;
			description: string;
		};
		denied: {
			title: string;
			description: string;
			actionLabel: string;
		};
		noMedia: {
			title: string;
			description: string;
		};
		uglyData: {
			title: string;
			description: string;
			metricLabel: string;
			metaLabel: string;
		};
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
		storyCount: (count: number) => string;
		variantCount: (count: number) => string;
		stateCount: (count: number) => string;
		propCount: (count: number) => string;
		tested: string;
		needsTests: string;
		liveDemo: string;
		registryOnly: string;
		summary: string;
		exampleStories: string;
		variants: string;
		sizes: string;
		states: string;
		composition: string;
		relaxed: string;
		operational: string;
		noMedia: string;
		props: string;
		doLabel: string;
		dontLabel: string;
		accessibility: string;
		platform: string;
		defaultValue: string;
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
		pixelRatio: (value: number) => string;
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
		{
			label: `Common + Mobile (${DESIGN_LIBRARY_OVERVIEW.commonMobile})`,
			value: 'common-mobile',
		},
		{ label: `Common (${DESIGN_LIBRARY_OVERVIEW.common})`, value: 'common' },
		{ label: `Mobile (${DESIGN_LIBRARY_OVERVIEW.mobile})`, value: 'mobile' },
		{ label: `All (${DESIGN_LIBRARY_OVERVIEW.total})`, value: 'all' },
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
				'A live, app-agnostic mobile workbench proving calm hierarchy, fallback-safe states, and full runtime look-and-feel switching.',
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
		qualityBar: {
			title: localize('Enterprise x Premium Quality Bar'),
			description: localize(
				'The workbench should prove disciplined hierarchy, calmer surfaces, and fallback-safe polish before any product surface inherits a pattern.',
			),
			doctrineCards: [
				{
					title: 'System discipline',
					description:
						'Fewer ingredients, clearer hierarchy, and stronger spacing beat ornamental complexity.',
				},
				{
					title: 'Enterprise truth',
					description:
						'Loading, empty, error, denied, localized, zoomed, and ugly-data states count as first-class design work.',
				},
				{
					title: 'One focal point',
					description:
						'Every surface should have one dominant purpose, one dominant focal region, and one primary action.',
				},
				{
					title: 'Calm chrome',
					description:
						'Group primarily with spacing, surface, and contrast before adding borders, dividers, or decoration.',
				},
			].map((item) => ({
				title: localize(item.title),
				description: localize(item.description),
			})),
			visualLawCards: [
				{
					title: 'Accent budget',
					description:
						'Reserve saturated accent for the primary CTA, the selected state, or the one key data highlight.',
				},
				{
					title: 'Neutral-first surfaces',
					description:
						'Canvas, default, raised, overlay, and inverse surfaces should remain legible before brand expression is added.',
				},
				{
					title: 'Silhouette discipline',
					description:
						'Cards, controls, chips, avatars, and overlays should each draw from stable radius families.',
				},
				{
					title: 'Depth as ambience',
					description:
						'Prefer soft lift and contrast separation over harsh drop shadows and noisy borders.',
				},
			].map((item) => ({
				title: localize(item.title),
				description: localize(item.description),
			})),
			antiPatternCards: [
				{
					title: 'No accent sprawl',
					description:
						'Multiple loud accents on one surface compete for attention and flatten hierarchy.',
				},
				{
					title: 'No image dependency',
					description:
						'Layouts must still read clearly when logos, illustrations, or media are missing.',
				},
				{
					title: 'No giant-card monoculture',
					description:
						'Dense workflows still need comparison, scan speed, and bulk action clarity.',
				},
			].map((item) => ({
				title: localize(item.title),
				description: localize(item.description),
			})),
		},
		runtimeTheming: {
			title: localize('Runtime Theming'),
			description: localize(
				'These controls switch the entire active visual language: density, silhouette, depth, typography feel, and accent behavior, not only colors.',
			),
			themePresets: localize('Theme presets'),
			appearanceMode: localize('Appearance mode'),
			currentProfile: localize('Current profile'),
			currentDensity: (density) => localize(`Density: ${density}`),
			currentExpression: (expression) => localize(`Expression: ${expression}`),
			currentAccentBudget: (count) => localize(`Accent budget: ${count}`),
			currentSurfaceBias: (bias) => localize(`Surface bias: ${bias}`),
			currentBrandZones: (zones) => localize(`Brand zones: ${zones.join(', ')}`),
			currentInverseActionSurfaces: (surfaces) =>
				localize(`Inverse actions: ${surfaces.join(', ')}`),
			currentTouchTarget: (value) => localize(`Touch: ${value}px`),
			currentSpacing: (value) => localize(`Spacing lg: ${value}`),
			currentRadius: (value) => localize(`Radius md: ${value}`),
			currentBody: (fontSize, lineHeight) => localize(`Body: ${fontSize}/${lineHeight}`),
			cycleLookAndFeel: localize('Cycle Look & Feel'),
			nestedSubtreePreviews: localize('Nested subtree previews'),
			operationalSurface: localize('Operational surface'),
			showcaseSurface: localize('Showcase surface'),
			subtreeMode: (isDark) => localize(`Mode: ${isDark ? 'dark' : 'light'}`),
			subtreeExpression: (expression) => localize(`Expression: ${expression}`),
			subtreeSpacing: (value) => localize(`Spacing: ${value}`),
			subtreeRadius: (value) => localize(`Radius: ${value}`),
			themeModeChips: [
				{ label: localize('System'), value: 'system' },
				{ label: localize('Light'), value: 'light' },
				{ label: localize('Dark'), value: 'dark' },
			] as const,
		},
		presentationModes: {
			title: localize('Relaxed vs Operational Presentation'),
			description: localize(
				'The same library should support premium showcase surfaces and dense operational surfaces without changing behavior or accessibility guarantees.',
			),
			accentBudget: (count) => localize(`Accent budget: ${count}`),
			defaultSurfaceBias: (bias) => localize(`Default surface bias: ${bias}`),
			inverseAction: localize('Inverse action style is reserved for hero and media surfaces'),
			surfaceTiersTitle: localize('Surface tiers'),
			surfaceTiersDescription: localize(
				'Each preset still inherits the same surface model so screens can stay calm under different brand expressions.',
			),
			tierLabels: {
				canvas: localize('Canvas'),
				default: localize('Default'),
				raised: localize('Raised'),
				overlay: localize('Overlay'),
				inverse: localize('Inverse'),
			},
			tierDescriptions: {
				canvas: localize('App background and longest-running reading surface'),
				default: localize('Primary working card or form surface'),
				raised: localize('Grouped summary or comparison surface'),
				overlay: localize('Transient floating layer such as popover or sheet'),
				inverse: localize('High-emphasis action or hero anchor with strict usage limits'),
			},
			relaxed: {
				title: localize('Relaxed showcase'),
				description: localize(
					'Use for onboarding, discovery, executive summaries, and branded review moments where one focal action leads the surface.',
				),
				primaryAction: localize('Resolve review'),
				secondaryAction: localize('View notes'),
				metricLabel: localize('visual coherence'),
				searchPlaceholder: localize('Search standards, tokens, or fixtures'),
				filterLabels: [localize('Showcase'), localize('Branded'), localize('Localized')],
			},
			operational: {
				title: localize('Operational dense'),
				description: localize(
					'Use for triage, monitoring, queues, and approval flows where scan speed matters more than decorative emphasis.',
				),
				primaryAction: localize('Resolve blockers'),
				secondaryAction: localize('Export queue'),
				metricLabel: localize('items awaiting action'),
				searchPlaceholder: localize('Search queues, regions, or approvers'),
				filterLabels: [localize('Operational'), localize('Blocked'), localize('No media')],
			},
		},
		componentGallery: {
			title: localize('Component Gallery'),
			description: localize(
				'Preview shared primitives under the same calm hierarchy and accessibility expectations that the broader workbench enforces.',
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
				inverse: localize('Inverse'),
				inverseHint: localize('Use on hero, media, and dark emphasis surfaces'),
				openPicker: localize('Open Bottom Sheet Picker'),
				openDialog: localize('Open Confirmation Dialog'),
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
				textarea: localize('Textarea'),
				errorField: localize('Approval Email'),
				errorFieldError: localize('Enter a valid approver email before continuing'),
			},
			accordion: {
				title: localize('Collapsible Section'),
				subtitle: localize(
					'Use a clear header and explicit state label so hierarchy survives even when motion is reduced.',
				),
				collapsedLabel: localize('Show details'),
				expandedLabel: localize('Hide details'),
				body: localize(
					'Expanded content should reveal supportive detail without changing the primary task hierarchy.',
				),
				badge: localize('Motion-safe'),
			},
			feedbackBanner: {
				label: localize('Alert / Banner preview'),
				title: localize('Sync service attention needed'),
				description: localize(
					'Keep the tone calm and actionable even when a service dependency is degraded.',
				),
				actionLabel: localize('Review queue'),
			},
			dialog: {
				title: localize('Publish checklist updates?'),
				message: localize(
					'Confirm the current workbench changes before they roll into the shared library surface.',
				),
				confirmLabel: localize('Publish'),
				cancelLabel: localize('Keep editing'),
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
		stateProof: {
			title: localize('State Proof Deck'),
			description: localize(
				'Representative loading, empty, error, read-only, denied, no-media, and ugly-data states should all preserve the same visual composure as the default path.',
			),
			loading: {
				title: localize('Loading proof'),
				description: localize(
					'Skeletons should stay structural, subtle, and motion-safe when reduced motion is enabled.',
				),
			},
			empty: {
				title: localize('Empty but still useful'),
				description: localize(
					'Even without illustration, the message, hierarchy, and one clear CTA should hold up.',
				),
				actionLabel: localize('Seed sample data'),
			},
			error: {
				title: localize('Calm error recovery'),
				description: localize(
					'The recovery path should be clear without relying on aggressive color or duplicated messaging.',
				),
				retryLabel: localize('Retry sync'),
				supportLabel: localize('Contact support'),
			},
			readOnly: {
				title: localize('Read-only quality'),
				description: localize(
					'Blocked editing should not collapse spacing, labels, or secondary context.',
				),
			},
			denied: {
				title: localize('Permission-denied quality'),
				description: localize(
					'Denied states should keep the same layout quality and hierarchy as the default state.',
				),
				actionLabel: localize('Request access'),
			},
			noMedia: {
				title: localize('No-media fallback'),
				description: localize(
					'Missing logo, avatar, or illustration should gracefully fall back to text-first composition.',
				),
			},
			uglyData: {
				title: localize('Ugly data stress'),
				description: localize(
					'Long names, null metadata, high values, and stale timestamps should still fit without hierarchy drift.',
				),
				metricLabel: localize('Exposure'),
				metaLabel: localize('Data anomalies'),
			},
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
			storyCount: (count) => localize(`${count} stories`),
			variantCount: (count) => localize(`${count} variants`),
			stateCount: (count) => localize(`${count} states`),
			propCount: (count) => localize(`${count} props`),
			tested: localize('Tested'),
			needsTests: localize('Needs tests'),
			liveDemo: localize('Live demo'),
			registryOnly: localize('Registry only'),
			summary: localize('Summary'),
			exampleStories: localize('Example stories'),
			variants: localize('Variants'),
			sizes: localize('Sizes'),
			states: localize('States'),
			composition: localize('Composition example'),
			relaxed: localize('Relaxed showcase'),
			operational: localize('Operational dense'),
			noMedia: localize('No-media proof'),
			props: localize('Prop table'),
			doLabel: localize('Do'),
			dontLabel: localize("Don't"),
			accessibility: localize('Accessibility notes'),
			platform: localize('Platform notes'),
			defaultValue: localize('Default'),
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
			pixelRatio: (value) => localize(`Pixel ratio: ${value.toFixed(2)}x`),
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
