import type { Theme, ThemeContrastMode, ThemePresetId } from './index';
import { Platform } from 'react-native';
import {
	darkColors as baseDarkColors,
	partyAvatarColors,
	expenseCategoryPickColors,
	chartQualitativeColors,
	lightColors as baseLightColors,
	printThemeSwatches,
	expenseReportDemoSlices,
	allTransactionsTypeColors,
} from './palette';
import {
	DATA_EMPHASIS_TOKENS,
	HERO_TOKENS,
	MEDIA_OVERLAY_TOKENS,
	SHADOW_TOKEN_RECIPES,
	SURFACE_TIER_TOKENS,
} from './designTokens';
import { PRESS_OPACITY } from './animations';
import { BORDER_WIDTH_PX } from './layoutMetrics';
import { ELEVATION, SHADOW_IOS, SHADOW_OFFSET, SHADOW_RADIUS } from './shadowMetrics';
import {
	OPACITY_BUSY,
	OPACITY_INACTIVE,
	OPACITY_PANEL,
	OPACITY_TINT_LIGHT,
	OPACITY_TINT_STRONG,
	OPACITY_TINT_SUBTLE,
	LETTER_SPACING_ACCOUNT,
	LETTER_SPACING_SECTION,
	RADIUS_FAB,
	SIZE_BUTTON_HEIGHT_LG,
	SIZE_BUTTON_HEIGHT_SM,
	SIZE_CHIP_HEIGHT,
	SIZE_FAB,
	SIZE_FAB_ICON,
	SIZE_ICON_MD,
} from './uiMetrics';
import { buildDensitySpacingSet, resolveThemePreset, THEME_PRESET_OPTIONS } from './presets';
import { detectPixelRatio } from './density';

export const DEFAULT_THEME_PRESET_ID: ThemePresetId = 'baseline';

const COLLECTIONS: Theme['collections'] = {
	partyAvatarColors,
	expenseCategoryPickColors,
	chartQualitativeColors,
	printThemeSwatches,
	expenseReportDemoSlices,
	allTransactionsTypeColors,
};

const scaleShadowValue = (value: number, scale: number, minimum = 0) =>
	Math.max(minimum, Number((value * scale).toFixed(2)));

const BADGE_PADDING_X_SM = 6;
const BADGE_PADDING_X_MD = 10;
const BADGE_PADDING_Y_SM = 2;
const BADGE_PADDING_Y_MD = 4;
const CHIP_HEIGHT_SM = 28;
const OVERLAY_OPACITY = 0.4;
const SCRIM_OPACITY = 0.6;
const LETTER_SPACING_TIGHT = -0.2;
const LETTER_SPACING_NORMAL = 0;
const LETTER_SPACING_WIDE = 0.4;

const buildSemanticSpacing = (spacing: Theme['spacing']): Theme['semanticSpacing'] => ({
	screenPadding: spacing.lg,
	sectionGap: spacing.xl,
	cardPadding: spacing.md,
	itemGap: spacing.md,
	fieldGap: spacing.sm,
	inlineGap: spacing.sm,
	clusterGap: spacing.xs,
});

const buildOpacity = (): Theme['opacity'] => ({
	pressed: PRESS_OPACITY.pressed,
	disabled: OPACITY_BUSY,
	inactive: OPACITY_INACTIVE,
	subtle: OPACITY_TINT_SUBTLE,
	soft: OPACITY_TINT_LIGHT,
	medium: OPACITY_PANEL,
	strong: OPACITY_TINT_STRONG,
	overlay: OVERLAY_OPACITY,
	scrim: SCRIM_OPACITY,
});

const buildLetterSpacing = (): Theme['letterSpacing'] => ({
	tight: LETTER_SPACING_TIGHT,
	normal: LETTER_SPACING_NORMAL,
	wide: LETTER_SPACING_WIDE,
	section: LETTER_SPACING_SECTION,
	account: LETTER_SPACING_ACCOUNT,
});

function resolveColorVariant(isDark: boolean, contrastMode: ThemeContrastMode) {
	if (contrastMode === 'high') {
		return isDark ? 'highContrastDark' : 'highContrastLight';
	}

	return isDark ? 'dark' : 'light';
}

const buildVisualTokens = ({
	colors,
	borderRadius,
	isDark,
	meta,
	shadowProfile,
}: {
	colors: Theme['colors'];
	borderRadius: Theme['borderRadius'];
	isDark: boolean;
	meta: Theme['meta'];
	shadowProfile: {
		opacityScale: number;
		radiusScale: number;
		elevationScale: number;
	};
}): Theme['visual'] => {
	const variant = resolveColorVariant(isDark, meta.contrastMode);
	const surfaceTokens = SURFACE_TIER_TOKENS[variant];
	const mediaTokens = MEDIA_OVERLAY_TOKENS[variant];
	const heroTokens = HERO_TOKENS[variant];
	const dataTokens = DATA_EMPHASIS_TOKENS[variant];
	const depthRecipe = SHADOW_TOKEN_RECIPES[variant].md;

	return {
		surfaces: {
			canvas: surfaceTokens.canvas,
			default: surfaceTokens.default,
			raised: surfaceTokens.raised,
			overlay: surfaceTokens.overlay,
			inverse: surfaceTokens.inverse,
			onInverse: surfaceTokens.onInverse,
			hero: surfaceTokens.hero,
			onHero: surfaceTokens.onHero,
			quiet: surfaceTokens.quiet,
			mediaFallback: surfaceTokens.mediaFallback,
		},
		accents: {
			primaryAction: colors.primary,
			selected: colors.primary,
			dataHighlight: colors.info,
			quietTint: colors.primaryContainer,
			destructive: colors.error,
			maxHotspots: meta.accentBudget,
		},
		data: {
			focusSeries: colors.primary,
			comparisonSeries: dataTokens.comparisonSeries,
			mutedSeries: dataTokens.mutedSeries,
			quietGrid: dataTokens.quietGrid,
			annotation: dataTokens.annotation,
		},
		hero: {
			screen: {
				surface: heroTokens.screen.surface,
				onSurface: heroTokens.screen.onSurface,
				accent: colors.primary,
			},
			stat: {
				surface: heroTokens.stat.surface,
				onSurface: heroTokens.stat.onSurface,
				accent: heroTokens.stat.accent,
			},
			promo: {
				surface: heroTokens.promo.surface,
				onSurface: heroTokens.promo.onSurface,
				accent: heroTokens.promo.accent,
			},
		},
		media: {
			scrimSoft: mediaTokens.scrimSoft,
			scrimStrong: mediaTokens.scrimStrong,
			textGradientStart: mediaTokens.textGradientStart,
			textGradientEnd: mediaTokens.textGradientEnd,
			fallbackSurface: mediaTokens.fallbackSurface,
		},
		silhouette: {
			card: borderRadius.md,
			control: borderRadius.md,
			chip: borderRadius.full,
			avatar: borderRadius.full,
			overlay: borderRadius.lg,
		},
		depth: {
			ambientShadowOpacity: Number(
				(depthRecipe.opacity * shadowProfile.opacityScale).toFixed(2),
			),
			ambientShadowBlur: Number((depthRecipe.blur * shadowProfile.radiusScale).toFixed(2)),
			ambientShadowYOffset: Number((depthRecipe.y * shadowProfile.elevationScale).toFixed(2)),
			lowContrastBorder: colors.border,
			harshShadowAvoided: true,
		},
		presentation: {
			defaultSurfaceBias: meta.expression === 'showcase' ? 'brand' : 'neutral',
			showcaseDensity: 'spacious',
			operationalDensity: 'compact',
			inverseAction: 'required',
			heroMediaAllowed: meta.expression === 'showcase',
			brandExpressionZones:
				meta.expression === 'showcase' ? ['hero', 'promo', 'media'] : ['hero'],
			neutralSurfaceTiers: ['canvas', 'default', 'raised', 'overlay'],
			inverseActionSurfaces: ['hero', 'media', 'inverse'],
		},
	};
};

const buildComponentTokens = ({
	spacing,
	borderRadius,
	borderWidth,
	touchTarget,
}: Pick<
	Theme,
	'spacing' | 'borderRadius' | 'borderWidth' | 'touchTarget'
>): Theme['components'] => ({
	button: {
		heights: {
			sm: SIZE_BUTTON_HEIGHT_SM,
			md: touchTarget,
			lg: SIZE_BUTTON_HEIGHT_LG,
		},
		paddingX: {
			sm: spacing.lg,
			md: spacing.xl,
			lg: spacing['2xl'],
		},
		radius: borderRadius.md,
		outlineWidth: borderWidth.sm,
		iconGap: spacing.sm,
	},
	badge: {
		paddingX: {
			sm: BADGE_PADDING_X_SM,
			md: BADGE_PADDING_X_MD,
		},
		paddingY: {
			sm: BADGE_PADDING_Y_SM,
			md: BADGE_PADDING_Y_MD,
		},
		radius: borderRadius.full,
	},
	chip: {
		heights: {
			sm: CHIP_HEIGHT_SM,
			md: SIZE_CHIP_HEIGHT,
		},
		paddingX: {
			sm: 10,
			md: spacing.lg,
		},
		paddingY: {
			sm: spacing.xs,
			md: spacing.sm,
		},
		radius: borderRadius.full,
		gap: spacing.xs,
	},
	card: {
		padding: {
			sm: spacing.sm,
			md: spacing.md,
			lg: spacing.lg,
		},
		radius: borderRadius.md,
	},
	input: {
		minHeight: touchTarget,
		radius: borderRadius.md,
		borderWidth: borderWidth.sm,
		errorBorderWidth: borderWidth.md,
		paddingX: spacing.md,
		paddingY: spacing.sm,
		labelGap: spacing.xs,
		helperGap: spacing.xs,
		iconGap: spacing.sm,
	},
	searchBar: {
		height: spacing['3xl'],
		radius: borderRadius.md,
		paddingX: spacing.md,
		iconGap: spacing.sm,
		iconSize: SIZE_ICON_MD,
	},
	iconButton: {
		minSize: touchTarget,
		labelGap: spacing.xxs,
	},
	fab: {
		size: SIZE_FAB,
		radius: RADIUS_FAB,
		iconSize: SIZE_FAB_ICON,
	},
});

const makeShadows = (
	shadowColor: string,
	isDark: boolean,
	profile: { opacityScale: number; radiusScale: number; elevationScale: number },
): Theme['shadows'] => {
	const iosShadow = shadowColor;
	return {
		xs:
			Platform?.select({
				ios: {
					shadowColor: iosShadow,
					shadowOffset: SHADOW_OFFSET.xs,
					shadowOpacity: scaleShadowValue(
						isDark ? SHADOW_IOS.xs.dark : SHADOW_IOS.xs.light,
						profile.opacityScale,
					),
					shadowRadius: scaleShadowValue(SHADOW_RADIUS.xs, profile.radiusScale),
				},
				android: {
					elevation: scaleShadowValue(ELEVATION.xs, profile.elevationScale),
				},
				default: {},
			}) ?? {},
		sm:
			Platform?.select({
				ios: {
					shadowColor: iosShadow,
					shadowOffset: SHADOW_OFFSET.sm,
					shadowOpacity: scaleShadowValue(
						isDark ? SHADOW_IOS.sm.dark : SHADOW_IOS.sm.light,
						profile.opacityScale,
					),
					shadowRadius: scaleShadowValue(SHADOW_RADIUS.sm, profile.radiusScale),
				},
				android: {
					elevation: scaleShadowValue(ELEVATION.sm, profile.elevationScale),
				},
				default: {},
			}) ?? {},
		md:
			Platform?.select({
				ios: {
					shadowColor: iosShadow,
					shadowOffset: SHADOW_OFFSET.md,
					shadowOpacity: scaleShadowValue(
						isDark ? SHADOW_IOS.md.dark : SHADOW_IOS.md.light,
						profile.opacityScale,
					),
					shadowRadius: scaleShadowValue(SHADOW_RADIUS.md, profile.radiusScale),
				},
				android: {
					elevation: scaleShadowValue(ELEVATION.md, profile.elevationScale),
				},
				default: {},
			}) ?? {},
		lg:
			Platform?.select({
				ios: {
					shadowColor: iosShadow,
					shadowOffset: SHADOW_OFFSET.lg,
					shadowOpacity: scaleShadowValue(
						isDark ? SHADOW_IOS.lg.dark : SHADOW_IOS.lg.light,
						profile.opacityScale,
					),
					shadowRadius: scaleShadowValue(SHADOW_RADIUS.lg, profile.radiusScale),
				},
				android: {
					elevation: scaleShadowValue(ELEVATION.lg, profile.elevationScale),
				},
				default: {},
			}) ?? {},
		xl:
			Platform?.select({
				ios: {
					shadowColor: iosShadow,
					shadowOffset: SHADOW_OFFSET.xl,
					shadowOpacity: scaleShadowValue(
						isDark ? SHADOW_IOS.xl.dark : SHADOW_IOS.xl.light,
						profile.opacityScale,
					),
					shadowRadius: scaleShadowValue(SHADOW_RADIUS.xl, profile.radiusScale),
				},
				android: {
					elevation: scaleShadowValue(ELEVATION.xl, profile.elevationScale),
				},
				default: {},
			}) ?? {},
	};
};

const buildElevationTokens = (shadows: Theme['shadows']): Theme['elevation'] => ({
	flat: {},
	raised: shadows.sm,
	overlay: shadows.md,
	modal: shadows.lg,
	tooltip: shadows.xl,
});

export function buildTheme(
	isDark: boolean,
	presetId: ThemePresetId = DEFAULT_THEME_PRESET_ID,
	options: {
		contrastMode?: ThemeContrastMode;
		pixelRatio?: number;
	} = {},
): Theme {
	const contrastMode = options.contrastMode ?? 'default';
	const pixelRatio = options.pixelRatio ?? detectPixelRatio();
	const preset = resolveThemePreset(presetId, isDark, { contrastMode, pixelRatio });
	const borderWidth: Theme['borderWidth'] = {
		...BORDER_WIDTH_PX,
	};
	const spacing = preset.spacing;
	const borderRadius = preset.borderRadius;
	const opacity = buildOpacity();
	const shadows = makeShadows(preset.colors.shadow, isDark, preset.shadowProfile);
	const visual = buildVisualTokens({
		colors: preset.colors,
		borderRadius,
		isDark,
		meta: preset.meta,
		shadowProfile: preset.shadowProfile,
	});
	return {
		isDark,
		meta: preset.meta,
		colors: preset.colors,
		typography: preset.typography,
		spacing,
		semanticSpacing: buildSemanticSpacing(spacing),
		densitySpacing: buildDensitySpacingSet(pixelRatio),
		letterSpacing: buildLetterSpacing(),
		borderRadius,
		borderWidth,
		shadows,
		elevation: buildElevationTokens(shadows),
		animation: preset.animation,
		opacity,
		visual,
		components: buildComponentTokens({
			spacing,
			borderRadius,
			borderWidth,
			touchTarget: preset.touchTarget,
		}),
		collections: COLLECTIONS,
		touchTarget: preset.touchTarget,
	};
}

export const lightTheme = buildTheme(false, DEFAULT_THEME_PRESET_ID, { pixelRatio: 2 });
export const darkTheme = buildTheme(true, DEFAULT_THEME_PRESET_ID, { pixelRatio: 2 });
export const highContrastLightTheme = buildTheme(false, DEFAULT_THEME_PRESET_ID, {
	contrastMode: 'high',
	pixelRatio: 2,
});
export const highContrastDarkTheme = buildTheme(true, DEFAULT_THEME_PRESET_ID, {
	contrastMode: 'high',
	pixelRatio: 2,
});
export const lightColors = lightTheme.colors;
export const darkColors = darkTheme.colors;
export const themePresetOptions = THEME_PRESET_OPTIONS;
export const legacyLightColors = baseLightColors;
export const legacyDarkColors = baseDarkColors;
