import React, { useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
	View,
	StyleSheet,
	Platform,
	TouchableOpacity,
	TextInput as NativeTextInput,
} from 'react-native';
import { useThemeTokens } from '@easydesign/design-system/foundation';
import {
	GLASS_WHITE_LIGHT,
	OPACITY_HOVER,
	SIZE_AUTH_LOGO_LG,
} from '@easydesign/design-system/foundation';
import { useAuthStore } from '@/src/stores/authStore';
import { useLocale } from '@/src/hooks/useLocale';
import { Screen } from '@easydesign/design-system';
import { Button } from '@easydesign/design-system';
import { ThemedText } from '@easydesign/design-system';
import { AppError, getTranslatedErrorMessage } from '@/src/errors';

export default function LoginScreen() {
	const { c, s, r, typo } = useThemeTokens();
	const { t } = useLocale();
	const { login, loading } = useAuthStore(
		useShallow((s) => ({ login: s.login, loading: s.loading })),
	);
	const emailInputRef = useRef<NativeTextInput | null>(null);
	const passwordInputRef = useRef<NativeTextInput | null>(null);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loginError, setLoginError] = useState('');

	const runningIosDevBuild = __DEV__ && Platform.OS === 'ios';
	const canSubmitLogin = email.trim().length > 0 && password.length > 0;
	const useStaticAuthLayout = runningIosDevBuild;
	const disableNativeCredentialPrompts = runningIosDevBuild;
	const shouldMaskPassword = !runningIosDevBuild;
	const allowPasswordSubmitKey = true;

	const handleEmailChange = (value: string) => {
		setEmail(value);
		if (loginError) {
			setLoginError('');
		}
	};

	const handlePasswordChange = (value: string) => {
		setPassword(value);
		if (loginError) {
			setLoginError('');
		}
	};

	const handleLogin = async () => {
		if (loading) {
			return;
		}

		if (!canSubmitLogin) {
			setLoginError(t('auth.errorMissingFields'));
			return;
		}

		setLoginError('');
		try {
			await login(email.trim(), password);
		} catch (e: unknown) {
			setLoginError(
				e instanceof AppError
					? getTranslatedErrorMessage(e, t)
					: e instanceof Error
						? e.message
						: t('common.unexpectedError'),
			);
		}
	};

	return (
		<Screen
			scrollable={!useStaticAuthLayout}
			safeAreaEdges={['top']}
			scrollViewProps={
				useStaticAuthLayout
					? undefined
					: {
							keyboardShouldPersistTaps: 'always',
							keyboardDismissMode: 'none',
						}
			}
		>
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
						{t('branding.appShortName')}
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
				<ThemedText
					variant="h2"
					style={{ marginBottom: s.xs, textAlign: 'center' }}
					accessibilityLabel="sign-in-heading"
					testID="sign-in-heading"
				>
					{t('auth.welcome')}
				</ThemedText>
				<ThemedText
					style={{ color: c.onSurfaceVariant, textAlign: 'center', marginBottom: s.xl }}
				>
					{t('auth.subtitle')}
				</ThemedText>

				<View>
					<ThemedText variant="label" style={{ color: c.onSurface, marginBottom: s.xs }}>
						{t('auth.email')}
					</ThemedText>
					<NativeTextInput
						ref={emailInputRef}
						testID="email-input"
						placeholder={t('auth.placeholders.email')}
						placeholderTextColor={c.placeholder}
						value={email}
						onChangeText={handleEmailChange}
						autoCapitalize="none"
						autoCorrect={false}
						spellCheck={false}
						keyboardType="email-address"
						autoComplete={disableNativeCredentialPrompts ? 'off' : 'email'}
						textContentType={disableNativeCredentialPrompts ? 'none' : 'emailAddress'}
						importantForAutofill={disableNativeCredentialPrompts ? 'no' : 'auto'}
						accessibilityLabel="email-input"
						style={[
							styles.input,
							{
								color: c.onSurface,
								borderColor: c.border,
								backgroundColor: c.surface,
								borderRadius: r.md,
								fontSize: typo.sizes.md,
								paddingHorizontal: s.md,
								paddingVertical: s.sm,
							},
						]}
					/>
				</View>

				<View style={{ marginTop: s.md }}>
					<ThemedText variant="label" style={{ color: c.onSurface, marginBottom: s.xs }}>
						{t('auth.password')}
					</ThemedText>
					<NativeTextInput
						ref={passwordInputRef}
						testID="password-input"
						placeholder={t('auth.placeholders.password')}
						placeholderTextColor={c.placeholder}
						value={password}
						onChangeText={handlePasswordChange}
						autoCapitalize="none"
						autoCorrect={false}
						spellCheck={false}
						autoComplete={disableNativeCredentialPrompts ? 'off' : 'password'}
						textContentType={disableNativeCredentialPrompts ? 'none' : 'password'}
						importantForAutofill={disableNativeCredentialPrompts ? 'no' : 'auto'}
						secureTextEntry={shouldMaskPassword}
						returnKeyType="go"
						onSubmitEditing={
							allowPasswordSubmitKey ? () => void handleLogin() : undefined
						}
						accessibilityLabel="password-input"
						style={[
							styles.input,
							{
								color: c.onSurface,
								borderColor: c.border,
								backgroundColor: c.surface,
								borderRadius: r.md,
								fontSize: typo.sizes.md,
								paddingHorizontal: s.md,
								paddingVertical: s.sm,
							},
						]}
					/>
				</View>

				{loginError ? (
					<ThemedText
						testID="login-error"
						variant="caption"
						style={{ color: c.error, marginTop: s.sm }}
					>
						{loginError}
					</ThemedText>
				) : null}

				<Button
					title={t('auth.signIn')}
					accessibilityLabel="sign-in-button"
					testID="sign-in-button"
					onPress={handleLogin}
					loading={loading}
					disabled={!canSubmitLogin}
					size="lg"
					style={{ marginTop: s.xl }}
				/>

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
	input: {
		borderWidth: 1,
	},
	helpBlock: { alignItems: 'center' },
});
