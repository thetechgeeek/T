import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import InventoryTab from '@/app/(app)/(tabs)/inventory';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { renderWithTheme } from '../../utils/renderWithTheme';

// Mock store
jest.mock('@/src/stores/inventoryStore', () => ({
	useInventoryStore: jest.fn(),
}));

const mockInventoryItems = [
	{
		id: 'i-1',
		design_name: 'Marble gold',
		box_count: 50,
		category: 'GLOSSY',
		base_item_number: 'B1',
	},
];

describe('InventoryTab', () => {
	const mockFetchItems = jest.fn();
	const mockSetFilters = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		mockFetchItems.mockResolvedValue(undefined);
		(useInventoryStore as unknown as jest.Mock).mockReturnValue({
			items: [], // Start empty to trigger fetch
			loading: false,
			hasMore: false,
			filters: { category: 'ALL' },
			page: 1,
			fetchItems: mockFetchItems,
			setFilters: mockSetFilters,
		});
	});

	it('renders inventory items correctly', async () => {
		// Re-mock with data
		(useInventoryStore as unknown as jest.Mock).mockReturnValue({
			items: mockInventoryItems,
			loading: false,
			hasMore: false,
			filters: { category: 'ALL' },
			page: 1,
			fetchItems: mockFetchItems,
			setFilters: mockSetFilters,
		});

		const { getByText } = renderWithTheme(<InventoryTab />);

		await waitFor(() => {
			expect(getByText('Marble gold')).toBeTruthy();
			expect(getByText('50 Boxes', { exact: false })).toBeTruthy();
		});
	});

	it('shows an alert when fetching inventory fails', async () => {
		const errorMessage = 'Schema error';
		mockFetchItems.mockRejectedValue(new Error(errorMessage));

		// Ensure items is empty to trigger useEffect fetch
		(useInventoryStore as unknown as jest.Mock).mockReturnValue({
			items: [],
			loading: false,
			hasMore: false,
			filters: { category: 'ALL' },
			page: 1,
			fetchItems: mockFetchItems,
			setFilters: mockSetFilters,
		});

		renderWithTheme(<InventoryTab />);

		await waitFor(() => {
			expect(mockFetchItems).toHaveBeenCalled();
			expect(Alert.alert).toHaveBeenCalledWith(
				'Error',
				expect.stringContaining(errorMessage),
				expect.any(Array),
			);
		});
	});
});
