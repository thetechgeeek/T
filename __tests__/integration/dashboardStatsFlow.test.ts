/**
 * INT-009: Dashboard Stats Flow — real Supabase integration tests.
 * Tests the dashboardService.fetchDashboardStats() which calls an RPC function.
 * Run with: yarn test:integration
 */
import { createTestSupabaseClient, signInTestUser } from '../utils/integrationHelpers';
import { dashboardService } from '@/src/services/dashboardService';

const supabase = createTestSupabaseClient();

beforeAll(async () => {
	await signInTestUser(supabase);
});

afterAll(async () => {
	await supabase.auth.signOut();
});

describe('INT-009: Dashboard Stats Flow', () => {
	it('fetchDashboardStats returns an object without error', async () => {
		const stats = await dashboardService.fetchDashboardStats();
		expect(stats).toBeDefined();
		expect(typeof stats).toBe('object');
	});

	it('stats has today_sales field as a number', async () => {
		const stats = await dashboardService.fetchDashboardStats();
		expect(typeof stats.today_sales).toBe('number');
	});

	it('stats has today_invoice_count as a number', async () => {
		const stats = await dashboardService.fetchDashboardStats();
		expect(typeof stats.today_invoice_count).toBe('number');
	});

	it('stats has total_outstanding_credit as a number', async () => {
		const stats = await dashboardService.fetchDashboardStats();
		expect(typeof stats.total_outstanding_credit).toBe('number');
	});

	it('stats has low_stock_count as a number', async () => {
		const stats = await dashboardService.fetchDashboardStats();
		expect(typeof stats.low_stock_count).toBe('number');
	});

	it('stats has monthly_revenue as a number', async () => {
		const stats = await dashboardService.fetchDashboardStats();
		expect(typeof stats.monthly_revenue).toBe('number');
	});

	it('stats values are non-negative numbers', async () => {
		const stats = await dashboardService.fetchDashboardStats();
		expect(stats.today_sales).toBeGreaterThanOrEqual(0);
		expect(stats.low_stock_count).toBeGreaterThanOrEqual(0);
		expect(stats.monthly_revenue).toBeGreaterThanOrEqual(0);
	});
});
