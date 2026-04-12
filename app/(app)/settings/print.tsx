import React, { useState } from 'react';
import { View, Switch, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import type { ThemeColors } from '@/src/theme';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';

type PaperType = 'thermal58' | 'thermal80' | 'a4' | 'a5';

const PAPER_TYPES: { key: PaperType; label: string }[] = [
	{ key: 'thermal58', label: 'Thermal 58mm' },
	{ key: 'thermal80', label: 'Thermal 80mm' },
	{ key: 'a4', label: 'A4' },
	{ key: 'a5', label: 'A5' },
];

const THEMES = [
	{ key: 'classic', label: 'Classic', color: '#2D2D2D' },
	{ key: 'professional', label: 'Professional', color: '#1D4ED8' },
	{ key: 'modern', label: 'Modern', color: '#C1440E' },
	{ key: 'minimal', label: 'Minimal', color: '#6B5E52' },
	{ key: 'traditional', label: 'Traditional', color: '#047857' },
	{ key: 'colourful', label: 'Colourful', color: '#7C3AED' },
];

function SectionLabel({ label, c }: { label: string; c: ThemeColors }) {
	return (
		<ThemedText
			variant="caption"
			style={{
				color: c.primary,
				marginTop: 20,
				marginBottom: 4,
				marginHorizontal: 16,
				fontWeight: '600',
				textTransform: 'uppercase',
				letterSpacing: 0.8,
			}}
		>
			{label}
		</ThemedText>
	);
}

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
	const { c } = useThemeTokens();

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
			<ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
				<SectionLabel label="Paper Type" c={c} />
				<View style={[styles.chipRow, { marginHorizontal: 16 }]}>
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
								style={{
									color: paper === p.key ? '#fff' : c.onSurface,
									fontWeight: '600',
								}}
							>
								{p.label}
							</ThemedText>
						</Pressable>
					))}
				</View>

				<SectionLabel label="Invoice Theme" c={c} />
				<View style={[styles.themeRow, { marginHorizontal: 16 }]}>
					{THEMES.map((t) => (
						<Pressable
							key={t.key}
							onPress={() => setTheme(t.key)}
							style={{ alignItems: 'center' }}
						>
							<View
								style={[
									styles.themeRect,
									{ backgroundColor: t.color },
									theme === t.key && styles.themeSelected,
								]}
							>
								{theme === t.key && (
									<ThemedText style={{ color: '#fff', fontSize: 18 }}>
										✓
									</ThemedText>
								)}
							</View>
							<ThemedText
								variant="caption"
								style={{
									color: c.onSurfaceVariant,
									marginTop: 4,
									textAlign: 'center',
								}}
								numberOfLines={1}
							>
								{t.label}
							</ThemedText>
						</Pressable>
					))}
				</View>

				<SectionLabel label="Company Header" c={c} />
				<View style={[styles.card, { backgroundColor: c.surface }]}>
					<SwitchRow label="Logo" value={logo} onChange={setLogo} c={c} />
					<SwitchRow label="Business Name" value={bizName} onChange={setBizName} c={c} />
					<SwitchRow label="Address" value={address} onChange={setAddress} c={c} />
					<SwitchRow label="Phone" value={phone} onChange={setPhone} c={c} />
					<SwitchRow label="GSTIN" value={gstin} onChange={setGstin} c={c} last />
				</View>

				<SectionLabel label="Invoice Fields" c={c} />
				<View style={[styles.card, { backgroundColor: c.surface }]}>
					<SwitchRow label="Item Code" value={itemCode} onChange={setItemCode} c={c} />
					<SwitchRow label="HSN Code" value={hsnCode} onChange={setHsnCode} c={c} />
					<SwitchRow
						label="Discount Column"
						value={discount}
						onChange={setDiscount}
						c={c}
					/>
					<SwitchRow label="MRP" value={mrp} onChange={setMrp} c={c} last />
				</View>

				<SectionLabel label="Totals" c={c} />
				<View style={[styles.card, { backgroundColor: c.surface }]}>
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
				</View>

				<SectionLabel label="Footer" c={c} />
				<View
					style={[
						styles.card,
						{
							backgroundColor: c.surface,
							paddingHorizontal: 16,
							paddingTop: 12,
							paddingBottom: 4,
						},
					]}
				>
					<ThemedText
						variant="caption"
						style={{ color: c.onSurfaceVariant, marginBottom: 4 }}
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
						style={{ color: c.onSurfaceVariant, marginBottom: 4, marginTop: 10 }}
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
							{ borderColor: c.border, color: c.onSurface, marginBottom: 10 },
						]}
					/>
					<View
						style={[
							styles.row,
							{
								paddingHorizontal: 0,
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
				</View>
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	card: { marginHorizontal: 16, borderRadius: 10, overflow: 'hidden' },
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 14,
		paddingHorizontal: 16,
	},
	chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
	chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
	themeRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
	themeRect: {
		width: 40,
		height: 56,
		borderRadius: 6,
		alignItems: 'center',
		justifyContent: 'center',
	},
	themeSelected: { borderWidth: 2, borderColor: '#fff', opacity: 0.9 },
	textInput: {
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		fontSize: 14,
	},
});
