import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '@/src/stores/authStore';
import {
	GLASS_WHITE_LIGHT,
	OPACITY_HOVER,
	SIZE_AUTH_LOGO_MD,
	SIZE_INPUT_HEIGHT,
} from '@/theme/uiMetrics';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { Screen } from '@/src/design-system/components/atoms/Screen';
import { PhoneInput } from '@/src/design-system/components/molecules/PhoneInput';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';

/**
 * P1.2 — Phone OTP Login Screen
 * Route: /(auth)/login (replaces email/password screen)
 * Uses Supabase signInWithOtp({ phone }) flow.
 */
export default function PhoneLoginScreen() {
	const { c, s, r } = useThemeTokens();
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
			<View
				style={[
					styles.header,
					{
						backgroundColor: c.primary,
						paddingTop: s['2xl'],
						paddingBottom: s['3xl'],
						paddingHorizontal: s.xl,
					},
				]}
			>
				<View
					style={[
						styles.logo,
						{
							backgroundColor: GLASS_WHITE_LIGHT,
							borderRadius: r.md,
						},
					]}
				>
					<ThemedText variant="h1" style={{ color: c.onPrimary, fontWeight: '700' }}>
						T
					</ThemedText>
				</View>
				<ThemedText variant="h1" style={{ color: c.onPrimary, marginTop: s.sm }}>
					TileMaster
				</ThemedText>
				<ThemedText
					variant="caption"
					style={{
						color: c.onPrimary,
						opacity: OPACITY_HOVER,
						marginTop: s.xs,
					}}
				>
					आपका डिजिटल बही-खाता
				</ThemedText>
			</View>

			{/* Form */}
			<View style={[styles.form, { padding: s.lg }]}>
				<ThemedText variant="h2" style={{ marginBottom: s.md }}>
					Vyapar में आपका स्वागत है
				</ThemedText>
				<ThemedText
					variant="caption"
					style={{
						color: c.onSurfaceVariant,
						marginBottom: s.lg,
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
					<ThemedText variant="label" style={{ color: c.error, marginTop: s.sm }}>
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
							borderRadius: r.md,
							marginTop: s.lg,
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
				<View style={[styles.supportRow, { marginTop: s.xl }]}>
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
	},
	logo: {
		width: SIZE_AUTH_LOGO_MD,
		height: SIZE_AUTH_LOGO_MD,
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
	},
});
