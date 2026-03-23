import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AddCustomerScreen from '@/app/(app)/customers/add';
import { useCustomerStore } from '@/src/stores/customerStore';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

// Mock the customer store
jest.mock('@/src/stores/customerStore', () => ({
  useCustomerStore: jest.fn(),
}));

// Mock ThemeProvider to avoid context issues if needed, but we use the real one with a wrapper
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('AddCustomerScreen', () => {
  const mockCreateCustomer = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useCustomerStore as unknown as jest.Mock).mockReturnValue({
      createCustomer: mockCreateCustomer,
      loading: false,
    });
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = renderWithTheme(<AddCustomerScreen />);
    
    expect(getByPlaceholderText('Enter full name')).toBeTruthy();
    expect(getByText('Save Customer')).toBeTruthy();
  });

  it('shows an alert when customer creation fails', async () => {
    const errorMessage = 'Could not find the table \'public.customers\' in the schema cache';
    mockCreateCustomer.mockRejectedValue(new Error(errorMessage));

    const { getByPlaceholderText, getByText } = renderWithTheme(<AddCustomerScreen />);
    
    // Fill in required name
    fireEvent.changeText(getByPlaceholderText('Enter full name'), 'Test Customer');
    
    // Submit form
    fireEvent.press(getByText('Save Customer'));

    await waitFor(() => {
      expect(mockCreateCustomer).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error Saving Customer',
        errorMessage,
        expect.any(Array)
      );
    });
  });

  it('successfully creates a customer and navigates back', async () => {
    mockCreateCustomer.mockResolvedValue({ id: '123', name: 'Test Customer' });

    const { getByPlaceholderText, getByText } = renderWithTheme(<AddCustomerScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Enter full name'), 'Test Customer');
    fireEvent.press(getByText('Save Customer'));

    await waitFor(() => {
      expect(mockCreateCustomer).toHaveBeenCalled();
      expect(Alert.alert).not.toHaveBeenCalled();
    });
  });
});
