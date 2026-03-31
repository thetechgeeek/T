/**
 * INT-011: Finance/Report Flow — real Supabase integration tests.
 * Tests financeService.getProfitLoss() and financeRepository.fetchProfitLoss().
 * Run with: yarn test:integration
 */
import { createTestSupabaseClient, signInTestUser } from '../utils/integrationHelpers';
import { financeService } from '@/src/services/financeService';
import { financeRepository } from '@/src/repositories/financeRepository';

const supabase = createTestSupabaseClient();

// Use a fixed date range covering test data
const START_DATE = '2026-01-01';
const END_DATE = '2026-12-31';

beforeAll(async () => {
	await signInTestUser(supabase);
});

afterAll(async () => {
	await supabase.auth.signOut();
});

describe('INT-011: Finance Summary Flow', () => {
	it('fetchProfitLoss returns a summary object via repository', async () => {
		const summary = await financeRepository.fetchProfitLoss(START_DATE, END_DATE);
		expect(summary).toBeDefined();
		expect(typeof summary).toBe('object');
	});

	it('getProfitLoss returns a summary via financeService', async () => {
		const summary = await financeService.getProfitLoss(START_DATE, END_DATE);
		expect(summary).toBeDefined();
	});

	it('summary has gross_profit as a number', async () => {
		const summary = await financeRepository.fetchProfitLoss(START_DATE, END_DATE);
		expect(typeof summary.gross_profit).toBe('number');
	});

	it('summary has net_profit as a number', async () => {
		const summary = await financeRepository.fetchProfitLoss(START_DATE, END_DATE);
		expect(typeof summary.net_profit).toBe('number');
	});

	it('summary has total_expenses as a number', async () => {
		const summary = await financeRepository.fetchProfitLoss(START_DATE, END_DATE);
		expect(typeof summary.total_expenses).toBe('number');
	});

	it('total_expenses is non-negative', async () => {
		const summary = await financeRepository.fetchProfitLoss(START_DATE, END_DATE);
		expect(summary.total_expenses).toBeGreaterThanOrEqual(0);
	});

	it('fetchDashboardStats returns a stats object', async () => {
		const stats = await financeRepository.fetchDashboardStats();
		expect(stats).toBeDefined();
		expect(typeof stats).toBe('object');
	});

	it('dashboard stats has low_stock_count as a number', async () => {
		const stats = await financeRepository.fetchDashboardStats();
		expect(typeof stats.low_stock_count).toBe('number');
	});
});
