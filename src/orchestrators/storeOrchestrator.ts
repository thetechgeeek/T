import { eventBus, type AppEvent } from '../events/appEvents';
import { useCustomerStore } from '../stores/customerStore';
import { useDashboardStore } from '../stores/dashboardStore';
import { useFinanceStore } from '../stores/financeStore';
import { useInventoryStore } from '../stores/inventoryStore';
import { useInvoiceStore } from '../stores/invoiceStore';
import { useNotificationStore } from '../stores/notificationStore';

let unsubscribeStoreEvents: (() => void) | null = null;

export function handleStoreEvent(event: AppEvent): void {
	if (event.type === 'INVOICE_CREATED' || event.type === 'PAYMENT_RECORDED') {
		void useCustomerStore.getState().fetchCustomers(true);

		const { selectedCustomer } = useCustomerStore.getState();
		if (selectedCustomer && event.customerId === selectedCustomer.id) {
			void useCustomerStore.getState().fetchCustomerDetail(selectedCustomer.id);
		}
	}

	if (
		event.type === 'INVOICE_CREATED' ||
		event.type === 'PAYMENT_RECORDED' ||
		event.type === 'STOCK_CHANGED'
	) {
		void useDashboardStore.getState().fetchStats();
	}

	if (event.type === 'PAYMENT_RECORDED') {
		const financeStore = useFinanceStore.getState();
		void financeStore.fetchSummary();
		void financeStore.fetchExpenses();

		if (event.invoiceId) {
			void useInvoiceStore.getState().fetchInvoices(1);
			const current = useInvoiceStore.getState().currentInvoice;
			if (current && current.id === event.invoiceId) {
				void useInvoiceStore.getState().fetchInvoiceById(event.invoiceId);
			}
		}
	}

	if (event.type === 'EXPENSE_CREATED') {
		void useFinanceStore.getState().fetchSummary();
	}

	if (event.type === 'CUSTOMER_UPDATED') {
		void useInvoiceStore.getState().fetchInvoices(1);
	}

	if (event.type === 'STOCK_CHANGED') {
		void useInventoryStore.getState().fetchItems(true);
		void useNotificationStore.getState().fetchUnread();
	}
}

export function startStoreOrchestrator(): void {
	if (unsubscribeStoreEvents) return;
	unsubscribeStoreEvents = eventBus.subscribe(handleStoreEvent);
}

export function stopStoreOrchestrator(): void {
	unsubscribeStoreEvents?.();
	unsubscribeStoreEvents = null;
}

export function isStoreOrchestratorStarted(): boolean {
	return unsubscribeStoreEvents !== null;
}
