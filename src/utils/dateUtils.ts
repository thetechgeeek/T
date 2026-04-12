import { format, formatDistanceToNow, isToday, isYesterday, parseISO, type Locale } from 'date-fns';
import { enIN, hi } from 'date-fns/locale';
import i18n from '../i18n';

/**
 * Get internal date-fns locale based on i18next state.
 */
function getDateLocale(): Locale {
	return i18n.language === 'hi' ? hi : enIN;
}

/**
 * Format a date string to Indian display format.
 * E.g., "2025-03-22" -> "22 Mar 2025"
 */
export function formatDate(dateStr: string | Date, locale?: Locale): string {
	const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
	return format(date, 'd MMM yyyy', { locale: locale ?? getDateLocale() });
}

/**
 * Format date as relative time (e.g., "2 days ago")
 */
export function formatRelativeDate(dateStr: string | Date): string {
	const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
	if (isToday(date)) return i18n.t('common.today');
	if (isYesterday(date)) return i18n.t('common.yesterday');
	return formatDistanceToNow(date, { addSuffix: true, locale: getDateLocale() });
}

/**
 * Get current financial year string (e.g., "2025-26")
 */
export function getCurrentFinancialYear(): string {
	const now = new Date();
	const month = now.getMonth(); // 0-indexed
	const year = now.getFullYear();
	// Financial year starts in April (month 3)
	if (month >= 3) {
		return `${year}-${String(year + 1).slice(-2)}`;
	} else {
		return `${year - 1}-${String(year).slice(-2)}`;
	}
}

/**
 * Get start of current financial year as ISO date string.
 */
export function getFinancialYearStart(): string {
	const now = new Date();
	const month = now.getMonth();
	const year = now.getFullYear();
	const fyYear = month >= 3 ? year : year - 1;
	return `${fyYear}-04-01`;
}

/**
 * Format date to short format: "22 Mar"
 */
export function formatShortDate(dateStr: string | Date): string {
	const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
	return format(date, 'd MMM', { locale: getDateLocale() });
}

/**
 * Today's date in YYYY-MM-DD format for Supabase date fields.
 */
export function todayISO(): string {
	return format(new Date(), 'yyyy-MM-dd');
}
