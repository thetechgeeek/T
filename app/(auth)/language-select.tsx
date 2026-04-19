import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
	OPACITY_TINT_LIGHT,
	SIZE_AUTH_LOGO_MD,
	SIZE_INPUT_HEIGHT,
	SIZE_LANGUAGE_FLAG,
} from '@/theme/uiMetrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { syncI18nRtlPreference } from '@/src/i18n/rtl';
import { Screen } from '@/src/design-system/components/atoms/Screen';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { withOpacity } from '@/src/utils/color';

const LANG_KEY = '@app/language';
const LANG_SELECTED_KEY = '@app/languageSelected';

type Lang = 'hi' | 'en';

interface LangCard {
	lang: Lang;
	title: string;
	subtitle: string;
}

const LANGUAGES: LangCard[] = [
	{ lang: 'hi', title: 'हिंदी', subtitle: 'हिंदी में चलाएं' },
	{ lang: 'en', title: 'English', subtitle: 'Use in English' },
];

/**
 * P1.1 — Language Selection Screen
 * Route: /(auth)/language-select
 * Shown once on first install. Flag @app/languageSelected in AsyncStorage.
 */
export default function LanguageSelectScreen() {
	const { c, s, r } = useThemeTokens();
	const router = useRouter();
	const [selected, setSelected] = useState<Lang | null>(null);

	const handleSelect = async (lang: Lang) => {
		setSelected(lang);
		await i18n.changeLanguage(lang);
		syncI18nRtlPreference(lang);
		await AsyncStorage.setItem(LANG_KEY, lang);
	};

	const handleContinue = async () => {
		if (!selected) return;
		await AsyncStorage.setItem(LANG_SELECTED_KEY, 'true');
		router.push('/(auth)/login');
	};

	return (
		<Screen
			safeAreaEdges={['top', 'bottom']}
			style={[styles.root, { paddingHorizontal: s.xl, paddingVertical: s['2xl'] + s.sm }]}
			backgroundColor={c.background}
		>
			{/* Logo + Tagline */}
			<View style={[styles.header, { marginTop: s.xl }]}>
				<View style={[styles.logo, { backgroundColor: c.primary, borderRadius: r.lg }]}>
					<ThemedText variant="h1" style={{ color: c.onPrimary, fontWeight: '700' }}>
						T
					</ThemedText>
				</View>
				<ThemedText
					variant="body"
					style={[styles.tagline, { color: c.onSurface, marginTop: s.md }]}
				>
					आपका डिजिटल बही-खाता
				</ThemedText>
			</View>

			{/* Language Cards */}
			<View style={[styles.cards, { gap: s.md }]}>
				{LANGUAGES.map(({ lang, title, subtitle }) => {
					const isSelected = selected === lang;
					return (
						<Pressable
							key={lang}
							testID={`lang-card-${lang}`}
							onPress={() => handleSelect(lang)}
							accessibilityRole="button"
							accessibilityLabel={title}
							accessibilityState={{ selected: isSelected }}
							style={[
								{
									flex: 1,
									height: SIZE_LANGUAGE_FLAG,
									alignItems: 'center',
									justifyContent: 'center',
								},
								{
									padding: s.md,
									borderColor: isSelected ? c.primary : c.border,
									borderWidth: isSelected ? 3 : 1,
									backgroundColor: isSelected
										? withOpacity(c.primary, OPACITY_TINT_LIGHT)
										: c.surface,
									borderRadius: r.lg,
								},
							]}
						>
							<ThemedText
								variant="h1"
								style={{
									fontWeight: '700',
									color: isSelected ? c.primary : c.onSurface,
									textAlign: 'center',
								}}
							>
								{title}
							</ThemedText>
							<ThemedText
								variant="caption"
								style={{
									color: isSelected ? c.primary : c.onSurfaceVariant,
									textAlign: 'center',
									marginTop: s.xs,
								}}
							>
								{subtitle}
							</ThemedText>
						</Pressable>
					);
				})}
			</View>

			{/* Continue Button */}
			<View style={styles.footer}>
				<Pressable
					testID="continue-button"
					onPress={handleContinue}
					disabled={!selected}
					accessibilityRole="button"
					accessibilityLabel="Continue"
					accessibilityState={{ disabled: !selected }}
					style={[
						styles.continueBtn,
						{
							backgroundColor: selected ? c.primary : c.surfaceVariant,
							borderRadius: r.md,
						},
					]}
				>
					<ThemedText
						variant="body"
						style={{
							color: selected ? c.onPrimary : c.placeholder,
							fontWeight: '700',
						}}
					>
						{selected === 'hi' ? 'आगे बढ़ें' : 'Continue'}
					</ThemedText>
				</Pressable>

				<ThemedText
					variant="label"
					style={[styles.hint, { color: c.onSurfaceVariant, marginTop: s.lg }]}
				>
					आप बाद में Settings से भाषा बदल सकते हैं
				</ThemedText>
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	header: {
		alignItems: 'center',
	},
	logo: {
		width: SIZE_AUTH_LOGO_MD,
		height: SIZE_AUTH_LOGO_MD,
		alignItems: 'center',
		justifyContent: 'center',
	},
	tagline: {
		textAlign: 'center',
	},
	cards: {
		flexDirection: 'row',
		width: '100%',
	},
	footer: {
		width: '100%',
		alignItems: 'center',
	},
	continueBtn: {
		width: '100%',
		height: SIZE_INPUT_HEIGHT,
		alignItems: 'center',
		justifyContent: 'center',
	},
	hint: {
		textAlign: 'center',
	},
});
