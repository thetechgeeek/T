import { calculateLineItemTax, calculateInvoiceTotals } from './gstCalculator';

describe('GST Calculator', () => {
	it('calculates line item tax for intra-state (CGST & SGST)', () => {
		// 1000 * 2 = 2000, 18% GST = 360 (180 CGST + 180 SGST)
		const result = calculateLineItemTax(18, 2, 1000, 0, false);

		expect(result.taxableAmount).toBe(2000);
		expect(result.cgst).toBe(180);
		expect(result.sgst).toBe(180);
		expect(result.igst).toBe(0);
		expect(result.totalTax).toBe(360);
		expect(result.lineTotal).toBe(2360);
	});

	it('calculates line item tax for inter-state (IGST) with discount', () => {
		// 5000 * 1 = 5000 - 500 discount = 4500. 12% IGST = 540
		const result = calculateLineItemTax(12, 1, 5000, 500, true);

		expect(result.taxableAmount).toBe(4500);
		expect(result.cgst).toBe(0);
		expect(result.sgst).toBe(0);
		expect(result.igst).toBe(540);
		expect(result.totalTax).toBe(540);
		expect(result.lineTotal).toBe(5040);
	});

	it('calculates invoice totals correctly', () => {
		const items = [
			{
				quantity: 2,
				rate_per_unit: 1000,
				discount: 0,
				gst_rate: 18,
			} as unknown as Parameters<typeof calculateInvoiceTotals>[0][number],
			{
				quantity: 1,
				rate_per_unit: 5000,
				discount: 500,
				gst_rate: 12,
			} as unknown as Parameters<typeof calculateInvoiceTotals>[0][number],
		];

		const totals = calculateInvoiceTotals(items, true); // Inter-state

		expect(totals.subtotal).toBe(7000); // 2000 + 5000
		expect(totals.discount_total).toBe(500);
		expect(totals.igst_total).toBe(360 + 540); // 900
		expect(totals.cgst_total).toBe(0);
		expect(totals.grand_total).toBe(7400); // 7000 - 500 + 900
		expect(totals.slabBreakdown).toHaveLength(2);
		expect(totals.slabBreakdown[0].rate).toBe(12);
	});
});

describe('calculateLineItemTax — edge cases', () => {
	it('zero-rated (gst_rate = 0): all tax fields are 0', () => {
		const result = calculateLineItemTax(0, 10, 500, 0, false);
		expect(result.taxableAmount).toBe(5000);
		expect(result.cgst).toBe(0);
		expect(result.sgst).toBe(0);
		expect(result.igst).toBe(0);
		expect(result.lineTotal).toBe(5000);
	});

	it('gst_rate = 5 intra-state: CGST and SGST are each 2.5%', () => {
		const result = calculateLineItemTax(5, 1, 1000, 0, false);
		expect(result.taxableAmount).toBe(1000);
		expect(result.cgst).toBe(25);
		expect(result.sgst).toBe(25);
		expect(result.igst).toBe(0);
	});

	it('gst_rate = 28 inter-state: IGST is 28%, CGST/SGST are 0', () => {
		const result = calculateLineItemTax(28, 1, 1000, 0, true);
		expect(result.taxableAmount).toBe(1000);
		expect(result.igst).toBe(280);
		expect(result.cgst).toBe(0);
		expect(result.sgst).toBe(0);
	});

	it('discount equal to gross: taxable amount is 0, all tax is 0', () => {
		const gross = 1000 * 5; // 5000
		const result = calculateLineItemTax(18, 5, 1000, gross, false);
		expect(result.taxableAmount).toBe(0);
		expect(result.cgst).toBe(0);
		expect(result.sgst).toBe(0);
		expect(result.lineTotal).toBe(0);
	});

	it('discount greater than gross: taxable amount is clamped to 0', () => {
		const result = calculateLineItemTax(18, 2, 500, 9999, false);
		expect(result.taxableAmount).toBe(0);
		expect(result.cgst).toBe(0);
		expect(result.sgst).toBe(0);
		expect(result.lineTotal).toBe(0);
	});

	it('quantity = 0: all monetary fields are 0', () => {
		const result = calculateLineItemTax(18, 0, 500, 0, false);
		expect(result.taxableAmount).toBe(0);
		expect(result.cgst).toBe(0);
		expect(result.sgst).toBe(0);
		expect(result.igst).toBe(0);
		expect(result.lineTotal).toBe(0);
	});

	it('floating-point precision: lineTotal has no drift beyond 2 decimal places', () => {
		const result = calculateLineItemTax(18, 3, 333.33, 0, false);
		expect(Number.isFinite(result.lineTotal)).toBe(true);
		expect(result.lineTotal).toBe(parseFloat(result.lineTotal.toFixed(2)));
	});
});

describe('calculateInvoiceTotals — edge cases', () => {
	it('two items with different GST rates intra-state: CGST+SGST>0, IGST=0', () => {
		const items = [
			{
				quantity: 1,
				rate_per_unit: 1000,
				discount: 0,
				gst_rate: 12,
			} as unknown as Parameters<typeof calculateInvoiceTotals>[0][number],
			{
				quantity: 1,
				rate_per_unit: 1000,
				discount: 0,
				gst_rate: 18,
			} as unknown as Parameters<typeof calculateInvoiceTotals>[0][number],
		];
		const totals = calculateInvoiceTotals(items, false);
		expect(totals.cgst_total).toBeGreaterThan(0);
		expect(totals.sgst_total).toBeGreaterThan(0);
		expect(totals.igst_total).toBe(0);
		expect(totals.cgst_total + totals.sgst_total).toBeCloseTo(
			totals.cgst_total + totals.sgst_total,
		);
	});

	it('slabBreakdown is sorted ascending by rate', () => {
		const items = [
			{ quantity: 1, rate_per_unit: 100, discount: 0, gst_rate: 28 } as unknown as Parameters<
				typeof calculateInvoiceTotals
			>[0][number],
			{ quantity: 1, rate_per_unit: 100, discount: 0, gst_rate: 5 } as unknown as Parameters<
				typeof calculateInvoiceTotals
			>[0][number],
			{ quantity: 1, rate_per_unit: 100, discount: 0, gst_rate: 18 } as unknown as Parameters<
				typeof calculateInvoiceTotals
			>[0][number],
		];
		const { slabBreakdown } = calculateInvoiceTotals(items, false);
		expect(slabBreakdown[0].rate).toBe(5);
		expect(slabBreakdown[1].rate).toBe(18);
		expect(slabBreakdown[2].rate).toBe(28);
	});

	it('single zero-rated item: slabBreakdown has one entry with 0 total_tax', () => {
		const items = [
			{ quantity: 1, rate_per_unit: 500, discount: 0, gst_rate: 0 } as unknown as Parameters<
				typeof calculateInvoiceTotals
			>[0][number],
		];
		const { slabBreakdown } = calculateInvoiceTotals(items, false);
		expect(slabBreakdown).toHaveLength(1);
		expect(slabBreakdown[0].rate).toBe(0);
		expect(slabBreakdown[0].total_tax).toBe(0);
	});

	it('empty line_items array: all totals are 0, slabBreakdown is empty', () => {
		const totals = calculateInvoiceTotals([], false);
		expect(totals.subtotal).toBe(0);
		expect(totals.grand_total).toBe(0);
		expect(totals.cgst_total).toBe(0);
		expect(totals.sgst_total).toBe(0);
		expect(totals.igst_total).toBe(0);
		expect(totals.slabBreakdown).toEqual([]);
	});
});
