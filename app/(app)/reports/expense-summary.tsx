import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Pressable, ScrollView, Alert } from 'react-native';
import { Download } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/design-system/components/atoms/Screen';
import { ScreenHeader } from '@/app/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { Card } from '@/src/design-system/components/atoms/Card';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { SIZE_CHIP_HEIGHT } from '@/theme/uiMetrics';

const CHART_PLACEHOLDER_HEIGHT = SPACING_PX['4xl'] + SPACING_PX['4xl'] + SPACING_PX['2xl'];
/** Section label caps letter-spacing (narrower than LETTER_SPACING_SECTION) */
const LETTER_SPACING_CAPS_LABEL = 0.6;

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
export default function ExpenseSummaryScreen() {
	const { c, r, theme } = useThemeTokens();
	const { formatCurrency } = useLocale();

	const [period, setPeriod] = useState<Period>('month');

	// TODO: re-fetch / re-filter data when period changes
	const categories: ExpenseCategory[] = theme.collections.expenseReportDemoSlices.map((x) => ({
		id: x.id,
		name: x.name,
		amount: x.amount,
		color: x.color,
	}));

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
			<View style={{ flex: 1, gap: SPACING_PX.sm - SPACING_PX.xxs }}>
				<View style={styles.catRowTop}>
					<ThemedText weight="bold" style={{ flex: 1 }}>
						{item.name}
					</ThemedText>
					<ThemedText weight="bold">{formatCurrency(item.amount)}</ThemedText>
					<ThemedText
						variant="caption"
						color={c.onSurfaceVariant}
						style={{ width: SIZE_CHIP_HEIGHT, textAlign: 'right' }}
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
				showBackButton
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
						<Card
							padding="md"
							style={{ marginBottom: SPACING_PX.lg, alignItems: 'center' }}
						>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Total Expenses
							</ThemedText>
							<ThemedText
								variant="h1"
								weight="bold"
								color={c.error}
								style={{ marginTop: SPACING_PX.xs, marginBottom: SPACING_PX.xxs }}
							>
								{formatCurrency(totalExpenses)}
							</ThemedText>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{categories.length} categories · {period.toUpperCase()}
							</ThemedText>
						</Card>

						{/* Pie chart placeholder */}
						<Card
							padding="none"
							style={{ marginBottom: SPACING_PX.lg, overflow: 'hidden' }}
						>
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
								marginBottom: SPACING_PX.sm,
								textTransform: 'uppercase',
								letterSpacing: LETTER_SPACING_CAPS_LABEL,
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
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm,
		gap: SPACING_PX.sm,
	},
	chip: {
		paddingHorizontal: SPACING_PX.md + SPACING_PX.xxs,
		paddingVertical: SPACING_PX.sm,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	exportBtn: {
		padding: SPACING_PX.sm - SPACING_PX.xxs,
	},
	listContent: {
		padding: SPACING_PX.lg,
		paddingBottom: SPACING_PX['2xl'],
	},
	chartPlaceholder: {
		height: CHART_PLACEHOLDER_HEIGHT,
		alignItems: 'center',
		justifyContent: 'center',
	},
	catRow: {
		flexDirection: 'row',
		paddingVertical: SPACING_PX.md,
		alignItems: 'center',
		gap: SPACING_PX.sm + SPACING_PX.xxs,
	},
	colorDot: {
		width: SPACING_PX.md,
		height: SPACING_PX.md,
		borderRadius: SPACING_PX.sm - SPACING_PX.xxs,
		marginTop: SPACING_PX.xxs,
		alignSelf: 'flex-start',
	},
	catRowTop: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: SPACING_PX.sm,
	},
	barTrack: {
		height: SPACING_PX.sm - SPACING_PX.xxs,
		borderRadius: SPACING_PX.xs,
		overflow: 'hidden',
	},
	barFill: {
		height: SPACING_PX.sm - SPACING_PX.xxs,
	},
	emptyState: {
		paddingVertical: SPACING_PX['2xl'],
	},
});
