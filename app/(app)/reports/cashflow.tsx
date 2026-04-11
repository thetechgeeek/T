import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Card } from '@/src/components/atoms/Card';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { useFinanceStore } from '@/src/stores/financeStore';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { withOpacity } from '@/src/utils/color';

function toISO(d: Date) {
	return d.toISOString().slice(0, 10);
}

function getMonthRange(offset: number): {
	label: string;
	from: string;
	to: string;
	weeks: { from: string; to: string }[];
} {
	const now = new Date();
	const base = new Date(now.getFullYear(), now.getMonth() + offset, 1);
	const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0);
	const label = base.toLocaleString('default', { month: 'long', year: 'numeric' });
	const from = toISO(base);
	const to = toISO(lastDay);

	// Build 4-week buckets (7-day chunks starting from month start)
	const weeks = [0, 1, 2, 3].map((w) => {
		const wFrom = new Date(base.getFullYear(), base.getMonth(), 1 + w * 7);
		const wTo = new Date(
			base.getFullYear(),
			base.getMonth(),
			Math.min(7 + w * 7, lastDay.getDate()),
		);
		return { from: toISO(wFrom), to: toISO(wTo) };
	});

	return { label, from, to, weeks };
}

function SectionRow({
	label,
	value,
	bold,
	color,
	c,
	formatCurrency,
}: {
	label: string;
	value: number;
	bold?: boolean;
	color?: string;
	c: any;
	formatCurrency: (v: number) => string;
}) {
	return (
		<View style={styles.sectionRow}>
			<ThemedText
				weight={bold ? 'bold' : 'regular'}
				color={color ?? c.onSurface}
				style={{ flex: 1 }}
			>
				{label}
			</ThemedText>
			<ThemedText weight={bold ? 'bold' : 'regular'} color={color ?? c.onSurface}>
				{formatCurrency(value)}
			</ThemedText>
		</View>
	);
}

export default function CashflowScreen() {
	const { c, s, r, theme } = useThemeTokens();
	const { formatCurrency } = useLocale();

	const [offset, setOffset] = useState(0);

	const { expenses, initialize } = useFinanceStore(
		useShallow((state) => ({
			expenses: state.expenses,
			initialize: state.initialize,
		})),
	);

	const { invoices, fetchInvoices } = useInvoiceStore(
		useShallow((state) => ({
			invoices: state.invoices,
			fetchInvoices: state.fetchInvoices,
		})),
	);

	useEffect(() => {
		initialize();
		fetchInvoices(1);
	}, [initialize, fetchInvoices]);

	const { label, from, to, weeks } = useMemo(() => getMonthRange(offset), [offset]);

	// Inflows: payments received this month (amount_paid on invoices in range)
	const saleCollections = useMemo(
		() =>
			invoices
				.filter((inv) => inv.invoice_date >= from && inv.invoice_date <= to)
				.reduce((sum, inv) => sum + inv.amount_paid, 0),
		[invoices, from, to],
	);
	const otherIncome = 0;
	const totalInflows = saleCollections + otherIncome;

	// Outflows
	const suppliersPayments = 0;
	const expensesTotal = useMemo(
		() =>
			expenses
				.filter((e) => e.expense_date >= from && e.expense_date <= to)
				.reduce((sum, e) => sum + e.amount, 0),
		[expenses, from, to],
	);
	const totalOutflows = suppliersPayments + expensesTotal;

	const openingBalance = 0;
	const netCashflow = totalInflows - totalOutflows;
	const closingBalance = openingBalance + netCashflow;
	const isPositive = netCashflow >= 0;

	// Weekly bar data
	const weeklyData = useMemo(
		() =>
			weeks.map((wk, idx) => {
				const inflow = invoices
					.filter((inv) => inv.invoice_date >= wk.from && inv.invoice_date <= wk.to)
					.reduce((sum, inv) => sum + inv.amount_paid, 0);
				const outflow = expenses
					.filter((e) => e.expense_date >= wk.from && e.expense_date <= wk.to)
					.reduce((sum, e) => sum + e.amount, 0);
				return { label: `W${idx + 1}`, inflow, outflow };
			}),
		[weeks, invoices, expenses],
	);

	const maxBarValue = Math.max(...weeklyData.flatMap((w) => [w.inflow, w.outflow]), 1);
	const MAX_BAR_HEIGHT = 60;
	const MIN_BAR_HEIGHT = 4;

	function barHeight(value: number) {
		return Math.max(MIN_BAR_HEIGHT, (value / maxBarValue) * MAX_BAR_HEIGHT);
	}

	return (
		<AtomicScreen safeAreaEdges={['bottom']}>
			<ScreenHeader title="Cashflow Report" showBack />

			{/* Month navigation */}
			<View style={[styles.periodNav, { paddingHorizontal: s.md, marginVertical: 8 }]}>
				<Pressable
					onPress={() => setOffset((o) => o - 1)}
					style={styles.navBtn}
					accessibilityLabel="Previous month"
				>
					<ChevronLeft size={20} color={c.onSurface} strokeWidth={2} />
				</Pressable>
				<ThemedText weight="bold" style={{ flex: 1, textAlign: 'center' }}>
					{label}
				</ThemedText>
				<Pressable
					onPress={() => offset < 0 && setOffset((o) => o + 1)}
					disabled={offset >= 0}
					style={[styles.navBtn, { opacity: offset < 0 ? 1 : 0.3 }]}
					accessibilityLabel="Next month"
				>
					<ChevronRight size={20} color={c.onSurface} strokeWidth={2} />
				</Pressable>
			</View>

			<ScrollView contentContainerStyle={{ padding: s.md, paddingBottom: 40, gap: 12 }}>
				{/* Opening Balance */}
				<View style={styles.sectionRow}>
					<ThemedText color={c.onSurfaceVariant}>Opening Balance</ThemedText>
					<ThemedText weight="bold">{formatCurrency(openingBalance)}</ThemedText>
				</View>

				{/* Inflows */}
				<Card padding="md">
					<ThemedText
						weight="bold"
						style={{ marginBottom: 10, fontSize: theme.typography.sizes.md }}
					>
						Inflows
					</ThemedText>
					<SectionRow
						label="Sale Collections"
						value={saleCollections}
						c={c}
						formatCurrency={formatCurrency}
					/>
					<SectionRow
						label="Other Income"
						value={otherIncome}
						c={c}
						formatCurrency={formatCurrency}
					/>
					<View style={[styles.divider, { backgroundColor: c.border }]} />
					<SectionRow
						label="Total Inflows"
						value={totalInflows}
						bold
						color={c.success}
						c={c}
						formatCurrency={formatCurrency}
					/>
				</Card>

				{/* Outflows */}
				<Card padding="md">
					<ThemedText
						weight="bold"
						style={{ marginBottom: 10, fontSize: theme.typography.sizes.md }}
					>
						Outflows
					</ThemedText>
					<SectionRow
						label="Payments to Suppliers"
						value={suppliersPayments}
						c={c}
						formatCurrency={formatCurrency}
					/>
					<SectionRow
						label="Expenses"
						value={expensesTotal}
						c={c}
						formatCurrency={formatCurrency}
					/>
					<View style={[styles.divider, { backgroundColor: c.border }]} />
					<SectionRow
						label="Total Outflows"
						value={totalOutflows}
						bold
						color={c.error}
						c={c}
						formatCurrency={formatCurrency}
					/>
				</Card>

				{/* Net Cashflow */}
				<Card
					padding="md"
					style={{
						backgroundColor: withOpacity(isPositive ? c.success : c.error, 0.08),
						borderWidth: 1.5,
						borderColor: isPositive ? c.success : c.error,
					}}
				>
					<View style={styles.sectionRow}>
						<ThemedText weight="bold" style={{ fontSize: theme.typography.sizes.md }}>
							Net Cashflow
						</ThemedText>
						<ThemedText
							weight="bold"
							color={isPositive ? c.success : c.error}
							style={{ fontSize: theme.typography.sizes.lg }}
						>
							{isPositive ? '' : '– '}
							{formatCurrency(Math.abs(netCashflow))}
						</ThemedText>
					</View>
					<View style={[styles.sectionRow, { marginTop: 6 }]}>
						<ThemedText color={c.onSurfaceVariant}>Closing Balance</ThemedText>
						<ThemedText weight="bold">{formatCurrency(closingBalance)}</ThemedText>
					</View>
				</Card>

				{/* 4-Week Bar Chart */}
				<Card padding="md">
					<ThemedText
						weight="bold"
						style={{ marginBottom: 12, fontSize: theme.typography.sizes.md }}
					>
						Weekly Breakdown
					</ThemedText>

					{/* Legend */}
					<View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
						<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
							<View
								style={{
									width: 12,
									height: 12,
									borderRadius: 3,
									backgroundColor: c.success,
								}}
							/>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Inflow
							</ThemedText>
						</View>
						<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
							<View
								style={{
									width: 12,
									height: 12,
									borderRadius: 3,
									backgroundColor: c.error,
								}}
							/>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Outflow
							</ThemedText>
						</View>
					</View>

					<View style={styles.chartRow}>
						{weeklyData.map((wk) => (
							<View key={wk.label} style={styles.weekCol}>
								<View style={styles.barsContainer}>
									<View
										style={[
											styles.bar,
											{
												height: barHeight(wk.inflow),
												backgroundColor: c.success,
											},
										]}
									/>
									<View
										style={[
											styles.bar,
											{
												height: barHeight(wk.outflow),
												backgroundColor: c.error,
											},
										]}
									/>
								</View>
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									style={{ textAlign: 'center', marginTop: 4 }}
								>
									{wk.label}
								</ThemedText>
							</View>
						))}
					</View>
				</Card>
			</ScrollView>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	periodNav: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	navBtn: {
		width: 36,
		height: 36,
		alignItems: 'center',
		justifyContent: 'center',
	},
	sectionRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 5,
	},
	divider: {
		height: StyleSheet.hairlineWidth,
		marginVertical: 6,
	},
	chartRow: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'flex-end',
	},
	weekCol: {
		alignItems: 'center',
		flex: 1,
	},
	barsContainer: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		gap: 4,
	},
	bar: {
		width: 14,
		borderRadius: 3,
	},
});
