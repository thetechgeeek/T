import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import PurchasesScreen from '@/app/(app)/finance/purchases';
import { useFinanceStore } from '@/src/stores/financeStore';
import { renderWithTheme } from '../../utils/renderWithTheme';

// Mock store
jest.mock('@/src/stores/financeStore', () => ({
	useFinanceStore: jest.fn(),
}));

const mockPurchases = [
	{
		id: 'p-1',
		purchase_date: '2026-03-22',
		grand_total: 5000,
		supplier_name: 'Tile Corp',
		payment_status: 'paid',
	},
];

describe('PurchasesScreen', () => {
	const mockFetchPurchases = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		mockFetchPurchases.mockResolvedValue(undefined);
		(useFinanceStore as unknown as jest.Mock).mockReturnValue({
			purchases: mockPurchases,
			loading: false,
			fetchPurchases: mockFetchPurchases,
		});
	});

	it('renders purchases correctly', async () => {
		const { getByText } = renderWithTheme(<PurchasesScreen />);

		await waitFor(() => {
			expect(getByText('Tile Corp')).toBeTruthy();
			expect(getByText('PAID')).toBeTruthy();
			expect(getByText('₹5000', { exact: false })).toBeTruthy();
		});

		expect(mockFetchPurchases).toHaveBeenCalled();
	});

	it('shows empty state when no purchases exist', async () => {
		(useFinanceStore as unknown as jest.Mock).mockReturnValue({
			purchases: [],
			loading: false,
			fetchPurchases: mockFetchPurchases,
		});

		const { getByText } = renderWithTheme(<PurchasesScreen />);

		await waitFor(() => {
			expect(getByText('No purchases found')).toBeTruthy();
		});
	});

	it('shows an alert when fetching purchases fails', async () => {
		const errorMessage = 'Network error';
		mockFetchPurchases.mockRejectedValue(new Error(errorMessage));

		renderWithTheme(<PurchasesScreen />);

		await waitFor(() => {
			expect(mockFetchPurchases).toHaveBeenCalled();
			expect(Alert.alert).toHaveBeenCalledWith(
				'Error',
				expect.stringContaining(errorMessage),
				expect.any(Array),
			);
		});
	});
});
