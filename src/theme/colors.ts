import type { Theme } from './index';
import { Platform } from 'react-native';
import { darkColors, lightColors, palette } from './palette';
import {
	ANIMATION_MS,
	BORDER_RADIUS_PX,
	SPACING_PX,
	SPRING_PHYSICS,
	TOUCH_TARGET_MIN_PX,
} from './layoutMetrics';
import { ELEVATION, SHADOW_IOS, SHADOW_OFFSET, SHADOW_RADIUS } from './shadowMetrics';
import { FONT_SIZE, FONT_SIZE_SCALE, LINE_HEIGHT, LINE_HEIGHT_RATIO } from './typographyMetrics';

export { lightColors, darkColors };

const TYPOGRAPHY: Theme['typography'] = {
	fontFamily:
		Platform?.select({ ios: 'System', android: 'sans-serif', default: 'System' }) ?? 'System',
	fontFamilyBold:
		Platform?.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }) ??
		'System',
	sizes: FONT_SIZE_SCALE,
	weights: {
		regular: '400',
		medium: '500',
		semibold: '600',
		bold: '700',
	},
	lineHeights: LINE_HEIGHT_RATIO,
	variants: {
		display: {
			fontSize: FONT_SIZE.display,
			fontWeight: '700',
			lineHeight: LINE_HEIGHT.display,
		},
		h1: { fontSize: FONT_SIZE.h1, fontWeight: '700', lineHeight: LINE_HEIGHT.h1 },
		h2: { fontSize: FONT_SIZE.h2, fontWeight: '600', lineHeight: LINE_HEIGHT.h2 },
		h3: { fontSize: FONT_SIZE.h3, fontWeight: '600', lineHeight: LINE_HEIGHT.h3 },
		body: { fontSize: FONT_SIZE.body, fontWeight: '400', lineHeight: LINE_HEIGHT.body },
		bodyBold: { fontSize: FONT_SIZE.body, fontWeight: '700', lineHeight: LINE_HEIGHT.body },
		caption: {
			fontSize: FONT_SIZE.caption,
			fontWeight: '400',
			lineHeight: LINE_HEIGHT.caption,
		},
		captionBold: {
			fontSize: FONT_SIZE.caption,
			fontWeight: '700',
			lineHeight: LINE_HEIGHT.caption,
		},
		amount: {
			fontSize: FONT_SIZE.amount,
			fontWeight: '700',
			lineHeight: LINE_HEIGHT.amount,
			color: lightColors.primary,
		},
		amountLarge: {
			fontSize: FONT_SIZE.amountLarge,
			fontWeight: '700',
			lineHeight: LINE_HEIGHT.amountLarge,
			color: lightColors.primary,
		},
		amountNegative: {
			fontSize: FONT_SIZE.amount,
			fontWeight: '700',
			lineHeight: LINE_HEIGHT.amount,
			color: lightColors.error,
		},
		label: {
			fontSize: FONT_SIZE.label,
			fontWeight: '500',
			lineHeight: LINE_HEIGHT.label,
		},
		captionSmall: {
			fontSize: FONT_SIZE.captionSmall,
			fontWeight: '400',
			lineHeight: LINE_HEIGHT.captionSmall,
		},
	},
};

const SPACING: Theme['spacing'] = SPACING_PX;

const BORDER_RADIUS: Theme['borderRadius'] = BORDER_RADIUS_PX;

const makeShadows = (isDark: boolean): Theme['shadows'] => {
	const iosShadow = isDark ? palette.shadow : palette.shadowWarm;
	return {
		xs:
			Platform?.select({
				ios: {
					shadowColor: iosShadow,
					shadowOffset: SHADOW_OFFSET.xs,
					shadowOpacity: isDark ? SHADOW_IOS.xs.dark : SHADOW_IOS.xs.light,
					shadowRadius: SHADOW_RADIUS.xs,
				},
				android: { elevation: ELEVATION.xs },
				default: {},
			}) ?? {},
		sm:
			Platform?.select({
				ios: {
					shadowColor: iosShadow,
					shadowOffset: SHADOW_OFFSET.sm,
					shadowOpacity: isDark ? SHADOW_IOS.sm.dark : SHADOW_IOS.sm.light,
					shadowRadius: SHADOW_RADIUS.sm,
				},
				android: { elevation: ELEVATION.sm },
				default: {},
			}) ?? {},
		md:
			Platform?.select({
				ios: {
					shadowColor: iosShadow,
					shadowOffset: SHADOW_OFFSET.md,
					shadowOpacity: isDark ? SHADOW_IOS.md.dark : SHADOW_IOS.md.light,
					shadowRadius: SHADOW_RADIUS.md,
				},
				android: { elevation: ELEVATION.md },
				default: {},
			}) ?? {},
		lg:
			Platform?.select({
				ios: {
					shadowColor: iosShadow,
					shadowOffset: SHADOW_OFFSET.lg,
					shadowOpacity: isDark ? SHADOW_IOS.lg.dark : SHADOW_IOS.lg.light,
					shadowRadius: SHADOW_RADIUS.lg,
				},
				android: { elevation: ELEVATION.lg },
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
			durationFast: ANIMATION_MS.fast,
			durationNormal: ANIMATION_MS.normal,
			durationSlow: ANIMATION_MS.slow,
			springDamping: SPRING_PHYSICS.damping,
			springStiffness: SPRING_PHYSICS.stiffness,
		},
		touchTarget: TOUCH_TARGET_MIN_PX,
	};
}

export const lightTheme = buildTheme(false);
export const darkTheme = buildTheme(true);
