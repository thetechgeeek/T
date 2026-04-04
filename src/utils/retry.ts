/**
 * Retry utility for network operations with exponential backoff.
 */
export async function withRetry<T>(
	operation: () => Promise<T>,
	options: {
		retries?: number;
		delay?: number;
		factor?: number;
		shouldRetry?: (error: any) => boolean;
	} = {},
): Promise<T> {
	const {
		retries = 3,
		delay = 1000,
		factor = 2,
		shouldRetry = (err) => {
			// Retry on network errors or specific Supabase errors that imply transient failure
			const msg = err?.message?.toLowerCase() || '';
			return msg.includes('network') || msg.includes('fetch') || msg.includes('timeout');
		},
	} = options;

	let lastError: any;
	let currentDelay = delay;

	for (let i = 0; i <= retries; i++) {
		try {
			return await operation();
		} catch (error) {
			lastError = error;

			if (i < retries && shouldRetry(error)) {
				await new Promise((resolve) => setTimeout(resolve, currentDelay));
				currentDelay *= factor;
				continue;
			}

			throw lastError;
		}
	}

	throw lastError;
}
