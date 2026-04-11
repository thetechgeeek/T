import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Pressable, ScrollView, Alert, Share } from 'react-native';
import {
	Search,
	MessageCircle,
	Printer,
	Share2,
	ChevronDown,
	ChevronUp,
	User,
} from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Card } from '@/src/components/atoms/Card';
import { SearchBar } from '@/src/components/molecules/SearchBar';
import { SkeletonBlock } from '@/src/components/atoms/SkeletonBlock';
import { useCustomerStore } from '@/src/stores/customerStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { supplierRepository } from '@/src/repositories/supplierRepository';
import type { Customer } from '@/src/types/customer';
import type { Supplier } from '@/src/types/supplier';
import { layout } from '@/src/theme/layout';

type Tab = 'customers' | 'suppliers';
type DateRange = 'this-month' | 'this-fy' | 'custom';

interface StatementTx {
	id: string;
	date: string;
	description: string;
	debit: number;
	credit: number;
	balance: number;
}

const MOCK_TRANSACTIONS: StatementTx[] = [
	{
		id: '1',
		date: '2024-04-05',
		description: 'Opening Balance',
		debit: 0,
		credit: 0,
		balance: 5000,
	},
	{
		id: '2',
		date: '2024-04-12',
		description: 'Invoice #INV-001 – Vitrified Tiles (60x60)',
		debit: 18500,
		credit: 0,
		balance: 23500,
	},
	{
		id: '3',
		date: '2024-04-20',
		description: 'Payment Received – UPI',
		debit: 0,
		credit: 15000,
		balance: 8500,
	},
	{
		id: '4',
		date: '2024-05-03',
		description: 'Invoice #INV-007 – Ceramic Wall Tiles',
		debit: 12400,
		credit: 0,
		balance: 20900,
	},
	{
		id: '5',
		date: '2024-05-15',
		description: 'Payment Received – NEFT',
		debit: 0,
		credit: 10000,
		balance: 10900,
	},
	{
		id: '6',
		date: '2024-06-08',
		description: 'Invoice #INV-015 – Mosaic Tiles',
		debit: 8750,
		credit: 0,
		balance: 19650,
	},
	{
		id: '7',
		date: '2024-06-25',
		description: 'Payment Received – Cheque',
		debit: 0,
		credit: 19650,
		balance: 0,
	},
];

const DATE_RANGE_LABELS: Record<DateRange, string> = {
	'this-month': 'This Month',
	'this-fy': 'This FY',
	custom: 'Custom',
};

function toISO(d: Date) {
	return d.toISOString().slice(0, 10);
}

function currentFYRange() {
	const now = new Date();
	const m = now.getMonth() + 1;
	const y = now.getFullYear();
	const fyStart = m >= 4 ? y : y - 1;
	return {
		from: `${fyStart}-04-01`,
		to: `${fyStart + 1}-03-31`,
		label: `April ${fyStart} – March ${fyStart + 1}`,
	};
}

function currentMonthRange() {
	const now = new Date();
	const from = new Date(now.getFullYear(), now.getMonth(), 1);
	return {
		from: toISO(from),
		to: toISO(now),
		label: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
	};
}

export default function PartyStatementScreen() {
	const { c, s, r, theme } = useThemeTokens();
	const { formatCurrency, formatDate } = useLocale();

	const [tab, setTab] = useState<Tab>('customers');
	const [search, setSearch] = useState('');
	const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
	const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
	const [dateRange, setDateRange] = useState<DateRange>('this-fy');
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [suppliersLoading, setSuppliersLoading] = useState(false);
	const [showPicker, setShowPicker] = useState(true);

	const { customers, loading: customersLoading, fetchCustomers } = useCustomerStore();

	useEffect(() => {
		fetchCustomers(true).catch(() => {});
	}, [fetchCustomers]);

	useEffect(() => {
		if (tab === 'suppliers' && suppliers.length === 0) {
			setSuppliersLoading(true);
			supplierRepository
				.findMany({})
				.then((r) => setSuppliers((r.data as Supplier[]) ?? []))
				.catch(() => Alert.alert('Error', 'Failed to load suppliers'))
				.finally(() => setSuppliersLoading(false));
		}
	}, [tab, suppliers.length]);

	const fy = currentFYRange();
	const mon = currentMonthRange();
	const periodLabel =
		dateRange === 'this-fy'
			? fy.label
			: dateRange === 'this-month'
				? mon.label
				: 'Custom Period';

	const filteredCustomers = useMemo(() => {
		if (!search) return customers.slice(0, 15);
		const q = search.toLowerCase();
		return customers
			.filter((c) => c.name.toLowerCase().includes(q) || (c.phone ?? '').includes(q))
			.slice(0, 15);
	}, [customers, search]);

	const filteredSuppliers = useMemo(() => {
		if (!search) return suppliers.slice(0, 15);
		const q = search.toLowerCase();
		return suppliers
			.filter((s) => s.name.toLowerCase().includes(q) || (s.phone ?? '').includes(q))
			.slice(0, 15);
	}, [suppliers, search]);

	const selectedParty = tab === 'customers' ? selectedCustomer : selectedSupplier;
	const partyName = tab === 'customers' ? selectedCustomer?.name : selectedSupplier?.name;
	const partyPhone = tab === 'customers' ? selectedCustomer?.phone : selectedSupplier?.phone;
	const partyGstin =
		tab === 'customers'
			? ((selectedCustomer as any)?.gstin ?? '')
			: ((selectedSupplier as any)?.gstin ?? '');

	const txs = MOCK_TRANSACTIONS; // TODO: replace with real ledger from store
	const openingBal = txs[0]?.balance ?? 0;
	const closingBal = txs[txs.length - 1]?.balance ?? 0;
	const totalDebit = txs.slice(1).reduce((a, t) => a + t.debit, 0);
	const totalCredit = txs.slice(1).reduce((a, t) => a + t.credit, 0);
	const outstanding = closingBal;

	const handleSelectCustomer = (c: Customer) => {
		setSelectedCustomer(c);
		setShowPicker(false);
		setSearch('');
	};

	const handleSelectSupplier = (s: Supplier) => {
		setSelectedSupplier(s);
		setShowPicker(false);
		setSearch('');
	};

	const handleWhatsApp = () => {
		const msg = `Statement of Account\nParty: ${partyName}\nPeriod: ${periodLabel}\nOutstanding: ${formatCurrency(outstanding)}`;
		Alert.alert('WhatsApp', msg);
	};

	const handleShare = () => {
		Share.share({ message: `Party Statement for ${partyName} – ${periodLabel}` });
	};

	const isLoading = tab === 'customers' ? customersLoading : suppliersLoading;

	return (
		<AtomicScreen safeAreaEdges={['bottom']} scrollable>
			<ScreenHeader title="Party Statement" />

			{/* Tab bar */}
			<View style={[styles.tabBar, { borderBottomColor: c.border }]}>
				{(['customers', 'suppliers'] as Tab[]).map((t) => (
					<Pressable
						key={t}
						onPress={() => {
							setTab(t);
							setSelectedCustomer(null);
							setSelectedSupplier(null);
							setShowPicker(true);
							setSearch('');
						}}
						style={[
							styles.tabBtn,
							tab === t && { borderBottomColor: c.primary, borderBottomWidth: 2 },
						]}
						accessibilityRole="tab"
						accessibilityState={{ selected: tab === t }}
					>
						<ThemedText
							variant="bodyBold"
							color={tab === t ? c.primary : c.onSurfaceVariant}
						>
							{t === 'customers' ? 'Customers' : 'Suppliers'}
						</ThemedText>
					</Pressable>
				))}
			</View>

			{/* Date range chips */}
			<View
				style={[layout.row, { gap: s.sm, paddingHorizontal: s.md, paddingVertical: s.sm }]}
			>
				{(['this-month', 'this-fy', 'custom'] as DateRange[]).map((dr) => (
					<Pressable
						key={dr}
						onPress={() => setDateRange(dr)}
						style={[
							styles.chip,
							{
								borderColor: dateRange === dr ? c.primary : c.border,
								backgroundColor: dateRange === dr ? c.primary : c.surface,
								borderRadius: r.full,
							},
						]}
					>
						<ThemedText
							variant="caption"
							color={dateRange === dr ? '#FFF' : c.onSurface}
						>
							{DATE_RANGE_LABELS[dr]}
						</ThemedText>
					</Pressable>
				))}
			</View>

			{/* Party picker */}
			<View style={{ paddingHorizontal: s.md }}>
				{selectedParty ? (
					<Pressable
						style={[
							styles.selectedPartyRow,
							{
								backgroundColor: c.card,
								borderRadius: r.md,
								borderColor: c.border,
								...(theme.shadows.sm as object),
							},
						]}
						onPress={() => setShowPicker(!showPicker)}
					>
						<View style={[styles.partyAvatar, { backgroundColor: c.primary }]}>
							<User size={18} color="#FFF" />
						</View>
						<View style={{ flex: 1 }}>
							<ThemedText variant="bodyBold">{partyName}</ThemedText>
							{partyPhone ? (
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									{partyPhone}
								</ThemedText>
							) : null}
						</View>
						{showPicker ? (
							<ChevronUp size={18} color={c.onSurfaceVariant} />
						) : (
							<ChevronDown size={18} color={c.onSurfaceVariant} />
						)}
					</Pressable>
				) : (
					<View
						style={[
							styles.pickerPrompt,
							{ backgroundColor: c.card, borderRadius: r.md, borderColor: c.border },
						]}
					>
						<Search
							size={18}
							color={c.onSurfaceVariant}
							style={{ marginRight: s.sm }}
						/>
						<ThemedText variant="body" color={c.onSurfaceVariant}>
							Search and select a {tab === 'customers' ? 'customer' : 'supplier'}…
						</ThemedText>
					</View>
				)}

				{showPicker && (
					<View style={{ marginTop: s.sm }}>
						<SearchBar
							value={search}
							onSearch={setSearch}
							placeholder={`Search ${tab}…`}
						/>
						{isLoading ? (
							<View style={{ gap: s.sm, marginTop: s.sm }}>
								<SkeletonBlock height={48} borderRadius={r.md} />
								<SkeletonBlock height={48} borderRadius={r.md} />
							</View>
						) : (
							<View
								style={[
									styles.dropdownList,
									{
										backgroundColor: c.card,
										borderColor: c.border,
										borderRadius: r.md,
									},
								]}
							>
								{tab === 'customers'
									? filteredCustomers.map((item) => (
											<Pressable
												key={item.id}
												style={[
													styles.dropdownItem,
													{ borderBottomColor: c.border },
												]}
												onPress={() => handleSelectCustomer(item)}
											>
												<ThemedText variant="body">{item.name}</ThemedText>
												{(item.current_balance ?? 0) !== 0 && (
													<ThemedText
														variant="caption"
														color={
															(item.current_balance ?? 0) > 0
																? c.error
																: c.success
														}
													>
														{formatCurrency(
															Math.abs(item.current_balance ?? 0),
														)}{' '}
														{(item.current_balance ?? 0) > 0
															? 'due'
															: 'advance'}
													</ThemedText>
												)}
											</Pressable>
										))
									: filteredSuppliers.map((item) => (
											<Pressable
												key={item.id}
												style={[
													styles.dropdownItem,
													{ borderBottomColor: c.border },
												]}
												onPress={() => handleSelectSupplier(item)}
											>
												<ThemedText variant="body">{item.name}</ThemedText>
											</Pressable>
										))}
								{(tab === 'customers' ? filteredCustomers : filteredSuppliers)
									.length === 0 && (
									<View style={{ padding: s.md, alignItems: 'center' }}>
										<ThemedText variant="caption" color={c.onSurfaceVariant}>
											No results found
										</ThemedText>
									</View>
								)}
							</View>
						)}
					</View>
				)}
			</View>

			{/* Statement */}
			{selectedParty && !showPicker && (
				<View style={{ paddingHorizontal: s.md, marginTop: s.md }}>
					{/* Party header card */}
					<Card style={{ marginBottom: s.sm }}>
						<ThemedText variant="h3">{partyName}</ThemedText>
						{partyPhone ? (
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{partyPhone}
							</ThemedText>
						) : null}
						{partyGstin ? (
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								GSTIN: {partyGstin}
							</ThemedText>
						) : null}
						<View
							style={[
								styles.periodRow,
								{ backgroundColor: c.background, borderRadius: r.sm },
							]}
						>
							<ThemedText variant="captionBold" color={c.onSurfaceVariant}>
								Statement period: {periodLabel}
							</ThemedText>
						</View>
					</Card>

					{/* Summary cards */}
					<View style={[layout.row, { gap: s.sm, marginBottom: s.sm }]}>
						<Card style={{ flex: 1, alignItems: 'center' }}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Total Invoiced
							</ThemedText>
							<ThemedText variant="amount" color={c.onSurface}>
								{formatCurrency(totalDebit)}
							</ThemedText>
						</Card>
						<Card style={{ flex: 1, alignItems: 'center' }}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Total Received
							</ThemedText>
							<ThemedText variant="amount" color={c.success}>
								{formatCurrency(totalCredit)}
							</ThemedText>
						</Card>
						<Card style={{ flex: 1, alignItems: 'center' }}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Net Outstanding
							</ThemedText>
							<ThemedText
								variant="amount"
								color={
									outstanding > 0
										? c.error
										: outstanding < 0
											? c.success
											: c.onSurfaceVariant
								}
							>
								{formatCurrency(Math.abs(outstanding))}
							</ThemedText>
						</Card>
					</View>

					{/* Transaction table */}
					<Card style={{ padding: 0, overflow: 'hidden', marginBottom: s.sm }}>
						{/* Table header */}
						<View style={[styles.tableHeader, { backgroundColor: c.primary }]}>
							<ThemedText
								style={[styles.colDate, styles.headerText]}
								color="#FFF"
								variant="captionBold"
							>
								Date
							</ThemedText>
							<ThemedText
								style={[styles.colDesc, styles.headerText]}
								color="#FFF"
								variant="captionBold"
							>
								Description
							</ThemedText>
							<ThemedText
								style={[styles.colAmt, styles.headerText]}
								color="#FFF"
								variant="captionBold"
								align="right"
							>
								Debit
							</ThemedText>
							<ThemedText
								style={[styles.colAmt, styles.headerText]}
								color="#FFF"
								variant="captionBold"
								align="right"
							>
								Credit
							</ThemedText>
							<ThemedText
								style={[styles.colAmt, styles.headerText]}
								color="#FFF"
								variant="captionBold"
								align="right"
							>
								Balance
							</ThemedText>
						</View>

						{/* Opening balance row */}
						<View
							style={[
								styles.tableRow,
								{ backgroundColor: c.background, borderBottomColor: c.border },
							]}
						>
							<ThemedText
								style={styles.colDate}
								variant="caption"
								color={c.onSurfaceVariant}
							>
								–
							</ThemedText>
							<ThemedText
								style={styles.colDesc}
								variant="captionBold"
								color={c.onSurface}
							>
								Opening Balance
							</ThemedText>
							<ThemedText style={styles.colAmt} variant="caption" align="right" />
							<ThemedText style={styles.colAmt} variant="caption" align="right" />
							<ThemedText
								style={styles.colAmt}
								variant="captionBold"
								color={c.onSurface}
								align="right"
							>
								{formatCurrency(openingBal)}
							</ThemedText>
						</View>

						{/* Transaction rows */}
						{txs.slice(1).map((tx, idx) => (
							<View
								key={tx.id}
								style={[
									styles.tableRow,
									{
										borderBottomColor: c.border,
										backgroundColor: idx % 2 === 0 ? c.card : c.surface,
									},
								]}
							>
								<ThemedText
									style={styles.colDate}
									variant="caption"
									color={c.onSurfaceVariant}
								>
									{tx.date.slice(5).replace('-', '/')}
								</ThemedText>
								<ThemedText
									style={styles.colDesc}
									variant="caption"
									color={c.onSurface}
									numberOfLines={2}
								>
									{tx.description}
								</ThemedText>
								<ThemedText
									style={styles.colAmt}
									variant="caption"
									color={tx.debit > 0 ? c.error : c.onSurfaceVariant}
									align="right"
								>
									{tx.debit > 0 ? formatCurrency(tx.debit) : '–'}
								</ThemedText>
								<ThemedText
									style={styles.colAmt}
									variant="caption"
									color={tx.credit > 0 ? c.success : c.onSurfaceVariant}
									align="right"
								>
									{tx.credit > 0 ? formatCurrency(tx.credit) : '–'}
								</ThemedText>
								<ThemedText
									style={styles.colAmt}
									variant="caption"
									color={c.onSurface}
									align="right"
								>
									{formatCurrency(tx.balance)}
								</ThemedText>
							</View>
						))}

						{/* Closing balance row */}
						<View
							style={[
								styles.tableRow,
								{ backgroundColor: c.background, borderBottomColor: c.border },
							]}
						>
							<ThemedText
								style={styles.colDate}
								variant="captionBold"
								color={c.onSurface}
							>
								–
							</ThemedText>
							<ThemedText
								style={styles.colDesc}
								variant="bodyBold"
								color={c.onSurface}
							>
								Closing Balance
							</ThemedText>
							<ThemedText
								style={styles.colAmt}
								variant="captionBold"
								color={c.error}
								align="right"
							>
								{formatCurrency(totalDebit)}
							</ThemedText>
							<ThemedText
								style={styles.colAmt}
								variant="captionBold"
								color={c.success}
								align="right"
							>
								{formatCurrency(totalCredit)}
							</ThemedText>
							<ThemedText
								style={styles.colAmt}
								variant="bodyBold"
								color={
									closingBal > 0
										? c.error
										: closingBal < 0
											? c.success
											: c.onSurface
								}
								align="right"
							>
								{formatCurrency(Math.abs(closingBal))}
							</ThemedText>
						</View>
					</Card>

					{/* Action buttons */}
					<View style={[layout.row, { gap: s.sm, marginBottom: s.xl }]}>
						<Pressable
							style={[
								styles.actionBtn,
								{ backgroundColor: '#25D366', borderRadius: r.md, flex: 1 },
							]}
							onPress={handleWhatsApp}
							accessibilityRole="button"
							accessibilityLabel="Share on WhatsApp"
						>
							<MessageCircle size={16} color="#FFF" />
							<ThemedText
								variant="captionBold"
								color="#FFF"
								style={{ marginLeft: 6 }}
							>
								WhatsApp
							</ThemedText>
						</Pressable>
						<Pressable
							style={[
								styles.actionBtn,
								{
									backgroundColor: c.card,
									borderColor: c.border,
									borderWidth: 1,
									borderRadius: r.md,
									flex: 1,
								},
							]}
							onPress={() => Alert.alert('Print', 'Print functionality coming soon')}
							accessibilityRole="button"
							accessibilityLabel="Print"
						>
							<Printer size={16} color={c.onSurface} />
							<ThemedText
								variant="captionBold"
								color={c.onSurface}
								style={{ marginLeft: 6 }}
							>
								Print
							</ThemedText>
						</Pressable>
						<Pressable
							style={[
								styles.actionBtn,
								{
									backgroundColor: c.card,
									borderColor: c.border,
									borderWidth: 1,
									borderRadius: r.md,
									flex: 1,
								},
							]}
							onPress={handleShare}
							accessibilityRole="button"
							accessibilityLabel="Share PDF"
						>
							<Share2 size={16} color={c.onSurface} />
							<ThemedText
								variant="captionBold"
								color={c.onSurface}
								style={{ marginLeft: 6 }}
							>
								Share PDF
							</ThemedText>
						</Pressable>
					</View>
				</View>
			)}

			{!selectedParty && (
				<View style={{ padding: s.xl, alignItems: 'center', marginTop: s.xl }}>
					<User size={48} color={c.border} />
					<ThemedText
						variant="body"
						color={c.onSurfaceVariant}
						align="center"
						style={{ marginTop: s.md }}
					>
						Select a party above to view their account statement
					</ThemedText>
				</View>
			)}
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	tabBar: {
		flexDirection: 'row',
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	tabBtn: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: 12,
	},
	chip: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderWidth: 1,
	},
	selectedPartyRow: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		borderWidth: 1,
	},
	partyAvatar: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 10,
	},
	pickerPrompt: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		borderWidth: 1,
	},
	dropdownList: {
		borderWidth: 1,
		overflow: 'hidden',
		marginTop: 4,
	},
	dropdownItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 14,
		paddingVertical: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	periodRow: {
		marginTop: 8,
		paddingHorizontal: 10,
		paddingVertical: 6,
		alignSelf: 'flex-start',
	},
	tableHeader: {
		flexDirection: 'row',
		paddingHorizontal: 10,
		paddingVertical: 8,
	},
	headerText: {
		fontWeight: '700',
	},
	tableRow: {
		flexDirection: 'row',
		paddingHorizontal: 10,
		paddingVertical: 8,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	colDate: {
		width: 42,
		marginRight: 4,
	},
	colDesc: {
		flex: 1,
		marginRight: 4,
	},
	colAmt: {
		width: 68,
	},
	actionBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 12,
	},
});
