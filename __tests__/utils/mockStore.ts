/**
 * Zustand store reset helpers for tests.
 *
 * Call in afterEach to prevent state leaking between tests:
 *   import { resetAllStores } from '__tests__/utils/mockStore';
 *   afterEach(() => resetAllStores());
 *
 * Or use individual helpers if only one store is involved:
 *   afterEach(() => resetInvoiceStore());
 */
import { useInvoiceStore } from '../../src/stores/invoiceStore';
import { useInventoryStore } from '../../src/stores/inventoryStore';
import { useCustomerStore } from '../../src/stores/customerStore';
import { useAuthStore } from '../../src/stores/authStore';
import { useFinanceStore } from '../../src/stores/financeStore';
import { useDashboardStore } from '../../src/stores/dashboardStore';

export function resetInvoiceStore(): void {
	useInvoiceStore.setState({
		invoices: [],
		currentInvoice: null,
		loading: false,
		error: null,
		filters: {},
		totalCount: 0,
		currentPage: 1,
	});
}

export function resetInventoryStore(): void {
	useInventoryStore.setState({
		items: [],
		totalCount: 0,
		loading: false,
		error: null,
		filters: {},
		page: 1,
		hasMore: true,
	});
}

export function resetCustomerStore(): void {
	useCustomerStore.setState({
		customers: [],
		totalCount: 0,
		loading: false,
		error: null,
		filters: {},
	});
}

export function resetAuthStore(): void {
	useAuthStore.setState({
		user: null,
		session: null,
		loading: false,
		isAuthenticated: false,
	});
}

export function resetFinanceStore(): void {
	useFinanceStore.setState({
		expenses: [],
		purchases: [],
		loading: false,
		error: null,
	});
}

export function resetDashboardStore(): void {
	useDashboardStore.setState({
		stats: null,
		loading: false,
		error: null,
	});
}

export function resetAllStores(): void {
	resetInvoiceStore();
	resetInventoryStore();
	resetCustomerStore();
	resetAuthStore();
	resetFinanceStore();
	resetDashboardStore();
}
