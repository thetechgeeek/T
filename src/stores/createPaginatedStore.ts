import { create } from 'zustand';
import { getErrorMessage } from '../errors/AppError';

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

	return create<PaginatedState<T, F>>()((set, get) => ({
		items: [],
		totalCount: 0,
		loading: false,
		error: null,
		filters: defaultFilters,
		page: 1,
		hasMore: true,
		initialized: false,

		setFilters: (newFilters) => {
			set((state) => ({
				filters: { ...state.filters, ...newFilters },
				page: 1,
				hasMore: true,
				initialized: false,
			}));
			void get().fetch(true);
		},

		fetch: async (reset = false) => {
			const state = get();
			if (state.loading) return;
			if (!reset && !state.hasMore) return;

			const pageToFetch = reset ? 1 : state.page + 1;

			set({
				loading: true,
				error: null,
				...(reset ? { page: 1, items: [] } : {}),
			});

			try {
				const { data, count } = await fetchFn(state.filters, pageToFetch, pageSize);

				set((current) => {
					const nextItems = reset
						? data
						: [
								...current.items,
								...data.filter(
									(item) =>
										!current.items.some((existing) => existing.id === item.id),
								),
							];

					return {
						items: nextItems,
						totalCount: count,
						page: pageToFetch,
						hasMore: nextItems.length < count,
						loading: false,
						initialized: true,
					};
				});
			} catch (err: unknown) {
				set({
					error: getErrorMessage(err),
					loading: false,
				});
			}
		},

		reset: () => {
			set({
				items: [],
				totalCount: 0,
				page: 1,
				hasMore: true,
				filters: defaultFilters,
				error: null,
				initialized: false,
			});
		},
	}));
}
