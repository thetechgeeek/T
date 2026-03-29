import { createPaginatedStore } from '../createPaginatedStore';

interface TestItem {
	id: string;
	name: string;
}

interface TestFilters extends Record<string, unknown> {
	search: string;
}

function makeStore(overrides?: Partial<Parameters<typeof createPaginatedStore>[0]>) {
	const fetchFn = jest.fn().mockResolvedValue({ data: [], count: 0 });
	const store = createPaginatedStore<TestItem, TestFilters>({
		fetchFn,
		defaultFilters: { search: '' },
		pageSize: 10,
		...overrides,
	});
	return { store, fetchFn };
}

describe('createPaginatedStore', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('initialises with correct default state', () => {
		const { store } = makeStore();
		const state = store.getState();

		expect(state.items).toEqual([]);
		expect(state.totalCount).toBe(0);
		expect(state.loading).toBe(false);
		expect(state.error).toBeNull();
		expect(state.page).toBe(1);
		expect(state.hasMore).toBe(true);
		expect(state.initialized).toBe(false);
	});

	it('fetch populates items and updates pagination flags', async () => {
		const items: TestItem[] = [
			{ id: '1', name: 'Alpha' },
			{ id: '2', name: 'Beta' },
		];
		const { store, fetchFn } = makeStore();
		fetchFn.mockResolvedValue({ data: items, count: 2 });

		await store.getState().fetch(true);

		const state = store.getState();
		expect(state.items).toEqual(items);
		expect(state.totalCount).toBe(2);
		expect(state.hasMore).toBe(false);
		expect(state.initialized).toBe(true);
		expect(state.loading).toBe(false);
	});

	it('fetch appends items on subsequent pages without duplicates', async () => {
		const page1: TestItem[] = [{ id: '1', name: 'A' }];
		const page2: TestItem[] = [{ id: '2', name: 'B' }];
		const { store, fetchFn } = makeStore({ pageSize: 1 });

		fetchFn.mockResolvedValueOnce({ data: page1, count: 2 });
		await store.getState().fetch(true);

		fetchFn.mockResolvedValueOnce({ data: page2, count: 2 });
		await store.getState().fetch();

		expect(store.getState().items).toEqual([...page1, ...page2]);
		expect(store.getState().hasMore).toBe(false);
	});

	it('sets error state when fetchFn throws', async () => {
		const { store, fetchFn } = makeStore();
		fetchFn.mockRejectedValue(new Error('Network error'));

		await store.getState().fetch(true);

		const state = store.getState();
		expect(state.error).toBe('Network error');
		expect(state.loading).toBe(false);
	});

	it('setFilters resets page and triggers a fresh fetch', async () => {
		const { store, fetchFn } = makeStore();
		fetchFn.mockResolvedValue({ data: [], count: 0 });

		await store.getState().fetch(true);
		store.getState().setFilters({ search: 'tiles' });

		// setFilters internally calls fetch, so fetchFn should be called twice
		await new Promise((r) => setTimeout(r, 0));

		expect(fetchFn).toHaveBeenCalledTimes(2);
		expect(store.getState().filters.search).toBe('tiles');
		expect(store.getState().page).toBe(1);
	});

	it('reset restores the initial state', async () => {
		const items: TestItem[] = [{ id: '1', name: 'A' }];
		const { store, fetchFn } = makeStore();
		fetchFn.mockResolvedValue({ data: items, count: 1 });

		await store.getState().fetch(true);
		store.getState().reset();

		const state = store.getState();
		expect(state.items).toEqual([]);
		expect(state.page).toBe(1);
		expect(state.initialized).toBe(false);
	});

	it('does not start a second fetch while one is in progress', async () => {
		const { store, fetchFn } = makeStore();
		let resolve!: (v: { data: TestItem[]; count: number }) => void;
		fetchFn.mockReturnValue(new Promise<{ data: TestItem[]; count: number }>((r) => { resolve = r; }));

		store.getState().fetch();
		store.getState().fetch();

		resolve({ data: [], count: 0 });
		await new Promise((r) => setTimeout(r, 0));

		expect(fetchFn).toHaveBeenCalledTimes(1);
	});
});
