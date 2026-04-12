import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';

import LoginScreen from '@/app/(auth)/login';
import { useAuthStore } from '@/src/stores/authStore';
import { renderWithTheme } from '../../utils/renderWithTheme';

jest.mock('@/src/stores/authStore', () => ({
	useAuthStore: jest.fn(),
}));

describe('LoginScreen', () => {
	const mockSendOtp = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useAuthStore as unknown as jest.Mock).mockReturnValue({
			sendOtp: mockSendOtp,
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
});
