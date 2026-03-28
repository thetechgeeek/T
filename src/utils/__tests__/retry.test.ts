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
});
