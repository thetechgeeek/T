import { withRetry } from '@/src/utils/retry';

describe('Offline Resilience: Retry Utility', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('should retry failed operations with exponential backoff', async () => {
		const operation = jest
			.fn()
			.mockRejectedValueOnce(new Error('Network error'))
			.mockRejectedValueOnce(new Error('Network error'))
			.mockResolvedValueOnce('success');

		const promise = withRetry(operation, { retries: 2, delay: 100 });

		// Run through all retries
		for (let i = 0; i < 3; i++) {
			await Promise.resolve(); // Allow the operation to throw
			jest.runAllTimers(); // Trigger the setTimeout in withRetry
		}

		const result = await promise;
		expect(result).toBe('success');
		expect(operation).toHaveBeenCalledTimes(3);
	});

	it('should throw after exceeding max retries', async () => {
		const operation = jest.fn().mockRejectedValue(new Error('Network error'));

		const promise = withRetry(operation, { retries: 2, delay: 100 });

		// Advance through all retries
		for (let i = 0; i < 3; i++) {
			await Promise.resolve();
			jest.advanceTimersByTime(1000); // overkill to ensure all pass
		}

		await expect(promise).rejects.toThrow('Network error');
		expect(operation).toHaveBeenCalledTimes(3);
	});

	it('should NOT retry on non-network errors', async () => {
		const operation = jest.fn().mockRejectedValue(new Error('Database error'));

		const promise = withRetry(operation, { retries: 2, delay: 100 });

		await expect(promise).rejects.toThrow('Database error');
		expect(operation).toHaveBeenCalledTimes(1);
	});
});
