import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
	buildInventoryConflictSnapshot,
	buildKeepMineResolutionUpdates,
	isInventoryVersionConflict,
} from '../features/inventory/inventoryConflictOrchestrator';
import { inventoryService } from '../services/inventoryService';
import { eventBus } from '../events/appEvents';
import { getErrorMessage } from '../errors/AppError';
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
	pendingResetFetch: boolean;

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

function areInventoryFiltersEqual(a: InventoryFilters, b: InventoryFilters): boolean {
	return (
		a.search === b.search &&
		a.category === b.category &&
		a.lowStockOnly === b.lowStockOnly &&
		a.sortBy === b.sortBy &&
		a.sortDir === b.sortDir
	);
}

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
			pendingResetFetch: false,
			conflict: null,

			setFilters: (newFilters) => {
				const nextFilters = { ...get().filters, ...newFilters };
				if (areInventoryFiltersEqual(get().filters, nextFilters)) {
					return;
				}

				set((state) => {
					state.filters = nextFilters;
				});
				void get().fetchItems(true);
			},

			fetchItems: async (reset = false) => {
				const state = get();
				if (state.loading) {
					if (reset) {
						set((s) => {
							s.pendingResetFetch = true;
						});
					}
					return;
				}
				if (!reset && !state.hasMore) return;

				let restartWithLatestReset = false;

				do {
					restartWithLatestReset = false;
					const requestState = get();
					const requestFilters = { ...requestState.filters };
					const pageToFetch = reset ? 1 : requestState.page + 1;

					set((s) => {
						s.loading = true;
						s.error = null;
						if (reset) s.page = 1;
					});

					try {
						const { data, count } = await withRetry(() =>
							inventoryService.fetchItems(requestFilters, pageToFetch, PAGE_SIZE),
						);

						const shouldRestartWithLatestFilters =
							reset &&
							(get().pendingResetFetch ||
								!areInventoryFiltersEqual(get().filters, requestFilters));

						if (shouldRestartWithLatestFilters) {
							set((s) => {
								s.pendingResetFetch = false;
							});
							restartWithLatestReset = true;
							continue;
						}

						set((s) => {
							if (reset) {
								s.items = data;
							} else {
								const existingIds = new Set(
									s.items.map((i: InventoryItem) => i.id),
								);
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

						if (!reset && get().pendingResetFetch) {
							set((s) => {
								s.pendingResetFetch = false;
							});
							void get().fetchItems(true);
						}
					} catch (err: unknown) {
						if (reset && get().pendingResetFetch) {
							set((s) => {
								s.pendingResetFetch = false;
							});
							restartWithLatestReset = true;
							continue;
						}

						set((s) => {
							s.error = getErrorMessage(err);
							s.loading = false;
						});
					}
				} while (restartWithLatestReset);
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
						s.error = getErrorMessage(err);
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
					if (isInventoryVersionConflict(err) && localItem) {
						const conflict = await buildInventoryConflictSnapshot(id, localItem);
						set((s) => {
							s.conflict = conflict;
							s.loading = false;
						});
						throw err;
					}
					set((s) => {
						s.error = getErrorMessage(err);
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
					try {
						const updates = buildKeepMineResolutionUpdates(localItem);
						await get().updateItem(localItem.id, updates, false);
						set((s) => {
							s.conflict = null;
						});
					} catch (err: unknown) {
						set((s) => {
							s.error = getErrorMessage(err);
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
						s.error = getErrorMessage(err);
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
						s.error = getErrorMessage(err);
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
					s.pendingResetFetch = false;
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
