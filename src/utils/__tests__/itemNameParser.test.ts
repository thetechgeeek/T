import { extractBaseItemNumber, isSameTileSet, groupByBaseItemNumber } from '../itemNameParser';

describe('extractBaseItemNumber', () => {
	it('returns the numeric base when no suffix', () => {
		expect(extractBaseItemNumber('10526')).toBe('10526');
	});

	it('strips -D suffix', () => {
		expect(extractBaseItemNumber('10526-D')).toBe('10526');
	});

	it('strips -L suffix', () => {
		expect(extractBaseItemNumber('10526-L')).toBe('10526');
	});

	it('strips -F suffix', () => {
		expect(extractBaseItemNumber('10526-F')).toBe('10526');
	});

	it('strips -HL suffix', () => {
		expect(extractBaseItemNumber('10526-HL')).toBe('10526');
	});

	it('strips -HL-1-A compound suffix', () => {
		expect(extractBaseItemNumber('10526-HL-1-A')).toBe('10526');
	});

	it('strips -ELE suffix', () => {
		expect(extractBaseItemNumber('10526-ELE')).toBe('10526');
	});

	it('strips -ELEVATION suffix', () => {
		expect(extractBaseItemNumber('10526-ELEVATION')).toBe('10526');
	});

	it('handles empty string', () => {
		expect(extractBaseItemNumber('')).toBe('');
	});

	it('handles name with no long numeric block', () => {
		const result = extractBaseItemNumber('BRAND');
		expect(result).toBe('BRAND');
	});
});

describe('isSameTileSet', () => {
	it('returns true for same base number with different suffixes', () => {
		expect(isSameTileSet('10526-D', '10526-L')).toBe(true);
	});

	it('returns true for same plain base number', () => {
		expect(isSameTileSet('10526', '10526-HL')).toBe(true);
	});

	it('returns false for different base numbers', () => {
		expect(isSameTileSet('10526-D', '99999-D')).toBe(false);
	});
});

describe('groupByBaseItemNumber', () => {
	it('groups items with same base number together', () => {
		const items = [
			{ design_name: '10526-D', id: '1' },
			{ design_name: '10526-L', id: '2' },
			{ design_name: '99999-D', id: '3' },
		];
		const groups = groupByBaseItemNumber(items);
		expect(groups.get('10526')).toHaveLength(2);
		expect(groups.get('99999')).toHaveLength(1);
	});

	it('returns empty map for empty array', () => {
		const groups = groupByBaseItemNumber([]);
		expect(groups.size).toBe(0);
	});

	it('item with no numeric block is grouped under its design_name as key', () => {
		const items = [{ design_name: 'BRAND', id: '1' }];
		const groups = groupByBaseItemNumber(items);
		// Should not produce an undefined key — item is grouped under 'BRAND'
		expect(groups.has(undefined as unknown as string)).toBe(false);
		expect(groups.size).toBe(1);
	});
});

describe('extractBaseItemNumber — whitespace handling', () => {
	it('trims whitespace before extracting base number', () => {
		const result = extractBaseItemNumber('  10526-D  ');
		// Should extract the numeric base without the suffix
		expect(result).toBe('10526');
	});
});
