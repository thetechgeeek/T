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
		body1: TextStyle;
		body2: TextStyle;
		caption: TextStyle;
		overline: TextStyle;
		sectionLabel: TextStyle;
		label: TextStyle;
		button: TextStyle;
	};
}

export interface Theme {
	isDark: boolean;
	colors: ThemeColors;
	typography: ThemeTypography;
	spacing: {
		xs: number; // 4
		sm: number; // 8
		md: number; // 16
		lg: number; // 24
		xl: number; // 32
		'2xl': number; // 48
		'3xl': number; // 64
	};
	borderRadius: {
		sm: number; // 6
		md: number; // 12
		lg: number; // 20
		xl: number; // 28
		full: number; // 9999
	};
	shadows: {
		xs: ViewStyle;
		sm: ViewStyle;
		md: ViewStyle;
		lg: ViewStyle;
	};
	animation: {
		durationFast: number; // 150ms
		durationNormal: number; // 250ms
		durationSlow: number; // 400ms
		springDamping: number;
		springStiffness: number;
	};
	touchTarget: number; // minimum 48
}

export type ThemeMode = 'light' | 'dark' | 'system';
