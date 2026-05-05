import {
	parseStockOpTypeRouteParam,
	parseUuidRouteParam,
} from '@/src/navigation/routeParamValidation';
import { allowExpectedConsoleWarn } from '@/__tests__/utils/runtimeNoise';

describe('routeParamValidation', () => {
	it('accepts valid UUID params', () => {
		expect(parseUuidRouteParam('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')).toBe(
			'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
		);
	});

	it('rejects malformed UUID params', () => {
		allowExpectedConsoleWarn(/\[WARN\] invalid_route_param/);
		expect(parseUuidRouteParam('../unsafe')).toBeNull();
	});

	it('rejects oversized route params', () => {
		allowExpectedConsoleWarn(/\[WARN\] invalid_route_param/);
		expect(parseUuidRouteParam('x'.repeat(129))).toBeNull();
	});

	it('accepts known stock operation types and rejects unknown values', () => {
		expect(parseStockOpTypeRouteParam('stock_in')).toBe('stock_in');
		allowExpectedConsoleWarn(/\[WARN\] invalid_route_param/);
		expect(parseStockOpTypeRouteParam('drop_table')).toBeNull();
	});
});
