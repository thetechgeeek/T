import logger from './logger';

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
			(global as any).__DEV__ = true;
			logger.debug('test debug', { key: 'val' });
			expect(debugSpy).toHaveBeenCalledWith('[DEBUG] test debug', { key: 'val' });
		});

		it('does NOT call console.debug in production (__DEV__ = false)', () => {
			(global as any).__DEV__ = false;
			logger.debug('should be silent');
			expect(debugSpy).not.toHaveBeenCalled();
			(global as any).__DEV__ = true; // restore
		});
	});

	describe('info()', () => {
		it('calls console.info in __DEV__ mode', () => {
			(global as any).__DEV__ = true;
			logger.info('test info');
			expect(infoSpy).toHaveBeenCalledWith('[INFO] test info', undefined);
		});

		it('does NOT call console.info in production', () => {
			(global as any).__DEV__ = false;
			logger.info('silent info');
			expect(infoSpy).not.toHaveBeenCalled();
			(global as any).__DEV__ = true;
		});

		it('includes metadata in info call', () => {
			(global as any).__DEV__ = true;
			logger.info('db_query', { table: 'invoices', duration_ms: 12 });
			expect(infoSpy).toHaveBeenCalledWith('[INFO] db_query', {
				table: 'invoices',
				duration_ms: 12,
			});
		});
	});

	describe('warn()', () => {
		it('always calls console.warn regardless of __DEV__', () => {
			(global as any).__DEV__ = false;
			logger.warn('important warning');
			expect(warnSpy).toHaveBeenCalledWith('[WARN] important warning', undefined);
			(global as any).__DEV__ = true;
		});

		it('calls console.warn in __DEV__ mode too', () => {
			logger.warn('dev warning', { context: 'test' });
			expect(warnSpy).toHaveBeenCalledWith('[WARN] dev warning', { context: 'test' });
		});
	});

	describe('error()', () => {
		it('always calls console.error regardless of __DEV__', () => {
			(global as any).__DEV__ = false;
			const err = new Error('something broke');
			logger.error('critical error', err);
			expect(errorSpy).toHaveBeenCalledWith('[ERROR] critical error', err, undefined);
			(global as any).__DEV__ = true;
		});

		it('calls console.error in __DEV__ mode', () => {
			const err = new Error('test error');
			logger.error('error occurred', err, { userId: '123' });
			expect(errorSpy).toHaveBeenCalledWith('[ERROR] error occurred', err, { userId: '123' });
		});

		it('handles undefined error gracefully', () => {
			expect(() => logger.error('no error object')).not.toThrow();
			expect(errorSpy).toHaveBeenCalled();
		});
	});

	describe('message format', () => {
		it('debug messages include [DEBUG] prefix', () => {
			(global as any).__DEV__ = true;
			logger.debug('my message');
			expect(debugSpy.mock.calls[0][0]).toMatch(/^\[DEBUG\]/);
		});

		it('info messages include [INFO] prefix', () => {
			logger.info('my message');
			expect(infoSpy.mock.calls[0][0]).toMatch(/^\[INFO\]/);
		});

		it('warn messages include [WARN] prefix', () => {
			logger.warn('my message');
			expect(warnSpy.mock.calls[0][0]).toMatch(/^\[WARN\]/);
		});

		it('error messages include [ERROR] prefix', () => {
			logger.error('my message');
			expect(errorSpy.mock.calls[0][0]).toMatch(/^\[ERROR\]/);
		});
	});
});
