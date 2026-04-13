/**
 * P0.9 — Indian Number & Date Formatting utilities
 *
 * formatCurrency — enhanced Indian currency formatting with compact Hindi/English support
 * formatQuantity — quantity formatting with configurable decimal places
 */

import {
	AMOUNT_SHORT_FORMAT_ONE_CRORE,
	AMOUNT_SHORT_FORMAT_ONE_LAKH,
	INDIAN_GROUPING_TAIL_DIGIT_COUNT,
} from '@/constants/money';

export type SupportedLanguage = 'hi' | 'en';

export interface FormatCurrencyOptions {
	/** Number of decimal places. Default 0. */
	decimals?: 0 | 2;
	/** Use compact notation (lakh/crore). */
	compact?: boolean;
	/** Language for compact labels. Default 'en'. */
	language?: SupportedLanguage;
}

/**
 * Format amount with Indian number grouping.
 * E.g., 100000 → "1,00,000"
 */
function indianGrouping(int: number): string {
	const str = String(Math.abs(Math.floor(int)));
	const tail = INDIAN_GROUPING_TAIL_DIGIT_COUNT;
	if (str.length <= tail) return str;
	const lastBlock = str.slice(-tail);
	const rest = str.slice(0, -tail);
	return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastBlock;
}

const COMPACT_EN: [number, string][] = [
	[AMOUNT_SHORT_FORMAT_ONE_CRORE, 'Crore'],
	[AMOUNT_SHORT_FORMAT_ONE_LAKH, 'Lakh'],
];

const COMPACT_HI: [number, string][] = [
	[AMOUNT_SHORT_FORMAT_ONE_CRORE, 'करोड़'],
	[AMOUNT_SHORT_FORMAT_ONE_LAKH, 'लाख'],
];

/**
 * P0.9 — formatCurrency
 *
 * Default: `₹ 1,00,000` (no decimals, Indian grouping)
 * decimals:2 → `₹ 1,00,000.50`
 * compact + 'en' → `₹ 1 Lakh`, `₹ 1 Crore`
 * compact + 'hi' → `₹ 1 लाख`, `₹ 1 करोड़`
 * Negative: `- ₹ 5,000`
 * Zero: `₹ 0`
 */
export function formatCurrency(amount: number, options: FormatCurrencyOptions = {}): string {
	const { decimals = 0, compact = false, language = 'en' } = options;

	const isNegative = amount < 0;
	const abs = Math.abs(amount);

	// Compact mode
	if (compact) {
		const table = language === 'hi' ? COMPACT_HI : COMPACT_EN;
		for (const [divisor, label] of table) {
			if (abs >= divisor) {
				const count = Math.round(abs / divisor);
				const prefix = isNegative ? '- ' : '';
				return `${prefix}₹ ${count} ${label}`;
			}
		}
	}

	// Standard formatting
	const intPart = indianGrouping(abs);
	let result: string;

	if (decimals === 2) {
		const dec = abs.toFixed(2).split('.')[1] ?? '00';
		result = `${intPart}.${dec}`;
	} else {
		result = intPart;
	}

	if (abs === 0) result = '0';

	const prefix = isNegative ? '- ' : '';
	return `${prefix}₹ ${result}`;
}

/**
 * P0.9 — formatQuantity
 * `100 Pcs`, `2.50 Kg`, `10.500 Ltr`
 */
export function formatQuantity(qty: number, unit: string, decimalPlaces: 0 | 2 | 3): string {
	const formatted = qty.toFixed(decimalPlaces);
	return `${formatted} ${unit}`;
}
