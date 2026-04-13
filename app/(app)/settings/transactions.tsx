import { SIZE_AVATAR_MD } from '@/theme/uiMetrics';
import React, { useState } from 'react';
import { View, Switch, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import type { ThemeColors } from '@/src/theme';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { SectionHeader } from '@/src/components/molecules/SectionHeader';
import { SettingsCard } from '@/src/components/molecules/SettingsCard';
import { BORDER_RADIUS_PX, SPACING_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

const PREFIX_INPUT_WIDTH = SIZE_AVATAR_MD;

function SwitchRow({
	label,
	sub,
	value,
	onChange,
	c,
}: {
	label: string;
	sub?: string;
	value: boolean;
	onChange: (v: boolean) => void;
	c: ThemeColors;
}) {
	return (
		<View
			style={[
				styles.row,
				{ borderBottomColor: c.border, borderBottomWidth: StyleSheet.hairlineWidth },
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

export default function TransactionSettingsScreen() {
	const { c } = useThemeTokens();

	const [autoIncrement, setAutoIncrement] = useState(true);
	const [prefix, setPrefix] = useState('INV-');
	const [resetFY, setResetFY] = useState(false);
	const [cashSale, setCashSale] = useState(false);
	const [previewBefore, setPreviewBefore] = useState(false);
	const [showPO, setShowPO] = useState(false);
	const [showTransport, setShowTransport] = useState(false);
	const [showEway, setShowEway] = useState(false);
	const [showRC, setShowRC] = useState(false);
	const [txnDiscount, setTxnDiscount] = useState(false);
	const [addCharges, setAddCharges] = useState(false);
	const [roundOff, setRoundOff] = useState(true);

	return (
		<Screen safeAreaEdges={['bottom']}>
			<ScreenHeader title="Transaction Settings" />
			<ScrollView contentContainerStyle={{ paddingBottom: SPACING_PX['2xl'] }}>
				<SectionHeader title="Invoice Number" variant="uppercase" titleColor={c.primary} />
				<SettingsCard
					padding="none"
					style={[styles.card, { backgroundColor: c.surface, borderWidth: 0 }]}
				>
					<SwitchRow
						label="Auto-increment Invoice No."
						value={autoIncrement}
						onChange={setAutoIncrement}
						c={c}
					/>
					<View
						style={[
							styles.row,
							{
								borderBottomColor: c.border,
								borderBottomWidth: StyleSheet.hairlineWidth,
							},
						]}
					>
						<ThemedText variant="body" style={{ flex: 1 }}>
							Invoice Prefix
						</ThemedText>
						<TextInput
							value={prefix}
							onChangeText={setPrefix}
							style={[
								styles.prefixInput,
								{
									borderColor: c.border,
									color: c.onSurface,
									backgroundColor: c.background,
								},
							]}
							autoCapitalize="characters"
						/>
					</View>
					<SwitchRow
						label="Reset sequence each FY"
						value={resetFY}
						onChange={setResetFY}
						c={c}
					/>
				</SettingsCard>

				<SectionHeader
					title="Invoice Defaults"
					variant="uppercase"
					titleColor={c.primary}
				/>
				<SettingsCard
					padding="none"
					style={[styles.card, { backgroundColor: c.surface, borderWidth: 0 }]}
				>
					<SwitchRow
						label="Default to Cash Sale"
						value={cashSale}
						onChange={setCashSale}
						c={c}
					/>
					<SwitchRow
						label="Invoice Preview Before Save"
						value={previewBefore}
						onChange={setPreviewBefore}
						c={c}
					/>
				</SettingsCard>

				<SectionHeader title="Fields" variant="uppercase" titleColor={c.primary} />
				<SettingsCard
					padding="none"
					style={[styles.card, { backgroundColor: c.surface, borderWidth: 0 }]}
				>
					<SwitchRow
						label="Show PO Number Field"
						value={showPO}
						onChange={setShowPO}
						c={c}
					/>
					<SwitchRow
						label="Show Transportation Details"
						value={showTransport}
						onChange={setShowTransport}
						c={c}
					/>
					<SwitchRow
						label="Show E-way Bill"
						value={showEway}
						onChange={setShowEway}
						c={c}
					/>
					<SwitchRow
						label="Show Reverse Charge"
						value={showRC}
						onChange={setShowRC}
						c={c}
					/>
				</SettingsCard>

				<SectionHeader title="Pricing" variant="uppercase" titleColor={c.primary} />
				<SettingsCard
					padding="none"
					style={[styles.card, { backgroundColor: c.surface, borderWidth: 0 }]}
				>
					<SwitchRow
						label="Transaction-wise Discount"
						value={txnDiscount}
						onChange={setTxnDiscount}
						c={c}
					/>
					<SwitchRow
						label="Additional Charges Section"
						value={addCharges}
						onChange={setAddCharges}
						c={c}
					/>
					<SwitchRow
						label="Round Off Amount"
						value={roundOff}
						onChange={setRoundOff}
						c={c}
					/>
				</SettingsCard>
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	card: { marginHorizontal: SPACING_PX.lg, overflow: 'hidden' },
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: SPACING_PX.md,
		paddingHorizontal: SPACING_PX.lg,
	},
	prefixInput: {
		width: PREFIX_INPUT_WIDTH,
		borderWidth: 1,
		borderRadius: BORDER_RADIUS_PX.md,
		paddingHorizontal: SPACING_PX.sm,
		paddingVertical: SPACING_PX.xs,
		fontSize: FONT_SIZE.caption,
		textAlign: 'center',
	},
});
