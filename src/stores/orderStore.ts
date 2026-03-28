import { create } from 'zustand';
import { orderService } from '../services/orderService';
import { pdfService } from '../services/pdfService';
import { eventBus } from '../events/appEvents';
import type { ParsedOrderItem } from '../services/pdfService';
import type { UUID } from '@/src/types/common';
import type { Order } from '../types/order';
export type { Order };

interface OrderState {
	orders: Order[];
	loading: boolean;
	error: string | null;

	// Import flow state
	parsedData: ParsedOrderItem[] | null;
	rawResponse: unknown | null;
	isParsing: boolean;

	fetchOrders: () => Promise<void>;
	parseDocument: (base64: string, mimeType: string, aiKey?: string) => Promise<void>;
	importParsedData: (partyName: string, items: ParsedOrderItem[]) => Promise<void>;
	clearParsedData: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
	orders: [],
	loading: false,
	error: null,

	parsedData: null,
	rawResponse: null,
	isParsing: false,

	fetchOrders: async () => {
		set({ loading: true, error: null });
		try {
			const data = await orderService.fetchOrders();
			set({ orders: data, loading: false });
		} catch (error: unknown) {
			set({ error: (error as Error).message, loading: false });
		}
	},

	parseDocument: async (base64: string, mimeType: string, aiKey?: string) => {
		set({ isParsing: true, error: null });
		try {
			const parsedItems = await pdfService.parseDocumentWithLLM(base64, mimeType, aiKey);
			set({
				parsedData: parsedItems,
				rawResponse: parsedItems,
				isParsing: false,
			});
		} catch (error: unknown) {
			set({ error: (error as Error).message, isParsing: false });
			throw error;
		}
	},

	importParsedData: async (partyName: string, items: ParsedOrderItem[]) => {
		set({ loading: true, error: null });
		try {
			await orderService.importOrder(partyName, items, get().rawResponse);
			const orders = await orderService.fetchOrders();
			set({ orders, parsedData: null, rawResponse: null, loading: false });
			// Notify inventory store that stock levels may have changed
			eventBus.emit({ type: 'STOCK_CHANGED', itemId: '' });
		} catch (error: unknown) {
			set({ error: (error as Error).message, loading: false });
			throw error;
		}
	},

	clearParsedData: () => {
		set({ parsedData: null, rawResponse: null });
	},
}));
