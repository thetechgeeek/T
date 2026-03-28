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
			{ quantity: 2, rate_per_unit: 1000, discount: 0, gst_rate: 18 } as any,
			{ quantity: 1, rate_per_unit: 5000, discount: 500, gst_rate: 12 } as any,
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
