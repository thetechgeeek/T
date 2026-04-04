import { withRetry } from '../retry';

describe('withRetry', () => {
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

		const _delayFn = jest.fn().mockResolvedValue(undefined);
		const result = await withRetry(fn, { retries: 2, delay: 100, _delayFn });

		expect(result).toBe('ok');
		expect(fn).toHaveBeenCalledTimes(2);
		expect(_delayFn).toHaveBeenCalledWith(100);
	});

	it('throws after max attempts exceeded', async () => {
		const fn = jest.fn().mockRejectedValue(new Error('network error'));
		const _delayFn = jest.fn().mockResolvedValue(undefined);

		await expect(withRetry(fn, { retries: 2, delay: 100, _delayFn })).rejects.toThrow(
			'network error',
		);
		expect(fn).toHaveBeenCalledTimes(3);
		expect(_delayFn).toHaveBeenCalledTimes(2);
	});

	it('does not retry when shouldRetry returns false', async () => {
		const fn = jest.fn().mockRejectedValue(new Error('no retry error'));
		const _delayFn = jest.fn().mockResolvedValue(undefined);

		await expect(withRetry(fn, { retries: 2, shouldRetry: () => false, _delayFn })).rejects.toThrow(
			'no retry error',
		);
		expect(fn).toHaveBeenCalledTimes(1);
		expect(_delayFn).not.toHaveBeenCalled();
	});

	it('respects exponential backoff delay (factor 2)', async () => {
		const fn = jest
			.fn()
			.mockRejectedValueOnce(new Error('network 1'))
			.mockRejectedValueOnce(new Error('network 2'))
			.mockResolvedValueOnce('ok');

		const _delayFn = jest.fn().mockResolvedValue(undefined);
		await withRetry(fn, { retries: 2, delay: 100, factor: 2, _delayFn });

		expect(_delayFn).toHaveBeenCalledWith(100);
		expect(_delayFn).toHaveBeenCalledWith(200);
	});

	it('respects custom factor for backoff', async () => {
		const fn = jest
			.fn()
			.mockRejectedValueOnce(new Error('network 1'))
			.mockRejectedValueOnce(new Error('network 2'))
			.mockResolvedValueOnce('ok');

		const _delayFn = jest.fn().mockResolvedValue(undefined);
		await withRetry(fn, { retries: 2, delay: 100, factor: 3, _delayFn });

		expect(_delayFn).toHaveBeenCalledWith(100);
		expect(_delayFn).toHaveBeenCalledWith(300);
	});
});
