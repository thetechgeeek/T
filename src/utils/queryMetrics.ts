export const DEFAULT_SLOW_QUERY_THRESHOLD_MS = 500;
const P50_PERCENTILE = 50;
const P95_PERCENTILE = 95;

export interface QueryTimingInput {
	table: string;
	op: string;
	durationMs: number;
	context?: string;
	release?: string;
	slowThresholdMs?: number;
}

export interface QueryTimingBucket {
	table: string;
	op: string;
	context?: string;
	release?: string;
	count: number;
	p50Ms: number;
	p95Ms: number;
	maxMs: number;
	slowCount: number;
	slowThresholdMs: number;
}

const timings = new Map<string, number[]>();
const slowCounts = new Map<string, number>();
const thresholds = new Map<string, number>();
const metadata = new Map<string, Pick<QueryTimingBucket, 'context' | 'op' | 'release' | 'table'>>();

function buildKey(input: QueryTimingInput) {
	return [input.table, input.op, input.context ?? 'global', input.release ?? 'unreleased'].join(
		'::',
	);
}

function percentile(sortedValues: number[], percentileValue: number) {
	if (sortedValues.length === 0) return 0;
	const index = Math.ceil((percentileValue / 100) * sortedValues.length) - 1;
	return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
}

export function recordQueryTiming(input: QueryTimingInput): QueryTimingBucket {
	const key = buildKey(input);
	const durationMs = Math.max(0, Math.round(input.durationMs));
	const threshold = input.slowThresholdMs ?? DEFAULT_SLOW_QUERY_THRESHOLD_MS;
	const bucketTimings = timings.get(key) ?? [];
	bucketTimings.push(durationMs);
	timings.set(key, bucketTimings);
	thresholds.set(key, threshold);
	metadata.set(key, {
		table: input.table,
		op: input.op,
		context: input.context,
		release: input.release,
	});

	if (durationMs >= threshold) {
		slowCounts.set(key, (slowCounts.get(key) ?? 0) + 1);
	}

	return buildSnapshotBucket(key, bucketTimings);
}

export function getQueryTimingSnapshot(): QueryTimingBucket[] {
	return Array.from(timings.entries()).map(([key, values]) => buildSnapshotBucket(key, values));
}

export function resetQueryTimings() {
	timings.clear();
	slowCounts.clear();
	thresholds.clear();
	metadata.clear();
}

function buildSnapshotBucket(key: string, values: number[]): QueryTimingBucket {
	const sorted = [...values].sort((left, right) => left - right);
	const meta = metadata.get(key);
	const table = meta?.table ?? key.split('::')[0] ?? 'unknown';
	const op = meta?.op ?? key.split('::')[1] ?? 'unknown';

	return {
		table,
		op,
		context: meta?.context,
		release: meta?.release,
		count: sorted.length,
		p50Ms: percentile(sorted, P50_PERCENTILE),
		p95Ms: percentile(sorted, P95_PERCENTILE),
		maxMs: sorted[sorted.length - 1] ?? 0,
		slowCount: slowCounts.get(key) ?? 0,
		slowThresholdMs: thresholds.get(key) ?? DEFAULT_SLOW_QUERY_THRESHOLD_MS,
	};
}
