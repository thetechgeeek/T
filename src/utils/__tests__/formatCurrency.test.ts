/**
 * Tests for P0.9 — formatCurrency (enhanced Indian formatting with compact/Hindi support)
 * and formatQuantity
 */
import { formatCurrency, formatQuantity } from '../formatUtils';

describe('formatCurrency', () => {
	describe('default (no decimals, Indian grouping)', () => {
		it('formats zero as ₹ 0', () => {
			expect(formatCurrency(0)).toBe('₹ 0');
		});

		it('formats 1000 as ₹ 1,000', () => {
			expect(formatCurrency(1000)).toBe('₹ 1,000');
		});

		it('formats 100000 as ₹ 1,00,000 (Indian grouping)', () => {
			expect(formatCurrency(100000)).toBe('₹ 1,00,000');
		});

		it('formats 1000000 as ₹ 10,00,000', () => {
			expect(formatCurrency(1000000)).toBe('₹ 10,00,000');
		});

		it('formats negative as - ₹ 5,000', () => {
			expect(formatCurrency(-5000)).toBe('- ₹ 5,000');
		});
	});

	describe('decimals: 2', () => {
		it('formats 100000.50 as ₹ 1,00,000.50', () => {
			expect(formatCurrency(100000.5, { decimals: 2 })).toBe('₹ 1,00,000.50');
		});
	});

	describe('compact English', () => {
		it('formats 100000 as ₹ 1 Lakh', () => {
			expect(formatCurrency(100000, { compact: true, language: 'en' })).toBe('₹ 1 Lakh');
		});

		it('formats 1000000 as ₹ 10 Lakh', () => {
			expect(formatCurrency(1000000, { compact: true, language: 'en' })).toBe('₹ 10 Lakh');
		});

		it('formats 10000000 as ₹ 1 Crore', () => {
			expect(formatCurrency(10000000, { compact: true, language: 'en' })).toBe('₹ 1 Crore');
		});

		it('formats 100000000 as ₹ 10 Crore', () => {
			expect(formatCurrency(100000000, { compact: true, language: 'en' })).toBe('₹ 10 Crore');
		});
	});

	describe('compact Hindi', () => {
		it('formats 100000 as ₹ 1 लाख', () => {
			expect(formatCurrency(100000, { compact: true, language: 'hi' })).toBe('₹ 1 लाख');
		});

		it('formats 1000000 as ₹ 10 लाख', () => {
			expect(formatCurrency(1000000, { compact: true, language: 'hi' })).toBe('₹ 10 लाख');
		});

		it('formats 10000000 as ₹ 1 करोड़', () => {
			expect(formatCurrency(10000000, { compact: true, language: 'hi' })).toBe('₹ 1 करोड़');
		});

		it('formats 100000000 as ₹ 10 करोड़', () => {
			expect(formatCurrency(100000000, { compact: true, language: 'hi' })).toBe('₹ 10 करोड़');
		});
	});
});

describe('formatQuantity', () => {
	it('formats integer pcs', () => {
		expect(formatQuantity(100, 'Pcs', 0)).toBe('100 Pcs');
	});

	it('formats decimal kg', () => {
		expect(formatQuantity(2.5, 'Kg', 2)).toBe('2.50 Kg');
	});

	it('formats 3-decimal ltr', () => {
		expect(formatQuantity(10.5, 'Ltr', 3)).toBe('10.500 Ltr');
	});

	it('formats zero', () => {
		expect(formatQuantity(0, 'Box', 0)).toBe('0 Box');
	});
});
