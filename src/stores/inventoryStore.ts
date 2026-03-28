import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { inventoryService } from '../services/inventoryService';
import { eventBus } from '../events/appEvents';
import type {
	InventoryItem,
	InventoryItemInsert,
	InventoryFilters,
	StockOpType,
} from '../types/inventory';
import type { UUID } from '../types/common';

interface InventoryState {
	items: InventoryItem[];
	totalCount: number;
	loading: boolean;
	error: string | null;
	filters: InventoryFilters;
	page: number;
	hasMore: boolean;

	// Actions
	setFilters: (filters: Partial<InventoryFilters>) => void;
	fetchItems: (reset?: boolean) => Promise<void>;
	createItem: (item: InventoryItemInsert) => Promise<InventoryItem>;
	updateItem: (id: UUID, updates: Partial<InventoryItemInsert>) => Promise<InventoryItem>;
	performStockOperation: (
		itemId: UUID,
		type: StockOpType,
		qty: number,
		reason?: string,
	) => Promise<void>;
	reset: () => void;
}

const DEFAULT_FILTERS: InventoryFilters = {
	search: '',
	category: 'ALL',
	lowStockOnly: false,
	sortBy: 'created_at',
	sortDir: 'desc',
};

const PAGE_SIZE = 20;

export const useInventoryStore = create<InventoryState>()(
	immer((set, get) => ({
		items: [],
		totalCount: 0,
		loading: false,
		error: null,
		filters: DEFAULT_FILTERS,
		page: 1,
		hasMore: true,

		setFilters: (newFilters) => {
			set((state) => {
				state.filters = { ...state.filters, ...newFilters };
			});
			get().fetchItems(true);
		},

		fetchItems: async (reset = false) => {
			const state = get();
			if (state.loading) return;
			if (!reset && !state.hasMore) return;

			const pageToFetch = reset ? 1 : state.page + 1;

			set((s) => {
				s.loading = true;
				s.error = null;
				if (reset) s.page = 1;
			});

			try {
				const { data, count } = await inventoryService.fetchItems(
					state.filters,
					pageToFetch,
					PAGE_SIZE,
				);

				set((s) => {
					if (reset) {
						s.items = data;
					} else {
						const existingIds = new Set(s.items.map((i) => i.id));
						const newItems = data.filter((i) => !existingIds.has(i.id));
						s.items.push(...newItems);
					}
					s.totalCount = count;
					s.page = pageToFetch;
					s.hasMore = s.items.length < count;
					s.loading = false;
				});
			} catch (err: unknown) {
				set((s) => {
					s.error = (err as Error).message;
					s.loading = false;
				});
			}
		},

		createItem: async (itemPayload) => {
			set((s) => {
				s.loading = true;
				s.error = null;
			});
			try {
				const newItem = await inventoryService.createItem(itemPayload);
				set((s) => {
					s.items.unshift(newItem);
					s.totalCount += 1;
					s.loading = false;
				});
				eventBus.emit({ type: 'STOCK_CHANGED', itemId: newItem.id });
				return newItem;
			} catch (err: unknown) {
				set((s) => {
					s.error = (err as Error).message;
					s.loading = false;
				});
				throw err;
			}
		},

		updateItem: async (id, updates) => {
			set((s) => {
				s.loading = true;
				s.error = null;
			});
			try {
				const updated = await inventoryService.updateItem(id, updates);
				set((s) => {
					const idx = s.items.findIndex((i) => i.id === id);
					if (idx !== -1) {
						s.items[idx] = updated;
					}
					s.loading = false;
				});
				return updated;
			} catch (err: unknown) {
				set((s) => {
					s.error = (err as Error).message;
					s.loading = false;
				});
				throw err;
			}
		},

		performStockOperation: async (itemId, type, qty, reason) => {
			set((s) => {
				s.loading = true;
				s.error = null;
			});
			try {
				await inventoryService.performStockOperation(itemId, type, qty, reason);
				// Re-fetch the single item to reflect the new stock level
				const refreshedItem = await inventoryService.fetchItemById(itemId);
				set((s) => {
					const idx = s.items.findIndex((i) => i.id === itemId);
					if (idx !== -1) {
						s.items[idx] = refreshedItem;
					}
					s.loading = false;
				});
				eventBus.emit({ type: 'STOCK_CHANGED', itemId });
			} catch (err: unknown) {
				set((s) => {
					s.error = (err as Error).message;
					s.loading = false;
				});
				throw err;
			}
		},

		reset: () => {
			set((s) => {
				s.items = [];
				s.totalCount = 0;
				s.page = 1;
				s.hasMore = true;
				s.filters = DEFAULT_FILTERS;
				s.error = null;
			});
		},
	})),
);

// Refresh inventory when stock changes externally (e.g., invoice line items sold)
eventBus.subscribe((event) => {
	if (event.type === 'STOCK_CHANGED') {
		useInventoryStore.getState().fetchItems(true);
	}
});
