import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Save, Send } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { Card } from '@/src/components/atoms/Card';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';

// TODO: Replace all mock values with aggregated Supabase queries for the selected period.

const PERIODS = [
	{ label: 'Jan 25', value: '2025-01' },
	{ label: 'Feb 25', value: '2025-02' },
	{ label: 'Mar 25', value: '2025-03' },
];

function getCurrentPeriod() {
	const d = new Date();
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	return `${y}-${m}`;
}

// TODO: Fetch section 3.1 outward supply totals from invoice + sales data for the period
const MOCK_31 = [
	{
		label: 'Taxable supplies (other than zero rated, nil rated & exempt)',
		taxable: 230000,
		igst: 14760,
		cgst: 14580,
		sgst: 14580,
	},
	{
		label: 'Zero rated supply (export) on payment of tax',
		taxable: 0,
		igst: 0,
		cgst: 0,
		sgst: 0,
	},
	{ label: 'Nil rated / exempted supplies', taxable: 5000, igst: 0, cgst: 0, sgst: 0 },
	{ label: 'Non-GST outward supplies', taxable: 2000, igst: 0, cgst: 0, sgst: 0 },
];

// TODO: Fetch inter-state supply breakdown (intra-state vs inter-state registered/unregistered)
const MOCK_32 = [
	{ label: 'Supplies to unregistered persons', taxable: 24000, igst: 2160 },
	{ label: 'Supplies to composition taxable persons', taxable: 0, igst: 0 },
	{ label: 'Supplies to UIN holders', taxable: 0, igst: 0 },
];

// TODO: Fetch ITC from purchase bills and input invoices for the period
const MOCK_ITC = [
	{ label: 'Import of goods', igst: 0, cgst: 0, sgst: 0 },
	{ label: 'Import of services', igst: 0, cgst: 0, sgst: 0 },
	{ label: 'Inward supplies (other than import)', igst: 7560, cgst: 6300, sgst: 6300 },
	{ label: 'ITC reversal (rules 42 & 43)', igst: 0, cgst: 0, sgst: 0 },
];

export default function GSTR3BScreen() {
	const { c, s, r } = useThemeTokens();
	const { formatCurrency } = useLocale();

	const currentPeriod = getCurrentPeriod();
	const allPeriods = PERIODS.some((p) => p.value === currentPeriod)
		? PERIODS
		: [...PERIODS, { label: 'Current', value: currentPeriod }];

	const [period, setPeriod] = useState(allPeriods[allPeriods.length - 1].value);

	// TODO: compute net payable from real data
	const taxableRow = MOCK_31[0];
	const itcInward = MOCK_ITC[2];
	const netCGST = Math.max(0, taxableRow.cgst - itcInward.cgst);
	const netSGST = Math.max(0, taxableRow.sgst - itcInward.sgst);
	const netIGST = Math.max(
		0,
		taxableRow.igst + MOCK_32.reduce((a, r) => a + r.igst, 0) - itcInward.igst,
	);
	const netTotal = netCGST + netSGST + netIGST;

	const divider = <View style={[styles.divider, { backgroundColor: c.border }]} />;

	function renderAmtRow(label: string, igst: number, cgst: number, sgst: number, labelFlex = 3) {
		return (
			<View style={[styles.tableRow, { borderBottomColor: c.border }]} key={label}>
				<ThemedText
					variant="caption"
					color={c.onSurfaceVariant}
					style={{ flex: labelFlex }}
				>
					{label}
				</ThemedText>
				<ThemedText variant="caption" style={styles.numCell} align="right">
					{formatCurrency(igst)}
				</ThemedText>
				<ThemedText variant="caption" style={styles.numCell} align="right">
					{formatCurrency(cgst)}
				</ThemedText>
				<ThemedText variant="caption" style={styles.numCell} align="right">
					{formatCurrency(sgst)}
				</ThemedText>
			</View>
		);
	}

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title="GSTR-3B Return" showBack />

			<ScrollView contentContainerStyle={[styles.content, { paddingBottom: 40 }]}>
				{/* Period selector */}
				<View style={styles.chipRow}>
					{allPeriods.map((p) => (
						<Pressable
							key={p.value}
							onPress={() => setPeriod(p.value)}
							style={[
								styles.chip,
								{
									borderColor: period === p.value ? c.primary : c.border,
									backgroundColor: period === p.value ? c.primary : c.surface,
									borderRadius: r.full,
								},
							]}
							accessibilityRole="button"
							accessibilityState={{ selected: period === p.value }}
						>
							<ThemedText
								variant="caption"
								color={period === p.value ? '#FFF' : c.onSurface}
							>
								{p.label}
							</ThemedText>
						</Pressable>
					))}
				</View>

				{/* Section 3.1 */}
				<Card style={{ borderRadius: r.md, marginBottom: s.md }} padding="sm">
					<ThemedText
						variant="bodyBold"
						style={{ marginBottom: s.xs, paddingHorizontal: s.xs }}
					>
						3.1 Outward Supplies & Tax
					</ThemedText>
					{divider}

					{/* Column headers */}
					<View style={[styles.tableHeader, { borderBottomColor: c.border }]}>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={{ flex: 3 }}
						>
							Nature of Supply
						</ThemedText>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={styles.numCell}
							align="right"
						>
							IGST
						</ThemedText>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={styles.numCell}
							align="right"
						>
							CGST
						</ThemedText>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={styles.numCell}
							align="right"
						>
							SGST
						</ThemedText>
					</View>

					{MOCK_31.map((row) => renderAmtRow(row.label, row.igst, row.cgst, row.sgst))}

					{/* Taxable value total row */}
					{divider}
					<View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
						<ThemedText variant="captionBold" style={{ flex: 3 }}>
							Taxable Value
						</ThemedText>
						<ThemedText variant="captionBold" style={styles.numCell} align="right">
							{formatCurrency(MOCK_31.reduce((a, r) => a + r.igst, 0))}
						</ThemedText>
						<ThemedText variant="captionBold" style={styles.numCell} align="right">
							{formatCurrency(MOCK_31.reduce((a, r) => a + r.cgst, 0))}
						</ThemedText>
						<ThemedText variant="captionBold" style={styles.numCell} align="right">
							{formatCurrency(MOCK_31.reduce((a, r) => a + r.sgst, 0))}
						</ThemedText>
					</View>
				</Card>

				{/* Section 3.2 */}
				<Card style={{ borderRadius: r.md, marginBottom: s.md }} padding="sm">
					<ThemedText
						variant="bodyBold"
						style={{ marginBottom: s.xs, paddingHorizontal: s.xs }}
					>
						3.2 Inter-State Supplies
					</ThemedText>
					{divider}

					<View style={[styles.tableHeader, { borderBottomColor: c.border }]}>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={{ flex: 3 }}
						>
							Recipient Type
						</ThemedText>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={styles.numCell}
							align="right"
						>
							Taxable
						</ThemedText>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={styles.numCell}
							align="right"
						>
							IGST
						</ThemedText>
					</View>

					{MOCK_32.map((row, idx) => (
						<View
							key={row.label}
							style={[
								styles.tableRow,
								{ borderBottomColor: c.border },
								idx === MOCK_32.length - 1 && { borderBottomWidth: 0 },
							]}
						>
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={{ flex: 3 }}
							>
								{row.label}
							</ThemedText>
							<ThemedText variant="caption" style={styles.numCell} align="right">
								{formatCurrency(row.taxable)}
							</ThemedText>
							<ThemedText variant="caption" style={styles.numCell} align="right">
								{formatCurrency(row.igst)}
							</ThemedText>
						</View>
					))}
				</Card>

				{/* Section 4: ITC */}
				<Card style={{ borderRadius: r.md, marginBottom: s.md }} padding="sm">
					<ThemedText
						variant="bodyBold"
						style={{ marginBottom: s.xs, paddingHorizontal: s.xs }}
					>
						4 Eligible ITC
					</ThemedText>
					{divider}

					<View style={[styles.tableHeader, { borderBottomColor: c.border }]}>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={{ flex: 3 }}
						>
							Details
						</ThemedText>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={styles.numCell}
							align="right"
						>
							IGST
						</ThemedText>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={styles.numCell}
							align="right"
						>
							CGST
						</ThemedText>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={styles.numCell}
							align="right"
						>
							SGST
						</ThemedText>
					</View>

					{MOCK_ITC.map((row, idx) =>
						renderAmtRow(row.label, row.igst, row.cgst, row.sgst),
					)}

					{divider}
					<View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
						<ThemedText variant="captionBold" color={c.success} style={{ flex: 3 }}>
							Net ITC Available
						</ThemedText>
						<ThemedText
							variant="captionBold"
							color={c.success}
							style={styles.numCell}
							align="right"
						>
							{formatCurrency(MOCK_ITC.reduce((a, r) => a + r.igst, 0))}
						</ThemedText>
						<ThemedText
							variant="captionBold"
							color={c.success}
							style={styles.numCell}
							align="right"
						>
							{formatCurrency(MOCK_ITC.reduce((a, r) => a + r.cgst, 0))}
						</ThemedText>
						<ThemedText
							variant="captionBold"
							color={c.success}
							style={styles.numCell}
							align="right"
						>
							{formatCurrency(MOCK_ITC.reduce((a, r) => a + r.sgst, 0))}
						</ThemedText>
					</View>
				</Card>

				{/* Net Tax Payable */}
				<Card
					style={{
						borderRadius: r.md,
						marginBottom: s.md,
						borderTopWidth: 3,
						borderTopColor: c.error,
					}}
					padding="md"
				>
					<ThemedText variant="bodyBold" style={{ marginBottom: s.sm }}>
						Net Tax Payable
					</ThemedText>
					{divider}

					{[
						{ label: 'CGST Payable', value: netCGST, color: c.warning },
						{ label: 'SGST Payable', value: netSGST, color: c.warning },
						{ label: 'IGST Payable', value: netIGST, color: c.primary },
					].map((row) => (
						<View key={row.label} style={styles.payableRow}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{row.label}
							</ThemedText>
							<ThemedText variant="captionBold" color={row.color}>
								{formatCurrency(row.value)}
							</ThemedText>
						</View>
					))}

					<View
						style={[styles.divider, { backgroundColor: c.border, marginVertical: 8 }]}
					/>

					<View style={styles.payableRow}>
						<ThemedText variant="bodyBold">Total Tax Payable</ThemedText>
						<ThemedText variant="amount" color={c.error}>
							{formatCurrency(netTotal)}
						</ThemedText>
					</View>
				</Card>

				{/* Action buttons */}
				<View style={[styles.actionRow, { gap: s.sm }]}>
					<Button
						title="Save Draft"
						variant="outline"
						style={{ flex: 1 }}
						leftIcon={<Save size={16} color={c.primary} />}
						onPress={() =>
							Alert.alert(
								'Coming Soon',
								'Draft saving will be available in a future update.',
							)
						}
						accessibilityLabel="Save GSTR-3B draft"
					/>
					<Button
						title="File Return"
						variant="primary"
						style={{ flex: 1 }}
						leftIcon={<Send size={16} color="#FFF" />}
						onPress={() =>
							Alert.alert(
								'Coming Soon',
								'Return filing will be available in a future update.',
							)
						}
						accessibilityLabel="File GSTR-3B return"
					/>
				</View>
			</ScrollView>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	content: {
		padding: 16,
		gap: 0,
	},
	chipRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		marginBottom: 16,
	},
	chip: {
		paddingHorizontal: 14,
		paddingVertical: 6,
		borderWidth: 1,
	},
	divider: {
		height: StyleSheet.hairlineWidth,
		marginVertical: 6,
	},
	tableHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 4,
		paddingBottom: 6,
		borderBottomWidth: StyleSheet.hairlineWidth,
		marginBottom: 4,
	},
	tableRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 4,
		paddingVertical: 7,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	numCell: {
		width: 68,
	},
	payableRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 5,
	},
	actionRow: {
		flexDirection: 'row',
		marginTop: 4,
	},
});
