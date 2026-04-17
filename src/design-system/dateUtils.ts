export interface CalendarDay {
	iso: string;
	label: string;
	dayOfMonth: number;
	inCurrentMonth: boolean;
}

const DEFAULT_LOCALE = 'en-US';
const REFERENCE_YEAR = 2026;
const REFERENCE_MONTH_INDEX = 0;
const REFERENCE_DAY_OF_MONTH = 1;
const REFERENCE_SUNDAY_OF_MONTH = 4;
const CALENDAR_GRID_LENGTH = 42;

function normalizeDate(value: Date) {
	return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

export function parseIsoDate(value: string) {
	if (!value) {
		return null;
	}

	const [year, month, day] = value.split('-').map((part) => Number.parseInt(part, 10));
	if (!year || !month || !day) {
		return null;
	}

	return new Date(Date.UTC(year, month - 1, day));
}

export function isoFromDate(value: Date) {
	return normalizeDate(value).toISOString().slice(0, 10);
}

export function todayIso() {
	return isoFromDate(new Date());
}

export function addDaysIso(value: string, offset: number) {
	const date = parseIsoDate(value) ?? parseIsoDate(todayIso());
	if (!date) {
		return todayIso();
	}

	const next = new Date(date);
	next.setUTCDate(next.getUTCDate() + offset);
	return isoFromDate(next);
}

export function startOfMonthIso(value: string) {
	const date = parseIsoDate(value) ?? parseIsoDate(todayIso());
	if (!date) {
		return todayIso();
	}

	return isoFromDate(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)));
}

export function endOfMonthIso(value: string) {
	const date = parseIsoDate(value) ?? parseIsoDate(todayIso());
	if (!date) {
		return todayIso();
	}

	return isoFromDate(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)));
}

export function formatDisplayDate(value: string, locale = DEFAULT_LOCALE) {
	const date = parseIsoDate(value);
	if (!date) {
		return value;
	}

	return new Intl.DateTimeFormat(locale, {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC',
	}).format(date);
}

export function formatDisplayTime(value: string, locale = DEFAULT_LOCALE) {
	if (!value) {
		return '';
	}

	const [hours, minutes] = value.split(':').map((part) => Number.parseInt(part, 10));
	if (Number.isNaN(hours) || Number.isNaN(minutes)) {
		return value;
	}

	const date = new Date(
		Date.UTC(REFERENCE_YEAR, REFERENCE_MONTH_INDEX, REFERENCE_DAY_OF_MONTH, hours, minutes),
	);
	return new Intl.DateTimeFormat(locale, {
		hour: 'numeric',
		minute: '2-digit',
		timeZone: 'UTC',
	}).format(date);
}

export function getWeekStartsOn(locale = DEFAULT_LOCALE) {
	try {
		const localeInfo = new Intl.Locale(locale) as Intl.Locale & {
			weekInfo?: { firstDay?: number };
		};
		const firstDay = localeInfo.weekInfo?.firstDay ?? 1;
		return firstDay % 7;
	} catch {
		return 1;
	}
}

export function getWeekdayLabels(locale = DEFAULT_LOCALE, weekStartsOn = getWeekStartsOn(locale)) {
	const referenceSunday = new Date(
		Date.UTC(REFERENCE_YEAR, REFERENCE_MONTH_INDEX, REFERENCE_SUNDAY_OF_MONTH),
	);

	return Array.from({ length: 7 }, (_, index) => {
		const weekday = (weekStartsOn + index) % 7;
		const date = new Date(referenceSunday);
		date.setUTCDate(referenceSunday.getUTCDate() + weekday);
		return new Intl.DateTimeFormat(locale, {
			weekday: 'short',
			timeZone: 'UTC',
		}).format(date);
	});
}

export function buildCalendarMonth(
	monthIso: string,
	locale = DEFAULT_LOCALE,
	weekStartsOn = getWeekStartsOn(locale),
) {
	const monthDate = parseIsoDate(monthIso) ?? parseIsoDate(todayIso());
	if (!monthDate) {
		return [];
	}

	const year = monthDate.getUTCFullYear();
	const month = monthDate.getUTCMonth();
	const firstOfMonth = new Date(Date.UTC(year, month, 1));
	const firstWeekday = firstOfMonth.getUTCDay();
	const leadingDays = (firstWeekday - weekStartsOn + 7) % 7;
	const startDate = new Date(firstOfMonth);
	startDate.setUTCDate(firstOfMonth.getUTCDate() - leadingDays);

	return Array.from({ length: CALENDAR_GRID_LENGTH }, (_, index): CalendarDay => {
		const cellDate = new Date(startDate);
		cellDate.setUTCDate(startDate.getUTCDate() + index);

		return {
			iso: isoFromDate(cellDate),
			label: String(cellDate.getUTCDate()),
			dayOfMonth: cellDate.getUTCDate(),
			inCurrentMonth: cellDate.getUTCMonth() === month,
		};
	});
}

export function monthHeading(value: string, locale = DEFAULT_LOCALE) {
	const date = parseIsoDate(value) ?? parseIsoDate(todayIso());
	if (!date) {
		return '';
	}

	return new Intl.DateTimeFormat(locale, {
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC',
	}).format(date);
}

export interface DateRangeValue {
	start: string;
	end: string;
}

export function normalizeDateRange(value: Partial<DateRangeValue>) {
	return {
		start: value.start ?? '',
		end: value.end ?? '',
	};
}

export function isIsoDateWithinRange(value: string, minDate?: string, maxDate?: string) {
	if (!value) {
		return true;
	}

	if (minDate && value < minDate) {
		return false;
	}
	if (maxDate && value > maxDate) {
		return false;
	}
	return true;
}
