import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '@/__tests__/utils/renderWithTheme';
import { ShellNotificationBadge } from '../ShellNotificationBadge';

describe('ShellNotificationBadge', () => {
	it('stays hidden when there are no unread notifications by default', () => {
		const { queryByLabelText } = renderWithTheme(<ShellNotificationBadge />);

		expect(queryByLabelText('Notifications: 0')).toBeNull();
	});

	it('opens the inbox and tracks the interaction when pressed', () => {
		const openInbox = jest.fn();
		const track = jest.fn();
		const { getByLabelText } = renderWithTheme(<ShellNotificationBadge showZero />, {
			shellEnvironment: {
				notifications: {
					unreadCount: 3,
					openInbox,
				},
				analytics: {
					track,
				},
			},
		});

		fireEvent.press(getByLabelText('Notifications: 3'));

		expect(openInbox).toHaveBeenCalledTimes(1);
		expect(track).toHaveBeenCalledWith('shell.notifications.openInbox', {
			unreadCount: 3,
		});
	});
});
