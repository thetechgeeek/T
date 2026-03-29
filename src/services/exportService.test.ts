import { exportService } from './exportService';
import { supabase } from '../config/supabase';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

jest.mock('../config/supabase', () => ({
	supabase: {
		from: jest.fn(),
	},
}));

jest.mock('expo-file-system', () => ({
	cacheDirectory: '/cache/',
	EncodingType: { UTF8: 'utf8' },
	writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-sharing', () => ({
	isAvailableAsync: jest.fn().mockResolvedValue(true),
	shareAsync: jest.fn().mockResolvedValue(undefined),
}));

const makeMockQuery = (data: unknown[] = []) => ({
	select: jest.fn().mockReturnThis(),
	gte: jest.fn().mockReturnThis(),
	lte: jest.fn().mockReturnThis(),
	order: jest.fn().mockResolvedValue({ data, error: null }),
});

describe('exportService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('exportGSTR1', () => {
		it('writes a CSV file and calls share when data is empty', async () => {
			const mockQuery = makeMockQuery([]);
			(supabase.from as jest.Mock).mockReturnValue(mockQuery);

			await exportService.exportGSTR1('2026-04-01', '2026-06-30');

			expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
				'/cache/GSTR1_2026-04-01_2026-06-30.csv',
				expect.any(String),
				{ encoding: 'utf8' },
			);
			expect(Sharing.shareAsync).toHaveBeenCalled();
		});

		it('separates B2B (with GSTIN) from B2C invoices', async () => {
			const b2bInvoice = {
				id: '1',
				invoice_number: 'TM/001',
				invoice_date: '2026-04-10',
				customer_name: 'Dealer Co',
				customer_gstin: '27AAAAA0000A1Z5',
				grand_total: 11800,
				place_of_supply: 'Maharashtra',
				is_inter_state: true,
				reverse_charge: false,
				line_items: [{ gst_rate: 18, taxable_amount: 10000 }],
			};
			const b2cInvoice = {
				id: '2',
				invoice_number: 'TM/002',
				invoice_date: '2026-04-11',
				customer_name: 'Retail Customer',
				customer_gstin: null,
				grand_total: 5900,
				place_of_supply: 'Maharashtra',
				is_inter_state: false,
				reverse_charge: false,
				line_items: [{ gst_rate: 18, taxable_amount: 5000 }],
			};
			const mockQuery = makeMockQuery([b2bInvoice, b2cInvoice]);
			(supabase.from as jest.Mock).mockReturnValue(mockQuery);

			await exportService.exportGSTR1('2026-04-01', '2026-06-30');

			const csvContent = (FileSystem.writeAsStringAsync as jest.Mock).mock.calls[0][1] as string;
			expect(csvContent).toContain('B2B');
			expect(csvContent).toContain('27AAAAA0000A1Z5');
			expect(csvContent).toContain('B2C Large');
		});

		it('throws when supabase returns an error', async () => {
			(supabase.from as jest.Mock).mockReturnValue({
				select: jest.fn().mockReturnThis(),
				gte: jest.fn().mockReturnThis(),
				lte: jest.fn().mockReturnThis(),
				order: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
			});

			await expect(exportService.exportGSTR1('2026-04-01', '2026-06-30')).rejects.toThrow(
				'DB error',
			);
		});
	});
});
