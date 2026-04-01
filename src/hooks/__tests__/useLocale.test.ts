import { renderHook, act } from '@testing-library/react-native';
import i18n from 'i18next';
import { useLocale } from '../useLocale';

jest.unmock('@/src/hooks/useLocale');

jest.mock('@react-native-async-storage/async-storage', () => ({
	setItem: jest.fn().mockResolvedValue(undefined),
	getItem: jest.fn().mockResolvedValue(null),
}));

describe('useLocale', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('formatCurrency(1000) returns a string containing ₹ symbol', () => {
		const { result } = renderHook(() => useLocale());
		const formatted = result.current.formatCurrency(1000);
		expect(typeof formatted).toBe('string');
		expect(formatted).toContain('₹');
		expect(formatted).toContain('1');
	});

	it('formatDate returns a non-empty human-readable string', () => {
		const { result } = renderHook(() => useLocale());
		const formatted = result.current.formatDate('2026-03-29');
		expect(typeof formatted).toBe('string');
		expect(formatted.length).toBeGreaterThan(0);
		// Should not be the raw ISO string
		expect(formatted).not.toBe('2026-03-29');
	});

	it('toggleLanguage switches from en to hi then back to en', async () => {
		// Start in English
		i18n.language = 'en';

		const { result, rerender } = renderHook(() => useLocale());
		expect(result.current.currentLanguage).toBe('en');

		// Toggle to Hindi
		await act(async () => {
			await result.current.toggleLanguage();
		});

		expect(i18n.changeLanguage).toHaveBeenCalledWith('hi');

		// Simulate language change in mock
		i18n.language = 'hi';
		rerender({});

		expect(result.current.currentLanguage).toBe('hi');

		// Toggle back to English
		await act(async () => {
			await result.current.toggleLanguage();
		});

		expect(i18n.changeLanguage).toHaveBeenCalledWith('en');
	});

	it('t("common.save") returns a translated string, not the raw key', () => {
		const { result } = renderHook(() => useLocale());
		const translated = result.current.t('common.save');
		// The global mock returns key.split('.').pop() which is 'save'
		expect(translated).not.toBe('common.save');
		expect(typeof translated).toBe('string');
	});
});
