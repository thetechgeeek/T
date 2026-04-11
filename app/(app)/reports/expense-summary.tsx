import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Pressable, ScrollView, Alert } from 'react-native';
import { Download } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Card } from '@/src/components/atoms/Card';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';

// TODO: Replace with real data — SELECT category, SUM(amount) FROM expenses WHERE date BETWEEN ? AND ? GROUP BY category
type Period = 'month' | 'quarter' | 'year' | 'fy';

const PERIOD_CHIPS: { label: string; value: Period }[] = [
	{ label: 'Month', value: 'month' },
	{ label: 'Quarter', value: 'quarter' },
	{ label: 'Year', value: 'year' },
	{ label: 'FY', value: 'fy' },
];

interface ExpenseCategory {
	id: string;
	name: string;
	amount: number;
	color: string;
}

// TODO: Pull from expense_categories + expenses tables; amounts are period-filtered mock values
const MOCK_CATEGORIES: ExpenseCategory[] = [
	{ id: '1', name: 'Purchase', amount: 820000, color: '#4A90E2' },
	{ id: '2', name: 'Salaries', amount: 185000, color: '#E67E22' },
	{ id: '3', name: 'Transport', amount: 42000, color: '#2ECC71' },
	{ id: '4', name: 'Utilities', amount: 18500, color: '#9B59B6' },
	{ id: '5', name: 'Misc', amount: 11200, color: '#E74C3C' },
];

export default function ExpenseSummaryScreen() {
	const { c, s, r, theme } = useThemeTokens();
	const { formatCurrency } = useLocale();

	const [period, setPeriod] = useState<Period>('month');

	// TODO: re-fetch / re-filter data when period changes
	const categories = MOCK_CATEGORIES;

	const totalExpenses = useMemo(
		() => categories.reduce((sum, cat) => sum + cat.amount, 0),
		[categories],
	);

	const categoriesWithPct = useMemo(
		() =>
			categories.map((cat) => ({
				...cat,
				pct: totalExpenses > 0 ? Math.round((cat.amount / totalExpenses) * 100) : 0,
			})),
		[categories, totalExpenses],
	);

	const chipStyle = (active: boolean) => [
		styles.chip,
		{
			backgroundColor: active ? c.primary : c.surface,
			borderColor: c.primary,
			borderRadius: r.full,
		},
	];

	const renderItem = ({ item }: { item: (typeof categoriesWithPct)[number] }) => (
		<View
			style={[
				styles.catRow,
				{ borderBottomColor: c.border, borderBottomWidth: StyleSheet.hairlineWidth },
			]}
		>
			<View style={[styles.colorDot, { backgroundColor: item.color }]} />
			<View style={{ flex: 1, gap: 6 }}>
				<View style={styles.catRowTop}>
					<ThemedText weight="bold" style={{ flex: 1 }}>
						{item.name}
					</ThemedText>
					<ThemedText weight="bold">{formatCurrency(item.amount)}</ThemedText>
					<ThemedText
						variant="caption"
						color={c.onSurfaceVariant}
						style={{ width: 36, textAlign: 'right' }}
					>
						{item.pct}%
					</ThemedText>
				</View>
				{/* Bar indicator */}
				<View style={[styles.barTrack, { backgroundColor: c.border }]}>
					<View
						style={[
							styles.barFill,
							{
								width: `${item.pct}%` as `${number}%`,
								backgroundColor: item.color,
								borderRadius: r.full,
							},
						]}
					/>
				</View>
			</View>
		</View>
	);

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader
				title="Expense Summary"
				showBack
				rightElement={
					<Pressable
						onPress={() => Alert.alert('Export', 'Export feature coming soon.')}
						style={styles.exportBtn}
						accessibilityRole="button"
						accessibilityLabel="Export expense summary"
					>
						<Download size={20} color={c.primary} strokeWidth={2} />
					</Pressable>
				}
			/>

			{/* Period filter chips */}
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.filterRow}
			>
				{PERIOD_CHIPS.map((chip) => (
					<Pressable
						key={chip.value}
						onPress={() => setPeriod(chip.value)}
						style={chipStyle(period === chip.value)}
						accessibilityRole="button"
						accessibilityState={{ selected: period === chip.value }}
					>
						<ThemedText
							variant="caption"
							color={period === chip.value ? c.onPrimary : c.primary}
							style={{ fontWeight: period === chip.value ? '600' : '400' }}
						>
							{chip.label}
						</ThemedText>
					</Pressable>
				))}
			</ScrollView>

			<FlatList
				data={categoriesWithPct}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
				ListHeaderComponent={
					<>
						{/* Total expenses card */}
						<Card padding="md" style={{ marginBottom: 16, alignItems: 'center' }}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Total Expenses
							</ThemedText>
							<ThemedText
								variant="h1"
								weight="bold"
								color={c.error}
								style={{ marginTop: 4, marginBottom: 2 }}
							>
								{formatCurrency(totalExpenses)}
							</ThemedText>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{MOCK_CATEGORIES.length} categories · {period.toUpperCase()}
							</ThemedText>
						</Card>

						{/* Pie chart placeholder */}
						<Card padding="none" style={{ marginBottom: 16, overflow: 'hidden' }}>
							<View style={styles.chartPlaceholder}>
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									align="center"
								>
									Chart coming soon
								</ThemedText>
							</View>
						</Card>

						{/* Section heading */}
						<ThemedText
							variant="caption"
							weight="bold"
							color={c.onSurfaceVariant}
							style={{
								marginBottom: 8,
								textTransform: 'uppercase',
								letterSpacing: 0.6,
							}}
						>
							By Category
						</ThemedText>
					</>
				}
				renderItem={renderItem}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<ThemedText variant="caption" color={c.onSurfaceVariant} align="center">
							No expense data found
						</ThemedText>
					</View>
				}
			/>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	filterRow: {
		flexDirection: 'row',
		paddingHorizontal: 12,
		paddingVertical: 8,
		gap: 8,
	},
	chip: {
		paddingHorizontal: 14,
		paddingVertical: 7,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	exportBtn: {
		padding: 6,
	},
	listContent: {
		padding: 16,
		paddingBottom: 32,
	},
	chartPlaceholder: {
		height: 160,
		alignItems: 'center',
		justifyContent: 'center',
	},
	catRow: {
		flexDirection: 'row',
		paddingVertical: 12,
		alignItems: 'center',
		gap: 10,
	},
	colorDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
		marginTop: 2,
		alignSelf: 'flex-start',
	},
	catRowTop: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	barTrack: {
		height: 6,
		borderRadius: 3,
		overflow: 'hidden',
	},
	barFill: {
		height: 6,
	},
	emptyState: {
		paddingVertical: 32,
	},
});
