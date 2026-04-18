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
			counterField: string;
			counterFieldHelper: string;
			asyncField: string;
			asyncFieldHelper: string;
			disabledField: string;
			emailField: string;
			numericField: string;
			phoneKeyboardField: string;
			urlField: string;
			decimalField: string;
			passwordField: string;
			passwordFieldHelper: string;
			searchPlaceholder: string;
			searchDebouncedLabel: string;
			searchDebouncedIdle: string;
			phoneInput: string;
			amountInput: string;
			datePicker: string;
			textarea: string;
			errorField: string;
			errorFieldError: string;
		};
		selectionControls: {
			checkbox: string;
			checkboxDescription: string;
			checkboxIndeterminate: string;
			checkboxIndeterminateDescription: string;
			checkboxDisabled: string;
			checkboxGroup: string;
			checkboxGroupDescription: string;
			checkboxOptions: ReadonlyArray<{ label: string; value: string }>;
			radio: string;
			radioDisabled: string;
			radioGroup: string;
			radioGroupDescription: string;
			radioOptions: ReadonlyArray<{ label: string; value: string }>;
			toggle: string;
			toggleDescription: string;
			toggleBareLabel: string;
			toggleDisabled: string;
			toggleDisabledDescription: string;
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
		advanced: {
			timePicker: string;
			dateRangePicker: string;
			autocomplete: string;
			tokenInput: string;
			fileUpload: string;
			rangeSlider: string;
			numericStepper: string;
			otp: string;
			colorPicker: string;
			segmentedControl: string;
			toggleGroup: string;
			splitButton: string;
			actionSheet: string;
			fabLabel: string;
			progressUpload: string;
			progressRefresh: string;
			progressCoverage: string;
			progressExport: string;
			errorRetry: string;
			toastQueueSuccess: string;
			toastQueueWarning: string;
			toastQueueError: string;
			toastSuccessMessage: string;
			toastWarningMessage: string;
			toastWarningAction: string;
			toastErrorMessage: string;
			toastDismiss: string;
			stepperReturnPrefix: string;
			autocompleteOptions: ReadonlyArray<{ label: string; value: string }>;
			toggleOptions: ReadonlyArray<{ label: string; value: string }>;
			actionMenuItems: ReadonlyArray<{
				label: string;
				value: string;
				destructive?: boolean;
			}>;
			tabOptions: ReadonlyArray<{ label: string; value: string; badgeCount?: number }>;
			stepperSteps: ReadonlyArray<{
				label: string;
				value: string;
				state: 'completed' | 'active' | 'upcoming';
				description: string;
			}>;
			notificationItems: ReadonlyArray<{
				id: string;
				title: string;
				category: string;
				read: boolean;
			}>;
		};
		dataDisplay: {
			sectionTitle: string;
			sectionDescription: string;
			cardHeader: string;
			cardFooterPrimary: string;
			cardFooterSecondary: string;
			cardHeroTitle: string;
			cardHeroDescription: string;
			cardHorizontalTitle: string;
			cardHorizontalDescription: string;
			listTitle: string;
			listDescription: string;
			listSelectionLabel: string;
			listEmptyTitle: string;
			listEmptyDescription: string;
			listSections: ReadonlyArray<string>;
			listItems: ReadonlyArray<{
				id: string;
				title: string;
				subtitle: string;
				status: string;
			}>;
			timelineTitle: string;
			timelineDescription: string;
			timelineLoadMore: string;
			timelineNewItems: string;
			timelineItems: ReadonlyArray<{
				id: string;
				title: string;
				description: string;
				timeLabel: string;
				dateLabel: string;
				statusLabel?: string;
			}>;
			timelinePendingItems: ReadonlyArray<{
				id: string;
				title: string;
				description: string;
				timeLabel: string;
				dateLabel: string;
				statusLabel?: string;
			}>;
			avatarsTitle: string;
			avatarsDescription: string;
			avatarItems: ReadonlyArray<{
				id: string;
				name: string;
				status?: 'online' | 'busy' | 'offline' | 'warning';
			}>;
			keyValueTitle: string;
			keyValueDescription: string;
			keyValueItems: ReadonlyArray<{
				id: string;
				label: string;
				value: string;
				copyable?: boolean;
				sensitive?: boolean;
				maskedValue?: string;
			}>;
			chartsTitle: string;
			chartsDescription: string;
			chartCategories: ReadonlyArray<string>;
			chartSeries: ReadonlyArray<{
				id: string;
				label: string;
				values: ReadonlyArray<number>;
			}>;
			chartSlices: ReadonlyArray<{
				id: string;
				label: string;
				value: number;
			}>;
			chartPoints: ReadonlyArray<{
				id: string;
				x: number;
				y: number;
				seriesId?: string;
			}>;
			chartHeatmap: ReadonlyArray<{
				row: string;
				column: string;
				value: number;
			}>;
			chartAnnotations: ReadonlyArray<{
				label: string;
				value: number;
			}>;
			swipeTitle: string;
			swipeDescription: string;
			mediaTitle: string;
			mediaDescription: string;
			mediaOpen: string;
			mediaItems: ReadonlyArray<{
				id: string;
				uri?: string;
				thumbnailUri?: string;
				alt: string;
				caption?: string;
			}>;
			boardTitle: string;
			boardDescription: string;
			boardColumns: ReadonlyArray<{
				id: string;
				title: string;
				wipLimit?: number;
				items: ReadonlyArray<{
					id: string;
					title: string;
					description?: string;
					statusLabel?: string;
				}>;
			}>;
			statUpdatedAt: string;
			statComparisonBaseline: string;
			statErrorMessage: string;
		};
		overlays: {
			sectionTitle: string;
			sectionDescription: string;
			sizeSmall: string;
			sizeMedium: string;
			sizeLarge: string;
			hardConfirmation: string;
			hardConfirmationTitle: string;
			hardConfirmationMessage: string;
			hardConfirmationKeyword: string;
			hardConfirmationLabel: string;
			hardConfirmationHelper: string;
			tooltipTitle: string;
			tooltipDescription: string;
			tooltipTrigger: string;
			tooltipContent: string;
			popoverTitle: string;
			popoverDescription: string;
			popoverTrigger: string;
			popoverFieldLabel: string;
			popoverFieldHelper: string;
			popoverAction: string;
			popoverSaved: string;
			contextMenuTitle: string;
			contextMenuDescription: string;
			contextMenuTriggerTitle: string;
			contextMenuTriggerDescription: string;
			contextActionPrefix: string;
			nativeAlertButton: string;
			nativeAlertTitle: string;
			nativeAlertMessage: string;
			nativeAlertConfirm: string;
			nativeAlertCancel: string;
			nativeAlertConfirmed: string;
			nativeAlertCancelled: string;
		};
		forms: {
			sectionTitle: string;
			sectionDescription: string;
			relaxedTitle: string;
			relaxedDescription: string;
			relaxedSubmitLabel: string;
			relaxedSuccessMessage: string;
			draftSaving: string;
			draftSaved: string;
			draftError: string;
			draftRetry: string;
			conflictTitle: string;
			conflictDescription: string;
			conflictAction: string;
			projectNameLabel: string;
			projectNameHelper: string;
			projectNameRequired: string;
			longApprovalLabel: string;
			longApprovalHelper: string;
			longApprovalWarning: string;
			approverEmailLabel: string;
			approverEmailHelper: string;
			approverEmailRequired: string;
			approverEmailPattern: string;
			approverEmailAsyncTaken: string;
			approverEmailAsyncAvailable: string;
			reviewerToggleLabel: string;
			reviewerToggleDescription: string;
			reviewerNotesLabel: string;
			reviewerNotesHelper: string;
			accessLockedLabel: string;
			accessLockedHint: string;
			serverFieldLabel: string;
			serverFieldHelper: string;
			serverFieldServerError: string;
			readOnlyTitle: string;
			readOnlyDescription: string;
			readOnlyProjectValue: string;
			readOnlyOwnerValue: string;
			readOnlyNotesValue: string;
			toggleEnabledValue: string;
			toggleDisabledValue: string;
			wizardTitle: string;
			wizardDescription: string;
			wizardBackLabel: string;
			wizardNextLabel: string;
			wizardFinishLabel: string;
			wizardSuccessMessage: string;
			wizardStepScopeLabel: string;
			wizardStepScopeDescription: string;
			wizardStepReviewLabel: string;
			wizardStepReviewDescription: string;
			wizardStepConfirmLabel: string;
			wizardStepConfirmDescription: string;
			wizardTeamNameLabel: string;
			wizardTeamNameRequired: string;
			wizardOwnerEmailLabel: string;
			wizardOwnerEmailRequired: string;
			wizardOwnerEmailPattern: string;
			wizardApprovalCodeLabel: string;
			wizardApprovalCodeHelper: string;
			wizardApprovalCodeRequired: string;
			wizardSummaryToggleLabel: string;
			wizardSummaryToggleDescription: string;
			wizardNotesLabel: string;
			wizardNotesHelper: string;
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
				counterField: localize('Project Summary'),
				counterFieldHelper: localize('Clearable field with character count'),
				asyncField: localize('Team Slug'),
				asyncFieldHelper: localize('Checking availability before provisioning'),
				disabledField: localize('Locked Field'),
				emailField: localize('Email Autofill'),
				numericField: localize('Numeric Keyboard'),
				phoneKeyboardField: localize('Phone Keyboard'),
				urlField: localize('URL Keyboard'),
				decimalField: localize('Decimal Keyboard'),
				passwordField: localize('Password Field'),
				passwordFieldHelper: localize('Secure entry with autofill hints'),
				searchPlaceholder: localize('Search input preview'),
				searchDebouncedLabel: localize('Debounced query'),
				searchDebouncedIdle: localize('Waiting for pause in typing'),
				phoneInput: localize('Phone Input'),
				amountInput: localize('Amount Input'),
				datePicker: localize('Date Picker'),
				textarea: localize('Textarea'),
				errorField: localize('Approval Email'),
				errorFieldError: localize('Enter a valid approver email before continuing'),
			},
			selectionControls: {
				checkbox: localize('Email summary'),
				checkboxDescription: localize(
					'Send a daily digest when approvals are waiting for review.',
				),
				checkboxIndeterminate: localize('Apply policy to invoices'),
				checkboxIndeterminateDescription: localize(
					'Some invoices already follow this rule, but not all of them.',
				),
				checkboxDisabled: localize('Lock after export'),
				checkboxGroup: localize('Delivery channels'),
				checkboxGroupDescription: localize(
					'Choose every channel that should receive approval escalations.',
				),
				checkboxOptions: [
					{ label: 'Email', value: 'email' },
					{ label: 'SMS', value: 'sms' },
					{ label: 'WhatsApp', value: 'whatsapp' },
				].map((option) => localizeOption(localize, option)),
				radio: localize('Weekly summary'),
				radioDisabled: localize('Monthly summary'),
				radioGroup: localize('Digest cadence'),
				radioGroupDescription: localize(
					'Pick exactly one delivery frequency for the approval digest.',
				),
				radioOptions: [
					{ label: 'Daily', value: 'daily' },
					{ label: 'Weekly', value: 'weekly' },
					{ label: 'Monthly', value: 'monthly' },
				].map((option) => localizeOption(localize, option)),
				toggle: localize('Auto reminders'),
				toggleDescription: localize(
					'Send a reminder every morning until the blocker is resolved.',
				),
				toggleBareLabel: localize('Enable approval rule'),
				toggleDisabled: localize('Freeze archived periods'),
				toggleDisabledDescription: localize(
					'This setting is managed centrally and cannot be changed here.',
				),
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
			advanced: {
				timePicker: localize('Escalation time'),
				dateRangePicker: localize('Reporting range'),
				autocomplete: localize('Approver team'),
				tokenInput: localize('Routing tags'),
				fileUpload: localize('Attachments'),
				rangeSlider: localize('Discount threshold'),
				numericStepper: localize('Reminder cadence'),
				otp: localize('Verification code'),
				colorPicker: localize('Accent color'),
				segmentedControl: localize('Canvas mode'),
				toggleGroup: localize('Visible views'),
				splitButton: localize('Save'),
				actionSheet: localize('Secondary actions'),
				fabLabel: localize('Create new record'),
				progressUpload: localize('Upload progress'),
				progressRefresh: localize('Refreshing queue'),
				progressCoverage: localize('Checklist coverage'),
				progressExport: localize('Preparing export'),
				errorRetry: localize('Retry import'),
				toastQueueSuccess: localize('Queue success toast'),
				toastQueueWarning: localize('Queue warning toast'),
				toastQueueError: localize('Queue error toast'),
				toastSuccessMessage: localize('Saved to approval queue'),
				toastWarningMessage: localize('Review required before publish'),
				toastWarningAction: localize('Review'),
				toastErrorMessage: localize('Upload failed'),
				toastDismiss: localize('Close'),
				stepperReturnPrefix: localize('Returned to '),
				autocompleteOptions: [
					{ label: 'Finance', value: 'finance' },
					{ label: 'Operations', value: 'operations' },
					{ label: 'People Ops', value: 'people-ops' },
				].map((option) => localizeOption(localize, option)),
				toggleOptions: [
					{ label: 'List', value: 'list' },
					{ label: 'Board', value: 'board' },
					{ label: 'Calendar', value: 'calendar' },
				].map((option) => localizeOption(localize, option)),
				actionMenuItems: [
					{ label: 'Save as draft', value: 'draft' },
					{ label: 'Share for review', value: 'share' },
					{ label: 'Delete record', value: 'delete', destructive: true },
				].map((item) => ({ ...item, label: localize(item.label) })),
				tabOptions: [
					{ label: 'Overview', value: 'overview', badgeCount: 3 },
					{ label: 'Approvals', value: 'approvals' },
					{ label: 'Files', value: 'files' },
				].map((item) => ({ ...item, label: localize(item.label) })),
				stepperSteps: [
					{
						label: 'Details',
						value: 'details',
						state: 'completed' as const,
						description: 'Complete',
					},
					{
						label: 'Review',
						value: 'review',
						state: 'active' as const,
						description: 'Needs approval',
					},
					{
						label: 'Archive',
						value: 'archive',
						state: 'upcoming' as const,
						description: 'Pending',
					},
				].map((item) => ({
					...item,
					label: localize(item.label),
					description: localize(item.description),
				})),
				notificationItems: [
					{
						id: 'notif-1',
						title: 'Low-stock alert acknowledged',
						category: 'System',
						read: false,
					},
					{
						id: 'notif-2',
						title: 'Approval request assigned',
						category: 'Mentions',
						read: false,
					},
					{
						id: 'notif-3',
						title: 'Payment reminder sent',
						category: 'Updates',
						read: true,
					},
				].map((item) => ({
					...item,
					title: localize(item.title),
					category: localize(item.category),
				})),
			},
			dataDisplay: {
				sectionTitle: localize('Data Display'),
				sectionDescription: localize(
					'Prove list, metric, chart, media, and board surfaces with the same calm enterprise grammar across dense and relaxed states.',
				),
				cardHeader: localize('Revenue summary'),
				cardFooterPrimary: localize('Open report'),
				cardFooterSecondary: localize('Share snapshot'),
				cardHeroTitle: localize('Quarterly margin overview'),
				cardHeroDescription: localize(
					'Featured cards should use restrained emphasis, not louder chrome.',
				),
				cardHorizontalTitle: localize('Inventory watchlist'),
				cardHorizontalDescription: localize(
					'Horizontal cards keep media secondary while preserving text-first scanability.',
				),
				listTitle: localize('Virtualized operational list'),
				listDescription: localize(
					'Selectable rows, skeletons, section headers, and empty handling all live in the shared list shell.',
				),
				listSelectionLabel: localize('Select row'),
				listEmptyTitle: localize('No operational records'),
				listEmptyDescription: localize(
					'The empty state should explain what to do next instead of leaving a blank canvas.',
				),
				listSections: [localize('Active queue'), localize('Recently archived')],
				listItems: [
					{
						id: 'list-1',
						title: 'Approval block on supplier invoice',
						subtitle: 'Needs finance review before dispatch',
						status: 'Blocked',
					},
					{
						id: 'list-2',
						title: 'Export pack ready for warehouse',
						subtitle: 'Label print and manifest both complete',
						status: 'Ready',
					},
					{
						id: 'list-3',
						title: 'Route assignment updated',
						subtitle: 'Carrier and dock time re-confirmed',
						status: 'Updated',
					},
				].map((item) => ({
					...item,
					title: localize(item.title),
					subtitle: localize(item.subtitle),
					status: localize(item.status),
				})),
				timelineTitle: localize('Activity feed'),
				timelineDescription: localize(
					'Timelines need clear date separators, load-more behavior, and calm real-time injection.',
				),
				timelineLoadMore: localize('Load older events'),
				timelineNewItems: localize('Show new activity'),
				timelineItems: [
					{
						id: 'timeline-1',
						title: 'Shipment approved',
						description: 'Operations confirmed dispatch after documentation review.',
						timeLabel: '09:12',
						dateLabel: 'Today',
						statusLabel: 'Approved',
					},
					{
						id: 'timeline-2',
						title: 'Margin threshold crossed',
						description: 'The planned discount now exceeds the alert baseline.',
						timeLabel: '08:40',
						dateLabel: 'Today',
						statusLabel: 'Review',
					},
					{
						id: 'timeline-3',
						title: 'Vendor contract renewed',
						description: 'Commercial terms were updated for the next quarter.',
						timeLabel: '17:25',
						dateLabel: 'Yesterday',
					},
				].map((item) => ({
					...item,
					title: localize(item.title),
					description: localize(item.description),
					dateLabel: localize(item.dateLabel),
					statusLabel: item.statusLabel ? localize(item.statusLabel) : undefined,
				})),
				timelinePendingItems: [
					{
						id: 'timeline-pending-1',
						title: 'New note from finance',
						description: 'A fresh comment was attached to the approval trail.',
						timeLabel: '09:19',
						dateLabel: 'Today',
						statusLabel: 'New',
					},
				].map((item) => ({
					...item,
					title: localize(item.title),
					description: localize(item.description),
					dateLabel: localize(item.dateLabel),
					statusLabel: item.statusLabel ? localize(item.statusLabel) : undefined,
				})),
				avatarsTitle: localize('Avatar and overflow group'),
				avatarsDescription: localize(
					'Avatar groups should handle missing media gracefully and let hidden members expand on tap.',
				),
				avatarItems: [
					{ id: 'avatar-1', name: 'Aarav Mehta', status: 'online' as const },
					{ id: 'avatar-2', name: 'Nisha Rao', status: 'busy' as const },
					{ id: 'avatar-3', name: 'Priya Shah', status: 'offline' as const },
					{ id: 'avatar-4', name: 'Rohan Verma', status: 'warning' as const },
				].map((item) => ({ ...item, name: localize(item.name) })),
				keyValueTitle: localize('Description list'),
				keyValueDescription: localize(
					'Copyable values and sensitive reveal states should stay quiet and readable.',
				),
				keyValueItems: [
					{ id: 'desc-1', label: 'Customer ID', value: 'CUS-2048', copyable: true },
					{
						id: 'desc-2',
						label: 'Primary contact',
						value: 'accounts@northyard.example',
						copyable: true,
					},
					{
						id: 'desc-3',
						label: 'Bank reference',
						value: '9981 5510 0048',
						sensitive: true,
						maskedValue: '•••• •••• 0048',
						copyable: true,
					},
				].map((item) => ({
					...item,
					label: localize(item.label),
					value: localize(item.value),
					maskedValue: item.maskedValue ? localize(item.maskedValue) : undefined,
				})),
				chartsTitle: localize('Chart suite'),
				chartsDescription: localize(
					'Charts use the shared qualitative palette, quiet scaffolding, and focused-series emphasis instead of decorative noise.',
				),
				chartCategories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((label) =>
					localize(label),
				),
				chartSeries: [
					// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- representative chart fixture values for the workbench.
					{ id: 'series-primary', label: 'Primary', values: [42, 48, 51, 46, 58] },
					// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- representative comparison values for the workbench.
					{ id: 'series-compare', label: 'Comparison', values: [36, 39, 44, 41, 47] },
				].map((series) => ({ ...series, label: localize(series.label) })),
				chartSlices: [
					// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- slice sizes are illustrative preview data.
					{ id: 'slice-ops', label: 'Operations', value: 42 },
					{ id: 'slice-finance', label: 'Finance', value: 28 },
					{ id: 'slice-sales', label: 'Sales', value: 18 },
					{ id: 'slice-support', label: 'Support', value: 12 },
				].map((slice) => ({ ...slice, label: localize(slice.label) })),
				chartPoints: [
					{ id: 'point-1', x: 1, y: 12, seriesId: 'series-primary' },
					{ id: 'point-2', x: 2, y: 18, seriesId: 'series-primary' },
					{ id: 'point-3', x: 3, y: 16, seriesId: 'series-compare' },
					{ id: 'point-4', x: 4, y: 21, seriesId: 'series-compare' },
				],
				chartHeatmap: [
					{ row: 'North', column: 'Mon', value: 12 },
					{ row: 'North', column: 'Tue', value: 18 },
					{ row: 'South', column: 'Mon', value: 9 },
					{ row: 'South', column: 'Tue', value: 16 },
					{ row: 'West', column: 'Mon', value: 14 },
					{ row: 'West', column: 'Tue', value: 20 },
				].map((cell) => ({
					...cell,
					row: localize(cell.row),
					column: localize(cell.column),
				})),
				chartAnnotations: [
					{ label: 'Target', value: 50 },
					// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- threshold marker is an intentional fixture.
					{ label: 'Alert threshold', value: 38 },
				].map((annotation) => ({ ...annotation, label: localize(annotation.label) })),
				swipeTitle: localize('Swipe actions'),
				swipeDescription: localize(
					'Swipeable rows should reveal archive and delete actions without making gestures the only path.',
				),
				mediaTitle: localize('Media viewer'),
				mediaDescription: localize(
					'Media surfaces must work with progressive loading and degrade to text-first fallback when imagery is unavailable.',
				),
				mediaOpen: localize('Open media viewer'),
				mediaItems: [
					{
						id: 'media-1',
						uri: 'https://picsum.photos/id/1062/1200/800',
						thumbnailUri: 'https://picsum.photos/id/1062/320/220',
						alt: 'Warehouse detail view',
						caption: 'High-resolution photo with a smaller preview image.',
					},
					{
						id: 'media-2',
						uri: 'https://picsum.photos/id/1025/1200/800',
						thumbnailUri: 'https://picsum.photos/id/1025/320/220',
						alt: 'Field installation',
						caption: 'Swipe horizontally between gallery items.',
					},
					{
						id: 'media-3',
						alt: 'Fallback media note',
						caption: 'Missing imagery should fall back to a text-first explanation.',
					},
				].map((item) => ({
					...item,
					alt: localize(item.alt),
					caption: item.caption ? localize(item.caption) : undefined,
				})),
				boardTitle: localize('Kanban board'),
				boardDescription: localize(
					'Boards stay horizontally scrollable while each column keeps drag-reorder and explicit WIP cues.',
				),
				boardColumns: [
					{
						id: 'board-todo',
						title: 'Queued',
						wipLimit: 3,
						items: [
							{
								id: 'card-1',
								title: 'Confirm vendor SLA',
								description: 'Commercial team review pending.',
								statusLabel: 'Queued',
							},
							{
								id: 'card-2',
								title: 'Prepare dispatch sheet',
								description: 'Waiting on logistics attachments.',
								statusLabel: 'Ready',
							},
						],
					},
					{
						id: 'board-progress',
						title: 'In progress',
						wipLimit: 2,
						items: [
							{
								id: 'card-3',
								title: 'Resolve packaging variance',
								description: 'Operations and QA are aligned on next steps.',
								statusLabel: 'Active',
							},
						],
					},
					{
						id: 'board-done',
						title: 'Done',
						items: [
							{
								id: 'card-4',
								title: 'Update approval matrix',
								description: 'Access model is ready for rollout.',
								statusLabel: 'Done',
							},
						],
					},
				].map((column) => ({
					...column,
					title: localize(column.title),
					items: column.items.map((item) => ({
						...item,
						title: localize(item.title),
						description: item.description ? localize(item.description) : undefined,
						statusLabel: item.statusLabel ? localize(item.statusLabel) : undefined,
					})),
				})),
				statUpdatedAt: localize('Updated 12 minutes ago'),
				statComparisonBaseline: localize('Compared with the trailing 7-day baseline'),
				statErrorMessage: localize('Live warehouse feed delayed'),
			},
			overlays: {
				sectionTitle: localize('Overlays'),
				sectionDescription: localize(
					'Validate dialogs, sheets, tooltips, popovers, and native alerts with the same focus discipline and restrained hierarchy as the rest of the library.',
				),
				sizeSmall: localize('Open small dialog'),
				sizeMedium: localize('Open medium dialog'),
				sizeLarge: localize('Open large dialog'),
				hardConfirmation: localize('Open hard confirmation'),
				hardConfirmationTitle: localize('Publish shared changes?'),
				hardConfirmationMessage: localize(
					'This pushes the updated overlay contract into the shared design-system surface for downstream adoption.',
				),
				hardConfirmationKeyword: localize('PUBLISH'),
				hardConfirmationLabel: localize('Type to confirm'),
				hardConfirmationHelper: localize(
					'Type PUBLISH exactly before the primary action becomes available.',
				),
				tooltipTitle: localize('Tooltip'),
				tooltipDescription: localize(
					'Tooltips stay short, non-interactive, and long-press friendly on touch surfaces.',
				),
				tooltipTrigger: localize('Hold for support note'),
				tooltipContent: localize(
					'This action only applies the shared overlay tokens and never stores product data.',
				),
				popoverTitle: localize('Popover'),
				popoverDescription: localize(
					'Popovers support anchored interactive content without stealing the visual hierarchy from the parent surface.',
				),
				popoverTrigger: localize('Open quick editor'),
				popoverFieldLabel: localize('Review note'),
				popoverFieldHelper: localize(
					'Short inline edits should stay inside the anchored surface.',
				),
				popoverAction: localize('Save quick edit'),
				popoverSaved: localize('Quick edit saved'),
				contextMenuTitle: localize('Context menu'),
				contextMenuDescription: localize(
					'Long-press should open a haptic-backed menu anchored to the invoking surface.',
				),
				contextMenuTriggerTitle: localize('Hold for row actions'),
				contextMenuTriggerDescription: localize(
					'Share, duplicate, or delete the item from the anchored action menu.',
				),
				contextActionPrefix: localize('Ran'),
				nativeAlertButton: localize('Open native alert'),
				nativeAlertTitle: localize('Escalate this handoff?'),
				nativeAlertMessage: localize(
					'Use the OS-native alert for simple confirmations that do not need custom layout.',
				),
				nativeAlertConfirm: localize('Escalate'),
				nativeAlertCancel: localize('Not now'),
				nativeAlertConfirmed: localize('Native alert confirmed'),
				nativeAlertCancelled: localize('Native alert cancelled'),
			},
			forms: {
				sectionTitle: localize('Forms & validation'),
				sectionDescription: localize(
					'Exercise declarative form flows, async validation, draft autosave, read-only rendering, and step-by-step validation with mobile-safe keyboard behavior.',
				),
				relaxedTitle: localize('Relaxed onboarding form'),
				relaxedDescription: localize(
					'This schema-backed form proves warnings, helper copy, conditional fields, autosave, server errors, and access-aware disabled fields in a spacious layout.',
				),
				relaxedSubmitLabel: localize('Submit onboarding form'),
				relaxedSuccessMessage: localize('Declarative form submitted successfully'),
				draftSaving: localize('Saving…'),
				draftSaved: localize('Saved'),
				draftError: localize('Save failed — retry'),
				draftRetry: localize('Retry save'),
				conflictTitle: localize('Draft conflict detected'),
				conflictDescription: localize(
					'This draft was reopened after a newer revision landed, so the system keeps the conflict visible before submission.',
				),
				conflictAction: localize('Review latest revision'),
				projectNameLabel: localize('Project name'),
				projectNameHelper: localize(
					'Use a concise rollout name that still makes sense when the form is read-only.',
				),
				projectNameRequired: localize(
					'Project name is required before autosave can continue.',
				),
				longApprovalLabel: localize(
					'Approval routing description for teams with legal, procurement, finance, and regional operations stakeholders',
				),
				longApprovalHelper: localize(
					'Long labels, helper text, and warning copy should wrap cleanly without collapsing the field rhythm or footer alignment.',
				),
				longApprovalWarning: localize(
					'Keep this routing note short enough for approvers to scan in dense review queues.',
				),
				approverEmailLabel: localize('Approver email'),
				approverEmailHelper: localize(
					'Format feedback happens on change, while required and pattern rules wait for blur.',
				),
				approverEmailRequired: localize('Approver email is required.'),
				approverEmailPattern: localize('Enter a valid email address.'),
				approverEmailAsyncTaken: localize(
					'That email is already assigned to another approval lane.',
				),
				approverEmailAsyncAvailable: localize('Approval lane is available.'),
				reviewerToggleLabel: localize('Require manual reviewer notes'),
				reviewerToggleDescription: localize(
					'Toggling this on reveals a conditional notes field for escalated approvals.',
				),
				reviewerNotesLabel: localize('Manual review notes'),
				reviewerNotesHelper: localize(
					'Only appears when manual review is enabled, proving conditional schema rendering.',
				),
				accessLockedLabel: localize('Cost center override'),
				accessLockedHint: localize(
					'Locked because only Finance Admins can change this override after submission.',
				),
				serverFieldLabel: localize('Submission code'),
				serverFieldHelper: localize(
					'The backend can reject this field after submit and inject the returned message back into the form.',
				),
				serverFieldServerError: localize(
					'Server rejected the submission code. Use a project-specific code instead.',
				),
				readOnlyTitle: localize('Read-only form mode'),
				readOnlyDescription: localize(
					'Read-only mode uses plain text surfaces instead of disabled inputs so review screens stay calm and legible.',
				),
				readOnlyProjectValue: localize('Northwind rollout'),
				readOnlyOwnerValue: localize('ops.lead@example.com'),
				readOnlyNotesValue: localize(
					'Shared review lane with manual notes enabled for legal and procurement.',
				),
				toggleEnabledValue: localize('Enabled'),
				toggleDisabledValue: localize('Disabled'),
				wizardTitle: localize('Wizard form'),
				wizardDescription: localize(
					'The wizard validates one step at a time and allows users to jump back to completed steps without re-entering data.',
				),
				wizardBackLabel: localize('Back'),
				wizardNextLabel: localize('Next step'),
				wizardFinishLabel: localize('Finish setup'),
				wizardSuccessMessage: localize('Wizard form completed successfully'),
				wizardStepScopeLabel: localize('Scope'),
				wizardStepScopeDescription: localize(
					'Capture the operating team and primary owner for the workflow.',
				),
				wizardStepReviewLabel: localize('Review flow'),
				wizardStepReviewDescription: localize(
					'Collect approval routing details before the final summary step.',
				),
				wizardStepConfirmLabel: localize('Confirm'),
				wizardStepConfirmDescription: localize(
					'Confirm that the summary will be included when the workflow launches.',
				),
				wizardTeamNameLabel: localize('Owning team'),
				wizardTeamNameRequired: localize('Owning team is required.'),
				wizardOwnerEmailLabel: localize('Workflow owner email'),
				wizardOwnerEmailRequired: localize('Workflow owner email is required.'),
				wizardOwnerEmailPattern: localize('Enter a valid workflow owner email.'),
				wizardApprovalCodeLabel: localize('Approval code'),
				wizardApprovalCodeHelper: localize(
					'This field proves per-step validation before the wizard advances.',
				),
				wizardApprovalCodeRequired: localize(
					'Approval code is required before continuing.',
				),
				wizardSummaryToggleLabel: localize('Include executive summary'),
				wizardSummaryToggleDescription: localize(
					'Completed steps stay clickable so reviewers can jump back and edit earlier answers.',
				),
				wizardNotesLabel: localize('Launch notes'),
				wizardNotesHelper: localize(
					'Optional notes stay within the same declarative field schema as the rest of the wizard.',
				),
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
				'Browse the generated design-system registry here, then use the interactive preview sections above to play with the components.',
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
