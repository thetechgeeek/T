import React, { useState } from 'react';
import { palette } from '@/src/theme/palette';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Download, Calendar } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { Card } from '@/src/components/atoms/Card';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { GST_DETAIL_COL_WIDTH_PX } from '@/constants/reportLayout';
import {
	GST_DETAIL_DEFAULT_FROM,
	GST_DETAIL_DEFAULT_TO,
	MOCK_GST_DETAIL_ROWS,
} from '@/src/mocks/reports/gstDetail';

// TODO: Replace mock data with Supabase query filtered by fromDate/toDate across
//       sale_invoices, purchase_bills, and expense records.

type PeriodPreset = 'month' | 'quarter' | 'year';

function todayISO() {
	return new Date().toISOString().slice(0, 10);
}

function startOf(preset: PeriodPreset): string {
	const d = new Date();
	if (preset === 'month') {
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
	}
	if (preset === 'quarter') {
		const q = Math.floor(d.getMonth() / 3) * 3;
		return `${d.getFullYear()}-${String(q + 1).padStart(2, '0')}-01`;
	}
	return `${d.getFullYear()}-01-01`;
}

export default function GSTDetailScreen() {
	const { c, s, r } = useThemeTokens();
	const { formatCurrency, formatDate } = useLocale();

	const [fromDate, setFromDate] = useState(GST_DETAIL_DEFAULT_FROM);
	const [toDate, setToDate] = useState(GST_DETAIL_DEFAULT_TO);
	const [preset, setPreset] = useState<PeriodPreset | null>('month');

	function applyPreset(p: PeriodPreset) {
		setPreset(p);
		setFromDate(startOf(p));
		setToDate(todayISO());
	}

	// TODO: filter MOCK_GST_DETAIL_ROWS by fromDate/toDate; real query will do this server-side
	const rows = MOCK_GST_DETAIL_ROWS;

	const salesRows = rows.filter((r) => r.type === 'Sale');
	const purchaseRows = rows.filter((r) => r.type === 'Purchase');

	const totalSalesTaxable = salesRows.reduce((a, r) => a + r.taxable, 0);
	const totalSalesGST = salesRows.reduce((a, r) => a + r.cgst + r.sgst + r.igst, 0);
	const totalPurchaseTaxable = purchaseRows.reduce((a, r) => a + r.taxable, 0);
	const totalPurchaseGST = purchaseRows.reduce((a, r) => a + r.cgst + r.sgst + r.igst, 0);
	const netLiability = totalSalesGST - totalPurchaseGST;

	const divider = <View style={[styles.divider, { backgroundColor: c.border }]} />;

	const PRESETS: { label: string; value: PeriodPreset }[] = [
		{ label: 'Month', value: 'month' },
		{ label: 'Quarter', value: 'quarter' },
		{ label: 'Year', value: 'year' },
	];

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title="GST Detail Report" showBackButton />

			<ScrollView contentContainerStyle={[styles.content, { paddingBottom: 40 }]}>
				{/* Period preset chips */}
				<View style={styles.chipRow}>
					{PRESETS.map((p) => (
						<Pressable
							key={p.value}
							onPress={() => applyPreset(p.value)}
							style={[
								styles.chip,
								{
									borderColor: preset === p.value ? c.primary : c.border,
									backgroundColor: preset === p.value ? c.primary : c.surface,
									borderRadius: r.full,
								},
							]}
							accessibilityRole="button"
							accessibilityState={{ selected: preset === p.value }}
						>
							<ThemedText
								variant="caption"
								color={preset === p.value ? c.onPrimary : c.onSurface}
							>
								{p.label}
							</ThemedText>
						</Pressable>
					))}
				</View>

				{/* Date range display */}
				{/* TODO: Wire these to DatePickerField once date picker supports range mode */}
				<Card style={{ borderRadius: r.md, marginBottom: s.md }} padding="sm">
					<View style={styles.dateRangeRow}>
						<View style={styles.dateBox}>
							<Calendar size={14} color={c.onSurfaceVariant} />
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={{ marginLeft: 4 }}
							>
								From
							</ThemedText>
							<ThemedText variant="captionBold">{formatDate(fromDate)}</ThemedText>
						</View>
						<View style={[styles.dateArrow, { backgroundColor: c.border }]} />
						<View style={styles.dateBox}>
							<Calendar size={14} color={c.onSurfaceVariant} />
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={{ marginLeft: 4 }}
							>
								To
							</ThemedText>
							<ThemedText variant="captionBold">{formatDate(toDate)}</ThemedText>
						</View>
					</View>
				</Card>

				{/* Summary */}
				<Card style={{ borderRadius: r.md, marginBottom: s.md }} padding="md">
					<ThemedText variant="bodyBold" style={{ marginBottom: s.sm }}>
						Summary
					</ThemedText>
					{divider}

					<View style={styles.summaryRow}>
						<View style={styles.summaryBlock}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Sales (Taxable)
							</ThemedText>
							<ThemedText variant="amount">
								{formatCurrency(totalSalesTaxable)}
							</ThemedText>
							<ThemedText variant="caption" color={c.success}>
								GST Collected: {formatCurrency(totalSalesGST)}
							</ThemedText>
						</View>
						<View style={[styles.summaryDivider, { backgroundColor: c.border }]} />
						<View style={styles.summaryBlock}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Purchases (Taxable)
							</ThemedText>
							<ThemedText variant="amount">
								{formatCurrency(totalPurchaseTaxable)}
							</ThemedText>
							<ThemedText variant="caption" color={c.primary}>
								ITC Available: {formatCurrency(totalPurchaseGST)}
							</ThemedText>
						</View>
					</View>

					<View
						style={[styles.divider, { backgroundColor: c.border, marginVertical: 10 }]}
					/>

					<View style={styles.liabilityRow}>
						<ThemedText variant="bodyBold">Net GST Liability</ThemedText>
						<ThemedText
							variant="amount"
							color={netLiability >= 0 ? c.error : c.success}
						>
							{formatCurrency(Math.abs(netLiability))}
							{netLiability < 0 ? ' (Credit)' : ''}
						</ThemedText>
					</View>
				</Card>

				{/* Detail table */}
				<Card style={{ borderRadius: r.md, marginBottom: s.md }} padding="sm">
					<ThemedText
						variant="bodyBold"
						style={{ marginBottom: s.sm, paddingHorizontal: s.xs }}
					>
						Transaction Detail
					</ThemedText>
					{divider}

					{/* Scrollable horizontal table */}
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						<View>
							{/* Header */}
							<View style={[styles.tableHeader, { borderBottomColor: c.border }]}>
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									style={styles.colDate}
								>
									Date
								</ThemedText>
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									style={styles.colType}
								>
									Type
								</ThemedText>
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									style={styles.colParty}
								>
									Party
								</ThemedText>
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									style={styles.colInvoice}
								>
									Inv #
								</ThemedText>
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									style={styles.colNum}
									align="right"
								>
									Taxable
								</ThemedText>
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									style={styles.colRateCell}
									align="right"
								>
									Rate
								</ThemedText>
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									style={styles.colNum}
									align="right"
								>
									CGST
								</ThemedText>
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									style={styles.colNum}
									align="right"
								>
									SGST
								</ThemedText>
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									style={styles.colNum}
									align="right"
								>
									IGST
								</ThemedText>
							</View>

							{/* Rows */}
							{rows.map((row, idx) => {
								const isLast = idx === rows.length - 1;
								const isSale = row.type === 'Sale';
								return (
									<View
										key={row.id}
										style={[
											styles.tableRow,
											{ borderBottomColor: c.border },
											isLast && { borderBottomWidth: 0 },
										]}
									>
										<ThemedText variant="caption" style={styles.colDate}>
											{formatDate(row.date)}
										</ThemedText>
										<View style={styles.colType}>
											<View
												style={[
													styles.typeBadge,
													{
														backgroundColor: isSale
															? c.success
															: c.primary,
														borderRadius: r.sm,
													},
												]}
											>
												<ThemedText variant="caption" color={palette.white}>
													{row.type}
												</ThemedText>
											</View>
										</View>
										<ThemedText
											variant="caption"
											style={styles.colParty}
											numberOfLines={1}
										>
											{row.party}
										</ThemedText>
										<ThemedText
											variant="caption"
											color={c.onSurfaceVariant}
											style={styles.colInvoice}
										>
											{row.invoiceNo}
										</ThemedText>
										<ThemedText
											variant="caption"
											style={styles.colNum}
											align="right"
										>
											{formatCurrency(row.taxable)}
										</ThemedText>
										<ThemedText
											variant="caption"
											color={c.onSurfaceVariant}
											style={styles.colRateCell}
											align="right"
										>
											{row.rate}%
										</ThemedText>
										<ThemedText
											variant="caption"
											color={c.warning}
											style={styles.colNum}
											align="right"
										>
											{row.cgst > 0 ? formatCurrency(row.cgst) : '—'}
										</ThemedText>
										<ThemedText
											variant="caption"
											color={c.warning}
											style={styles.colNum}
											align="right"
										>
											{row.sgst > 0 ? formatCurrency(row.sgst) : '—'}
										</ThemedText>
										<ThemedText
											variant="caption"
											color={c.primary}
											style={styles.colNum}
											align="right"
										>
											{row.igst > 0 ? formatCurrency(row.igst) : '—'}
										</ThemedText>
									</View>
								);
							})}

							{/* Totals row */}
							{divider}
							<View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
								<ThemedText
									variant="captionBold"
									style={[
										styles.colDate,
										{
											width:
												styles.colDate.width +
												styles.colType.width +
												styles.colParty.width +
												styles.colInvoice.width,
										},
									]}
								>
									Total
								</ThemedText>
								<ThemedText
									variant="captionBold"
									style={styles.colNum}
									align="right"
								>
									{formatCurrency(rows.reduce((a, r) => a + r.taxable, 0))}
								</ThemedText>
								<ThemedText variant="captionBold" style={styles.colRateCell} />
								<ThemedText
									variant="captionBold"
									color={c.warning}
									style={styles.colNum}
									align="right"
								>
									{formatCurrency(rows.reduce((a, r) => a + r.cgst, 0))}
								</ThemedText>
								<ThemedText
									variant="captionBold"
									color={c.warning}
									style={styles.colNum}
									align="right"
								>
									{formatCurrency(rows.reduce((a, r) => a + r.sgst, 0))}
								</ThemedText>
								<ThemedText
									variant="captionBold"
									color={c.primary}
									style={styles.colNum}
									align="right"
								>
									{formatCurrency(rows.reduce((a, r) => a + r.igst, 0))}
								</ThemedText>
							</View>
						</View>
					</ScrollView>
				</Card>

				{/* Export button */}
				<Button
					title="Export"
					variant="outline"
					leftIcon={<Download size={16} color={c.primary} />}
					onPress={() =>
						Alert.alert('Coming Soon', 'Export will be available in a future update.')
					}
					accessibilityLabel="Export GST Detail Report"
				/>
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
		marginBottom: 12,
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
	dateRangeRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 4,
		paddingVertical: 4,
		gap: 8,
	},
	dateBox: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		flexWrap: 'wrap',
	},
	dateArrow: {
		width: 20,
		height: StyleSheet.hairlineWidth,
	},
	summaryRow: {
		flexDirection: 'row',
		gap: 8,
	},
	summaryBlock: {
		flex: 1,
		gap: 3,
	},
	summaryDivider: {
		width: StyleSheet.hairlineWidth,
		marginVertical: 2,
	},
	liabilityRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	tableHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 4,
		paddingBottom: 6,
		borderBottomWidth: StyleSheet.hairlineWidth,
		marginBottom: 2,
	},
	tableRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 4,
		paddingVertical: 8,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	colDate: { width: GST_DETAIL_COL_WIDTH_PX.date },
	colType: { width: GST_DETAIL_COL_WIDTH_PX.type },
	colParty: { width: GST_DETAIL_COL_WIDTH_PX.party },
	colInvoice: { width: GST_DETAIL_COL_WIDTH_PX.invoice },
	colNum: { width: GST_DETAIL_COL_WIDTH_PX.num },
	colRateCell: { width: 44 },
	typeBadge: {
		paddingHorizontal: 6,
		paddingVertical: 2,
		alignSelf: 'flex-start',
	},
});
