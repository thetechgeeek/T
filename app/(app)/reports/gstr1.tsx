import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { FileJson, Upload } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { Card } from '@/src/components/atoms/Card';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { GSTR1_COL_AMT_FLEX } from '@/constants/reportLayout';
import { GSTR1_PERIOD_CHIPS, MOCK_GSTR1_B2B, MOCK_GSTR1_B2C } from '@/src/mocks/reports/gstr1';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

function getCurrentPeriod() {
	const d = new Date();
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	return `${y}-${m}`;
}

export default function GSTR1Screen() {
	const { c, s, r } = useThemeTokens();
	const { formatCurrency } = useLocale();

	const currentPeriod = getCurrentPeriod();
	const allPeriods = GSTR1_PERIOD_CHIPS.some((p) => p.value === currentPeriod)
		? GSTR1_PERIOD_CHIPS
		: [...GSTR1_PERIOD_CHIPS, { label: 'Current', value: currentPeriod }];

	const [period, setPeriod] = useState(allPeriods[allPeriods.length - 1].value);

	// TODO: derive totals from real data filtered by period
	const totalTaxable =
		MOCK_GSTR1_B2B.reduce((a, r) => a + r.taxable, 0) +
		MOCK_GSTR1_B2C.reduce((a, r) => a + r.taxable, 0);
	const totalCGST =
		MOCK_GSTR1_B2B.reduce((a, r) => a + r.cgst, 0) +
		MOCK_GSTR1_B2C.reduce((a, r) => a + r.cgst, 0);
	const totalSGST =
		MOCK_GSTR1_B2B.reduce((a, r) => a + r.sgst, 0) +
		MOCK_GSTR1_B2C.reduce((a, r) => a + r.sgst, 0);
	const totalIGST =
		MOCK_GSTR1_B2B.reduce((a, r) => a + r.igst, 0) +
		MOCK_GSTR1_B2C.reduce((a, r) => a + r.igst, 0);

	const divider = <View style={[styles.divider, { backgroundColor: c.border }]} />;

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title="GSTR-1 Report" showBackButton />

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

				{/* Summary card */}
				<Card style={{ borderRadius: r.md, marginBottom: s.md }} padding="md">
					<ThemedText variant="bodyBold" style={{ marginBottom: s.sm }}>
						Summary
					</ThemedText>
					{divider}
					<View style={styles.summaryGrid}>
						<View style={styles.summaryCell}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Taxable Value
							</ThemedText>
							<ThemedText variant="amount">{formatCurrency(totalTaxable)}</ThemedText>
						</View>
						<View style={styles.summaryCell}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Total CGST
							</ThemedText>
							<ThemedText variant="amount" color={c.warning}>
								{formatCurrency(totalCGST)}
							</ThemedText>
						</View>
						<View style={styles.summaryCell}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Total SGST
							</ThemedText>
							<ThemedText variant="amount" color={c.warning}>
								{formatCurrency(totalSGST)}
							</ThemedText>
						</View>
						<View style={styles.summaryCell}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Total IGST
							</ThemedText>
							<ThemedText variant="amount" color={c.primary}>
								{formatCurrency(totalIGST)}
							</ThemedText>
						</View>
					</View>
				</Card>

				{/* B2B Table */}
				<Card style={{ borderRadius: r.md, marginBottom: s.md }} padding="sm">
					<ThemedText
						variant="bodyBold"
						style={{ marginBottom: s.sm, paddingHorizontal: s.xs }}
					>
						B2B – Business Invoices
					</ThemedText>
					{divider}

					{/* Table header */}
					<View style={[styles.tableHeader, { borderBottomColor: c.border }]}>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={styles.colInvoice}
						>
							Invoice #
						</ThemedText>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={styles.colGstin}
						>
							GSTIN
						</ThemedText>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={styles.colAmt}
							align="right"
						>
							Taxable
						</ThemedText>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={styles.colAmt}
							align="right"
						>
							GST
						</ThemedText>
					</View>

					{MOCK_GSTR1_B2B.map((row, idx) => (
						<View
							key={row.id}
							style={[
								styles.tableRow,
								{ borderBottomColor: c.border },
								idx === MOCK_GSTR1_B2B.length - 1 && { borderBottomWidth: 0 },
							]}
						>
							<View style={styles.colInvoice}>
								<ThemedText variant="captionBold">{row.invoiceNo}</ThemedText>
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									numberOfLines={1}
								>
									{row.customer}
								</ThemedText>
							</View>
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={styles.colGstin}
								numberOfLines={1}
							>
								{row.gstin}
							</ThemedText>
							<ThemedText variant="caption" style={styles.colAmt} align="right">
								{formatCurrency(row.taxable)}
							</ThemedText>
							<View style={styles.colAmt}>
								{row.igst > 0 ? (
									<ThemedText variant="caption" color={c.primary} align="right">
										{formatCurrency(row.igst)}
										{'\n'}
										<ThemedText variant="caption" color={c.onSurfaceVariant}>
											IGST
										</ThemedText>
									</ThemedText>
								) : (
									<ThemedText variant="caption" color={c.warning} align="right">
										{formatCurrency(row.cgst + row.sgst)}
										{'\n'}
										<ThemedText variant="caption" color={c.onSurfaceVariant}>
											C+S
										</ThemedText>
									</ThemedText>
								)}
							</View>
						</View>
					))}
				</Card>

				{/* B2C Table */}
				<Card style={{ borderRadius: r.md, marginBottom: s.md }} padding="sm">
					<ThemedText
						variant="bodyBold"
						style={{ marginBottom: s.sm, paddingHorizontal: s.xs }}
					>
						B2C – Consumer Invoices (by Rate)
					</ThemedText>
					{divider}

					<View style={[styles.tableHeader, { borderBottomColor: c.border }]}>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={{ flex: 1 }}
						>
							Rate
						</ThemedText>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={styles.colAmt}
							align="right"
						>
							Taxable
						</ThemedText>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={styles.colAmt}
							align="right"
						>
							CGST
						</ThemedText>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={styles.colAmt}
							align="right"
						>
							SGST
						</ThemedText>
					</View>

					{MOCK_GSTR1_B2C.map((row, idx) => (
						<View
							key={row.rate}
							style={[
								styles.tableRow,
								{ borderBottomColor: c.border },
								idx === MOCK_GSTR1_B2C.length - 1 && { borderBottomWidth: 0 },
							]}
						>
							<ThemedText variant="captionBold" style={{ flex: 1 }}>
								{row.rate}%
							</ThemedText>
							<ThemedText variant="caption" style={styles.colAmt} align="right">
								{formatCurrency(row.taxable)}
							</ThemedText>
							<ThemedText
								variant="caption"
								color={c.warning}
								style={styles.colAmt}
								align="right"
							>
								{formatCurrency(row.cgst)}
							</ThemedText>
							<ThemedText
								variant="caption"
								color={c.warning}
								style={styles.colAmt}
								align="right"
							>
								{formatCurrency(row.sgst)}
							</ThemedText>
						</View>
					))}

					{/* B2C totals row */}
					{divider}
					<View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
						<ThemedText variant="captionBold" style={{ flex: 1 }}>
							Total
						</ThemedText>
						<ThemedText variant="captionBold" style={styles.colAmt} align="right">
							{formatCurrency(MOCK_GSTR1_B2C.reduce((a, r) => a + r.taxable, 0))}
						</ThemedText>
						<ThemedText
							variant="captionBold"
							color={c.warning}
							style={styles.colAmt}
							align="right"
						>
							{formatCurrency(MOCK_GSTR1_B2C.reduce((a, r) => a + r.cgst, 0))}
						</ThemedText>
						<ThemedText
							variant="captionBold"
							color={c.warning}
							style={styles.colAmt}
							align="right"
						>
							{formatCurrency(MOCK_GSTR1_B2C.reduce((a, r) => a + r.sgst, 0))}
						</ThemedText>
					</View>
				</Card>

				{/* Action buttons */}
				<View style={[styles.actionRow, { gap: s.sm }]}>
					<Button
						title="Export JSON"
						variant="outline"
						style={{ flex: 1 }}
						leftIcon={<FileJson size={16} color={c.primary} />}
						onPress={() =>
							Alert.alert(
								'Coming Soon',
								'JSON export will be available in a future update.',
							)
						}
						accessibilityLabel="Export GSTR-1 as JSON"
					/>
					<Button
						title="File on GST Portal"
						variant="primary"
						style={{ flex: 1 }}
						leftIcon={<Upload size={16} color={c.white} />}
						onPress={() =>
							Alert.alert(
								'Coming Soon',
								'GST Portal filing will be available in a future update.',
							)
						}
						accessibilityLabel="File GSTR-1 on GST Portal"
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
		marginVertical: SPACING_PX.sm,
	},
	summaryGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: SPACING_PX.md,
	},
	summaryCell: {
		width: '47%',
		gap: SPACING_PX.xxs,
	},
	tableHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: SPACING_PX.sm,
		paddingBottom: SPACING_PX.sm - SPACING_PX.xxs,
		borderBottomWidth: StyleSheet.hairlineWidth,
		marginBottom: SPACING_PX.xs,
	},
	tableRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: SPACING_PX.sm,
		paddingVertical: SPACING_PX.sm,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	colInvoice: {
		flex: 2,
		paddingRight: SPACING_PX.xs,
	},
	colGstin: {
		flex: 2,
		paddingRight: SPACING_PX.xs,
	},
	colAmt: {
		flex: GSTR1_COL_AMT_FLEX,
	},
	actionRow: {
		flexDirection: 'row',
		marginTop: SPACING_PX.sm,
	},
});
