import { makeBuilder } from './helpers';
import { supabase } from '../../config/supabase';

jest.mock('../../config/supabase', () => ({
	supabase: {
		from: jest.fn(),
		rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
	},
}));

import { supplierRepository } from '../supplierRepository';

const mockFrom = supabase.from as jest.Mock;

const mockSupplier = {
	id: 's1-uuid-0000-0000-000000000001',
	name: 'Kajaria Tiles Pvt Ltd',
	contact_person: 'Ravi Kumar',
	phone: '9876543210',
	gstin: '27AABCU9603R1ZX',
	address: '12 Industrial Area, Morbi',
	city: 'Morbi',
	payment_terms: '30 days',
	notes: 'Preferred supplier',
	created_at: '2026-01-01T00:00:00Z',
	updated_at: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
	jest.clearAllMocks();
});

describe('supplierRepository.findMany', () => {
	it('queries suppliers table and returns data', async () => {
		const builder = makeBuilder({ data: [mockSupplier], count: 1, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await supplierRepository.findMany();

		expect(mockFrom).toHaveBeenCalledWith('suppliers');
		expect(builder.select).toHaveBeenCalledWith('*', expect.any(Object));
		expect(result.data).toEqual([mockSupplier]);
		expect(result.total).toBe(1);
	});

	it('returns empty array when no suppliers exist', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await supplierRepository.findMany();
		expect(result.data).toEqual([]);
		expect(result.total).toBe(0);
	});

	it('applies search filter via or() when search term provided', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		await supplierRepository.findMany({
			search: { columns: ['name', 'gstin'], term: 'kajaria' },
		});

		expect(builder.or).toHaveBeenCalled();
	});

	it('throws AppError when Supabase returns error', async () => {
		const builder = makeBuilder({
			data: null,
			error: { message: 'Table missing', code: '42P01' },
		});
		mockFrom.mockReturnValue(builder);

		await expect(supplierRepository.findMany()).rejects.toThrow('Table missing');
	});
});

describe('supplierRepository.findById', () => {
	it('returns supplier by id', async () => {
		const builder = makeBuilder({ data: [], error: null }, { data: mockSupplier, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await supplierRepository.findById('s1-uuid-0000-0000-000000000001');

		expect(mockFrom).toHaveBeenCalledWith('suppliers');
		expect(builder.eq).toHaveBeenCalledWith('id', 's1-uuid-0000-0000-000000000001');
		expect(result).toEqual(mockSupplier);
	});

	it('throws AppError when supplier not found', async () => {
		const builder = makeBuilder(
			{ data: [], error: null },
			{ data: null, error: { message: 'No rows', code: 'PGRST116' } },
		);
		mockFrom.mockReturnValue(builder);

		await expect(supplierRepository.findById('non-existent')).rejects.toThrow('found');
	});
});

describe('supplierRepository.create', () => {
	it('inserts a new supplier and returns created row', async () => {
		const builder = makeBuilder({ data: [], error: null }, { data: mockSupplier, error: null });
		mockFrom.mockReturnValue(builder);

		const { id: _id, created_at: _ca, updated_at: _ua, ...input } = mockSupplier;
		const result = await supplierRepository.create(input);

		expect(mockFrom).toHaveBeenCalledWith('suppliers');
		expect(builder.insert).toHaveBeenCalledWith(input);
		expect(result).toEqual(mockSupplier);
	});

	it('throws AppError when insert fails', async () => {
		const builder = makeBuilder(
			{ data: null, error: null },
			{ data: null, error: { message: 'Duplicate GSTIN', code: '23505' } },
		);
		mockFrom.mockReturnValue(builder);

		await expect(supplierRepository.create({ name: 'Test' })).rejects.toThrow(
			'Duplicate GSTIN',
		);
	});
});

describe('supplierRepository.update', () => {
	it('updates supplier and returns updated row', async () => {
		const updatedSupplier = { ...mockSupplier, name: 'Updated Tiles Ltd' };
		const builder = makeBuilder(
			{ data: [], error: null },
			{ data: updatedSupplier, error: null },
		);
		mockFrom.mockReturnValue(builder);

		const result = await supplierRepository.update('s1-uuid-0000-0000-000000000001', {
			name: 'Updated Tiles Ltd',
		});

		expect(builder.update).toHaveBeenCalledWith({ name: 'Updated Tiles Ltd' });
		expect(builder.eq).toHaveBeenCalledWith('id', 's1-uuid-0000-0000-000000000001');
		expect(result.name).toBe('Updated Tiles Ltd');
	});

	it('throws AppError when update fails', async () => {
		const builder = makeBuilder(
			{ data: null, error: null },
			{ data: null, error: { message: 'Row not found', code: 'PGRST116' } },
		);
		mockFrom.mockReturnValue(builder);

		await expect(supplierRepository.update('bad-id', { name: 'X' })).rejects.toThrow('found');
	});
});

describe('supplierRepository.remove', () => {
	it('deletes supplier by id', async () => {
		const builder = makeBuilder({ data: null, error: null });
		mockFrom.mockReturnValue(builder);

		await expect(
			supplierRepository.remove('s1-uuid-0000-0000-000000000001'),
		).resolves.toBeUndefined();

		expect(mockFrom).toHaveBeenCalledWith('suppliers');
		expect(builder.delete).toHaveBeenCalled();
		expect(builder.eq).toHaveBeenCalledWith('id', 's1-uuid-0000-0000-000000000001');
	});

	it('throws AppError when delete has FK constraint violation', async () => {
		const builder = makeBuilder({
			data: null,
			error: { message: 'FK constraint', code: '23503' },
		});
		mockFrom.mockReturnValue(builder);

		await expect(supplierRepository.remove('s1-uuid-0000-0000-000000000001')).rejects.toThrow(
			'FK constraint',
		);
	});
});
