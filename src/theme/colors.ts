import type { Theme, ThemeColors } from './index';
import { Platform } from 'react-native';

// ─── Terracotta / Rust-themed color palette for ceramics/tiles domain ───

const LIGHT_COLORS: ThemeColors = {
	// Backgrounds
	background: '#F5F0EB', // roadmap light background
	surface: '#FFFFFF',
	surfaceVariant: '#E5DDD5', // using border color for variant
	card: '#FFFFFF',
	// Text
	onBackground: '#1A1412',
	onSurface: '#1A1412',
	onSurfaceVariant: '#6B5E52', // roadmap secondary text
	placeholder: '#A89B94',
	// Brand: terracotta / rust
	primary: '#C1440E', // roadmap light primary
	primaryLight: '#E8622A',
	primaryDark: '#8B2F07',
	onPrimary: '#FFFFFF',
	primaryGradientStart: '#C1440E',
	primaryGradientEnd: '#8B2F07',
	primaryContainer: '#FCE7DF',
	onPrimaryContainer: '#2D0D00',
	secondary: '#6B5E52',
	onSecondary: '#FFFFFF',
	// Semantic
	success: '#1A8754', // roadmap success green
	onSuccess: '#FFFFFF',
	successLight: '#D1FAE5', // roadmap paid tint
	warning: '#B45309', // roadmap warning amber
	onWarning: '#FFFFFF',
	warningLight: '#FEF3C7', // roadmap partial tint
	error: '#B91C1C', // roadmap error red
	onError: '#FFFFFF',
	errorLight: '#FEE2E2', // roadmap unpaid/overdue tint
	info: '#1D4ED8', // roadmap info blue
	onInfo: '#FFFFFF',
	infoLight: '#DBEAFE',
	// UI
	border: '#E5DDD5', // roadmap border
	borderStrong: '#B0A49C',
	separator: '#EDE8E4',
	overlay: 'rgba(0,0,0,0.4)',
	scrim: 'rgba(0,0,0,0.6)',
	// Tabs
	tabBar: '#FFFFFF',
	tabActive: '#C1440E',
	tabInactive: '#6B5E52',
	// Specific (P0.3 roadmap)
	badge: '#C1440E',
	paid: '#065F46',
	partial: '#92400E',
	unpaid: '#991B1B',
	lowStock: '#B91C1C',
	overdue: '#7F1D1D',
};

const DARK_COLORS: ThemeColors = {
	// Backgrounds
	background: '#000000', // roadmap dark background
	surface: '#1C1C1E', // roadmap surface/card
	surfaceVariant: '#38383A', // roadmap border
	card: '#1C1C1E',
	// Text
	onBackground: '#F2EDE8',
	onSurface: '#F2EDE8',
	onSurfaceVariant: '#98989E', // roadmap secondary text
	placeholder: '#7A6E68',
	// Brand: darkened terracotta
	primary: '#E8622A', // roadmap dark primary
	primaryLight: '#FF8A60',
	primaryDark: '#C1440E',
	onPrimary: '#1A0A00',
	primaryGradientStart: '#E8622A',
	primaryGradientEnd: '#C1440E',
	primaryContainer: '#451A03',
	onPrimaryContainer: '#FFDBCF',
	secondary: '#98989E',
	onSecondary: '#000000',
	// Semantic
	success: '#2DB87A', // roadmap dark success
	onSuccess: '#000000',
	successLight: '#064E3B',
	warning: '#F59E0B', // roadmap dark warning
	onWarning: '#000000',
	warningLight: '#451A03',
	error: '#EF4444', // roadmap dark error
	onError: '#000000',
	errorLight: '#450A0A',
	info: '#60A5FA', // roadmap dark info
	onInfo: '#000000',
	infoLight: '#1E3A8A',
	// UI
	border: '#38383A', // roadmap dark border
	borderStrong: '#5D4838',
	separator: '#302820',
	overlay: 'rgba(0,0,0,0.6)',
	scrim: 'rgba(0,0,0,0.8)',
	// Tabs
	tabBar: '#1C1C1E',
	tabActive: '#E8622A',
	tabInactive: '#98989E',
	// Specific
	badge: '#E8622A',
	paid: '#A7F3D0',
	partial: '#FDE68A',
	unpaid: '#FECACA',
	lowStock: '#EF4444',
	overdue: '#FECACA',
};

const TYPOGRAPHY: Theme['typography'] = {
	fontFamily:
		Platform?.select({ ios: 'System', android: 'sans-serif', default: 'System' }) ?? 'System',
	fontFamilyBold:
		Platform?.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }) ??
		'System',
	sizes: {
		xs: 11,
		sm: 13,
		md: 14,
		lg: 16,
		xl: 18,
		'2xl': 20,
		'3xl': 24,
	},
	weights: {
		regular: '400',
		medium: '500',
		semibold: '600',
		bold: '700',
	},
	lineHeights: {
		tight: 1.2,
		normal: 1.5,
		relaxed: 1.75,
	},
	variants: {
		display: { fontSize: 30, fontWeight: '700', lineHeight: 45 },
		h1: { fontSize: 24, fontWeight: '700', lineHeight: 36 },
		h2: { fontSize: 20, fontWeight: '600', lineHeight: 30 },
		h3: { fontSize: 18, fontWeight: '600', lineHeight: 28 },
		body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
		bodyBold: { fontSize: 16, fontWeight: '700', lineHeight: 24 },
		caption: { fontSize: 14, fontWeight: '400', lineHeight: 21 },
		captionBold: { fontSize: 14, fontWeight: '700', lineHeight: 21 },
		amount: { fontSize: 20, fontWeight: '700', lineHeight: 30, color: '#C1440E' },
		amountLarge: { fontSize: 28, fontWeight: '700', lineHeight: 42, color: '#C1440E' },
		amountNegative: { fontSize: 20, fontWeight: '700', lineHeight: 30, color: '#B91C1C' },
		label: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
		captionSmall: { fontSize: 11, fontWeight: '400', lineHeight: 16 },
	},
};

const SPACING: Theme['spacing'] = {
	xs: 4,
	sm: 8,
	md: 12,
	lg: 16,
	xl: 24,
	'2xl': 32,
	'3xl': 48,
	'4xl': 64,
};

const BORDER_RADIUS: Theme['borderRadius'] = {
	none: 0,
	xs: 2,
	sm: 4,
	md: 8,
	lg: 12,
	xl: 16,
	full: 9999,
};

const makeShadows = (isDark: boolean): Theme['shadows'] => ({
	xs:
		Platform?.select({
			ios: {
				shadowColor: isDark ? '#000' : '#4A3828',
				shadowOffset: { width: 0, height: 1 },
				shadowOpacity: isDark ? 0.2 : 0.05,
				shadowRadius: 1,
			},
			android: { elevation: 1 },
			default: {},
		}) ?? {},
	sm:
		Platform?.select({
			ios: {
				shadowColor: isDark ? '#000' : '#4A3828',
				shadowOffset: { width: 0, height: 1 },
				shadowOpacity: isDark ? 0.3 : 0.08,
				shadowRadius: 2,
			},
			android: { elevation: 2 },
			default: {},
		}) ?? {},
	md:
		Platform?.select({
			ios: {
				shadowColor: isDark ? '#000' : '#4A3828',
				shadowOffset: { width: 0, height: 3 },
				shadowOpacity: isDark ? 0.4 : 0.12,
				shadowRadius: 6,
			},
			android: { elevation: 4 },
			default: {},
		}) ?? {},
	lg:
		Platform?.select({
			ios: {
				shadowColor: isDark ? '#000' : '#4A3828',
				shadowOffset: { width: 0, height: 6 },
				shadowOpacity: isDark ? 0.5 : 0.16,
				shadowRadius: 12,
			},
			android: { elevation: 8 },
			default: {},
		}) ?? {},
});

export function buildTheme(isDark: boolean): Theme {
	return {
		isDark,
		colors: isDark ? DARK_COLORS : LIGHT_COLORS,
		typography: TYPOGRAPHY,
		spacing: SPACING,
		borderRadius: BORDER_RADIUS,
		shadows: makeShadows(isDark),
		animation: {
			durationFast: 150,
			durationNormal: 200, // roadmap timing preset
			durationSlow: 400,
			springDamping: 20, // roadmap spring preset
			springStiffness: 200, // roadmap spring preset
		},
		touchTarget: 48,
	};
}

export const lightTheme = buildTheme(false);
export const darkTheme = buildTheme(true);
