import React, { useState } from 'react';
import {
	BORDER_WIDTH_ACCENT,
	BORDER_WIDTH_BASE,
	GLASS_WHITE_TEXT,
	LETTER_SPACING_SECTION,
	SIZE_VALUE_XXL,
} from '@/src/theme/uiMetrics';
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
import { MOCK_CASH_TRANSACTIONS } from '@/src/mocks/finance/cash';
import { SPACING_PX, TOUCH_TARGET_MIN_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

// TODO: connect to store — derive from invoices, expenses, purchases with cash payment
const MOCK_OPENING_BALANCE = 0;
type DateFilter = 'today' | 'week' | 'month' | 'fy';

const DATE_FILTERS: { label: string; value: DateFilter }[] = [
	{ label: 'Today', value: 'today' },
	{ label: 'Week', value: 'week' },
	{ label: 'Month', value: 'month' },
	{ label: 'FY', value: 'fy' },
];

type CashTransactionRow = (typeof MOCK_CASH_TRANSACTIONS)[number];

function filterByDate(
	transactions: readonly CashTransactionRow[],
	filter: DateFilter,
): CashTransactionRow[] {
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

	const filtered = filterByDate(
		MOCK_CASH_TRANSACTIONS as Parameters<typeof filterByDate>[0],
		activeFilter,
	);

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
							<ThemedText variant="caption" color={GLASS_WHITE_TEXT}>
								Cash in Hand
							</ThemedText>
							<ThemedText
								variant="h1"
								color={c.onPrimary}
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
									style={{ marginBottom: SPACING_PX.md }}
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
											style={{
												paddingHorizontal: SPACING_PX.md,
												color: c.onSurface,
											}}
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
										style={{ marginLeft: SPACING_PX.md }}
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
					<Card padding="lg" style={{ alignItems: 'center', marginTop: SPACING_PX.md }}>
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
									marginTop: SPACING_PX.sm,
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
		padding: SPACING_PX.lg,
		paddingBottom: SPACING_PX.xl + SPACING_PX.lg,
	},
	balanceCard: {
		alignItems: 'center',
		padding: SPACING_PX.xl,
		marginBottom: SPACING_PX.lg,
	},
	balanceAmount: {
		marginTop: SPACING_PX.xs,
		fontSize: SIZE_VALUE_XXL,
		fontWeight: '700',
	},
	openingBalanceCard: {
		marginBottom: SPACING_PX.lg,
	},
	balanceInputRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	inputWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: BORDER_WIDTH_BASE,
		height: TOUCH_TARGET_MIN_PX,
	},
	balanceInput: {
		flex: 1,
		fontSize: FONT_SIZE.body,
		paddingRight: SPACING_PX.md,
	},
	filterRow: {
		flexDirection: 'row',
		gap: SPACING_PX.sm,
		marginBottom: SPACING_PX.lg,
	},
	filterChip: {
		paddingHorizontal: SPACING_PX.lg,
		paddingVertical: SPACING_PX.sm,
	},
	sectionLabel: {
		marginBottom: SPACING_PX.sm,
		letterSpacing: LETTER_SPACING_SECTION,
		fontWeight: '600',
	},
	txRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: SPACING_PX.sm + SPACING_PX.xxs,
		borderLeftWidth: BORDER_WIDTH_ACCENT,
	},
	txLeft: {
		flex: 1,
		marginRight: SPACING_PX.md,
	},
	footer: {
		padding: SPACING_PX.md,
		alignItems: 'center',
		marginBottom: SPACING_PX.lg,
	},
});
