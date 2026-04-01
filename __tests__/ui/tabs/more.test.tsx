import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import MoreTab from '@/app/(app)/(tabs)/more';
import { useAuthStore } from '@/src/stores/authStore';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';

jest.mock('@/src/stores/authStore', () => ({
	useAuthStore: jest.fn(),
}));

jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => ({
		t: (key: string) => {
			const map: Record<string, string> = {
				'customer.title': 'Customers',
				'supplier.title': 'Suppliers',
				'order.title': 'Orders',
				'finance.title': 'Finance',
				'settings.title': 'Settings',
				'auth.signOut': 'Sign Out',
			};
			return map[key] ?? key.split('.').pop() ?? key;
		},
		currentLanguage: 'en',
		toggleLanguage: jest.fn(),
	}),
}));

const mockLogout = jest.fn();
const mockPush = jest.fn();

beforeEach(() => {
	jest.clearAllMocks();
	(useAuthStore as unknown as jest.Mock).mockReturnValue({ logout: mockLogout });
	(useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: jest.fn() });
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

	it('calls logout when Sign Out pressed', () => {
		const { getByText } = renderWithTheme(<MoreTab />);
		fireEvent.press(getByText('Sign Out'));
		expect(mockLogout).toHaveBeenCalled();
	});

	it('renders language toggle button', () => {
		const { getByText } = renderWithTheme(<MoreTab />);
		expect(getByText('Switch to Hindi (हिंदी)')).toBeTruthy();
	});
});
