import {
	DEFAULT_MAX_PAGE_SIZE,
	normalizePage,
	normalizePageSize,
	resolveSortField,
} from './queryGuards';

describe('queryGuards', () => {
	it('normalizes invalid pages to the first page', () => {
		expect(normalizePage(0)).toBe(1);
		expect(normalizePage(Number.NaN)).toBe(1);
		expect(normalizePage(2.7)).toBe(2);
	});

	it('caps oversized page sizes', () => {
		expect(normalizePageSize(10_000)).toBe(DEFAULT_MAX_PAGE_SIZE);
		expect(normalizePageSize(50)).toBe(50);
		expect(normalizePageSize(0)).toBe(20);
	});

	it('rejects unsupported sort fields', () => {
		expect(() => resolveSortField('unsafe' as 'name', ['name'], 'name')).toThrow(
			'Unsupported sort field',
		);
	});
});
