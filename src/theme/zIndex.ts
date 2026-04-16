import { Z_INDEX_TOKENS } from './designTokens';

/**
 * Central z-index scale for web-style stacking contexts and shared overlay ordering.
 * Keep all new layering values here so generated token exports stay aligned.
 */
export const Z_INDEX = {
	...Z_INDEX_TOKENS,
} as const;
