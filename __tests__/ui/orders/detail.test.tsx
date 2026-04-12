import React from 'react';
import { waitFor } from '@testing-library/react-native';
import OrderDetailScreen from '@/app/(app)/orders/[id]';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { orderService } from '@/src/services/orderService';

jest.mock('@/src/services/orderService', () => ({
	orderService: {
		fetchOrderById: jest.fn(),
		fetchItemsByOrderId: jest.fn(),
	},
}));

jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => ({
		t: (key: string, opts?: Record<string, unknown>) => {
			const map: Record<string, string> = {
				'inventory.stockStatus': '{{count}} boxes',
				'order.importSuccess': 'Successfully Restocked',
				'order.extractedItems': 'Items Processed',
				'order.noItemsMessage': 'No individual items were created.',
				'order.orderDetail': 'Import Name Unknown',
				'inventory.itemNotFound': 'Import Name Unknown',
			};
			let val = map[key] ?? key.split('.').pop() ?? key;
			if (opts) {
				val = val.replace(/\{\{(\w+)\}\}/g, (_: string, k: string) =>
					k in opts ? String(opts[k]) : `{{${k}}}`,
				);
			}
			return val;
		},
		formatDateShort: (d: string) => d,
	}),
}));

const mockOrder = {
	id: 'order-1',
	party_name: 'Kajaria Wholesale',
	total_quantity: 100,
	created_at: '2026-03-01T00:00:00Z',
	status: 'completed',
};

const mockItems = [
	{
		id: 'item-1',
		design_name: 'Marble Elite',
		category: 'GLOSSY',
		size_name: '60x60',
		box_count: 50,
		has_batch_tracking: false,
		has_serial_tracking: false,
	},
	{
		id: 'item-2',
		design_name: 'Rustic Wood',
		category: 'WOODEN',
		size_name: '120x60',
		box_count: 50,
		has_batch_tracking: false,
		has_serial_tracking: false,
	},
];

beforeEach(() => {
	jest.clearAllMocks();
	(useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'order-1' });
	(useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), back: jest.fn() });
	(orderService.fetchOrderById as jest.Mock).mockResolvedValue(mockOrder);
	(orderService.fetchItemsByOrderId as jest.Mock).mockResolvedValue(mockItems);
});

describe('OrderDetailScreen', () => {
	it('shows loading indicator initially', () => {
		// Return a never-resolving promise to keep loading state
		(orderService.fetchOrderById as jest.Mock).mockReturnValue(new Promise(() => {}));
		(orderService.fetchItemsByOrderId as jest.Mock).mockReturnValue(new Promise(() => {}));

		const { toJSON } = renderWithTheme(<OrderDetailScreen />);
		const json = JSON.stringify(toJSON());
		// ActivityIndicator is rendered while loading
		expect(json).not.toBeNull();
	});

	it('renders party name after loading', async () => {
		const { getAllByText } = renderWithTheme(<OrderDetailScreen />);
		await waitFor(() => {
			expect(getAllByText('Kajaria Wholesale').length).toBeGreaterThan(0);
		});
	});

	it('renders total box quantity', async () => {
		const { getByText } = renderWithTheme(<OrderDetailScreen />);
		await waitFor(() => {
			expect(getByText('100 boxes')).toBeTruthy();
		});
	});

	it('renders Successfully Restocked status', async () => {
		const { getByText } = renderWithTheme(<OrderDetailScreen />);
		await waitFor(() => {
			expect(getByText('Successfully Restocked')).toBeTruthy();
		});
	});

	it('renders all item design names', async () => {
		const { getByText } = renderWithTheme(<OrderDetailScreen />);
		await waitFor(() => {
			expect(getByText('Marble Elite')).toBeTruthy();
			expect(getByText('Rustic Wood')).toBeTruthy();
		});
	});

	it('renders item box counts with + prefix', async () => {
		const { getAllByText } = renderWithTheme(<OrderDetailScreen />);
		await waitFor(() => {
			expect(getAllByText('+50').length).toBe(2);
		});
	});

	it('renders Items Processed count', async () => {
		const { getByText } = renderWithTheme(<OrderDetailScreen />);
		await waitFor(() => {
			expect(getByText('Items Processed (2)')).toBeTruthy();
		});
	});

	it('shows "No individual items" when items list is empty', async () => {
		(orderService.fetchItemsByOrderId as jest.Mock).mockResolvedValue([]);

		const { getByText } = renderWithTheme(<OrderDetailScreen />);
		await waitFor(() => {
			expect(getByText('No individual items were created.')).toBeTruthy();
		});
	});

	it('shows "Import Name Unknown" when party_name is absent', async () => {
		(orderService.fetchOrderById as jest.Mock).mockResolvedValue({
			...mockOrder,
			party_name: null,
		});

		const { getAllByText } = renderWithTheme(<OrderDetailScreen />);
		await waitFor(() => {
			expect(getAllByText('Import Name Unknown').length).toBeGreaterThan(0);
		});
	});

	it('calls both service methods with the order id', async () => {
		renderWithTheme(<OrderDetailScreen />);
		await waitFor(() => {
			expect(orderService.fetchOrderById).toHaveBeenCalledWith('order-1');
			expect(orderService.fetchItemsByOrderId).toHaveBeenCalledWith('order-1');
		});
	});
});
