import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithTheme } from '../../utils/renderWithTheme';
import PhoneLoginScreen from '@/app/(auth)/phone-login';

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
	useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

const mockSendOtp = jest.fn();
jest.mock('@/src/stores/authStore', () => ({
	useAuthStore: jest.fn(() => ({
		sendOtp: mockSendOtp,
		loading: false,
	})),
}));

describe('PhoneLoginScreen', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockSendOtp.mockResolvedValue(undefined);
	});

	it('renders phone input with +91 prefix', () => {
		const { getByText } = renderWithTheme(<PhoneLoginScreen />);
		expect(getByText('+91')).toBeTruthy();
	});

	it('renders Send OTP button', () => {
		const { getByTestId } = renderWithTheme(<PhoneLoginScreen />);
		expect(getByTestId('send-otp-button')).toBeTruthy();
	});

	it('Send OTP button disabled when phone is empty', () => {
		const { getByTestId } = renderWithTheme(<PhoneLoginScreen />);
		expect(getByTestId('send-otp-button')).toHaveProp('accessibilityState', {
			disabled: true,
			busy: false,
		});
	});

	it('Send OTP button enabled when 10 digits entered', () => {
		const { getByTestId } = renderWithTheme(<PhoneLoginScreen />);
		fireEvent.changeText(getByTestId('phone-input'), '9876543210');
		expect(getByTestId('send-otp-button')).toHaveProp('accessibilityState', {
			disabled: false,
			busy: false,
		});
	});

	it('calls sendOtp with +91 prefix on button press', async () => {
		const { getByTestId } = renderWithTheme(<PhoneLoginScreen />);
		fireEvent.changeText(getByTestId('phone-input'), '9876543210');
		fireEvent.press(getByTestId('send-otp-button'));
		await waitFor(() => {
			expect(mockSendOtp).toHaveBeenCalledWith('+919876543210');
		});
	});

	it('navigates to verify screen after OTP sent', async () => {
		const { getByTestId } = renderWithTheme(<PhoneLoginScreen />);
		fireEvent.changeText(getByTestId('phone-input'), '9876543210');
		fireEvent.press(getByTestId('send-otp-button'));
		await waitFor(() => {
			expect(mockPush).toHaveBeenCalledWith({
				pathname: '/(auth)/verify',
				params: { phone: '+919876543210' },
			});
		});
	});

	it('shows support link', () => {
		const { getByText } = renderWithTheme(<PhoneLoginScreen />);
		expect(getByText(/support|Contact/i)).toBeTruthy();
	});
});
