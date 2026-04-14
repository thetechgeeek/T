import { OPACITY_HOVER } from '@/theme/uiMetrics';
import React, { useState } from 'react';
import { View, Switch, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import type { ThemeColors } from '@/src/theme';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { SectionHeader } from '@/src/components/molecules/SectionHeader';
import { SettingsCard } from '@/src/components/molecules/SettingsCard';
import { BORDER_RADIUS_PX, SPACING_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

type PaperType = 'thermal58' | 'thermal80' | 'a4' | 'a5';

const PAPER_TYPES: { key: PaperType; label: string }[] = [
	{ key: 'thermal58', label: 'Thermal 58mm' },
	{ key: 'thermal80', label: 'Thermal 80mm' },
	{ key: 'a4', label: 'A4' },
	{ key: 'a5', label: 'A5' },
];

const THEME_RECT_WIDTH = 40;
const THEME_RECT_HEIGHT = 56;
const THEME_CHECK_SIZE = 18;
const ZERO_SPACING = 0;

function SwitchRow({
	label,
	value,
	onChange,
	c,
	last,
}: {
	label: string;
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
			<ThemedText variant="body" style={{ flex: 1 }}>
				{label}
			</ThemedText>
			<Switch
				trackColor={{ true: c.primary, false: c.border }}
				value={value}
				onValueChange={onChange}
			/>
		</View>
	);
}

export default function PrintSettingsScreen() {
	const { c, theme: appTheme } = useThemeTokens();

	const [paper, setPaper] = useState<PaperType>('a4');
	const [theme, setTheme] = useState('professional');

	const [logo, setLogo] = useState(true);
	const [bizName, setBizName] = useState(true);
	const [address, setAddress] = useState(true);
	const [phone, setPhone] = useState(true);
	const [gstin, setGstin] = useState(true);

	const [itemCode, setItemCode] = useState(false);
	const [hsnCode, setHsnCode] = useState(true);
	const [discount, setDiscount] = useState(false);
	const [mrp, setMrp] = useState(false);

	const [gstBreakup, setGstBreakup] = useState(true);
	const [amtWords, setAmtWords] = useState(true);
	const [upiQr, setUpiQr] = useState(false);

	const [footer1, setFooter1] = useState('');
	const [footer2, setFooter2] = useState('');
	const [signature, setSignature] = useState(false);

	return (
		<Screen safeAreaEdges={['bottom']}>
			<ScreenHeader title="Invoice Print Settings" />
			<ScrollView contentContainerStyle={{ paddingBottom: SPACING_PX['2xl'] }}>
				<SectionHeader title="Paper Type" variant="uppercase" titleColor={c.primary} />
				<View style={[styles.chipRow, { marginHorizontal: SPACING_PX.lg }]}>
					{PAPER_TYPES.map((p) => (
						<Pressable
							key={p.key}
							onPress={() => setPaper(p.key)}
							style={[
								styles.chip,
								paper === p.key
									? { backgroundColor: c.primary, borderColor: c.primary }
									: { backgroundColor: c.surface, borderColor: c.border },
							]}
						>
							<ThemedText
								variant="caption"
								color={paper === p.key ? c.onPrimary : c.onSurface}
								weight="semibold"
							>
								{p.label}
							</ThemedText>
						</Pressable>
					))}
				</View>

				<SectionHeader title="Invoice Theme" variant="uppercase" titleColor={c.primary} />
				<View style={[styles.themeRow, { marginHorizontal: SPACING_PX.lg }]}>
					{appTheme.collections.printThemeSwatches.map((t) => (
						<Pressable
							key={t.key}
							onPress={() => setTheme(t.key)}
							style={{ alignItems: 'center' }}
						>
							<View
								style={[
									styles.themeRect,
									{ backgroundColor: t.color },
									theme === t.key && [
										styles.themeSelected,
										{ borderColor: c.white },
									],
								]}
							>
								{theme === t.key && (
									<ThemedText
										style={{ color: c.white, fontSize: THEME_CHECK_SIZE }}
									>
										✓
									</ThemedText>
								)}
							</View>
							<ThemedText
								variant="caption"
								style={{
									color: c.onSurfaceVariant,
									marginTop: SPACING_PX.xs,
									textAlign: 'center',
								}}
								numberOfLines={1}
							>
								{t.label}
							</ThemedText>
						</Pressable>
					))}
				</View>

				<SectionHeader title="Company Header" variant="uppercase" titleColor={c.primary} />
				<SettingsCard
					padding="none"
					style={[styles.card, { backgroundColor: c.surface, borderWidth: 0 }]}
				>
					<SwitchRow label="Logo" value={logo} onChange={setLogo} c={c} />
					<SwitchRow label="Business Name" value={bizName} onChange={setBizName} c={c} />
					<SwitchRow label="Address" value={address} onChange={setAddress} c={c} />
					<SwitchRow label="Phone" value={phone} onChange={setPhone} c={c} />
					<SwitchRow label="GSTIN" value={gstin} onChange={setGstin} c={c} last />
				</SettingsCard>

				<SectionHeader title="Invoice Fields" variant="uppercase" titleColor={c.primary} />
				<SettingsCard
					padding="none"
					style={[styles.card, { backgroundColor: c.surface, borderWidth: 0 }]}
				>
					<SwitchRow label="Item Code" value={itemCode} onChange={setItemCode} c={c} />
					<SwitchRow label="HSN Code" value={hsnCode} onChange={setHsnCode} c={c} />
					<SwitchRow
						label="Discount Column"
						value={discount}
						onChange={setDiscount}
						c={c}
					/>
					<SwitchRow label="MRP" value={mrp} onChange={setMrp} c={c} last />
				</SettingsCard>

				<SectionHeader title="Totals" variant="uppercase" titleColor={c.primary} />
				<SettingsCard
					padding="none"
					style={[styles.card, { backgroundColor: c.surface, borderWidth: 0 }]}
				>
					<SwitchRow
						label="GST Breakup"
						value={gstBreakup}
						onChange={setGstBreakup}
						c={c}
					/>
					<SwitchRow
						label="Amount in Words"
						value={amtWords}
						onChange={setAmtWords}
						c={c}
					/>
					<SwitchRow label="UPI QR Code" value={upiQr} onChange={setUpiQr} c={c} last />
				</SettingsCard>

				<SectionHeader title="Footer" variant="uppercase" titleColor={c.primary} />
				<SettingsCard
					style={[styles.card, { backgroundColor: c.surface, borderWidth: 0 }]}
					padding="md"
				>
					<ThemedText
						variant="caption"
						style={{ color: c.onSurfaceVariant, marginBottom: SPACING_PX.xs }}
					>
						Footer Line 1
					</ThemedText>
					<TextInput
						value={footer1}
						onChangeText={setFooter1}
						placeholder="Thank you for your business!"
						placeholderTextColor={c.placeholder}
						style={[styles.textInput, { borderColor: c.border, color: c.onSurface }]}
					/>
					<ThemedText
						variant="caption"
						style={{
							color: c.onSurfaceVariant,
							marginBottom: SPACING_PX.xs,
							marginTop: SPACING_PX.md,
						}}
					>
						Footer Line 2
					</ThemedText>
					<TextInput
						value={footer2}
						onChangeText={setFooter2}
						placeholder="Visit us again"
						placeholderTextColor={c.placeholder}
						style={[
							styles.textInput,
							{
								borderColor: c.border,
								color: c.onSurface,
								marginBottom: SPACING_PX.md,
							},
						]}
					/>
					<View
						style={[
							styles.row,
							{
								paddingHorizontal: ZERO_SPACING,
								borderTopColor: c.border,
								borderTopWidth: StyleSheet.hairlineWidth,
							},
						]}
					>
						<ThemedText variant="body" style={{ flex: 1 }}>
							Show Signature Box
						</ThemedText>
						<Switch
							trackColor={{ true: c.primary, false: c.border }}
							value={signature}
							onValueChange={setSignature}
						/>
					</View>
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
	chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING_PX.sm },
	chip: {
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm,
		borderRadius: BORDER_RADIUS_PX.full,
		borderWidth: 1,
	},
	themeRow: { flexDirection: 'row', gap: SPACING_PX.md, flexWrap: 'wrap' },
	themeRect: {
		width: THEME_RECT_WIDTH,
		height: THEME_RECT_HEIGHT,
		borderRadius: BORDER_RADIUS_PX.md,
		alignItems: 'center',
		justifyContent: 'center',
	},
	themeSelected: { borderWidth: 2, opacity: OPACITY_HOVER },
	textInput: {
		borderWidth: 1,
		borderRadius: BORDER_RADIUS_PX.md,
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm,
		fontSize: FONT_SIZE.caption,
	},
});
