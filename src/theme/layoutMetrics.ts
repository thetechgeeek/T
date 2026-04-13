/** Spacing scale (px) — use via `theme.spacing` */
export const SPACING_PX = {
	xs: 4,
	sm: 8,
	md: 12,
	lg: 16,
	xl: 24,
	'2xl': 32,
	'3xl': 48,
	'4xl': 64,
} as const;

/** Large enough to fully round any practical on-screen component (pill / circle) */
const BORDER_RADIUS_FULL_ROUND_PX = 9999;

/** Border radii (px) */
export const BORDER_RADIUS_PX = {
	none: 0,
	xs: 2,
	sm: 4,
	md: 8,
	lg: 12,
	xl: 16,
	full: BORDER_RADIUS_FULL_ROUND_PX,
} as const;

const ANIMATION_DURATION_FAST_MS = 150;

export const ANIMATION_MS = {
	fast: ANIMATION_DURATION_FAST_MS,
	normal: 200,
	slow: 400,
} as const;

export const SPRING_PHYSICS = {
	damping: 20,
	stiffness: 200,
} as const;

/** Minimum tap target (accessibility) */
export const TOUCH_TARGET_MIN_PX = 48;
