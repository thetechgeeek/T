import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react-native';
import ExpensesScreen from '@/app/(app)/finance/expenses';
import { useFinanceStore } from '@/src/stores/financeStore';
import { renderWithTheme } from '../../utils/renderWithTheme';

// Mock router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
	useRouter: () => ({ push: mockPush, back: jest.fn() }),
}));

// Mock store
jest.mock('@/src/stores/financeStore', () => ({
	useFinanceStore: jest.fn(),
}));

const mockExpenses = [
	{
		id: 'exp-1',
		expense_date: '2026-03-22',
		amount: 500,
		category: 'rent',
		notes: 'Monthly rent',
	},
];

describe('ExpensesScreen', () => {
	const mockFetchExpenses = jest.fn();
	const mockAddExpense = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		mockFetchExpenses.mockResolvedValue(undefined);
		(useFinanceStore as unknown as jest.Mock).mockReturnValue({
			expenses: mockExpenses,
			loading: false,
			fetchExpenses: mockFetchExpenses,
			addExpense: mockAddExpense,
		});
	});

	it('renders expenses correctly', async () => {
		const { getByText } = renderWithTheme(<ExpensesScreen />);

		await waitFor(() => {
			expect(getByText('Monthly rent')).toBeTruthy();
			expect(getByText('₹500', { exact: false })).toBeTruthy();
		});

		expect(mockFetchExpenses).toHaveBeenCalled();
	});

	it('navigates to add expense screen when FAB is pressed', async () => {
		const { getByTestId } = renderWithTheme(<ExpensesScreen />);

		const fab = getByTestId('fab-add-expense');
		fireEvent.press(fab);

		expect(mockPush).toHaveBeenCalledWith('/(app)/finance/expenses/add');
	});

	it('shows empty state when no expenses exist', async () => {
		(useFinanceStore as unknown as jest.Mock).mockReturnValue({
			expenses: [],
			loading: false,
			fetchExpenses: mockFetchExpenses,
			addExpense: mockAddExpense,
		});

		const { getByText } = renderWithTheme(<ExpensesScreen />);

		await waitFor(() => {
			expect(getByText('No expenses found')).toBeTruthy();
		});
	});

	it('shows month total summary card', async () => {
		const { getByText } = renderWithTheme(<ExpensesScreen />);

		await waitFor(() => {
			expect(getByText('Total this month')).toBeTruthy();
		});
	});
});
