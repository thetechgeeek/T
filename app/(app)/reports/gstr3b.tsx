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
import { GSTR3B_NUM_CELL_WIDTH_PX } from '@/constants/reportLayout';
import {
	GSTR3B_PERIOD_CHIPS,
	MOCK_GSTR3B_INTERSTATE_32,
	MOCK_GSTR3B_ITC,
	MOCK_GSTR3B_OUTWARD_31,
} from '@/src/mocks/reports/gstr3b';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

// TODO: Replace all mock values with aggregated Supabase queries for the selected period.

function getCurrentPeriod() {
	const d = new Date();
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	return `${y}-${m}`;
}

export default function GSTR3BScreen() {
	const { c, s, r } = useThemeTokens();
	const { formatCurrency } = useLocale();

	const currentPeriod = getCurrentPeriod();
	const allPeriods = GSTR3B_PERIOD_CHIPS.some((p) => p.value === currentPeriod)
		? GSTR3B_PERIOD_CHIPS
		: [...GSTR3B_PERIOD_CHIPS, { label: 'Current', value: currentPeriod }];

	const [period, setPeriod] = useState(allPeriods[allPeriods.length - 1].value);

	// TODO: compute net payable from real data
	const taxableRow = MOCK_GSTR3B_OUTWARD_31[0];
	const itcInward = MOCK_GSTR3B_ITC[2];
	const netCGST = Math.max(0, taxableRow.cgst - itcInward.cgst);
	const netSGST = Math.max(0, taxableRow.sgst - itcInward.sgst);
	const netIGST = Math.max(
		0,
		taxableRow.igst +
			MOCK_GSTR3B_INTERSTATE_32.reduce((a, r) => a + r.igst, 0) -
			itcInward.igst,
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
			<ScreenHeader title="GSTR-3B Return" showBackButton />

			<ScrollView
				contentContainerStyle={[styles.content, { paddingBottom: s['2xl'] + s.sm }]}
			>
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
								color={period === p.value ? c.onPrimary : c.onSurface}
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

					{MOCK_GSTR3B_OUTWARD_31.map((row) =>
						renderAmtRow(row.label, row.igst, row.cgst, row.sgst),
					)}

					{/* Taxable value total row */}
					{divider}
					<View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
						<ThemedText variant="captionBold" style={{ flex: 3 }}>
							Taxable Value
						</ThemedText>
						<ThemedText variant="captionBold" style={styles.numCell} align="right">
							{formatCurrency(MOCK_GSTR3B_OUTWARD_31.reduce((a, r) => a + r.igst, 0))}
						</ThemedText>
						<ThemedText variant="captionBold" style={styles.numCell} align="right">
							{formatCurrency(MOCK_GSTR3B_OUTWARD_31.reduce((a, r) => a + r.cgst, 0))}
						</ThemedText>
						<ThemedText variant="captionBold" style={styles.numCell} align="right">
							{formatCurrency(MOCK_GSTR3B_OUTWARD_31.reduce((a, r) => a + r.sgst, 0))}
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

					{MOCK_GSTR3B_INTERSTATE_32.map((row, idx) => (
						<View
							key={row.label}
							style={[
								styles.tableRow,
								{ borderBottomColor: c.border },
								idx === MOCK_GSTR3B_INTERSTATE_32.length - 1 && {
									borderBottomWidth: 0,
								},
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

					{MOCK_GSTR3B_ITC.map((row) =>
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
							{formatCurrency(MOCK_GSTR3B_ITC.reduce((a, r) => a + r.igst, 0))}
						</ThemedText>
						<ThemedText
							variant="captionBold"
							color={c.success}
							style={styles.numCell}
							align="right"
						>
							{formatCurrency(MOCK_GSTR3B_ITC.reduce((a, r) => a + r.cgst, 0))}
						</ThemedText>
						<ThemedText
							variant="captionBold"
							color={c.success}
							style={styles.numCell}
							align="right"
						>
							{formatCurrency(MOCK_GSTR3B_ITC.reduce((a, r) => a + r.sgst, 0))}
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
						style={[
							styles.divider,
							{ backgroundColor: c.border, marginVertical: s.sm },
						]}
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
						leftIcon={<Send size={16} color={c.white} />}
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
		padding: SPACING_PX.lg,
		gap: 0,
	},
	chipRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: SPACING_PX.sm,
		marginBottom: SPACING_PX.lg,
	},
	chip: {
		paddingHorizontal: SPACING_PX.md + SPACING_PX.xxs,
		paddingVertical: SPACING_PX.sm - SPACING_PX.xxs,
		borderWidth: 1,
	},
	divider: {
		height: StyleSheet.hairlineWidth,
		marginVertical: SPACING_PX.sm - SPACING_PX.xxs,
	},
	tableHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: SPACING_PX.xs,
		paddingBottom: SPACING_PX.sm - SPACING_PX.xxs,
		borderBottomWidth: StyleSheet.hairlineWidth,
		marginBottom: SPACING_PX.xs,
	},
	tableRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: SPACING_PX.xs,
		paddingVertical: SPACING_PX.sm,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	numCell: {
		width: GSTR3B_NUM_CELL_WIDTH_PX,
	},
	payableRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: SPACING_PX.sm - SPACING_PX.xxs,
	},
	actionRow: {
		flexDirection: 'row',
		marginTop: SPACING_PX.xs,
	},
});
