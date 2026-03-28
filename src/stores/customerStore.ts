import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { customerService } from '../services/customerService';
import type {
	Customer,
	CustomerFilters,
	CustomerLedgerEntry,
	CustomerLedgerSummary,
} from '../types/customer';
import type { UUID } from '../types/common';

interface CustomerState {
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
	createCustomer: (customer: any) => Promise<Customer>;
	updateCustomer: (id: UUID, updates: any) => Promise<Customer>;
}

export const useCustomerStore = create<CustomerState>()(
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
			get().fetchCustomers(true);
		},

		fetchCustomers: async (reset = false) => {
			set((s) => {
				s.loading = true;
				s.error = null;
			});
			try {
				const { data, count } = await customerService.fetchCustomers(get().filters);
				set((s) => {
					s.customers = data;
					s.totalCount = count;
					s.loading = false;
				});
			} catch (err: any) {
				set((s) => {
					s.error = err.message;
					s.loading = false;
				});
			}
		},

		fetchCustomerDetail: async (id: UUID) => {
			set((s) => {
				s.loading = true;
				s.error = null;
				s.ledger = [];
				s.summary = null;
			});
			try {
				const [customer, ledger, summary] = await Promise.all([
					customerService.fetchCustomerById(id),
					customerService.fetchLedgerEntries(id),
					customerService.getLedgerSummary(id),
				]);

				set((s) => {
					s.selectedCustomer = customer;
					s.ledger = ledger;
					s.summary = summary;
					s.loading = false;
				});
			} catch (err: any) {
				set((s) => {
					s.error = err.message;
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
			} catch (err: any) {
				set((s) => {
					s.error = err.message;
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
				return updated;
			} catch (err: any) {
				set((s) => {
					s.error = err.message;
					s.loading = false;
				});
				throw err;
			}
		},
	})),
);
