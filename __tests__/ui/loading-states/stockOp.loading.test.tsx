import React from 'react';
import { waitFor } from '@testing-library/react-native';
import StockOpScreen from '@/app/(app)/inventory/stock-op';
import { inventoryService } from '@/src/services/inventoryService';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useLocalSearchParams } from 'expo-router';

jest.mock('@/src/services/inventoryService', () => ({
	inventoryService: { fetchItemById: jest.fn() },
}));

jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}));

jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => ({
		t: (key: string) => key.split('.').pop() ?? key,
		formatCurrency: (amount: number) => `₹${amount}`,
	}),
}));

beforeEach(() => {
	jest.clearAllMocks();
	(useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'item-123', type: 'stock_in' });
});

describe('StockOp Loading & Error UI States', () => {
	it('shows loading state (ActivityIndicator) while item is fetching', async () => {
		// fetchItemById never resolves — simulates slow network
		(inventoryService.fetchItemById as jest.Mock).mockReturnValue(new Promise(() => {}));

		const { getByTestId, queryByPlaceholderText } = renderWithTheme(<StockOpScreen />);

		// Component uses standard ActivityIndicator while loading
		await waitFor(() => expect(getByTestId('loading-spinner')).toBeTruthy());

		// Form components should NOT be visible
		expect(queryByPlaceholderText('e.g. 50')).toBeNull();
	});

	it('documents the infinite spinner bug when fetchItemById rejects', async () => {
		// BUG: catch only logs the error, never sets error state or clears loading.
		// Result: item stays null, form never renders, spinner persists forever.
		(inventoryService.fetchItemById as jest.Mock).mockRejectedValue(new Error('Network Error'));

		const { getByTestId, queryByText } = renderWithTheme(<StockOpScreen />);

		// Wait for the rejection to settle
		await new Promise((r) => setTimeout(r, 100));

		// BUG CONFIRMED: Spinner is still there, and error text is NOT shown
		expect(getByTestId('loading-spinner')).toBeTruthy();
		expect(queryByText('Error')).toBeNull();
	});

	it('renders form with no spinner after successful fetch', async () => {
		(inventoryService.fetchItemById as jest.Mock).mockResolvedValue({
			id: 'item-123',
			design_name: 'Marble',
			box_count: 50,
		});

		const { getByPlaceholderText, queryByTestId } = renderWithTheme(<StockOpScreen />);

		await waitFor(() => {
			expect(getByPlaceholderText('e.g. 50')).toBeTruthy();
			expect(queryByTestId('loading-spinner')).toBeNull();
		});
	});
});
