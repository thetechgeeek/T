import { withRetry } from '../retry';

describe('withRetry', () => {
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
		const fn = jest.fn().mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce('ok');

		const promise = withRetry(fn, { maxAttempts: 3, baseDelay: 100 });
		// Fast-forward timer for the retry delay
		jest.runAllTimersAsync();
		const result = await promise;
		expect(result).toBe('ok');
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it('throws after max attempts exceeded', async () => {
		const fn = jest.fn().mockRejectedValue(new Error('persistent error'));

		const promise = withRetry(fn, { maxAttempts: 3, baseDelay: 100 });
		jest.runAllTimersAsync();
		await expect(promise).rejects.toThrow('persistent error');
		expect(fn).toHaveBeenCalledTimes(3);
	});

	it('does not retry when shouldRetry returns false', async () => {
		const fn = jest.fn().mockRejectedValue(new Error('no retry'));
		await expect(withRetry(fn, { maxAttempts: 3, shouldRetry: () => false })).rejects.toThrow(
			'no retry',
		);
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('maxAttempts = 1: calls fn exactly once and rejects with original error', async () => {
		const error = new Error('fail');
		const fn = jest.fn().mockRejectedValue(error);
		await expect(withRetry(fn, { maxAttempts: 1 })).rejects.toThrow('fail');
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('success on third attempt: fn called 3 times, resolves correctly', async () => {
		const fn = jest
			.fn()
			.mockRejectedValueOnce(new Error('first'))
			.mockRejectedValueOnce(new Error('second'))
			.mockResolvedValueOnce('success');

		const promise = withRetry(fn, { maxAttempts: 3, baseDelay: 10 });
		jest.runAllTimersAsync();
		await expect(promise).resolves.toBe('success');
		expect(fn).toHaveBeenCalledTimes(3);
	});

	it('baseDelay is respected: second attempt fires after baseDelay ms', async () => {
		const fn = jest.fn().mockRejectedValue(new Error('fail'));
		const promise = withRetry(fn, { maxAttempts: 2, baseDelay: 100 });

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
