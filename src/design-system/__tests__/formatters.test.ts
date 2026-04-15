import {
	buildDesignSystemLocaleDiagnostics,
	formatLocaleCurrency,
	formatLocaleDateTime,
	formatLocaleList,
	formatLocaleNumber,
	formatLocalePlural,
	formatLocaleRelativeTime,
	resolveIntlLocale,
	sortLabelsWithLocale,
} from '../formatters';

describe('design-system locale formatters', () => {
	it('maps dashboard locales to stable Intl locales', () => {
		expect(resolveIntlLocale('en')).toBe('en-US');
		expect(resolveIntlLocale('pseudo')).toBe('en-US');
		expect(resolveIntlLocale('ar')).toBe('ar-SA');
		expect(resolveIntlLocale('de-DE')).toBe('de-DE');
	});

	it('formats numbers, currency, lists, dates, relative time, and plurals with Intl', () => {
		expect(formatLocaleNumber('en-US', 1234567.89)).toBe(
			new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(1234567.89),
		);
		expect(formatLocaleNumber('de-DE', 1234567.89)).toBe(
			new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(1234567.89),
		);
		expect(formatLocaleCurrency('ar-SA', 125000)).toBe(
			new Intl.NumberFormat('ar-SA', {
				style: 'currency',
				currency: 'INR',
				maximumFractionDigits: 2,
			}).format(125000),
		);
		expect(formatLocaleDateTime('ja-JP', new Date('2026-04-15T09:30:00.000Z'))).toBe(
			new Intl.DateTimeFormat('ja-JP', {
				dateStyle: 'medium',
				timeStyle: 'short',
				timeZone: 'UTC',
			}).format(new Date('2026-04-15T09:30:00.000Z')),
		);
		expect(formatLocaleRelativeTime('en-US', -3, 'day')).toBe(
			new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' }).format(-3, 'day'),
		);
		expect(formatLocaleList('en-US', ['Tiles', 'Invoices', 'Reports'])).toBe(
			new Intl.ListFormat('en-US', { style: 'long', type: 'conjunction' }).format([
				'Tiles',
				'Invoices',
				'Reports',
			]),
		);
		expect(formatLocalePlural('en-US', 1)).toBe('1 component');
		expect(formatLocalePlural('ja-JP', 4)).toBe('4 components');
	});

	it('sorts labels with locale-sensitive collation', () => {
		const values = ['zebra', 'apple', 'angstrom'];
		const expected = [...values]
			.sort(new Intl.Collator('de-DE', { sensitivity: 'base' }).compare)
			.join(' | ');

		expect(sortLabelsWithLocale('de-DE', values)).toBe(expected);
	});

	it('builds diagnostics for the design-system dashboard', () => {
		const english = buildDesignSystemLocaleDiagnostics('en');
		const arabic = buildDesignSystemLocaleDiagnostics('ar');

		expect(english.dashboardLocale).toBe('en');
		expect(english.intlLocale).toBe('en-US');
		expect(english.currency).toContain('₹');
		expect(arabic.dashboardLocale).toBe('ar');
		expect(arabic.intlLocale).toBe('ar-SA');
		expect(arabic.number).not.toBe(english.number);
	});
});
