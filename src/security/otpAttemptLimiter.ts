import * as SecureStore from 'expo-secure-store';
import { AppError } from '@/src/errors/AppError';
import logger from '@/src/utils/logger';

export const OTP_MAX_ATTEMPTS = 5;
const OTP_WINDOW_MINUTES = 15;
const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = SECONDS_PER_MINUTE * MS_PER_SECOND;
const DJB2_INITIAL_HASH = 5381;
const DJB2_MULTIPLIER = 33;

export const OTP_WINDOW_MS = OTP_WINDOW_MINUTES * MS_PER_MINUTE;

interface OtpAttemptRecord {
	count: number;
	windowStartedAt: number;
}

const secureStoreOptions: SecureStore.SecureStoreOptions = {
	keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

function hashPhoneForStorage(phone: string) {
	let hash = DJB2_INITIAL_HASH;
	for (let index = 0; index < phone.length; index += 1) {
		hash = (hash * DJB2_MULTIPLIER) ^ phone.charCodeAt(index);
	}
	return (hash >>> 0).toString(16);
}

function keyForPhone(phone: string) {
	return `otp-attempts:${hashPhoneForStorage(phone.trim())}`;
}

async function readRecord(phone: string, now = Date.now()): Promise<OtpAttemptRecord> {
	const raw = await SecureStore.getItemAsync(keyForPhone(phone), secureStoreOptions);
	if (!raw) return { count: 0, windowStartedAt: now };

	try {
		const parsed = JSON.parse(raw) as Partial<OtpAttemptRecord>;
		const count = Number(parsed.count ?? 0);
		const windowStartedAt = Number(parsed.windowStartedAt ?? now);
		if (!Number.isFinite(count) || !Number.isFinite(windowStartedAt)) {
			return { count: 0, windowStartedAt: now };
		}
		if (now - windowStartedAt >= OTP_WINDOW_MS) {
			return { count: 0, windowStartedAt: now };
		}
		return { count, windowStartedAt };
	} catch {
		return { count: 0, windowStartedAt: now };
	}
}

export const otpAttemptLimiter = {
	async assertAllowed(phone: string, now = Date.now()) {
		const record = await readRecord(phone, now);
		if (record.count < OTP_MAX_ATTEMPTS) return;

		const retryInMs = Math.max(0, OTP_WINDOW_MS - (now - record.windowStartedAt));
		const retryInMinutes = Math.max(1, Math.ceil(retryInMs / MS_PER_MINUTE));
		logger.warn('otp_attempt_limited', {
			phone_hash: hashPhoneForStorage(phone.trim()),
			retry_in_minutes: retryInMinutes,
		});
		throw new AppError(
			'OTP attempt limit exceeded',
			'OTP_RATE_LIMITED',
			`Too many OTP attempts. Try again in ${retryInMinutes} minutes.`,
		);
	},

	async recordFailure(phone: string, now = Date.now()) {
		const record = await readRecord(phone, now);
		const nextRecord = {
			count: record.count + 1,
			windowStartedAt: record.windowStartedAt,
		};
		await SecureStore.setItemAsync(
			keyForPhone(phone),
			JSON.stringify(nextRecord),
			secureStoreOptions,
		);
		logger.warn('otp_attempt_failed', {
			phone_hash: hashPhoneForStorage(phone.trim()),
			count: nextRecord.count,
			max_attempts: OTP_MAX_ATTEMPTS,
		});
	},

	async reset(phone: string) {
		await SecureStore.deleteItemAsync(keyForPhone(phone), secureStoreOptions);
	},
};
