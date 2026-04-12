import React from 'react';
import { waitFor, fireEvent, act } from '@testing-library/react-native';
import ItemDetailScreen from '@/app/(app)/inventory/[id]';
import { inventoryService } from '@/src/services/inventoryService';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';

// Override useFocusEffect to call the callback in a deferred manner to avoid
// "Too many re-renders" errors from synchronous state updates during initial render.
jest.mock('expo-router', () => {
	const React = require('react');
	const push = jest.fn();
	const back = jest.fn();
	return {
		useRouter: jest.fn(() => ({ push, back })),
		useLocalSearchParams: jest.fn(() => ({ id: 'item-123' })),
		useNavigation: jest.fn(() => ({
			navigate: jest.fn(),
			goBack: back,
			setOptions: jest.fn(),
			addListener: jest.fn(() => jest.fn()),
		})),
		useFocusEffect: jest.fn((cb: () => void) => {
			const React = require('react');
			React.useEffect(() => {
				const cleanup = cb();
				return cleanup;
				// eslint-disable-next-line react-hooks/exhaustive-deps
			}, []);
		}),
		Tabs: Object.assign(() => null, { Screen: () => null }),
		Stack: Object.assign(() => null, { Screen: () => null }),
	};
});

jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => ({
		t: (key: string) => {
			const map: Record<string, string> = {
				'inventory.stockIn': 'Stock In',
				'inventory.stockOut': 'Stock Out',
				'common.back': 'Go back',
			};
			return map[key] ?? key.split('.').pop() ?? key;
		},
		formatCurrency: (a: number) => `₹${a}`,
		formatDate: (d: string) => d,
		formatDateShort: (d: string) => d,
	}),
}));

// Only mock what's NOT in jest.setup.ts or what needs specific override
jest.mock('@/src/services/inventoryService', () => ({
	inventoryService: {
		fetchItemById: jest.fn(),
		fetchStockHistory: jest.fn(),
	},
}));

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockItem = {
	id: 'item-123',
	design_name: 'Marble Premium Gold',
	base_item_number: 'MPG-001',
	category: 'GLOSSY',
	box_count: 50,
	has_batch_tracking: false,
	has_serial_tracking: false,
	low_stock_threshold: 10,
	selling_price: 1200,
	size_name: '600x600',
	pcs_per_box: 4,
};

beforeEach(() => {
	mockPush.mockClear();
	mockBack.mockClear();

	// Rely on global expo-router mock but set specific return values
	(useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: mockBack });
	(useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'item-123' });

	(inventoryService.fetchItemById as jest.Mock).mockResolvedValue(mockItem);
	(inventoryService.fetchStockHistory as jest.Mock).mockResolvedValue([]);
});

describe('InventoryDetail Navigation Wiring', () => {
	it('Press back -> router.back() called', async () => {
		const { getByLabelText, getByText } = renderWithTheme(<ItemDetailScreen />);
		// Wait for the item to load (not just the loading skeleton)
		await waitFor(() => expect(getByText('Marble Premium Gold')).toBeTruthy());
		fireEvent.press(getByLabelText('Go back'));
		expect(mockBack).toHaveBeenCalled();
	});

	it('Press "Stock In" -> router.push(expect.stringContaining("type=stock_in")) called', async () => {
		const { getByText } = renderWithTheme(<ItemDetailScreen />);
		await waitFor(() => expect(getByText('Stock In')).toBeTruthy());
		fireEvent.press(getByText('Stock In'));
		expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('type=stock_in'));
		expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('id=item-123'));
	});

	it('Press "Stock Out" -> router.push(expect.stringContaining("type=stock_out")) called', async () => {
		const { getByText } = renderWithTheme(<ItemDetailScreen />);
		await waitFor(() => expect(getByText('Stock Out')).toBeTruthy());
		fireEvent.press(getByText('Stock Out'));
		expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('type=stock_out'));
		expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('id=item-123'));
	});
});
