import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';

import SetupScreen from '@/app/(auth)/setup';
import { useAuthStore } from '@/src/stores/authStore';
import { businessProfileService } from '@/src/services/businessProfileService';
import { renderWithTheme } from '../../utils/renderWithTheme';

jest.mock('@/src/stores/authStore', () => ({
	useAuthStore: jest.fn(),
}));

// Resolves QA issue 2.16 — mock businessProfileService.upsert instead of supabase directly
jest.mock('@/src/services/businessProfileService', () => ({
	businessProfileService: {
		upsert: jest.fn().mockResolvedValue({}),
	},
}));

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

	it('calls businessProfileService.upsert on final step', async () => {
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
			expect(businessProfileService.upsert).toHaveBeenCalled();
		});
	});

	it('shows error and stays on step 1 when register fails', async () => {
		mockRegister.mockRejectedValueOnce(new Error('Registration failed'));
		const { getByText, getByPlaceholderText, queryByText } = renderWithTheme(<SetupScreen />);

		fireEvent.changeText(getByPlaceholderText('you@example.com'), 'fail@example.com');
		fireEvent.changeText(getByPlaceholderText('••••••••'), 'wrongpass');

		fireEvent.press(getByText('Add Account', { exact: false }));

		await waitFor(() => {
			// Step 1 should still be visible (not advanced to step 2)
			expect(queryByText('Business Name', { exact: false })).toBeNull();
			// The submit button should still be on screen
			expect(getByText('Add Account', { exact: false })).toBeTruthy();
		});
	});
});
