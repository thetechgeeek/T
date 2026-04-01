import { pdfService } from './pdfService';
import { getDocumentAsync } from 'expo-document-picker';
import type { Invoice } from '../types/invoice';

jest.mock('./businessProfileService', () => ({
	businessProfileService: {
		fetch: jest.fn(),
	},
}));

jest.mock('expo-print', () => ({
	printToFileAsync: jest.fn().mockResolvedValue({ uri: '/tmp/invoice.pdf' }),
}));

jest.mock('expo-sharing', () => ({
	isAvailableAsync: jest.fn().mockResolvedValue(true),
	shareAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-document-picker', () => ({
	getDocumentAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
	readAsStringAsync: jest.fn().mockResolvedValue('base64string=='),
	EncodingType: { Base64: 'base64' },
}));

jest.mock('../config/supabase', () => ({
	supabase: {
		auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
		storage: {
			from: jest.fn().mockReturnValue({
				upload: jest.fn().mockResolvedValue({ error: null }),
			}),
		},
		functions: {
			invoke: jest.fn(),
		},
	},
}));

const minimalInvoice: Partial<Invoice> = {
	invoice_number: 'TM/2026-27/0001',
	invoice_date: '2026-03-29',
	customer_name: 'Rajesh Kumar',
	is_inter_state: false,
	subtotal: 1000,
	discount_total: 0,
	cgst_total: 90,
	sgst_total: 90,
	igst_total: 0,
	grand_total: 1180,
	amount_paid: 1180,
	payment_mode: 'upi',
	line_items: [
		{
			design_name: 'Glossy White 600x600',
			hsn_code: '6908',
			quantity: 10,
			rate_per_unit: 100,
			discount: 0,
			taxable_amount: 1000,
			cgst_amount: 90,
			sgst_amount: 90,
			igst_amount: 0,
			line_total: 1180,
			gst_rate: 18,
		} as unknown as Invoice['line_items'] extends (infer T)[] ? T : never, // Cast is fine here for partially defined mock
	],
};

describe('pdfService', () => {
	describe('generateInvoiceHTML', () => {
		it('generates valid HTML containing invoice number', () => {
			const html = pdfService.generateInvoiceHTML(minimalInvoice as Invoice, null);

			expect(html).toContain('TM/2026-27/0001');
			expect(html).toContain('TAX INVOICE');
			expect(html).toContain('Rajesh Kumar');
		});

		it('uses IGST columns for inter-state invoices', () => {
			const interState = { ...minimalInvoice, is_inter_state: true } as Invoice;
			const html = pdfService.generateInvoiceHTML(interState, null);

			expect(html).toContain('IGST');
			expect(html).not.toContain('CGST');
		});

		it('includes business profile details when provided', () => {
			const bp = {
				id: '1',
				business_name: 'Acme Tiles',
				gstin: '27AAAAA0000A1Z5',
				phone: '9876543210',
				address: '123 Market St',
				email: 'acme@tiles.com',
				city: 'Mumbai',
				state: 'Maharashtra',
				invoice_prefix: 'TM',
				invoice_sequence: 1,
				terms_and_conditions: 'No returns.',
				created_at: '',
				updated_at: '',
			};
			const html = pdfService.generateInvoiceHTML(minimalInvoice as Invoice, bp);

			expect(html).toContain('Acme Tiles');
			expect(html).toContain('27AAAAA0000A1Z5');
		});
	});

	describe('pickPdfDocument', () => {
		it('returns null when user cancels', async () => {
			(getDocumentAsync as jest.Mock).mockResolvedValue({ canceled: true });

			const result = await pdfService.pickPdfDocument();

			expect(result).toBeNull();
		});

		it('returns document metadata when file is selected', async () => {
			(getDocumentAsync as jest.Mock).mockResolvedValue({
				canceled: false,
				assets: [
					{
						uri: 'file://doc.pdf',
						name: 'doc.pdf',
						size: 1024,
						mimeType: 'application/pdf',
					},
				],
			});

			const result = await pdfService.pickPdfDocument();

			expect(result).toEqual({
				uri: 'file://doc.pdf',
				name: 'doc.pdf',
				size: 1024,
				mimeType: 'application/pdf',
			});
		});
	});
});
