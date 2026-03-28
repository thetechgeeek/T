import { withOpacity } from '../color';

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
});
