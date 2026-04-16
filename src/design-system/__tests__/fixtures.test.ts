import {
	DESIGN_SYSTEM_OPERATIONAL_FIXTURE,
	DESIGN_SYSTEM_READ_ONLY_FIELDS,
	DESIGN_SYSTEM_RELAXED_FIXTURE,
	DESIGN_SYSTEM_STATE_FIXTURES,
} from '../fixtures';

describe('design-system proof fixtures', () => {
	it('keeps both relaxed and operational presentation fixtures available', () => {
		expect(DESIGN_SYSTEM_RELAXED_FIXTURE.metricValue).toBeTruthy();
		expect(DESIGN_SYSTEM_RELAXED_FIXTURE.metricContext.length).toBeGreaterThan(10);
		expect(DESIGN_SYSTEM_OPERATIONAL_FIXTURE.metricValue).toBeTruthy();
		expect(DESIGN_SYSTEM_OPERATIONAL_FIXTURE.metricContext).toContain('blocked');
	});

	it('keeps realistic fallback-state content for no-media and ugly-data review', () => {
		expect(DESIGN_SYSTEM_STATE_FIXTURES.noMedia.title).toContain('Logistics');
		expect(DESIGN_SYSTEM_STATE_FIXTURES.noMedia.monogram).toHaveLength(2);
		expect(DESIGN_SYSTEM_STATE_FIXTURES.uglyData.title.length).toBeGreaterThan(50);
		expect(DESIGN_SYSTEM_STATE_FIXTURES.uglyData.detail).toContain('null');
		expect(DESIGN_SYSTEM_STATE_FIXTURES.uglyData.metricValue).toContain('₹');
	});

	it('retains read-only fixture rows with metadata context', () => {
		expect(DESIGN_SYSTEM_READ_ONLY_FIELDS).toHaveLength(3);
		expect(DESIGN_SYSTEM_READ_ONLY_FIELDS.every((field) => field.meta.length > 0)).toBe(true);
	});
});
