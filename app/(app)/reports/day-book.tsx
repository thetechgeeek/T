import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { OPACITY_ROW_DIVIDER } from '@/theme/uiMetrics';
import { ChevronLeft, ChevronRight, Printer } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Card } from '@/src/components/atoms/Card';
import { DatePickerField } from '@/src/components/molecules/DatePickerField';
import { useFinanceStore } from '@/src/stores/financeStore';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { withOpacity } from '@/src/utils/color';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { SIZE_ICON_CIRCLE_MD } from '@/theme/uiMetrics';

function todayISO(): string {
	return new Date().toISOString().slice(0, 10);
}

function shiftDate(dateISO: string, days: number): string {
	const d = new Date(dateISO);
	d.setDate(d.getDate() + days);
	return d.toISOString().slice(0, 10);
}

interface DayBookRow {
	ref: string;
	description: string;
	amount: number;
}

export default function DayBookScreen() {
	const { c, s, r, theme } = useThemeTokens();
	const { formatCurrency } = useLocale();

	const [selectedDate, setSelectedDate] = useState(todayISO());

	const { expenses, purchases } = useFinanceStore(
		useShallow((state) => ({
			expenses: state.expenses,
			purchases: state.purchases,
		})),
	);

	const { invoices } = useInvoiceStore(useShallow((state) => ({ invoices: state.invoices })));

	// ── Received rows ─────────────────────────────────────────────────────────
	const receivedRows = useMemo<DayBookRow[]>(() => {
		const rows: DayBookRow[] = [];

		// Cash-paid sale invoices
		invoices
			.filter((inv) => inv.invoice_date === selectedDate && inv.amount_paid > 0)
			.forEach((inv) => {
				rows.push({
					ref: inv.invoice_number,
					description: `Sale – ${inv.customer_name}`,
					amount: inv.amount_paid,
				});
			});

		// Mock: Payment-In receipts (real data when paymentStore is wired)
		// TODO: replace with paymentStore payments filtered by date & direction='received'

		return rows;
	}, [invoices, selectedDate]);

	// ── Paid rows ─────────────────────────────────────────────────────────────
	const paidRows = useMemo<DayBookRow[]>(() => {
		const rows: DayBookRow[] = [];

		// Cash-paid purchase bills
		purchases
			.filter((p) => p.purchase_date === selectedDate && p.amount_paid > 0)
			.forEach((p) => {
				rows.push({
					ref: p.purchase_number ?? '—',
					description: `Purchase – ${p.supplier_name ?? 'Supplier'}`,
					amount: p.amount_paid,
				});
			});

		// Expenses
		expenses
			.filter((e) => e.expense_date === selectedDate)
			.forEach((e) => {
				rows.push({
					ref: e.id.slice(0, 8).toUpperCase(),
					description: `Expense – ${e.category}${e.description ? ` · ${e.description}` : ''}`,
					amount: e.amount,
				});
			});

		// TODO: replace with paymentStore payments filtered by date & direction='made'

		return rows;
	}, [purchases, expenses, selectedDate]);

	const totalReceived = receivedRows.reduce((s, r) => s + r.amount, 0);
	const totalPaid = paidRows.reduce((s, r) => s + r.amount, 0);

	// Mock opening cash = 0 until bank/cash ledger is implemented
	// TODO: wire to a cash-ledger store when available
	const openingCash = 0;
	const closingCash = openingCash + totalReceived - totalPaid;

	const divider = (
		<View
			style={{
				height: StyleSheet.hairlineWidth,
				backgroundColor: c.border,
				marginVertical: SPACING_PX.xs,
			}}
		/>
	);

	const renderRows = (rows: DayBookRow[], accentColor: string) => {
		if (rows.length === 0) {
			return (
				<ThemedText
					variant="caption"
					color={c.onSurfaceVariant}
					style={{ paddingVertical: SPACING_PX.sm, textAlign: 'center' }}
				>
					No entries
				</ThemedText>
			);
		}
		return rows.map((row, idx) => (
			<View key={idx} style={styles.tableRow}>
				<View style={{ flex: 1 }}>
					<ThemedText weight="bold" style={{ fontSize: theme.typography.sizes.sm }}>
						{row.ref}
					</ThemedText>
					<ThemedText variant="caption" color={c.onSurfaceVariant} numberOfLines={1}>
						{row.description}
					</ThemedText>
				</View>
				<ThemedText weight="bold" color={accentColor}>
					{formatCurrency(row.amount)}
				</ThemedText>
			</View>
		));
	};

	return (
		<AtomicScreen
			safeAreaEdges={['bottom']}
			withKeyboard={false}
			scrollable
			header={
				<>
					<ScreenHeader title="Day Book" showBackButton />
					<View style={[styles.dateRow, { paddingHorizontal: s.md }]}>
						<Pressable
							onPress={() => setSelectedDate((d) => shiftDate(d, -1))}
							style={[
								styles.arrowBtn,
								{ backgroundColor: c.surface, borderRadius: r.md },
							]}
							accessibilityLabel="Previous day"
						>
							<ChevronLeft size={20} color={c.onSurface} strokeWidth={2} />
						</Pressable>

						<View style={{ flex: 1 }}>
							<DatePickerField
								label=""
								value={selectedDate}
								onChange={setSelectedDate}
							/>
						</View>

						<Pressable
							onPress={() => setSelectedDate((d) => shiftDate(d, 1))}
							style={[
								styles.arrowBtn,
								{ backgroundColor: c.surface, borderRadius: r.md },
							]}
							accessibilityLabel="Next day"
						>
							<ChevronRight size={20} color={c.onSurface} strokeWidth={2} />
						</Pressable>
					</View>
				</>
			}
			contentContainerStyle={[styles.content, { paddingBottom: s['2xl'] + s.sm }]}
		>
			{/* Two-column header */}
			<View style={styles.columnsRow}>
				{/* Received column */}
				<Card
					style={[styles.column, { borderTopColor: c.success, borderTopWidth: 3 }]}
					padding="sm"
				>
					<ThemedText
						weight="bold"
						color={c.success}
						style={{
							marginBottom: SPACING_PX.sm,
							fontSize: theme.typography.sizes.md,
						}}
					>
						Received
					</ThemedText>
					{divider}
					<View
						style={[
							styles.colHeader,
							{
								borderBottomColor: c.border,
								borderBottomWidth: StyleSheet.hairlineWidth,
							},
						]}
					>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={{ flex: 1 }}
						>
							Description
						</ThemedText>
						<ThemedText variant="caption" color={c.onSurfaceVariant}>
							Amount
						</ThemedText>
					</View>
					{renderRows(receivedRows, c.success)}
					{divider}
					<View style={styles.totalRow}>
						<ThemedText weight="bold" style={{ flex: 1 }}>
							Total
						</ThemedText>
						<ThemedText weight="bold" color={c.success}>
							{formatCurrency(totalReceived)}
						</ThemedText>
					</View>
				</Card>

				{/* Paid column */}
				<Card
					style={[styles.column, { borderTopColor: c.error, borderTopWidth: 3 }]}
					padding="sm"
				>
					<ThemedText
						weight="bold"
						color={c.error}
						style={{
							marginBottom: SPACING_PX.sm,
							fontSize: theme.typography.sizes.md,
						}}
					>
						Paid
					</ThemedText>
					{divider}
					<View
						style={[
							styles.colHeader,
							{
								borderBottomColor: c.border,
								borderBottomWidth: StyleSheet.hairlineWidth,
							},
						]}
					>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={{ flex: 1 }}
						>
							Description
						</ThemedText>
						<ThemedText variant="caption" color={c.onSurfaceVariant}>
							Amount
						</ThemedText>
					</View>
					{renderRows(paidRows, c.error)}
					{divider}
					<View style={styles.totalRow}>
						<ThemedText weight="bold" style={{ flex: 1 }}>
							Total
						</ThemedText>
						<ThemedText weight="bold" color={c.error}>
							{formatCurrency(totalPaid)}
						</ThemedText>
					</View>
				</Card>
			</View>

			{/* Balance section */}
			<Card style={{ marginTop: s.md, borderRadius: r.md }} padding="md">
				<ThemedText
					weight="bold"
					style={{ fontSize: theme.typography.sizes.md, marginBottom: SPACING_PX.md }}
				>
					Cash Balance
				</ThemedText>

				<View style={styles.balanceRow}>
					<ThemedText color={c.onSurfaceVariant}>Opening Cash</ThemedText>
					<ThemedText weight="medium">{formatCurrency(openingCash)}</ThemedText>
				</View>
				<View style={styles.balanceRow}>
					<ThemedText color={c.success}>+ Received</ThemedText>
					<ThemedText weight="medium" color={c.success}>
						{formatCurrency(totalReceived)}
					</ThemedText>
				</View>
				<View style={styles.balanceRow}>
					<ThemedText color={c.error}>– Paid</ThemedText>
					<ThemedText weight="medium" color={c.error}>
						{formatCurrency(totalPaid)}
					</ThemedText>
				</View>

				<View
					style={{
						height: StyleSheet.hairlineWidth,
						backgroundColor: c.border,
						marginVertical: s.sm,
					}}
				/>

				<View style={styles.balanceRow}>
					<ThemedText weight="bold" style={{ fontSize: theme.typography.sizes.md }}>
						Closing Cash
					</ThemedText>
					<ThemedText
						weight="bold"
						color={closingCash >= 0 ? c.success : c.error}
						style={{ fontSize: theme.typography.sizes.lg }}
					>
						{formatCurrency(Math.abs(closingCash))}
					</ThemedText>
				</View>
			</Card>

			{/* Export / Print placeholder */}
			<Pressable
				style={[
					styles.exportBtn,
					{
						backgroundColor: withOpacity(c.primary, OPACITY_ROW_DIVIDER),
						borderRadius: r.md,
						borderColor: c.primary,
						marginTop: s.md,
					},
				]}
				onPress={() => {}}
				accessibilityLabel="Export / Print Day Book"
			>
				<Printer size={18} color={c.primary} strokeWidth={2} />
				<ThemedText color={c.primary} weight="medium" style={{ marginLeft: SPACING_PX.sm }}>
					Export / Print
				</ThemedText>
			</Pressable>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	dateRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: SPACING_PX.sm,
		paddingVertical: SPACING_PX.sm,
	},
	arrowBtn: {
		width: SIZE_ICON_CIRCLE_MD,
		height: SIZE_ICON_CIRCLE_MD,
		alignItems: 'center',
		justifyContent: 'center',
	},
	content: {
		padding: SPACING_PX.lg,
		gap: 0,
	},
	columnsRow: {
		flexDirection: 'row',
		gap: SPACING_PX.md,
	},
	column: {
		flex: 1,
	},
	colHeader: {
		flexDirection: 'row',
		paddingBottom: SPACING_PX.sm - SPACING_PX.xxs,
		marginBottom: SPACING_PX.xs,
	},
	tableRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: SPACING_PX.sm - SPACING_PX.xxs,
		gap: SPACING_PX.xs,
	},
	totalRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingTop: SPACING_PX.xs,
	},
	balanceRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: SPACING_PX.xs,
	},
	exportBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: SPACING_PX.md,
		borderWidth: 1,
	},
});
