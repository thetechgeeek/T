import type { UUID, Timestamps } from './common';

export type PaymentStatus = 'paid' | 'partial' | 'unpaid';
export type PaymentMode = 'cash' | 'upi' | 'bank_transfer' | 'credit' | 'cheque';

export interface InvoiceLineItem {
  id: UUID;
  invoice_id: UUID;
  item_id?: UUID;
  design_name: string;
  description?: string;
  hsn_code?: string;
  quantity: number;
  rate_per_unit: number;
  discount: number;
  taxable_amount: number;
  gst_rate: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  line_total: number;
  tile_image_url?: string;
  sort_order?: number;
}

export interface Invoice extends Timestamps {
  id: UUID;
  invoice_number: string;
  invoice_date: string;
  customer_id?: UUID;
  customer_name: string;
  customer_gstin?: string;
  customer_phone?: string;
  customer_address?: string;
  subtotal: number;
  cgst_total: number;
  sgst_total: number;
  igst_total: number;
  discount_total: number;
  grand_total: number;
  is_inter_state: boolean;
  payment_status: PaymentStatus;
  payment_mode?: PaymentMode;
  amount_paid: number;
  notes?: string;
  terms?: string;
  pdf_url?: string;
  line_items?: InvoiceLineItem[];
}

export interface InvoiceLineItemInput {
  item_id?: UUID;
  design_name: string;
  description?: string;
  hsn_code?: string;
  quantity: number;
  rate_per_unit: number;
  discount?: number;
  gst_rate: number;
  tile_image_url?: string;
}

export interface InvoiceInput {
  invoice_date: string;
  customer_id?: UUID;
  customer_name: string;
  customer_gstin?: string;
  customer_phone?: string;
  customer_address?: string;
  is_inter_state: boolean;
  line_items: InvoiceLineItemInput[];
  payment_status: PaymentStatus;
  payment_mode?: PaymentMode;
  amount_paid?: number;
  notes?: string;
  terms?: string;
}

export interface InvoiceTotals {
  subtotal: number;
  cgst_total: number;
  sgst_total: number;
  igst_total: number;
  discount_total: number;
  grand_total: number;
}

export interface GstSlabBreakdown {
  rate: number;
  taxable_amount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total_tax: number;
}

export interface InvoiceFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  customer_id?: UUID;
  payment_status?: PaymentStatus | 'ALL';
  sortBy?: 'invoice_date' | 'grand_total' | 'created_at';
  sortDir?: 'asc' | 'desc';
}
