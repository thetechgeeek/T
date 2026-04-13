import { SIZE_ICON_CONTAINER } from '@/theme/uiMetrics';

const ICON_WRAP_SIZE = SIZE_ICON_CONTAINER + 4;
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, RefreshControl, Pressable, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import {
	Plus,
	Landmark,
	Briefcase,
	Home,
	TrendingUp,
	DollarSign,
	MoreHorizontal,
} from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { FilterBar } from '@/src/components/molecules/FilterBar';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Card } from '@/src/components/atoms/Card';
import { EmptyState } from '@/src/components/molecules/EmptyState';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { layout } from '@/src/theme/layout';
import { withOpacity } from '@/src/utils/color';
import { FAB_OFFSET_RIGHT, OPACITY_TINT_LIGHT, RADIUS_FAB, SIZE_FAB } from '@/theme/uiMetrics';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IncomeEntry {
	id: string;
	income_date: string;
	category: string;
	description?: string;
	received_from?: string;
	amount: number;
	payment_mode: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_FILTERS = [
	{ label: 'All', value: 'all' },
	{ label: 'Interest', value: 'interest' },
	{ label: 'Commission', value: 'commission' },
	{ label: 'Rent', value: 'rent_received' },
	{ label: 'Dividend', value: 'dividend' },
	{ label: 'Other', value: 'miscellaneous' },
];
const LIST_BOTTOM_PADDING = 100;

function getCategoryIcon(category: string, color: string) {
	const size = 18;
	switch (category) {
		case 'interest':
			return <Landmark size={size} color={color} />;
		case 'commission':
			return <Briefcase size={size} color={color} />;
		case 'rent_received':
			return <Home size={size} color={color} />;
		case 'dividend':
			return <TrendingUp size={size} color={color} />;
		case 'sale_of_assets':
			return <DollarSign size={size} color={color} />;
		default:
			return <MoreHorizontal size={size} color={color} />;
	}
}

function getCategoryLabel(category: string): string {
	const map: Record<string, string> = {
		interest: 'Interest',
		commission: 'Commission',
		rent_received: 'Rent Received',
		dividend: 'Dividend',
		sale_of_assets: 'Sale of Assets',
		miscellaneous: 'Miscellaneous',
	};
	return map[category] ?? category;
}

function getMonthTotal(entries: IncomeEntry[]): number {
	const now = new Date();
	const m = now.getMonth();
	const y = now.getFullYear();
	return entries.reduce((sum, e) => {
		const d = new Date(e.income_date);
		return d.getMonth() === m && d.getFullYear() === y ? sum + e.amount : sum;
	}, 0);
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function OtherIncomeScreen() {
	const { theme, c, s, r } = useThemeTokens();
	const insets = useSafeAreaInsets();
	const { formatCurrency, formatDate } = useLocale();
	const router = useRouter();

	// Local state — replace with store/supabase if available
	const [entries] = useState<IncomeEntry[]>([]);
	const [loading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [activeCategory, setActiveCategory] = useState('all');

	// Expose setter so the add screen can push new entries back (via global store later)
	// For now entries come from local state only.

	useEffect(() => {
		// TODO: replace with financeStore.fetchOtherIncome() once added
	}, []);

	const monthTotal = getMonthTotal(entries);

	const filtered =
		activeCategory === 'all' ? entries : entries.filter((e) => e.category === activeCategory);

	async function onRefresh() {
		setRefreshing(true);
		// TODO: fetch from store
		setRefreshing(false);
	}

	// ── Render item ────────────────────────────────────────────────────────

	function renderItem({ item }: { item: IncomeEntry }) {
		return (
			<Card style={styles.card} padding="md">
				<View style={layout.rowBetween}>
					<View style={[layout.row, { alignItems: 'center', flex: 1 }]}>
						<View
							style={[
								styles.iconWrap,
								{
									backgroundColor: withOpacity(c.success, OPACITY_TINT_LIGHT),
									borderRadius: r.full,
								},
							]}
						>
							{getCategoryIcon(item.category, c.success)}
						</View>
						<View style={{ marginLeft: s.sm, flex: 1 }}>
							<ThemedText variant="body" weight="bold" numberOfLines={1}>
								{getCategoryLabel(item.category)}
							</ThemedText>
							{item.received_from ? (
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									numberOfLines={1}
								>
									From: {item.received_from}
								</ThemedText>
							) : null}
							{item.description ? (
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									numberOfLines={1}
								>
									{item.description}
								</ThemedText>
							) : null}
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{formatDate(item.income_date)}
							</ThemedText>
						</View>
					</View>
					<ThemedText variant="bodyBold" color={c.success}>
						+{formatCurrency(item.amount)}
					</ThemedText>
				</View>
			</Card>
		);
	}

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title="Other Income" showBackButton />

			{/* Summary card */}
			<View
				style={[
					styles.summaryCard,
					{
						backgroundColor: withOpacity(c.success, OPACITY_TINT_LIGHT),
						borderRadius: r.md,
					},
				]}
			>
				<ThemedText variant="caption" color={c.onSurfaceVariant}>
					Total received this month
				</ThemedText>
				<ThemedText variant="h2" color={c.success}>
					{formatCurrency(monthTotal)}
				</ThemedText>
			</View>

			{/* Category filter */}
			<FilterBar
				filters={CATEGORY_FILTERS}
				activeValue={activeCategory}
				onSelect={setActiveCategory}
				defaultValue="all"
				onClear={() => setActiveCategory('all')}
			/>

			<FlatList
				data={filtered}
				keyExtractor={(item) => item.id}
				renderItem={renderItem}
				contentContainerStyle={[
					styles.listContent,
					{ paddingBottom: LIST_BOTTOM_PADDING + insets.bottom },
				]}
				ItemSeparatorComponent={() => <View style={{ height: s.sm }} />}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor={c.success}
					/>
				}
				ListEmptyComponent={
					!loading ? (
						<EmptyState
							title="No income entries yet"
							actionLabel="+ Add Income"
							onAction={() => router.push('/(app)/finance/other-income/add' as Href)}
						/>
					) : null
				}
			/>

			{/* FAB */}
			<Pressable
				style={[
					styles.fab,
					{
						backgroundColor: c.success,
						bottom: SIZE_FAB - SPACING_PX.xl + insets.bottom,
						...(theme.shadows.lg as object),
					},
				]}
				onPress={() => router.push('/(app)/finance/other-income/add' as Href)}
				accessibilityRole="button"
				accessibilityLabel="add-other-income"
			>
				<Plus color={c.onPrimary} size={28} />
			</Pressable>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	summaryCard: {
		marginHorizontal: SPACING_PX.lg,
		marginTop: SPACING_PX.md,
		marginBottom: SPACING_PX.xs,
		padding: SPACING_PX.lg,
		alignItems: 'center',
	},
	listContent: {
		padding: SPACING_PX.lg,
	},
	card: {},
	iconWrap: {
		width: ICON_WRAP_SIZE,
		height: ICON_WRAP_SIZE,
		alignItems: 'center',
		justifyContent: 'center',
	},
	fab: {
		position: 'absolute',
		right: FAB_OFFSET_RIGHT + SPACING_PX.xs,
		width: SIZE_FAB,
		height: SIZE_FAB,
		borderRadius: RADIUS_FAB,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
