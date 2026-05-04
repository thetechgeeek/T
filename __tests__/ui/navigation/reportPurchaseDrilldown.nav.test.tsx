import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import AllTransactionsScreen from '@/app/(app)/reports/all-transactions';
import { appRoutes } from '@/src/navigation/routes';
import { useFinanceStore } from '@/src/stores/financeStore';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { renderWithTheme } from '../../utils/renderWithTheme';

jest.mock('@/src/stores/financeStore', () => ({
	useFinanceStore: jest.fn(),
}));

jest.mock('@/src/stores/invoiceStore', () => ({
	useInvoiceStore: jest.fn(),
}));

const mockPush = jest.fn();

describe('critical navigation: reports purchase drill-down', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: jest.fn() });
		(useFinanceStore as unknown as jest.Mock).mockReturnValue({
			expenses: [],
			purchases: [
				{
					id: 'purchase-1',
					purchase_number: 'PB-001',
					purchase_date: new Date().toISOString().slice(0, 10),
					grand_total: 5000,
					supplier_name: 'Tile World',
				},
			],
		});
		(useInvoiceStore as unknown as jest.Mock).mockReturnValue({ invoices: [] });
	});

	it('opens a purchase from the all-transactions report using the filesystem route', () => {
		const { getByText } = renderWithTheme(<AllTransactionsScreen />);

		fireEvent.press(getByText('PB-001'));

		expect(mockPush).toHaveBeenCalledWith(appRoutes.finance.purchases.detail('purchase-1'));
	});
});
