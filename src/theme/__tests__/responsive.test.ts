import {
	resolveResponsiveMetrics,
	scaleResponsiveValue,
	type ResponsiveMetrics,
} from '../responsive';

function expectMetrics(
	metrics: ResponsiveMetrics,
	expected: Partial<
		Pick<
			ResponsiveMetrics,
			'breakpoint' | 'deviceType' | 'orientation' | 'columns' | 'supportsSplitPane'
		>
	>,
) {
	expect(metrics).toEqual(expect.objectContaining(expected));
}

describe('responsive metrics', () => {
	it('classifies compact phones into a single-column portrait layout', () => {
		const metrics = resolveResponsiveMetrics(320, 568);

		expectMetrics(metrics, {
			breakpoint: 'phone',
			deviceType: 'phone',
			orientation: 'portrait',
			columns: 1,
			supportsSplitPane: false,
		});
		expect(metrics.spacingScale).toBeLessThan(1);
		expect(metrics.typographyScale).toBeLessThan(1);
	});

	it('classifies tablets into split-pane capable layouts', () => {
		const metrics = resolveResponsiveMetrics(1024, 768);

		expectMetrics(metrics, {
			breakpoint: 'tablet',
			deviceType: 'tablet',
			orientation: 'landscape',
			columns: 2,
			supportsSplitPane: true,
		});
		expect(metrics.spacingScale).toBeGreaterThan(1);
		expect(metrics.layoutScale).toBeGreaterThan(1);
	});

	it('classifies wide layouts into a three-column breakpoint without inflating scales excessively', () => {
		const metrics = resolveResponsiveMetrics(1366, 1024);

		expectMetrics(metrics, {
			breakpoint: 'wide',
			deviceType: 'tablet',
			orientation: 'landscape',
			columns: 3,
			supportsSplitPane: true,
		});
		expect(metrics.spacingScale).toBeLessThanOrEqual(1.14);
		expect(metrics.typographyScale).toBeLessThanOrEqual(1.1);
	});

	it('scales values with a floor so touch targets never shrink below the minimum', () => {
		expect(scaleResponsiveValue(48, 0.9, 48)).toBe(48);
		expect(scaleResponsiveValue(48, 1.08, 48)).toBeGreaterThan(48);
	});
});
