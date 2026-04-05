import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { customerService } from '../services/customerService';
import { eventBus } from '../events/appEvents';
import { debounce } from '../utils/perf';
import { withRetry } from '../utils/retry';
import type {
	Customer,
	CustomerInsert,
	CustomerFilters,
	CustomerLedgerEntry,
	CustomerLedgerSummary,
} from '../types/customer';
import type { UUID } from '../types/common';

export interface CustomerState {
	customers: Customer[];
	totalCount: number;
	loading: boolean;
	error: string | null;
	filters: CustomerFilters;

	// Detail/Ledger state
	selectedCustomer: Customer | null;
	ledger: CustomerLedgerEntry[];
	summary: CustomerLedgerSummary | null;

	// Actions
	fetchCustomers: (reset?: boolean) => Promise<void>;
	setFilters: (filters: Partial<CustomerFilters>) => void;
	fetchCustomerDetail: (id: UUID) => Promise<void>;
	createCustomer: (customer: CustomerInsert) => Promise<Customer>;
	updateCustomer: (id: UUID, updates: Partial<CustomerInsert>) => Promise<Customer>;
	reset: () => void;
}

// Helper to handle debounced fetches
const debouncedFetchCustomers = debounce((get: () => CustomerState) => {
	get().fetchCustomers(true);
}, 300);

export const useCustomerStore = create<CustomerState>()(
	persist(
		immer((set, get) => ({
			customers: [],
			totalCount: 0,
			loading: false,
			error: null,
			filters: {
				search: '',
				type: 'ALL',
				sortBy: 'name',
				sortDir: 'asc',
			},

			selectedCustomer: null,
			ledger: [],
			summary: null,

			setFilters: (newFilters) => {
				set((state) => {
					state.filters = { ...state.filters, ...newFilters };
				});
				// Debounce the fetch to avoid spamming the server on rapid keystrokes
				debouncedFetchCustomers(get);
			},

			fetchCustomers: async (reset = false) => {
				set((s) => {
					s.loading = true;
					s.error = null;
				});
				try {
					const { data, count } = await withRetry(() =>
						customerService.fetchCustomers(get().filters),
					);
					set((s) => {
						if (reset) {
							s.customers = data;
						} else {
							const existingIds = new Set(s.customers.map((c: Customer) => c.id));
							const newItems = data.filter((c: Customer) => !existingIds.has(c.id));
							s.customers.push(...newItems);
						}
						s.totalCount = count;
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
					s.customers = [];
					s.totalCount = 0;
					s.selectedCustomer = null;
					s.ledger = [];
					s.summary = null;
					s.error = null;
					s.filters = {
						search: '',
						type: 'ALL',
						sortBy: 'name',
						sortDir: 'asc',
					};
				});
			},

			fetchCustomerDetail: async (id: UUID) => {
				const isSameCustomer = get().selectedCustomer?.id === id;
				set((s) => {
					s.loading = true;
					s.error = null;
					// Only blank the data when switching to a different customer.
					// Re-visiting the same customer keeps stale data visible while the
					// background refresh completes — avoids a blank loading flash.
					if (!isSameCustomer) {
						s.selectedCustomer = null;
						s.ledger = [];
						s.summary = null;
					}
				});
				try {
					const [customer, ledger, summary] = await withRetry(() =>
						Promise.all([
							customerService.fetchCustomerById(id),
							customerService.fetchLedgerEntries(id),
							customerService.getLedgerSummary(id),
						]),
					);

					set((s) => {
						s.selectedCustomer = customer;
						s.ledger = ledger;
						s.summary = summary;
						s.loading = false;
					});
				} catch (err: unknown) {
					set((s) => {
						s.error = (err as Error).message;
						s.loading = false;
					});
				}
			},

			createCustomer: async (payload) => {
				set((s) => {
					s.loading = true;
					s.error = null;
				});
				try {
					const newCustomer = await customerService.createCustomer(payload);
					set((s) => {
						s.customers.unshift(newCustomer);
						s.totalCount += 1;
						s.loading = false;
					});
					return newCustomer;
				} catch (err: unknown) {
					set((s) => {
						s.error = (err as Error).message;
						s.loading = false;
					});
					throw err;
				}
			},

			updateCustomer: async (id, updates) => {
				set((s) => {
					s.loading = true;
					s.error = null;
				});
				try {
					const updated = await customerService.updateCustomer(id, updates);
					set((s) => {
						const idx = s.customers.findIndex((c) => c.id === id);
						if (idx !== -1) s.customers[idx] = updated;
						if (s.selectedCustomer?.id === id) s.selectedCustomer = updated;
						s.loading = false;
					});
					eventBus.emit({ type: 'CUSTOMER_UPDATED', customerId: id });
					return updated;
				} catch (err: unknown) {
					set((s) => {
						s.error = (err as Error).message;
						s.loading = false;
					});
					throw err;
				}
			},
		})),
		{
			name: 'customer-storage',
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state: CustomerState) => ({
				customers: state.customers,
				totalCount: state.totalCount,
				filters: state.filters,
			}),
		},
	),
);

// Refresh customer list when an invoice or payment affects a customer's balance
eventBus.subscribe((event) => {
	if (event.type === 'INVOICE_CREATED' || event.type === 'PAYMENT_RECORDED') {
		useCustomerStore.getState().fetchCustomers(true);

		// If we are looking at this specific customer's ledger, refresh it too
		const { selectedCustomer } = useCustomerStore.getState();
		if (selectedCustomer && event.customerId === selectedCustomer.id) {
			useCustomerStore.getState().fetchCustomerDetail(selectedCustomer.id);
		}
	}
});
