import { announceForScreenReader } from '@easydesign/design-system/foundation';

interface SyncQueueStatus {
	pendingCount: number;
	failedCount?: number;
}

export function buildListRefreshAnnouncement(listName: string, itemCount: number): string {
	return `${listName} refreshed. ${itemCount} ${itemCount === 1 ? 'item' : 'items'} available.`;
}

export function buildListLoadMoreAnnouncement(
	listName: string,
	addedCount: number,
	totalCount?: number,
): string {
	if (typeof totalCount === 'number') {
		return `${addedCount} more ${addedCount === 1 ? 'item' : 'items'} loaded in ${listName}. ${totalCount} total.`;
	}

	return `${addedCount} more ${addedCount === 1 ? 'item' : 'items'} loaded in ${listName}.`;
}

export function buildNetworkStatusAnnouncement(isOnline: boolean): string {
	return isOnline ? 'Back online. Sync can resume.' : 'You are offline. Changes will sync later.';
}

export function buildSyncQueueStatusAnnouncement({
	pendingCount,
	failedCount = 0,
}: SyncQueueStatus): string {
	if (failedCount > 0) {
		return `${failedCount} sync ${failedCount === 1 ? 'item needs' : 'items need'} attention. ${pendingCount} pending.`;
	}

	if (pendingCount > 0) {
		return `${pendingCount} sync ${pendingCount === 1 ? 'item is' : 'items are'} pending.`;
	}

	return 'All changes are synced.';
}

export async function announceListRefreshComplete(listName: string, itemCount: number) {
	await announceForScreenReader(buildListRefreshAnnouncement(listName, itemCount));
}

export async function announceListLoadMoreComplete(
	listName: string,
	addedCount: number,
	totalCount?: number,
) {
	await announceForScreenReader(buildListLoadMoreAnnouncement(listName, addedCount, totalCount));
}

export async function announceNetworkStatus(isOnline: boolean) {
	await announceForScreenReader(buildNetworkStatusAnnouncement(isOnline));
}

export async function announceSyncQueueStatus(status: SyncQueueStatus) {
	await announceForScreenReader(buildSyncQueueStatusAnnouncement(status));
}
