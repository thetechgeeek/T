import logger, { redactLogMeta } from './logger';
import {
	allowExpectedConsoleError,
	allowExpectedConsoleWarn,
} from '@/__tests__/utils/runtimeNoise';

describe('logger', () => {
	let debugSpy: jest.SpyInstance;
	let infoSpy: jest.SpyInstance;
	let warnSpy: jest.SpyInstance;
	let errorSpy: jest.SpyInstance;

	beforeEach(() => {
		debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
		infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
		warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
		errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('debug()', () => {
		it('calls console.debug in __DEV__ mode', () => {
			(global as unknown as { __DEV__: boolean }).__DEV__ = true;
			logger.debug('test debug', { key: 'val' });
			expect(debugSpy).toHaveBeenCalledWith('[DEBUG] test debug', { key: 'val' });
		});

		it('does NOT call console.debug in production (__DEV__ = false)', () => {
			(global as unknown as { __DEV__: boolean }).__DEV__ = false;
			logger.debug('should be silent');
			expect(debugSpy).not.toHaveBeenCalled();
			(global as unknown as { __DEV__: boolean }).__DEV__ = true; // restore
		});
	});

	describe('info()', () => {
		it('calls console.info in __DEV__ mode', () => {
			(global as unknown as { __DEV__: boolean }).__DEV__ = true;
			logger.info('test info');
			expect(infoSpy).toHaveBeenCalledWith('[INFO] test info', undefined);
		});

		it('does NOT call console.info in production', () => {
			(global as unknown as { __DEV__: boolean }).__DEV__ = false;
			logger.info('silent info');
			expect(infoSpy).not.toHaveBeenCalled();
			(global as unknown as { __DEV__: boolean }).__DEV__ = true;
		});

		it('includes metadata in info call', () => {
			(global as unknown as { __DEV__: boolean }).__DEV__ = true;
			logger.info('db_query', { table: 'invoices', duration_ms: 12 });
			expect(infoSpy).toHaveBeenCalledWith('[INFO] db_query', {
				table: 'invoices',
				duration_ms: 12,
			});
		});

		it('redacts sensitive metadata before logging', () => {
			(global as unknown as { __DEV__: boolean }).__DEV__ = true;
			logger.info('customer_update', {
				phone: '+91 98765 43210',
				gstin: '27ABCDE1234F1Z5',
				nested: { access_token: 'secret-token', count: 2 },
			});

			expect(infoSpy).toHaveBeenCalledWith('[INFO] customer_update', {
				phone: '[REDACTED]',
				gstin: '[REDACTED]',
				nested: { access_token: '[REDACTED]', count: 2 },
			});
		});
	});

	describe('warn()', () => {
		it('always calls console.warn regardless of __DEV__', () => {
			allowExpectedConsoleWarn('[WARN] important warning');
			(global as unknown as { __DEV__: boolean }).__DEV__ = false;
			logger.warn('important warning');
			expect(warnSpy).toHaveBeenCalledWith('[WARN] important warning', undefined);
			(global as unknown as { __DEV__: boolean }).__DEV__ = true;
		});

		it('calls console.warn in __DEV__ mode too', () => {
			allowExpectedConsoleWarn('[WARN] dev warning');
			logger.warn('dev warning', { context: 'test' });
			expect(warnSpy).toHaveBeenCalledWith('[WARN] dev warning', { context: 'test' });
		});
	});

	describe('error()', () => {
		it('always calls console.error regardless of __DEV__', () => {
			allowExpectedConsoleError('[ERROR] critical error');
			(global as unknown as { __DEV__: boolean }).__DEV__ = false;
			const err = new Error('something broke');
			logger.error('critical error', err);
			expect(errorSpy).toHaveBeenCalledWith('[ERROR] critical error', err, undefined);
			(global as unknown as { __DEV__: boolean }).__DEV__ = true;
		});

		it('calls console.error in __DEV__ mode', () => {
			allowExpectedConsoleError('[ERROR] error occurred');
			const err = new Error('test error');
			logger.error('error occurred', err, { userId: '123' });
			expect(errorSpy).toHaveBeenCalledWith('[ERROR] error occurred', err, { userId: '123' });
		});

		it('handles undefined error gracefully', () => {
			allowExpectedConsoleError('[ERROR] no error object');
			expect(() => logger.error('no error object')).not.toThrow();
			expect(errorSpy).toHaveBeenCalled();
		});

		it('redacts PII from error messages and metadata', () => {
			allowExpectedConsoleError('[ERROR] pii error');
			const err = new Error('Failed for +91 98765 43210');
			logger.error('pii error', err, { authorization: 'Bearer abc.def.ghi' });

			const redactedError = errorSpy.mock.calls[0][1] as Error;
			expect(redactedError.message).toBe('Failed for [REDACTED]');
			expect(errorSpy).toHaveBeenCalledWith('[ERROR] pii error', redactedError, {
				authorization: '[REDACTED]',
			});
		});
	});

	describe('redactLogMeta()', () => {
		it('redacts nested arrays without mutating safe metadata', () => {
			expect(
				redactLogMeta({
					safe: 'invoice-list',
					items: [{ customer_name: 'John Doe' }, { value: 'GSTIN 27ABCDE1234F1Z5' }],
				}),
			).toEqual({
				safe: 'invoice-list',
				items: [{ customer_name: '[REDACTED]' }, { value: 'GSTIN [REDACTED]' }],
			});
		});
	});

	describe('message format', () => {
		it('debug messages include [DEBUG] prefix', () => {
			(global as unknown as { __DEV__: boolean }).__DEV__ = true;
			logger.debug('my message');
			expect(debugSpy.mock.calls[0][0]).toMatch(/^\[DEBUG\]/);
		});

		it('info messages include [INFO] prefix', () => {
			logger.info('my message');
			expect(infoSpy.mock.calls[0][0]).toMatch(/^\[INFO\]/);
		});

		it('warn messages include [WARN] prefix', () => {
			allowExpectedConsoleWarn('[WARN] my message');
			logger.warn('my message');
			expect(warnSpy.mock.calls[0][0]).toMatch(/^\[WARN\]/);
		});

		it('error messages include [ERROR] prefix', () => {
			allowExpectedConsoleError('[ERROR] my message');
			logger.error('my message');
			expect(errorSpy.mock.calls[0][0]).toMatch(/^\[ERROR\]/);
		});
	});
});
