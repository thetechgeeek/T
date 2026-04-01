import {
	AppError,
	ValidationError,
	NetworkError,
	InsufficientStockError,
	NotFoundError,
	ConflictError,
	toAppError,
} from './AppError';

describe('AppError', () => {
	it('sets message, code, userMessage, and name correctly', () => {
		const err = new AppError('Something broke', 'BROKEN', 'User-friendly message');
		expect(err).toBeInstanceOf(Error);
		expect(err).toBeInstanceOf(AppError);
		expect(err.message).toBe('Something broke');
		expect(err.code).toBe('BROKEN');
		expect(err.userMessage).toBe('User-friendly message');
		expect(err.name).toBe('AppError');
	});

	it('preserves cause when provided', () => {
		const cause = new Error('original');
		const err = new AppError('wrapper', 'CODE', 'user msg', cause);
		expect(err.cause).toBe(cause);
	});

	it('instanceof works after prototype chain fix', () => {
		const err = new AppError('msg', 'CODE', 'user');
		expect(err instanceof AppError).toBe(true);
		expect(err instanceof Error).toBe(true);
	});
});

describe('ValidationError', () => {
	it('sets name, code, fieldErrors correctly', () => {
		const fields = { email: ['Required'], phone: ['Invalid format'] };
		const err = new ValidationError('Validation failed', fields);
		expect(err.name).toBe('ValidationError');
		expect(err.code).toBe('VALIDATION_ERROR');
		expect(err.fieldErrors).toEqual(fields);
		expect(err.message).toBe('Validation failed');
	});

	it('instanceof AppError', () => {
		const err = new ValidationError('v', {});
		expect(err instanceof AppError).toBe(true);
		expect(err instanceof ValidationError).toBe(true);
	});
});

describe('NetworkError', () => {
	it('sets name and code to NETWORK_ERROR', () => {
		const err = new NetworkError('Connection refused');
		expect(err.name).toBe('NetworkError');
		expect(err.code).toBe('NETWORK_ERROR');
		expect(err.message).toBe('Connection refused');
	});

	it('instanceof AppError', () => {
		const err = new NetworkError('timeout');
		expect(err instanceof AppError).toBe(true);
		expect(err instanceof NetworkError).toBe(true);
	});

	it('stores cause when provided', () => {
		const cause = { status: 0 };
		const err = new NetworkError('net err', cause);
		expect(err.cause).toBe(cause);
	});
});

describe('InsufficientStockError', () => {
	it('builds descriptive message from item/available/requested', () => {
		const err = new InsufficientStockError('Marble Tile', 5, 20);
		expect(err.name).toBe('InsufficientStockError');
		expect(err.code).toBe('INSUFFICIENT_STOCK');
		expect(err.itemName).toBe('Marble Tile');
		expect(err.available).toBe(5);
		expect(err.requested).toBe(20);
		expect(err.message).toContain('Marble Tile');
		expect(err.message).toContain('5');
		expect(err.message).toContain('20');
	});

	it('instanceof AppError', () => {
		const err = new InsufficientStockError('x', 0, 1);
		expect(err instanceof AppError).toBe(true);
	});
});

describe('NotFoundError', () => {
	it('builds message from entity and id', () => {
		const err = new NotFoundError('Invoice', 'inv-123');
		expect(err.name).toBe('NotFoundError');
		expect(err.code).toBe('NOT_FOUND');
		expect(err.entity).toBe('Invoice');
		expect(err.id).toBe('inv-123');
		expect(err.message).toContain('Invoice');
		expect(err.message).toContain('inv-123');
	});
});

describe('ConflictError', () => {
	it('sets name, code, and userMessage', () => {
		const err = new ConflictError('Duplicate entry', 'This already exists');
		expect(err.name).toBe('ConflictError');
		expect(err.code).toBe('CONFLICT');
		expect(err.message).toBe('Duplicate entry');
		expect(err.userMessage).toBe('This already exists');
	});
});

describe('toAppError', () => {
	it('returns AppError unchanged if already an AppError', () => {
		const original = new AppError('msg', 'CODE', 'user');
		expect(toAppError(original)).toBe(original);
	});

	it('wraps a plain Error into AppError with UNKNOWN code', () => {
		const plain = new Error('plain error');
		const wrapped = toAppError(plain);
		expect(wrapped).toBeInstanceOf(AppError);
		expect(wrapped.code).toBe('UNKNOWN');
		expect(wrapped.message).toBe('plain error');
		expect(wrapped.cause).toBe(plain);
	});

	it('wraps a string into AppError', () => {
		const wrapped = toAppError('something bad');
		expect(wrapped).toBeInstanceOf(AppError);
		expect(wrapped.message).toBe('something bad');
		expect(wrapped.code).toBe('UNKNOWN');
	});

	it('wraps an unknown non-Error object into AppError', () => {
		const wrapped = toAppError({ weird: true });
		expect(wrapped).toBeInstanceOf(AppError);
		expect(wrapped.code).toBe('UNKNOWN');
	});
});
