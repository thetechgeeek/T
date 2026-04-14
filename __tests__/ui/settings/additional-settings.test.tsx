import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { Switch } from 'react-native';
import BackupScreen from '@/app/(app)/settings/backup';
import RemindersScreen from '@/app/(app)/settings/reminders';
import SecuritySettingsScreen from '@/app/(app)/settings/security';
import UsersScreen from '@/app/(app)/settings/users';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';

jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));

describe('Additional settings screens', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({
			back: jest.fn(),
			push: jest.fn(),
		});
	});

	it('renders backup actions', () => {
		const { getAllByText, getByText } = renderWithTheme(<BackupScreen />);

		expect(getAllByText('Google Drive').length).toBeGreaterThan(0);
		expect(getByText('Backup Now')).toBeTruthy();
		expect(getByText('Restore from File')).toBeTruthy();
	});

	it('reveals reminder sections when auto reminders are enabled', () => {
		const { getByText, UNSAFE_getByType } = renderWithTheme(<RemindersScreen />);

		fireEvent(UNSAFE_getByType(Switch), 'valueChange', true);

		expect(getByText('Reminder Schedule')).toBeTruthy();
		expect(getByText('Message Template')).toBeTruthy();
	});

	it('renders security controls', () => {
		const { getByText } = renderWithTheme(<SecuritySettingsScreen />);

		expect(getByText('Set 4-digit PIN')).toBeTruthy();
		expect(getByText('1 min')).toBeTruthy();
		expect(getByText('Require PIN to Delete Transactions')).toBeTruthy();
	});

	it('opens the invite modal on the users screen', () => {
		const { getByText, queryByText } = renderWithTheme(<UsersScreen />);

		expect(queryByText('Send Invite')).toBeNull();

		fireEvent.press(getByText('+ Invite User'));

		expect(getByText('Send Invite')).toBeTruthy();
		expect(getByText('Role')).toBeTruthy();
	});
});
