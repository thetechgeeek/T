interface LogMeta {
	[key: string]: unknown;
}

const REDACTED = '[REDACTED]';
const SENSITIVE_FIELD_PATTERN =
	/(^|_)(access_token|address|authorization|customer_name|email|gstin|password|phone|refresh_token|secret|supplier_name|token)($|_)/i;
const PHONE_PATTERN = /(\+?\d[\d\s-]{7,}\d)/g;
const GSTIN_PATTERN = /\b\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]\b/g;
const BEARER_TOKEN_PATTERN = /\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi;

function redactString(value: string) {
	return value
		.replace(BEARER_TOKEN_PATTERN, `Bearer ${REDACTED}`)
		.replace(GSTIN_PATTERN, REDACTED)
		.replace(PHONE_PATTERN, REDACTED);
}

function redactValue(value: unknown, key?: string): unknown {
	if (key && SENSITIVE_FIELD_PATTERN.test(key)) return REDACTED;
	if (typeof value === 'string') return redactString(value);
	if (Array.isArray(value)) return value.map((item) => redactValue(item));
	if (value && typeof value === 'object') {
		return redactLogMeta(value as LogMeta);
	}
	return value;
}

export function redactLogMeta(meta?: LogMeta): LogMeta | undefined {
	if (!meta) return meta;
	return Object.fromEntries(
		Object.entries(meta).map(([key, value]) => [key, redactValue(value, key)]),
	);
}

function redactError(error: Error | unknown) {
	if (!(error instanceof Error)) return redactValue(error);
	const nextMessage = redactString(error.message);
	if (nextMessage === error.message) return error;
	const redactedError = new Error(nextMessage);
	redactedError.name = error.name;
	return redactedError;
}

/**
 * Structured logger. In production, swap console.* with a real sink (Sentry, Datadog, etc.).
 * Only debug/info logs are shown in development (__DEV__ guard).
 */
const logger = {
	debug(msg: string, meta?: LogMeta) {
		if (__DEV__) console.debug(`[DEBUG] ${msg}`, redactLogMeta(meta));
	},

	info(msg: string, meta?: LogMeta) {
		if (__DEV__) console.info(`[INFO] ${msg}`, redactLogMeta(meta));
	},

	warn(msg: string, meta?: LogMeta) {
		console.warn(`[WARN] ${msg}`, redactLogMeta(meta));
	},

	error(msg: string, error?: Error | unknown, meta?: LogMeta) {
		console.error(`[ERROR] ${msg}`, redactError(error), redactLogMeta(meta));
		// TODO: Wire to Sentry/Datadog when ready
	},
};

export default logger;
