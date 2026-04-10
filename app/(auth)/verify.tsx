import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '@/src/stores/authStore';
import { businessProfileService } from '@/src/services/businessProfileService';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/components/atoms/ThemedText';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30; // seconds

/**
 * P1.3 — OTP Verification Screen
 * Route: /(auth)/verify
 * Params: { phone: '+91XXXXXXXXXX' }
 */
export default function OtpVerifyScreen() {
	const { theme } = useTheme();
	const c = theme.colors;
	const router = useRouter();
	const { phone } = useLocalSearchParams<{ phone: string }>();
	const { verifyOtp, sendOtp, loading } = useAuthStore(
		useShallow((s) => ({ verifyOtp: s.verifyOtp, sendOtp: s.sendOtp, loading: s.loading })),
	);

	const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
	const [error, setError] = useState('');
	const [resendEnabled, setResendEnabled] = useState(false);
	const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
	const inputRefs = useRef<(TextInput | null)[]>([]);

	// Single timer — enables resend after RESEND_COOLDOWN seconds
	useEffect(() => {
		setResendEnabled(false);
		setCountdown(RESEND_COOLDOWN);
		const interval = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(interval);
					setResendEnabled(true);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
		return () => clearInterval(interval);
		// Only run once on mount
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fullOtp = otp.join('');
	const isComplete = fullOtp.length === OTP_LENGTH && !otp.some((d) => d === '');

	const handleCellChange = (text: string, index: number) => {
		const digit = text.slice(-1); // take last character
		const newOtp = [...otp];
		newOtp[index] = digit;
		setOtp(newOtp);
		setError('');
		// Auto-advance
		if (digit && index < OTP_LENGTH - 1) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
		if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handleVerify = async () => {
		if (!isComplete || loading) return;
		setError('');
		try {
			await verifyOtp(phone ?? '', fullOtp);
			// Check if business profile exists
			const profile = await businessProfileService.get();
			if (profile) {
				router.replace('/(app)/(tabs)');
			} else {
				router.push('/(auth)/setup');
			}
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : 'गलत OTP — फिर से try करें।');
		}
	};

	const handleResend = useCallback(async () => {
		if (!resendEnabled) return;
		setResendEnabled(false);
		setCountdown(RESEND_COOLDOWN);
		setOtp(Array(OTP_LENGTH).fill(''));
		setError('');
		try {
			await sendOtp(phone ?? '');
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : 'OTP भेजने में समस्या।');
		}
	}, [resendEnabled, phone, sendOtp]);

	const displayPhone = phone?.replace('+91', '') ?? '';

	return (
		<View style={[styles.root, { backgroundColor: c.background }]}>
			{/* Header */}
			<View style={[styles.header, { backgroundColor: c.primary }]}>
				<ThemedText variant="h2" style={{ color: c.onPrimary }}>
					OTP Verify करें
				</ThemedText>
				<ThemedText
					style={{ color: c.onPrimary, opacity: 0.9, marginTop: 6, fontSize: 14 }}
				>
					OTP sent to +91 {displayPhone}
				</ThemedText>
			</View>

			<View style={[styles.form, { padding: theme.spacing.lg }]}>
				{/* OTP Cells */}
				<View style={styles.otpRow}>
					{Array.from({ length: OTP_LENGTH }, (_, i) => (
						<TextInput
							key={i}
							testID={`otp-cell-${i}`}
							ref={(ref) => {
								inputRefs.current[i] = ref;
							}}
							value={otp[i]}
							onChangeText={(text) => handleCellChange(text, i)}
							onKeyPress={(e) => handleKeyPress(e, i)}
							keyboardType="number-pad"
							maxLength={1}
							style={[
								styles.cell,
								{
									borderColor: otp[i] ? c.primary : c.border,
									borderWidth: otp[i] ? 2 : 1,
									backgroundColor: c.surface,
									color: c.onSurface,
									borderRadius: theme.borderRadius.md,
									fontSize: 24,
								},
							]}
							textAlign="center"
						/>
					))}
				</View>

				{error ? (
					<Text
						style={{ color: c.error, fontSize: 13, marginTop: 8, textAlign: 'center' }}
					>
						{error}
					</Text>
				) : null}

				{/* Verify Button */}
				<Pressable
					testID="verify-button"
					onPress={handleVerify}
					disabled={!isComplete || loading}
					accessibilityRole="button"
					accessibilityLabel="Verify करें"
					accessibilityState={{ disabled: !isComplete || loading }}
					style={[
						styles.btn,
						{
							backgroundColor: isComplete && !loading ? c.primary : c.surfaceVariant,
							borderRadius: theme.borderRadius.md,
							marginTop: theme.spacing.xl,
						},
					]}
				>
					<Text
						style={{
							color: isComplete && !loading ? c.onPrimary : c.placeholder,
							fontSize: 16,
							fontWeight: '700',
						}}
					>
						{loading ? 'Verify हो रहा है...' : 'Verify करें'}
					</Text>
				</Pressable>

				{/* Resend OTP */}
				<View style={styles.resendRow}>
					<ThemedText style={{ color: c.onSurfaceVariant, fontSize: 14 }}>
						OTP नहीं मिला?{' '}
					</ThemedText>
					<Pressable
						testID="resend-button"
						onPress={handleResend}
						disabled={!resendEnabled}
						accessibilityRole="button"
						accessibilityState={{ disabled: !resendEnabled }}
					>
						<Text
							style={{
								color: countdown > 0 ? c.placeholder : c.primary,
								fontSize: 14,
								fontWeight: '600',
							}}
						>
							{!resendEnabled ? `${countdown}s में resend करें` : 'Resend OTP'}
						</Text>
					</Pressable>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1 },
	header: {
		alignItems: 'center',
		paddingVertical: 40,
		paddingHorizontal: 24,
	},
	form: { flex: 1 },
	otpRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 8,
		marginTop: 24,
	},
	cell: {
		width: 48,
		height: 56,
		borderWidth: 1,
		textAlign: 'center',
	},
	btn: {
		height: 52,
		alignItems: 'center',
		justifyContent: 'center',
	},
	resendRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 20,
	},
});
