import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import CreateInvoiceScreen from './create';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { useRouter } from 'expo-router';

// Mock stores and router
jest.mock('@/src/stores/inventoryStore', () => ({
  useInventoryStore: jest.fn(),
}));

jest.mock('@/src/stores/invoiceStore', () => ({
  useInvoiceStore: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

const mockInventoryItems = [
  { id: 'item-1', design_name: 'Marble gold', box_count: 50, selling_price: 1000 },
];

describe('CreateInvoiceScreen', () => {
  const mockReplace = jest.fn();
  const mockCreateInvoice = jest.fn();
  const mockFetchItems = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
    
    // Mock Inventory Store
    (useInventoryStore as unknown as jest.Mock).mockReturnValue({
      items: mockInventoryItems,
      fetchItems: mockFetchItems,
    });
    (useInventoryStore.getState as jest.Mock) = jest.fn().mockReturnValue({
      fetchItems: mockFetchItems,
    });

    // Mock Invoice Store
    (useInvoiceStore.getState as jest.Mock) = jest.fn().mockReturnValue({
      createInvoice: mockCreateInvoice,
    });
    mockCreateInvoice.mockResolvedValue({ id: 'new-inv-123' });
  });

  it('completes the full invoice creation flow', async () => {
    const { getByText, getByPlaceholderText, queryByText } = renderWithTheme(<CreateInvoiceScreen />);
    
    // Step 1: Customer Details
    fireEvent.changeText(getByPlaceholderText('e.g. Rahul Sharma'), 'Test Customer');
    fireEvent.changeText(getByPlaceholderText('10-digit mobile number'), '9876543210');
    
    fireEvent.press(getByText('Next'));
    
    // Step 2: Line Items
    await waitFor(() => expect(getByText('2. Items')).toBeTruthy());
    
    fireEvent.press(getByText('+ Add Item'));
    
    // Search and select item
    fireEvent.changeText(getByPlaceholderText(/search/i), 'Marble');
    fireEvent.press(getByText('Marble gold'));
    
    // Modal Interaction
    fireEvent.changeText(getByPlaceholderText('Enter quantity'), '10');
    fireEvent.changeText(getByPlaceholderText('Enter discount amount'), '100');
    
    fireEvent.press(getByText('Confirm'));
    
    // Check if item added back in Step 2 list
    expect(getByText('Marble gold')).toBeTruthy();
    expect(getByText('10 units @ ₹1000.00')).toBeTruthy();
    
    fireEvent.press(getByText('Next'));
    
    // Step 3: Review & Payment
    await waitFor(() => expect(getByText('3. Review')).toBeTruthy());
    
    expect(getByText('Customer: Test Customer')).toBeTruthy();
    // Grand Total: (10 * 1000) - 100 = 9900. Plus 18% GST (1782) = 11682
    expect(getByText('₹11682.00')).toBeTruthy();
    
    fireEvent.changeText(getByPlaceholderText('Enter amount paid'), '11682');
    
    fireEvent.press(getByText('Generate Invoice'));
    
    await waitFor(() => {
      expect(mockCreateInvoice).toHaveBeenCalledWith(expect.objectContaining({
        customer_name: 'Test Customer',
        line_items: expect.arrayContaining([
          expect.objectContaining({
            item_id: 'item-1',
            quantity: 10,
            discount: 100,
          })
        ]),
        amount_paid: 11682,
        payment_status: 'paid',
      }));
      expect(mockReplace).toHaveBeenCalledWith('/(app)/invoices/new-inv-123');
    });
  });
});
