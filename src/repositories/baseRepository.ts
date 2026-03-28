import { supabase } from '../config/supabase';
import { AppError } from '../errors';
import logger from '../utils/logger';
import type { UUID } from '../types/common';

export interface QueryOptions {
	filters?: Record<string, unknown>;
	sort?: { column: string; ascending: boolean };
	pagination?: { page: number; pageSize: number };
	/** Keyset cursor: ISO timestamp of the last item seen. Mutually exclusive with pagination. */
	cursor?: string;
	/** Page size when using cursor-based pagination. */
	cursorPageSize?: number;
	search?: { columns: string[]; term: string };
}

export interface PaginatedResult<T> {
	data: T[];
	total: number;
	/** ISO timestamp of the last item in this page — use as cursor for the next page. */
	nextCursor?: string;
}

/** Escape ILIKE special chars to prevent wildcard injection (§10.1) */
function escapeLike(term: string): string {
	return term.replace(/[%_\\]/g, (c) => `\\${c}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters(query: any, options: QueryOptions): any {
	const { filters, sort, pagination, search } = options;

	if (search?.term && search.columns.length > 0) {
		const escaped = escapeLike(search.term);
		const searchConditions = search.columns.map((col) => `${col}.ilike.%${escaped}%`).join(',');
		query = query.or(searchConditions);
	}

	if (filters) {
		for (const [key, value] of Object.entries(filters)) {
			if (value === undefined || value === null) continue;
			if (typeof value === 'object' && !Array.isArray(value)) {
				const rangeFilter = value as { gte?: unknown; lte?: unknown };
				if (rangeFilter.gte !== undefined) query = query.gte(key, rangeFilter.gte);
				if (rangeFilter.lte !== undefined) query = query.lte(key, rangeFilter.lte);
			} else {
				query = query.eq(key, value);
			}
		}
	}

	if (sort) {
		query = query.order(sort.column, { ascending: sort.ascending });
	}

	if (pagination) {
		const from = (pagination.page - 1) * pagination.pageSize;
		query = query.range(from, from + pagination.pageSize - 1);
	} else if (options.cursor) {
		// Keyset pagination: more efficient than OFFSET for deep pages
		query = query.lt('created_at', options.cursor).limit(options.cursorPageSize ?? 20);
	} else if (options.cursorPageSize && !options.cursor) {
		// First page of keyset pagination (no cursor yet)
		query = query.limit(options.cursorPageSize);
	}

	return query;
}

export function createRepository<T extends { id: UUID }>(tableName: string) {
	return {
		async findMany(options: QueryOptions = {}): Promise<PaginatedResult<T>> {
			const start = performance.now();
			const useCursor = !!(options.cursor !== undefined || options.cursorPageSize);
			let query = supabase
				.from(tableName)
				.select('*', { count: useCursor ? undefined : 'exact' });
			query = applyFilters(query, options);
			const { data, count, error } = await query;
			logger.info('db_query', {
				table: tableName,
				op: 'findMany',
				duration_ms: Math.round(performance.now() - start),
			});
			if (error) {
				throw new AppError(
					error.message,
					error.code ?? 'DB_ERROR',
					'Failed to fetch data',
					error,
				);
			}
			const rows = (data ?? []) as T[];
			const pageSize = options.cursorPageSize ?? 20;
			const nextCursor =
				useCursor && rows.length === pageSize
					? (rows[rows.length - 1] as unknown as { created_at: string }).created_at
					: undefined;
			return { data: rows, total: count ?? rows.length, nextCursor };
		},

		async findById(id: UUID): Promise<T> {
			const start = performance.now();
			const { data, error } = await supabase
				.from(tableName)
				.select('*')
				.eq('id', id)
				.single();
			logger.info('db_query', {
				table: tableName,
				op: 'findById',
				duration_ms: Math.round(performance.now() - start),
			});
			if (error) {
				throw new AppError(
					error.message,
					error.code ?? 'DB_ERROR',
					'Record not found',
					error,
				);
			}
			return data as T;
		},

		async create(payload: Partial<T>): Promise<T> {
			const start = performance.now();
			const { data, error } = await supabase
				.from(tableName)
				.insert(payload)
				.select()
				.single();
			logger.info('db_query', {
				table: tableName,
				op: 'create',
				duration_ms: Math.round(performance.now() - start),
			});
			if (error) {
				throw new AppError(
					error.message,
					error.code ?? 'DB_ERROR',
					'Failed to create record',
					error,
				);
			}
			return data as T;
		},

		async update(id: UUID, payload: Partial<T>): Promise<T> {
			const start = performance.now();
			const { data, error } = await supabase
				.from(tableName)
				.update(payload)
				.eq('id', id)
				.select()
				.single();
			logger.info('db_query', {
				table: tableName,
				op: 'update',
				duration_ms: Math.round(performance.now() - start),
			});
			if (error) {
				throw new AppError(
					error.message,
					error.code ?? 'DB_ERROR',
					'Failed to update record',
					error,
				);
			}
			return data as T;
		},

		async remove(id: UUID): Promise<void> {
			const start = performance.now();
			const { error } = await supabase.from(tableName).delete().eq('id', id);
			logger.info('db_query', {
				table: tableName,
				op: 'remove',
				duration_ms: Math.round(performance.now() - start),
			});
			if (error) {
				throw new AppError(
					error.message,
					error.code ?? 'DB_ERROR',
					'Failed to delete record',
					error,
				);
			}
		},

		async rpc<R>(fnName: string, params: Record<string, unknown>): Promise<R> {
			const start = performance.now();
			const { data, error } = await supabase.rpc(fnName, params);
			logger.info('db_query', {
				table: tableName,
				op: 'rpc',
				fn: fnName,
				duration_ms: Math.round(performance.now() - start),
			});
			if (error) {
				throw new AppError(
					error.message,
					error.code ?? 'RPC_ERROR',
					'Operation failed',
					error,
				);
			}
			return data as R;
		},
	};
}
