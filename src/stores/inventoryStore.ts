import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { inventoryService } from '../services/inventoryService';
import { eventBus } from '../events/appEvents';
import { debounce } from '../utils/perf';
import { withRetry } from '../utils/retry';
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

	// Conflict Resolution
	conflict: {
		localItem: InventoryItem;
		serverItem: InventoryItem;
	} | null;

	// Actions
	setFilters: (filters: Partial<InventoryFilters>) => void;
	fetchItems: (reset?: boolean) => Promise<void>;
	createItem: (item: InventoryItemInsert) => Promise<InventoryItem>;
	updateItem: (
		id: UUID,
		updates: Partial<InventoryItemInsert>,
		checkConflict?: boolean,
	) => Promise<InventoryItem>;
	resolveConflict: (resolution: 'keepMine' | 'useServer') => Promise<void>;
	performStockOperation: (
		itemId: UUID,
		type: StockOpType,
		qty: number,
		reason?: string,
	) => Promise<void>;
	deleteItem: (id: UUID) => Promise<void>;
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

// Helper to handle debounced fetches across store instances
const debouncedFetchItems = debounce((get: () => InventoryState) => {
	get().fetchItems(true);
}, 300);

export const useInventoryStore = create<InventoryState>()(
	persist(
		immer((set, get) => ({
			items: [],
			totalCount: 0,
			loading: false,
			error: null,
			filters: DEFAULT_FILTERS,
			page: 1,
			hasMore: true,
			conflict: null,

			setFilters: (newFilters) => {
				set((state) => {
					state.filters = { ...state.filters, ...newFilters };
				});
				// Debounce the fetch to avoid spamming the server on rapid keystrokes
				debouncedFetchItems(get);
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
					const { data, count } = await withRetry(() =>
						inventoryService.fetchItems(state.filters, pageToFetch, PAGE_SIZE),
					);

					set((s) => {
						if (reset) {
							s.items = data;
						} else {
							const existingIds = new Set(s.items.map((i: InventoryItem) => i.id));
							const newItems = data.filter(
								(i: InventoryItem) => !existingIds.has(i.id),
							);
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

			updateItem: async (id, updates, checkConflict = true) => {
				const state = get();
				const localItem = state.items.find((i) => i.id === id);

				set((s) => {
					s.loading = true;
					s.error = null;
				});

				try {
					const updated = await inventoryService.updateItem(
						id,
						updates,
						checkConflict ? localItem?.updated_at : undefined,
					);
					set((s) => {
						const idx = s.items.findIndex((i) => i.id === id);
						if (idx !== -1) {
							s.items[idx] = updated;
						}
						s.loading = false;
					});
					return updated;
				} catch (err: unknown) {
					if (err instanceof Error && err.message === 'VERSION_CONFLICT' && localItem) {
						// Fetch latest server version to show in modal
						const serverItem = await inventoryService.fetchItemById(id);
						set((s) => {
							s.conflict = { localItem, serverItem };
							s.loading = false;
						});
						throw err;
					}
					set((s) => {
						s.error = (err as Error).message;
						s.loading = false;
					});
					throw err;
				}
			},

			resolveConflict: async (resolution) => {
				const { conflict } = get();
				if (!conflict) return;

				const { localItem, serverItem } = conflict;

				if (resolution === 'keepMine') {
					// Force update without conflict check
					// Usually we should re-apply the user's intended changes to the server values,
					// but 'Force overwrite' is simpler for this implementation phase.
					try {
						// Extract only common editable fields or use localItem as is
						const updates: Partial<InventoryItemInsert> = {
							design_name: localItem.design_name,
							selling_price: localItem.selling_price,
							cost_price: localItem.cost_price,
							category: localItem.category,
							gst_rate: localItem.gst_rate,
							hsn_code: localItem.hsn_code,
							notes: localItem.notes,
							size_name: localItem.size_name,
							brand_name: localItem.brand_name,
							pcs_per_box: localItem.pcs_per_box,
							sqft_per_box: localItem.sqft_per_box,
							box_count: localItem.box_count,
							has_batch_tracking: false,
							has_serial_tracking: false,
							low_stock_threshold: localItem.low_stock_threshold,
						};
						await get().updateItem(localItem.id, updates, false);
						set((s) => {
							s.conflict = null;
						});
					} catch (err) {
						set((s) => {
							s.error = (err as Error).message;
						});
					}
				} else {
					// Resolution: useServer — discard local edits, accept server version
					set((s) => {
						const idx = s.items.findIndex((i) => i.id === serverItem.id);
						if (idx !== -1) {
							s.items[idx] = serverItem;
						}
						s.conflict = null;
					});
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

			deleteItem: async (id: string) => {
				set((s) => {
					s.loading = true;
					s.error = null;
				});
				try {
					await inventoryService.deleteItem(id);
					set((s) => {
						const idx = s.items.findIndex((i) => i.id === id);
						if (idx !== -1) {
							s.items.splice(idx, 1);
						}
						s.totalCount -= 1;
						s.loading = false;
					});
					eventBus.emit({ type: 'STOCK_CHANGED', itemId: id });
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
					s.loading = false;
				});
			},
		})),
		{
			name: 'inventory-storage',
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state: InventoryState) => ({
				items: state.items,
				totalCount: state.totalCount,
				filters: state.filters,
				hasMore: state.hasMore,
			}),
		},
	),
);

// Refresh inventory when stock changes externally (e.g., invoice line items sold)
eventBus.subscribe((event) => {
	if (event.type === 'STOCK_CHANGED') {
		useInventoryStore.getState().fetchItems(true);
	}
});
