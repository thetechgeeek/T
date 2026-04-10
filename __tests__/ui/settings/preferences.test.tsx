import React from 'react';
import { fireEvent, waitFor, act } from '@testing-library/react-native';
import { renderWithTheme } from '../../utils/renderWithTheme';
import PreferencesScreen from '@/app/(app)/settings/preferences';
import i18n from 'i18next';

jest.mock('expo-router', () => ({
	useRouter: () => ({ back: jest.fn() }),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
	require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock i18next module
jest.mock('i18next', () => {
	const obj = {
		changeLanguage: jest.fn().mockResolvedValue(undefined),
		language: 'hi',
		t: (k: string) => k,
	};
	return { __esModule: true, default: obj, ...obj };
});

// Mock useTheme to support theme changes
const mockSetThemeMode = jest.fn();
jest.mock('@/src/theme/ThemeProvider', () => {
	const React = require('react');
	const { buildTheme } = require('@/src/theme/colors');
	const actual = jest.requireActual('@/src/theme/ThemeProvider');
	return {
		...actual,
		useTheme: () => ({
			theme: buildTheme(false),
			isDark: false,
			mode: 'light',
			setThemeMode: mockSetThemeMode,
			toggleTheme: jest.fn(),
		}),
		ThemeProvider: ({ children }: { children: React.ReactNode }) =>
			React.createElement(React.Fragment, null, children),
	};
});

describe('PreferencesScreen (P1.6)', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders language section', () => {
		const { getByTestId } = renderWithTheme(<PreferencesScreen />);
		expect(getByTestId('lang-card-hi')).toBeTruthy();
		expect(getByTestId('lang-card-en')).toBeTruthy();
	});

	it('renders theme section with light/dark/system options', () => {
		const { getByTestId } = renderWithTheme(<PreferencesScreen />);
		expect(getByTestId('theme-option-light')).toBeTruthy();
		expect(getByTestId('theme-option-dark')).toBeTruthy();
		expect(getByTestId('theme-option-system')).toBeTruthy();
	});

	it('renders date format section', () => {
		const { getByTestId } = renderWithTheme(<PreferencesScreen />);
		expect(getByTestId('date-format-dmy')).toBeTruthy();
		expect(getByTestId('date-format-dmy-dash')).toBeTruthy();
		expect(getByTestId('date-format-iso')).toBeTruthy();
	});

	it('selecting Hindi language calls i18next.changeLanguage("hi")', async () => {
		const { getByTestId } = renderWithTheme(<PreferencesScreen />);
		await act(async () => {
			fireEvent.press(getByTestId('lang-card-hi'));
		});
		await waitFor(() => {
			expect(i18n.changeLanguage).toHaveBeenCalledWith('hi');
		});
	});

	it('selecting English language calls i18next.changeLanguage("en")', async () => {
		const { getByTestId } = renderWithTheme(<PreferencesScreen />);
		await act(async () => {
			fireEvent.press(getByTestId('lang-card-en'));
		});
		await waitFor(() => {
			expect(i18n.changeLanguage).toHaveBeenCalledWith('en');
		});
	});

	it('selecting dark theme calls setThemeMode("dark")', async () => {
		const { getByTestId } = renderWithTheme(<PreferencesScreen />);
		await act(async () => {
			fireEvent.press(getByTestId('theme-option-dark'));
		});
		expect(mockSetThemeMode).toHaveBeenCalledWith('dark');
	});

	it('renders decimal places toggle', () => {
		const { getByTestId } = renderWithTheme(<PreferencesScreen />);
		expect(getByTestId('decimal-0')).toBeTruthy();
		expect(getByTestId('decimal-2')).toBeTruthy();
	});
});
