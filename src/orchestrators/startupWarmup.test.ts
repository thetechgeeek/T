import {
	STARTUP_RESUME_WARMUP_TTL_MS,
	measureStartupWarmup,
	shouldRunStartupWarmup,
} from './startupWarmup';
import logger from '@/src/utils/logger';

jest.mock('@/src/utils/logger', () => ({
	__esModule: true,
	default: {
		info: jest.fn(),
	},
}));

describe('startupWarmup', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('runs when there is no prior warmup timestamp', () => {
		expect(shouldRunStartupWarmup(null, 1000)).toBe(true);
	});

	it('skips foreground warmup inside the resume TTL', () => {
		expect(shouldRunStartupWarmup(1000, 1000 + STARTUP_RESUME_WARMUP_TTL_MS - 1)).toBe(false);
	});

	it('runs foreground warmup after the resume TTL expires', () => {
		expect(shouldRunStartupWarmup(1000, 1000 + STARTUP_RESUME_WARMUP_TTL_MS)).toBe(true);
	});

	it('logs call count, duration, source, and budget state', async () => {
		const metric = await measureStartupWarmup('critical', 'mount', 2, async () => undefined);

		expect(metric).toMatchObject({
			phase: 'critical',
			source: 'mount',
			calls: 2,
			overBudget: false,
		});
		expect(logger.info).toHaveBeenCalledWith(
			'startup_warmup',
			expect.objectContaining({
				phase: 'critical',
				source: 'mount',
				calls: 2,
				budget: 2,
				over_budget: false,
			}),
		);
	});
});
