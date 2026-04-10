import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithTheme } from '../../utils/renderWithTheme';
import LanguageSelectScreen from '@/app/(auth)/language-select';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
	setItem: jest.fn().mockResolvedValue(undefined),
	getItem: jest.fn().mockResolvedValue(null),
}));

// Mock expo-router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
	useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

// Mock i18next
jest.mock('i18next', () => {
	const mockI18n = {
		changeLanguage: jest.fn().mockResolvedValue(undefined),
		use: jest.fn().mockReturnThis(),
		init: jest.fn().mockResolvedValue(undefined),
		t: jest.fn((key: string) => key),
		language: 'hi',
	};
	return {
		__esModule: true,
		default: mockI18n,
		...mockI18n,
	};
});

describe('LanguageSelectScreen', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders Hindi and English language cards', () => {
		const { getByText } = renderWithTheme(<LanguageSelectScreen />);
		expect(getByText('हिंदी')).toBeTruthy();
		expect(getByText('English')).toBeTruthy();
	});

	it('renders app tagline', () => {
		const { getByText } = renderWithTheme(<LanguageSelectScreen />);
		expect(getByText('आपका डिजिटल बही-खाता')).toBeTruthy();
	});

	it('Continue button is disabled before selection', () => {
		const { getByTestId } = renderWithTheme(<LanguageSelectScreen />);
		expect(getByTestId('continue-button')).toHaveProp('accessibilityState', {
			disabled: true,
		});
	});

	it('enables Continue button after selecting Hindi', () => {
		const { getByTestId, getByText } = renderWithTheme(<LanguageSelectScreen />);
		fireEvent.press(getByTestId('lang-card-hi'));
		expect(getByTestId('continue-button')).toHaveProp('accessibilityState', {
			disabled: false,
		});
	});

	it('enables Continue button after selecting English', () => {
		const { getByTestId } = renderWithTheme(<LanguageSelectScreen />);
		fireEvent.press(getByTestId('lang-card-en'));
		expect(getByTestId('continue-button')).toHaveProp('accessibilityState', {
			disabled: false,
		});
	});

	it('navigates to login on Continue press after selection', async () => {
		const { getByTestId } = renderWithTheme(<LanguageSelectScreen />);
		fireEvent.press(getByTestId('lang-card-hi'));
		fireEvent.press(getByTestId('continue-button'));
		await waitFor(() => {
			expect(mockPush).toHaveBeenCalledWith('/(auth)/login');
		});
	});

	it('shows "change language in settings" hint text', () => {
		const { getByText } = renderWithTheme(<LanguageSelectScreen />);
		expect(getByText(/Settings|settings/i)).toBeTruthy();
	});
});
