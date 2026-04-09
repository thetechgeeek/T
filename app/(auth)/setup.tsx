import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useAuthStore } from '@/src/stores/authStore';
import { useLocale } from '@/src/hooks/useLocale';
import { businessProfileService } from '@/src/services/businessProfileService';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { TextInput } from '@/src/components/atoms/TextInput';
import { Button } from '@/src/components/atoms/Button';

export default function SetupScreen() {
	const { c, s } = useThemeTokens();
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

	const handleCreateAccount = async () => {
		if (!email || !password)
			return Alert.alert(t('common.errorTitle'), t('auth.errorMissingFields'));
		if (password.length < 6)
			return Alert.alert(t('common.errorTitle'), t('auth.passwordLengthError'));
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
		if (!businessName) return Alert.alert(t('common.errorTitle'), t('auth.errorMissingFields'));
		setLoading(true);
		try {
			await businessProfileService.upsert({
				business_name: businessName,
				phone,
				gstin,
				invoice_prefix: t('branding.appShortName'),
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
		<AtomicScreen scrollable>
			<View style={{ padding: s.lg }}>
				<ThemedText variant="h1" color={c.primary} style={{ marginBottom: s.sm }}>
					🏺 {t('branding.appName')}
				</ThemedText>
				<ThemedText
					variant="body"
					color={c.onSurfaceVariant}
					style={{ marginBottom: s.xl }}
				>
					{step === 'account' ? t('auth.welcome') : t('auth.setupBusiness')}
				</ThemedText>

				{step === 'account' ? (
					<>
						<TextInput
							label={t('auth.email')}
							placeholder={t('auth.placeholders.email')}
							value={email}
							onChangeText={setEmail}
							keyboardType="email-address"
							autoCapitalize="none"
							autoComplete="email"
						/>
						<TextInput
							label={t('auth.password')}
							placeholder={t('auth.placeholders.password')}
							value={password}
							onChangeText={setPassword}
							secureTextEntry
							autoComplete="password"
							containerStyle={{ marginTop: s.md }}
						/>
						<Button
							title={`${t('auth.signUp')} →`}
							accessibilityLabel="create-account-button"
							onPress={handleCreateAccount}
							loading={loading}
							style={{ marginTop: s.xl }}
						/>
						<TouchableOpacity
							style={styles.linkBtn}
							onPress={() => router.push('/(auth)/login')}
						>
							<ThemedText color={c.primary} variant="body">
								{t('auth.alreadyHaveAccount')} {t('auth.signIn')}
							</ThemedText>
						</TouchableOpacity>
					</>
				) : (
					<>
						<TextInput
							label={`${t('auth.placeholders.businessName')} *`}
							placeholder={t('auth.placeholders.businessName')}
							value={businessName}
							onChangeText={setBusinessName}
						/>
						<TextInput
							label={t('common.phone')}
							placeholder={t('auth.placeholders.phone')}
							value={phone}
							onChangeText={setPhone}
							keyboardType="phone-pad"
							containerStyle={{ marginTop: s.md }}
						/>
						<TextInput
							label={`${t('customer.gstin')} ${t('common.optional')}`}
							placeholder={t('auth.placeholders.gstin')}
							value={gstin}
							onChangeText={setGstin}
							autoCapitalize="characters"
							containerStyle={{ marginTop: s.md }}
						/>
						<Button
							title={`${t('common.save')} ${t('common.and')} ${t('common.done')} →`}
							accessibilityLabel="save-business-button"
							onPress={handleSaveBusiness}
							loading={loading}
							style={{ marginTop: s.xl }}
						/>
					</>
				)}
			</View>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	linkBtn: { alignItems: 'center', height: 44, justifyContent: 'center', marginTop: 8 },
});
