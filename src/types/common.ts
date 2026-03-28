// Common shared types across the application

export type UUID = string;

export interface Timestamps {
	created_at: string;
	updated_at: string;
}

export interface PaginationState {
	page: number;
	pageSize: number;
	hasMore: boolean;
	total?: number;
}

export interface ApiError {
	message: string;
	code?: string;
	details?: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface QueryFilters {
	search?: string;
	limit?: number;
	offset?: number;
}
