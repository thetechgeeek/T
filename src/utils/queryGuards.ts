import { AppError } from '@/src/errors/AppError';

export const DEFAULT_MAX_PAGE_SIZE = 100;

export function normalizePage(page: number) {
	if (!Number.isFinite(page) || page < 1) return 1;
	return Math.floor(page);
}

export function normalizePageSize(pageSize: number, maxPageSize = DEFAULT_MAX_PAGE_SIZE) {
	if (!Number.isFinite(pageSize) || pageSize < 1) return 20;
	return Math.min(Math.floor(pageSize), maxPageSize);
}

export function resolveSortField<T extends string>(
	requested: T | undefined,
	allowedFields: readonly T[],
	fallback: T,
) {
	if (!requested) return fallback;
	if (allowedFields.includes(requested)) return requested;
	throw new AppError(
		`Unsupported sort field: ${requested}`,
		'INVALID_SORT_FIELD',
		'This list cannot be sorted by that field.',
	);
}
