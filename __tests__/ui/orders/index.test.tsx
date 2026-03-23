import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import OrdersListScreen from '@/app/(app)/orders/index';
import { useOrderStore } from '@/src/stores/orderStore';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { useRouter } from 'expo-router';

// Mock store
jest.mock('@/src/stores/orderStore', () => ({
  useOrderStore: jest.fn(),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

const mockOrders = [
  { id: 'o-1', party_name: 'Kajaria Ceramics', created_at: '2026-03-22', total_quantity: 150 },
];

describe('OrdersListScreen', () => {
  const mockFetchOrders = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('renders orders correctly', async () => {
    (useOrderStore as unknown as jest.Mock).mockReturnValue({
      orders: mockOrders,
      loading: false,
      fetchOrders: mockFetchOrders,
    });

    const { getByText } = renderWithTheme(<OrdersListScreen />);
    
    await waitFor(() => {
      expect(getByText('Kajaria Ceramics')).toBeTruthy();
      expect(getByText('150 items imported', { exact: false })).toBeTruthy();
    });
    
    expect(mockFetchOrders).toHaveBeenCalled();
  });

  it('navigates to import screen when button is pressed', () => {
    (useOrderStore as unknown as jest.Mock).mockReturnValue({
      orders: [],
      loading: false,
      fetchOrders: mockFetchOrders,
    });

    const { getByText } = renderWithTheme(<OrdersListScreen />);
    
    fireEvent.press(getByText('Import PDF'));
    expect(mockPush).toHaveBeenCalledWith('/(app)/orders/import');
  });

  it('shows empty state when no orders exist', async () => {
    (useOrderStore as unknown as jest.Mock).mockReturnValue({
      orders: [],
      loading: false,
      fetchOrders: mockFetchOrders,
    });

    const { getByText } = renderWithTheme(<OrdersListScreen />);
    
    await waitFor(() => {
      expect(getByText('No Orders Yet')).toBeTruthy();
    });
  });
});
