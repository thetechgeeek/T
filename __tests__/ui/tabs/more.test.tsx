import React from 'react';
import { Alert } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import MoreTab from '@/app/(app)/(tabs)/more';
import { useAuthStore } from '@/src/stores/authStore';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';
import { lightTheme, darkTheme } from '@/src/theme/colors';
import { DEFAULT_RUNTIME_QUALITY_SIGNALS } from '@/src/design-system/runtimeSignals';

jest.mock('@/src/theme/ThemeProvider', () => ({
	...jest.requireActual('@/src/theme/ThemeProvider'),
	useTheme: jest.fn(),
}));

import { useTheme } from '@/src/theme/ThemeProvider';

jest.mock('@/src/stores/authStore', () => ({
	useAuthStore: jest.fn(),
}));

jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => ({
		t: (key: string, opts?: Record<string, unknown>) => {
			const map: Record<string, string> = {
				'customer.title': 'Customers',
				'supplier.title': 'Suppliers',
				'order.title': 'Orders',
				'finance.title': 'Finance',
				'settings.title': 'Settings',
				'auth.signOut': 'Sign Out',
				'common.more': 'More',
				'settings.lightMode': 'Light Mode',
				'settings.darkMode': 'Dark Mode',
				'settings.switchLanguage': 'Switch to {{lang}}',
				'settings.switchLanguageHint': 'Switch to {{lang}}',
				'settings.switchThemeHint': 'Switch to {{theme}} mode',
				'settings.light': 'Light',
				'settings.dark': 'Dark',
			};
			let val = map[key] ?? key.split('.').pop() ?? key;
			if (opts) {
				val = val.replace(/\{\{(\w+)\}\}/g, (_: string, k: string) =>
					k in opts ? String(opts[k]) : `{{${k}}}`,
				);
			}
			return val;
		},
		currentLanguage: 'en',
		toggleLanguage: jest.fn(),
	}),
}));

const mockLogout = jest.fn();
const mockPush = jest.fn();
const mockToggleTheme = jest.fn();

beforeEach(() => {
	jest.clearAllMocks();
	(useAuthStore as unknown as jest.Mock).mockReturnValue({ logout: mockLogout });
	(useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: jest.fn() });
	(useTheme as jest.Mock).mockReturnValue({
		theme: lightTheme,
		isDark: false,
		presetId: 'baseline',
		runtime: DEFAULT_RUNTIME_QUALITY_SIGNALS,
		availablePresets: [],
		toggleTheme: mockToggleTheme,
		mode: 'light' as const,
		setThemeMode: jest.fn(),
		setThemePreset: jest.fn(),
		cycleThemePreset: jest.fn(),
	});
});

describe('MoreTab', () => {
	it('renders the More heading', () => {
		const { getByText } = renderWithTheme(<MoreTab />);
		expect(getByText('More')).toBeTruthy();
	});

	it('renders all menu items', () => {
		const { getByText } = renderWithTheme(<MoreTab />);
		expect(getByText('Customers')).toBeTruthy();
		expect(getByText('Suppliers')).toBeTruthy();
		expect(getByText('Orders')).toBeTruthy();
		expect(getByText('Finance')).toBeTruthy();
		expect(getByText('Settings')).toBeTruthy();
	});

	it('renders Sign Out button', () => {
		const { getByText } = renderWithTheme(<MoreTab />);
		expect(getByText('Sign Out')).toBeTruthy();
	});

	it('navigates to customers on press', () => {
		const { getByText } = renderWithTheme(<MoreTab />);
		fireEvent.press(getByText('Customers'));
		expect(mockPush).toHaveBeenCalledWith('/(app)/customers/');
	});

	it('navigates to finance on press', () => {
		const { getByText } = renderWithTheme(<MoreTab />);
		fireEvent.press(getByText('Finance'));
		expect(mockPush).toHaveBeenCalledWith('/(app)/finance/');
	});

	it('navigates to settings on press', () => {
		const { getByText } = renderWithTheme(<MoreTab />);
		fireEvent.press(getByText('Settings'));
		expect(mockPush).toHaveBeenCalledWith('/(app)/settings/');
	});

	it('calls logout when Sign Out pressed and confirmed', () => {
		const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((...args: unknown[]) => {
			const buttons = args[2] as import('react-native').AlertButton[] | undefined;
			const confirmBtn = buttons?.find((b) => b.style === 'destructive');
			confirmBtn?.onPress?.();
		});
		const { getByText } = renderWithTheme(<MoreTab />);
		fireEvent.press(getByText('Sign Out'));
		expect(mockLogout).toHaveBeenCalled();
		alertSpy.mockRestore();
	});

	it('renders language toggle button', () => {
		const { getByText } = renderWithTheme(<MoreTab />);
		expect(getByText('Switch to Hindi (हिंदी)')).toBeTruthy();
	});

	it('renders dark mode toggle showing "Dark Mode" when in light mode', () => {
		(useTheme as jest.Mock).mockReturnValue({
			theme: lightTheme,
			isDark: false,
			toggleTheme: mockToggleTheme,
			mode: 'light' as const,
			setThemeMode: jest.fn(),
		});
		const { getByText } = renderWithTheme(<MoreTab />);
		expect(getByText('Dark Mode')).toBeTruthy();
	});

	it('renders dark mode toggle showing "Light Mode" when in dark mode', () => {
		(useTheme as jest.Mock).mockReturnValue({
			theme: darkTheme,
			isDark: true,
			toggleTheme: mockToggleTheme,
			mode: 'dark' as const,
			setThemeMode: jest.fn(),
		});
		const { getByText } = renderWithTheme(<MoreTab />);
		expect(getByText('Light Mode')).toBeTruthy();
	});

	it('calls toggleTheme when dark mode toggle is pressed', () => {
		const { getByLabelText } = renderWithTheme(<MoreTab />);
		fireEvent.press(getByLabelText('dark-mode-toggle'));
		expect(mockToggleTheme).toHaveBeenCalled();
	});
});
