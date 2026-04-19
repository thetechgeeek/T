import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { GLASS_WHITE_LIGHT, OPACITY_HOVER, SIZE_AUTH_LOGO_LG } from '@/theme/uiMetrics';
import { useAuthStore } from '@/src/stores/authStore';
import { useLocale } from '@/src/hooks/useLocale';
import { Screen } from '@/src/design-system/components/atoms/Screen';
import { Button } from '@/src/design-system/components/atoms/Button';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { TextInput } from '@/src/design-system/components/atoms/TextInput';
import { PhoneInput } from '@/src/design-system/components/molecules/PhoneInput';
import { AppError } from '@/src/errors';

export default function LoginScreen() {
	const { c, s, r, typo } = useThemeTokens();
	const { t } = useLocale();
	const { sendOtp, login, loading } = useAuthStore(
		useShallow((s) => ({ sendOtp: s.sendOtp, login: s.login, loading: s.loading })),
	);
	const router = useRouter();
	const [phone, setPhone] = useState('');
	const [devEmail, setDevEmail] = useState('');
	const [devPassword, setDevPassword] = useState('');
	const [devError, setDevError] = useState('');

	const showDevLogin = __DEV__;
	const canSubmitDevLogin = devEmail.trim().length > 0 && devPassword.length > 0;

	const handleDevEmailChange = (value: string) => {
		setDevEmail(value);
		if (devError) {
			setDevError('');
		}
	};

	const handleDevPasswordChange = (value: string) => {
		setDevPassword(value);
		if (devError) {
			setDevError('');
		}
	};

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
				e instanceof AppError
					? e.userMessage
					: e instanceof Error
						? e.message
						: t('common.unexpectedError'),
			);
		}
	};

	const handleDevLogin = async () => {
		if (!canSubmitDevLogin || loading) {
			return;
		}

		setDevError('');
		try {
			await login(devEmail.trim(), devPassword);
		} catch (e: unknown) {
			setDevError(
				e instanceof AppError
					? e.userMessage
					: e instanceof Error
						? e.message
						: t('common.unexpectedError'),
			);
		}
	};

	return (
		<Screen scrollable safeAreaEdges={['top']}>
			{/* Header */}
			<View
				style={[
					styles.header,
					{
						backgroundColor: c.primary,
						paddingTop: s['3xl'],
						paddingBottom: s['3xl'],
						paddingHorizontal: s.xl,
						borderBottomLeftRadius: r.xl,
						borderBottomRightRadius: r.xl,
					},
				]}
			>
				<View
					style={[
						styles.logoMark,
						{ backgroundColor: GLASS_WHITE_LIGHT, borderRadius: r.lg },
					]}
				>
					<ThemedText
						variant="display"
						style={{ color: c.onPrimary, fontWeight: '800', letterSpacing: -1 }}
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
							opacity: OPACITY_HOVER,
							marginTop: s.xs,
						},
					]}
				>
					आपका डिजिटल बही-खाता
				</ThemedText>
			</View>

			{/* Form */}
			<View style={[styles.form, { marginTop: -s['2xl'], padding: s.xl }]}>
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

				{showDevLogin ? (
					<View
						testID="dev-login-panel"
						style={[
							styles.devPanel,
							{
								marginTop: s['2xl'],
								padding: s.lg,
								borderRadius: r.lg,
								borderColor: c.border,
								backgroundColor: c.surface,
							},
						]}
					>
						<ThemedText variant="label" weight="bold" style={{ color: c.primary }}>
							Dev only
						</ThemedText>
						<ThemedText
							variant="caption"
							style={{ color: c.onSurfaceVariant, marginTop: s.xs }}
						>
							Use email and password in simulator or local development builds when SMS
							OTP is unavailable.
						</ThemedText>

						<TextInput
							testID="dev-email-input"
							label="Email"
							placeholder="dev@example.com"
							value={devEmail}
							onChangeText={handleDevEmailChange}
							autoCapitalize="none"
							autoCorrect={false}
							keyboardType="email-address"
							textContentType="emailAddress"
							containerStyle={{ marginTop: s.lg }}
						/>

						<TextInput
							testID="dev-password-input"
							label="Password"
							placeholder="Enter password"
							value={devPassword}
							onChangeText={handleDevPasswordChange}
							secureTextEntry
							textContentType="password"
							containerStyle={{ marginTop: s.md }}
						/>

						{devError ? (
							<ThemedText
								testID="dev-login-error"
								variant="caption"
								style={{ color: c.error, marginTop: s.sm }}
							>
								{devError}
							</ThemedText>
						) : null}

						<Button
							title="Dev Sign In"
							accessibilityLabel="Dev sign in"
							testID="dev-login-button"
							onPress={handleDevLogin}
							loading={loading}
							disabled={!canSubmitDevLogin}
							variant="secondary"
							size="md"
							style={{ marginTop: s.lg }}
						/>
					</View>
				) : null}

				{/* Help text */}
				<View style={[styles.helpBlock, { marginTop: s['3xl'] }]}>
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
	},
	logoMark: {
		width: SIZE_AUTH_LOGO_LG,
		height: SIZE_AUTH_LOGO_LG,
		alignItems: 'center',
		justifyContent: 'center',
	},
	appName: { fontWeight: '800' },
	subtitle: { textAlign: 'center' },
	form: { flex: 1 },
	devPanel: { borderWidth: 1 },
	helpBlock: { alignItems: 'center' },
});
