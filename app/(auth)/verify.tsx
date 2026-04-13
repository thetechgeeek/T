import React, { useState, useEffect, useRef } from 'react';

/** Spacing multiplier for extra-wide gap below header text in verify screen */
const VERIFY_SPACING_FACTOR = 1.5;
import {
	View,
	StyleSheet,
	Alert,
	TouchableOpacity,
	TextInput,
	type NativeSyntheticEvent,
	type TextInputKeyPressEventData,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import type { Href } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useAuthStore } from '@/src/stores/authStore';
import { useLocale } from '@/src/hooks/useLocale';
import { Screen } from '@/src/components/atoms/Screen';
import { Button } from '@/src/components/atoms/Button';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { businessProfileService } from '@/src/services/businessProfileService';

export default function VerifyOtpScreen() {
	const { c, s, r } = useThemeTokens();
	const { t } = useLocale();
	const router = useRouter();
	const { phone } = useLocalSearchParams<{ phone: string }>();

	const { verifyOtp, sendOtp, loading } = useAuthStore(
		useShallow((s) => ({
			verifyOtp: s.verifyOtp,
			sendOtp: s.sendOtp,
			loading: s.loading,
		})),
	);

	const [code, setCode] = useState(['', '', '', '', '', '']);
	const [timer, setTimer] = useState(30);
	const inputs = useRef<Array<TextInput | null>>([]);

	useEffect(() => {
		const interval = setInterval(() => {
			setTimer((prev) => (prev > 0 ? prev - 1 : 0));
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	const handleChange = (text: string, index: number) => {
		const newCode = [...code];
		newCode[index] = text.slice(-1);
		setCode(newCode);

		if (text && index < 5) {
			inputs.current[index + 1]?.focus();
		}
	};

	const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
		if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
			inputs.current[index - 1]?.focus();
		}
	};

	const handleVerify = async () => {
		const otp = code.join('');
		if (otp.length < 6) {
			Alert.alert(t('common.error'), t('auth.errorInvalidOtp'));
			return;
		}

		try {
			await verifyOtp(phone!, otp);
			// After successful login, check if business profile exists
			const profile = await businessProfileService.fetch();
			if (profile && profile.business_name) {
				router.replace('/inventory' as Href);
			} else {
				router.replace('/(auth)/setup');
			}
		} catch (e: unknown) {
			Alert.alert(
				t('auth.errorVerifyFailed'),
				e instanceof Error ? e.message : t('common.unexpectedError'),
			);
		}
	};

	const handleResend = async () => {
		if (timer > 0) return;
		try {
			await sendOtp(phone!);
			setTimer(30);
			Alert.alert(t('common.success'), t('auth.otpResent'));
		} catch (e: unknown) {
			Alert.alert(
				t('common.error'),
				e instanceof Error ? e.message : t('common.unexpectedError'),
			);
		}
	};

	return (
		<Screen safeAreaEdges={['top']}>
			<View style={[styles.container, { padding: s.xl }]}>
				<ThemedText variant="h1" style={{ marginBottom: s.sm }}>
					{t('auth.verifyPhone')}
				</ThemedText>
				<ThemedText
					color={c.onSurfaceVariant}
					style={{ marginBottom: s.xl * VERIFY_SPACING_FACTOR }}
				>
					हमने {phone} पर 6 अंकों का कोड भेजा है
				</ThemedText>

				<View style={styles.otpRow}>
					{code.map((digit, idx) => (
						<TextInput
							key={idx}
							testID={`otp-cell-${idx}`}
							ref={(ref) => {
								inputs.current[idx] = ref;
							}}
							value={digit}
							onChangeText={(text) => handleChange(text, idx)}
							onKeyPress={(e) => handleKeyPress(e, idx)}
							keyboardType="number-pad"
							maxLength={1}
							style={[
								styles.otpInput,
								{
									borderColor: c.border,
									borderRadius: r.sm,
									backgroundColor: c.surface,
									color: c.onSurface,
								},
							]}
						/>
					))}
				</View>

				<Button
					title={t('auth.verify')}
					accessibilityLabel="verify"
					testID="verify-button"
					onPress={handleVerify}
					disabled={loading || code.some((digit) => !digit)}
					loading={loading}
					size="lg"
					style={{ marginTop: s.xl * VERIFY_SPACING_FACTOR }}
				/>

				<View style={styles.resendRow}>
					<ThemedText color={c.onSurfaceVariant}>코드 못 받았나요? </ThemedText>
					<TouchableOpacity
						onPress={handleResend}
						disabled={timer > 0}
						testID="resend-button"
					>
						<ThemedText
							color={timer > 0 ? c.onSurfaceVariant : c.primary}
							weight="bold"
						>
							{timer > 0 ? `Resend in ${timer}s` : t('auth.resendOtp')}
						</ThemedText>
					</TouchableOpacity>
				</View>
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, paddingTop: 40 },
	otpRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 8,
	},
	otpInput: {
		width: 48,
		height: 56,
		borderWidth: 1,
		textAlign: 'center',
		fontSize: 24,
		fontWeight: 'bold',
	},
	resendRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 32,
	},
});
