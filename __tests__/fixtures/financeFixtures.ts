import type { Expense, DashboardStats } from '../../src/types/finance';

export function makeExpense(overrides?: Partial<Expense>): Expense {
	return {
		id: 'exp-uuid-001',
		category: 'Transport',
		amount: 500,
		expense_date: '2026-01-15',
		notes: '',
		created_at: '2026-01-15T00:00:00.000Z',
		updated_at: '2026-01-15T00:00:00.000Z',
		...overrides,
	};
}

export function makeDashboardStats(overrides?: Partial<DashboardStats>): DashboardStats {
	return {
		today_sales: 10000,
		today_invoice_count: 3,
		total_outstanding_credit: 25000,
		total_outstanding_customers: 5,
		low_stock_count: 3,
		monthly_revenue: 150000,
		...overrides,
	};
}
