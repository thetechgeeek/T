/**
 * Formats a number in Indian currency format.
 * E.g., 100000 -> "1,00,000"
 * E.g., 1234567.50 -> "12,34,567.50"
 */
import {
	AMOUNT_SHORT_FORMAT_ONE_CRORE,
	AMOUNT_SHORT_FORMAT_ONE_LAKH,
	AMOUNT_SHORT_FORMAT_ONE_THOUSAND,
	DEFAULT_DISPLAY_FRACTION_DIGITS,
	INDIAN_PLACE_CRORE,
	INDIAN_PLACE_HUNDRED,
	INDIAN_PLACE_LAKH,
	INDIAN_PLACE_THOUSAND,
	INDIAN_PLACE_TWENTY,
	INDIAN_GROUPING_TAIL_DIGIT_COUNT,
	INR_MINOR_UNITS_PER_MAJOR,
} from '@/constants/money';

export function formatINR(
	amount: number,
	showSymbol = true,
	decimals: number = DEFAULT_DISPLAY_FRACTION_DIGITS,
): string {
	const fixed = amount.toFixed(decimals);
	const [intPart, decPart] = fixed.split('.');
	const num = parseInt(intPart, 10);

	// Indian grouping: last block (tail digits), then groups of 2
	const tail = INDIAN_GROUPING_TAIL_DIGIT_COUNT;
	const lastThree = String(Math.abs(num)).slice(-tail);
	const rest = String(Math.abs(num)).slice(0, -tail);
	const grouped =
		rest.length > 0 ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree : lastThree;

	const sign = amount < 0 ? '-' : '';
	const formatted = decimals > 0 ? `${grouped}.${decPart}` : `${grouped}`;
	return showSymbol ? `${sign}₹${formatted}` : `${sign}${formatted}`;
}

/**
 * Parses an INR formatted string back to a number.
 */
export function parseINR(value: string): number {
	const cleaned = value.replace(/[₹,\s]/g, '');
	return parseFloat(cleaned) || 0;
}

/**
 * Format large numbers with lakhs/crores suffix for display.
 * E.g., 150000 -> "1.5L", 10000000 -> "1Cr"
 */
export function formatINRShort(amount: number, lang: 'en' | 'hi' = 'en'): string {
	const suffix = {
		en: { lakh: 'L', crore: 'Cr', thousand: 'K' },
		hi: { lakh: ' लाख', crore: ' करोड़', thousand: ' हजार' },
	}[lang];

	if (amount >= AMOUNT_SHORT_FORMAT_ONE_CRORE) {
		return `₹${(amount / AMOUNT_SHORT_FORMAT_ONE_CRORE).toFixed(1)}${suffix.crore}`;
	}
	if (amount >= AMOUNT_SHORT_FORMAT_ONE_LAKH) {
		return `₹${(amount / AMOUNT_SHORT_FORMAT_ONE_LAKH).toFixed(1)}${suffix.lakh}`;
	}
	if (amount >= AMOUNT_SHORT_FORMAT_ONE_THOUSAND) {
		return `₹${(amount / AMOUNT_SHORT_FORMAT_ONE_THOUSAND).toFixed(1)}${suffix.thousand}`;
	}
	return `₹${amount.toFixed(0)}`;
}

/**
 * Converts a number to Indian words (for invoice totals).
 */
export function numberToIndianWords(amount: number, lang: 'en' | 'hi' = 'en'): string {
	if (lang === 'hi') {
		return numberToHindiWords(amount);
	}

	const ones = [
		'',
		'One',
		'Two',
		'Three',
		'Four',
		'Five',
		'Six',
		'Seven',
		'Eight',
		'Nine',
		'Ten',
		'Eleven',
		'Twelve',
		'Thirteen',
		'Fourteen',
		'Fifteen',
		'Sixteen',
		'Seventeen',
		'Eighteen',
		'Nineteen',
	];
	const tens = [
		'',
		'',
		'Twenty',
		'Thirty',
		'Forty',
		'Fifty',
		'Sixty',
		'Seventy',
		'Eighty',
		'Ninety',
	];

	function convert(n: number): string {
		if (n === 0) return '';
		if (n < INDIAN_PLACE_TWENTY) return ones[n] + ' ';
		if (n < INDIAN_PLACE_HUNDRED) return tens[Math.floor(n / 10)] + ' ' + convert(n % 10);
		if (n < INDIAN_PLACE_THOUSAND)
			return (
				ones[Math.floor(n / INDIAN_PLACE_HUNDRED)] +
				' Hundred ' +
				convert(n % INDIAN_PLACE_HUNDRED)
			);
		if (n < INDIAN_PLACE_LAKH)
			return (
				convert(Math.floor(n / INDIAN_PLACE_THOUSAND)) +
				'Thousand ' +
				convert(n % INDIAN_PLACE_THOUSAND)
			);
		if (n < INDIAN_PLACE_CRORE)
			return (
				convert(Math.floor(n / INDIAN_PLACE_LAKH)) +
				'Lakh ' +
				convert(n % INDIAN_PLACE_LAKH)
			);
		return (
			convert(Math.floor(n / INDIAN_PLACE_CRORE)) + 'Crore ' + convert(n % INDIAN_PLACE_CRORE)
		);
	}

	const rupees = Math.floor(amount);
	const paise = Math.round((amount - rupees) * INR_MINOR_UNITS_PER_MAJOR);

	let result = convert(rupees).trim();
	if (result === '') result = 'Zero';
	result += ' Rupees';
	if (paise > 0) result += ' and ' + convert(paise).trim() + ' Paise';
	result += ' Only';
	return result;
}

/**
 * Internal helper for Hindi currency words conversion.
 */
function numberToHindiWords(amount: number): string {
	const ones = [
		'',
		'एक',
		'दो',
		'तीन',
		'चार',
		'पाँच',
		'छह',
		'सात',
		'आठ',
		'नौ',
		'दस',
		'ग्यारह',
		'बारह',
		'तेरह',
		'चौदह',
		'पन्द्रह',
		'सोलह',
		'सत्रह',
		'अठारह',
		'उन्नीस',
	];
	const tens = ['', '', 'बीस', 'तीस', 'चालीस', 'पचास', 'साठ', 'सत्तर', 'अस्सी', 'नब्बे'];

	function convert(n: number): string {
		if (n === 0) return '';
		if (n < INDIAN_PLACE_TWENTY) return ones[n] + ' ';
		if (n < INDIAN_PLACE_HUNDRED) return tens[Math.floor(n / 10)] + ' ' + convert(n % 10);
		if (n < INDIAN_PLACE_THOUSAND)
			return (
				ones[Math.floor(n / INDIAN_PLACE_HUNDRED)] +
				' सौ ' +
				convert(n % INDIAN_PLACE_HUNDRED)
			);
		if (n < INDIAN_PLACE_LAKH)
			return (
				convert(Math.floor(n / INDIAN_PLACE_THOUSAND)) +
				' हजार ' +
				convert(n % INDIAN_PLACE_THOUSAND)
			);
		if (n < INDIAN_PLACE_CRORE)
			return (
				convert(Math.floor(n / INDIAN_PLACE_LAKH)) +
				' लाख ' +
				convert(n % INDIAN_PLACE_LAKH)
			);
		return (
			convert(Math.floor(n / INDIAN_PLACE_CRORE)) +
			' करोड़ ' +
			convert(n % INDIAN_PLACE_CRORE)
		);
	}

	const rupees = Math.floor(amount);
	const paise = Math.round((amount - rupees) * INR_MINOR_UNITS_PER_MAJOR);

	let result = convert(rupees).trim();
	if (result === '') result = 'शून्य';
	result += ' रुपये';
	if (paise > 0) result += ' और ' + convert(paise).trim() + ' पैसे';
	result += ' मात्र';
	return result;
}
