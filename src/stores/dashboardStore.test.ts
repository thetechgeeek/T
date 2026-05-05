import { useDashboardStore } from './dashboardStore';
import { dashboardService } from '../services/dashboardService';

jest.mock('../utils/retry', () => ({
	withRetry: jest.fn((fn) => fn()),
}));
import type { DashboardStats } from '../types/finance';

jest.mock('../services/dashboardService', () => ({
	dashboardService: {
		fetchDashboardStats: jest.fn(),
	},
}));

const mockStats: DashboardStats = {
	today_sales: 5000,
	today_invoice_count: 3,
	total_outstanding_credit: 12000,
	total_outstanding_customers: 4,
	low_stock_count: 2,
	monthly_revenue: 85000,
};

describe('dashboardStore', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		useDashboardStore.setState({ stats: null, loading: false, error: null });
	});

	it('initial state is empty', () => {
		const state = useDashboardStore.getState();
		expect(state.stats).toBeNull();
		expect(state.loading).toBe(false);
		expect(state.error).toBeNull();
	});

	it('fetchStats sets loading=true then resolves with stats', async () => {
		(dashboardService.fetchDashboardStats as jest.Mock).mockResolvedValue(mockStats);

		const fetchPromise = useDashboardStore.getState().fetchStats();
		expect(useDashboardStore.getState().loading).toBe(true);

		await fetchPromise;

		const state = useDashboardStore.getState();
		expect(state.stats).toEqual(mockStats);
		expect(state.loading).toBe(false);
		expect(state.error).toBeNull();
	});

	it('fetchStats sets error on failure', async () => {
		(dashboardService.fetchDashboardStats as jest.Mock).mockRejectedValue(
			new Error('Network error'),
		);

		await useDashboardStore.getState().fetchStats();

		const state = useDashboardStore.getState();
		expect(state.stats).toBeNull();
		expect(state.loading).toBe(false);
		expect(state.error).toBe('Network error');
	});

	it('fetchStats: stale stats retained until new fetch succeeds (not wiped to null during loading)', async () => {
		useDashboardStore.setState({ stats: mockStats });
		let resolve!: (v: unknown) => void;
		const p = new Promise((r) => {
			resolve = r;
		});
		(dashboardService.fetchDashboardStats as jest.Mock).mockReturnValue(p);

		const fetchPromise = useDashboardStore.getState().fetchStats();
		// During loading, existing stats should not be wiped
		expect(useDashboardStore.getState().stats).toEqual(mockStats);
		expect(useDashboardStore.getState().loading).toBe(true);

		resolve(mockStats);
		await fetchPromise;
	});

	it('fetchStats clears previous error before retrying', async () => {
		useDashboardStore.setState({ error: 'stale error' });
		(dashboardService.fetchDashboardStats as jest.Mock).mockResolvedValue(mockStats);

		await useDashboardStore.getState().fetchStats();

		expect(useDashboardStore.getState().error).toBeNull();
	});

	it('leaves event-driven refresh ownership to the store orchestrator', () => {
		expect(useDashboardStore.getState().fetchStats).toEqual(expect.any(Function));
	});
});
