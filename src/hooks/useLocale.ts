import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatINR, formatINRShort } from '@/src/utils/currency';
import { formatDate, formatRelativeDate, formatShortDate } from '@/src/utils/dateUtils';

const STORAGE_KEY = '@tilemaster/locale';

export type SupportedLanguage = 'hi' | 'en';

export function useLocale() {
	const { t, i18n } = useTranslation();
	const currentLanguage = i18n.language as SupportedLanguage;

	const toggleLanguage = useCallback(async () => {
		const next: SupportedLanguage = currentLanguage === 'hi' ? 'en' : 'hi';
		await i18n.changeLanguage(next);
		await AsyncStorage.setItem(STORAGE_KEY, next);
	}, [currentLanguage, i18n]);

	const setLanguage = useCallback(
		async (lang: SupportedLanguage) => {
			await i18n.changeLanguage(lang);
			await AsyncStorage.setItem(STORAGE_KEY, lang);
		},
		[i18n],
	);

	const formatCurrency = useCallback((amount: number, showSymbol = true) => {
		return formatINR(amount, showSymbol);
	}, []);

	const formatCurrencyShort = useCallback((amount: number) => {
		return formatINRShort(amount);
	}, []);

	const formatDateDisplay = useCallback((dateStr: string | Date) => {
		return formatDate(dateStr);
	}, []);

	const formatDateRelative = useCallback((dateStr: string | Date) => {
		return formatRelativeDate(dateStr);
	}, []);

	const formatDateShort = useCallback((dateStr: string | Date) => {
		return formatShortDate(dateStr);
	}, []);

	return {
		t,
		currentLanguage,
		isHindi: currentLanguage === 'hi',
		toggleLanguage,
		setLanguage,
		formatCurrency,
		formatCurrencyShort,
		formatDate: formatDateDisplay,
		formatDateRelative,
		formatDateShort,
	};
}
