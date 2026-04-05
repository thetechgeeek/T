/**
 * Retry utility for network operations with exponential backoff.
 */
export async function withRetry<T>(
	operation: () => Promise<T>,
	options: {
		retries?: number;
		delay?: number;
		factor?: number;
		shouldRetry?: (error: unknown) => boolean;
		_delayFn?: (ms: number) => Promise<void>;
	} = {},
): Promise<T> {
	const {
		retries = 3,
		delay = 1000,
		factor = 2,
		shouldRetry = (err: unknown) => {
			// Retry on network errors or specific Supabase errors that imply transient failure
			const msg = (err as Error)?.message?.toLowerCase() || '';
			return msg.includes('network') || msg.includes('fetch') || msg.includes('timeout');
		},
		_delayFn = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
	} = options;

	let lastError: unknown;
	let currentDelay = delay;

	let i = 0;
	while (true) {
		try {
			return await operation();
		} catch (error) {
			lastError = error;

			if (i < retries && shouldRetry(error)) {
				await _delayFn(currentDelay);
				currentDelay *= factor;
				i++;
			} else {
				throw lastError;
			}
		}
	}
}
