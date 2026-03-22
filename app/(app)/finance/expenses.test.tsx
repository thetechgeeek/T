import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import ExpensesScreen from './expenses';
import { useFinanceStore } from '@/src/stores/financeStore';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

// Mock store
jest.mock('@/src/stores/financeStore', () => ({
  useFinanceStore: jest.fn(),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

const mockExpenses = [
  { id: 'exp-1', expense_date: '2026-03-22', amount: 500, category: 'Rent', notes: 'Monthly rent' },
];

describe('ExpensesScreen', () => {
  const mockFetchExpenses = jest.fn();
  const mockAddExpense = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useFinanceStore as unknown as jest.Mock).mockReturnValue({
      expenses: mockExpenses,
      loading: false,
      fetchExpenses: mockFetchExpenses,
      addExpense: mockAddExpense,
    });
  });

  it('renders expenses correctly', async () => {
    const { getByText, debug } = renderWithTheme(<ExpensesScreen />);
    debug();
    
    await waitFor(() => {
      expect(getByText('Rent')).toBeTruthy();
      expect(getByText('Monthly rent')).toBeTruthy();
      expect(getByText('₹500', { exact: false })).toBeTruthy();
    });
    
    expect(mockFetchExpenses).toHaveBeenCalled();
  });

  it('successfully adds a new expense', async () => {
    const { getByText, getByPlaceholderText } = renderWithTheme(<ExpensesScreen />);
    
    fireEvent.press(getByText('Add Expense'));
    
    await waitFor(() => expect(getByText('New Expense')).toBeTruthy());
    
    fireEvent.changeText(getByPlaceholderText('0.00'), '150');
    fireEvent.changeText(getByPlaceholderText(/electricity/i), 'Utility');
    fireEvent.changeText(getByPlaceholderText(/optional/i), 'Electric bill');
    
    fireEvent.press(getByText('Save Expense'));
    
    await waitFor(() => {
      expect(mockAddExpense).toHaveBeenCalledWith(expect.objectContaining({
        amount: 150,
        category: 'Utility',
        notes: 'Electric bill',
      }));
    });
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
});
