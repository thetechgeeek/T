import logger from '@/src/utils/logger';

export const STARTUP_CRITICAL_CALL_BUDGET = 2;
export const STARTUP_DEFERRED_CALL_BUDGET = 3;
export const STARTUP_RESUME_WARMUP_TTL_MS = 60_000;

export type StartupWarmupPhase = 'critical' | 'deferred';

export interface StartupWarmupMetric {
	phase: StartupWarmupPhase;
	calls: number;
	durationMs: number;
	source: 'mount' | 'foreground';
	overBudget: boolean;
}

export function shouldRunStartupWarmup(
	lastRunAt: number | null,
	now = Date.now(),
	ttlMs = STARTUP_RESUME_WARMUP_TTL_MS,
) {
	return lastRunAt === null || now - lastRunAt >= ttlMs;
}

export async function measureStartupWarmup(
	phase: StartupWarmupPhase,
	source: StartupWarmupMetric['source'],
	calls: number,
	work: () => Promise<unknown>,
): Promise<StartupWarmupMetric> {
	const startedAt = performance.now();
	await work();
	const durationMs = Math.round(performance.now() - startedAt);
	const budget =
		phase === 'critical' ? STARTUP_CRITICAL_CALL_BUDGET : STARTUP_DEFERRED_CALL_BUDGET;
	const metric: StartupWarmupMetric = {
		phase,
		calls,
		durationMs,
		source,
		overBudget: calls > budget,
	};

	logger.info('startup_warmup', {
		phase,
		source,
		calls,
		budget,
		duration_ms: durationMs,
		over_budget: metric.overBudget,
	});

	return metric;
}
