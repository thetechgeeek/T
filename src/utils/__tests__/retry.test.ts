import { withRetry } from '../retry';

describe.skip('withRetry', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('returns result on first success', async () => {
		const fn = jest.fn().mockResolvedValue('ok');
		const result = await withRetry(fn);
		expect(result).toBe('ok');
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('retries and succeeds on second attempt', async () => {
		const fn = jest
			.fn()
			.mockRejectedValueOnce(new Error('network error'))
			.mockResolvedValueOnce('ok');

		const promise = withRetry(fn, { retries: 2, delay: 100 });

		// Advance past first delay
		await Promise.resolve(); // Allow fn to call
		jest.advanceTimersByTime(101);

		const result = await promise;
		expect(result).toBe('ok');
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it('throws after max attempts exceeded', async () => {
		const fn = jest.fn().mockRejectedValue(new Error('network error'));

		const promise = withRetry(fn, { retries: 2, delay: 100 });

		// Advance past all delays
		for (let i = 0; i < 2; i++) {
			await Promise.resolve();
			jest.advanceTimersByTime(101);
		}

		await expect(promise).rejects.toThrow('network error');
		expect(fn).toHaveBeenCalledTimes(3);
	});

	it('does not retry when shouldRetry returns false', async () => {
		const fn = jest.fn().mockRejectedValue(new Error('network error'));
		await expect(withRetry(fn, { retries: 2, shouldRetry: () => false })).rejects.toThrow(
			'network error',
		);
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('maxAttempts = 1: calls fn exactly once and rejects with original error', async () => {
		const error = new Error('network error');
		const fn = jest.fn().mockRejectedValue(error);
		await expect(withRetry(fn, { retries: 0 })).rejects.toThrow('network error');
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('success on third attempt: fn called 3 times, resolves correctly', async () => {
		const fn = jest
			.fn()
			.mockRejectedValueOnce(new Error('network first'))
			.mockRejectedValueOnce(new Error('network second'))
			.mockResolvedValueOnce('success');

		const promise = withRetry(fn, { retries: 2, delay: 10 });
		await jest.runAllTimersAsync();
		await expect(promise).resolves.toBe('success');
		expect(fn).toHaveBeenCalledTimes(3);
	});

	it('baseDelay is respected: second attempt fires after baseDelay ms', async () => {
		const fn = jest.fn().mockRejectedValue(new Error('fail'));
		const promise = withRetry(fn, { retries: 1, delay: 100 });

		// After first attempt fails, second attempt should not start before 100ms
		await Promise.resolve(); // flush microtasks
		expect(fn).toHaveBeenCalledTimes(1);

		jest.advanceTimersByTime(99);
		await Promise.resolve();
		expect(fn).toHaveBeenCalledTimes(1);

		jest.advanceTimersByTime(1); // total 100ms
		await Promise.resolve();
		expect(fn).toHaveBeenCalledTimes(2);

		// Drain the rejection
		await expect(promise).rejects.toThrow('fail');
	});
});
