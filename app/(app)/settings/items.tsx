import React, { useState } from 'react';
import { View, Switch, ScrollView, StyleSheet } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import type { ThemeColors } from '@/src/theme';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { SectionHeader } from '@/src/components/molecules/SectionHeader';
import { SettingsCard } from '@/src/components/molecules/SettingsCard';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

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

export default function ItemSettingsScreen() {
	const { c } = useThemeTokens();

	const [itemsModule, setItemsModule] = useState(true);
	const [barcode, setBarcode] = useState(false);
	const [trackStock, setTrackStock] = useState(true);
	const [categories, setCategories] = useState(false);
	const [partyRates, setPartyRates] = useState(false);
	const [itemTax, setItemTax] = useState(true);
	const [itemDiscount, setItemDiscount] = useState(false);
	const [showMrp, setShowMrp] = useState(false);
	const [showDesc, setShowDesc] = useState(false);
	const [batchNo, setBatchNo] = useState(false);
	const [expiry, setExpiry] = useState(false);

	return (
		<Screen safeAreaEdges={['bottom']}>
			<ScreenHeader title="Item Settings" />
			<ScrollView contentContainerStyle={{ paddingBottom: SPACING_PX['2xl'] }}>
				<SectionHeader title="General" variant="uppercase" titleColor={c.primary} />
				<SettingsCard
					padding="none"
					style={{
						marginHorizontal: SPACING_PX.lg,
						overflow: 'hidden',
						backgroundColor: c.surface,
						borderWidth: 0,
					}}
				>
					<SwitchRow
						label="Items Module"
						sub="Master switch for all item features"
						value={itemsModule}
						onChange={setItemsModule}
						c={c}
					/>
					<SwitchRow
						label="Barcode Scanning"
						value={barcode}
						onChange={setBarcode}
						c={c}
					/>
					<SwitchRow
						label="Track Stock by Default"
						value={trackStock}
						onChange={setTrackStock}
						c={c}
					/>
					<SwitchRow
						label="Item Categories"
						value={categories}
						onChange={setCategories}
						c={c}
						last
					/>
				</SettingsCard>

				<SectionHeader title="Pricing" variant="uppercase" titleColor={c.primary} />
				<SettingsCard
					padding="none"
					style={{
						marginHorizontal: SPACING_PX.lg,
						overflow: 'hidden',
						backgroundColor: c.surface,
						borderWidth: 0,
					}}
				>
					<SwitchRow
						label="Party-wise Item Rates"
						sub="Different prices per party"
						value={partyRates}
						onChange={setPartyRates}
						c={c}
					/>
					<SwitchRow label="Item-wise Tax" value={itemTax} onChange={setItemTax} c={c} />
					<SwitchRow
						label="Item-wise Discount"
						value={itemDiscount}
						onChange={setItemDiscount}
						c={c}
					/>
					<SwitchRow label="Show MRP" value={showMrp} onChange={setShowMrp} c={c} last />
				</SettingsCard>

				<SectionHeader title="Display" variant="uppercase" titleColor={c.primary} />
				<SettingsCard
					padding="none"
					style={{
						marginHorizontal: SPACING_PX.lg,
						overflow: 'hidden',
						backgroundColor: c.surface,
						borderWidth: 0,
					}}
				>
					<SwitchRow
						label="Show Item Description"
						value={showDesc}
						onChange={setShowDesc}
						c={c}
						last
					/>
				</SettingsCard>

				<SectionHeader title="Tracking" variant="uppercase" titleColor={c.primary} />
				<SettingsCard
					padding="none"
					style={{
						marginHorizontal: SPACING_PX.lg,
						overflow: 'hidden',
						backgroundColor: c.surface,
						borderWidth: 0,
					}}
				>
					<SwitchRow
						label="Batch Number Tracking"
						sub="For manufacturing & pharma"
						value={batchNo}
						onChange={setBatchNo}
						c={c}
					/>
					<SwitchRow
						label="Expiry Date Tracking"
						value={expiry}
						onChange={setExpiry}
						c={c}
						last
					/>
				</SettingsCard>
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: SPACING_PX.md,
		paddingHorizontal: SPACING_PX.lg,
	},
});
