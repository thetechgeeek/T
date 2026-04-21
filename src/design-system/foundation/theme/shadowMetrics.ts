/**
 * iOS shadow opacities and Android elevation steps — keep in one place with theme shadows.
 */
import { SHADOW_TOKEN_RECIPES } from './designTokens';

export const SHADOW_IOS = {
	xs: {
		dark: SHADOW_TOKEN_RECIPES.dark.xs.opacity,
		light: SHADOW_TOKEN_RECIPES.light.xs.opacity,
	},
	sm: {
		dark: SHADOW_TOKEN_RECIPES.dark.sm.opacity,
		light: SHADOW_TOKEN_RECIPES.light.sm.opacity,
	},
	md: {
		dark: SHADOW_TOKEN_RECIPES.dark.md.opacity,
		light: SHADOW_TOKEN_RECIPES.light.md.opacity,
	},
	lg: {
		dark: SHADOW_TOKEN_RECIPES.dark.lg.opacity,
		light: SHADOW_TOKEN_RECIPES.light.lg.opacity,
	},
	xl: {
		dark: SHADOW_TOKEN_RECIPES.dark.xl.opacity,
		light: SHADOW_TOKEN_RECIPES.light.xl.opacity,
	},
} as const;

export const SHADOW_OFFSET = {
	xs: { width: 0, height: SHADOW_TOKEN_RECIPES.light.xs.y },
	sm: { width: 0, height: SHADOW_TOKEN_RECIPES.light.sm.y },
	md: { width: 0, height: SHADOW_TOKEN_RECIPES.light.md.y },
	lg: { width: 0, height: SHADOW_TOKEN_RECIPES.light.lg.y },
	xl: { width: 0, height: SHADOW_TOKEN_RECIPES.light.xl.y },
} as const;

export const SHADOW_RADIUS = {
	xs: SHADOW_TOKEN_RECIPES.light.xs.blur,
	sm: SHADOW_TOKEN_RECIPES.light.sm.blur,
	md: SHADOW_TOKEN_RECIPES.light.md.blur,
	lg: SHADOW_TOKEN_RECIPES.light.lg.blur,
	xl: SHADOW_TOKEN_RECIPES.light.xl.blur,
} as const;

export const ELEVATION = {
	xs: SHADOW_TOKEN_RECIPES.light.xs.elevation,
	sm: SHADOW_TOKEN_RECIPES.light.sm.elevation,
	md: SHADOW_TOKEN_RECIPES.light.md.elevation,
	lg: SHADOW_TOKEN_RECIPES.light.lg.elevation,
	xl: SHADOW_TOKEN_RECIPES.light.xl.elevation,
} as const;

/**
 * Standard React Native floating action button (FAB) / card shadow for Android.
 * These are the values recommended in the RN docs for a subtle lifted appearance.
 */
const FAB_SHADOW_OPACITY_VALUE = 0.25;
const FAB_SHADOW_RADIUS_VALUE = 3.84;

export const FAB_SHADOW = {
	shadowOpacity: FAB_SHADOW_OPACITY_VALUE,
	shadowRadius: FAB_SHADOW_RADIUS_VALUE,
} as const;
