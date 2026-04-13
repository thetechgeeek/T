import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '@/src/stores/authStore';
import { OPACITY_HOVER, SIZE_INPUT_HEIGHT, GLASS_WHITE_LIGHT } from '@/theme/uiMetrics';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Screen } from '@/src/components/atoms/Screen';
import { PhoneInput } from '@/src/components/molecules/PhoneInput';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

const AUTH_HEADER_PADDING = 40;
const AUTH_LOGO_SIZE = 64;

/**
 * P1.2 — Phone OTP Login Screen
 * Route: /(auth)/login (replaces email/password screen)
 * Uses Supabase signInWithOtp({ phone }) flow.
 */
export default function PhoneLoginScreen() {
	const { theme } = useTheme();
	const c = theme.colors;
	const router = useRouter();
	const { sendOtp, loading } = useAuthStore(
		useShallow((s) => ({ sendOtp: s.sendOtp, loading: s.loading })),
	);

	const [phone, setPhone] = useState('');
	const [error, setError] = useState('');

	const isValid = phone.length === 10;

	const handleSendOtp = async () => {
		if (!isValid || loading) return;
		setError('');
		try {
			const fullPhone = `+91${phone}`;
			await sendOtp(fullPhone);
			router.push({
				pathname: '/(auth)/verify',
				params: { phone: fullPhone },
			});
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : 'OTP भेजने में समस्या हुई। फिर से try करें।');
		}
	};

	return (
		<Screen safeAreaEdges={['top']} style={styles.root} backgroundColor={c.background}>
			{/* Header */}
			<View style={[styles.header, { backgroundColor: c.primary }]}>
				<View
					style={[
						styles.logo,
						{
							backgroundColor: GLASS_WHITE_LIGHT,
							borderRadius: theme.borderRadius.md,
						},
					]}
				>
					<ThemedText variant="h1" style={{ color: c.onPrimary, fontWeight: '700' }}>
						T
					</ThemedText>
				</View>
				<ThemedText variant="h1" style={{ color: c.onPrimary, marginTop: SPACING_PX.sm }}>
					TileMaster
				</ThemedText>
				<ThemedText
					variant="caption"
					style={{
						color: c.onPrimary,
						opacity: OPACITY_HOVER,
						marginTop: SPACING_PX.xs,
					}}
				>
					आपका डिजिटल बही-खाता
				</ThemedText>
			</View>

			{/* Form */}
			<View style={[styles.form, { padding: theme.spacing.lg }]}>
				<ThemedText variant="h2" style={{ marginBottom: theme.spacing.md }}>
					Vyapar में आपका स्वागत है
				</ThemedText>
				<ThemedText
					variant="caption"
					style={{
						color: c.onSurfaceVariant,
						marginBottom: theme.spacing.lg,
					}}
				>
					अपना mobile number enter करें
				</ThemedText>

				<PhoneInput
					testID="phone-input"
					value={phone}
					onChange={setPhone}
					label="Mobile Number"
				/>

				{error ? (
					<ThemedText
						variant="label"
						style={{ color: c.error, marginTop: SPACING_PX.sm }}
					>
						{error}
					</ThemedText>
				) : null}

				{/* Send OTP Button */}
				<Pressable
					testID="send-otp-button"
					onPress={handleSendOtp}
					disabled={!isValid || loading}
					accessibilityRole="button"
					accessibilityLabel="OTP भेजें"
					accessibilityState={{ disabled: !isValid || loading, busy: loading }}
					style={[
						styles.btn,
						{
							backgroundColor: isValid && !loading ? c.primary : c.surfaceVariant,
							borderRadius: theme.borderRadius.md,
							marginTop: theme.spacing.lg,
						},
					]}
				>
					<ThemedText
						variant="body"
						style={{
							color: isValid && !loading ? c.onPrimary : c.placeholder,
							fontWeight: '700',
						}}
					>
						{loading ? 'भेज रहे हैं...' : 'OTP भेजें'}
					</ThemedText>
				</Pressable>

				{/* Support link */}
				<View style={styles.supportRow}>
					<ThemedText variant="caption" style={{ color: c.onSurfaceVariant }}>
						Having trouble?{' '}
					</ThemedText>
					<Pressable accessibilityRole="link">
						<ThemedText variant="caption" style={{ color: c.primary }}>
							Contact support
						</ThemedText>
					</Pressable>
				</View>
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1 },
	header: {
		alignItems: 'center',
		paddingVertical: AUTH_HEADER_PADDING,
		paddingHorizontal: SPACING_PX.xl,
	},
	logo: {
		width: AUTH_LOGO_SIZE,
		height: AUTH_LOGO_SIZE,
		alignItems: 'center',
		justifyContent: 'center',
	},
	form: { flex: 1 },
	btn: {
		height: SIZE_INPUT_HEIGHT,
		alignItems: 'center',
		justifyContent: 'center',
	},
	supportRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: SPACING_PX.xl,
	},
});
