import { createRepository } from '../baseRepository';
import { supabase } from '../../config/supabase';
import { makeBuilder } from './helpers';
import { AppError, ConflictError, ValidationError, NotFoundError } from '../../errors/AppError';

jest.mock('../../config/supabase', () => ({
	supabase: {
		from: jest.fn(),
		rpc: jest.fn(),
	},
}));

const mockFrom = supabase.from as jest.Mock;

describe('Repository Error Propagation', () => {
	const repo = createRepository<{ id: string; name: string }>('test_table');

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('maps 23505 (Unique Violation) to ConflictError', async () => {
		const builder = makeBuilder(undefined, {
			data: null,
			error: { message: 'Already exists', code: '23505' },
		});
		mockFrom.mockReturnValue(builder);

		await expect(repo.findById('any')).rejects.toBeInstanceOf(ConflictError);
	});

	it('maps 23502 (Not Null Violation) to ValidationError', async () => {
		const builder = makeBuilder(undefined, {
			data: null,
			error: { message: 'Missing field', code: '23502', column: 'name' } as any,
		});
		mockFrom.mockReturnValue(builder);

		try {
			await repo.create({ id: '1' });
			throw new Error('Should have thrown');
		} catch (err: any) {
			expect(err).toBeInstanceOf(ValidationError);
			expect(err.fieldErrors).toHaveProperty('name');
		}
	});

	it('maps PGRST116 (Not Found) to NotFoundError', async () => {
		const builder = makeBuilder(undefined, {
			data: null,
			error: { message: 'No rows', code: 'PGRST116' },
		});
		mockFrom.mockReturnValue(builder);

		await expect(repo.findById('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	it('maps P0001 with "insufficient stock" to AppError with code INSUFFICIENT_STOCK', async () => {
		const builder = makeBuilder(undefined, {
			data: null,
			error: { message: 'Insufficient stock available', code: 'P0001' },
		});
		mockFrom.mockReturnValue(builder);

		try {
			await repo.update('item-1', { name: 'X' });
			throw new Error('Should have thrown');
		} catch (err: any) {
			expect(err).toBeInstanceOf(AppError);
			expect(err.code).toBe('INSUFFICIENT_STOCK');
		}
	});

	it('maps schema errors (PGRST204) to AppError with original cause', async () => {
		const dbError = { message: 'Column missing', code: 'PGRST204' };
		const builder = makeBuilder({
			data: null,
			error: dbError,
		});
		mockFrom.mockReturnValue(builder);

		try {
			await repo.findMany({});
			throw new Error('Should have thrown');
		} catch (err: any) {
			expect(err).toBeInstanceOf(AppError);
			expect(err.code).toBe('PGRST204');
			expect(err.cause).toEqual(dbError);
		}
	});

	it('rpc methods also propagate errors through toAppError', async () => {
		(supabase.rpc as jest.Mock).mockResolvedValue({
			data: null,
			error: { message: 'RPC failed', code: 'XYZ' },
		});

		await expect(repo.rpc('some_fn', {})).rejects.toMatchObject({
			message: 'RPC failed',
			code: 'XYZ', // Now preserved after my AppError.ts fix
		});
	});
});
