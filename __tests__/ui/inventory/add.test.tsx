import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddItemScreen from '@/app/(app)/inventory/add';
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

  it('shows an alert when item creation fails', async () => {
    const errorMessage = 'Could not find the table \'public.inventory_items\'';
    mockCreateItem.mockRejectedValue(new Error(errorMessage));

    const { getByText, getByPlaceholderText } = renderWithTheme(<AddItemScreen />);
    
    fireEvent.changeText(getByPlaceholderText('e.g. 10526-HL-1-A'), 'Error Item');
    fireEvent.changeText(getByPlaceholderText('Enter selling price'), '500');
    fireEvent.changeText(getByPlaceholderText('Enter initial stock'), '100');
    fireEvent.changeText(getByPlaceholderText('Enter low stock alert'), '15');
    fireEvent.changeText(getByPlaceholderText('Enter GST rate'), '12');

    fireEvent.press(getByText('Save Item'));

    const { Alert } = require('react-native');
    await waitFor(() => {
      expect(mockCreateItem).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        expect.stringContaining(errorMessage),
        expect.any(Array)
      );
    });
  });

  it('does not render raw empty strings in TextInput when helperText is empty', () => {
    // This is to verify the fix for "Text strings must be rendered within a <Text> component"
    // when isEditing is false and helperText is "" for the box_count field.
    const { toJSON } = renderWithTheme(<AddItemScreen />);
    const json = JSON.stringify(toJSON());
    
    // If an empty string was rendered as a child of a View, it might appear as "" in the JSON
    // but React Native's toJSON normally filters out null/undefined.
    // However, if it's a raw string child, it should be caught by RNTL if it's strict.
    expect(json).not.toContain('""'); 
  });
});
