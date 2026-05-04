import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { ScrollView } from 'react-native';

import LoginScreen from '@/app/(auth)/login';
import { useAuthStore } from '@/src/stores/authStore';
import { AppError } from '@/src/errors';
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
		const { getByPlaceholderText, getByText } = renderWithTheme(<LoginScreen />);

		expect(getByPlaceholderText('you@example.com')).toBeTruthy();
		expect(getByPlaceholderText('••••••••')).toBeTruthy();
		expect(getByText('Sign In')).toBeTruthy();
	});

	it('uses a static layout for the iOS dev login screen so the simulator keeps text focus', () => {
		const { UNSAFE_queryByType } = renderWithTheme(<LoginScreen />);

		expect(UNSAFE_queryByType(ScrollView)).toBeNull();
	});

	it('opts the login inputs out of autofill and credential suggestions in iOS dev builds', () => {
		const { getByTestId } = renderWithTheme(<LoginScreen />);

		expect(getByTestId('email-input')).toHaveProp('autoComplete', 'off');
		expect(getByTestId('email-input')).toHaveProp('textContentType', 'none');
		expect(getByTestId('password-input')).toHaveProp('autoComplete', 'off');
		expect(getByTestId('password-input')).toHaveProp('textContentType', 'none');
	});

	it('disables sign in until both fields are entered', () => {
		const { getByTestId } = renderWithTheme(<LoginScreen />);

		const button = getByTestId('sign-in-button');
		expect(button.props.accessibilityState.disabled).toBe(true);
	});

	it('calls login when credentials are submitted', async () => {
		const { getByTestId } = renderWithTheme(<LoginScreen />);

		fireEvent.changeText(getByTestId('email-input'), 'dev@easydesign.test');
		fireEvent.changeText(getByTestId('password-input'), 'TestPass123!');
		fireEvent.press(getByTestId('sign-in-button'));

		await waitFor(() => {
			expect(mockLogin).toHaveBeenCalledWith('dev@easydesign.test', 'TestPass123!');
		});
	});

	it('shows inline error when login fails', async () => {
		mockLogin.mockRejectedValue(new Error('Invalid credentials'));

		const { getByTestId, findByTestId } = renderWithTheme(<LoginScreen />);

		fireEvent.changeText(getByTestId('email-input'), 'dev@easydesign.test');
		fireEvent.changeText(getByTestId('password-input'), 'wrong-password');
		fireEvent.press(getByTestId('sign-in-button'));

		expect(await findByTestId('login-error')).toHaveTextContent('Invalid credentials');
	});

	it('shows AppError userMessage when login fails with a friendly auth error', async () => {
		const friendlyMessage = 'Invalid credentials.';
		mockLogin.mockRejectedValue(new AppError('Invalid login', 'AUTH_ERROR', friendlyMessage));

		const { getByTestId, findByTestId } = renderWithTheme(<LoginScreen />);

		fireEvent.changeText(getByTestId('email-input'), 'dev@easydesign.test');
		fireEvent.changeText(getByTestId('password-input'), 'wrong-password');
		fireEvent.press(getByTestId('sign-in-button'));

		expect(await findByTestId('login-error')).toHaveTextContent(friendlyMessage);
	});
});
