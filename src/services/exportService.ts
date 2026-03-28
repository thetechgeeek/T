import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { supabase } from '../config/supabase';
import type { Invoice, InvoiceLineItem } from '../types/invoice';

/**
 * GSTR-1 B2B row (inter-state supply to registered dealers).
 * Column names match the GST portal CSV upload template.
 */
interface GSTR1B2BRow {
	'GSTIN of Recipient': string;
	'Receiver Name': string;
	'Invoice Number': string;
	'Invoice date': string;
	'Invoice Value': number;
	'Place Of Supply': string;
	'Reverse Charge': string;
	'Applicable % of Tax Rate': number;
	'Invoice Type':
		| 'Regular'
		| 'SEZ supplies with payment'
		| 'SEZ supplies without payment'
		| 'Deemed Exp';
	'E-Commerce GSTIN': string;
	Rate: number;
	'Taxable Value': number;
	'Cess Amount': number;
}

/**
 * GSTR-1 B2C row (intra-state supply to unregistered dealers/consumers).
 */
interface GSTR1B2CRow {
	Type: 'OE';
	'Place Of Supply': string;
	'Applicable % of Tax Rate': number;
	Rate: number;
	'Taxable Value': number;
	'Cess Amount': number;
	'E-Commerce GSTIN': string;
}

function escapeCSV(value: string | number): string {
	const str = String(value);
	if (str.includes(',') || str.includes('"') || str.includes('\n')) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

function toCSV(headers: string[], rows: Record<string, string | number>[]): string {
	const lines = [
		headers.map(escapeCSV).join(','),
		...rows.map((row) => headers.map((h) => escapeCSV(row[h] ?? '')).join(',')),
	];
	return lines.join('\n');
}

export const exportService = {
	/**
	 * Fetch invoices for a given financial year period and export as GSTR-1 CSV.
	 * Separates B2B (registered) from B2C (unregistered/consumer) supplies.
	 */
	async exportGSTR1(startDate: string, endDate: string): Promise<void> {
		const { data, error } = await supabase
			.from('invoices')
			.select('*, line_items:invoice_line_items(*)')
			.gte('invoice_date', startDate)
			.lte('invoice_date', endDate)
			.order('invoice_date');

		if (error) throw new Error(error.message);

		const invoices = (data ?? []) as (Invoice & { line_items: InvoiceLineItem[] })[];

		const b2bRows: GSTR1B2BRow[] = [];
		const b2cRows: GSTR1B2CRow[] = [];

		for (const inv of invoices) {
			const lineItems = inv.line_items ?? [];

			// Group line items by tax rate for the summary columns
			const taxRateGroups = new Map<number, { taxable: number; cess: number }>();
			for (const li of lineItems) {
				const group = taxRateGroups.get(li.gst_rate) ?? { taxable: 0, cess: 0 };
				group.taxable += li.taxable_amount;
				taxRateGroups.set(li.gst_rate, group);
			}

			for (const [rate, group] of taxRateGroups) {
				if (inv.customer_gstin) {
					// B2B — registered dealer
					b2bRows.push({
						'GSTIN of Recipient': inv.customer_gstin,
						'Receiver Name': inv.customer_name,
						'Invoice Number': inv.invoice_number,
						'Invoice date': inv.invoice_date,
						'Invoice Value': inv.grand_total,
						'Place Of Supply': inv.place_of_supply ?? '',
						'Reverse Charge': inv.reverse_charge ? 'Y' : 'N',
						'Applicable % of Tax Rate': 0,
						'Invoice Type': 'Regular',
						'E-Commerce GSTIN': '',
						Rate: rate,
						'Taxable Value': group.taxable,
						'Cess Amount': 0,
					});
				} else {
					// B2C — unregistered / consumer
					b2cRows.push({
						Type: 'OE',
						'Place Of Supply': inv.place_of_supply ?? '',
						'Applicable % of Tax Rate': 0,
						Rate: rate,
						'Taxable Value': group.taxable,
						'Cess Amount': 0,
						'E-Commerce GSTIN': '',
					});
				}
			}
		}

		const b2bHeaders: (keyof GSTR1B2BRow)[] = [
			'GSTIN of Recipient',
			'Receiver Name',
			'Invoice Number',
			'Invoice date',
			'Invoice Value',
			'Place Of Supply',
			'Reverse Charge',
			'Applicable % of Tax Rate',
			'Invoice Type',
			'E-Commerce GSTIN',
			'Rate',
			'Taxable Value',
			'Cess Amount',
		];

		const b2cHeaders: (keyof GSTR1B2CRow)[] = [
			'Type',
			'Place Of Supply',
			'Applicable % of Tax Rate',
			'Rate',
			'Taxable Value',
			'Cess Amount',
			'E-Commerce GSTIN',
		];

		const b2bCSV = toCSV(b2bHeaders, b2bRows as unknown as Record<string, string | number>[]);
		const b2cCSV = toCSV(b2cHeaders, b2cRows as unknown as Record<string, string | number>[]);
		const combined = `B2B\n${b2bCSV}\n\nB2C Large\n${b2cCSV}`;

		const fileName = `GSTR1_${startDate}_${endDate}.csv`;
		const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
		await FileSystem.writeAsStringAsync(fileUri, combined, {
			encoding: FileSystem.EncodingType.UTF8,
		});

		if (await Sharing.isAvailableAsync()) {
			await Sharing.shareAsync(fileUri, {
				mimeType: 'text/csv',
				dialogTitle: `Export GSTR-1: ${startDate} to ${endDate}`,
			});
		}
	},
};
