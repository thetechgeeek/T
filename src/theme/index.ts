import type { TextStyle, ViewStyle } from 'react-native';

export interface ThemeColors {
	// Backgrounds
	background: string;
	surface: string;
	surfaceVariant: string;
	card: string;
	// Text
	onBackground: string;
	onSurface: string;
	onSurfaceVariant: string;
	placeholder: string;
	// Brand
	primary: string;
	primaryLight: string;
	primaryDark: string;
	onPrimary: string;
	primaryGradientStart: string;
	primaryGradientEnd: string;
	primaryContainer: string;
	onPrimaryContainer: string;
	secondary: string;
	onSecondary: string;
	// Semantic
	success: string;
	onSuccess: string;
	successLight: string;
	warning: string;
	onWarning: string;
	warningLight: string;
	error: string;
	onError: string;
	errorLight: string;
	info: string;
	onInfo: string;
	infoLight: string;
	// UI
	border: string;
	borderStrong: string;
	separator: string;
	overlay: string;
	scrim: string;
	white: string;
	shadow: string;
	// Tabs & Nav
	tabBar: string;
	tabActive: string;
	tabInactive: string;
	// Specific
	badge: string;
	paid: string;
	partial: string;
	unpaid: string;
	lowStock: string;
	overdue: string;
}

export type ThemeDensity = 'compact' | 'comfortable' | 'spacious';
export type ThemePresetId = 'tilemaster' | 'executive' | 'studio' | 'mono';

export interface ThemeMeta {
	presetId: ThemePresetId;
	presetLabel: string;
	density: ThemeDensity;
}

export interface PrintThemeSwatch {
	key: string;
	label: string;
	color: string;
}

export interface ExpenseReportDemoSlice {
	id: string;
	name: string;
	amount: number;
	color: string;
}

export interface ThemeCollections {
	partyAvatarColors: readonly string[];
	expenseCategoryPickColors: readonly string[];
	printThemeSwatches: readonly PrintThemeSwatch[];
	expenseReportDemoSlices: readonly ExpenseReportDemoSlice[];
	allTransactionsTypeColors: Readonly<Record<string, string>>;
}

export interface ThemeTypography {
	fontFamily: string;
	fontFamilyBold: string;
	sizes: {
		xs: number;
		sm: number;
		md: number;
		lg: number;
		xl: number;
		'2xl': number;
		'3xl': number;
	};
	weights: {
		regular: TextStyle['fontWeight'];
		medium: TextStyle['fontWeight'];
		semibold: TextStyle['fontWeight'];
		bold: TextStyle['fontWeight'];
	};
	lineHeights: {
		tight: number;
		normal: number;
		relaxed: number;
	};
	variants: {
		display: TextStyle;
		h1: TextStyle;
		h2: TextStyle;
		h3: TextStyle;
		body: TextStyle;
		bodyBold: TextStyle;
		caption: TextStyle;
		captionBold: TextStyle;
		amount: TextStyle;
		amountLarge: TextStyle;
		amountNegative: TextStyle;
		label: TextStyle;
		captionSmall: TextStyle;
	};
}

export interface ThemeSpacing {
	xxs: number; // 2
	xs: number; // 4
	sm: number; // 8
	md: number; // 12
	lg: number; // 16
	xl: number; // 24
	'2xl': number; // 32
	'3xl': number; // 48
	'4xl': number; // 64
}

export interface ThemeBorderRadius {
	none: number; // 0
	xs: number; // 2
	sm: number; // 4
	md: number; // 8
	lg: number; // 12
	xl: number; // 16
	full: number; // 9999
}

export interface ThemeBorderWidth {
	none: number;
	hairline: number;
	sm: number;
	md: number;
	lg: number;
}

export interface ThemeSemanticSpacing {
	screenPadding: number;
	sectionGap: number;
	cardPadding: number;
	itemGap: number;
	fieldGap: number;
	inlineGap: number;
	clusterGap: number;
}

export interface ThemeDensitySpacing {
	compact: ThemeSpacing;
	comfortable: ThemeSpacing;
	spacious: ThemeSpacing;
}

export interface ThemeLetterSpacing {
	tight: number;
	normal: number;
	wide: number;
	section: number;
	account: number;
}

export interface ThemeOpacity {
	pressed: number;
	disabled: number;
	inactive: number;
	subtle: number;
	soft: number;
	medium: number;
	strong: number;
	overlay: number;
	scrim: number;
}

export interface ThemeComponentTokens {
	button: {
		heights: {
			sm: number;
			md: number;
			lg: number;
		};
		paddingX: {
			sm: number;
			md: number;
			lg: number;
		};
		radius: number;
		outlineWidth: number;
		iconGap: number;
	};
	badge: {
		paddingX: {
			sm: number;
			md: number;
		};
		paddingY: {
			sm: number;
			md: number;
		};
		radius: number;
	};
	chip: {
		heights: {
			sm: number;
			md: number;
		};
		paddingX: {
			sm: number;
			md: number;
		};
		paddingY: {
			sm: number;
			md: number;
		};
		radius: number;
		gap: number;
	};
	card: {
		padding: {
			sm: number;
			md: number;
			lg: number;
		};
		radius: number;
	};
	input: {
		minHeight: number;
		radius: number;
		borderWidth: number;
		errorBorderWidth: number;
		paddingX: number;
		paddingY: number;
		labelGap: number;
		helperGap: number;
		iconGap: number;
	};
	searchBar: {
		height: number;
		radius: number;
		paddingX: number;
		iconGap: number;
		iconSize: number;
	};
	iconButton: {
		minSize: number;
		labelGap: number;
	};
	fab: {
		size: number;
		radius: number;
		iconSize: number;
	};
}

export interface Theme {
	isDark: boolean;
	meta: ThemeMeta;
	colors: ThemeColors;
	typography: ThemeTypography;
	spacing: ThemeSpacing;
	semanticSpacing: ThemeSemanticSpacing;
	densitySpacing: ThemeDensitySpacing;
	letterSpacing: ThemeLetterSpacing;
	borderRadius: ThemeBorderRadius;
	borderWidth: ThemeBorderWidth;
	shadows: {
		xs: ViewStyle;
		sm: ViewStyle;
		md: ViewStyle;
		lg: ViewStyle;
		xl: ViewStyle;
	};
	elevation: {
		flat: ViewStyle;
		raised: ViewStyle;
		overlay: ViewStyle;
		modal: ViewStyle;
		tooltip: ViewStyle;
	};
	animation: {
		durationInstant: number;
		durationMicro: number;
		durationFast: number;
		durationNormal: number;
		durationSlow: number;
		curves: {
			easeIn: readonly [number, number, number, number];
			easeOut: readonly [number, number, number, number];
			easeInOut: readonly [number, number, number, number];
			linear: readonly [number, number, number, number];
		};
		spring: {
			default: {
				damping: number;
				stiffness: number;
				mass: number;
			};
			press: {
				damping: number;
				stiffness: number;
				mass: number;
			};
			bounce: {
				damping: number;
				stiffness: number;
				mass: number;
			};
		};
		profiles: {
			buttonPress: {
				scalePressed: number;
				spring: {
					damping: number;
					stiffness: number;
					mass: number;
				};
			};
			cardPress: {
				scalePressed: number;
				opacityPressed: number;
				spring: {
					damping: number;
					stiffness: number;
					mass: number;
				};
			};
			listItemPress: {
				scalePressed: number;
				spring: {
					damping: number;
					stiffness: number;
					mass: number;
				};
			};
			bannerEnter: {
				duration: number;
				easing: 'easeOut';
				spring: {
					damping: number;
					stiffness: number;
					mass: number;
				};
			};
			shimmerLoop: {
				duration: number;
				easing: 'easeInOut';
				reverse: boolean;
			};
		};
	};
	opacity: ThemeOpacity;
	components: ThemeComponentTokens;
	collections: ThemeCollections;
	touchTarget: number; // minimum 48
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type BadgeVariant =
	| 'success'
	| 'warning'
	| 'danger'
	| 'info'
	| 'paid'
	| 'partial'
	| 'unpaid'
	| 'default';
