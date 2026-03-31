import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

import LoginScreen from '@/app/(auth)/login';
import { useAuthStore } from '@/src/stores/authStore';
import { renderWithTheme } from '../../utils/renderWithTheme';

jest.mock('@/src/stores/authStore', () => ({
	useAuthStore: jest.fn(),
}));

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

		// Use role-based selector to find the submit button (resolves QA issue 2.4)
		const signInButton = getByRole('button', { name: 'Sign In' });
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
