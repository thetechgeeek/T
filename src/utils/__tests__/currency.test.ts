import { formatINR, formatINRShort, numberToIndianWords, parseINR } from '../currency';

describe('formatINR', () => {
	it('formats zero', () => {
		expect(formatINR(0)).toBe('₹0.00');
	});

	it('formats basic amount', () => {
		expect(formatINR(1000)).toBe('₹1,000.00');
	});

	it('formats lakhs (Indian grouping)', () => {
		expect(formatINR(100000)).toBe('₹1,00,000.00');
	});

	it('formats crores', () => {
		expect(formatINR(10000000)).toBe('₹1,00,00,000.00');
	});

	it('negative zero bug: -0 should show positive', () => {
		// The bug was: num < 0 used parsed num (which was -0 due to parsing "-0.00")
		// Fixed: use original `amount` param
		expect(formatINR(-0)).toBe('₹0.00');
		expect(formatINR(-0).startsWith('-')).toBe(false);
	});

	it('formats negative amounts', () => {
		expect(formatINR(-500)).toBe('₹-500.00');
	});

	it('omits symbol when showSymbol=false', () => {
		expect(formatINR(1000, false)).toBe('1,000.00');
	});

	it('respects decimals=0', () => {
		expect(formatINR(1500, true, 0)).toBe('₹1,500');
	});
});

describe('formatINRShort', () => {
	it('formats below 1000 as plain', () => {
		expect(formatINRShort(500)).toBe('₹500');
	});

	it('formats thousands', () => {
		expect(formatINRShort(5000)).toBe('₹5.0K');
	});

	it('formats lakhs', () => {
		expect(formatINRShort(150000)).toBe('₹1.5L');
	});

	it('formats crores', () => {
		expect(formatINRShort(10000000)).toBe('₹1.0Cr');
	});
});

describe('numberToIndianWords', () => {
	it('converts zero', () => {
		expect(numberToIndianWords(0)).toBe('Zero Rupees Only');
	});

	it('converts one', () => {
		expect(numberToIndianWords(1)).toBe('One Rupees Only');
	});

	it('converts one lakh', () => {
		expect(numberToIndianWords(100000)).toBe('One Lakh  Rupees Only');
	});

	it('includes paise', () => {
		expect(numberToIndianWords(1.5)).toContain('Paise');
	});

	it('returns a string (not the stub floor value)', () => {
		// Verify we are using the real implementation not the stub (which just returned the integer)
		const result = numberToIndianWords(500);
		expect(result).not.toBe('500');
		expect(result).toContain('Five');
	});
});

describe('parseINR', () => {
	it('parses formatted string', () => {
		expect(parseINR('₹1,00,000.00')).toBe(100000);
	});

	it('returns 0 for empty string', () => {
		expect(parseINR('')).toBe(0);
	});
});
