import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { notificationRepository } from '../repositories/notificationRepository';
import { eventBus } from '../events/appEvents';
import type { Notification } from '../types/notification';
import type { UUID } from '../types/common';

interface NotificationState {
	notifications: Notification[];
	unreadCount: number;
	loading: boolean;
	error: string | null;

	fetchUnread: () => Promise<void>;
	markAsRead: (id: UUID) => Promise<void>;
	markAllAsRead: () => Promise<void>;
	reset: () => void;
}

export const useNotificationStore = create<NotificationState>()(
	immer((set, get) => ({
		notifications: [],
		unreadCount: 0,
		loading: false,
		error: null,

		fetchUnread: async () => {
			set((s) => {
				s.loading = true;
				s.error = null;
			});
			try {
				const notifications = await notificationRepository.fetchUnread();
				set((s) => {
					s.notifications = notifications;
					s.unreadCount = notifications.length;
					s.loading = false;
				});
			} catch (err: unknown) {
				set((s) => {
					s.error = (err as Error).message;
					s.loading = false;
				});
			}
		},

		markAsRead: async (id) => {
			try {
				await notificationRepository.markAsRead(id);
				set((s) => {
					const idx = s.notifications.findIndex((n) => n.id === id);
					if (idx !== -1) {
						s.notifications[idx].read = true;
					}
					s.unreadCount = s.notifications.filter((n) => !n.read).length;
				});
			} catch (err: unknown) {
				set((s) => {
					s.error = (err as Error).message;
				});
			}
		},

		markAllAsRead: async () => {
			const unread = get().notifications.filter((n) => !n.read);
			await Promise.all(unread.map((n) => get().markAsRead(n.id)));
		},

		reset: () => {
			set((s) => {
				s.notifications = [];
				s.unreadCount = 0;
				s.loading = false;
				s.error = null;
			});
		},
	})),
);

// Refresh notifications when stock changes (may trigger low-stock notifications)
eventBus.subscribe((event) => {
	if (event.type === 'STOCK_CHANGED') {
		useNotificationStore.getState().fetchUnread();
	}
});
