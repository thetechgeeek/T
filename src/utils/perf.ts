/**
 * Simple debounce implementation for performance-critical actions.
 */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeout: any = null;

	return function (this: any, ...args: Parameters<T>) {
		if (timeout) clearTimeout(timeout);

		timeout = setTimeout(() => {
			func.apply(this, args);
		}, wait);
	};
}
