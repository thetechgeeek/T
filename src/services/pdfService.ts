import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../config/supabase';
import { businessProfileService } from './businessProfileService';
import { numberToIndianWords } from '../utils/currency';
import { escapeHtml } from '../utils/html';
import type { Invoice } from '../types/invoice';
import type { BusinessProfile } from '../types/businessProfile';
import logger from '../utils/logger';

export interface ParsedOrderItem {
	design_name?: string;
	base_item_number?: string;
	category?: string;
	size?: string;
	brand?: string;
	box_count?: number;
	price_per_box?: number;
	total_price?: number;
	[key: string]: unknown;
}

export const pdfService = {
	async getBusinessProfile() {
		return businessProfileService.fetch();
	},

	generateInvoiceHTML(invoice: Invoice, businessProfile: BusinessProfile | null) {
		const bp =
			businessProfile ||
			({
				business_name: 'TileMaster',
				phone: '',
				email: '',
				address: '',
				gstin: '',
				terms_and_conditions: '',
			} as Partial<BusinessProfile> & { business_name: string });

		const isInterState = invoice.is_inter_state;

		let itemsTableRows =
			invoice.line_items
				?.map((item, index) => {
					let taxCols = '';
					if (isInterState) {
						taxCols = `<td>₹${item.igst_amount.toFixed(2)} (${item.gst_rate}%)</td>`;
					} else {
						taxCols = `
          <td>₹${item.cgst_amount.toFixed(2)} (${item.gst_rate / 2}%)</td>
          <td>₹${item.sgst_amount.toFixed(2)} (${item.gst_rate / 2}%)</td>
        `;
					}

					return `
        <tr>
          <td>${index + 1}</td>
          <td>${item.design_name} ${item.description ? `<br><small>${item.description}</small>` : ''}</td>
          <td>${item.hsn_code || '-'}</td>
          <td>${item.quantity}</td>
          <td>₹${item.rate_per_unit.toFixed(2)}</td>
          <td>₹${item.discount > 0 ? item.discount.toFixed(2) : '0.00'}</td>
          <td>₹${item.taxable_amount.toFixed(2)}</td>
          ${taxCols}
          <td style="text-align:right">₹${item.line_total.toFixed(2)}</td>
        </tr>
      `;
				})
				.join('') || '';

		const taxHeaderCols = isInterState ? '<th>IGST</th>' : '<th>CGST</th><th>SGST</th>';

		const taxFooterCols = isInterState
			? `
          <tr>
            <td colspan="8" style="text-align:right; font-weight:bold">Total IGST:</td>
            <td colspan="2" style="text-align:right">₹${invoice.igst_total.toFixed(2)}</td>
          </tr>
        `
			: `
          <tr>
            <td colspan="9" style="text-align:right; font-weight:bold">Total CGST:</td>
            <td colspan="2" style="text-align:right">₹${invoice.cgst_total.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="9" style="text-align:right; font-weight:bold">Total SGST:</td>
            <td colspan="2" style="text-align:right">₹${invoice.sgst_total.toFixed(2)}</td>
          </tr>
        `;

		return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice ${invoice.invoice_number}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 30px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #C1440E; padding-bottom: 20px; margin-bottom: 20px; }
            .business-info h1 { margin: 0; color: #C1440E; font-size: 28px; }
            .business-info p { margin: 4px 0; font-size: 14px; }
            .doc-details { text-align: right; }
            .doc-details h2 { margin: 0; font-size: 24px; color: #666; text-transform: uppercase; letter-spacing: 2px;}
            .doc-details p { margin: 4px 0; font-size: 14px; }
            
            .bill-to { margin-bottom: 30px; }
            .bill-to h3 { margin: 0 0 10px 0; color: #555; font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px; display: inline-block; }
            .bill-to p { margin: 4px 0; font-size: 14px; }

            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
            th { background-color: #f5f5f5; border: 1px solid #ddd; padding: 10px; text-align: left; }
            td { border: 1px solid #ddd; padding: 10px; }
            
            .totals { margin-top: 20px; width: 50%; float: right; border-collapse: collapse; }
            .totals td { padding: 8px 12px; border: none; border-bottom: 1px solid #eee; }
            .totals .grand-total { font-weight: bold; font-size: 18px; color: #C1440E; border-top: 2px solid #C1440E; background: #fffcf8;}
            
            .footer { clear: both; margin-top: 60px; font-size: 12px; color: #777; border-top: 1px solid #ccc; padding-top: 20px; }
            .amount-words { clear: both; margin-top: 30px; font-style: italic; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="business-info">
              <h1>${bp.business_name}</h1>
              <p>${bp.address || ''}</p>
              <p>Phone: ${bp.phone || ''} ${bp.email ? ` | Email: ${bp.email}` : ''}</p>
              ${bp.gstin ? `<p><strong>GSTIN:</strong> ${bp.gstin}</p>` : ''}
            </div>
            <div class="doc-details">
              <h2>TAX INVOICE</h2>
              <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
              <p><strong>Date:</strong> ${new Date(invoice.invoice_date).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          <div class="bill-to">
            <h3>Bill To</h3>
            <p><strong>${invoice.customer_name}</strong></p>
            ${invoice.customer_address ? `<p>${invoice.customer_address}</p>` : ''}
            ${invoice.customer_phone ? `<p>Phone: ${invoice.customer_phone}</p>` : ''}
            ${invoice.customer_gstin ? `<p><strong>GSTIN:</strong> ${invoice.customer_gstin}</p>` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item Description</th>
                <th>HSN/SAC</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Disc</th>
                <th>Taxable</th>
                ${taxHeaderCols}
                <th style="text-align:right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsTableRows}
            </tbody>
          </table>

          <table class="totals">
            <tr>
              <td style="text-align:right; font-weight:bold">Subtotal:</td>
              <td style="text-align:right">₹${invoice.subtotal.toFixed(2)}</td>
            </tr>
            ${
				invoice.discount_total > 0
					? `
            <tr>
              <td style="text-align:right; font-weight:bold; color:red">Discount:</td>
              <td style="text-align:right; color:red">-₹${invoice.discount_total.toFixed(2)}</td>
            </tr>
            `
					: ''
			}
            ${taxFooterCols}
            <tr class="grand-total">
              <td style="text-align:right; font-weight:bold">Grand Total:</td>
              <td style="text-align:right; font-weight:bold">₹${invoice.grand_total.toFixed(2)}</td>
            </tr>
            <tr>
               <td style="text-align:right; font-weight:bold">Amount Paid:</td>
               <td style="text-align:right">₹${invoice.amount_paid.toFixed(2)} ${invoice.payment_mode ? `(${invoice.payment_mode.toUpperCase()})` : ''}</td>
            </tr>
            <tr>
               <td style="text-align:right; font-weight:bold">Balance Due:</td>
               <td style="text-align:right; font-weight:bold">₹${Math.max(0, invoice.grand_total - invoice.amount_paid).toFixed(2)}</td>
            </tr>
          </table>

          <div class="amount-words">
             Amount in words: ${escapeHtml(numberToIndianWords(invoice.grand_total))}.
          </div>

          <div class="footer">
            <p>Notes: ${invoice.notes || '-'}</p>
            <p>Terms & Conditions: ${invoice.terms || bp.terms_and_conditions || 'Errors and Omissions Excepted. Subject to local jurisdiction.'}</p>
            <div style="text-align:right; margin-top:40px;">
               ___________________________<br>
               Authorized Signatory
            </div>
          </div>
        </body>
      </html>
    `;
	},

	async printAndShareInvoice(invoice: Invoice) {
		try {
			const bp = await this.getBusinessProfile();
			const html = this.generateInvoiceHTML(invoice, bp);

			const { uri } = await Print.printToFileAsync({ html });

			if (!(await Sharing.isAvailableAsync())) {
				alert("Sharing isn't available on your device");
				return;
			}

			// We share the PDF locally via intent
			await Sharing.shareAsync(uri, {
				UTI: '.pdf',
				mimeType: 'application/pdf',
				dialogTitle: `Share Invoice ${invoice.invoice_number}`,
			});
		} catch (e: unknown) {
			logger.error(
				'Failed to generate/share PDF',
				e instanceof Error ? e : new Error(String(e)),
			);
			alert('Error: ' + (e instanceof Error ? e.message : 'Failed to generate PDF.'));
		}
	},

	async pickPdfDocument() {
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: ['application/pdf', 'image/*'],
				copyToCacheDirectory: true,
			});

			if (result.canceled || !result.assets || result.assets.length === 0) {
				return null;
			}

			const file = result.assets[0];
			if (!file.uri) return null;

			const base64 = await FileSystem.readAsStringAsync(file.uri, {
				encoding: FileSystem.EncodingType.Base64,
			});

			return {
				uri: file.uri,
				name: file.name,
				size: file.size,
				mimeType: file.mimeType || 'application/pdf',
				base64,
			};
		} catch (e) {
			logger.error('Error picking document', e);
			throw e;
		}
	},

	async parseDocumentWithLLM(
		base64: string,
		mimeType: string,
		aiKey?: string,
	): Promise<ParsedOrderItem[]> {
		const { data, error } = await supabase.functions.invoke('parse-order-pdf', {
			body: {
				base64Data: base64,
				mimeType: mimeType,
				aiKey: aiKey,
			},
		});

		if (error) {
			// Supabase edge function errors sometimes return the raw response
			throw new Error(error.message || 'Failed to call edge function');
		}

		if (!data || !data.success || !data.data || !data.data.items) {
			throw new Error(
				data?.error || 'Failed to parse document format explicitly from Vision API',
			);
		}

		return data.data.items as ParsedOrderItem[];
	},
};
