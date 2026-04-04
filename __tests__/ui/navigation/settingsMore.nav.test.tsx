import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react-native';
import MoreTab from '@/app/(app)/(tabs)/more';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';

jest.mock('@/src/stores/authStore', () => ({
	useAuthStore: jest.fn(),
}));

jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => ({
		t: (key: string) => key.split('.').pop() ?? key,
		currentLanguage: 'en',
		toggleLanguage: jest.fn(),
	}),
}));

const mockPush = jest.fn();

beforeEach(() => {
	jest.clearAllMocks();
	(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
	(useAuthStore as unknown as jest.Mock).mockReturnValue({
		logout: jest.fn(),
	});
});

describe('MoreTab Navigation Wiring', () => {
	it('Press "Customers" -> router.push("/(app)/customers/") called', async () => {
		const { getByLabelText } = renderWithTheme(<MoreTab />);
		fireEvent.press(getByLabelText('menu-customers'));
		expect(mockPush).toHaveBeenCalledWith('/(app)/customers/');
	});

	it('Press "Suppliers" -> router.push("/(app)/suppliers/") called', async () => {
		const { getByLabelText } = renderWithTheme(<MoreTab />);
		fireEvent.press(getByLabelText('menu-suppliers'));
		expect(mockPush).toHaveBeenCalledWith('/(app)/suppliers/');
	});

	it('Press "Orders" -> router.push("/(app)/orders/") called', async () => {
		const { getByLabelText } = renderWithTheme(<MoreTab />);
		fireEvent.press(getByLabelText('menu-orders'));
		expect(mockPush).toHaveBeenCalledWith('/(app)/orders/');
	});

	it('Press "Finance" -> router.push("/(app)/finance/") called', async () => {
		const { getByLabelText } = renderWithTheme(<MoreTab />);
		fireEvent.press(getByLabelText('menu-finance'));
		expect(mockPush).toHaveBeenCalledWith('/(app)/finance/');
	});

	it('Press "Settings" -> router.push("/(app)/settings/") called', async () => {
		const { getByLabelText } = renderWithTheme(<MoreTab />);
		fireEvent.press(getByLabelText('menu-settings'));
		expect(mockPush).toHaveBeenCalledWith('/(app)/settings/');
	});
});
