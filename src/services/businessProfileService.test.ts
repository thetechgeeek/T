import { businessProfileService } from './businessProfileService';
import { supabase } from '../config/supabase';

jest.mock('../config/supabase', () => ({
	supabase: {
		from: jest.fn(),
	},
}));

const mockTable = {
	upsert: jest.fn(),
	select: jest.fn().mockReturnThis(),
	single: jest.fn(),
};

beforeEach(() => {
	jest.clearAllMocks();
	(supabase.from as jest.Mock).mockReturnValue(mockTable);
});

describe('businessProfileService', () => {
	describe('upsert', () => {
		it('calls supabase with the correct table and data', async () => {
			mockTable.upsert.mockResolvedValue({ error: null });

			await businessProfileService.upsert({ business_name: 'Acme Tiles' });

			expect(supabase.from).toHaveBeenCalledWith('business_profile');
			expect(mockTable.upsert).toHaveBeenCalledWith({ business_name: 'Acme Tiles' });
		});

		it('throws when supabase returns an error', async () => {
			mockTable.upsert.mockResolvedValue({ error: { message: 'DB error' } });

			await expect(
				businessProfileService.upsert({ business_name: 'Acme Tiles' }),
			).rejects.toThrow('DB error');
		});
	});

	describe('fetch', () => {
		it('returns business profile data on success', async () => {
			const mockData = { business_name: 'Acme Tiles', gstin: '27AAAAA0000A1Z5' };
			mockTable.single.mockResolvedValue({ data: mockData, error: null });

			const result = await businessProfileService.fetch();

			expect(supabase.from).toHaveBeenCalledWith('business_profile');
			expect(result).toEqual(mockData);
		});

		it('returns null without throwing when no row exists (PGRST116)', async () => {
			mockTable.single.mockResolvedValue({
				data: null,
				error: { code: 'PGRST116', message: 'No rows' },
			});

			const result = await businessProfileService.fetch();

			expect(result).toBeNull();
		});

		it('throws for non-PGRST116 errors', async () => {
			mockTable.single.mockResolvedValue({
				data: null,
				error: { code: 'PGRST205', message: 'Table not found' },
			});

			await expect(businessProfileService.fetch()).rejects.toThrow('Table not found');
		});
	});
});
