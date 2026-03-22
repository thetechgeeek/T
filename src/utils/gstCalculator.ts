import type { InvoiceLineItemInput, GstSlabBreakdown, InvoiceTotals } from '@/src/types/invoice';

interface LineItemTax {
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  taxableAmount: number;
  lineTotal: number;
}

/**
 * Calculate tax for a single line item.
 * Intra-state: CGST + SGST (each = rate/2)
 * Inter-state: IGST (full rate)
 */
export function calculateLineItemTax(
  gstRate: number,
  quantity: number,
  ratePerUnit: number,
  discount: number,
  isInterState: boolean
): LineItemTax {
  const grossAmount = quantity * ratePerUnit;
  const discountAmount = discount;
  const taxableAmount = Math.max(0, grossAmount - discountAmount);
  const taxFraction = gstRate / 100;

  let cgst = 0, sgst = 0, igst = 0;

  if (isInterState) {
    igst = round2(taxableAmount * taxFraction);
  } else {
    cgst = round2(taxableAmount * (taxFraction / 2));
    sgst = round2(taxableAmount * (taxFraction / 2));
  }

  const totalTax = cgst + sgst + igst;
  const lineTotal = round2(taxableAmount + totalTax);

  return { cgst, sgst, igst, totalTax, taxableAmount, lineTotal };
}

/**
 * Calculate complete invoice totals with GST slab breakdown.
 */
export function calculateInvoiceTotals(
  lineItems: InvoiceLineItemInput[],
  isInterState: boolean
): InvoiceTotals & { slabBreakdown: GstSlabBreakdown[] } {
  let subtotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;
  let discountTotal = 0;
  const slabMap = new Map<number, GstSlabBreakdown>();

  for (const item of lineItems) {
    const discount = item.discount ?? 0;
    const tax = calculateLineItemTax(item.gst_rate, item.quantity, item.rate_per_unit, discount, isInterState);
    
    subtotal += round2(item.quantity * item.rate_per_unit);
    discountTotal += discount;
    cgstTotal += tax.cgst;
    sgstTotal += tax.sgst;
    igstTotal += tax.igst;

    // Accumulate slab breakdown
    const existing = slabMap.get(item.gst_rate) ?? {
      rate: item.gst_rate,
      taxable_amount: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total_tax: 0,
    };
    existing.taxable_amount += tax.taxableAmount;
    existing.cgst += tax.cgst;
    existing.sgst += tax.sgst;
    existing.igst += tax.igst;
    existing.total_tax += tax.totalTax;
    slabMap.set(item.gst_rate, existing);
  }

  const grandTotal = round2(subtotal - discountTotal + cgstTotal + sgstTotal + igstTotal);
  const slabBreakdown = Array.from(slabMap.values()).sort((a, b) => a.rate - b.rate);

  return {
    subtotal: round2(subtotal),
    cgst_total: round2(cgstTotal),
    sgst_total: round2(sgstTotal),
    igst_total: round2(igstTotal),
    discount_total: round2(discountTotal),
    grand_total: grandTotal,
    slabBreakdown,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
