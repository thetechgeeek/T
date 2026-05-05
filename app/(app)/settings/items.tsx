import React, { useState } from 'react';
import { View, Switch, StyleSheet } from 'react-native';
import { useThemeTokens } from '@easydesign/design-system/foundation';
import type { ThemeColors } from '@/src/theme';
import { Screen } from '@easydesign/design-system';
import { ThemedText } from '@easydesign/design-system';
import { ScreenHeader } from '@easydesign/ui-shell';
import { SectionHeader } from '@easydesign/design-system';
import { SettingsCard } from '@easydesign/design-system';
import { SPACING_PX } from '@easydesign/design-system/foundation';
import { useLocale } from '@/src/hooks/useLocale';

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
	const { t } = useLocale();

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
		<Screen
			safeAreaEdges={['bottom']}
			scrollable
			header={<ScreenHeader title={t('settings.items.title')} />}
			contentContainerStyle={{ paddingBottom: SPACING_PX['2xl'] }}
		>
			<SectionHeader
				title={t('settings.items.general')}
				variant="uppercase"
				titleColor={c.primary}
			/>
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
					label={t('settings.items.itemsModule')}
					sub={t('settings.items.itemsModuleSub')}
					value={itemsModule}
					onChange={setItemsModule}
					c={c}
				/>
				<SwitchRow
					label={t('settings.items.barcodeScanning')}
					value={barcode}
					onChange={setBarcode}
					c={c}
				/>
				<SwitchRow
					label={t('settings.items.trackStockDefault')}
					value={trackStock}
					onChange={setTrackStock}
					c={c}
				/>
				<SwitchRow
					label={t('settings.items.itemCategories')}
					value={categories}
					onChange={setCategories}
					c={c}
					last
				/>
			</SettingsCard>

			<SectionHeader
				title={t('settings.items.pricing')}
				variant="uppercase"
				titleColor={c.primary}
			/>
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
					label={t('settings.items.partyRates')}
					sub={t('settings.items.partyRatesSub')}
					value={partyRates}
					onChange={setPartyRates}
					c={c}
				/>
				<SwitchRow
					label={t('settings.items.itemTax')}
					value={itemTax}
					onChange={setItemTax}
					c={c}
				/>
				<SwitchRow
					label={t('settings.items.itemDiscount')}
					value={itemDiscount}
					onChange={setItemDiscount}
					c={c}
				/>
				<SwitchRow
					label={t('settings.items.showMrp')}
					value={showMrp}
					onChange={setShowMrp}
					c={c}
					last
				/>
			</SettingsCard>

			<SectionHeader
				title={t('settings.items.display')}
				variant="uppercase"
				titleColor={c.primary}
			/>
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
					label={t('settings.items.showDescription')}
					value={showDesc}
					onChange={setShowDesc}
					c={c}
					last
				/>
			</SettingsCard>

			<SectionHeader
				title={t('settings.items.tracking')}
				variant="uppercase"
				titleColor={c.primary}
			/>
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
					label={t('settings.items.batchTracking')}
					sub={t('settings.items.batchTrackingSub')}
					value={batchNo}
					onChange={setBatchNo}
					c={c}
				/>
				<SwitchRow
					label={t('settings.items.expiryTracking')}
					value={expiry}
					onChange={setExpiry}
					c={c}
					last
				/>
			</SettingsCard>
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
