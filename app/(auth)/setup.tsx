import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useAuthStore } from '@/src/stores/authStore';
import { useLocale } from '@/src/hooks/useLocale';
import { businessProfileService } from '@/src/services/businessProfileService';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { TextInput } from '@/src/components/atoms/TextInput';

export default function SetupScreen() {
	const { theme, c, s, r } = useThemeTokens();
	const { t } = useLocale();
	const { register } = useAuthStore();
	const router = useRouter();

	const [step, setStep] = useState<'account' | 'business'>('account');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [businessName, setBusinessName] = useState('');
	const [phone, setPhone] = useState('');
	const [gstin, setGstin] = useState('');
	const [loading, setLoading] = useState(false);

	const typo = theme.typography;

	const handleCreateAccount = async () => {
		if (!email || !password)
			return Alert.alert(t('common.errorTitle'), 'Email and password are required');
		if (password.length < 6)
			return Alert.alert(t('common.errorTitle'), 'Password must be at least 6 characters');
		setLoading(true);
		try {
			await register(email, password);
			setStep('business');
		} catch (e: unknown) {
			Alert.alert(
				t('common.errorTitle'),
				e instanceof Error ? e.message : t('common.unexpectedError'),
			);
		} finally {
			setLoading(false);
		}
	};

	const handleSaveBusiness = async () => {
		if (!businessName) return Alert.alert(t('common.errorTitle'), 'Business name is required');
		setLoading(true);
		try {
			await businessProfileService.upsert({
				business_name: businessName,
				phone,
				gstin,
				invoice_prefix: 'TM',
				invoice_sequence: 0,
			});
			router.replace('/(app)/(tabs)');
		} catch (e: unknown) {
			Alert.alert(
				t('common.errorTitle'),
				e instanceof Error ? e.message : t('common.unexpectedError'),
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Screen scrollable>
			<View style={{ padding: s.lg }}>
				<ThemedText variant="h1" color={c.primary} style={{ marginBottom: s.sm }}>
					🏺 TileMaster
				</ThemedText>
				<ThemedText
					variant="body1"
					color={c.onSurfaceVariant}
					style={{ marginBottom: s.xl }}
				>
					{step === 'account' ? t('auth.welcome') : t('auth.setupBusiness')}
				</ThemedText>

				{step === 'account' ? (
					<>
						<TextInput
							label={t('auth.email')}
							placeholder="you@example.com"
							value={email}
							onChangeText={setEmail}
							keyboardType="email-address"
							autoCapitalize="none"
							autoComplete="email"
						/>
						<TextInput
							label={t('auth.password')}
							placeholder="••••••••"
							value={password}
							onChangeText={setPassword}
							secureTextEntry
							autoComplete="password"
							containerStyle={{ marginTop: s.md }}
						/>
						<TouchableOpacity
							style={[
								styles.button,
								{ backgroundColor: c.primary, borderRadius: r.md, marginTop: s.xl },
							]}
							onPress={handleCreateAccount}
							disabled={loading}
						>
							{loading ? (
								<ActivityIndicator color={c.onPrimary} />
							) : (
								<ThemedText weight="semibold" style={{ color: c.onPrimary }}>
									{t('common.add')} Account →
								</ThemedText>
							)}
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.linkBtn}
							onPress={() => router.push('/(auth)/login')}
						>
							<ThemedText color={c.primary} variant="body2">
								Already have an account? {t('auth.signIn')}
							</ThemedText>
						</TouchableOpacity>
					</>
				) : (
					<>
						<TextInput
							label="Business Name *"
							placeholder="Enter business name"
							value={businessName}
							onChangeText={setBusinessName}
						/>
						<TextInput
							label="Phone"
							placeholder="Enter phone number"
							value={phone}
							onChangeText={setPhone}
							keyboardType="phone-pad"
							containerStyle={{ marginTop: s.md }}
						/>
						<TextInput
							label="GSTIN (optional)"
							placeholder="Enter GSTIN"
							value={gstin}
							onChangeText={setGstin}
							autoCapitalize="characters"
							containerStyle={{ marginTop: s.md }}
						/>
						<TouchableOpacity
							style={[
								styles.button,
								{ backgroundColor: c.primary, borderRadius: r.md, marginTop: s.xl },
							]}
							onPress={handleSaveBusiness}
							disabled={loading}
						>
							{loading ? (
								<ActivityIndicator color={c.onPrimary} />
							) : (
								<ThemedText weight="semibold" style={{ color: c.onPrimary }}>
									{t('common.save')} & Continue →
								</ThemedText>
							)}
						</TouchableOpacity>
					</>
				)}
			</View>
		</Screen>
	);
}

// Remove the obsolete InputField function

const styles = StyleSheet.create({
	button: { height: 52, alignItems: 'center', justifyContent: 'center' },
	linkBtn: { alignItems: 'center', height: 44, justifyContent: 'center', marginTop: 8 },
});
