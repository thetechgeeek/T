interface LogMeta {
	[key: string]: unknown;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'telemetry';

export interface TelemetryEvent {
	level: LogLevel;
	message: string;
	release: string;
	timestamp: string;
	meta?: LogMeta;
	error?: {
		name: string;
		message: string;
	};
}

export interface TelemetrySink {
	captureEvent(event: TelemetryEvent): void | Promise<void>;
}

const REDACTED = '[REDACTED]';
const SENSITIVE_FIELD_PATTERN =
	/(^|_)(access_token|address|authorization|customer_name|email|gstin|password|phone|refresh_token|secret|supplier_name|token)($|_)/i;
const PHONE_PATTERN = /(\+?\d[\d\s-]{7,}\d)/g;
const GSTIN_PATTERN = /\b\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]\b/g;
const BEARER_TOKEN_PATTERN = /\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi;
const RELEASE_TAG =
	(typeof process !== 'undefined' &&
		(process.env.EXPO_PUBLIC_APP_VERSION ||
			process.env.EXPO_PUBLIC_APP_ENV ||
			process.env.NODE_ENV)) ||
	'unknown';

declare global {
	// Native release builds can install a sink during app bootstrap without coupling
	// this utility to a specific crash-reporting SDK.
	var __EASYSTOCK_TELEMETRY_SINK__: TelemetrySink | undefined;
}

let telemetrySink: TelemetrySink | undefined =
	typeof globalThis !== 'undefined' ? globalThis.__EASYSTOCK_TELEMETRY_SINK__ : undefined;

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

function serializeError(error: Error | unknown): TelemetryEvent['error'] | undefined {
	const redacted = redactError(error);
	if (!(redacted instanceof Error)) return undefined;
	return {
		name: redacted.name,
		message: redacted.message,
	};
}

function emitToSink(level: LogLevel, message: string, meta?: LogMeta, error?: Error | unknown) {
	const sink =
		telemetrySink ??
		(typeof globalThis !== 'undefined' ? globalThis.__EASYSTOCK_TELEMETRY_SINK__ : undefined);
	if (!sink) return;

	const event: TelemetryEvent = {
		level,
		message,
		release: RELEASE_TAG,
		timestamp: new Date().toISOString(),
		meta: redactLogMeta(meta),
		error: serializeError(error),
	};

	try {
		void sink.captureEvent(event);
	} catch {
		// Logging must never become the reason a user workflow fails.
	}
}

export function setTelemetrySink(sink: TelemetrySink) {
	telemetrySink = sink;
}

export function clearTelemetrySink() {
	telemetrySink = undefined;
}

/**
 * Structured logger. Warning, error, and explicit telemetry events are forwarded
 * to the configured release sink after redaction. Debug/info console output stays
 * development-only.
 */
const logger = {
	debug(msg: string, meta?: LogMeta) {
		if (__DEV__) console.debug(`[DEBUG] ${msg}`, redactLogMeta(meta));
	},

	info(msg: string, meta?: LogMeta) {
		if (__DEV__) console.info(`[INFO] ${msg}`, redactLogMeta(meta));
	},

	warn(msg: string, meta?: LogMeta) {
		const safeMeta = redactLogMeta(meta);
		console.warn(`[WARN] ${msg}`, safeMeta);
		emitToSink('warn', msg, safeMeta);
	},

	error(msg: string, error?: Error | unknown, meta?: LogMeta) {
		const safeError = redactError(error);
		const safeMeta = redactLogMeta(meta);
		console.error(`[ERROR] ${msg}`, safeError, safeMeta);
		emitToSink('error', msg, safeMeta, safeError);
	},

	telemetry(eventName: string, meta?: LogMeta) {
		const safeMeta = redactLogMeta(meta);
		if (__DEV__) console.info(`[TELEMETRY] ${eventName}`, safeMeta);
		emitToSink('telemetry', eventName, safeMeta);
	},
};

export default logger;
