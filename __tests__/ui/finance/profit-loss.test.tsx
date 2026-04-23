import React from 'react';
import { useFinanceStore } from '@/src/stores/financeStore';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import ProfitLossScreen from '@/app/(app)/finance/profit-loss';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';

jest.mock('@/src/stores/financeStore', () => ({
	useFinanceStore: jest.fn(),
}));

jest.mock('@/src/stores/invoiceStore', () => ({
	useInvoiceStore: jest.fn(),
}));

const mockBack = jest.fn();

beforeEach(() => {
	jest.clearAllMocks();
	(useRouter as jest.Mock).mockReturnValue({ back: mockBack, push: jest.fn() });
	(useFinanceStore as unknown as jest.Mock).mockImplementation(
		(selector: (state: unknown) => unknown) =>
			selector({
				expenses: [],
				purchases: [],
				initialize: jest.fn(),
			}),
	);
	(useInvoiceStore as unknown as jest.Mock).mockImplementation(
		(selector: (state: unknown) => unknown) =>
			selector({
				invoices: [],
				fetchInvoices: jest.fn(),
			}),
	);
});

describe('ProfitLossScreen', () => {
	it('renders Profit & Loss heading', () => {
		const { getByText } = renderWithTheme(<ProfitLossScreen />);
		expect(getByText('Profit & Loss')).toBeTruthy();
	});

	it('renders Revenue section', () => {
		const { getByText } = renderWithTheme(<ProfitLossScreen />);
		expect(getByText('Revenue')).toBeTruthy();
	});

	it('renders without crashing', () => {
		const { toJSON } = renderWithTheme(<ProfitLossScreen />);
		expect(toJSON()).not.toBeNull();
	});
});
