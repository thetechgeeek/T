import {
	ANIMATION_MS,
	BORDER_RADIUS_PX,
	SPACING_PX,
	SPRING_PHYSICS,
	TOUCH_TARGET_MIN_PX,
} from './layoutMetrics';
import {
	darkColors as baseDarkColors,
	highContrastDarkColors,
	highContrastLightColors,
	lightColors as baseLightColors,
	themePresetColorOverrides,
	themePresetVisualOverrides,
} from './palette';
import { FONT_SIZE_TOKENS, FONT_WEIGHT_TOKENS, TOKEN_VERSION } from './designTokens';
import { EASING_CURVES, MOTION_PROFILES } from './animations';
import { FONT_SIZE, FONT_SIZE_SCALE, LINE_HEIGHT, LINE_HEIGHT_RATIO } from './typographyMetrics';
import {
	detectPixelRatio,
	resolveDensityAwareDimension,
	resolveDensityAwareRadius,
	resolveDensityAwareTouchTarget,
} from './density';
import { resolveTypographyFamiliesForLocale } from './localeTypography';
import { resolveResponsiveMetrics, scaleResponsiveValue } from './responsive';
import type {
	Theme,
	ThemeColors,
	ThemeContrastMode,
	ThemeExpression,
	ThemeMeta,
	ThemePresetId,
	ThemeTypography,
} from './index';

export interface ThemePresetOption extends Pick<
	ThemeMeta,
	'presetId' | 'presetLabel' | 'density' | 'expression' | 'accentBudget'
> {
	description: string;
}

type DeepPartial<T> = {
	[K in keyof T]?: T[K] extends readonly unknown[]
		? T[K]
		: T[K] extends object
			? DeepPartial<T[K]>
			: T[K];
};

interface ThemePresetDefinition extends ThemePresetOption {
	lightOverrides: Partial<ThemeColors>;
	darkOverrides: Partial<ThemeColors>;
	expression: ThemeExpression;
	accentBudget: number;
	spacingScale: number;
	radiusScale: number;
	fontScale: number;
	lineHeightScale: number;
	animationScale: number;
	touchTarget: number;
	shadowOpacityScale: number;
	shadowRadiusScale: number;
	shadowElevationScale: number;
	lightVisualOverrides?: DeepPartial<Theme['visual']>;
	darkVisualOverrides?: DeepPartial<Theme['visual']>;
}

export interface ResolvedThemePreset {
	meta: ThemeMeta;
	colors: ThemeColors;
	typography: ThemeTypography;
	spacing: Theme['spacing'];
	borderRadius: Theme['borderRadius'];
	animation: Theme['animation'];
	touchTarget: number;
	shadowProfile: {
		opacityScale: number;
		radiusScale: number;
		elevationScale: number;
	};
	visualOverrides?: DeepPartial<Theme['visual']>;
}

const BASE_SPACING = SPACING_PX;
const BASE_RADIUS = BORDER_RADIUS_PX;
const MIN_SIZE_XS = 10;
const MIN_SIZE_SM = 12;
const MIN_SIZE_MD = 13;
const MIN_SIZE_LG = 15;
const MIN_SIZE_XL = 17;
const MIN_SIZE_2XL = 18;
const MIN_SIZE_3XL = 22;
const MIN_SIZE_4XL = 26;
const MIN_DISPLAY_SIZE = 26;
const MIN_DISPLAY_LINE_HEIGHT = 34;
const MIN_H1_SIZE = 22;
const MIN_H1_LINE_HEIGHT = 28;
const MIN_H2_SIZE = 18;
const MIN_H2_LINE_HEIGHT = 24;
const MIN_H3_SIZE = 17;
const MIN_H3_LINE_HEIGHT = 22;
const MIN_BODY_LINE_HEIGHT = 22;
const MIN_CAPTION_SIZE = 13;
const MIN_CAPTION_LINE_HEIGHT = 18;
const MIN_AMOUNT_SIZE = 18;
const MIN_AMOUNT_LINE_HEIGHT = 24;
const MIN_AMOUNT_LARGE_SIZE = 24;
const MIN_AMOUNT_LARGE_LINE_HEIGHT = 30;
const MIN_LABEL_SIZE = 12;
const MIN_LABEL_LINE_HEIGHT = 16;
const MIN_CAPTION_SMALL_SIZE = 10;
const MIN_CAPTION_SMALL_LINE_HEIGHT = 14;
const MIN_METADATA_SIZE = 12;
const MIN_METADATA_LINE_HEIGHT = 16;
const MIN_METRIC_SIZE = 28;
const MIN_METRIC_LINE_HEIGHT = 34;
const EXECUTIVE_SPACING_SCALE = 0.92;
const EXECUTIVE_RADIUS_SCALE = 0.72;
const EXECUTIVE_FONT_SCALE = 0.97;
const EXECUTIVE_LINE_HEIGHT_SCALE = 0.98;
const EXECUTIVE_ANIMATION_SCALE = 0.9;
const EXECUTIVE_SHADOW_OPACITY_SCALE = 0.85;
const EXECUTIVE_SHADOW_RADIUS_SCALE = 0.92;
const EXECUTIVE_SHADOW_ELEVATION_SCALE = 0.9;
const STUDIO_SPACING_SCALE = 1.08;
const STUDIO_RADIUS_SCALE = 1.35;
const STUDIO_FONT_SCALE = 1.02;
const STUDIO_LINE_HEIGHT_SCALE = 1.05;
const STUDIO_ANIMATION_SCALE = 1.05;
const STUDIO_TOUCH_TARGET = 52;
const STUDIO_SHADOW_OPACITY_SCALE = 1.08;
const STUDIO_SHADOW_RADIUS_SCALE = 1.12;
const STUDIO_SHADOW_ELEVATION_SCALE = 1.1;
const PRISM_SPACING_SCALE = 0.96;
const PRISM_RADIUS_SCALE = 1.45;
const PRISM_FONT_SCALE = 1;
const PRISM_LINE_HEIGHT_SCALE = 0.98;
const PRISM_ANIMATION_SCALE = 1.08;
const PRISM_SHADOW_OPACITY_SCALE = 1.18;
const PRISM_SHADOW_RADIUS_SCALE = 1.28;
const PRISM_SHADOW_ELEVATION_SCALE = 1.2;
const MONO_RADIUS_SCALE = 0.9;
const MONO_ANIMATION_SCALE = 0.95;
const MONO_SHADOW_OPACITY_SCALE = 0.9;
const MONO_SHADOW_RADIUS_SCALE = 0.95;
const MONO_SHADOW_ELEVATION_SCALE = 0.95;
const MIN_DURATION_FAST = 120;
const MIN_DURATION_NORMAL = 140;
const MIN_DURATION_SLOW = 220;
const DEFAULT_VIEWPORT_WIDTH = 430;
const DEFAULT_VIEWPORT_HEIGHT = 932;
const TABLET_TOUCH_TARGET_MIN = 52;

function roundToken(value: number, minimum = 0) {
	return Math.max(minimum, Math.round(value));
}

function scaleSpacing(scale: number, pixelRatio = 2): Theme['spacing'] {
	return {
		xxs: resolveDensityAwareDimension(roundToken(BASE_SPACING.xxs * scale, 2), pixelRatio),
		xs: resolveDensityAwareDimension(roundToken(BASE_SPACING.xs * scale, 4), pixelRatio),
		sm: resolveDensityAwareDimension(roundToken(BASE_SPACING.sm * scale, 6), pixelRatio),
		md: resolveDensityAwareDimension(roundToken(BASE_SPACING.md * scale, 8), pixelRatio),
		lg: resolveDensityAwareDimension(roundToken(BASE_SPACING.lg * scale, 10), pixelRatio),
		xl: resolveDensityAwareDimension(roundToken(BASE_SPACING.xl * scale, 16), pixelRatio),
		'2xl': resolveDensityAwareDimension(
			roundToken(BASE_SPACING['2xl'] * scale, 20),
			pixelRatio,
		),
		'3xl': resolveDensityAwareDimension(
			roundToken(BASE_SPACING['3xl'] * scale, 28),
			pixelRatio,
		),
		'4xl': resolveDensityAwareDimension(
			roundToken(BASE_SPACING['4xl'] * scale, 40),
			pixelRatio,
		),
	};
}

export function buildDensitySpacingSet(pixelRatio = detectPixelRatio()): Theme['densitySpacing'] {
	return {
		compact: scaleSpacing(EXECUTIVE_SPACING_SCALE, pixelRatio),
		comfortable: scaleSpacing(1, pixelRatio),
		spacious: scaleSpacing(STUDIO_SPACING_SCALE, pixelRatio),
	};
}

function scaleRadius(scale: number, pixelRatio = 2): Theme['borderRadius'] {
	return {
		none: 0,
		xs: resolveDensityAwareRadius(roundToken(BASE_RADIUS.xs * scale, 2), pixelRatio),
		sm: resolveDensityAwareRadius(roundToken(BASE_RADIUS.sm * scale, 4), pixelRatio),
		md: resolveDensityAwareRadius(roundToken(BASE_RADIUS.md * scale, 6), pixelRatio),
		lg: resolveDensityAwareRadius(roundToken(BASE_RADIUS.lg * scale, 8), pixelRatio),
		xl: resolveDensityAwareRadius(roundToken(BASE_RADIUS.xl * scale, 10), pixelRatio),
		full: BASE_RADIUS.full,
	};
}

function scaleTypography(
	fontScale: number,
	lineHeightScale: number,
	pixelRatio: number,
	colors: Pick<ThemeColors, 'primary' | 'error'>,
	detectedLocale = 'en-US',
): ThemeTypography {
	const scaleSize = (value: number, minimum: number) =>
		resolveDensityAwareDimension(roundToken(value * fontScale, minimum), pixelRatio);
	const scaleLineHeightValue = (value: number, minimum: number) =>
		resolveDensityAwareDimension(roundToken(value * lineHeightScale, minimum), pixelRatio);
	const families = resolveTypographyFamiliesForLocale(detectedLocale);

	return {
		fontFamily: families.ui,
		fontFamilyBold: families.display,
		fontFamilyDisplay: families.brand,
		families: {
			ui: families.ui,
			display: families.display,
			brand: families.brand,
			mono: families.mono,
		},
		scale: {
			xs: scaleSize(FONT_SIZE_TOKENS.xs, MIN_SIZE_XS),
			sm: scaleSize(FONT_SIZE_TOKENS.sm, MIN_SIZE_SM),
			md: scaleSize(FONT_SIZE_TOKENS.md, MIN_SIZE_MD),
			lg: scaleSize(FONT_SIZE_TOKENS.lg, MIN_SIZE_LG),
			xl: scaleSize(FONT_SIZE_TOKENS.xl, MIN_SIZE_XL),
			'2xl': scaleSize(FONT_SIZE_TOKENS['2xl'], MIN_SIZE_2XL),
			'3xl': scaleSize(FONT_SIZE_TOKENS['3xl'], MIN_SIZE_3XL),
			'4xl': scaleSize(FONT_SIZE_TOKENS['4xl'], MIN_SIZE_4XL),
			'display-sm': scaleSize(FONT_SIZE_TOKENS['display-sm'], MIN_DISPLAY_SIZE),
			'display-md': scaleSize(FONT_SIZE_TOKENS['display-md'], 32),
			'display-lg': scaleSize(FONT_SIZE_TOKENS['display-lg'], 36),
			'display-xl': scaleSize(FONT_SIZE_TOKENS['display-xl'], 40),
			'display-2xl': scaleSize(FONT_SIZE_TOKENS['display-2xl'], 48),
		},
		sizes: {
			xs: scaleSize(FONT_SIZE_SCALE.xs, MIN_SIZE_XS),
			sm: scaleSize(FONT_SIZE_SCALE.sm, MIN_SIZE_SM),
			md: scaleSize(FONT_SIZE_SCALE.md, MIN_SIZE_MD),
			lg: scaleSize(FONT_SIZE_SCALE.lg, MIN_SIZE_LG),
			xl: scaleSize(FONT_SIZE_SCALE.xl, MIN_SIZE_XL),
			'2xl': scaleSize(FONT_SIZE_SCALE['2xl'], MIN_SIZE_2XL),
			'3xl': scaleSize(FONT_SIZE_SCALE['3xl'], MIN_SIZE_3XL),
			'4xl': scaleSize(FONT_SIZE_SCALE['4xl'], MIN_SIZE_4XL),
		},
		weights: {
			regular: FONT_WEIGHT_TOKENS.regular,
			medium: FONT_WEIGHT_TOKENS.medium,
			semibold: FONT_WEIGHT_TOKENS.semibold,
			bold: FONT_WEIGHT_TOKENS.bold,
		},
		lineHeights: {
			tight: Number((LINE_HEIGHT_RATIO.tight * lineHeightScale).toFixed(2)),
			normal: Number((LINE_HEIGHT_RATIO.normal * lineHeightScale).toFixed(2)),
			relaxed: Number((LINE_HEIGHT_RATIO.relaxed * lineHeightScale).toFixed(2)),
		},
		variants: {
			display: {
				fontSize: scaleSize(FONT_SIZE.display, MIN_DISPLAY_SIZE),
				fontWeight: FONT_WEIGHT_TOKENS.bold,
				lineHeight: scaleLineHeightValue(LINE_HEIGHT.display, MIN_DISPLAY_LINE_HEIGHT),
				fontFamily: families.brand,
			},
			screenTitle: {
				fontSize: scaleSize(FONT_SIZE.h1, MIN_H1_SIZE),
				fontWeight: FONT_WEIGHT_TOKENS.bold,
				lineHeight: scaleLineHeightValue(LINE_HEIGHT.h1, MIN_H1_LINE_HEIGHT),
			},
			sectionTitle: {
				fontSize: scaleSize(FONT_SIZE.h3, MIN_H3_SIZE),
				fontWeight: FONT_WEIGHT_TOKENS.semibold,
				lineHeight: scaleLineHeightValue(LINE_HEIGHT.h3, MIN_H3_LINE_HEIGHT),
			},
			h1: {
				fontSize: scaleSize(FONT_SIZE.h1, MIN_H1_SIZE),
				fontWeight: FONT_WEIGHT_TOKENS.bold,
				lineHeight: scaleLineHeightValue(LINE_HEIGHT.h1, MIN_H1_LINE_HEIGHT),
			},
			h2: {
				fontSize: scaleSize(FONT_SIZE.h2, MIN_H2_SIZE),
				fontWeight: FONT_WEIGHT_TOKENS.semibold,
				lineHeight: scaleLineHeightValue(LINE_HEIGHT.h2, MIN_H2_LINE_HEIGHT),
			},
			h3: {
				fontSize: scaleSize(FONT_SIZE.h3, MIN_H3_SIZE),
				fontWeight: FONT_WEIGHT_TOKENS.semibold,
				lineHeight: scaleLineHeightValue(LINE_HEIGHT.h3, MIN_H3_LINE_HEIGHT),
			},
			body: {
				fontSize: scaleSize(FONT_SIZE.body, 15),
				fontWeight: FONT_WEIGHT_TOKENS.regular,
				lineHeight: scaleLineHeightValue(LINE_HEIGHT.body, MIN_BODY_LINE_HEIGHT),
			},
			bodyMedium: {
				fontSize: scaleSize(FONT_SIZE.body, 15),
				fontWeight: FONT_WEIGHT_TOKENS.medium,
				lineHeight: scaleLineHeightValue(LINE_HEIGHT.body, MIN_BODY_LINE_HEIGHT),
			},
			bodyStrong: {
				fontSize: scaleSize(FONT_SIZE.body, 15),
				fontWeight: FONT_WEIGHT_TOKENS.semibold,
				lineHeight: scaleLineHeightValue(LINE_HEIGHT.body, MIN_BODY_LINE_HEIGHT),
			},
			bodyBold: {
				fontSize: scaleSize(FONT_SIZE.body, 15),
				fontWeight: FONT_WEIGHT_TOKENS.bold,
				lineHeight: scaleLineHeightValue(LINE_HEIGHT.body, MIN_BODY_LINE_HEIGHT),
			},
			metadata: {
				fontSize: scaleSize(FONT_SIZE.caption, MIN_METADATA_SIZE),
				fontWeight: FONT_WEIGHT_TOKENS.medium,
				lineHeight: scaleLineHeightValue(LINE_HEIGHT.caption, MIN_METADATA_LINE_HEIGHT),
			},
			metric: {
				fontSize: scaleSize(FONT_SIZE.amountLarge, MIN_METRIC_SIZE),
				fontWeight: FONT_WEIGHT_TOKENS.bold,
				lineHeight: scaleLineHeightValue(LINE_HEIGHT.amountLarge, MIN_METRIC_LINE_HEIGHT),
			},
			code: {
				fontSize: scaleSize(FONT_SIZE.caption, MIN_CAPTION_SIZE),
				fontWeight: FONT_WEIGHT_TOKENS.medium,
				lineHeight: scaleLineHeightValue(LINE_HEIGHT.caption, MIN_CAPTION_LINE_HEIGHT),
				fontFamily: families.mono,
			},
			caption: {
				fontSize: scaleSize(FONT_SIZE.caption, MIN_CAPTION_SIZE),
				fontWeight: FONT_WEIGHT_TOKENS.regular,
				lineHeight: scaleLineHeightValue(LINE_HEIGHT.caption, MIN_CAPTION_LINE_HEIGHT),
			},
			captionBold: {
				fontSize: scaleSize(FONT_SIZE.caption, MIN_CAPTION_SIZE),
				fontWeight: FONT_WEIGHT_TOKENS.bold,
				lineHeight: scaleLineHeightValue(LINE_HEIGHT.caption, MIN_CAPTION_LINE_HEIGHT),
			},
			amount: {
				fontSize: scaleSize(FONT_SIZE.amount, MIN_AMOUNT_SIZE),
				fontWeight: FONT_WEIGHT_TOKENS.bold,
				lineHeight: scaleLineHeightValue(LINE_HEIGHT.amount, MIN_AMOUNT_LINE_HEIGHT),
				color: colors.primary,
			},
			amountLarge: {
				fontSize: scaleSize(FONT_SIZE.amountLarge, MIN_AMOUNT_LARGE_SIZE),
				fontWeight: FONT_WEIGHT_TOKENS.bold,
				lineHeight: scaleLineHeightValue(
					LINE_HEIGHT.amountLarge,
					MIN_AMOUNT_LARGE_LINE_HEIGHT,
				),
				color: colors.primary,
			},
			amountNegative: {
				fontSize: scaleSize(FONT_SIZE.amount, MIN_AMOUNT_SIZE),
				fontWeight: FONT_WEIGHT_TOKENS.bold,
				lineHeight: scaleLineHeightValue(LINE_HEIGHT.amount, MIN_AMOUNT_LINE_HEIGHT),
				color: colors.error,
			},
			label: {
				fontSize: scaleSize(FONT_SIZE.label, MIN_LABEL_SIZE),
				fontWeight: FONT_WEIGHT_TOKENS.medium,
				lineHeight: scaleLineHeightValue(LINE_HEIGHT.label, MIN_LABEL_LINE_HEIGHT),
			},
			captionSmall: {
				fontSize: scaleSize(FONT_SIZE.captionSmall, MIN_CAPTION_SMALL_SIZE),
				fontWeight: FONT_WEIGHT_TOKENS.regular,
				lineHeight: scaleLineHeightValue(
					LINE_HEIGHT.captionSmall,
					MIN_CAPTION_SMALL_LINE_HEIGHT,
				),
			},
		},
	};
}

function resolvePresetBaseColors(isDark: boolean, contrastMode: ThemeContrastMode) {
	if (contrastMode === 'high') {
		return isDark ? highContrastDarkColors : highContrastLightColors;
	}

	return isDark ? baseDarkColors : baseLightColors;
}

const THEME_PRESET_DEFINITIONS: Record<ThemePresetId, ThemePresetDefinition> = {
	baseline: {
		presetId: 'baseline',
		presetLabel: 'Baseline',
		description: 'Balanced neutral surfaces with comfortable spacing.',
		density: 'comfortable',
		expression: 'balanced',
		accentBudget: 1,
		lightOverrides: {},
		darkOverrides: {},
		spacingScale: 1,
		radiusScale: 1,
		fontScale: 1,
		lineHeightScale: 1,
		animationScale: 1,
		touchTarget: TOUCH_TARGET_MIN_PX,
		shadowOpacityScale: 1,
		shadowRadiusScale: 1,
		shadowElevationScale: 1,
	},
	executive: {
		presetId: 'executive',
		presetLabel: 'Executive',
		description: 'Sharper, denser, boardroom-oriented visual language.',
		density: 'compact',
		expression: 'operational',
		accentBudget: 1,
		lightOverrides: themePresetColorOverrides.executive.light,
		darkOverrides: themePresetColorOverrides.executive.dark,
		spacingScale: EXECUTIVE_SPACING_SCALE,
		radiusScale: EXECUTIVE_RADIUS_SCALE,
		fontScale: EXECUTIVE_FONT_SCALE,
		lineHeightScale: EXECUTIVE_LINE_HEIGHT_SCALE,
		animationScale: EXECUTIVE_ANIMATION_SCALE,
		touchTarget: TOUCH_TARGET_MIN_PX,
		shadowOpacityScale: EXECUTIVE_SHADOW_OPACITY_SCALE,
		shadowRadiusScale: EXECUTIVE_SHADOW_RADIUS_SCALE,
		shadowElevationScale: EXECUTIVE_SHADOW_ELEVATION_SCALE,
	},
	studio: {
		presetId: 'studio',
		presetLabel: 'Studio',
		description: 'More expressive spacing, roundness, and brighter brand accents.',
		density: 'spacious',
		expression: 'showcase',
		accentBudget: 2,
		lightOverrides: themePresetColorOverrides.studio.light,
		darkOverrides: themePresetColorOverrides.studio.dark,
		spacingScale: STUDIO_SPACING_SCALE,
		radiusScale: STUDIO_RADIUS_SCALE,
		fontScale: STUDIO_FONT_SCALE,
		lineHeightScale: STUDIO_LINE_HEIGHT_SCALE,
		animationScale: STUDIO_ANIMATION_SCALE,
		touchTarget: STUDIO_TOUCH_TARGET,
		shadowOpacityScale: STUDIO_SHADOW_OPACITY_SCALE,
		shadowRadiusScale: STUDIO_SHADOW_RADIUS_SCALE,
		shadowElevationScale: STUDIO_SHADOW_ELEVATION_SCALE,
	},
	prism: {
		presetId: 'prism',
		presetLabel: 'Prism',
		description: 'Luminous showcase surfaces with compact spacing for dense product data.',
		density: 'compact',
		expression: 'showcase',
		accentBudget: 2,
		lightOverrides: themePresetColorOverrides.prism.light,
		darkOverrides: themePresetColorOverrides.prism.dark,
		spacingScale: PRISM_SPACING_SCALE,
		radiusScale: PRISM_RADIUS_SCALE,
		fontScale: PRISM_FONT_SCALE,
		lineHeightScale: PRISM_LINE_HEIGHT_SCALE,
		animationScale: PRISM_ANIMATION_SCALE,
		touchTarget: TOUCH_TARGET_MIN_PX,
		shadowOpacityScale: PRISM_SHADOW_OPACITY_SCALE,
		shadowRadiusScale: PRISM_SHADOW_RADIUS_SCALE,
		shadowElevationScale: PRISM_SHADOW_ELEVATION_SCALE,
		lightVisualOverrides: themePresetVisualOverrides.prism.light,
		darkVisualOverrides: themePresetVisualOverrides.prism.dark,
	},
	mono: {
		presetId: 'mono',
		presetLabel: 'Mono',
		description: 'Neutral monochrome surfaces with precise accent highlights.',
		density: 'comfortable',
		expression: 'balanced',
		accentBudget: 1,
		lightOverrides: themePresetColorOverrides.mono.light,
		darkOverrides: themePresetColorOverrides.mono.dark,
		spacingScale: 1,
		radiusScale: MONO_RADIUS_SCALE,
		fontScale: 1,
		lineHeightScale: 1,
		animationScale: MONO_ANIMATION_SCALE,
		touchTarget: TOUCH_TARGET_MIN_PX,
		shadowOpacityScale: MONO_SHADOW_OPACITY_SCALE,
		shadowRadiusScale: MONO_SHADOW_RADIUS_SCALE,
		shadowElevationScale: MONO_SHADOW_ELEVATION_SCALE,
	},
};

export const THEME_PRESET_OPTIONS = Object.values(THEME_PRESET_DEFINITIONS).map(
	({ presetId, presetLabel, description, density, expression, accentBudget }) => ({
		presetId,
		presetLabel,
		description,
		density,
		expression,
		accentBudget,
	}),
) as readonly ThemePresetOption[];

export function resolveThemePreset(
	presetId: ThemePresetId,
	isDark: boolean,
	options: {
		contrastMode?: ThemeContrastMode;
		pixelRatio?: number;
		detectedLocale?: string;
		viewportWidth?: number;
		viewportHeight?: number;
	} = {},
): ResolvedThemePreset {
	const preset = THEME_PRESET_DEFINITIONS[presetId] ?? THEME_PRESET_DEFINITIONS.baseline;
	const contrastMode = options.contrastMode ?? 'default';
	const pixelRatio = options.pixelRatio ?? detectPixelRatio();
	const responsiveMetrics = resolveResponsiveMetrics(
		options.viewportWidth ?? DEFAULT_VIEWPORT_WIDTH,
		options.viewportHeight ?? DEFAULT_VIEWPORT_HEIGHT,
	);
	const baseColors = resolvePresetBaseColors(isDark, contrastMode);
	const colors: ThemeColors = {
		...baseColors,
		...(contrastMode === 'default'
			? isDark
				? preset.darkOverrides
				: preset.lightOverrides
			: {}),
	};
	const responsiveFontScale = preset.fontScale * responsiveMetrics.typographyScale;
	const responsiveLineHeightScale = preset.lineHeightScale * responsiveMetrics.typographyScale;
	const responsiveSpacingScale = preset.spacingScale * responsiveMetrics.spacingScale;
	const responsiveRadiusScale = preset.radiusScale * responsiveMetrics.layoutScale;
	const responsiveTouchTarget = responsiveMetrics.isTablet
		? Math.max(
				TABLET_TOUCH_TARGET_MIN,
				scaleResponsiveValue(
					preset.touchTarget,
					responsiveMetrics.layoutScale,
					preset.touchTarget,
				),
			)
		: preset.touchTarget;

	return {
		meta: {
			presetId: preset.presetId,
			presetLabel: preset.presetLabel,
			density: preset.density,
			expression: preset.expression,
			accentBudget: preset.accentBudget,
			contrastMode,
			tokenVersion: TOKEN_VERSION,
		},
		colors,
		typography: scaleTypography(
			responsiveFontScale,
			responsiveLineHeightScale,
			pixelRatio,
			colors,
			options.detectedLocale,
		),
		spacing: scaleSpacing(responsiveSpacingScale, pixelRatio),
		borderRadius: scaleRadius(responsiveRadiusScale, pixelRatio),
		animation: {
			durationInstant: ANIMATION_MS.instant,
			durationMicro: roundToken(ANIMATION_MS.micro * preset.animationScale, 80),
			durationFast: roundToken(ANIMATION_MS.fast * preset.animationScale, MIN_DURATION_FAST),
			durationNormal: roundToken(
				ANIMATION_MS.normal * preset.animationScale,
				MIN_DURATION_NORMAL,
			),
			durationSlow: roundToken(ANIMATION_MS.slow * preset.animationScale, MIN_DURATION_SLOW),
			curves: { ...EASING_CURVES },
			spring: {
				default: {
					damping: SPRING_PHYSICS.damping,
					stiffness: SPRING_PHYSICS.stiffness,
					mass: SPRING_PHYSICS.mass,
				},
				press: {
					damping: SPRING_PHYSICS.press.damping,
					stiffness: SPRING_PHYSICS.press.stiffness,
					mass: SPRING_PHYSICS.press.mass,
				},
				bounce: {
					damping: SPRING_PHYSICS.bounce.damping,
					stiffness: SPRING_PHYSICS.bounce.stiffness,
					mass: SPRING_PHYSICS.bounce.mass,
				},
			},
			profiles: {
				buttonPress: {
					scalePressed: MOTION_PROFILES.buttonPress.scalePressed,
					spring: { ...SPRING_PHYSICS.press },
				},
				cardPress: {
					scalePressed: MOTION_PROFILES.cardPress.scalePressed,
					opacityPressed: MOTION_PROFILES.cardPress.opacityPressed,
					spring: { ...SPRING_PHYSICS.press },
				},
				listItemPress: {
					scalePressed: MOTION_PROFILES.listItemPress.scalePressed,
					spring: { ...SPRING_PHYSICS.press },
				},
				bannerEnter: {
					duration: roundToken(
						MOTION_PROFILES.bannerEnter.duration * preset.animationScale,
						MIN_DURATION_FAST,
					),
					easing: MOTION_PROFILES.bannerEnter.easing,
					spring: { ...SPRING_PHYSICS.press },
				},
				shimmerLoop: {
					duration: roundToken(
						MOTION_PROFILES.shimmerLoop.duration * preset.animationScale,
						MIN_DURATION_SLOW,
					),
					easing: MOTION_PROFILES.shimmerLoop.easing,
					reverse: MOTION_PROFILES.shimmerLoop.reverse,
				},
			},
		},
		touchTarget: resolveDensityAwareTouchTarget(responsiveTouchTarget, pixelRatio),
		shadowProfile: {
			opacityScale: preset.shadowOpacityScale,
			radiusScale: preset.shadowRadiusScale,
			elevationScale: preset.shadowElevationScale,
		},
		visualOverrides:
			contrastMode === 'default'
				? isDark
					? preset.darkVisualOverrides
					: preset.lightVisualOverrides
				: undefined,
	};
}
