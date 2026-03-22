import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { invoiceService } from '../services/invoiceService';
import type { Invoice, InvoiceInput, InvoiceFilters } from '../types/invoice';

interface InvoiceState {
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
  fetchInvoiceById: (id: string) => Promise<void>;
  createInvoice: (input: InvoiceInput) => Promise<Invoice>;
  clearCurrentInvoice: () => void;
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
            // Append
            const newIds = new Set(data.map(i => i.id));
            state.invoices = [...state.invoices.filter(i => !newIds.has(i.id)), ...data];
          }
          state.totalCount = count;
          state.currentPage = page;
          state.loading = false;
        });
      } catch (error: any) {
        set({ error: error.message, loading: false });
      }
    },

    fetchInvoiceById: async (id) => {
      set({ loading: true, error: null });
      try {
        const invoice = await invoiceService.fetchInvoiceById(id);
        set((state) => {
          state.currentInvoice = invoice;
          state.loading = false;
        });
      } catch (error: any) {
        set({ error: error.message, loading: false });
      }
    },

    createInvoice: async (input) => {
      set({ loading: true, error: null });
      try {
        const newInvoice = await invoiceService.createInvoice(input);
        set((state) => {
          state.invoices.unshift(newInvoice);
          state.totalCount += 1;
          state.loading = false;
        });
        return newInvoice;
      } catch (error: any) {
        set({ error: error.message, loading: false });
        throw error;
      }
    },

    clearCurrentInvoice: () => {
      set({ currentInvoice: null });
    }
  }))
);
