import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { invoiceService } from '../services/invoiceService';
import { eventBus } from '../events/appEvents';
import type { Invoice, InvoiceInput, InvoiceFilters } from '../types/invoice';
import type { UUID } from '../types/common';

export interface InvoiceState {
	invoices: Invoice[];
	currentInvoice: Invoice | null;
	loading: boolean;
	error: string | null;
	filters: InvoiceFilters;
	totalCount: number;
	currentPage: number;

	// Actions
	setFilters: (filters: Partial<InvoiceFilters>) => void;
	fetchInvoices: (page?: number) => Promise<void>;
	fetchInvoiceById: (id: UUID) => Promise<void>;
	createInvoice: (input: InvoiceInput) => Promise<{ id: UUID; invoice_number: string }>;
	clearCurrentInvoice: () => void;
	reset: () => void;
}

export const useInvoiceStore = create<InvoiceState>()(
	immer((set, get) => ({
		invoices: [],
		currentInvoice: null,
		loading: false,
		error: null,
		filters: {},
		totalCount: 0,
		currentPage: 1,

		setFilters: (newFilters) => {
			set((state) => {
				state.filters = { ...state.filters, ...newFilters };
				state.currentPage = 1;
			});
			get().fetchInvoices(1);
		},

		fetchInvoices: async (page = 1) => {
			set({ loading: true, error: null });
			try {
				const { filters } = get();
				const { data, count } = await invoiceService.fetchInvoices(filters, page);
				set((state) => {
					if (page === 1) {
						state.invoices = data;
					} else {
						const newIds = new Set(data.map((i) => i.id));
						state.invoices = [
							...state.invoices.filter((i) => !newIds.has(i.id)),
							...data,
						];
					}
					state.totalCount = count;
					state.currentPage = page;
					state.loading = false;
				});
			} catch (error: unknown) {
				set({ error: (error as Error).message, loading: false });
			}
		},

		fetchInvoiceById: async (id) => {
			set({ loading: true, error: null });
			try {
				const invoice = await invoiceService.fetchInvoiceDetail(id);
				set((state) => {
					state.currentInvoice = invoice;
					state.loading = false;
				});
			} catch (error: unknown) {
				set({ error: (error as Error).message, loading: false });
			}
		},

		createInvoice: async (input) => {
			set({ loading: true, error: null });
			try {
				const result = await invoiceService.createInvoice(input);
				set((state) => {
					state.invoices.unshift(result);
					state.totalCount += 1;
					state.loading = false;
				});

				// Notify other stores via event bus (replaces brittle require())
				eventBus.emit({
					type: 'INVOICE_CREATED',
					invoiceId: result.id,
					customerId: input.customer_id,
				});

				return result;
			} catch (error: unknown) {
				set({ error: (error as Error).message, loading: false });
				throw error;
			}
		},

		clearCurrentInvoice: () => {
			set({ currentInvoice: null });
		},
		reset: () => {
			set((s) => {
				s.invoices = [];
				s.currentInvoice = null;
				s.totalCount = 0;
				s.currentPage = 1;
				s.filters = {};
				s.error = null;
				s.loading = false;
			});
		},
	})),
);

// Refresh invoice list when a payment is recorded against an invoice
eventBus.subscribe((event) => {
	if (event.type === 'PAYMENT_RECORDED' && event.invoiceId) {
		useInvoiceStore.getState().fetchInvoices(1);

		// If we are currently viewing the invoice that was paid, refresh it
		const current = useInvoiceStore.getState().currentInvoice;
		if (current && current.id === event.invoiceId) {
			useInvoiceStore.getState().fetchInvoiceById(event.invoiceId);
		}
	}
});
