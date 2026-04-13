import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MULTILINE_INPUT_MIN_HEIGHT = 90;
import i18n from 'i18next';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import type { ThemeMode } from '@/src/theme/index';

const LANG_KEY = '@app/language';
const DATE_FORMAT_KEY = '@app/dateFormat';
const DECIMAL_KEY = '@app/decimalPlaces';

type Lang = 'hi' | 'en';
type DateFormat = 'dmy' | 'dmy-dash' | 'iso';
type DecimalPlaces = 0 | 2;

/**
 * P1.6 — App Preferences Screen
 * Route: /(app)/settings/preferences
 */
export default function PreferencesScreen() {
	const { theme, mode, setThemeMode } = useTheme();
	const c = theme.colors;

	const [selectedLang, setSelectedLang] = useState<Lang>(
		(i18n.language as Lang) === 'en' ? 'en' : 'hi',
	);
	const [dateFormat, setDateFormat] = useState<DateFormat>('dmy');
	const [decimalPlaces, setDecimalPlaces] = useState<DecimalPlaces>(0);

	const handleLangSelect = async (lang: Lang) => {
		setSelectedLang(lang);
		await i18n.changeLanguage(lang);
		await AsyncStorage.setItem(LANG_KEY, lang);
	};

	const handleThemeSelect = (newMode: ThemeMode) => {
		setThemeMode(newMode);
	};

	const handleDateFormat = async (fmt: DateFormat) => {
		setDateFormat(fmt);
		await AsyncStorage.setItem(DATE_FORMAT_KEY, fmt);
	};

	const handleDecimal = async (dp: DecimalPlaces) => {
		setDecimalPlaces(dp);
		await AsyncStorage.setItem(DECIMAL_KEY, String(dp));
	};

	const dateFormatExamples: Record<DateFormat, string> = {
		dmy: '05/04/2025',
		'dmy-dash': '05-Apr-2025',
		iso: '2025-04-05',
	};

	return (
		<View style={[styles.root, { backgroundColor: c.background }]}>
			{/* Header */}
			<View style={[styles.header, { backgroundColor: c.primary }]}>
				<ThemedText variant="h2" style={{ color: c.onPrimary }}>
					Preferences / प्राथमिकताएं
				</ThemedText>
			</View>

			<ScrollView
				contentContainerStyle={{ padding: theme.spacing.lg }}
				keyboardShouldPersistTaps="handled"
			>
				{/* Language Section */}
				<ThemedText variant="h3" style={{ color: c.onSurface, marginBottom: 12 }}>
					भाषा / Language
				</ThemedText>
				<View style={styles.langRow}>
					<Pressable
						testID="lang-card-hi"
						onPress={() => handleLangSelect('hi')}
						style={[
							styles.langCard,
							{
								borderColor: selectedLang === 'hi' ? c.primary : c.border,
								borderWidth: selectedLang === 'hi' ? 2 : 1,
								backgroundColor:
									selectedLang === 'hi' ? `${c.primary}15` : c.surface,
								borderRadius: theme.borderRadius.md,
								marginRight: 8,
							},
						]}
					>
						<Text style={{ fontSize: 22, fontWeight: '700', color: c.onSurface }}>
							हिंदी
						</Text>
						<Text style={{ fontSize: 13, color: c.onSurfaceVariant, marginTop: 4 }}>
							हिंदी में चलाएं
						</Text>
					</Pressable>

					<Pressable
						testID="lang-card-en"
						onPress={() => handleLangSelect('en')}
						style={[
							styles.langCard,
							{
								borderColor: selectedLang === 'en' ? c.primary : c.border,
								borderWidth: selectedLang === 'en' ? 2 : 1,
								backgroundColor:
									selectedLang === 'en' ? `${c.primary}15` : c.surface,
								borderRadius: theme.borderRadius.md,
							},
						]}
					>
						<Text style={{ fontSize: 22, fontWeight: '700', color: c.onSurface }}>
							English
						</Text>
						<Text style={{ fontSize: 13, color: c.onSurfaceVariant, marginTop: 4 }}>
							Use in English
						</Text>
					</Pressable>
				</View>

				{/* Theme Section */}
				<ThemedText
					variant="h3"
					style={{ color: c.onSurface, marginTop: 28, marginBottom: 12 }}
				>
					थीम / Theme
				</ThemedText>
				<View style={styles.themeRow}>
					{(
						[
							{ key: 'light', label: 'Light', subLabel: 'दिन' },
							{ key: 'dark', label: 'Dark', subLabel: 'रात' },
							{ key: 'system', label: 'System', subLabel: 'Auto' },
						] as { key: ThemeMode; label: string; subLabel: string }[]
					).map((opt) => (
						<Pressable
							key={opt.key}
							testID={`theme-option-${opt.key}`}
							onPress={() => handleThemeSelect(opt.key)}
							style={[
								styles.themeCard,
								{
									borderColor: mode === opt.key ? c.primary : c.border,
									borderWidth: mode === opt.key ? 2 : 1,
									backgroundColor:
										mode === opt.key ? `${c.primary}15` : c.surface,
									borderRadius: theme.borderRadius.md,
								},
							]}
						>
							<Text style={{ fontSize: 15, fontWeight: '600', color: c.onSurface }}>
								{opt.label}
							</Text>
							<Text style={{ fontSize: 12, color: c.onSurfaceVariant, marginTop: 2 }}>
								{opt.subLabel}
							</Text>
						</Pressable>
					))}
				</View>

				{/* Date Format Section */}
				<ThemedText
					variant="h3"
					style={{ color: c.onSurface, marginTop: 28, marginBottom: 12 }}
				>
					Date Format
				</ThemedText>
				{(
					[
						{ key: 'dmy', label: 'DD/MM/YYYY' },
						{ key: 'dmy-dash', label: 'DD-MMM-YYYY' },
						{ key: 'iso', label: 'YYYY-MM-DD (ISO)' },
					] as { key: DateFormat; label: string }[]
				).map((fmt) => (
					<Pressable
						key={fmt.key}
						testID={`date-format-${fmt.key}`}
						onPress={() => handleDateFormat(fmt.key)}
						style={[
							styles.dateRow,
							{
								backgroundColor:
									dateFormat === fmt.key ? `${c.primary}15` : c.surface,
								borderColor: dateFormat === fmt.key ? c.primary : c.border,
								borderWidth: dateFormat === fmt.key ? 2 : 1,
								borderRadius: theme.borderRadius.md,
								marginBottom: 8,
							},
						]}
					>
						<View style={styles.dateRadio}>
							<View
								style={[
									styles.radioOuter,
									{ borderColor: dateFormat === fmt.key ? c.primary : c.border },
								]}
							>
								{dateFormat === fmt.key && (
									<View
										style={[styles.radioInner, { backgroundColor: c.primary }]}
									/>
								)}
							</View>
							<Text style={{ fontSize: 15, color: c.onSurface, marginLeft: 10 }}>
								{fmt.label}
							</Text>
						</View>
						<Text style={{ fontSize: 13, color: c.onSurfaceVariant }}>
							{dateFormatExamples[fmt.key]}
						</Text>
					</Pressable>
				))}

				{/* Decimal Places Section */}
				<ThemedText
					variant="h3"
					style={{ color: c.onSurface, marginTop: 28, marginBottom: 12 }}
				>
					Decimal Places
				</ThemedText>
				<ThemedText style={{ color: c.onSurfaceVariant, fontSize: 14, marginBottom: 10 }}>
					Currency: INR (₹) — Only INR supported currently
				</ThemedText>
				<View style={styles.decimalRow}>
					<Pressable
						testID="decimal-0"
						onPress={() => handleDecimal(0)}
						style={[
							styles.decimalBtn,
							{
								borderColor: decimalPlaces === 0 ? c.primary : c.border,
								borderWidth: decimalPlaces === 0 ? 2 : 1,
								backgroundColor: decimalPlaces === 0 ? `${c.primary}15` : c.surface,
								borderRadius: theme.borderRadius.md,
								marginRight: 8,
							},
						]}
					>
						<Text style={{ fontSize: 15, fontWeight: '600', color: c.onSurface }}>
							0
						</Text>
						<Text style={{ fontSize: 12, color: c.onSurfaceVariant }}>₹ 1,00,000</Text>
					</Pressable>

					<Pressable
						testID="decimal-2"
						onPress={() => handleDecimal(2)}
						style={[
							styles.decimalBtn,
							{
								borderColor: decimalPlaces === 2 ? c.primary : c.border,
								borderWidth: decimalPlaces === 2 ? 2 : 1,
								backgroundColor: decimalPlaces === 2 ? `${c.primary}15` : c.surface,
								borderRadius: theme.borderRadius.md,
							},
						]}
					>
						<Text style={{ fontSize: 15, fontWeight: '600', color: c.onSurface }}>
							2
						</Text>
						<Text style={{ fontSize: 12, color: c.onSurfaceVariant }}>
							₹ 1,00,000.00
						</Text>
					</Pressable>
				</View>

				<ThemedText
					style={{
						color: c.onSurfaceVariant,
						fontSize: 13,
						marginTop: 28,
						textAlign: 'center',
					}}
				>
					आप बाद में Settings से भाषा बदल सकते हैं
				</ThemedText>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1 },
	header: {
		alignItems: 'center',
		paddingVertical: 20,
		paddingHorizontal: 24,
	},
	langRow: {
		flexDirection: 'row',
	},
	langCard: {
		flex: 1,
		padding: 16,
		alignItems: 'center',
		borderWidth: 1,
		minHeight: MULTILINE_INPUT_MIN_HEIGHT,
		justifyContent: 'center',
	},
	themeRow: {
		flexDirection: 'row',
		gap: 8,
	},
	themeCard: {
		flex: 1,
		padding: 14,
		alignItems: 'center',
		borderWidth: 1,
	},
	dateRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 14,
		borderWidth: 1,
	},
	dateRadio: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	radioOuter: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderWidth: 2,
		alignItems: 'center',
		justifyContent: 'center',
	},
	radioInner: {
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	decimalRow: {
		flexDirection: 'row',
	},
	decimalBtn: {
		flex: 1,
		padding: 14,
		alignItems: 'center',
		borderWidth: 1,
	},
});
