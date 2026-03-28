import {
	getCurrentFinancialYear,
	getFinancialYearStart,
	formatDate,
	formatShortDate,
} from '../dateUtils';

// Mock i18n so formatRelativeDate works without full setup
jest.mock('../../i18n', () => ({
	default: {
		t: (key: string) => {
			const map: Record<string, string> = {
				'common.today': 'Today',
				'common.yesterday': 'Yesterday',
			};
			return map[key] ?? key;
		},
	},
}));

describe('getCurrentFinancialYear', () => {
	it('returns correct FY when month is April or later', () => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date('2025-06-15'));
		expect(getCurrentFinancialYear()).toBe('2025-26');
		jest.useRealTimers();
	});

	it('returns correct FY when month is January (before April)', () => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date('2026-01-10'));
		expect(getCurrentFinancialYear()).toBe('2025-26');
		jest.useRealTimers();
	});

	it('starts new FY on April 1', () => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date('2025-04-01'));
		expect(getCurrentFinancialYear()).toBe('2025-26');
		jest.useRealTimers();
	});

	it('is last FY on March 31', () => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date('2025-03-31'));
		expect(getCurrentFinancialYear()).toBe('2024-25');
		jest.useRealTimers();
	});
});

describe('getFinancialYearStart', () => {
	it('returns April 1 of current year when past April', () => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date('2025-09-01'));
		expect(getFinancialYearStart()).toBe('2025-04-01');
		jest.useRealTimers();
	});

	it('returns April 1 of previous year when before April', () => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date('2025-02-15'));
		expect(getFinancialYearStart()).toBe('2024-04-01');
		jest.useRealTimers();
	});
});

describe('formatDate', () => {
	it('formats ISO date string to readable format', () => {
		const result = formatDate('2025-03-22');
		expect(result).toBe('22 Mar 2025');
	});

	it('accepts Date objects', () => {
		const result = formatDate(new Date('2025-01-01'));
		expect(result).toBe('1 Jan 2025');
	});
});

describe('formatShortDate', () => {
	it('formats date to day and month only', () => {
		const result = formatShortDate('2025-03-22');
		expect(result).toBe('22 Mar');
	});
});
