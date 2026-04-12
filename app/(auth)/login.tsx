import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useAuthStore } from '@/src/stores/authStore';
import { useLocale } from '@/src/hooks/useLocale';
import { Screen } from '@/src/components/atoms/Screen';
import { Button } from '@/src/components/atoms/Button';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { PhoneInput } from '@/src/components/molecules/PhoneInput';

export default function LoginScreen() {
	const { theme, c, s, r } = useThemeTokens();
	const { t } = useLocale();
	const { sendOtp, loading } = useAuthStore(
		useShallow((s) => ({ sendOtp: s.sendOtp, loading: s.loading })),
	);
	const router = useRouter();
	const [phone, setPhone] = useState('');

	const handleSendOtp = async () => {
		if (phone.length < 10) {
			Alert.alert(t('common.error'), t('auth.errorInvalidPhone'));
			return;
		}
		try {
			const e164Phone = `+91${phone}`;
			await sendOtp(e164Phone);
			router.push({
				pathname: '/(auth)/verify',
				params: { phone: e164Phone },
			});
		} catch (e: unknown) {
			Alert.alert(
				t('auth.errorOtpFailed'),
				e instanceof Error ? e.message : t('common.unexpectedError'),
			);
		}
	};

	const typo = theme.typography;

	return (
		<Screen scrollable safeAreaEdges={['top']}>
			{/* Header */}
			<View style={[styles.header, { backgroundColor: c.primary, paddingTop: s.xl * 2 }]}>
				<View
					style={[
						styles.logoMark,
						{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: r.lg },
					]}
				>
					<ThemedText
						style={{
							fontSize: 40,
							color: c.onPrimary,
							fontWeight: '800',
							letterSpacing: -1,
						}}
					>
						T
					</ThemedText>
				</View>
				<ThemedText
					variant="h1"
					style={[styles.appName, { color: c.onPrimary, marginTop: s.md }]}
				>
					{t('branding.appName')}
				</ThemedText>
				<ThemedText
					style={[
						styles.subtitle,
						{
							color: c.onPrimary,
							fontSize: typo.sizes.md,
							opacity: 0.9,
							marginTop: s.xs,
						},
					]}
				>
					आपका डिजिटल बही-खाता
				</ThemedText>
			</View>

			{/* Form */}
			<View style={[styles.form, { padding: s.xl }]}>
				<ThemedText variant="h2" style={{ marginBottom: s.xs, textAlign: 'center' }}>
					{t('auth.welcome')}
				</ThemedText>
				<ThemedText
					style={{ color: c.onSurfaceVariant, textAlign: 'center', marginBottom: s.xl }}
				>
					जारी रखने के लिए अपना मोबाइल नंबर भरें
				</ThemedText>

				{/* Phone Input */}
				<PhoneInput value={phone} onChange={setPhone} />

				{/* Send OTP Button */}
				<Button
					title={t('auth.sendOtp')}
					testID="send-otp-button"
					onPress={handleSendOtp}
					loading={loading}
					disabled={phone.length < 10}
					size="lg"
					style={{ marginTop: s.xl }}
				/>

				{/* Help text */}
				<View style={{ marginTop: s.xl * 2, alignItems: 'center' }}>
					<ThemedText variant="caption" color={c.onSurfaceVariant}>
						{t('auth.loginHelpText')}
					</ThemedText>
					<TouchableOpacity style={{ marginTop: s.sm }}>
						<ThemedText color={c.primary} weight="bold">
							{t('auth.contactSupport')}
						</ThemedText>
					</TouchableOpacity>
				</View>
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	header: {
		alignItems: 'center',
		paddingBottom: 50,
		paddingHorizontal: 24,
		borderBottomLeftRadius: 32,
		borderBottomRightRadius: 32,
	},
	logoMark: {
		width: 80,
		height: 80,
		alignItems: 'center',
		justifyContent: 'center',
	},
	appName: { fontWeight: '800' },
	subtitle: { textAlign: 'center' },
	form: { flex: 1, marginTop: -30, backgroundColor: 'transparent' },
});
