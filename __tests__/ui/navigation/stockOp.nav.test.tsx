import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react-native';
import StockOpScreen from '@/app/(app)/inventory/stock-op';
import { inventoryService } from '@/src/services/inventoryService';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Only mock what's NOT in jest.setup.ts or what needs specific override
jest.mock('@/src/services/inventoryService', () => ({
	inventoryService: { fetchItemById: jest.fn() },
}));

jest.mock('@/src/stores/inventoryStore', () => ({
	useInventoryStore: jest.fn(),
}));

const mockBack = jest.fn();
const mockItem = { id: 'item-123', design_name: 'Marble Premium Gold', box_count: 50 };

beforeEach(() => {
	jest.clearAllMocks();

	// Rely on global expo-router mock but set specific return values
	(useRouter as jest.Mock).mockReturnValue({ back: mockBack });
	(useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'item-123', type: 'stock_in' });

	(inventoryService.fetchItemById as jest.Mock).mockResolvedValue(mockItem);
	(useInventoryStore as unknown as jest.Mock).mockReturnValue({
		performStockOperation: jest.fn().mockResolvedValue(undefined),
	});
});

describe('StockOp Navigation Wiring', () => {
	it('Successful submission -> router.back() called', async () => {
		const { getByText, getByPlaceholderText } = renderWithTheme(<StockOpScreen />);
		await waitFor(() => expect(getByPlaceholderText('e.g. 50')).toBeTruthy());

		fireEvent.changeText(getByPlaceholderText('e.g. 50'), '10');
		fireEvent.press(getByText('Confirm'));

		await waitFor(() => expect(mockBack).toHaveBeenCalled());
	});

	it('Press back/cancel -> router.back() called', async () => {
		const { getByLabelText } = renderWithTheme(<StockOpScreen />);
		await waitFor(() => expect(getByLabelText('Go back')).toBeTruthy());
		fireEvent.press(getByLabelText('Go back'));
		expect(mockBack).toHaveBeenCalled();
	});
});
