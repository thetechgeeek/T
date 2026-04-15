import { Platform } from 'react-native';
import {
	ANIMATION_MS,
	BORDER_RADIUS_PX,
	SPACING_PX,
	SPRING_PHYSICS,
	TOUCH_TARGET_MIN_PX,
} from './layoutMetrics';
import {
	darkColors as baseDarkColors,
	lightColors as baseLightColors,
	themePresetColorOverrides,
} from './palette';
import { EASING_CURVES, MOTION_PROFILES } from './animations';
import { FONT_SIZE, FONT_SIZE_SCALE, LINE_HEIGHT, LINE_HEIGHT_RATIO } from './typographyMetrics';
import type { Theme, ThemeColors, ThemeMeta, ThemePresetId, ThemeTypography } from './index';

export interface ThemePresetOption extends ThemeMeta {
	description: string;
}

interface ThemePresetDefinition extends ThemePresetOption {
	lightOverrides: Partial<ThemeColors>;
	darkOverrides: Partial<ThemeColors>;
	spacingScale: number;
	radiusScale: number;
	fontScale: number;
	lineHeightScale: number;
	animationScale: number;
	touchTarget: number;
	shadowOpacityScale: number;
	shadowRadiusScale: number;
	shadowElevationScale: number;
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
}

const SYSTEM_FONT =
	Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }) ?? 'System';
const SYSTEM_FONT_BOLD =
	Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }) ?? 'System';

const BASE_SPACING = SPACING_PX;
const BASE_RADIUS = BORDER_RADIUS_PX;
const MIN_SIZE_XS = 10;
const MIN_SIZE_SM = 12;
const MIN_SIZE_MD = 13;
const MIN_SIZE_LG = 15;
const MIN_SIZE_XL = 17;
const MIN_SIZE_2XL = 18;
const MIN_SIZE_3XL = 22;
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
const MONO_RADIUS_SCALE = 0.9;
const MONO_ANIMATION_SCALE = 0.95;
const MONO_SHADOW_OPACITY_SCALE = 0.9;
const MONO_SHADOW_RADIUS_SCALE = 0.95;
const MONO_SHADOW_ELEVATION_SCALE = 0.95;
const MIN_DURATION_FAST = 120;
const MIN_DURATION_NORMAL = 140;
const MIN_DURATION_SLOW = 220;

function roundToken(value: number, minimum = 0) {
	return Math.max(minimum, Math.round(value));
}

function scaleSpacing(scale: number): Theme['spacing'] {
	return {
		xxs: roundToken(BASE_SPACING.xxs * scale, 2),
		xs: roundToken(BASE_SPACING.xs * scale, 4),
		sm: roundToken(BASE_SPACING.sm * scale, 6),
		md: roundToken(BASE_SPACING.md * scale, 8),
		lg: roundToken(BASE_SPACING.lg * scale, 10),
		xl: roundToken(BASE_SPACING.xl * scale, 16),
		'2xl': roundToken(BASE_SPACING['2xl'] * scale, 20),
		'3xl': roundToken(BASE_SPACING['3xl'] * scale, 28),
		'4xl': roundToken(BASE_SPACING['4xl'] * scale, 40),
	};
}

export function buildDensitySpacingSet(): Theme['densitySpacing'] {
	return {
		compact: scaleSpacing(EXECUTIVE_SPACING_SCALE),
		comfortable: scaleSpacing(1),
		spacious: scaleSpacing(STUDIO_SPACING_SCALE),
	};
}

function scaleRadius(scale: number): Theme['borderRadius'] {
	return {
		none: 0,
		xs: roundToken(BASE_RADIUS.xs * scale, 2),
		sm: roundToken(BASE_RADIUS.sm * scale, 4),
		md: roundToken(BASE_RADIUS.md * scale, 6),
		lg: roundToken(BASE_RADIUS.lg * scale, 8),
		xl: roundToken(BASE_RADIUS.xl * scale, 10),
		full: BASE_RADIUS.full,
	};
}

function scaleTypography(fontScale: number, lineHeightScale: number): ThemeTypography {
	return {
		fontFamily: SYSTEM_FONT,
		fontFamilyBold: SYSTEM_FONT_BOLD,
		sizes: {
			xs: roundToken(FONT_SIZE_SCALE.xs * fontScale, MIN_SIZE_XS),
			sm: roundToken(FONT_SIZE_SCALE.sm * fontScale, MIN_SIZE_SM),
			md: roundToken(FONT_SIZE_SCALE.md * fontScale, MIN_SIZE_MD),
			lg: roundToken(FONT_SIZE_SCALE.lg * fontScale, MIN_SIZE_LG),
			xl: roundToken(FONT_SIZE_SCALE.xl * fontScale, MIN_SIZE_XL),
			'2xl': roundToken(FONT_SIZE_SCALE['2xl'] * fontScale, MIN_SIZE_2XL),
			'3xl': roundToken(FONT_SIZE_SCALE['3xl'] * fontScale, MIN_SIZE_3XL),
		},
		weights: {
			regular: '400',
			medium: '500',
			semibold: '600',
			bold: '700',
		},
		lineHeights: {
			tight: Number((LINE_HEIGHT_RATIO.tight * lineHeightScale).toFixed(2)),
			normal: Number((LINE_HEIGHT_RATIO.normal * lineHeightScale).toFixed(2)),
			relaxed: Number((LINE_HEIGHT_RATIO.relaxed * lineHeightScale).toFixed(2)),
		},
		variants: {
			display: {
				fontSize: roundToken(FONT_SIZE.display * fontScale, MIN_DISPLAY_SIZE),
				fontWeight: '700',
				lineHeight: roundToken(
					LINE_HEIGHT.display * lineHeightScale,
					MIN_DISPLAY_LINE_HEIGHT,
				),
			},
			h1: {
				fontSize: roundToken(FONT_SIZE.h1 * fontScale, MIN_H1_SIZE),
				fontWeight: '700',
				lineHeight: roundToken(LINE_HEIGHT.h1 * lineHeightScale, MIN_H1_LINE_HEIGHT),
			},
			h2: {
				fontSize: roundToken(FONT_SIZE.h2 * fontScale, MIN_H2_SIZE),
				fontWeight: '600',
				lineHeight: roundToken(LINE_HEIGHT.h2 * lineHeightScale, MIN_H2_LINE_HEIGHT),
			},
			h3: {
				fontSize: roundToken(FONT_SIZE.h3 * fontScale, MIN_H3_SIZE),
				fontWeight: '600',
				lineHeight: roundToken(LINE_HEIGHT.h3 * lineHeightScale, MIN_H3_LINE_HEIGHT),
			},
			body: {
				fontSize: roundToken(FONT_SIZE.body * fontScale, 15),
				fontWeight: '400',
				lineHeight: roundToken(LINE_HEIGHT.body * lineHeightScale, MIN_BODY_LINE_HEIGHT),
			},
			bodyBold: {
				fontSize: roundToken(FONT_SIZE.body * fontScale, 15),
				fontWeight: '700',
				lineHeight: roundToken(LINE_HEIGHT.body * lineHeightScale, MIN_BODY_LINE_HEIGHT),
			},
			caption: {
				fontSize: roundToken(FONT_SIZE.caption * fontScale, MIN_CAPTION_SIZE),
				fontWeight: '400',
				lineHeight: roundToken(
					LINE_HEIGHT.caption * lineHeightScale,
					MIN_CAPTION_LINE_HEIGHT,
				),
			},
			captionBold: {
				fontSize: roundToken(FONT_SIZE.caption * fontScale, MIN_CAPTION_SIZE),
				fontWeight: '700',
				lineHeight: roundToken(
					LINE_HEIGHT.caption * lineHeightScale,
					MIN_CAPTION_LINE_HEIGHT,
				),
			},
			amount: {
				fontSize: roundToken(FONT_SIZE.amount * fontScale, MIN_AMOUNT_SIZE),
				fontWeight: '700',
				lineHeight: roundToken(
					LINE_HEIGHT.amount * lineHeightScale,
					MIN_AMOUNT_LINE_HEIGHT,
				),
				color: baseLightColors.primary,
			},
			amountLarge: {
				fontSize: roundToken(FONT_SIZE.amountLarge * fontScale, MIN_AMOUNT_LARGE_SIZE),
				fontWeight: '700',
				lineHeight: roundToken(
					LINE_HEIGHT.amountLarge * lineHeightScale,
					MIN_AMOUNT_LARGE_LINE_HEIGHT,
				),
				color: baseLightColors.primary,
			},
			amountNegative: {
				fontSize: roundToken(FONT_SIZE.amount * fontScale, MIN_AMOUNT_SIZE),
				fontWeight: '700',
				lineHeight: roundToken(
					LINE_HEIGHT.amount * lineHeightScale,
					MIN_AMOUNT_LINE_HEIGHT,
				),
				color: baseLightColors.error,
			},
			label: {
				fontSize: roundToken(FONT_SIZE.label * fontScale, MIN_LABEL_SIZE),
				fontWeight: '500',
				lineHeight: roundToken(LINE_HEIGHT.label * lineHeightScale, MIN_LABEL_LINE_HEIGHT),
			},
			captionSmall: {
				fontSize: roundToken(FONT_SIZE.captionSmall * fontScale, MIN_CAPTION_SMALL_SIZE),
				fontWeight: '400',
				lineHeight: roundToken(
					LINE_HEIGHT.captionSmall * lineHeightScale,
					MIN_CAPTION_SMALL_LINE_HEIGHT,
				),
			},
		},
	};
}

const THEME_PRESET_DEFINITIONS: Record<ThemePresetId, ThemePresetDefinition> = {
	baseline: {
		presetId: 'baseline',
		presetLabel: 'Baseline',
		description: 'Balanced neutral surfaces with comfortable spacing.',
		density: 'comfortable',
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
	mono: {
		presetId: 'mono',
		presetLabel: 'Mono',
		description: 'Neutral monochrome surfaces with precise accent highlights.',
		density: 'comfortable',
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
	({ presetId, presetLabel, description, density }) => ({
		presetId,
		presetLabel,
		description,
		density,
	}),
) as readonly ThemePresetOption[];

export function resolveThemePreset(presetId: ThemePresetId, isDark: boolean): ResolvedThemePreset {
	const preset = THEME_PRESET_DEFINITIONS[presetId] ?? THEME_PRESET_DEFINITIONS.baseline;
	const colors: ThemeColors = {
		...(isDark ? baseDarkColors : baseLightColors),
		...(isDark ? preset.darkOverrides : preset.lightOverrides),
	};

	return {
		meta: {
			presetId: preset.presetId,
			presetLabel: preset.presetLabel,
			density: preset.density,
		},
		colors,
		typography: scaleTypography(preset.fontScale, preset.lineHeightScale),
		spacing: scaleSpacing(preset.spacingScale),
		borderRadius: scaleRadius(preset.radiusScale),
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
		touchTarget: preset.touchTarget,
		shadowProfile: {
			opacityScale: preset.shadowOpacityScale,
			radiusScale: preset.shadowRadiusScale,
			elevationScale: preset.shadowElevationScale,
		},
	};
}
