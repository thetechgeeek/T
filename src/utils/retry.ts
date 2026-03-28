interface RetryOptions {
	maxAttempts?: number;
	baseDelay?: number;
	shouldRetry?: (error: unknown) => boolean;
}

/**
 * Retry a promise-returning function with exponential back-off.
 * Only use for idempotent read operations — writes need explicit idempotency keys.
 */
export async function withRetry<T>(
	fn: () => Promise<T>,
	{ maxAttempts = 3, baseDelay = 1000, shouldRetry = () => true }: RetryOptions = {},
): Promise<T> {
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (e) {
			if (attempt === maxAttempts || !shouldRetry(e)) throw e;
			await new Promise((r) => setTimeout(r, baseDelay * 2 ** (attempt - 1)));
		}
	}
	// TypeScript requires this but it is unreachable
	throw new Error('withRetry: unreachable');
}
