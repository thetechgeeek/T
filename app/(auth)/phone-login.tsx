import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '@/src/stores/authStore';
import { useTheme } from '@/src/theme/ThemeProvider';
import { PhoneInput } from '@/src/components/molecules/PhoneInput';
import { ThemedText } from '@/src/components/atoms/ThemedText';

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
		<View style={[styles.root, { backgroundColor: c.background }]}>
			{/* Header */}
			<View style={[styles.header, { backgroundColor: c.primary }]}>
				<View
					style={[
						styles.logo,
						{
							backgroundColor: 'rgba(255,255,255,0.2)',
							borderRadius: theme.borderRadius.md,
						},
					]}
				>
					<ThemedText style={{ fontSize: 28, color: c.onPrimary, fontWeight: '700' }}>
						T
					</ThemedText>
				</View>
				<ThemedText variant="h1" style={{ color: c.onPrimary, marginTop: 8 }}>
					TileMaster
				</ThemedText>
				<ThemedText
					style={{ color: c.onPrimary, opacity: 0.9, fontSize: 14, marginTop: 4 }}
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
					style={{
						color: c.onSurfaceVariant,
						marginBottom: theme.spacing.lg,
						fontSize: 14,
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
					<Text style={{ color: c.error, fontSize: 13, marginTop: 8 }}>{error}</Text>
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
					<Text
						style={{
							color: isValid && !loading ? c.onPrimary : c.placeholder,
							fontSize: 16,
							fontWeight: '700',
						}}
					>
						{loading ? 'भेज रहे हैं...' : 'OTP भेजें'}
					</Text>
				</Pressable>

				{/* Support link */}
				<View style={styles.supportRow}>
					<ThemedText style={{ color: c.onSurfaceVariant, fontSize: 14 }}>
						Having trouble?{' '}
					</ThemedText>
					<Pressable accessibilityRole="link">
						<ThemedText style={{ color: c.primary, fontSize: 14 }}>
							Contact support
						</ThemedText>
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
	logo: {
		width: 64,
		height: 64,
		alignItems: 'center',
		justifyContent: 'center',
	},
	form: { flex: 1 },
	btn: {
		height: 52,
		alignItems: 'center',
		justifyContent: 'center',
	},
	supportRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 24,
	},
});
