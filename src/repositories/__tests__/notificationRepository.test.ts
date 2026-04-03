import { makeBuilder } from './helpers';
import { supabase } from '../../config/supabase';

jest.mock('../../config/supabase', () => ({
	supabase: {
		from: jest.fn(),
		rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
	},
}));

import { notificationRepository } from '../notificationRepository';

const mockFrom = supabase.from as jest.Mock;

const mockNotification = {
	id: 'n1',
	type: 'low_stock',
	title: 'Low stock: GLOSSY WHITE',
	body: 'Only 2 boxes left',
	read: false,
	metadata: {},
	created_at: '2026-03-01T10:00:00Z',
};

beforeEach(() => {
	jest.clearAllMocks();
});

describe('notificationRepository.fetchUnread', () => {
	it('queries notifications table with read=false filter', async () => {
		const builder = makeBuilder({ data: [mockNotification], count: 1, error: null });
		mockFrom.mockReturnValue(builder);

		await notificationRepository.fetchUnread();

		expect(mockFrom).toHaveBeenCalledWith('notifications');
		expect(builder.select).toHaveBeenCalledWith('*');
		expect(builder.eq).toHaveBeenCalledWith('read', false);
		expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
	});

	it('returns correctly mapped notification objects', async () => {
		const builder = makeBuilder({ data: [mockNotification], count: 1, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await notificationRepository.fetchUnread();

		expect(result).toEqual([mockNotification]);
	});

	it('returns empty array when no unread notifications exist', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await notificationRepository.fetchUnread();
		expect(result).toEqual([]);
	});

	it('returns empty array when data is null', async () => {
		const builder = makeBuilder({ data: null, count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await notificationRepository.fetchUnread();
		expect(result).toEqual([]);
	});

	it('throws AppError when Supabase returns an error', async () => {
		const builder = makeBuilder({
			data: null,
			error: { message: 'DB failure', code: 'DB_ERROR' },
		});
		mockFrom.mockReturnValue(builder);

		await expect(notificationRepository.fetchUnread()).rejects.toThrow('DB failure');
	});
});

describe('notificationRepository.markAsRead', () => {
	it('calls update with read=true for the given notification id', async () => {
		const builder = makeBuilder({ data: null, error: null });
		mockFrom.mockReturnValue(builder);

		await notificationRepository.markAsRead('n1');

		expect(mockFrom).toHaveBeenCalledWith('notifications');
		expect(builder.update).toHaveBeenCalledWith({ read: true });
		expect(builder.eq).toHaveBeenCalledWith('id', 'n1');
	});

	it('throws AppError when Supabase returns an error on markAsRead', async () => {
		const builder = makeBuilder({
			data: null,
			error: { message: 'Update failed', code: 'DB_ERROR' },
		});
		mockFrom.mockReturnValue(builder);

		await expect(notificationRepository.markAsRead('n1')).rejects.toThrow('Update failed');
	});
});

describe('notificationRepository base operations (via createRepository)', () => {
	it('findById delegates to base repository select on notifications table', async () => {
		const builder = makeBuilder(
			{ data: [], error: null },
			{ data: mockNotification, error: null },
		);
		mockFrom.mockReturnValue(builder);

		const result = await notificationRepository.findById('n1');

		expect(mockFrom).toHaveBeenCalledWith('notifications');
		expect(builder.eq).toHaveBeenCalledWith('id', 'n1');
		expect(result).toEqual(mockNotification);
	});

	it('throws AppError when findById cannot find record', async () => {
		const builder = makeBuilder(
			{ data: [], error: null },
			{ data: null, error: { message: 'No rows found', code: 'PGRST116' } },
		);
		mockFrom.mockReturnValue(builder);

		await expect(notificationRepository.findById('bad-id')).rejects.toThrow('found');
	});
});
