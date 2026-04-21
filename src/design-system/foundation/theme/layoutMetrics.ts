import { StyleSheet } from 'react-native';
import {
	BORDER_WIDTH_TOKENS,
	DURATION_TOKENS,
	RADIUS_TOKENS,
	SPACING_TOKENS,
	SPRING_TOKENS,
} from './designTokens';

/** Spacing scale (px) — use via `theme.spacing` */
export const SPACING_PX = {
	...SPACING_TOKENS,
} as const;

/** Border radii (px) */
export const BORDER_RADIUS_PX = {
	...RADIUS_TOKENS,
} as const;

/** Border widths (px) */
export const BORDER_WIDTH_PX = {
	...BORDER_WIDTH_TOKENS,
	hairline: StyleSheet.hairlineWidth,
} as const;

export const ANIMATION_MS = {
	...DURATION_TOKENS,
} as const;

export const SPRING_PHYSICS = {
	...SPRING_TOKENS.default,
	press: {
		...SPRING_TOKENS.press,
	},
	bounce: {
		...SPRING_TOKENS.bounce,
	},
} as const;

/** Minimum tap target (accessibility) */
export const TOUCH_TARGET_MIN_PX = 48;
