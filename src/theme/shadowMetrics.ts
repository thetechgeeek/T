/**
 * iOS shadow opacities and Android elevation steps — keep in one place with theme shadows.
 */

const OPACITY_XS_DARK = 0.2;
const OPACITY_XS_LIGHT = 0.05;
const OPACITY_SM_DARK = 0.3;
const OPACITY_SM_LIGHT = 0.08;
const OPACITY_MD_DARK = 0.4;
const OPACITY_MD_LIGHT = 0.12;
const OPACITY_LG_DARK = 0.5;
const OPACITY_LG_LIGHT = 0.16;

export const SHADOW_IOS = {
	xs: { dark: OPACITY_XS_DARK, light: OPACITY_XS_LIGHT },
	sm: { dark: OPACITY_SM_DARK, light: OPACITY_SM_LIGHT },
	md: { dark: OPACITY_MD_DARK, light: OPACITY_MD_LIGHT },
	lg: { dark: OPACITY_LG_DARK, light: OPACITY_LG_LIGHT },
} as const;

export const SHADOW_OFFSET = {
	xs: { width: 0, height: 1 },
	sm: { width: 0, height: 1 },
	md: { width: 0, height: 3 },
	lg: { width: 0, height: 6 },
} as const;

export const SHADOW_RADIUS = { xs: 1, sm: 2, md: 6, lg: 12 } as const;

export const ELEVATION = { xs: 1, sm: 2, md: 4, lg: 8 } as const;

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
