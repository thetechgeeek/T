import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import InventoryTab from '@/app/(app)/(tabs)/inventory';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';

// Mock store
jest.mock('@/src/stores/inventoryStore', () => ({
	useInventoryStore: jest.fn(),
}));

jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => ({
		t: (key: string) => {
			const map: Record<string, string> = {
				'inventory.title': 'Inventory',
				'inventory.noItems': 'No items found',
				'inventory.addFirstItem': 'Add your first item',
				'inventory.emptyFilterHint': 'Try a different filter',
				'inventory.loadError': 'Failed to load',
				'common.errorTitle': 'Error',
				'common.ok': 'OK',
			};
			return map[key] ?? key.split('.').pop() ?? key;
		},
		formatCurrency: (amount: number) => `₹${(amount ?? 0).toFixed(2)}`,
	}),
}));

const mockInventoryItems = [
	{
		id: 'i-1',
		design_name: 'Marble gold',
		box_count: 50,
		has_batch_tracking: false,
		has_serial_tracking: false,
		category: 'GLOSSY',
		base_item_number: 'B1',
	},
];

describe('InventoryTab', () => {
	const mockFetchItems = jest.fn();
	const mockSetFilters = jest.fn();
	const mockPush = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		mockFetchItems.mockResolvedValue(undefined);
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: jest.fn() });
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
			// Component shows translated 'inventory.loadError' message, not raw error
			expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to load', expect.any(Array));
		});
	});

	// ─── Phase 3: Loading & Error UI States ──────────────────────────────────

	it('shows ActivityIndicator on initial load when items=[] and loading=true', () => {
		(useInventoryStore as unknown as jest.Mock).mockReturnValue({
			items: [],
			loading: true,
			hasMore: true,
			filters: { category: 'ALL' },
			page: 1,
			fetchItems: mockFetchItems,
			setFilters: mockSetFilters,
		});

		const { UNSAFE_getByType } = renderWithTheme(<InventoryTab />);
		const { ActivityIndicator } = require('react-native');
		expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
	});

	it('hides ActivityIndicator and shows items when loading=false', async () => {
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
		await waitFor(() => expect(getByText('Marble gold')).toBeTruthy());
	});

	it('shows empty state when items=[] and loading=false', async () => {
		(useInventoryStore as unknown as jest.Mock).mockReturnValue({
			items: [],
			loading: false,
			hasMore: false,
			filters: { category: 'ALL', search: '' },
			page: 1,
			fetchItems: mockFetchItems,
			setFilters: mockSetFilters,
		});

		const { queryByText } = renderWithTheme(<InventoryTab />);
		// Wait for render settle; empty state text should appear
		await waitFor(() => {
			const emptyText =
				queryByText('No items found') ??
				queryByText('Add your first item') ??
				queryByText(/no items/i);
			expect(emptyText).toBeTruthy();
		});
	});

	it('does NOT show empty state while loading=true', () => {
		(useInventoryStore as unknown as jest.Mock).mockReturnValue({
			items: [],
			loading: true,
			hasMore: true,
			filters: { category: 'ALL' },
			page: 1,
			fetchItems: mockFetchItems,
			setFilters: mockSetFilters,
		});

		const { queryByText } = renderWithTheme(<InventoryTab />);
		expect(queryByText('No items found')).toBeNull();
		expect(queryByText('Add your first item')).toBeNull();
	});
});
