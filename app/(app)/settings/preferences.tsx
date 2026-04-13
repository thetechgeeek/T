import React, { useState } from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import type { ThemeMode } from '@/src/theme/index';
import { Screen } from '@/src/components/atoms/Screen';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { SectionHeader } from '@/src/components/molecules/SectionHeader';
import { withOpacity } from '@/src/utils/color';
import { OPACITY_TINT_LIGHT } from '@/theme/uiMetrics';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

const LANG_KEY = '@app/language';
const DATE_FORMAT_KEY = '@app/dateFormat';
const DECIMAL_KEY = '@app/decimalPlaces';
const OPTION_CARD_MIN_HEIGHT = 90;
const RADIO_OUTER_SIZE = 20;
const RADIO_OUTER_RADIUS = 10;
const RADIO_INNER_SIZE = 10;
const RADIO_INNER_RADIUS = 5;
const ZERO_SPACING = 0;

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
		<Screen safeAreaEdges={['bottom']}>
			<ScreenHeader title="Preferences / प्राथमिकताएं" />
			<ScrollView
				contentContainerStyle={{
					padding: theme.spacing.lg,
					paddingBottom: SPACING_PX['2xl'],
				}}
				keyboardShouldPersistTaps="handled"
			>
				{/* Language Section */}
				<SectionHeader title="भाषा / Language" style={styles.sectionHeader} />
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
									selectedLang === 'hi'
										? withOpacity(c.primary, OPACITY_TINT_LIGHT)
										: c.surface,
								borderRadius: theme.borderRadius.md,
								marginRight: SPACING_PX.sm,
							},
						]}
					>
						<ThemedText variant="h1" weight="bold" color={c.onSurface}>
							हिंदी
						</ThemedText>
						<ThemedText
							variant="label"
							color={c.onSurfaceVariant}
							style={{ marginTop: SPACING_PX.xs }}
						>
							हिंदी में चलाएं
						</ThemedText>
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
									selectedLang === 'en'
										? withOpacity(c.primary, OPACITY_TINT_LIGHT)
										: c.surface,
								borderRadius: theme.borderRadius.md,
							},
						]}
					>
						<ThemedText variant="h1" weight="bold" color={c.onSurface}>
							English
						</ThemedText>
						<ThemedText
							variant="label"
							color={c.onSurfaceVariant}
							style={{ marginTop: SPACING_PX.xs }}
						>
							Use in English
						</ThemedText>
					</Pressable>
				</View>

				{/* Theme Section */}
				<SectionHeader title="थीम / Theme" style={styles.sectionHeader} />
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
										mode === opt.key
											? withOpacity(c.primary, OPACITY_TINT_LIGHT)
											: c.surface,
									borderRadius: theme.borderRadius.md,
								},
							]}
						>
							<ThemedText variant="body" weight="semibold" color={c.onSurface}>
								{opt.label}
							</ThemedText>
							<ThemedText
								variant="captionSmall"
								color={c.onSurfaceVariant}
								style={{ marginTop: SPACING_PX.xxs }}
							>
								{opt.subLabel}
							</ThemedText>
						</Pressable>
					))}
				</View>

				{/* Date Format Section */}
				<SectionHeader title="Date Format" style={styles.sectionHeader} />
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
									dateFormat === fmt.key
										? withOpacity(c.primary, OPACITY_TINT_LIGHT)
										: c.surface,
								borderColor: dateFormat === fmt.key ? c.primary : c.border,
								borderWidth: dateFormat === fmt.key ? 2 : 1,
								borderRadius: theme.borderRadius.md,
								marginBottom: SPACING_PX.sm,
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
							<ThemedText
								variant="body"
								color={c.onSurface}
								style={{ marginLeft: SPACING_PX.md }}
							>
								{fmt.label}
							</ThemedText>
						</View>
						<ThemedText variant="label" color={c.onSurfaceVariant}>
							{dateFormatExamples[fmt.key]}
						</ThemedText>
					</Pressable>
				))}

				{/* Decimal Places Section */}
				<SectionHeader title="Decimal Places" style={styles.sectionHeader} />
				<ThemedText
					variant="caption"
					style={{
						color: c.onSurfaceVariant,
						marginBottom: SPACING_PX.md,
					}}
				>
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
								backgroundColor:
									decimalPlaces === 0
										? withOpacity(c.primary, OPACITY_TINT_LIGHT)
										: c.surface,
								borderRadius: theme.borderRadius.md,
								marginRight: SPACING_PX.sm,
							},
						]}
					>
						<ThemedText variant="body" weight="semibold" color={c.onSurface}>
							0
						</ThemedText>
						<ThemedText variant="captionSmall" color={c.onSurfaceVariant}>
							₹ 1,00,000
						</ThemedText>
					</Pressable>

					<Pressable
						testID="decimal-2"
						onPress={() => handleDecimal(2)}
						style={[
							styles.decimalBtn,
							{
								borderColor: decimalPlaces === 2 ? c.primary : c.border,
								borderWidth: decimalPlaces === 2 ? 2 : 1,
								backgroundColor:
									decimalPlaces === 2
										? withOpacity(c.primary, OPACITY_TINT_LIGHT)
										: c.surface,
								borderRadius: theme.borderRadius.md,
							},
						]}
					>
						<ThemedText variant="body" weight="semibold" color={c.onSurface}>
							2
						</ThemedText>
						<ThemedText variant="captionSmall" color={c.onSurfaceVariant}>
							₹ 1,00,000.00
						</ThemedText>
					</Pressable>
				</View>

				<ThemedText
					variant="label"
					style={{
						color: c.onSurfaceVariant,
						marginTop: SPACING_PX.xl,
						textAlign: 'center',
					}}
				>
					आप बाद में Settings से भाषा बदल सकते हैं
				</ThemedText>
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	sectionHeader: { paddingHorizontal: ZERO_SPACING },
	langRow: {
		flexDirection: 'row',
	},
	langCard: {
		flex: 1,
		padding: SPACING_PX.lg,
		alignItems: 'center',
		borderWidth: 1,
		minHeight: OPTION_CARD_MIN_HEIGHT,
		justifyContent: 'center',
	},
	themeRow: {
		flexDirection: 'row',
		gap: SPACING_PX.sm,
	},
	themeCard: {
		flex: 1,
		padding: SPACING_PX.md,
		alignItems: 'center',
		borderWidth: 1,
	},
	dateRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: SPACING_PX.md,
		borderWidth: 1,
	},
	dateRadio: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	radioOuter: {
		width: RADIO_OUTER_SIZE,
		height: RADIO_OUTER_SIZE,
		borderRadius: RADIO_OUTER_RADIUS,
		borderWidth: 2,
		alignItems: 'center',
		justifyContent: 'center',
	},
	radioInner: {
		width: RADIO_INNER_SIZE,
		height: RADIO_INNER_SIZE,
		borderRadius: RADIO_INNER_RADIUS,
	},
	decimalRow: {
		flexDirection: 'row',
	},
	decimalBtn: {
		flex: 1,
		padding: SPACING_PX.md,
		alignItems: 'center',
		borderWidth: 1,
	},
});
