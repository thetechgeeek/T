/**
 * Formats a number in Indian currency format.
 * E.g., 100000 -> "1,00,000"
 * E.g., 1234567.50 -> "12,34,567.50"
 */
export function formatINR(amount: number, showSymbol = true, decimals = 2): string {
	const fixed = amount.toFixed(decimals);
	const [intPart, decPart] = fixed.split('.');
	const num = parseInt(intPart, 10);

	// Indian grouping: last 3 digits, then groups of 2
	const lastThree = String(Math.abs(num)).slice(-3);
	const rest = String(Math.abs(num)).slice(0, -3);
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

	if (amount >= 10_000_000) {
		return `₹${(amount / 10_000_000).toFixed(1)}${suffix.crore}`;
	} else if (amount >= 100_000) {
		return `₹${(amount / 100_000).toFixed(1)}${suffix.lakh}`;
	} else if (amount >= 1_000) {
		return `₹${(amount / 1_000).toFixed(1)}${suffix.thousand}`;
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
		if (n < 20) return ones[n] + ' ';
		if (n < 100) return tens[Math.floor(n / 10)] + ' ' + convert(n % 10);
		if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred ' + convert(n % 100);
		if (n < 100000) return convert(Math.floor(n / 1000)) + 'Thousand ' + convert(n % 1000);
		if (n < 10000000) return convert(Math.floor(n / 100000)) + 'Lakh ' + convert(n % 100000);
		return convert(Math.floor(n / 10000000)) + 'Crore ' + convert(n % 10000000);
	}

	const rupees = Math.floor(amount);
	const paise = Math.round((amount - rupees) * 100);

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
		if (n < 20) return ones[n] + ' ';
		if (n < 100) return tens[Math.floor(n / 10)] + ' ' + convert(n % 10);
		if (n < 1000) return ones[Math.floor(n / 100)] + ' सौ ' + convert(n % 100);
		if (n < 100000) return convert(Math.floor(n / 1000)) + ' हजार ' + convert(n % 1000);
		if (n < 10000000) return convert(Math.floor(n / 100000)) + ' लाख ' + convert(n % 100000);
		return convert(Math.floor(n / 10000000)) + ' करोड़ ' + convert(n % 10000000);
	}

	const rupees = Math.floor(amount);
	const paise = Math.round((amount - rupees) * 100);

	let result = convert(rupees).trim();
	if (result === '') result = 'शून्य';
	result += ' रुपये';
	if (paise > 0) result += ' और ' + convert(paise).trim() + ' पैसे';
	result += ' मात्र';
	return result;
}
