export type ErrorTranslator = (key: string, options?: Record<string, unknown>) => string;

export class AppError extends Error {
	constructor(
		message: string,
		public readonly code: string,
		public readonly userMessage: string,
		public readonly cause?: unknown,
		public readonly translationKey?: string,
		public readonly translationValues?: Record<string, unknown>,
	) {
		super(message);
		this.name = 'AppError';
		// Restore prototype chain (required for instanceof checks after TS transpilation)
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export class ValidationError extends AppError {
	constructor(
		message: string,
		public readonly fieldErrors: Record<string, string[]>,
	) {
		super(
			message,
			'VALIDATION_ERROR',
			'Please fix the highlighted fields',
			undefined,
			'error.app.validation',
		);
		this.name = 'ValidationError';
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export class NetworkError extends AppError {
	constructor(message: string, cause?: unknown) {
		super(
			message,
			'NETWORK_ERROR',
			'Network error. Please check your connection.',
			cause,
			'error.app.network',
		);
		this.name = 'NetworkError';
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export class InsufficientStockError extends AppError {
	constructor(
		public readonly itemName: string,
		public readonly available: number,
		public readonly requested: number,
	) {
		super(
			`Insufficient stock for "${itemName}": requested ${requested}, available ${available}`,
			'INSUFFICIENT_STOCK',
			`Not enough stock for "${itemName}". Available: ${available}, Requested: ${requested}`,
			undefined,
			'error.app.insufficientStock',
			{ itemName, available, requested },
		);
		this.name = 'InsufficientStockError';
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export class NotFoundError extends AppError {
	constructor(
		public readonly entity: string,
		public readonly id: string,
	) {
		super(
			`${entity} with id "${id}" not found`,
			'NOT_FOUND',
			`${entity} not found`,
			undefined,
			'error.app.notFound',
			{
				entity,
			},
		);
		this.name = 'NotFoundError';
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export class ConflictError extends AppError {
	constructor(
		message: string,
		public readonly userMessage: string,
		translationKey = 'error.app.conflict',
		translationValues?: Record<string, unknown>,
	) {
		super(message, 'CONFLICT', userMessage, undefined, translationKey, translationValues);
		this.name = 'ConflictError';
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export function toAppError(err: unknown): AppError {
	if (err instanceof AppError) return err;

	const errObj = err as { code?: string; message?: string; column?: string };
	const code = errObj?.code;
	const message = errObj?.message || String(err);

	// Handle Postgres/Supabase error codes (§17.1)
	switch (code) {
		case '23505': // Unique violation
			return new ConflictError(message, 'This record already exists');
		case '23503': // Foreign key violation
			return new AppError(
				message,
				'FK_VIOLATION',
				'This record is in use and cannot be modified',
				err,
				'error.app.foreignKey',
			);
		case '23502': // Not null violation
			return new ValidationError(message, { [errObj?.column || 'field']: ['isRequired'] });
		case '42501': // RLS violation
			return new AppError(
				message,
				'ACCESS_DENIED',
				'You do not have permission to view or change this record',
				err,
				'error.app.accessDenied',
			);
		case 'P0001': // custom Raise Exception from PL/pgSQL
			if (message.toLowerCase().includes('insufficient stock')) {
				return new AppError(
					message,
					'INSUFFICIENT_STOCK',
					'Not enough stock for the selected item.',
					err,
					'error.app.unexpected',
				);
			}
			if (message.toLowerCase().includes('not found')) {
				return new NotFoundError('Record', 'database');
			}
			return new ValidationError(message, { base: [message] });
		case 'PGRST116': // JSON object requested, but no rows returned (single() failure)
			return new NotFoundError('Record', 'requested');
		case 'PGRST204': // Column not found
		case 'PGRST205': // Table/Column missing from schema
		case '42703': // Undefined column
		case '42P01': // Undefined table
			return new AppError(
				message,
				code,
				'Database schema mismatch. Please contact support.',
				err,
				'error.app.schemaMismatch',
			);
	}

	if (err instanceof Error) {
		return new AppError(
			message,
			code || 'UNKNOWN',
			'An unexpected error occurred',
			err,
			'error.app.unexpected',
		);
	}
	return new AppError(
		message,
		code || 'UNKNOWN',
		'An unexpected error occurred',
		undefined,
		'error.app.unexpected',
	);
}

export function getErrorMessage(err: unknown, fallback = 'An unexpected error occurred'): string {
	if (err instanceof AppError) {
		return err.userMessage || err.message || fallback;
	}
	if (err instanceof Error) {
		return err.message || fallback;
	}
	if (typeof err === 'string') {
		return err || fallback;
	}
	const appError = toAppError(err);
	return appError.message || appError.userMessage || fallback;
}

export function getTranslatedErrorMessage(
	err: unknown,
	t: ErrorTranslator,
	fallback = 'An unexpected error occurred',
): string {
	const appError = err instanceof AppError ? err : toAppError(err);
	if (!appError.translationKey) {
		return appError.userMessage || appError.message || fallback;
	}

	return t(appError.translationKey, {
		...(appError.translationValues ?? {}),
		defaultValue: appError.userMessage || fallback,
	});
}
