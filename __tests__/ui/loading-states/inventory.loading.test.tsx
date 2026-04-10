import React from 'react';
import { waitFor } from '@testing-library/react-native';
import InventoryTab from '@/app/(app)/(tabs)/inventory';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { renderWithTheme } from '../../utils/renderWithTheme';

// Only mock what's NOT in jest.setup.ts or what needs specific override
jest.mock('@/src/stores/inventoryStore', () => ({
	useInventoryStore: jest.fn(),
}));

beforeEach(() => {
	jest.clearAllMocks();
});

describe('Inventory Loading & Error UI States', () => {
	it('shows loading indicator when store.loading=true', async () => {
		(useInventoryStore as unknown as jest.Mock).mockImplementation((selector: any) =>
			selector({
				items: [],
				loading: true,
				totalCount: 0,
				filters: { category: 'ALL' },
				fetchItems: jest.fn(),
			}),
		);

		const { getByTestId } = renderWithTheme(<InventoryTab />);

		// Skeleton loading indicator should be present
		await waitFor(() => expect(getByTestId('loading-spinner')).toBeTruthy());
	});

	it('shows "No items found" only when loading=false', async () => {
		(useInventoryStore as unknown as jest.Mock).mockImplementation((selector: any) =>
			selector({
				items: [],
				loading: false,
				totalCount: 0,
				filters: { category: 'ALL' },
				fetchItems: jest.fn(),
			}),
		);

		const { getByText, queryByTestId } = renderWithTheme(<InventoryTab />);

		await waitFor(() => expect(getByText('No items in inventory')).toBeTruthy());
		expect(queryByTestId('loading-spinner')).toBeNull();
	});

	it('renders items list and NO loading spinner when loading=false and items present', async () => {
		(useInventoryStore as unknown as jest.Mock).mockImplementation((selector: any) =>
			selector({
				items: [
					{
						id: '1',
						design_name: 'Marble',
						base_item_number: 'M-001',
						category: 'GLOSSY',
						box_count: 50,
						low_stock_threshold: 10,
						selling_price: 1000,
						created_at: '',
						updated_at: '',
					},
				],
				loading: false,
				totalCount: 1,
				filters: { category: 'ALL' },
				fetchItems: jest.fn(),
			}),
		);

		const { getByText, queryByTestId } = renderWithTheme(<InventoryTab />);

		await waitFor(() => expect(getByText('50 Boxes Total', { exact: false })).toBeTruthy());
		expect(queryByTestId('loading-spinner')).toBeNull();
	});
});
