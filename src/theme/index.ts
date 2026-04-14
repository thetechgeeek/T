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

export interface Theme {
	isDark: boolean;
	colors: ThemeColors;
	typography: ThemeTypography;
	spacing: {
		xxs: number; // 2
		xs: number; // 4
		sm: number; // 8
		md: number; // 12
		lg: number; // 16
		xl: number; // 24
		'2xl': number; // 32
		'3xl': number; // 48
		'4xl': number; // 64
	};
	borderRadius: {
		none: number; // 0
		xs: number; // 2
		sm: number; // 4
		md: number; // 8
		lg: number; // 12
		xl: number; // 16
		full: number; // 9999
	};
	shadows: {
		xs: ViewStyle;
		sm: ViewStyle;
		md: ViewStyle;
		lg: ViewStyle;
	};
	animation: {
		durationFast: number;
		durationNormal: number;
		durationSlow: number;
		springDamping: number;
		springStiffness: number;
	};
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
