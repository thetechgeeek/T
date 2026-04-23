import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '@/app/(auth)/login';
import { useAuthStore } from '@/src/stores/authStore';
import { authService } from '@/src/services/authService';
import { renderScreen } from '../utils/screenHarness';

jest.mock('@/src/services/authService', () => ({
	authService: {
		getSession: jest.fn(),
		onAuthStateChange: jest.fn(),
		signIn: jest.fn(),
		signUp: jest.fn(),
		sendOtp: jest.fn(),
		verifyOtp: jest.fn(),
		signOut: jest.fn(),
	},
}));

describe('Login screen live wiring', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(authService.getSession as jest.Mock).mockResolvedValue(null);
		(authService.onAuthStateChange as jest.Mock).mockImplementation(() => ({
			data: { subscription: { unsubscribe: jest.fn() } },
		}));
	});

	it('logs in through the real auth store when dev credentials are submitted', async () => {
		(authService.signIn as jest.Mock).mockResolvedValue({
			session: { user: { id: 'user-1', email: 'dev@easydesign.test' } },
			user: { id: 'user-1', email: 'dev@easydesign.test' },
		});

		const screen = await renderScreen(<LoginScreen />);

		fireEvent.changeText(screen.getByLabelText('email-input'), 'dev@easydesign.test');
		fireEvent.changeText(screen.getByLabelText('password-input'), 'TestPass123!');
		fireEvent.press(screen.getByLabelText('sign-in-button'));

		await waitFor(() => {
			expect(authService.signIn).toHaveBeenCalledWith('dev@easydesign.test', 'TestPass123!');
			expect(useAuthStore.getState().isAuthenticated).toBe(true);
		});

		expect(useAuthStore.getState().user?.email).toBe('dev@easydesign.test');
	});

	it('surfaces login failures inline without needing a mocked store hook', async () => {
		(authService.signIn as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

		const screen = await renderScreen(<LoginScreen />);

		fireEvent.changeText(screen.getByLabelText('email-input'), 'dev@easydesign.test');
		fireEvent.changeText(screen.getByLabelText('password-input'), 'wrong-password');
		fireEvent.press(screen.getByLabelText('sign-in-button'));

		await waitFor(() => {
			expect(screen.getByTestId('dev-login-error')).toHaveTextContent('Invalid credentials');
		});

		expect(useAuthStore.getState().isAuthenticated).toBe(false);
	});
});
