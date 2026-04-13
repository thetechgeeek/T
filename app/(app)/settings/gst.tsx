import { OPACITY_TINT_LIGHT } from '@/theme/uiMetrics';
import React, { useState } from 'react';
import { View, Switch, ScrollView, StyleSheet, TextInput, Pressable } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import type { ThemeColors } from '@/src/theme';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { SectionHeader } from '@/src/components/molecules/SectionHeader';
import { SettingsCard } from '@/src/components/molecules/SettingsCard';
import { withOpacity } from '@/src/utils/color';
import { BORDER_RADIUS_PX, SPACING_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

type FilingPeriod = 'monthly' | 'quarterly';

const GST_CARD_BORDER_WIDTH = 1.5;

function SwitchRow({
	label,
	sub,
	value,
	onChange,
	c,
	last,
}: {
	label: string;
	sub?: string;
	value: boolean;
	onChange: (v: boolean) => void;
	c: ThemeColors;
	last?: boolean;
}) {
	return (
		<View
			style={[
				styles.row,
				!last && {
					borderBottomColor: c.border,
					borderBottomWidth: StyleSheet.hairlineWidth,
				},
			]}
		>
			<View style={{ flex: 1 }}>
				<ThemedText variant="body">{label}</ThemedText>
				{sub ? (
					<ThemedText variant="caption" style={{ color: c.onSurfaceVariant }}>
						{sub}
					</ThemedText>
				) : null}
			</View>
			<Switch
				trackColor={{ true: c.primary, false: c.border }}
				value={value}
				onValueChange={onChange}
			/>
		</View>
	);
}

export default function GstSettingsScreen() {
	const { c } = useThemeTokens();

	const [gstRegistered, setGstRegistered] = useState(false);
	const [gstin, setGstin] = useState('');
	const [filingPeriod, setFilingPeriod] = useState<FilingPeriod>('monthly');
	const [composite, setComposite] = useState(false);
	const [showHsn, setShowHsn] = useState(true);
	const [additionalCess, setAdditionalCess] = useState(false);

	return (
		<Screen safeAreaEdges={['bottom']}>
			<ScreenHeader title="GST Settings" />
			<ScrollView contentContainerStyle={{ paddingBottom: SPACING_PX['2xl'] }}>
				{/* GST Registered toggle card */}
				<View
					style={[
						styles.gstCard,
						{
							backgroundColor: gstRegistered
								? withOpacity(c.primary, OPACITY_TINT_LIGHT)
								: c.surface,
							borderColor: gstRegistered ? c.primary : c.border,
						},
					]}
				>
					<View style={{ flex: 1 }}>
						<ThemedText variant="body" weight="bold">
							GST Registered Business
						</ThemedText>
						<ThemedText variant="caption" style={{ color: c.onSurfaceVariant }}>
							{gstRegistered
								? 'GSTIN & GST fields active'
								: 'Enable to configure GST settings'}
						</ThemedText>
					</View>
					<Switch
						trackColor={{ true: c.primary, false: c.border }}
						value={gstRegistered}
						onValueChange={setGstRegistered}
					/>
				</View>

				{gstRegistered && (
					<>
						<SectionHeader title="GSTIN" variant="uppercase" titleColor={c.primary} />
						<SettingsCard
							style={[styles.card, { backgroundColor: c.surface, borderWidth: 0 }]}
							padding="md"
						>
							<ThemedText
								variant="caption"
								style={{ color: c.onSurfaceVariant, marginBottom: SPACING_PX.xs }}
							>
								GSTIN Number
							</ThemedText>
							<TextInput
								value={gstin}
								onChangeText={(v) => setGstin(v.toUpperCase())}
								placeholder="22AAAAA0000A1Z5"
								placeholderTextColor={c.placeholder}
								maxLength={15}
								autoCapitalize="characters"
								style={[
									styles.textInput,
									{ borderColor: c.border, color: c.onSurface },
								]}
							/>
						</SettingsCard>

						<SectionHeader
							title="GST Filing Period"
							variant="uppercase"
							titleColor={c.primary}
						/>
						<View style={[styles.chipRow, { marginHorizontal: SPACING_PX.lg }]}>
							{(['monthly', 'quarterly'] as FilingPeriod[]).map((p) => (
								<Pressable
									key={p}
									onPress={() => setFilingPeriod(p)}
									style={[
										styles.chip,
										filingPeriod === p
											? { backgroundColor: c.primary, borderColor: c.primary }
											: { backgroundColor: c.surface, borderColor: c.border },
									]}
								>
									<ThemedText
										variant="label"
										weight="semibold"
										style={{
											color: filingPeriod === p ? c.onPrimary : c.onSurface,
										}}
									>
										{p === 'monthly' ? 'Monthly' : 'Quarterly'}
									</ThemedText>
								</Pressable>
							))}
						</View>

						<SectionHeader
							title="GST Options"
							variant="uppercase"
							titleColor={c.primary}
						/>
						<SettingsCard
							padding="none"
							style={[styles.card, { backgroundColor: c.surface, borderWidth: 0 }]}
						>
							<SwitchRow
								label="Composite Scheme"
								sub="For turnover under ₹1.5 crore"
								value={composite}
								onChange={setComposite}
								c={c}
							/>
							<SwitchRow
								label="Show HSN/SAC Code Fields"
								value={showHsn}
								onChange={setShowHsn}
								c={c}
							/>
							<SwitchRow
								label="Additional Cess"
								sub="For tobacco, pan masala etc."
								value={additionalCess}
								onChange={setAdditionalCess}
								c={c}
								last
							/>
						</SettingsCard>
					</>
				)}
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	gstCard: {
		marginHorizontal: SPACING_PX.lg,
		marginTop: SPACING_PX.xl,
		borderRadius: BORDER_RADIUS_PX.lg,
		borderWidth: GST_CARD_BORDER_WIDTH,
		padding: SPACING_PX.lg,
		flexDirection: 'row',
		alignItems: 'center',
	},
	card: { marginHorizontal: SPACING_PX.lg, overflow: 'hidden' },
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: SPACING_PX.md,
		paddingHorizontal: SPACING_PX.lg,
	},
	chipRow: { flexDirection: 'row', gap: SPACING_PX.md },
	chip: {
		paddingHorizontal: SPACING_PX.lg,
		paddingVertical: SPACING_PX.sm,
		borderRadius: BORDER_RADIUS_PX.full,
		borderWidth: 1,
	},
	textInput: {
		borderWidth: 1,
		borderRadius: BORDER_RADIUS_PX.md,
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm,
		fontSize: FONT_SIZE.body,
		fontFamily: 'monospace',
		letterSpacing: 1,
	},
});
