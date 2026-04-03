import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import StockOpScreen from '@/app/(app)/inventory/stock-op';
import { inventoryService } from '@/src/services/inventoryService';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Mock services and router
jest.mock('@/src/services/inventoryService', () => ({
	inventoryService: {
		fetchItemById: jest.fn(),
	},
}));

jest.mock('@/src/stores/inventoryStore', () => ({
	useInventoryStore: jest.fn(),
}));

jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}));

const mockItem = {
	id: 'item-123',
	design_name: 'Marble Premium Gold',
	box_count: 50,
};

describe('StockOpScreen', () => {
	const mockBack = jest.fn();
	const mockPerformStockOperation = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({ back: mockBack });
		(useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'item-123', type: 'stock_in' });
		(inventoryService.fetchItemById as jest.Mock).mockResolvedValue(mockItem);
		(useInventoryStore as unknown as jest.Mock).mockReturnValue({
			performStockOperation: mockPerformStockOperation,
		});
	});

	it('renders correctly for stock in', async () => {
		const { getByText, getByPlaceholderText } = renderWithTheme(<StockOpScreen />);

		await waitFor(() => {
			expect(getByText('Stock In (Add)', { exact: false })).toBeTruthy();
			expect(getByText('Marble Premium Gold', { exact: false })).toBeTruthy();
			expect(getByPlaceholderText('e.g. 50')).toBeTruthy();
		});
	});

	it('successfully submits stock in operation', async () => {
		const { getByText, getByPlaceholderText } = renderWithTheme(<StockOpScreen />);

		await waitFor(() => getByPlaceholderText('e.g. 50'));

		fireEvent.changeText(getByPlaceholderText('e.g. 50'), '10');
		fireEvent.changeText(getByPlaceholderText(/broken|reason/i), 'Restock');

		fireEvent.press(getByText('Confirm'));

		await waitFor(() => {
			expect(mockPerformStockOperation).toHaveBeenCalledWith(
				'item-123',
				'stock_in',
				10,
				'Restock',
			);
			expect(mockBack).toHaveBeenCalled();
		});
	});

	it('successfully submits stock out operation', async () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'item-123', type: 'stock_out' });
		const { getByText, getByPlaceholderText } = renderWithTheme(<StockOpScreen />);

		await waitFor(() => getByText('Stock Out (Remove)', { exact: false }));

		fireEvent.changeText(getByPlaceholderText('e.g. 50'), '5');
		fireEvent.press(getByText('Confirm'));

		await waitFor(() => {
			expect(mockPerformStockOperation).toHaveBeenCalledWith(
				'item-123',
				'stock_out',
				-5,
				undefined,
			);
		});
	});

	it('shows error if quantity is invalid', async () => {
		const { getByText, getByPlaceholderText } = renderWithTheme(<StockOpScreen />);
		await waitFor(() => getByText('Confirm'));

		fireEvent.changeText(getByPlaceholderText('e.g. 50'), '0');
		fireEvent.press(getByText('Confirm'));

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				'Error',
				expect.stringContaining('valid'),
				expect.any(Array),
			);
		});
	});

	it('shows an alert when stock operation fails', async () => {
		const errorMessage = 'Database error';
		mockPerformStockOperation.mockRejectedValue(new Error(errorMessage));

		const { getByText, getByPlaceholderText } = renderWithTheme(<StockOpScreen />);
		await waitFor(() => getByPlaceholderText('e.g. 50'));

		fireEvent.changeText(getByPlaceholderText('e.g. 50'), '10');
		fireEvent.press(getByText('Confirm'));

		await waitFor(() => {
			expect(mockPerformStockOperation).toHaveBeenCalled();
			expect(Alert.alert).toHaveBeenCalledWith(
				'Error',
				expect.stringContaining(errorMessage),
				expect.any(Array),
			);
		});
	});

	// ─── Phase 2: Navigation ─────────────────────────────────────────────────

	it('after successful submit calls router.back() not router.push()', async () => {
		mockPerformStockOperation.mockResolvedValue(undefined);
		const { getByText, getByPlaceholderText } = renderWithTheme(<StockOpScreen />);
		await waitFor(() => getByPlaceholderText('e.g. 50'));

		fireEvent.changeText(getByPlaceholderText('e.g. 50'), '10');
		fireEvent.press(getByText('Confirm'));

		await waitFor(() => expect(mockBack).toHaveBeenCalled());
		expect((useRouter as jest.Mock)().push).toBeUndefined();
	});

	// ─── Phase 3: Loading & Error State ──────────────────────────────────────

	it('shows loading state (no form) while item is fetching', async () => {
		// fetchItemById never resolves — simulates slow network
		(inventoryService.fetchItemById as jest.Mock).mockReturnValue(new Promise(() => {}));

		const { queryByPlaceholderText, queryByText } = renderWithTheme(<StockOpScreen />);

		// Form inputs and Confirm button should NOT be present while loading
		await new Promise((r) => setTimeout(r, 50));
		expect(queryByPlaceholderText('e.g. 50')).toBeNull();
		expect(queryByText('Confirm')).toBeNull();
	});

	it('form is never shown when fetchItemById rejects — documents the infinite spinner bug', async () => {
		// Bug: catch only logs the error, never sets error state or clears loading
		// Result: item stays null, form never renders, spinner persists forever
		(inventoryService.fetchItemById as jest.Mock).mockRejectedValue(new Error('Network Error'));

		const { queryByPlaceholderText, queryByText } = renderWithTheme(<StockOpScreen />);

		// Wait for the rejection to settle
		await new Promise((r) => setTimeout(r, 100));

		// Bug confirmed: form never shown after rejection
		expect(queryByPlaceholderText('e.g. 50')).toBeNull();
		expect(queryByText('Confirm')).toBeNull();
	});

	it('renders form with no spinner when fetchItemById resolves successfully', async () => {
		const { getByPlaceholderText, getByText } = renderWithTheme(<StockOpScreen />);

		await waitFor(() => {
			expect(getByPlaceholderText('e.g. 50')).toBeTruthy();
			expect(getByText('Confirm')).toBeTruthy();
		});
	});
});
