/**
 * Typography scale (sizes, line heights, weights) — single source for theme typography tokens.
 */

/** Line heights (px), paired with `FONT_SIZE` */
const LH_DISPLAY_PX = 45;
const LH_H1_PX = 36;
const LH_H2_PX = 30;
const LH_H3_PX = 28;
const LH_BODY_PX = 24;
const LH_CAPTION_PX = 21;
const LH_LABEL_PX = 18;
const LH_CAPTION_SMALL_PX = 16;
const LH_AMOUNT_PX = 30;
const LH_AMOUNT_LARGE_PX = 42;

const RATIO_LINE_TIGHT = 1.2;
const RATIO_LINE_NORMAL = 1.5;
const RATIO_LINE_RELAXED = 1.75;

export const FONT_SIZE = {
	display: 30,
	h1: 24,
	h2: 20,
	h3: 18,
	body: 16,
	caption: 14,
	label: 13,
	captionSmall: 11,
	amount: 20,
	amountLarge: 28,
} as const;

export const LINE_HEIGHT = {
	display: LH_DISPLAY_PX,
	h1: LH_H1_PX,
	h2: LH_H2_PX,
	h3: LH_H3_PX,
	body: LH_BODY_PX,
	caption: LH_CAPTION_PX,
	label: LH_LABEL_PX,
	captionSmall: LH_CAPTION_SMALL_PX,
	amount: LH_AMOUNT_PX,
	amountLarge: LH_AMOUNT_LARGE_PX,
} as const;

export const LINE_HEIGHT_RATIO = {
	tight: RATIO_LINE_TIGHT,
	normal: RATIO_LINE_NORMAL,
	relaxed: RATIO_LINE_RELAXED,
} as const;

export const FONT_SIZE_SCALE = {
	xs: 11,
	sm: 13,
	md: 14,
	lg: 16,
	xl: 18,
	'2xl': 20,
	'3xl': 24,
} as const;
