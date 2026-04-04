import { supabase as defaultClient } from '../config/supabase';
import { toAppError } from '../errors';
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

/** Minimal structural type covering all PostgREST query builder methods we call. */
interface QueryBuilder {
	or(conditions: string): this;
	eq(column: string, value: unknown): this;
	gte(column: string, value: unknown): this;
	lte(column: string, value: unknown): this;
	lt(column: string, value: unknown): this;
	order(column: string, options: { ascending: boolean }): this;
	range(from: number, to: number): this;
	limit(count: number): this;
}

function applyFilters<Q extends QueryBuilder>(query: Q, options: QueryOptions): Q {
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

/**
 * Access the supabase client lazily to ensure we catch the latest mocked version
 * during tests, falling back to an empty object if uninitialized.
 */
function getClient() {
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const mod = require('../config/supabase');
		return mod.supabase || defaultClient || ({} as Record<string, unknown>);
	} catch {
		return defaultClient || ({} as Record<string, unknown>);
	}
}

export function createRepository<T extends { id: UUID }>(tableName: string) {
	return {
		async findMany(options: QueryOptions = {}): Promise<PaginatedResult<T>> {
			const start = performance.now();
			const useCursor = !!(options.cursor !== undefined || options.cursorPageSize);
			const supabase = getClient();
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
			if (error) throw toAppError(error);
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
			const supabase = getClient();
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
			if (error) throw toAppError(error);
			return data as T;
		},

		async create(payload: Partial<T>): Promise<T> {
			const start = performance.now();
			const supabase = getClient();
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
			if (error) throw toAppError(error);
			return data as T;
		},

		async update(id: UUID, payload: Partial<T>): Promise<T> {
			const start = performance.now();
			const supabase = getClient();
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
			if (error) throw toAppError(error);
			return data as T;
		},

		async remove(id: UUID): Promise<void> {
			const start = performance.now();
			const supabase = getClient();
			const { error } = await supabase.from(tableName).delete().eq('id', id);
			logger.info('db_query', {
				table: tableName,
				op: 'remove',
				duration_ms: Math.round(performance.now() - start),
			});
			if (error) throw toAppError(error);
		},

		async rpc<R>(fnName: string, params: Record<string, unknown>): Promise<R> {
			const start = performance.now();
			const supabase = getClient();
			const { data, error } = await supabase.rpc(fnName, params);
			logger.info('db_query', {
				table: tableName,
				op: 'rpc',
				fn: fnName,
				duration_ms: Math.round(performance.now() - start),
			});
			if (error) throw toAppError(error);
			return data as R;
		},
	};
}
