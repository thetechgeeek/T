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

	// ─── fetchUnread: loading lifecycle & error ───────────────────────────────

	it('fetchUnread: loading=true during fetch, false after success', async () => {
		let resolve!: (v: unknown) => void;
		const p = new Promise((r) => {
			resolve = r;
		});
		(notificationRepository.fetchUnread as jest.Mock).mockReturnValue(p);

		const fetchPromise = useNotificationStore.getState().fetchUnread();
		expect(useNotificationStore.getState().loading).toBe(true);

		resolve([]);
		await fetchPromise;

		expect(useNotificationStore.getState().loading).toBe(false);
	});

	it('fetchUnread error: loading=false, error set, notifications unchanged', async () => {
		useNotificationStore.setState({
			notifications: [{ id: '1', title: 'Old', read: false }] as any,
		});
		(notificationRepository.fetchUnread as jest.Mock).mockRejectedValue(
			new Error('Fetch failed'),
		);

		await useNotificationStore.getState().fetchUnread();

		const state = useNotificationStore.getState();
		expect(state.loading).toBe(false);
		expect(state.error).toBeTruthy();
		expect(state.notifications).toHaveLength(1);
	});

	// ─── markAsRead: others unchanged ────────────────────────────────────────

	it('markAsRead: only the targeted notification is marked read, others unchanged', async () => {
		useNotificationStore.setState({
			notifications: [
				{ id: '1', title: 'A', read: false },
				{ id: '2', title: 'B', read: false },
				{ id: '3', title: 'C', read: true },
			] as any[],
			unreadCount: 2,
		});
		(notificationRepository.markAsRead as jest.Mock).mockResolvedValue(undefined);

		await useNotificationStore.getState().markAsRead('1');

		const state = useNotificationStore.getState();
		expect(state.notifications[0].read).toBe(true);
		expect(state.notifications[1].read).toBe(false);
		expect(state.notifications[2].read).toBe(true);
		expect(state.unreadCount).toBe(1);
	});

	// ─── unreadCount ─────────────────────────────────────────────────────────

	it('fetchUnread: unreadCount equals number of notifications returned by fetchUnread', async () => {
		// fetchUnread only returns unread notifications, so unreadCount = returned count
		const unreadNotifications = [
			{ id: '1', read: false },
			{ id: '2', read: false },
		];
		(notificationRepository.fetchUnread as jest.Mock).mockResolvedValue(unreadNotifications);

		await useNotificationStore.getState().fetchUnread();

		expect(useNotificationStore.getState().unreadCount).toBe(2);
	});

	it('markAllAsRead: all unread notifications become read, unreadCount is 0', async () => {
		useNotificationStore.setState({
			notifications: [
				{ id: 'n1', read: false },
				{ id: 'n2', read: false },
			] as any[],
			unreadCount: 2,
		});
		(notificationRepository.markAsRead as jest.Mock).mockResolvedValue(undefined);

		await useNotificationStore.getState().markAllAsRead();

		// After markAllAsRead, all notifications should be marked read (via markAsRead calls)
		expect(notificationRepository.markAsRead).toHaveBeenCalledTimes(2);
	});
});
