import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '@/__tests__/utils/renderWithTheme';
import { ShellNotificationHost } from '../ShellNotificationHost';

describe('ShellNotificationHost', () => {
	it('forwards refresh and mark-all actions to the notification adapter', () => {
		const refresh = jest.fn();
		const markAllAsRead = jest.fn();
		const { getByText } = renderWithTheme(<ShellNotificationHost />, {
			shellEnvironment: {
				notifications: {
					items: [
						{
							id: 'notification-1',
							title: 'Queue drift detected',
							description: 'Background sync is delayed.',
							category: 'Operations',
							read: false,
						},
					],
					unreadCount: 1,
					refresh,
					markAllAsRead,
				},
			},
		});

		fireEvent.press(getByText('Refresh'));
		fireEvent.press(getByText('Mark all as read'));

		expect(refresh).toHaveBeenCalledTimes(1);
		expect(markAllAsRead).toHaveBeenCalledTimes(1);
	});

	it('marks individual notifications as read when selected', () => {
		const markAsRead = jest.fn();
		const { getByTestId } = renderWithTheme(<ShellNotificationHost />, {
			shellEnvironment: {
				notifications: {
					items: [
						{
							id: 'notification-1',
							title: 'Queue drift detected',
							description: 'Background sync is delayed.',
							category: 'Operations',
							read: false,
						},
					],
					unreadCount: 1,
					markAsRead,
				},
			},
		});

		fireEvent.press(getByTestId('notification-notification-1'));

		expect(markAsRead).toHaveBeenCalledWith('notification-1');
	});
});
