import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react-native';
import FinanceOverviewScreen from '@/app/(app)/finance/index';
import { useFinanceStore, FinanceState } from '@/src/stores/financeStore';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';

jest.mock('@/src/stores/financeStore', () => ({
	useFinanceStore: jest.fn(),
}));

jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => ({
		t: (key: string) => {
			const map: Record<string, string> = {
				'finance.expenses': 'Expenses',
				'finance.purchases': 'Purchases',
				'customer.agingReport': 'Aging Report',
				'finance.profitLoss': 'Profit & Loss',
				'finance.reportsAndManagement': 'Reports & Management',
			};
			return map[key] ?? key.split('.').pop() ?? key;
		},
		formatCurrency: (amount: number) => `₹${amount.toFixed(2)}`,
	}),
}));

const mockPush = jest.fn();

beforeEach(() => {
	jest.clearAllMocks();
	(useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: jest.fn() });
	(useFinanceStore as unknown as jest.Mock).mockImplementation(
		(selector: (s: FinanceState) => unknown) =>
			selector({
				summary: { gross_profit: 0, net_profit: 0, total_expenses: 0 },
				loading: false,
				fetchSummary: jest.fn().mockResolvedValue(undefined),
			} as unknown as FinanceState),
	);
});

describe('FinanceIndex Navigation Wiring', () => {
	it('Press "Expenses" ListItem -> router.push("/(app)/finance/expenses") called', async () => {
		const { getByText } = renderWithTheme(<FinanceOverviewScreen />);
		await waitFor(() => expect(getByText('Expenses')).toBeTruthy());
		fireEvent.press(getByText('Expenses'));
		expect(mockPush).toHaveBeenCalledWith('/(app)/finance/expenses');
	});

	it('Press "Purchases" ListItem -> router.push("/finance/purchases") called', async () => {
		const { getByText } = renderWithTheme(<FinanceOverviewScreen />);
		await waitFor(() => expect(getByText('Purchases')).toBeTruthy());
		fireEvent.press(getByText('Purchases'));
		expect(mockPush).toHaveBeenCalledWith('/(app)/finance/purchases');
	});

	it('Press "Aging Report" ListItem -> router.push("/customers/aging") called', async () => {
		const { getByText } = renderWithTheme(<FinanceOverviewScreen />);
		await waitFor(() => expect(getByText('Aging Report')).toBeTruthy());
		fireEvent.press(getByText('Aging Report'));
		expect(mockPush).toHaveBeenCalledWith('/(app)/customers/aging');
	});

	it('Press "Profit & Loss" ListItem -> router.push("/(app)/finance/profit-loss") called', async () => {
		const { getByText } = renderWithTheme(<FinanceOverviewScreen />);
		await waitFor(() => expect(getByText('Profit & Loss')).toBeTruthy());
		fireEvent.press(getByText('Profit & Loss'));
		expect(mockPush).toHaveBeenCalledWith('/(app)/finance/profit-loss');
	});
});
