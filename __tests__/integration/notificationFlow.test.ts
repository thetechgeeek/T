/**
 * INT-010: Notification Flow — real Supabase integration tests.
 * Tests fetchUnread, markAsRead via notificationRepository.
 * Run with: yarn test:integration
 */
import { createTestSupabaseClient, testPrefix, signInTestUser } from '../utils/integrationHelpers';
import { notificationRepository } from '@/src/repositories/notificationRepository';

const supabase = createTestSupabaseClient();
const prefix = testPrefix();

beforeAll(async () => {
	await signInTestUser(supabase);
});

afterAll(async () => {
	// Clean up test notifications
	await supabase.from('notifications').delete().like('title', `${prefix}%`);
	await supabase.auth.signOut();
});

describe('INT-010: Notification Flow', () => {
	let notificationId: string;

	it('inserts a test notification via direct supabase client', async () => {
		const { data, error } = await supabase
			.from('notifications')
			.insert({
				title: `${prefix}Test Notification`,
				body: 'This is a test notification',
				read: false,
				type: 'info',
			})
			.select()
			.single();

		expect(error).toBeNull();
		expect(data.id).toBeTruthy();
		notificationId = data.id;
	});

	it('fetchUnread returns array of unread notifications', async () => {
		const notifications = await notificationRepository.fetchUnread();
		expect(Array.isArray(notifications)).toBe(true);
	});

	it('fetchUnread includes newly inserted notification', async () => {
		const notifications = await notificationRepository.fetchUnread();
		const found = notifications.find((n) => n.id === notificationId);
		expect(found).toBeDefined();
		expect(found?.read).toBe(false);
	});

	it('markAsRead sets notification read=true', async () => {
		await notificationRepository.markAsRead(notificationId);

		const { data } = await supabase
			.from('notifications')
			.select('read')
			.eq('id', notificationId)
			.single();

		expect(data?.read).toBe(true);
	});

	it('fetchUnread no longer includes the marked notification', async () => {
		const notifications = await notificationRepository.fetchUnread();
		const found = notifications.find((n) => n.id === notificationId);
		expect(found).toBeUndefined();
	});
});
