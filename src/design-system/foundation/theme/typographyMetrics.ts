/**
 * Typography scale (sizes, line heights, weights) — single source for theme typography tokens.
 */
import { FONT_SIZE_TOKENS, LINE_HEIGHT_TOKENS } from './designTokens';

export const FONT_SIZE = {
	display: FONT_SIZE_TOKENS['display-sm'],
	h1: FONT_SIZE_TOKENS['3xl'],
	h2: FONT_SIZE_TOKENS['2xl'],
	h3: FONT_SIZE_TOKENS.xl,
	body: FONT_SIZE_TOKENS.lg,
	caption: FONT_SIZE_TOKENS.sm,
	label: FONT_SIZE_TOKENS.sm,
	captionSmall: FONT_SIZE_TOKENS.xs,
	amount: FONT_SIZE_TOKENS['2xl'],
	amountLarge: FONT_SIZE_TOKENS['4xl'],
} as const;

export const LINE_HEIGHT = {
	display: LINE_HEIGHT_TOKENS.display,
	h1: LINE_HEIGHT_TOKENS.h1,
	h2: LINE_HEIGHT_TOKENS.h2,
	h3: LINE_HEIGHT_TOKENS.h3,
	body: LINE_HEIGHT_TOKENS.body,
	caption: LINE_HEIGHT_TOKENS.caption,
	label: LINE_HEIGHT_TOKENS.label,
	captionSmall: LINE_HEIGHT_TOKENS.captionSmall,
	amount: LINE_HEIGHT_TOKENS.amount,
	amountLarge: LINE_HEIGHT_TOKENS.amountLarge,
} as const;

export const LINE_HEIGHT_RATIO = {
	tight: LINE_HEIGHT_TOKENS.tight,
	normal: LINE_HEIGHT_TOKENS.normal,
	relaxed: LINE_HEIGHT_TOKENS.relaxed,
} as const;

export const FONT_SIZE_SCALE = {
	xs: FONT_SIZE_TOKENS.xs,
	sm: FONT_SIZE_TOKENS.sm,
	md: FONT_SIZE_TOKENS.md,
	lg: FONT_SIZE_TOKENS.lg,
	xl: FONT_SIZE_TOKENS.xl,
	'2xl': FONT_SIZE_TOKENS['2xl'],
	'3xl': FONT_SIZE_TOKENS['3xl'],
	'4xl': FONT_SIZE_TOKENS['4xl'],
} as const;
