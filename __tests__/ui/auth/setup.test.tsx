import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

import SetupScreen from '@/app/(auth)/setup';
import { useAuthStore } from '@/src/stores/authStore';
import { supabase } from '@/src/config/supabase';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

jest.mock('@/src/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/src/config/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: null }),
    }),
  },
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('SetupScreen', () => {
  const mockRegister = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      register: mockRegister,
    });
  });

  it('renders account step initially', () => {
    const { getByText } = renderWithTheme(<SetupScreen />);
    
    expect(getByText('Email', { exact: false })).toBeTruthy();
    expect(getByText('Password', { exact: false })).toBeTruthy();
    expect(getByText('Add Account', { exact: false })).toBeTruthy();
  });

  it('transitions to business step after successful registration', async () => {
    mockRegister.mockResolvedValueOnce({});
    const { getByText, findByText, getByPlaceholderText } = renderWithTheme(<SetupScreen />);
    
    fireEvent.changeText(getByPlaceholderText('you@example.com'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('••••••••'), 'password123');
    
    fireEvent.press(getByText('Add Account', { exact: false }));

    expect(await findByText('Business Name', { exact: false })).toBeTruthy();
    expect(mockRegister).toHaveBeenCalled();
  });

  it('calls supabase.from("business_profile").upsert on final step', async () => {
    mockRegister.mockResolvedValueOnce({});
    const { getByText, findByText, getByPlaceholderText } = renderWithTheme(<SetupScreen />);
    
    // Move to step 2
    fireEvent.changeText(getByPlaceholderText('you@example.com'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('••••••••'), 'password123');
    fireEvent.press(getByText('Add Account', { exact: false }));

    expect(await findByText('Business Name', { exact: false })).toBeTruthy();
    
    // Fill business name
    fireEvent.changeText(getByPlaceholderText('Enter business name'), 'Test Business');
    
    // In step 2, click save
    fireEvent.press(getByText('Save', { exact: false }));
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('business_profile');
    });
  });
});
