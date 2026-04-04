/**
 * Simple debounce implementation for performance-critical actions.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return function (this: any, ...args: Parameters<T>) {
		if (timeout) clearTimeout(timeout);

		timeout = setTimeout(() => {
			func.apply(this, args);
		}, wait);
	};
}
