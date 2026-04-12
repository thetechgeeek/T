import { create } from 'zustand';
import { writeQueue } from '../services/writeQueueService';

interface SyncState {
	lastSyncedAt: string | null;
	isSyncing: boolean;
	pendingCount: number;
	setLastSyncedAt: (date: string) => void;
	setIsSyncing: (isSyncing: boolean) => void;
	refreshPendingCount: () => Promise<void>;
}

/**
 * P22.1 — SyncStore
 * Reactive store for synchronization status.
 * Values are used in ScreenHeader and OfflineBanner.
 */
export const useSyncStore = create<SyncState>((set) => ({
	lastSyncedAt: null,
	isSyncing: false,
	pendingCount: 0,
	setLastSyncedAt: (date) => set({ lastSyncedAt: date }),
	setIsSyncing: (isSyncing) => set({ isSyncing }),
	refreshPendingCount: async () => {
		const count = await writeQueue.getPendingCount();
		set({ pendingCount: count });
	},
}));
