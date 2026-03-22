import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddItemScreen from './add';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

// Mock values
const mockCreateItem = jest.fn();
const mockUpdateItem = jest.fn();

jest.mock('@/src/stores/inventoryStore', () => ({
  useInventoryStore: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('AddItemScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useInventoryStore as unknown as jest.Mock).mockReturnValue({
      createItem: mockCreateItem,
      updateItem: mockUpdateItem,
    });
  });

  it('renders correctly for adding a new item', () => {
    const { getByText, getByPlaceholderText } = renderWithTheme(<AddItemScreen />);
    
    expect(getByText('Add Item')).toBeTruthy();
    expect(getByPlaceholderText('e.g. 10526-HL-1-A')).toBeTruthy();
    expect(getByText('Initial Stock *')).toBeTruthy();
  });

  it('shows validation errors for required fields', async () => {
    const { getByText, findByText } = renderWithTheme(<AddItemScreen />);
    
    // Press save without filling anything
    fireEvent.press(getByText('Save Item'));

    // findByText already waits. Match either "required" or "invalid" (for default zod errors)
    expect(await findByText(/required|invalid/i)).toBeTruthy();
  });

  it('successfully submits the form to create an item', async () => {
    const { getByText, getByPlaceholderText } = renderWithTheme(<AddItemScreen />);
    
    fireEvent.changeText(getByPlaceholderText('e.g. 10526-HL-1-A'), 'Marble 101');
    fireEvent.changeText(getByPlaceholderText('Enter selling price'), '500');
    fireEvent.changeText(getByPlaceholderText('Enter initial stock'), '100');
    fireEvent.changeText(getByPlaceholderText('Enter low stock alert'), '15');
    fireEvent.changeText(getByPlaceholderText('Enter GST rate'), '12');

    // Select category FLOOR (default is GLOSSY)
    fireEvent.press(getByText('FLOOR'));

    fireEvent.press(getByText('Save Item'));

    await waitFor(() => {
      expect(mockCreateItem).toHaveBeenCalledWith(expect.objectContaining({
        design_name: 'Marble 101',
        category: 'FLOOR',
        selling_price: 500,
        box_count: 100,
        low_stock_threshold: 15,
        gst_rate: 12,
      }));
    });
  });
});
