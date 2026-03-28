import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useAuthStore } from '@/src/stores/authStore';
import { useLocale } from '@/src/hooks/useLocale';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { TextInput } from '@/src/components/atoms/TextInput';

export default function LoginScreen() {
	const { theme } = useTheme();
	const { t } = useLocale();
	const { login, loading } = useAuthStore();
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	const handleLogin = async () => {
		if (!email || !password) {
			Alert.alert('Error', 'Please enter email and password');
			return;
		}
		try {
			await login(email, password);
		} catch (e: any) {
			Alert.alert('Login Failed', e.message ?? 'Invalid credentials');
		}
	};

	const c = theme.colors;
	const s = theme.spacing;
	const r = theme.borderRadius;
	const typo = theme.typography;

	return (
		<Screen scrollable safeAreaEdges={['top']}>
			{/* Header */}
			<View style={[styles.header, { backgroundColor: c.primary, paddingTop: s.xl }]}>
				<ThemedText style={[styles.logo, { fontSize: typo.sizes['3xl'] }]}>🏺</ThemedText>
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
				<ThemedText variant="h2" style={{ marginBottom: s.lg }}>
					{t('auth.signIn')}
				</ThemedText>

				{/* Email */}
				<TextInput
					label={t('auth.email')}
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
					value={password}
					onChangeText={setPassword}
					secureTextEntry={!showPassword}
					autoComplete="password"
					placeholder="••••••••"
					rightIcon={
						<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
							<ThemedText color={c.primary}>{showPassword ? '🙈' : '👁️'}</ThemedText>
						</TouchableOpacity>
					}
					containerStyle={{ marginTop: s.md }}
				/>

				{/* Sign In Button */}
				<TouchableOpacity
					style={[
						styles.button,
						{ backgroundColor: c.primary, borderRadius: r.md, marginTop: s.lg },
					]}
					onPress={handleLogin}
					disabled={loading}
					activeOpacity={0.85}
				>
					{loading ? (
						<ActivityIndicator color={c.onPrimary} />
					) : (
						<ThemedText weight="semibold" style={{ color: c.onPrimary }}>
							{t('auth.signIn')}
						</ThemedText>
					)}
				</TouchableOpacity>

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
	logo: { marginBottom: 8 },
	appName: { marginBottom: 4 },
	subtitle: { textAlign: 'center' },
	form: { flex: 1 },
	button: {
		height: 52,
		alignItems: 'center',
		justifyContent: 'center',
	},
	linkBtn: { alignItems: 'center', height: 44, justifyContent: 'center' },
});
