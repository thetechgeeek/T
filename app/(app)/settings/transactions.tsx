import React, { useState } from 'react';
import { View, Switch, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';

function SectionLabel({ label, c }: { label: string; c: any }) {
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
	sub,
	value,
	onChange,
	c,
}: {
	label: string;
	sub?: string;
	value: boolean;
	onChange: (v: boolean) => void;
	c: any;
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
			<ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
				<SectionLabel label="Invoice Number" c={c} />
				<View style={[styles.card, { backgroundColor: c.surface }]}>
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
				</View>

				<SectionLabel label="Invoice Defaults" c={c} />
				<View style={[styles.card, { backgroundColor: c.surface }]}>
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
				</View>

				<SectionLabel label="Fields" c={c} />
				<View style={[styles.card, { backgroundColor: c.surface }]}>
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
				</View>

				<SectionLabel label="Pricing" c={c} />
				<View style={[styles.card, { backgroundColor: c.surface }]}>
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
	prefixInput: {
		width: 60,
		borderWidth: 1,
		borderRadius: 6,
		paddingHorizontal: 8,
		paddingVertical: 6,
		fontSize: 14,
		textAlign: 'center',
	},
});
