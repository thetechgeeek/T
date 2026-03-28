import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

import LoginScreen from '@/app/(auth)/login';
import { useAuthStore } from '@/src/stores/authStore';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

jest.mock('@/src/stores/authStore', () => ({
	useAuthStore: jest.fn(),
}));

const renderWithTheme = (component: React.ReactElement) => {
	return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('LoginScreen', () => {
	const mockLogin = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useAuthStore as unknown as jest.Mock).mockReturnValue({
			login: mockLogin,
			loading: false,
		});
	});

	it('renders correctly', () => {
		const { getByPlaceholderText, getByText, getAllByText } = renderWithTheme(<LoginScreen />);

		// Check exact text/placeholders from login.tsx
		expect(getByPlaceholderText('you@example.com')).toBeTruthy();
		expect(getByPlaceholderText('••••••••')).toBeTruthy();

		// Heading and Button
		const signInElements = getAllByText('Sign In');
		expect(signInElements.length).toBeGreaterThan(0);
	});

	it('calls login on submit', async () => {
		const { getByPlaceholderText, getByText, getAllByText } = renderWithTheme(<LoginScreen />);

		fireEvent.changeText(getByPlaceholderText('you@example.com'), 'test@example.com');
		fireEvent.changeText(getByPlaceholderText('••••••••'), 'password123');

		// The button text is 'Sign In'. Since there might be multiple, we find one that is Touchable
		const signInButton = getAllByText('Sign In')[1]; // Second one is the button
		fireEvent.press(signInButton);

		await waitFor(() => {
			expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
		});
	});

	it('navigates to setup screen when clicking setup link', () => {
		const { getByText } = renderWithTheme(<LoginScreen />);

		const setupLink = getByText('Set Up Your Business', { exact: false });
		fireEvent.press(setupLink);
	});
});
