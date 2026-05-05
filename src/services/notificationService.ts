import { notificationRepository } from '../repositories/notificationRepository';
import { toAppError } from '../errors/AppError';
import type { UUID } from '../types/common';
import type { Notification } from '../types/notification';

export const notificationService = {
	async fetchUnread(): Promise<Notification[]> {
		try {
			return await notificationRepository.fetchUnread();
		} catch (error: unknown) {
			throw toAppError(error);
		}
	},

	async markAsRead(id: UUID): Promise<void> {
		try {
			await notificationRepository.markAsRead(id);
		} catch (error: unknown) {
			throw toAppError(error);
		}
	},
};
