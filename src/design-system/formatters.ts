import type { DesignSystemLocale } from './copy';

const DEFAULT_INTL_LOCALE = 'en-US';
const ARABIC_INTL_LOCALE = 'ar-SA';
const DEFAULT_CURRENCY_CODE = 'INR';
const SAMPLE_NUMBER = 1234567.89;
const SAMPLE_CURRENCY_VALUE = 125000;
const SAMPLE_DATE = new Date('2026-04-15T09:30:00.000Z');
const SAMPLE_RELATIVE_DAY_DELTA = -3;
const SAMPLE_LIST = ['Tokens', 'Patterns', 'Accessibility'] as const;
const SAMPLE_SORT_VALUES = ['zebra', 'apple', 'angstrom'] as const;

export interface DesignSystemLocaleDiagnostics {
	dashboardLocale: DesignSystemLocale;
	intlLocale: string;
	number: string;
	currency: string;
	date: string;
	relativeTime: string;
	list: string;
	plural: string;
	sorted: string;
}

export function resolveIntlLocale(locale: DesignSystemLocale | string) {
	if (locale === 'pseudo') {
		return DEFAULT_INTL_LOCALE;
	}

	if (locale === 'ar') {
		return ARABIC_INTL_LOCALE;
	}

	if (locale === 'en') {
		return DEFAULT_INTL_LOCALE;
	}

	return locale || DEFAULT_INTL_LOCALE;
}

function createListFormatter(locale: string) {
	const ListFormatConstructor = Intl.ListFormat as typeof Intl.ListFormat | undefined;
	return ListFormatConstructor
		? new ListFormatConstructor(locale, { style: 'long', type: 'conjunction' })
		: null;
}

function createRelativeTimeFormatter(locale: string) {
	const RelativeTimeFormatConstructor = Intl.RelativeTimeFormat as
		| typeof Intl.RelativeTimeFormat
		| undefined;
	return RelativeTimeFormatConstructor
		? new RelativeTimeFormatConstructor(locale, { numeric: 'auto' })
		: null;
}

export function formatLocaleNumber(locale: DesignSystemLocale | string, value: number) {
	return new Intl.NumberFormat(resolveIntlLocale(locale), {
		maximumFractionDigits: 2,
	}).format(value);
}

export function formatLocaleCurrency(
	locale: DesignSystemLocale | string,
	value: number,
	currencyCode = DEFAULT_CURRENCY_CODE,
) {
	return new Intl.NumberFormat(resolveIntlLocale(locale), {
		style: 'currency',
		currency: currencyCode,
		maximumFractionDigits: 2,
	}).format(value);
}

export function formatLocaleDateTime(locale: DesignSystemLocale | string, value: Date) {
	return new Intl.DateTimeFormat(resolveIntlLocale(locale), {
		dateStyle: 'medium',
		timeStyle: 'short',
		timeZone: 'UTC',
	}).format(value);
}

export function formatLocaleRelativeTime(
	locale: DesignSystemLocale | string,
	value: number,
	unit: Intl.RelativeTimeFormatUnit = 'day',
) {
	const formatter = createRelativeTimeFormatter(resolveIntlLocale(locale));
	if (formatter) {
		return formatter.format(value, unit);
	}

	return `${value} ${unit}${Math.abs(value) === 1 ? '' : 's'}`;
}

export function formatLocaleList(locale: DesignSystemLocale | string, values: readonly string[]) {
	const formatter = createListFormatter(resolveIntlLocale(locale));
	if (formatter) {
		return formatter.format([...values]);
	}

	if (values.length <= 1) {
		return values[0] ?? '';
	}

	if (values.length === 2) {
		return `${values[0]} and ${values[1]}`;
	}

	return `${values.slice(0, -1).join(', ')}, and ${values[values.length - 1]}`;
}

export function formatLocalePlural(
	locale: DesignSystemLocale | string,
	count: number,
	singular = 'component',
	plural = 'components',
) {
	const intlLocale = resolveIntlLocale(locale);
	const PluralRulesConstructor = Intl.PluralRules as typeof Intl.PluralRules | undefined;
	const pluralCategory = PluralRulesConstructor
		? new PluralRulesConstructor(intlLocale).select(count)
		: count === 1
			? 'one'
			: 'other';

	const label = pluralCategory === 'one' ? singular : plural;
	return `${new Intl.NumberFormat(intlLocale).format(count)} ${label}`;
}

export function sortLabelsWithLocale(
	locale: DesignSystemLocale | string,
	values: readonly string[],
) {
	const intlLocale = resolveIntlLocale(locale);
	const sortedValues = [...values];
	const CollatorConstructor = Intl.Collator as typeof Intl.Collator | undefined;

	if (CollatorConstructor) {
		const collator = new CollatorConstructor(intlLocale, { sensitivity: 'base' });
		sortedValues.sort(collator.compare);
	} else {
		sortedValues.sort((left, right) => left.localeCompare(right));
	}

	return sortedValues.join(' | ');
}

export function buildDesignSystemLocaleDiagnostics(
	locale: DesignSystemLocale,
): DesignSystemLocaleDiagnostics {
	const intlLocale = resolveIntlLocale(locale);

	return {
		dashboardLocale: locale,
		intlLocale,
		number: formatLocaleNumber(intlLocale, SAMPLE_NUMBER),
		currency: formatLocaleCurrency(intlLocale, SAMPLE_CURRENCY_VALUE),
		date: formatLocaleDateTime(intlLocale, SAMPLE_DATE),
		relativeTime: formatLocaleRelativeTime(intlLocale, SAMPLE_RELATIVE_DAY_DELTA, 'day'),
		list: formatLocaleList(intlLocale, SAMPLE_LIST),
		plural: formatLocalePlural(intlLocale, 4),
		sorted: sortLabelsWithLocale(intlLocale, SAMPLE_SORT_VALUES),
	};
}
