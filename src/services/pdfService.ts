import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../config/supabase';
import { businessProfileService } from './businessProfileService';
import { numberToIndianWords } from '../utils/currency';
import { escapeHtml } from '../utils/html';
import type { Invoice } from '../types/invoice';
import type { BusinessProfile } from '../types/businessProfile';
import logger from '../utils/logger';
import { palette } from '../theme/palette';

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

	generateInvoiceHTML(
		invoice: Invoice,
		businessProfile: BusinessProfile | null,
		t: (key: string, options?: Record<string, unknown>) => string,
		formatDate: (date: string | Date) => string,
	) {
		const bp =
			businessProfile ||
			({
				business_name: t('branding.appName'),
				phone: '',
				email: '',
				address: '',
				gstin: '',
				terms_and_conditions: '',
			} as Partial<BusinessProfile> & { business_name: string });

		const isInterState = invoice.is_inter_state;

		const itemsTableRows =
			invoice.line_items
				?.map((item, index) => {
					const taxCols = isInterState
						? `<td>₹${item.igst_amount.toFixed(2)} (${item.gst_rate}%)</td>`
						: `
          <td>₹${item.cgst_amount.toFixed(2)} (${item.gst_rate / 2}%)</td>
          <td>₹${item.sgst_amount.toFixed(2)} (${item.gst_rate / 2}%)</td>
        `;

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

		const taxHeaderCols = isInterState
			? `<th>${t('pdf.igst')}</th>`
			: `<th>${t('pdf.cgst')}</th><th>${t('pdf.sgst')}</th>`;

		const taxFooterCols = isInterState
			? `
          <tr>
            <td colspan="8" style="text-align:right; font-weight:bold">${t('pdf.igst')} ${t('pdf.total')}:</td>
            <td colspan="2" style="text-align:right">₹${invoice.igst_total.toFixed(2)}</td>
          </tr>
        `
			: `
          <tr>
            <td colspan="9" style="text-align:right; font-weight:bold">${t('pdf.cgst')} ${t('pdf.total')}:</td>
            <td colspan="2" style="text-align:right">₹${invoice.cgst_total.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="9" style="text-align:right; font-weight:bold">${t('pdf.sgst')} ${t('pdf.total')}:</td>
            <td colspan="2" style="text-align:right">₹${invoice.sgst_total.toFixed(2)}</td>
          </tr>
        `;

		return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${t('invoice.title')} ${invoice.invoice_number}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: ${palette.pdfBodyText}; padding: 30px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid ${palette.pdfPrimary}; padding-bottom: 20px; margin-bottom: 20px; }
            .business-info h1 { margin: 0; color: ${palette.pdfPrimary}; font-size: 28px; }
            .business-info p { margin: 4px 0; font-size: 14px; }
            .doc-details { text-align: right; }
            .doc-details h2 { margin: 0; font-size: 24px; color: ${palette.pdfMutedUppercase}; text-transform: uppercase; letter-spacing: 2px;}
            .doc-details p { margin: 4px 0; font-size: 14px; }
            
            .bill-to { margin-bottom: 30px; }
            .bill-to h3 { margin: 0 0 10px 0; color: ${palette.pdfBillToHeading}; font-size: 16px; border-bottom: 1px solid ${palette.borderCCC}; padding-bottom: 5px; display: inline-block; }
            .bill-to p { margin: 4px 0; font-size: 14px; }

            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
            th { background-color: ${palette.pdfTableHeaderBg}; border: 1px solid ${palette.grayDDD}; padding: 10px; text-align: left; }
            td { border: 1px solid ${palette.grayDDD}; padding: 10px; }
            
            .totals { margin-top: 20px; width: 50%; float: right; border-collapse: collapse; }
            .totals td { padding: 8px 12px; border: none; border-bottom: 1px solid ${palette.grayEEE}; }
            .totals .grand-total { font-weight: bold; font-size: 18px; color: ${palette.pdfPrimary}; border-top: 2px solid ${palette.pdfPrimary}; background: ${palette.pdfGrandTotalBg};}
            
            .footer { clear: both; margin-top: 60px; font-size: 12px; color: ${palette.pdfFooterMuted}; border-top: 1px solid ${palette.borderCCC}; padding-top: 20px; }
            .amount-words { clear: both; margin-top: 30px; font-style: italic; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="business-info">
              <h1>${bp.business_name}</h1>
              <p>${bp.address || ''}</p>
              <p>${t('pdf.phone')}: ${bp.phone || ''} ${bp.email ? ` | ${t('pdf.email')}: ${bp.email}` : ''}</p>
              ${bp.gstin ? `<p><strong>${t('customer.gstin')}:</strong> ${bp.gstin}</p>` : ''}
            </div>
            <div class="doc-details">
              <h2>${t('pdf.invoiceTitle')}</h2>
              <p><strong>${t('invoice.invoiceNumber')}:</strong> ${invoice.invoice_number}</p>
              <p><strong>${t('invoice.invoiceDate')}:</strong> ${formatDate(invoice.invoice_date)}</p>
            </div>
          </div>

          <div class="bill-to">
            <h3>${t('pdf.billTo')}</h3>
            <p><strong>${invoice.customer_name}</strong></p>
            ${invoice.customer_address ? `<p>${invoice.customer_address}</p>` : ''}
            ${invoice.customer_phone ? `<p>${t('pdf.phone')}: ${invoice.customer_phone}</p>` : ''}
            ${invoice.customer_gstin ? `<p><strong>${t('customer.gstin')}:</strong> ${invoice.customer_gstin}</p>` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>${t('pdf.itemDescription')}</th>
                <th>${t('pdf.hsnSac')}</th>
                <th>${t('pdf.qty')}</th>
                <th>${t('pdf.rate')}</th>
                <th>${t('pdf.disc')}</th>
                <th>${t('pdf.taxable')}</th>
                ${taxHeaderCols}
                <th style="text-align:right">${t('pdf.total')}</th>
              </tr>
            </thead>
            <tbody>
              ${itemsTableRows}
            </tbody>
          </table>

          <table class="totals">
            <tr>
              <td style="text-align:right; font-weight:bold">${t('pdf.subtotal')}:</td>
              <td style="text-align:right">₹${invoice.subtotal.toFixed(2)}</td>
            </tr>
            ${
				invoice.discount_total > 0
					? `
            <tr>
              <td style="text-align:right; font-weight:bold; color:red">${t('pdf.discount')}:</td>
              <td style="text-align:right; color:red">-₹${invoice.discount_total.toFixed(2)}</td>
            </tr>
            `
					: ''
			}
            ${taxFooterCols}
            <tr class="grand-total">
              <td style="text-align:right; font-weight:bold">${t('pdf.grandTotal')}:</td>
              <td style="text-align:right; font-weight:bold">₹${invoice.grand_total.toFixed(2)}</td>
            </tr>
            <tr>
               <td style="text-align:right; font-weight:bold">${t('pdf.amountPaid')}:</td>
               <td style="text-align:right">₹${invoice.amount_paid.toFixed(2)} ${invoice.payment_mode ? `(${t(`invoice.paymentModes.${invoice.payment_mode}`).toUpperCase()})` : ''}</td>
            </tr>
            <tr>
               <td style="text-align:right; font-weight:bold">${t('pdf.balanceDue')}:</td>
               <td style="text-align:right; font-weight:bold">₹${Math.max(0, invoice.grand_total - invoice.amount_paid).toFixed(2)}</td>
            </tr>
          </table>

          <div class="amount-words">
             ${t('pdf.amountInWords')}: ${escapeHtml(numberToIndianWords(invoice.grand_total))}.
          </div>

          <div class="footer">
            <p>${t('pdf.notes')}: ${invoice.notes || '-'}</p>
            <p>${t('pdf.terms')}: ${invoice.terms || bp.terms_and_conditions || t('pdf.termsDefault')}</p>
            <div style="text-align:right; margin-top:40px;">
               ___________________________<br>
               ${t('pdf.authorizedSignatory')}
            </div>
          </div>
        </body>
      </html>
    `;
	},

	async printAndShareInvoice(
		invoice: Invoice,
		t: (key: string, options?: Record<string, unknown>) => string,
		formatDate: (date: string | Date) => string,
	) {
		try {
			const bp = await this.getBusinessProfile();
			const html = this.generateInvoiceHTML(invoice, bp, t, formatDate);

			const { uri } = await Print.printToFileAsync({ html });

			if (!(await Sharing.isAvailableAsync())) {
				alert(t('pdf.sharingNotAvailable'));
				return;
			}

			// We share the PDF locally via intent
			await Sharing.shareAsync(uri, {
				UTI: '.pdf',
				mimeType: 'application/pdf',
				dialogTitle: `${t('common.share')} ${t('invoice.title')} ${invoice.invoice_number}`,
			});
		} catch (e: unknown) {
			logger.error(
				'Failed to generate/share PDF',
				e instanceof Error ? e : new Error(String(e)),
			);
			alert(
				`${t('common.error')}: ` +
					(e instanceof Error ? e.message : t('common.unexpectedError')),
			);
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

			return {
				uri: file.uri,
				name: file.name ?? `upload-${Date.now()}.pdf`,
				size: file.size,
				mimeType: file.mimeType || 'application/pdf',
			};
		} catch (e) {
			logger.error('Error picking document', e);
			throw e;
		}
	},

	/**
	 * Upload a picked document to Supabase Storage and return the storage path.
	 * Falls back gracefully: if upload fails, returns null so the caller can
	 * use the base64 fallback path.
	 */
	async uploadDocumentToStorage(
		uri: string,
		fileName: string,
		mimeType: string,
	): Promise<string | null> {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return null;

			const storagePath = `${user.id}/${Date.now()}-${fileName}`;
			const base64 = await FileSystem.readAsStringAsync(uri, {
				encoding: FileSystem.EncodingType.Base64,
			});

			// Convert base64 → Uint8Array for the storage upload
			const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

			const { error } = await supabase.storage
				.from('order-pdfs')
				.upload(storagePath, binary, { contentType: mimeType, upsert: false });

			if (error) {
				logger.error('Storage upload failed', new Error(error.message));
				return null;
			}

			return storagePath;
		} catch (e) {
			logger.error('Storage upload exception', e instanceof Error ? e : new Error(String(e)));
			return null;
		}
	},

	async parseDocumentWithLLM(
		uriOrBase64: string,
		mimeType: string,
		/** Pre-uploaded storage path — preferred over base64 to avoid large payloads */
		storagePath?: string,
	): Promise<ParsedOrderItem[]> {
		let body: Record<string, unknown>;

		if (storagePath) {
			body = { storagePath, mimeType };
		} else {
			// Legacy path: read file as base64 and send inline
			const base64 = await FileSystem.readAsStringAsync(uriOrBase64, {
				encoding: FileSystem.EncodingType.Base64,
			});
			body = { base64Data: base64, mimeType };
		}

		const {
			data: { session },
		} = await supabase.auth.getSession();
		const { data, error } = await supabase.functions.invoke('parse-order-pdf', {
			body,
			headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
		});

		if (error) {
			logger.error('Edge Function Error:', error);
			throw new Error(
				error.message || `Edge function returned ${error.status || 'unknown'} error`,
			);
		}

		if (!data || !data.success || !data.data || !data.data.items) {
			throw new Error(
				data?.error || 'Failed to parse document format explicitly from Vision API',
			);
		}

		return data.data.items as ParsedOrderItem[];
	},

	/**
	 * Send raw pasted/typed text to the AI for order extraction.
	 * Uses the text-content mode of the edge function — no file upload required.
	 */
	async parseTextWithLLM(textContent: string): Promise<ParsedOrderItem[]> {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		const { data, error } = await supabase.functions.invoke('parse-order-pdf', {
			body: { textContent },
			headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
		});

		if (error) {
			logger.error('Edge Function Error (text mode):', error);
			throw new Error(
				error.message || `Edge function returned ${error.status || 'unknown'} error`,
			);
		}

		if (!data || !data.success || !data.data || !data.data.items) {
			throw new Error(data?.error || 'Failed to parse text from Vision AI');
		}

		return data.data.items as ParsedOrderItem[];
	},
};
