import type { Theme } from './index';
import { Platform } from 'react-native';
import { darkColors, lightColors, palette } from './palette';

export { lightColors, darkColors };

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
		amount: { fontSize: 20, fontWeight: '700', lineHeight: 30, color: lightColors.primary },
		amountLarge: {
			fontSize: 28,
			fontWeight: '700',
			lineHeight: 42,
			color: lightColors.primary,
		},
		amountNegative: {
			fontSize: 20,
			fontWeight: '700',
			lineHeight: 30,
			color: lightColors.error,
		},
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

const makeShadows = (isDark: boolean): Theme['shadows'] => {
	const iosShadow = isDark ? palette.shadow : palette.shadowWarm;
	return {
		xs:
			Platform?.select({
				ios: {
					shadowColor: iosShadow,
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
					shadowColor: iosShadow,
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
					shadowColor: iosShadow,
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
					shadowColor: iosShadow,
					shadowOffset: { width: 0, height: 6 },
					shadowOpacity: isDark ? 0.5 : 0.16,
					shadowRadius: 12,
				},
				android: { elevation: 8 },
				default: {},
			}) ?? {},
	};
};

export function buildTheme(isDark: boolean): Theme {
	return {
		isDark,
		colors: isDark ? darkColors : lightColors,
		typography: TYPOGRAPHY,
		spacing: SPACING,
		borderRadius: BORDER_RADIUS,
		shadows: makeShadows(isDark),
		animation: {
			durationFast: 150,
			durationNormal: 200,
			durationSlow: 400,
			springDamping: 20,
			springStiffness: 200,
		},
		touchTarget: 48,
	};
}

export const lightTheme = buildTheme(false);
export const darkTheme = buildTheme(true);
