import type { UUID } from './common';

export type NotificationType = 'low_stock' | 'payment_received' | 'order_update' | string;

export interface Notification {
	id: UUID;
	type: NotificationType;
	title: string;
	body?: string;
	read: boolean;
	metadata: Record<string, unknown>;
	created_at: string;
}
