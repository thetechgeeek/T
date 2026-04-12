import React, { useState } from 'react';
import {
	View,
	StyleSheet,
	FlatList,
	TextInput,
	Alert,
	RefreshControl,
	Pressable,
} from 'react-native';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Card } from '@/src/components/atoms/Card';
import { Button } from '@/src/components/atoms/Button';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';

// TODO: connect to store — derive from invoices, expenses, purchases with cash payment
const MOCK_OPENING_BALANCE = 0;

const mockCashTransactions = [
	{ id: '1', date: '2025-04-08', description: 'Sale INV-001', type: 'in' as const, amount: 5000 },
	{
		id: '2',
		date: '2025-04-08',
		description: 'Rent Expense',
		type: 'out' as const,
		amount: 2000,
	},
	{
		id: '3',
		date: '2025-04-07',
		description: 'Sale INV-002',
		type: 'in' as const,
		amount: 12000,
	},
	{
		id: '4',
		date: '2025-04-07',
		description: 'Labour Payment',
		type: 'out' as const,
		amount: 3500,
	},
	{ id: '5', date: '2025-04-06', description: 'Sale INV-003', type: 'in' as const, amount: 8000 },
	{
		id: '6',
		date: '2025-04-05',
		description: 'Packaging Materials',
		type: 'out' as const,
		amount: 1200,
	},
	{ id: '7', date: '2025-04-04', description: 'Sale INV-004', type: 'in' as const, amount: 4500 },
];

type DateFilter = 'today' | 'week' | 'month' | 'fy';

const DATE_FILTERS: { label: string; value: DateFilter }[] = [
	{ label: 'Today', value: 'today' },
	{ label: 'Week', value: 'week' },
	{ label: 'Month', value: 'month' },
	{ label: 'FY', value: 'fy' },
];

function filterByDate(
	transactions: typeof mockCashTransactions,
	filter: DateFilter,
): typeof mockCashTransactions {
	const now = new Date();
	return transactions.filter((tx) => {
		const d = new Date(tx.date);
		if (filter === 'today') {
			return d.toDateString() === now.toDateString();
		}
		if (filter === 'week') {
			const weekAgo = new Date(now);
			weekAgo.setDate(now.getDate() - 7);
			return d >= weekAgo;
		}
		if (filter === 'month') {
			return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
		}
		// FY — April to March
		const month = now.getMonth() + 1;
		const fyStartYear = month >= 4 ? now.getFullYear() : now.getFullYear() - 1;
		const fyStart = new Date(`${fyStartYear}-04-01`);
		const fyEnd = new Date(`${fyStartYear + 1}-03-31`);
		return d >= fyStart && d <= fyEnd;
	});
}

export default function CashInHandScreen() {
	const { theme, c, r } = useThemeTokens();
	const { formatCurrency, formatDate } = useLocale();

	const [activeFilter, setActiveFilter] = useState<DateFilter>('month');
	const [openingBalance, setOpeningBalance] = useState(MOCK_OPENING_BALANCE);
	const [balanceInput, setBalanceInput] = useState('');
	const [refreshing, setRefreshing] = useState(false);

	const filtered = filterByDate(mockCashTransactions, activeFilter);

	const cashIn = filtered.filter((t) => t.type === 'in').reduce((s, t) => s + t.amount, 0);
	const cashOut = filtered.filter((t) => t.type === 'out').reduce((s, t) => s + t.amount, 0);
	const cashInHand = openingBalance + cashIn - cashOut;

	const handleSaveBalance = () => {
		const val = parseFloat(balanceInput);
		if (isNaN(val) || val < 0) {
			Alert.alert('Invalid amount', 'Please enter a valid opening balance.');
			return;
		}
		setOpeningBalance(val);
		setBalanceInput('');
		Alert.alert('Saved', `Opening balance set to ${formatCurrency(val)}`);
	};

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title="Cash in Hand" showBackButton />

			<FlatList
				data={filtered}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={() => {
							// TODO: connect to store
							setRefreshing(true);
							setTimeout(() => setRefreshing(false), 500);
						}}
						tintColor={theme.colors.primary}
					/>
				}
				ListHeaderComponent={
					<>
						{/* Cash in hand balance */}
						<View
							style={[
								styles.balanceCard,
								{ backgroundColor: theme.colors.primary, borderRadius: r.lg },
							]}
						>
							<ThemedText variant="caption" color="rgba(255,255,255,0.8)">
								Cash in Hand
							</ThemedText>
							<ThemedText
								variant="h1"
								color="#fff"
								style={styles.balanceAmount}
								accessibilityLabel={`Cash in hand ${formatCurrency(cashInHand)}`}
							>
								{formatCurrency(cashInHand)}
							</ThemedText>
						</View>

						{/* Opening balance prompt */}
						{openingBalance === 0 && (
							<Card padding="md" style={styles.openingBalanceCard}>
								<ThemedText
									variant="caption"
									color={theme.colors.onSurfaceVariant}
									style={{ marginBottom: 12 }}
								>
									No opening balance set. Set your cash opening balance to get
									accurate totals.
								</ThemedText>
								<View style={styles.balanceInputRow}>
									<View
										style={[
											styles.inputWrapper,
											{
												borderColor: c.border,
												borderRadius: r.md,
												flex: 1,
											},
										]}
									>
										<ThemedText
											style={{ paddingHorizontal: 10, color: c.onSurface }}
										>
											₹
										</ThemedText>
										<TextInput
											value={balanceInput}
											onChangeText={setBalanceInput}
											placeholder="0"
											placeholderTextColor={c.placeholder}
											keyboardType="numeric"
											style={[styles.balanceInput, { color: c.onSurface }]}
											accessibilityLabel="opening-balance-input"
										/>
									</View>
									<Button
										title="Save"
										onPress={handleSaveBalance}
										size="sm"
										style={{ marginLeft: 10 }}
										accessibilityLabel="save-opening-balance"
									/>
								</View>
							</Card>
						)}

						{/* Date filter chips */}
						<View style={styles.filterRow}>
							{DATE_FILTERS.map((f) => (
								<Pressable
									key={f.value}
									onPress={() => setActiveFilter(f.value)}
									style={[
										styles.filterChip,
										{
											backgroundColor:
												activeFilter === f.value
													? c.primary
													: theme.colors.surfaceVariant,
											borderRadius: r.full,
										},
									]}
									accessibilityRole="button"
									accessibilityState={{ selected: activeFilter === f.value }}
									accessibilityLabel={`filter-${f.value}`}
								>
									<ThemedText
										variant="caption"
										color={
											activeFilter === f.value
												? c.onPrimary
												: c.onSurfaceVariant
										}
										style={{
											fontWeight: activeFilter === f.value ? '700' : '400',
										}}
									>
										{f.label}
									</ThemedText>
								</Pressable>
							))}
						</View>

						<ThemedText
							variant="caption"
							color={theme.colors.onSurfaceVariant}
							style={styles.sectionLabel}
						>
							TRANSACTIONS
						</ThemedText>
					</>
				}
				ListEmptyComponent={
					<Card padding="lg" style={{ alignItems: 'center', marginTop: 12 }}>
						<ThemedText color={theme.colors.onSurfaceVariant}>
							No cash transactions found for this period.
						</ThemedText>
					</Card>
				}
				renderItem={({ item }) => (
					<Card
						padding="md"
						style={[
							styles.txRow,
							{
								borderLeftColor:
									item.type === 'in' ? theme.colors.success : theme.colors.error,
							},
						]}
					>
						<View style={styles.txLeft}>
							<ThemedText variant="caption" color={theme.colors.onSurfaceVariant}>
								{formatDate(item.date)}
							</ThemedText>
							<ThemedText weight="medium">{item.description}</ThemedText>
						</View>
						<ThemedText
							weight="bold"
							color={item.type === 'in' ? theme.colors.success : theme.colors.error}
						>
							{item.type === 'in' ? '+' : '-'}
							{formatCurrency(item.amount)}
						</ThemedText>
					</Card>
				)}
				ListFooterComponent={
					filtered.length > 0 ? (
						<View
							style={[
								styles.footer,
								{
									backgroundColor: theme.colors.surfaceVariant,
									borderRadius: r.md,
									marginTop: 8,
								},
							]}
						>
							<ThemedText variant="caption" color={theme.colors.onSurfaceVariant}>
								Cash In:{' '}
								<ThemedText
									variant="caption"
									weight="bold"
									color={theme.colors.success}
								>
									{formatCurrency(cashIn)}
								</ThemedText>
								{'  ·  '}Cash Out:{' '}
								<ThemedText
									variant="caption"
									weight="bold"
									color={theme.colors.error}
								>
									{formatCurrency(cashOut)}
								</ThemedText>
								{'  ·  '}Net:{' '}
								<ThemedText
									variant="caption"
									weight="bold"
									color={
										cashIn - cashOut >= 0
											? theme.colors.success
											: theme.colors.error
									}
								>
									{formatCurrency(cashIn - cashOut)}
								</ThemedText>
							</ThemedText>
						</View>
					) : null
				}
			/>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	listContent: {
		padding: 16,
		paddingBottom: 40,
	},
	balanceCard: {
		alignItems: 'center',
		padding: 24,
		marginBottom: 16,
	},
	balanceAmount: {
		marginTop: 6,
		fontSize: 40,
		fontWeight: '700',
	},
	openingBalanceCard: {
		marginBottom: 16,
	},
	balanceInputRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	inputWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		height: 44,
	},
	balanceInput: {
		flex: 1,
		fontSize: 16,
		paddingRight: 10,
	},
	filterRow: {
		flexDirection: 'row',
		gap: 8,
		marginBottom: 16,
	},
	filterChip: {
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	sectionLabel: {
		marginBottom: 8,
		letterSpacing: 0.8,
		fontWeight: '600',
	},
	txRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 10,
		borderLeftWidth: 4,
	},
	txLeft: {
		flex: 1,
		marginRight: 12,
	},
	footer: {
		padding: 14,
		alignItems: 'center',
		marginBottom: 16,
	},
});
