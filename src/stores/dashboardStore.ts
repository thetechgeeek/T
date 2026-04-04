import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dashboardService } from '../services/dashboardService';
import { eventBus } from '../events/appEvents';
import { withRetry } from '../utils/retry';
import type { DashboardStats } from '../types/finance';

export interface DashboardState {
	stats: DashboardStats | null;
	loading: boolean;
	error: string | null;

	fetchStats: () => Promise<void>;
	reset: () => void;
}

export const useDashboardStore = create<DashboardState>()(
	persist(
		immer((set) => ({
			stats: null,
			loading: false,
			error: null,

			fetchStats: async () => {
				set((s) => {
					s.loading = true;
					s.error = null;
				});
				try {
					const stats = await withRetry(() => dashboardService.fetchDashboardStats());
					set((s) => {
						s.stats = stats;
						s.loading = false;
					});
				} catch (err: unknown) {
					set((s) => {
						s.error = (err as Error).message;
						s.loading = false;
					});
				}
			},

			reset: () => {
				set((s) => {
					s.stats = null;
					s.loading = false;
					s.error = null;
				});
			},
		})),
		{
			name: 'dashboard-storage',
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);

// Auto-refresh when key business events occur
eventBus.subscribe((event) => {
	if (
		event.type === 'INVOICE_CREATED' ||
		event.type === 'PAYMENT_RECORDED' ||
		event.type === 'STOCK_CHANGED'
	) {
		useDashboardStore.getState().fetchStats();
	}
});
