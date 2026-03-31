import { makeBuilder } from './helpers';
import { supabase } from '../../config/supabase';

jest.mock('../../config/supabase', () => ({
	supabase: {
		from: jest.fn(),
		rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
	},
}));

// Import AFTER the mock is set up
import { createRepository } from '../baseRepository';

const mockFrom = supabase.from as jest.Mock;

beforeEach(() => {
	jest.clearAllMocks();
});

describe('createRepository — findById', () => {
	const repo = createRepository<any>('test_table');

	it('calls .from(table).select(*).eq(id, value).single()', async () => {
		const item = { id: 'test-id', name: 'Item' };
		const builder = makeBuilder({}, { data: item, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await repo.findById('test-id');

		expect(mockFrom).toHaveBeenCalledWith('test_table');
		expect(builder.select).toHaveBeenCalledWith('*');
		expect(builder.eq).toHaveBeenCalledWith('id', 'test-id');
		expect(builder.single).toHaveBeenCalled();
		expect(result).toEqual(item);
	});

	it('throws AppError when supabase returns an error', async () => {
		const builder = makeBuilder({}, { data: null, error: { message: 'Not found', code: 'PGRST116' } });
		mockFrom.mockReturnValue(builder);

		await expect(repo.findById('bad-id')).rejects.toMatchObject({ message: 'Not found' });
	});
});

describe('createRepository — create', () => {
	const repo = createRepository<any>('test_table');

	it('calls .from(table).insert(payload).select().single()', async () => {
		const payload = { name: 'New Item' };
		const created = { id: 'new-id', ...payload };
		const builder = makeBuilder({}, { data: created, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await repo.create(payload);

		expect(builder.insert).toHaveBeenCalledWith(payload);
		expect(builder.select).toHaveBeenCalled();
		expect(builder.single).toHaveBeenCalled();
		expect(result).toEqual(created);
	});
});

describe('createRepository — update', () => {
	const repo = createRepository<any>('test_table');

	it('calls .from(table).update(payload).eq(id, value).select().single()', async () => {
		const updated = { id: 'upd-id', name: 'Updated' };
		const builder = makeBuilder({}, { data: updated, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await repo.update('upd-id', { name: 'Updated' });

		expect(builder.update).toHaveBeenCalledWith({ name: 'Updated' });
		expect(builder.eq).toHaveBeenCalledWith('id', 'upd-id');
		expect(builder.single).toHaveBeenCalled();
		expect(result).toEqual(updated);
	});
});

describe('createRepository — remove', () => {
	const repo = createRepository<any>('test_table');

	it('calls .from(table).delete().eq(id, value) and resolves void', async () => {
		const builder = makeBuilder({ data: null, error: null });
		// Override then to resolve without data (delete returns no data)
		builder.then = jest.fn((resolve: any) => Promise.resolve({ data: null, error: null }).then(resolve));
		mockFrom.mockReturnValue(builder);

		await expect(repo.remove('del-id')).resolves.toBeUndefined();
		expect(builder.delete).toHaveBeenCalled();
		expect(builder.eq).toHaveBeenCalledWith('id', 'del-id');
	});

	it('throws when deletion fails', async () => {
		const builder = makeBuilder({ data: null, error: { message: 'delete failed', code: 'DB_ERROR' } });
		mockFrom.mockReturnValue(builder);

		await expect(repo.remove('del-id')).rejects.toMatchObject({ message: 'delete failed' });
	});
});

describe('createRepository — findMany with pagination', () => {
	const repo = createRepository<any>('test_table');

	it('applies pagination range: page 2, pageSize 10 → range(10, 19)', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		await repo.findMany({ pagination: { page: 2, pageSize: 10 } });

		expect(builder.range).toHaveBeenCalledWith(10, 19);
	});

	it('applies sort options via .order()', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		await repo.findMany({ sort: { column: 'name', ascending: true } });

		expect(builder.order).toHaveBeenCalledWith('name', { ascending: true });
	});

	it('applies search via .or() with ILIKE patterns', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		await repo.findMany({ search: { columns: ['name', 'phone'], term: 'Raj' } });

		expect(builder.or).toHaveBeenCalledWith(expect.stringContaining('%Raj%'));
	});

	it('escapes ILIKE wildcards in search term (% → \\%)', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		await repo.findMany({ search: { columns: ['name'], term: '50%' } });

		const orArg = (builder.or as jest.Mock).mock.calls[0][0] as string;
		expect(orArg).toContain('\\%');
		expect(orArg).not.toContain('%50%'); // raw % not unescaped
	});

	it('applies eq filter for scalar values', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		await repo.findMany({ filters: { status: 'active' } });

		expect(builder.eq).toHaveBeenCalledWith('status', 'active');
	});

	it('applies gte + lte for range filter objects', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		await repo.findMany({ filters: { created_at: { gte: '2026-01-01', lte: '2026-03-31' } } });

		expect(builder.gte).toHaveBeenCalledWith('created_at', '2026-01-01');
		expect(builder.lte).toHaveBeenCalledWith('created_at', '2026-03-31');
	});

	it('returns { data, total } from the query result', async () => {
		const items = [{ id: '1' }, { id: '2' }];
		const builder = makeBuilder({ data: items, count: 2, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await repo.findMany({});

		expect(result.data).toEqual(items);
		expect(result.total).toBe(2);
	});

	it('throws when supabase returns an error', async () => {
		const builder = makeBuilder({ data: null, count: null, error: { message: 'DB error', code: 'XX000' } });
		mockFrom.mockReturnValue(builder);

		await expect(repo.findMany({})).rejects.toMatchObject({ message: 'DB error' });
	});
});
