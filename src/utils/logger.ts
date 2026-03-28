interface LogMeta {
	[key: string]: unknown;
}

/**
 * Structured logger. In production, swap console.* with a real sink (Sentry, Datadog, etc.).
 * Only debug/info logs are shown in development (__DEV__ guard).
 */
const logger = {
	debug(msg: string, meta?: LogMeta) {
		if (__DEV__) console.debug(`[DEBUG] ${msg}`, meta);
	},

	info(msg: string, meta?: LogMeta) {
		if (__DEV__) console.info(`[INFO] ${msg}`, meta);
	},

	warn(msg: string, meta?: LogMeta) {
		console.warn(`[WARN] ${msg}`, meta);
	},

	error(msg: string, error?: Error | unknown, meta?: LogMeta) {
		console.error(`[ERROR] ${msg}`, error, meta);
		// TODO: Wire to Sentry/Datadog when ready
	},
};

export default logger;
