import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Card } from '@/src/components/atoms/Card';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { useCustomerStore } from '@/src/stores/customerStore';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { useFinanceStore } from '@/src/stores/financeStore';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import type { ThemeColors } from '@/src/theme';
import { useLocale } from '@/src/hooks/useLocale';
import { withOpacity } from '@/src/utils/color';

function toISO(d: Date) {
	return d.toISOString().slice(0, 10);
}

function getMonthInfo(offset: number): { label: string; from: string; asOn: string } {
	const now = new Date();
	const base = new Date(now.getFullYear(), now.getMonth() + offset, 1);
	const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0);
	return {
		label: base.toLocaleString('default', { month: 'long', year: 'numeric' }),
		from: toISO(base),
		asOn: toISO(lastDay),
	};
}

function SectionRow({
	label,
	value,
	bold,
	color,
	onPress,
	c,
	formatCurrency,
}: {
	label: string;
	value: number;
	bold?: boolean;
	color?: string;
	onPress?: () => void;
	c: ThemeColors;
	formatCurrency: (v: number) => string;
}) {
	return (
		<View style={styles.sectionRow}>
			{onPress ? (
				<Pressable onPress={onPress} style={{ flex: 1 }}>
					<ThemedText
						weight={bold ? 'bold' : 'regular'}
						color={color ?? c.primary}
						style={{ textDecorationLine: 'underline' }}
					>
						{label}
					</ThemedText>
				</Pressable>
			) : (
				<ThemedText
					weight={bold ? 'bold' : 'regular'}
					color={color ?? c.onSurface}
					style={{ flex: 1 }}
				>
					{label}
				</ThemedText>
			)}
			<ThemedText weight={bold ? 'bold' : 'regular'} color={color ?? c.onSurface}>
				{formatCurrency(value)}
			</ThemedText>
		</View>
	);
}

export default function BalanceSheetScreen() {
	const { c, s, theme } = useThemeTokens();
	const { formatCurrency } = useLocale();

	const [offset, setOffset] = useState(0);
	const [openingCapital, setOpeningCapital] = useState('0');

	const { customers, fetchCustomers } = useCustomerStore(
		useShallow((state) => ({
			customers: state.customers,
			fetchCustomers: state.fetchCustomers,
		})),
	);

	const { items, fetchItems } = useInventoryStore(
		useShallow((state) => ({
			items: state.items,
			fetchItems: state.fetchItems,
		})),
	);

	const { expenses, purchases, initialize } = useFinanceStore(
		useShallow((state) => ({
			expenses: state.expenses,
			purchases: state.purchases,
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
		fetchCustomers(true);
		fetchItems(true);
		initialize();
		fetchInvoices(1);
	}, [fetchCustomers, fetchItems, initialize, fetchInvoices]);

	const { label, from, asOn } = useMemo(() => getMonthInfo(offset), [offset]);

	// Assets
	const cashInHand = 0;
	const bankBalances = 0;
	const tradeReceivables = useMemo(
		() => customers.reduce((sum, c) => sum + (c.current_balance ?? 0), 0),
		[customers],
	);
	const stockValue = useMemo(
		() => items.reduce((sum, item) => sum + item.box_count * item.cost_price, 0),
		[items],
	);
	const totalAssets = cashInHand + bankBalances + tradeReceivables + stockValue;

	// Liabilities
	const tradePayables = 0;
	const gstPayable = 0;
	const loansOutstanding = 0;
	const totalLiabilities = tradePayables + gstPayable + loansOutstanding;

	// P&L for net profit (current FY approximation using all data in range)
	const saleRevenue = useMemo(
		() =>
			invoices
				.filter((inv) => inv.invoice_date >= from && inv.invoice_date <= asOn)
				.reduce((sum, inv) => sum + inv.grand_total, 0),
		[invoices, from, asOn],
	);
	const purchasesTotal = useMemo(
		() =>
			purchases
				.filter((p) => p.purchase_date >= from && p.purchase_date <= asOn)
				.reduce((sum, p) => sum + p.grand_total, 0),
		[purchases, from, asOn],
	);
	const totalExpenses = useMemo(
		() =>
			expenses
				.filter((e) => e.expense_date >= from && e.expense_date <= asOn)
				.reduce((sum, e) => sum + e.amount, 0),
		[expenses, from, asOn],
	);
	const grossProfit = saleRevenue - purchasesTotal;
	const netProfit = grossProfit - totalExpenses;

	const openingCapitalNum = parseFloat(openingCapital) || 0;
	const totalCapital = openingCapitalNum + netProfit;

	const balanceCheck = totalAssets - (totalLiabilities + totalCapital);
	const isBalanced = Math.abs(balanceCheck) < 1;

	return (
		<AtomicScreen safeAreaEdges={['bottom']}>
			<ScreenHeader title="Balance Sheet" showBackButton />

			{/* Month navigation */}
			<View style={[styles.periodNav, { paddingHorizontal: s.md, marginVertical: 8 }]}>
				<Pressable
					onPress={() => setOffset((o) => o - 1)}
					style={styles.navBtn}
					accessibilityLabel="Previous month"
				>
					<ChevronLeft size={20} color={c.onSurface} strokeWidth={2} />
				</Pressable>
				<View style={{ flex: 1, alignItems: 'center' }}>
					<ThemedText weight="bold">{label}</ThemedText>
					<ThemedText variant="caption" color={c.onSurfaceVariant}>
						As on {asOn}
					</ThemedText>
				</View>
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
				{/* ASSETS */}
				<Card padding="md">
					<ThemedText
						weight="bold"
						style={{ marginBottom: 10, fontSize: theme.typography.sizes.md }}
					>
						Assets
					</ThemedText>
					<ThemedText
						variant="caption"
						weight="bold"
						color={c.onSurfaceVariant}
						style={{ marginBottom: 6 }}
					>
						Current Assets
					</ThemedText>
					<SectionRow
						label="Cash in Hand"
						value={cashInHand}
						onPress={() => Alert.alert('Cash in Hand', 'Cash ledger coming soon.')}
						c={c}
						formatCurrency={formatCurrency}
					/>
					<SectionRow
						label="Bank Balances"
						value={bankBalances}
						c={c}
						formatCurrency={formatCurrency}
					/>
					<SectionRow
						label="Trade Receivables"
						value={tradeReceivables}
						c={c}
						formatCurrency={formatCurrency}
					/>
					<SectionRow
						label="Stock Value"
						value={stockValue}
						c={c}
						formatCurrency={formatCurrency}
					/>
					<View style={[styles.divider, { backgroundColor: c.border }]} />
					<SectionRow
						label="Total Assets"
						value={totalAssets}
						bold
						c={c}
						formatCurrency={formatCurrency}
					/>
				</Card>

				{/* LIABILITIES */}
				<Card padding="md">
					<ThemedText
						weight="bold"
						style={{ marginBottom: 10, fontSize: theme.typography.sizes.md }}
					>
						Liabilities
					</ThemedText>
					<ThemedText
						variant="caption"
						weight="bold"
						color={c.onSurfaceVariant}
						style={{ marginBottom: 6 }}
					>
						Current Liabilities
					</ThemedText>
					<SectionRow
						label="Trade Payables"
						value={tradePayables}
						c={c}
						formatCurrency={formatCurrency}
					/>
					<SectionRow
						label="GST Payable"
						value={gstPayable}
						c={c}
						formatCurrency={formatCurrency}
					/>
					<SectionRow
						label="Loans Outstanding"
						value={loansOutstanding}
						c={c}
						formatCurrency={formatCurrency}
					/>
					<View style={[styles.divider, { backgroundColor: c.border }]} />
					<SectionRow
						label="Total Liabilities"
						value={totalLiabilities}
						bold
						c={c}
						formatCurrency={formatCurrency}
					/>
				</Card>

				{/* CAPITAL */}
				<Card padding="md">
					<ThemedText
						weight="bold"
						style={{ marginBottom: 10, fontSize: theme.typography.sizes.md }}
					>
						Capital
					</ThemedText>

					{/* Opening Capital: editable */}
					<View style={styles.sectionRow}>
						<ThemedText style={{ flex: 1 }} color={c.onSurface}>
							Opening Capital
						</ThemedText>
						<TextInput
							value={openingCapital}
							onChangeText={setOpeningCapital}
							keyboardType="numeric"
							style={[
								styles.capitalInput,
								{
									color: c.onSurface,
									borderColor: c.border,
									backgroundColor: c.surface,
								},
							]}
							accessibilityLabel="Opening Capital"
						/>
					</View>

					<SectionRow
						label="Net Profit"
						value={netProfit}
						color={netProfit >= 0 ? c.success : c.error}
						c={c}
						formatCurrency={formatCurrency}
					/>
					<View style={[styles.divider, { backgroundColor: c.border }]} />
					<SectionRow
						label="Total Capital"
						value={totalCapital}
						bold
						c={c}
						formatCurrency={formatCurrency}
					/>
				</Card>

				{/* Balance Check */}
				<Card
					padding="md"
					style={{
						backgroundColor: withOpacity(isBalanced ? c.success : c.error, 0.08),
						borderWidth: 1.5,
						borderColor: isBalanced ? c.success : c.error,
					}}
				>
					<ThemedText
						variant="caption"
						color={c.onSurfaceVariant}
						style={{ textAlign: 'center', marginBottom: 4 }}
					>
						Assets = Liabilities + Capital
					</ThemedText>
					{isBalanced ? (
						<ThemedText
							weight="bold"
							color={c.success}
							style={{ textAlign: 'center', fontSize: theme.typography.sizes.md }}
						>
							Balanced
						</ThemedText>
					) : (
						<ThemedText
							weight="bold"
							color={c.error}
							style={{ textAlign: 'center', fontSize: theme.typography.sizes.md }}
						>
							Difference: {formatCurrency(Math.abs(balanceCheck))}
						</ThemedText>
					)}
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
		alignItems: 'center',
		paddingVertical: 5,
	},
	divider: {
		height: StyleSheet.hairlineWidth,
		marginVertical: 6,
	},
	capitalInput: {
		borderWidth: 1,
		borderRadius: 6,
		paddingHorizontal: 10,
		paddingVertical: 4,
		minWidth: 100,
		textAlign: 'right',
		fontSize: 14,
	},
});
