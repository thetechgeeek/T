import { useNotificationStore } from '../notificationStore';
import { notificationRepository } from '../../repositories/notificationRepository';

jest.mock('../../repositories/notificationRepository', () => ({
	notificationRepository: {
		fetchUnread: jest.fn(),
		markAsRead: jest.fn(),
	},
}));

// Suppress eventBus side-effects during tests
jest.mock('../../events/appEvents', () => ({
	eventBus: {
		subscribe: jest.fn(),
	},
}));

const mockNotifications = [
	{ id: 'n1', title: 'Low stock', body: 'Reorder soon', read: false, created_at: '2026-03-29T00:00:00Z', type: 'low_stock' as const, metadata: {} },
	{ id: 'n2', title: 'Payment received', body: '₹1000 from Rajesh', read: false, created_at: '2026-03-28T00:00:00Z', type: 'payment' as const, metadata: {} },
];

describe('notificationStore', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Reset store state before each test
		useNotificationStore.setState({
			notifications: [],
			unreadCount: 0,
			loading: false,
			error: null,
		});
	});

	describe('fetchUnread', () => {
		it('populates notifications and updates unreadCount', async () => {
			(notificationRepository.fetchUnread as jest.Mock).mockResolvedValue(mockNotifications);

			await useNotificationStore.getState().fetchUnread();

			const state = useNotificationStore.getState();
			expect(state.notifications).toEqual(mockNotifications);
			expect(state.unreadCount).toBe(2);
			expect(state.loading).toBe(false);
		});

		it('sets error when repository throws', async () => {
			(notificationRepository.fetchUnread as jest.Mock).mockRejectedValue(
				new Error('Network error'),
			);

			await useNotificationStore.getState().fetchUnread();

			const state = useNotificationStore.getState();
			expect(state.error).toBe('Network error');
			expect(state.loading).toBe(false);
		});
	});

	describe('markAsRead', () => {
		it('marks a notification as read and decrements unreadCount', async () => {
			(notificationRepository.fetchUnread as jest.Mock).mockResolvedValue(mockNotifications);
			await useNotificationStore.getState().fetchUnread();

			(notificationRepository.markAsRead as jest.Mock).mockResolvedValue(undefined);
			await useNotificationStore.getState().markAsRead('n1');

			const state = useNotificationStore.getState();
			const n1 = state.notifications.find((n) => n.id === 'n1');
			expect(n1?.read).toBe(true);
			expect(state.unreadCount).toBe(1);
		});

		it('sets error when markAsRead repository call fails', async () => {
			useNotificationStore.setState({ notifications: mockNotifications, unreadCount: 2 });
			(notificationRepository.markAsRead as jest.Mock).mockRejectedValue(
				new Error('DB error'),
			);

			await useNotificationStore.getState().markAsRead('n1');

			expect(useNotificationStore.getState().error).toBe('DB error');
		});
	});

	describe('markAllAsRead', () => {
		it('marks all unread notifications as read', async () => {
			(notificationRepository.fetchUnread as jest.Mock).mockResolvedValue(mockNotifications);
			await useNotificationStore.getState().fetchUnread();

			(notificationRepository.markAsRead as jest.Mock).mockResolvedValue(undefined);
			await useNotificationStore.getState().markAllAsRead();

			const state = useNotificationStore.getState();
			expect(state.notifications.every((n) => n.read)).toBe(true);
			expect(state.unreadCount).toBe(0);
		});
	});
});
