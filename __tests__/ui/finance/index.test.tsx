import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react-native';
import FinanceOverviewScreen from '@/app/(app)/finance/index';
import { useFinanceStore } from '@/src/stores/financeStore';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';

jest.mock('@/src/stores/financeStore', () => ({
	useFinanceStore: jest.fn(),
}));

jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => ({
		t: (key: string) => key.split('.').pop() ?? key,
		formatCurrency: (amount: number) => `₹${amount.toFixed(2)}`,
	}),
}));

const mockFetchSummary = jest.fn();
const mockPush = jest.fn();

const mockSummary = {
	gross_profit: 50000,
	net_profit: 35000,
	total_expenses: 15000,
};

beforeEach(() => {
	jest.clearAllMocks();
	mockFetchSummary.mockResolvedValue(undefined);
	(useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: jest.fn() });
	(useFinanceStore as unknown as jest.Mock).mockImplementation((selector: any) =>
		selector({ summary: mockSummary, loading: false, fetchSummary: mockFetchSummary }),
	);
});

describe('FinanceOverviewScreen', () => {
	it('renders Gross Profit metric', async () => {
		const { getByText } = renderWithTheme(<FinanceOverviewScreen />);
		await waitFor(() => {
			expect(getByText('Gross Profit')).toBeTruthy();
			expect(getByText('₹50000.00')).toBeTruthy();
		});
	});

	it('renders Net Profit metric', async () => {
		const { getByText } = renderWithTheme(<FinanceOverviewScreen />);
		await waitFor(() => {
			expect(getByText('Net Profit')).toBeTruthy();
			expect(getByText('₹35000.00')).toBeTruthy();
		});
	});

	it('renders Total Expenses metric', async () => {
		const { getByText } = renderWithTheme(<FinanceOverviewScreen />);
		await waitFor(() => {
			expect(getByText('Total Expenses')).toBeTruthy();
			expect(getByText('₹15000.00')).toBeTruthy();
		});
	});

	it('calls fetchSummary on mount', async () => {
		renderWithTheme(<FinanceOverviewScreen />);
		await waitFor(() => {
			expect(mockFetchSummary).toHaveBeenCalled();
		});
	});

	it('renders ₹0.00 when summary is null', async () => {
		(useFinanceStore as unknown as jest.Mock).mockImplementation((selector: any) =>
			selector({ summary: null, loading: false, fetchSummary: mockFetchSummary }),
		);

		const { getAllByText } = renderWithTheme(<FinanceOverviewScreen />);
		await waitFor(() => {
			expect(getAllByText('₹0.00').length).toBeGreaterThan(0);
		});
	});

	it('renders navigation menu items', async () => {
		const { getByText } = renderWithTheme(<FinanceOverviewScreen />);
		await waitFor(() => {
			expect(getByText('Expenses')).toBeTruthy();
			expect(getByText('Purchases')).toBeTruthy();
			expect(getByText('Aging Report')).toBeTruthy();
			expect(getByText('Profit & Loss')).toBeTruthy();
		});
	});

	it('navigates to expenses on press', async () => {
		const { getByText } = renderWithTheme(<FinanceOverviewScreen />);
		await waitFor(() => expect(getByText('Expenses')).toBeTruthy());
		fireEvent.press(getByText('Expenses'));
		expect(mockPush).toHaveBeenCalledWith('/(app)/finance/expenses');
	});

	it('navigates to purchases on press', async () => {
		const { getByText } = renderWithTheme(<FinanceOverviewScreen />);
		await waitFor(() => expect(getByText('Purchases')).toBeTruthy());
		fireEvent.press(getByText('Purchases'));
		expect(mockPush).toHaveBeenCalledWith('/finance/purchases');
	});

	it('renders Reports & Management heading', async () => {
		const { getByText } = renderWithTheme(<FinanceOverviewScreen />);
		expect(getByText('Reports & Management')).toBeTruthy();
	});
});
