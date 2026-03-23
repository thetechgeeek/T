import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import ImportOrderScreen from '@/app/(app)/orders/import';
import { useOrderStore } from '@/src/stores/orderStore';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

// Mock stores and services
jest.mock('@/src/stores/orderStore', () => ({
  useOrderStore: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('ImportOrderScreen', () => {
  const mockParseDocument = jest.fn();
  const mockImportParsedData = jest.fn();
  const mockClearParsedData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial upload state', () => {
    (useOrderStore as unknown as jest.Mock).mockReturnValue({
      isParsing: false,
      parsedData: null,
      parseDocument: mockParseDocument,
      importParsedData: mockImportParsedData,
      clearParsedData: mockClearParsedData,
    });

    const { getByText } = renderWithTheme(<ImportOrderScreen />);
    expect(getByText('Import Order (AI)')).toBeTruthy();
    expect(getByText('Browse Files')).toBeTruthy();
  });

  it('renders parsing state', () => {
    (useOrderStore as unknown as jest.Mock).mockReturnValue({
      isParsing: true,
      parsedData: null,
    });

    const { getByText } = renderWithTheme(<ImportOrderScreen />);
    expect(getByText('Analyzing Document...')).toBeTruthy();
  });

  it('renders review state and handles save', async () => {
    const mockData = [
      { design_name: 'Marble gold', box_count: 50, price_per_box: 1000 }
    ];

    (useOrderStore as unknown as jest.Mock).mockReturnValue({
      isParsing: false,
      parsedData: mockData,
      parseDocument: mockParseDocument,
      importParsedData: mockImportParsedData,
      clearParsedData: mockClearParsedData,
    });

    const { getByText, getByPlaceholderText } = renderWithTheme(<ImportOrderScreen />);
    
    expect(getByText('Review Import')).toBeTruthy();
    expect(getByText('Marble gold')).toBeTruthy();
    expect(getByText('50 Boxes')).toBeTruthy();

    fireEvent.changeText(getByPlaceholderText(/kajaria/i), 'New Supplier');
    fireEvent.press(getByText('Confirm Import & Add Stock'));

    await waitFor(() => {
      expect(mockImportParsedData).toHaveBeenCalledWith('New Supplier', mockData);
    });
  });
});
