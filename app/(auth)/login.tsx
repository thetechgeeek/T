import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useAuthStore } from '@/src/stores/authStore';
import { useLocale } from '@/src/hooks/useLocale';
import { Screen } from '@/src/components/atoms/Screen';
import { Button } from '@/src/components/atoms/Button';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { TextInput } from '@/src/components/atoms/TextInput';

export default function LoginScreen() {
	const { theme, c, s, r } = useThemeTokens();
	const { t } = useLocale();
	const { login, loading } = useAuthStore(
		useShallow((s) => ({ login: s.login, loading: s.loading })),
	);
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	const handleLogin = async () => {
		if (!email || !password) {
			Alert.alert(t('common.errorTitle'), t('auth.errorMissingFields'));
			return;
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			Alert.alert(t('common.errorTitle'), t('auth.errorInvalidEmail'));
			return;
		}
		try {
			await login(email, password);
		} catch (e: unknown) {
			Alert.alert(
				t('auth.loginFailed'),
				e instanceof Error ? e.message : t('auth.invalidCredentials'),
			);
		}
	};

	const typo = theme.typography;

	return (
		<Screen scrollable safeAreaEdges={['top']}>
			{/* Header */}
			<View style={[styles.header, { backgroundColor: c.primary, paddingTop: s.xl }]}>
				<View
					style={[
						styles.logoMark,
						{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: r.md },
					]}
				>
					<ThemedText
						style={{
							fontSize: typo.sizes['2xl'],
							color: c.onPrimary,
							fontWeight: '700',
						}}
					>
						TM
					</ThemedText>
				</View>
				<ThemedText variant="h1" style={[styles.appName, { color: c.onPrimary }]}>
					TileMaster
				</ThemedText>
				<ThemedText
					style={[
						styles.subtitle,
						{ color: c.onPrimary, fontSize: typo.sizes.sm, opacity: 0.9 },
					]}
				>
					{t('auth.subtitle')}
				</ThemedText>
			</View>

			{/* Form */}
			<View style={[styles.form, { padding: s.lg }]}>
				<ThemedText
					variant="h2"
					accessibilityLabel="sign-in-heading"
					style={{ marginBottom: s.lg }}
				>
					{t('auth.signIn')}
				</ThemedText>

				{/* Email */}
				<TextInput
					label={t('auth.email')}
					accessibilityLabel="email-input"
					accessibilityHint="Enter your registered email address"
					value={email}
					onChangeText={setEmail}
					keyboardType="email-address"
					autoCapitalize="none"
					autoComplete="email"
					placeholder="you@example.com"
				/>

				{/* Password */}
				<TextInput
					label={t('auth.password')}
					accessibilityLabel="password-input"
					accessibilityHint="Enter your account password"
					value={password}
					onChangeText={setPassword}
					secureTextEntry={!showPassword}
					autoComplete="password"
					placeholder="••••••••"
					rightIcon={
						<TouchableOpacity
							onPress={() => setShowPassword(!showPassword)}
							accessibilityRole="button"
							accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
							accessibilityHint={
								showPassword ? 'Password will be hidden' : 'Password will be shown'
							}
						>
							{showPassword ? (
								<EyeOff
									size={20}
									color={c.placeholder}
									importantForAccessibility="no"
								/>
							) : (
								<Eye
									size={20}
									color={c.placeholder}
									importantForAccessibility="no"
								/>
							)}
						</TouchableOpacity>
					}
					containerStyle={{ marginTop: s.md }}
				/>

				{/* Sign In Button */}
				<Button
					title={t('auth.signIn')}
					accessibilityLabel="sign-in-button"
					testID="sign-in-button"
					onPress={handleLogin}
					loading={loading}
					size="lg"
					style={{ marginTop: s.lg }}
				/>

				{/* Setup link */}
				<TouchableOpacity
					style={[styles.linkBtn, { marginTop: s.md }]}
					onPress={() => router.push('/(auth)/setup')}
				>
					<ThemedText color={c.primary}>{t('auth.setupBusiness')} →</ThemedText>
				</TouchableOpacity>
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	header: {
		alignItems: 'center',
		paddingBottom: 40,
		paddingHorizontal: 24,
	},
	logoMark: {
		width: 64,
		height: 64,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 12,
	},
	appName: { marginBottom: 4 },
	subtitle: { textAlign: 'center' },
	form: { flex: 1 },
	linkBtn: { alignItems: 'center', height: 44, justifyContent: 'center' },
});
