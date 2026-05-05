import {
	buildListLoadMoreAnnouncement,
	buildListRefreshAnnouncement,
	buildNetworkStatusAnnouncement,
	buildSyncQueueStatusAnnouncement,
} from '../announcements';

describe('accessibility announcements', () => {
	it('builds refresh and load-more messages with counts', () => {
		expect(buildListRefreshAnnouncement('Invoices', 1)).toBe(
			'Invoices refreshed. 1 item available.',
		);
		expect(buildListRefreshAnnouncement('Invoices', 2)).toBe(
			'Invoices refreshed. 2 items available.',
		);
		expect(buildListLoadMoreAnnouncement('Invoices', 3, 23)).toBe(
			'3 more items loaded in Invoices. 23 total.',
		);
	});

	it('builds network and sync queue messages', () => {
		expect(buildNetworkStatusAnnouncement(false)).toBe(
			'You are offline. Changes will sync later.',
		);
		expect(buildNetworkStatusAnnouncement(true)).toBe('Back online. Sync can resume.');
		expect(buildSyncQueueStatusAnnouncement({ pendingCount: 0 })).toBe(
			'All changes are synced.',
		);
		expect(buildSyncQueueStatusAnnouncement({ pendingCount: 2, failedCount: 1 })).toBe(
			'1 sync item needs attention. 2 pending.',
		);
	});
});
