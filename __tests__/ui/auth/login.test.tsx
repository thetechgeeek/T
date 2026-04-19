import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import LoginScreen from '@/app/(auth)/login';
import { useAuthStore } from '@/src/stores/authStore';
import { AppError } from '@/src/errors';
import { renderWithTheme } from '../../utils/renderWithTheme';

jest.mock('@/src/stores/authStore', () => ({
	useAuthStore: jest.fn(),
}));

describe('LoginScreen', () => {
	const mockSendOtp = jest.fn();
	const mockLogin = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useAuthStore as unknown as jest.Mock).mockReturnValue({
			sendOtp: mockSendOtp,
			login: mockLogin,
			loading: false,
		});
	});

	it('renders correctly', () => {
		const { getByPlaceholderText, getByText } = renderWithTheme(<LoginScreen />);

		// Check mobile sequence
		expect(getByPlaceholderText('XXXXX XXXXX')).toBeTruthy();

		// Check button
		expect(getByText('sendOtp')).toBeTruthy();
	});

	it('renders the dev-only login helper in test/dev builds', () => {
		const { getByTestId, getByText } = renderWithTheme(<LoginScreen />);

		expect(getByTestId('dev-login-panel')).toBeTruthy();
		expect(getByText('Dev Sign In')).toBeTruthy();
	});

	it('calls sendOtp on submit with +91 prefix', async () => {
		const { getByPlaceholderText, getByTestId } = renderWithTheme(<LoginScreen />);

		fireEvent.changeText(getByPlaceholderText('XXXXX XXXXX'), '9876543210');

		const sendOtpButton = getByTestId('send-otp-button');
		fireEvent.press(sendOtpButton);

		await waitFor(() => {
			expect(mockSendOtp).toHaveBeenCalledWith('+919876543210');
		});
	});

	it('disables button when phone < 10 digits', () => {
		const { getByPlaceholderText, getByTestId } = renderWithTheme(<LoginScreen />);

		fireEvent.changeText(getByPlaceholderText('XXXXX XXXXX'), '12345');
		const button = getByTestId('send-otp-button');

		// In React Native, accessibilityState.disabled is common for testing button state
		expect(button.props.accessibilityState.disabled).toBe(true);
	});

	it('calls login when dev credentials are submitted', async () => {
		const { getByTestId } = renderWithTheme(<LoginScreen />);

		fireEvent.changeText(getByTestId('dev-email-input'), 'dev@tilemaster.test');
		fireEvent.changeText(getByTestId('dev-password-input'), 'TestPass123!');
		fireEvent.press(getByTestId('dev-login-button'));

		await waitFor(() => {
			expect(mockLogin).toHaveBeenCalledWith('dev@tilemaster.test', 'TestPass123!');
		});
	});

	it('shows inline error when dev login fails', async () => {
		mockLogin.mockRejectedValue(new Error('Invalid credentials'));

		const { getByTestId, findByTestId } = renderWithTheme(<LoginScreen />);

		fireEvent.changeText(getByTestId('dev-email-input'), 'dev@tilemaster.test');
		fireEvent.changeText(getByTestId('dev-password-input'), 'wrong-password');
		fireEvent.press(getByTestId('dev-login-button'));

		expect(await findByTestId('dev-login-error')).toHaveTextContent('Invalid credentials');
	});

	it('shows AppError userMessage when OTP send fails', async () => {
		const friendlyMessage =
			'Phone OTP is not enabled for this Supabase project. Enable Phone auth and configure an SMS provider in Supabase before trying again.';
		mockSendOtp.mockRejectedValue(
			new AppError('Unsupported phone provider', 'AUTH_ERROR', friendlyMessage),
		);

		const { getByPlaceholderText, getByTestId } = renderWithTheme(<LoginScreen />);

		fireEvent.changeText(getByPlaceholderText('XXXXX XXXXX'), '9876543210');
		fireEvent.press(getByTestId('send-otp-button'));

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(expect.any(String), friendlyMessage);
		});
	});
});
