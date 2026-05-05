import * as SecureStore from 'expo-secure-store';
import {
	OTP_MAX_ATTEMPTS,
	OTP_WINDOW_MS,
	otpAttemptLimiter,
} from '@/src/security/otpAttemptLimiter';
import { allowExpectedConsoleWarn } from '@/__tests__/utils/runtimeNoise';

describe('otpAttemptLimiter', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('allows attempts before the threshold', async () => {
		(SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
			JSON.stringify({ count: OTP_MAX_ATTEMPTS - 1, windowStartedAt: 1000 }),
		);

		await expect(
			otpAttemptLimiter.assertAllowed('+919876543210', 2000),
		).resolves.toBeUndefined();
	});

	it('blocks attempts at the threshold', async () => {
		allowExpectedConsoleWarn(/\[WARN\] otp_attempt_limited/);
		(SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
			JSON.stringify({ count: OTP_MAX_ATTEMPTS, windowStartedAt: 1000 }),
		);

		await expect(otpAttemptLimiter.assertAllowed('+919876543210', 2000)).rejects.toMatchObject({
			code: 'OTP_RATE_LIMITED',
		});
	});

	it('resets the window after fifteen minutes', async () => {
		(SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
			JSON.stringify({ count: OTP_MAX_ATTEMPTS, windowStartedAt: 1000 }),
		);

		await expect(
			otpAttemptLimiter.assertAllowed('+919876543210', 1000 + OTP_WINDOW_MS),
		).resolves.toBeUndefined();
	});

	it('records failures without storing the raw phone number in the key', async () => {
		allowExpectedConsoleWarn(/\[WARN\] otp_attempt_failed/);
		(SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

		await otpAttemptLimiter.recordFailure('+919876543210', 1000);

		const key = (SecureStore.setItemAsync as jest.Mock).mock.calls[0][0] as string;
		expect(key).toMatch(/^otp-attempts:/);
		expect(key).not.toContain('+919876543210');
		expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
			key,
			JSON.stringify({ count: 1, windowStartedAt: 1000 }),
			expect.any(Object),
		);
	});
});
