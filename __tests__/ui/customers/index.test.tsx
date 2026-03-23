import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import CustomersScreen from '@/app/(app)/customers/index';
import { useCustomerStore } from '@/src/stores/customerStore';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { useRouter } from 'expo-router';

// Mock store
jest.mock('@/src/stores/customerStore', () => ({
  useCustomerStore: jest.fn(),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

const mockCustomers = [
  { id: 'c-1', name: 'John Doe', phone: '1234567890', city: 'Morbi', type: 'retail' },
];

describe('CustomersScreen', () => {
  const mockFetchCustomers = jest.fn();
  const mockSetFilters = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchCustomers.mockResolvedValue(undefined);
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useCustomerStore as unknown as jest.Mock).mockReturnValue({
      customers: mockCustomers,
      loading: false,
      fetchCustomers: mockFetchCustomers,
      setFilters: mockSetFilters,
      filters: {},
    });
  });

  it('renders customers correctly', async () => {
    const { getByText } = renderWithTheme(<CustomersScreen />);
    
    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('1234567890')).toBeTruthy();
    });
    
    expect(mockFetchCustomers).toHaveBeenCalled();
  });

  it('shows an alert when fetching customers fails', async () => {
    const errorMessage = 'Database error';
    mockFetchCustomers.mockRejectedValue(new Error(errorMessage));

    renderWithTheme(<CustomersScreen />);
    
    const { Alert } = require('react-native');
    await waitFor(() => {
      expect(mockFetchCustomers).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        expect.stringContaining(errorMessage),
        expect.any(Array)
      );
    });
  });
});
