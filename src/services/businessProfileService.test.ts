import { businessProfileService } from './businessProfileService';
import { supabase } from '../config/supabase';

import { createSupabaseMock } from '../../__tests__/utils/supabaseMock';

jest.mock('../config/supabase', () => {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const { createSupabaseMock } = require('../../__tests__/utils/supabaseMock');
	return {
		supabase: createSupabaseMock(),
	};
});

const mockSupabase = supabase as unknown as ReturnType<typeof createSupabaseMock>;

beforeEach(() => {
	jest.clearAllMocks();
});

describe('businessProfileService', () => {
	describe('upsert', () => {
		it('calls supabase with the correct table and data', async () => {
			mockSupabase.from('business_profile').upsert.mockResolvedValue({ error: null });

			await businessProfileService.upsert({ business_name: 'Acme Tiles' });

			expect(supabase.from).toHaveBeenCalledWith('business_profile');
			expect(mockSupabase.from('business_profile').upsert).toHaveBeenCalledWith({
				business_name: 'Acme Tiles',
			});
		});

		it('throws when supabase returns an error', async () => {
			mockSupabase
				.from('business_profile')
				.upsert.mockResolvedValue({ error: { message: 'DB error' } });

			await expect(
				businessProfileService.upsert({ business_name: 'Acme Tiles' }),
			).rejects.toThrow('DB error');
		});
	});

	describe('fetch', () => {
		it('returns business profile data on success', async () => {
			const mockData = { business_name: 'Acme Tiles', gstin: '27AAAAA0000A1Z5' };
			mockSupabase.from('business_profile').maybeSingle.mockResolvedValue({
				data: mockData,
				error: null,
			});

			const result = await businessProfileService.fetch();

			expect(supabase.from).toHaveBeenCalledWith('business_profile');
			expect(result).toEqual(mockData);
		});

		it('returns null without throwing when no row exists (PGRST116)', async () => {
			mockSupabase.from('business_profile').maybeSingle.mockResolvedValue({
				data: null,
				error: { code: 'PGRST116', message: 'No rows' },
			});

			const result = await businessProfileService.fetch();

			expect(result).toBeNull();
		});

		it('throws for non-PGRST116 errors', async () => {
			mockSupabase.from('business_profile').maybeSingle.mockResolvedValue({
				data: null,
				error: { code: 'PGRST205', message: 'Table not found' },
			});

			await expect(businessProfileService.fetch()).rejects.toThrow('Table not found');
		});
	});
});
