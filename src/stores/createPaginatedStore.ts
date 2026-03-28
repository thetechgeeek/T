import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface PaginatedState<T, F extends Record<string, unknown>> {
	items: T[];
	totalCount: number;
	loading: boolean;
	error: string | null;
	filters: F;
	page: number;
	hasMore: boolean;
	initialized: boolean;

	setFilters: (newFilters: Partial<F>) => void;
	fetch: (reset?: boolean) => Promise<void>;
	reset: () => void;
}

export interface PaginatedStoreConfig<T, F extends Record<string, unknown>> {
	fetchFn: (filters: F, page: number, pageSize: number) => Promise<{ data: T[]; count: number }>;
	defaultFilters: F;
	pageSize?: number;
}

export function createPaginatedStore<T extends { id: string }, F extends Record<string, unknown>>(
	config: PaginatedStoreConfig<T, F>,
) {
	const { fetchFn, defaultFilters, pageSize = 20 } = config;

	return create<PaginatedState<T, F>>()(
		immer((set, get) => ({
			items: [],
			totalCount: 0,
			loading: false,
			error: null,
			filters: defaultFilters,
			page: 1,
			hasMore: true,
			initialized: false,

			setFilters: (newFilters) => {
				set((state) => {
					// Double cast needed: Immer's Draft<F> is incompatible with F for generic params
					(state.filters as unknown as F) = {
						...(state.filters as unknown as F),
						...newFilters,
					} as F;
					state.page = 1;
					state.hasMore = true;
					state.initialized = false;
				});
				get().fetch(true);
			},

			fetch: async (reset = false) => {
				const state = get();
				if (state.loading) return;
				if (!reset && !state.hasMore) return;

				const pageToFetch = reset ? 1 : state.page + 1;

				set((s) => {
					s.loading = true;
					s.error = null;
					if (reset) {
						s.page = 1;
						s.items = [] as unknown as typeof s.items;
					}
				});

				try {
					const { data, count } = await fetchFn(state.filters, pageToFetch, pageSize);

					set((s) => {
						if (reset) {
							s.items = data as unknown as typeof s.items;
						} else {
							const existingIds = new Set(s.items.map((i) => i.id));
							const newItems = data.filter((i) => !existingIds.has(i.id));
							(s.items as T[]).push(...newItems);
						}
						s.totalCount = count;
						s.page = pageToFetch;
						s.hasMore = s.items.length < count;
						s.loading = false;
						s.initialized = true;
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
					s.items = [] as unknown as typeof s.items;
					s.totalCount = 0;
					s.page = 1;
					s.hasMore = true;
					(s.filters as unknown as F) = defaultFilters;
					s.error = null;
					s.initialized = false;
				});
			},
		})),
	);
}
