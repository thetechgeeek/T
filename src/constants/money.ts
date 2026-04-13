/**
 * Money & display numerics shared across the app.
 * Multi-currency: callers should eventually resolve `fractionDigits` / minor-units scale
 * from a currency registry (e.g. ISO 4217). These defaults match INR and most major currencies.
 */
export const DEFAULT_DISPLAY_FRACTION_DIGITS = 2;

/** Minor units per one major unit for INR (paise). Replace per-currency when multi-ccy lands. */
export const INR_MINOR_UNITS_PER_MAJOR = 100;

/** Short-format thresholds (Indian grouping) — amounts in major units */
export const AMOUNT_SHORT_FORMAT_ONE_CRORE = 10_000_000;
export const AMOUNT_SHORT_FORMAT_ONE_LAKH = 100_000;
export const AMOUNT_SHORT_FORMAT_ONE_THOUSAND = 1_000;

/**
 * Indian place-value thresholds used by `numberToIndianWords` in `utils/currency`.
 * Names reflect the grouping system, not a specific currency.
 */
export const INDIAN_PLACE_TWENTY = 20;
export const INDIAN_PLACE_HUNDRED = 100;
export const INDIAN_PLACE_THOUSAND = 1_000;
export const INDIAN_PLACE_LAKH = 100_000;
export const INDIAN_PLACE_CRORE = 10_000_000;

/** Digits in the rightmost Indian grouping block (hundreds + below: e.g. `12,34,567`) */
export const INDIAN_GROUPING_TAIL_DIGIT_COUNT = 3;
