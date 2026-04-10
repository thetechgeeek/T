import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react-native';
import ItemDetailScreen from '@/app/(app)/inventory/[id]';
import { inventoryService } from '@/src/services/inventoryService';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Mock services and router
jest.mock('@/src/services/inventoryService', () => ({
	inventoryService: {
		fetchItemById: jest.fn(),
		fetchStockHistory: jest.fn(),
	},
}));

jest.mock('expo-router', () => {
	const React = require('react');
	return {
		useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn() })),
		useLocalSearchParams: jest.fn(() => ({ id: 'item-123' })),
		useNavigation: jest.fn(() => ({
			navigate: jest.fn(),
			setOptions: jest.fn(),
			addListener: jest.fn(() => jest.fn()),
		})),
		useFocusEffect: jest.fn((cb: () => void) => {
			React.useEffect(() => {
				const cleanup = cb();
				return cleanup;
				// eslint-disable-next-line react-hooks/exhaustive-deps
			}, []);
		}),
	};
});

const mockItem = {
	id: 'item-123',
	design_name: 'Marble Premium Gold',
	base_item_number: 'MPG-001',
	category: 'GLOSSY',
	box_count: 50,
	low_stock_threshold: 10,
	selling_price: 1200,
	size_name: '600x600',
	pcs_per_box: 4,
};

const mockHistory = [
	{
		id: 'op-1',
		operation_type: 'stock_in',
		quantity_change: 20,
		reason: 'New Shipment',
		created_at: new Date().toISOString(),
	},
];

describe('ItemDetailScreen', () => {
	const mockPush = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: jest.fn() });
		(useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'item-123' });
		(inventoryService.fetchItemById as jest.Mock).mockResolvedValue(mockItem);
		(inventoryService.fetchStockHistory as jest.Mock).mockResolvedValue(mockHistory);
	});

	it('renders item details correctly after loading', async () => {
		const { getByText } = renderWithTheme(<ItemDetailScreen />);

		await waitFor(() => {
			expect(getByText('Marble Premium Gold', { exact: false })).toBeTruthy();
			expect(getByText('50 Boxes in Stock', { exact: false })).toBeTruthy();
			expect(getByText('MPG-001', { exact: false })).toBeTruthy();
		});
	});

	it('renders stock history correctly', async () => {
		const { getByText, getAllByText } = renderWithTheme(<ItemDetailScreen />);

		await waitFor(() => {
			expect(getAllByText('Stock in', { exact: false }).length).toBeGreaterThan(0);
			expect(getByText('+20')).toBeTruthy();
			expect(getByText('New Shipment', { exact: false })).toBeTruthy();
		});
	});

	it('navigates to stock-op for Stock In', async () => {
		const { getAllByText } = renderWithTheme(<ItemDetailScreen />);

		await waitFor(() => getAllByText('Stock In'));
		fireEvent.press(getAllByText('Stock In')[0]);

		expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('stock_in'));
	});

	it('navigates to stock-op with type=stock_out for Stock Out', async () => {
		const { getByText } = renderWithTheme(<ItemDetailScreen />);

		await waitFor(() => getByText('Stock Out'));
		fireEvent.press(getByText('Stock Out'));

		expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('stock_out'));
	});

	it('notifies user when item is not found', async () => {
		(inventoryService.fetchItemById as jest.Mock).mockResolvedValue(null);
		const { getByText } = renderWithTheme(<ItemDetailScreen />);

		await waitFor(() => {
			expect(getByText('Item not found')).toBeTruthy();
		});
	});
});
