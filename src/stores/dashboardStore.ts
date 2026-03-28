import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { dashboardService } from '../services/dashboardService';
import { eventBus } from '../events/appEvents';
import type { DashboardStats } from '../types/finance';

interface DashboardState {
	stats: DashboardStats | null;
	loading: boolean;
	error: string | null;

	fetchStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>()(
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
				const stats = await dashboardService.fetchDashboardStats();
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
	})),
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
