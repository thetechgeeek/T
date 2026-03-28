import { supabase } from '../config/supabase';
import { AppError } from '../errors';
import logger from '../utils/logger';
import type { UUID } from '../types/common';

export interface QueryOptions {
	filters?: Record<string, unknown>;
	sort?: { column: string; ascending: boolean };
	pagination?: { page: number; pageSize: number };
	search?: { columns: string[]; term: string };
}

export interface PaginatedResult<T> {
	data: T[];
	total: number;
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
	}

	return query;
}

export function createRepository<T extends { id: UUID }>(tableName: string) {
	return {
		async findMany(options: QueryOptions = {}): Promise<PaginatedResult<T>> {
			const start = performance.now();
			let query = supabase.from(tableName).select('*', { count: 'exact' });
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
			return { data: (data ?? []) as T[], total: count ?? 0 };
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
			const { data, error } = await supabase
				.from(tableName)
				.insert(payload)
				.select()
				.single();
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
			const { data, error } = await supabase
				.from(tableName)
				.update(payload)
				.eq('id', id)
				.select()
				.single();
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
			const { error } = await supabase.from(tableName).delete().eq('id', id);
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
			const { data, error } = await supabase.rpc(fnName, params);
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
