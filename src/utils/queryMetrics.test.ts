import {
	DEFAULT_SLOW_QUERY_THRESHOLD_MS,
	getQueryTimingSnapshot,
	recordQueryTiming,
	resetQueryTimings,
} from './queryMetrics';

describe('queryMetrics', () => {
	beforeEach(() => {
		resetQueryTimings();
	});

	it('records p50, p95, max, count, and slow query counts by table/op/context', () => {
		recordQueryTiming({
			table: 'invoices',
			op: 'findMany',
			context: 'invoice-list',
			durationMs: 10,
		});
		recordQueryTiming({
			table: 'invoices',
			op: 'findMany',
			context: 'invoice-list',
			durationMs: 25,
		});
		recordQueryTiming({
			table: 'invoices',
			op: 'findMany',
			context: 'invoice-list',
			durationMs: 600,
		});

		expect(getQueryTimingSnapshot()).toEqual([
			expect.objectContaining({
				table: 'invoices',
				op: 'findMany',
				context: 'invoice-list',
				count: 3,
				p50Ms: 25,
				p95Ms: 600,
				maxMs: 600,
				slowCount: 1,
				slowThresholdMs: DEFAULT_SLOW_QUERY_THRESHOLD_MS,
			}),
		]);
	});

	it('separates metrics when the release tag changes', () => {
		recordQueryTiming({
			table: 'customers',
			op: 'findMany',
			release: '1.0.0',
			durationMs: 100,
		});
		recordQueryTiming({
			table: 'customers',
			op: 'findMany',
			release: '1.0.1',
			durationMs: 200,
		});

		expect(getQueryTimingSnapshot()).toHaveLength(2);
	});

	it('returns an empty snapshot before any timings are recorded', () => {
		expect(getQueryTimingSnapshot()).toEqual([]);
	});

	it('clamps negative durations and uses default metadata when context is omitted', () => {
		const bucket = recordQueryTiming({
			table: 'payments',
			op: 'create',
			durationMs: -12,
		});

		expect(bucket).toEqual(
			expect.objectContaining({
				table: 'payments',
				op: 'create',
				context: undefined,
				release: undefined,
				count: 1,
				p50Ms: 0,
				p95Ms: 0,
				maxMs: 0,
				slowCount: 0,
				slowThresholdMs: DEFAULT_SLOW_QUERY_THRESHOLD_MS,
			}),
		);
	});

	it('uses custom slow-query thresholds per bucket', () => {
		recordQueryTiming({
			table: 'inventory_items',
			op: 'findMany',
			durationMs: 80,
			slowThresholdMs: 100,
		});
		recordQueryTiming({
			table: 'inventory_items',
			op: 'findMany',
			durationMs: 100,
			slowThresholdMs: 100,
		});

		expect(getQueryTimingSnapshot()).toEqual([
			expect.objectContaining({
				count: 2,
				slowCount: 1,
				slowThresholdMs: 100,
			}),
		]);
	});
});
