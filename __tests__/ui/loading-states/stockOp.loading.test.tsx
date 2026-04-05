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
	useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn() })),
	useLocalSearchParams: jest.fn(),
	useNavigation: jest.fn(() => ({
		navigate: jest.fn(),
		setOptions: jest.fn(),
		addListener: jest.fn(() => jest.fn()),
	})),
	useFocusEffect: jest.fn((cb) => cb()),
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

	it('shows error message and Go Back button when fetchItemById rejects', async () => {
		// BUG FIX: The infinite spinner bug is now fixed. When fetchItemById rejects,
		// the component sets loadError=true and shows "Failed to load item." + "Go Back".
		(inventoryService.fetchItemById as jest.Mock).mockRejectedValue(new Error('Network Error'));

		const { findByText, queryByTestId } = renderWithTheme(<StockOpScreen />);

		// After rejection, error text is shown and spinner is gone
		expect(await findByText('Failed to load item.')).toBeTruthy();
		expect(queryByTestId('loading-spinner')).toBeNull();
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
