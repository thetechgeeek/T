import { customerService } from './customerService';
import { supabase } from '../config/supabase';

// Mock the Supabase client
jest.mock('../config/supabase', () => ({
	supabase: {
		from: jest.fn(),
		rpc: jest.fn(),
	},
}));

describe('customerService', () => {
	const mockTable = {
		select: jest.fn().mockReturnThis(),
		insert: jest.fn().mockReturnThis(),
		update: jest.fn().mockReturnThis(),
		eq: jest.fn().mockReturnThis(),
		single: jest.fn(),
		select_single: jest.fn(), // for .select().single()
	};

	beforeEach(() => {
		jest.clearAllMocks();
		(supabase.from as jest.Mock).mockReturnValue(mockTable);
	});

	it('createCustomer handles and throws database errors', async () => {
		const mockError = {
			code: 'PGRST205',
			message: "Could not find the table 'public.customers' in the schema cache",
		};

		// Setup the mock to fail
		mockTable.single.mockResolvedValue({ data: null, error: mockError });

		await expect(customerService.createCustomer({ name: 'Test' } as any)).rejects.toEqual(
			mockError,
		);

		expect(supabase.from).toHaveBeenCalledWith('customers');
	});

	it('createCustomer successfully returns created customer', async () => {
		const mockData = { id: '123', name: 'Test' };
		mockTable.single.mockResolvedValue({ data: mockData, error: null });

		const result = await customerService.createCustomer({ name: 'Test' } as any);

		expect(result).toEqual(mockData);
	});
});
