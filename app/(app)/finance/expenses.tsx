import React, { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { View, StyleSheet, RefreshControl, Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { FilterBar } from '@/src/components/molecules/FilterBar';
import { FlashList } from '@shopify/flash-list';
import { useFinanceStore } from '@/src/stores/financeStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Card } from '@/src/components/atoms/Card';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { EmptyState } from '@/src/components/molecules/EmptyState';
import type { Expense } from '@/src/types/finance';
import { layout } from '@/src/theme/layout';

const CATEGORIES = [
	{ label: 'All', value: 'all' },
	{ label: 'Rent', value: 'rent' },
	{ label: 'Transport', value: 'transport' },
	{ label: 'Labour', value: 'labour' },
	{ label: 'Utilities', value: 'utilities' },
	{ label: 'Other', value: 'other' },
];

function getMonthTotal(expenses: Expense[]): number {
	const now = new Date();
	const currentMonth = now.getMonth();
	const currentYear = now.getFullYear();
	return expenses.reduce((sum, exp) => {
		const d = new Date(exp.expense_date);
		if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
			return sum + exp.amount;
		}
		return sum;
	}, 0);
}

export default function ExpensesScreen() {
	const { theme, c } = useThemeTokens();
	const insets = useSafeAreaInsets();
	const { t, formatCurrency, formatDate } = useLocale();
	const router = useRouter();
	const { expenses, loading, fetchExpenses } = useFinanceStore(
		useShallow((s) => ({
			expenses: s.expenses,
			loading: s.loading,
			fetchExpenses: s.fetchExpenses,
		})),
	);
	const [refreshing, setRefreshing] = useState(false);
	const [activeCategory, setActiveCategory] = useState('all');

	useEffect(() => {
		fetchExpenses().catch((e: unknown) => {
			Alert.alert(
				t('common.errorTitle'),
				e instanceof Error ? e.message : t('common.unexpectedError'),
				[{ text: t('common.ok') }],
			);
		});
	}, [fetchExpenses, t]);

	const monthTotal = getMonthTotal(expenses);

	const filteredExpenses =
		activeCategory === 'all'
			? expenses
			: expenses.filter((exp) => exp.category === activeCategory);

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title={t('finance.expenses')} />

			{/* Summary card */}
			<View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
				<ThemedText variant="caption" color={theme.colors.onSurfaceVariant}>
					Total this month
				</ThemedText>
				<ThemedText variant="h2" color={theme.colors.error}>
					{formatCurrency(monthTotal)}
				</ThemedText>
			</View>

			{/* Category filter chips */}
			<FilterBar
				filters={CATEGORIES}
				activeValue={activeCategory}
				onSelect={setActiveCategory}
				defaultValue="all"
				onClear={() => setActiveCategory('all')}
			/>

			<FlashList
				data={filteredExpenses}
				estimatedItemSize={80}
				keyExtractor={(item: Expense) => item.id}
				contentContainerStyle={styles.scrollContent}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={async () => {
							setRefreshing(true);
							try {
								await fetchExpenses();
							} finally {
								setRefreshing(false);
							}
						}}
					/>
				}
				ListEmptyComponent={
					!loading ? (
						<EmptyState
							title={t('finance.noExpenses')}
							actionLabel={t('finance.addExpense')}
							onAction={() => router.push('/(app)/finance/expenses/add')}
						/>
					) : null
				}
				renderItem={({ item: exp }: { item: Expense }) => (
					<Card style={styles.expenseCard} padding="md">
						<View style={layout.rowBetween}>
							<View style={{ flex: 1 }}>
								<ThemedText variant="caption" color={theme.colors.onSurfaceVariant}>
									{formatDate(exp.expense_date)}
								</ThemedText>
								<ThemedText weight="bold">
									{t(`finance.expenseCategories.${exp.category}`)}
								</ThemedText>
								{exp.notes ? (
									<ThemedText
										variant="caption"
										color={theme.colors.onSurfaceVariant}
									>
										{exp.notes}
									</ThemedText>
								) : null}
							</View>
							<View style={{ alignItems: 'flex-end' }}>
								<ThemedText weight="bold" color={theme.colors.error}>
									{formatCurrency(exp.amount)}
								</ThemedText>
							</View>
						</View>
					</Card>
				)}
			/>

			{/* FAB */}
			<Pressable
				style={[
					styles.fab,
					{
						backgroundColor: c.primary,
						bottom: 32 + insets.bottom,
					},
				]}
				onPress={() => router.push('/(app)/finance/expenses/add')}
				testID="fab-add-expense"
				accessibilityRole="button"
				accessibilityLabel={t('finance.addExpense')}
			>
				<Plus color="white" size={28} />
			</Pressable>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	summaryCard: {
		marginHorizontal: 16,
		marginTop: 12,
		marginBottom: 4,
		padding: 16,
		borderRadius: 12,
		alignItems: 'center',
	},
	scrollContent: { padding: 16, paddingBottom: 100 },
	expenseCard: { marginBottom: 12 },
	fab: {
		position: 'absolute',
		right: 24,
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
});
