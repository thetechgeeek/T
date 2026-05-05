import { eventBus } from '../events/appEvents';
import { useCustomerStore } from '../stores/customerStore';
import { useDashboardStore } from '../stores/dashboardStore';
import { useFinanceStore } from '../stores/financeStore';
import { useInventoryStore } from '../stores/inventoryStore';
import { useInvoiceStore } from '../stores/invoiceStore';
import { useNotificationStore } from '../stores/notificationStore';
import {
	isStoreOrchestratorStarted,
	startStoreOrchestrator,
	stopStoreOrchestrator,
} from './storeOrchestrator';

const originalActions = {
	customer: {
		fetchCustomers: useCustomerStore.getState().fetchCustomers,
		fetchCustomerDetail: useCustomerStore.getState().fetchCustomerDetail,
	},
	dashboard: {
		fetchStats: useDashboardStore.getState().fetchStats,
	},
	finance: {
		fetchSummary: useFinanceStore.getState().fetchSummary,
		fetchExpenses: useFinanceStore.getState().fetchExpenses,
	},
	inventory: {
		fetchItems: useInventoryStore.getState().fetchItems,
	},
	invoice: {
		fetchInvoices: useInvoiceStore.getState().fetchInvoices,
		fetchInvoiceById: useInvoiceStore.getState().fetchInvoiceById,
	},
	notification: {
		fetchUnread: useNotificationStore.getState().fetchUnread,
	},
};

function resolvedAction() {
	return jest.fn().mockResolvedValue(undefined);
}

function installMockActions() {
	useCustomerStore.setState({
		fetchCustomers: resolvedAction(),
		fetchCustomerDetail: resolvedAction(),
		selectedCustomer: null,
	});
	useDashboardStore.setState({ fetchStats: resolvedAction() });
	useFinanceStore.setState({
		fetchSummary: resolvedAction(),
		fetchExpenses: resolvedAction(),
	});
	useInventoryStore.setState({ fetchItems: resolvedAction() });
	useInvoiceStore.setState({
		fetchInvoices: resolvedAction(),
		fetchInvoiceById: resolvedAction(),
		currentInvoice: null,
	});
	useNotificationStore.setState({ fetchUnread: resolvedAction() });
}

function restoreActions() {
	useCustomerStore.setState({
		...originalActions.customer,
		selectedCustomer: null,
	});
	useDashboardStore.setState(originalActions.dashboard);
	useFinanceStore.setState(originalActions.finance);
	useInventoryStore.setState(originalActions.inventory);
	useInvoiceStore.setState({
		...originalActions.invoice,
		currentInvoice: null,
	});
	useNotificationStore.setState(originalActions.notification);
}

describe('storeOrchestrator', () => {
	beforeEach(() => {
		stopStoreOrchestrator();
		jest.clearAllMocks();
		installMockActions();
	});

	afterEach(() => {
		stopStoreOrchestrator();
		restoreActions();
	});

	it('starts once and prevents duplicate event handlers', () => {
		startStoreOrchestrator();
		startStoreOrchestrator();

		eventBus.emit({ type: 'INVOICE_CREATED', invoiceId: 'invoice-1', customerId: 'cust-1' });

		expect(useCustomerStore.getState().fetchCustomers).toHaveBeenCalledTimes(1);
		expect(useDashboardStore.getState().fetchStats).toHaveBeenCalledTimes(1);
	});

	it('tears down the subscription', () => {
		startStoreOrchestrator();
		stopStoreOrchestrator();

		eventBus.emit({ type: 'STOCK_CHANGED', itemId: 'item-1' });

		expect(useInventoryStore.getState().fetchItems).not.toHaveBeenCalled();
		expect(useNotificationStore.getState().fetchUnread).not.toHaveBeenCalled();
		expect(isStoreOrchestratorStarted()).toBe(false);
	});

	it('routes stock events to inventory, notifications, and dashboard refreshes', () => {
		startStoreOrchestrator();

		eventBus.emit({ type: 'STOCK_CHANGED', itemId: 'item-1' });

		expect(useInventoryStore.getState().fetchItems).toHaveBeenCalledWith(true);
		expect(useNotificationStore.getState().fetchUnread).toHaveBeenCalled();
		expect(useDashboardStore.getState().fetchStats).toHaveBeenCalled();
	});

	it('refreshes focused customer and invoice details when matching events arrive', () => {
		useCustomerStore.setState({ selectedCustomer: { id: 'cust-1' } as never });
		useInvoiceStore.setState({ currentInvoice: { id: 'inv-1' } as never });
		startStoreOrchestrator();

		eventBus.emit({
			type: 'PAYMENT_RECORDED',
			paymentId: 'pay-1',
			invoiceId: 'inv-1',
			customerId: 'cust-1',
		});

		expect(useCustomerStore.getState().fetchCustomerDetail).toHaveBeenCalledWith('cust-1');
		expect(useInvoiceStore.getState().fetchInvoiceById).toHaveBeenCalledWith('inv-1');
		expect(useFinanceStore.getState().fetchSummary).toHaveBeenCalled();
		expect(useFinanceStore.getState().fetchExpenses).toHaveBeenCalled();
	});
});
