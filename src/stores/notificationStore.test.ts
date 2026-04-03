import { useNotificationStore } from './notificationStore';
import { notificationRepository } from '../repositories/notificationRepository';
import { eventBus } from '../events/appEvents';

jest.mock('../repositories/notificationRepository', () => ({
	notificationRepository: {
		fetchUnread: jest.fn(),
		markAsRead: jest.fn(),
	},
}));

describe('notificationStore', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		useNotificationStore.setState({
			notifications: [],
			unreadCount: 0,
			loading: false,
			error: null,
		});
	});

	it('fetchUnread updates notifications and unreadCount', async () => {
		const mockNotifications = [{ id: '1', title: 'Low Stock', read: false }];
		(notificationRepository.fetchUnread as jest.Mock).mockResolvedValue(mockNotifications);

		await useNotificationStore.getState().fetchUnread();

		const state = useNotificationStore.getState();
		expect(state.notifications).toEqual(mockNotifications);
		expect(state.unreadCount).toBe(1);
		expect(state.loading).toBe(false);
	});

	it('markAsRead updates local state and unreadCount', async () => {
		useNotificationStore.setState({
			notifications: [{ id: '1', title: 'Low Stock', read: false } as any],
			unreadCount: 1,
		});
		(notificationRepository.markAsRead as jest.Mock).mockResolvedValue(undefined);

		await useNotificationStore.getState().markAsRead('1');

		const state = useNotificationStore.getState();
		expect(state.notifications[0].read).toBe(true);
		expect(state.unreadCount).toBe(0);
	});

	it('markAllAsRead calls markAsRead for each unread notification', async () => {
		useNotificationStore.setState({
			notifications: [
				{ id: '1', read: false },
				{ id: '2', read: false },
				{ id: '3', read: true },
			] as any[],
			unreadCount: 2,
		});

		const spy = jest
			.spyOn(useNotificationStore.getState(), 'markAsRead')
			.mockResolvedValue(undefined);

		await useNotificationStore.getState().markAllAsRead();

		expect(spy).toHaveBeenCalledTimes(2);
		expect(spy).toHaveBeenCalledWith('1');
		expect(spy).toHaveBeenCalledWith('2');
		spy.mockRestore();
	});

	it('listens to STOCK_CHANGED and refreshes unread notifications', async () => {
		(notificationRepository.fetchUnread as jest.Mock).mockClear();
		(notificationRepository.fetchUnread as jest.Mock).mockResolvedValue([]);

		eventBus.emit({ type: 'STOCK_CHANGED', itemId: 'any' });

		expect(notificationRepository.fetchUnread).toHaveBeenCalled();
	});
});
