import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { useTheme } from '@/src/theme/ThemeProvider';

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
	const { theme } = useTheme();
	const c = theme.colors;
	const router = useRouter();
	const [selected, setSelected] = useState<Lang | null>(null);

	const handleSelect = async (lang: Lang) => {
		setSelected(lang);
		await i18n.changeLanguage(lang);
		await AsyncStorage.setItem(LANG_KEY, lang);
	};

	const handleContinue = async () => {
		if (!selected) return;
		await AsyncStorage.setItem(LANG_SELECTED_KEY, 'true');
		router.push('/(auth)/login');
	};

	return (
		<View style={[styles.root, { backgroundColor: c.background }]}>
			{/* Logo + Tagline */}
			<View style={styles.header}>
				<View
					style={[
						styles.logo,
						{ backgroundColor: c.primary, borderRadius: theme.borderRadius.lg },
					]}
				>
					<Text style={{ color: c.onPrimary, fontSize: 28, fontWeight: '700' }}>T</Text>
				</View>
				<Text style={[styles.tagline, { color: c.onSurface, fontSize: 16, marginTop: 12 }]}>
					आपका डिजिटल बही-खाता
				</Text>
			</View>

			{/* Language Cards */}
			<View style={styles.cards}>
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
								styles.card,
								{
									borderColor: isSelected ? c.primary : c.border,
									borderWidth: isSelected ? 3 : 1,
									backgroundColor: isSelected ? c.primaryLight : c.surface,
									borderRadius: theme.borderRadius.lg,
								},
							]}
						>
							<Text
								style={{
									fontSize: 28,
									fontWeight: '700',
									color: isSelected ? c.primary : c.onSurface,
									textAlign: 'center',
								}}
							>
								{title}
							</Text>
							<Text
								style={{
									fontSize: 14,
									color: isSelected ? c.primary : c.onSurfaceVariant,
									textAlign: 'center',
									marginTop: 6,
								}}
							>
								{subtitle}
							</Text>
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
							borderRadius: theme.borderRadius.md,
						},
					]}
				>
					<Text
						style={{
							color: selected ? c.onPrimary : c.placeholder,
							fontSize: 16,
							fontWeight: '700',
						}}
					>
						{selected === 'hi' ? 'आगे बढ़ें' : 'Continue'}
					</Text>
				</Pressable>

				<Text
					style={[
						styles.hint,
						{ color: c.onSurfaceVariant, fontSize: 13, marginTop: 16 },
					]}
				>
					आप बाद में Settings से भाषा बदल सकते हैं
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 24,
		paddingVertical: 40,
	},
	header: {
		alignItems: 'center',
		marginTop: 20,
	},
	logo: {
		width: 64,
		height: 64,
		alignItems: 'center',
		justifyContent: 'center',
	},
	tagline: {
		textAlign: 'center',
	},
	cards: {
		flexDirection: 'row',
		gap: 12,
		width: '100%',
	},
	card: {
		flex: 1,
		height: 120,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 12,
	},
	footer: {
		width: '100%',
		alignItems: 'center',
	},
	continueBtn: {
		width: '100%',
		height: 52,
		alignItems: 'center',
		justifyContent: 'center',
	},
	hint: {
		textAlign: 'center',
	},
});
