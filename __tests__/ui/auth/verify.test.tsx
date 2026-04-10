import React from 'react';
import { fireEvent, waitFor, act } from '@testing-library/react-native';
import { renderWithTheme } from '../../utils/renderWithTheme';
import OtpVerifyScreen from '@/app/(auth)/verify';

jest.useFakeTimers();

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
	useRouter: () => ({ push: mockPush, replace: mockReplace, back: mockBack }),
	useLocalSearchParams: () => ({ phone: '+919876543210' }),
}));

const mockVerifyOtp = jest.fn();
const mockSendOtp = jest.fn();

jest.mock('@/src/stores/authStore', () => ({
	useAuthStore: jest.fn(() => ({
		verifyOtp: mockVerifyOtp,
		sendOtp: mockSendOtp,
		loading: false,
	})),
}));

// Mock businessProfileService to check if profile exists
jest.mock('@/src/services/businessProfileService', () => ({
	businessProfileService: {
		get: jest.fn().mockResolvedValue(null), // no profile → go to setup
	},
}));

describe('OtpVerifyScreen', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockVerifyOtp.mockResolvedValue(undefined);
		mockSendOtp.mockResolvedValue(undefined);
	});

	it('renders 6 OTP input cells', () => {
		const { getAllByTestId } = renderWithTheme(<OtpVerifyScreen />);
		expect(getAllByTestId(/otp-cell-/i).length).toBe(6);
	});

	it('shows phone number from params', () => {
		const { getByText } = renderWithTheme(<OtpVerifyScreen />);
		expect(getByText(/9876543210/)).toBeTruthy();
	});

	it('Verify button disabled when OTP incomplete', () => {
		const { getByTestId } = renderWithTheme(<OtpVerifyScreen />);
		expect(getByTestId('verify-button')).toHaveProp('accessibilityState', {
			disabled: true,
		});
	});

	it('calls verifyOtp with phone and 6-digit token', async () => {
		const { getAllByTestId, getByTestId } = renderWithTheme(<OtpVerifyScreen />);
		const cells = getAllByTestId(/otp-cell-/i);
		['1', '2', '3', '4', '5', '6'].forEach((digit, i) => {
			fireEvent.changeText(cells[i], digit);
		});
		fireEvent.press(getByTestId('verify-button'));
		await waitFor(() => {
			expect(mockVerifyOtp).toHaveBeenCalledWith('+919876543210', '123456');
		});
	});

	it('Resend OTP button disabled for 30 seconds', () => {
		const { getByTestId } = renderWithTheme(<OtpVerifyScreen />);
		expect(getByTestId('resend-button')).toHaveProp('accessibilityState', {
			disabled: true,
		});
	});

	it('Resend OTP enabled after 30 seconds', () => {
		const { getByTestId } = renderWithTheme(<OtpVerifyScreen />);
		act(() => {
			jest.advanceTimersByTime(30000);
		});
		expect(getByTestId('resend-button')).toHaveProp('accessibilityState', {
			disabled: false,
		});
	});

	it('calls sendOtp again when resend pressed', async () => {
		const { getByTestId } = renderWithTheme(<OtpVerifyScreen />);
		act(() => {
			jest.advanceTimersByTime(30000);
		});
		await act(async () => {
			fireEvent.press(getByTestId('resend-button'));
		});
		expect(mockSendOtp).toHaveBeenCalledWith('+919876543210');
	});
});
