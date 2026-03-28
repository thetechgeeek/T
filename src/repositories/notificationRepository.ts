import { supabase } from '../config/supabase';
import { AppError } from '../errors';
import { createRepository } from './baseRepository';
import type { Notification } from '../types/notification';
import type { UUID } from '../types/common';

const base = createRepository<Notification>('notifications');

export const notificationRepository = {
	...base,

	async fetchUnread(): Promise<Notification[]> {
		const { data, error } = await supabase
			.from('notifications')
			.select('*')
			.eq('read', false)
			.order('created_at', { ascending: false });
		if (error) {
			throw new AppError(
				error.message,
				error.code ?? 'DB_ERROR',
				'Failed to fetch notifications',
				error,
			);
		}
		return (data ?? []) as Notification[];
	},

	async markAsRead(id: UUID): Promise<void> {
		const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
		if (error) {
			throw new AppError(
				error.message,
				error.code ?? 'DB_ERROR',
				'Failed to mark notification as read',
				error,
			);
		}
	},
};
