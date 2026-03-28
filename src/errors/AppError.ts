export class AppError extends Error {
	constructor(
		message: string,
		public readonly code: string,
		public readonly userMessage: string,
		public readonly cause?: unknown,
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
		super(message, 'VALIDATION_ERROR', 'Please fix the highlighted fields');
		this.name = 'ValidationError';
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export class NetworkError extends AppError {
	constructor(message: string, cause?: unknown) {
		super(message, 'NETWORK_ERROR', 'Network error. Please check your connection.', cause);
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
		super(`${entity} with id "${id}" not found`, 'NOT_FOUND', `${entity} not found`);
		this.name = 'NotFoundError';
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export class ConflictError extends AppError {
	constructor(
		message: string,
		public readonly userMessage: string,
	) {
		super(message, 'CONFLICT', userMessage);
		this.name = 'ConflictError';
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export function toAppError(err: unknown): AppError {
	if (err instanceof AppError) return err;
	if (err instanceof Error) {
		return new AppError(err.message, 'UNKNOWN', 'An unexpected error occurred', err);
	}
	return new AppError(String(err), 'UNKNOWN', 'An unexpected error occurred');
}
