import { StyleSheet } from 'react-native';

/** Spacing scale (px) — use via `theme.spacing` */
export const SPACING_PX = {
	xxs: 2,
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

/** Border widths (px) */
export const BORDER_WIDTH_PX = {
	none: 0,
	hairline: StyleSheet.hairlineWidth,
	sm: 1,
	md: 2,
	lg: 3,
} as const;

export const ANIMATION_MS = {
	instant: 0,
	micro: 100,
	fast: 200,
	normal: 300,
	slow: 500,
} as const;

const SPRING_BOUNCE_MASS = 0.8;

export const SPRING_PHYSICS = {
	damping: 20,
	stiffness: 200,
	mass: 1,
	press: {
		damping: 15,
		stiffness: 180,
		mass: 1,
	},
	bounce: {
		damping: 10,
		stiffness: 200,
		mass: SPRING_BOUNCE_MASS,
	},
} as const;

/** Minimum tap target (accessibility) */
export const TOUCH_TARGET_MIN_PX = 48;
