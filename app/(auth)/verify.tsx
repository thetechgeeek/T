import React, { useState, useEffect, useRef } from 'react';
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
import { Screen } from '@/src/design-system/components/atoms/Screen';
import { Button } from '@/src/design-system/components/atoms/Button';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { businessProfileService } from '@/src/services/businessProfileService';
import { SIZE_INPUT_HEIGHT } from '@/src/theme/uiMetrics';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

export default function VerifyOtpScreen() {
	const { theme, c, s, r, typo } = useThemeTokens();
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
			const profile = await businessProfileService.get();
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
			<View style={[styles.container, { padding: s.xl, paddingTop: s['2xl'] + s.sm }]}>
				<ThemedText variant="h1" style={{ marginBottom: s.sm }}>
					{t('auth.verifyPhone')}
				</ThemedText>
				<ThemedText color={c.onSurfaceVariant} style={{ marginBottom: s['2xl'] + s.xs }}>
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
									width: theme.touchTarget,
									height: SIZE_INPUT_HEIGHT,
									fontSize: typo.sizes['3xl'],
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
					style={{ marginTop: s['2xl'] + s.xs }}
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
	container: { flex: 1 },
	otpRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: SPACING_PX.sm,
	},
	otpInput: {
		borderWidth: 1,
		textAlign: 'center',
		fontWeight: 'bold',
	},
	resendRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: SPACING_PX['2xl'],
	},
});
