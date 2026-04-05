import { withOpacity, darken } from '../color';

describe('withOpacity', () => {
	it('converts 6-char hex to rgba', () => {
		expect(withOpacity('#ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
	});

	it('converts without hash prefix', () => {
		expect(withOpacity('0000ff', 1)).toBe('rgba(0, 0, 255, 1)');
	});

	it('converts 3-char shorthand hex', () => {
		expect(withOpacity('#f00', 0.12)).toBe('rgba(255, 0, 0, 0.12)');
	});

	it('handles opacity 0', () => {
		expect(withOpacity('#ffffff', 0)).toBe('rgba(255, 255, 255, 0)');
	});

	it('handles opacity 1 (fully opaque)', () => {
		expect(withOpacity('#000000', 1)).toBe('rgba(0, 0, 0, 1)');
	});

	it('handles mixed case hex', () => {
		const result = withOpacity('#FF8800', 0.5);
		expect(result).toBe('rgba(255, 136, 0, 0.5)');
	});

	it('handles existing rgba strings by replacing opacity', () => {
		expect(withOpacity('rgba(100, 200, 50, 0.2)', 0.8)).toBe('rgba(100, 200, 50, 0.8)');
	});

	it('handles existing rgb strings by adding opacity', () => {
		expect(withOpacity('rgb(100, 200, 50)', 0.5)).toBe('rgba(100, 200, 50, 0.5)');
	});
});

describe('darken', () => {
	it('darkens a hex color by the given factor', () => {
		// White (255, 255, 255) darkened by 50% = (128, 128, 128) -> #808080
		expect(darken('#ffffff', 0.5)).toBe('#808080');
	});

	it('works without hash prefix', () => {
		expect(darken('ffffff', 0.5)).toBe('#808080');
	});

	it('handles 3-char shorthand', () => {
		// #f00 (255, 0, 0) darkened by 20% = (204, 0, 0) -> #cc0000
		expect(darken('#f00', 0.2)).toBe('#cc0000');
	});

	it('clumps values to minimum 0', () => {
		expect(darken('#000000', 0.1)).toBe('#000000');
	});

	it('clumps values even with high factor', () => {
		expect(darken('#112233', 1.0)).toBe('#000000');
	});
});
