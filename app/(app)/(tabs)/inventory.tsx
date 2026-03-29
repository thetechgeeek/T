import React, { useEffect, useState, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
	View,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	RefreshControl,
	ActivityIndicator,
	Alert,
} from 'react-native';
import { useRouter as useExpoRouter } from 'expo-router';
import {
	Plus,
	Package,
	Search,
	SlidersHorizontal,
	Grid as GridIcon,
	List as ListIcon,
} from 'lucide-react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { TileSetCard } from '@/src/components/organisms/TileSetCard';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Screen } from '@/src/components/atoms/Screen';
import { TextInput } from '@/src/components/atoms/TextInput';
import { Chip } from '@/src/components/atoms/Chip';
import type { TileSetGroup, TileCategory } from '@/src/types/inventory';
import { layout } from '@/src/theme/layout';

const CATEGORIES: ('ALL' | TileCategory)[] = [
	'ALL',
	'GLOSSY',
	'MATT',
	'ELEVATION',
	'FLOOR',
	'WOODEN',
	'SATIN',
	'OTHER',
];

export default function InventoryTab() {
	const { theme, c, s, r } = useThemeTokens();
	const { t } = useLocale();
	const router = useExpoRouter();

	const { items, loading, hasMore, filters, page, fetchItems, setFilters } = useInventoryStore(
		useShallow((s) => ({
			items: s.items,
			loading: s.loading,
			hasMore: s.hasMore,
			filters: s.filters,
			page: s.page,
			fetchItems: s.fetchItems,
			setFilters: s.setFilters,
		})),
	);
	const [refreshing, setRefreshing] = useState(false);
	const [searchInput, setSearchInput] = useState(filters.search || '');

	useEffect(() => {
		// Initial fetch if empty and not loading
		if (items.length === 0 && !loading && page === 1) {
			fetchItems(true).catch((e) => {
				Alert.alert(t('common.errorTitle'), t('inventory.loadError'), [
					{ text: t('common.ok') },
				]);
			});
		}
	}, []);

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchItems(true);
		setRefreshing(false);
	};

	const handleSearchSubmit = () => {
		setFilters({ search: searchInput });
	};

	const handleCategorySelect = (cat: 'ALL' | TileCategory) => {
		setFilters({ category: cat });
	};

	const groupedSets = useMemo(() => {
		const map: Record<string, TileSetGroup> = {};
		items.forEach((item) => {
			const g = item.base_item_number || 'UNKNOWN';
			if (!map[g]) map[g] = { baseItemNumber: g, items: [] };
			map[g].items.push(item);
		});
		return Object.values(map);
	}, [items]);

	const renderEmpty = () => {
		if (loading && items.length === 0) {
			return (
				<View style={styles.centerFlex}>
					<ActivityIndicator size="large" color={c.primary} />
				</View>
			);
		}
		return (
			<View style={styles.centerFlex}>
				<Package size={64} color={c.placeholder} strokeWidth={1} />
				<ThemedText variant="h3" style={{ marginTop: s.md }}>
					{t('inventory.noItems')}
				</ThemedText>
				<ThemedText
					variant="body2"
					color={c.onSurfaceVariant}
					style={{ marginTop: s.sm, textAlign: 'center' }}
				>
					{filters.search || filters.category !== 'ALL'
						? t('inventory.emptyFilterHint')
						: t('inventory.addFirstItem')}
				</ThemedText>
			</View>
		);
	};

	return (
		<Screen safeAreaEdges={['top']} withKeyboard={false}>
			{/* Header */}
			<View
				style={[
					{
						borderBottomColor: c.border,
						borderBottomWidth: StyleSheet.hairlineWidth,
						paddingHorizontal: s.lg,
						paddingBottom: s.md,
					},
				]}
			>
				<View style={[layout.rowBetween, { marginBottom: 16 }]}>
					<ThemedText variant="h1">{t('inventory.title')}</ThemedText>
				</View>

				{/* Search Bar */}
				<View style={[layout.row, { gap: 12 }]}>
					<View style={{ flex: 1 }}>
						<TextInput
							placeholder="Search design or item number..."
							value={searchInput}
							onChangeText={setSearchInput}
							leftIcon={<Search size={18} color={c.placeholder} />}
							containerStyle={{ marginBottom: 0 }}
							returnKeyType="search"
							onSubmitEditing={handleSearchSubmit}
						/>
					</View>
					<TouchableOpacity
						style={[
							styles.filterBtn,
							{ backgroundColor: c.surfaceVariant, borderRadius: r.md },
						]}
					>
						<FiltersIcon size={20} color={c.onSurfaceVariant} />
					</TouchableOpacity>
				</View>

				{/* Categories (Horizontal Scroll) */}
				<View style={styles.chipScrollWrap}>
					<FlatList
						horizontal
						showsHorizontalScrollIndicator={false}
						data={CATEGORIES}
						keyExtractor={(item) => item}
						contentContainerStyle={{ paddingVertical: s.sm }}
						renderItem={({ item }) => {
							const isActive = filters.category === item;
							return (
								<Chip
									label={item}
									selected={isActive}
									onPress={() => handleCategorySelect(item)}
									style={{ marginRight: s.sm }}
								/>
							);
						}}
					/>
				</View>
			</View>

			{/* List */}
			<FlatList
				data={groupedSets}
				keyExtractor={(item) => item.baseItemNumber}
				contentContainerStyle={{ padding: s.md, paddingBottom: 100 }}
				renderItem={({ item }) => (
					<TileSetCard
						group={item}
						onPressItem={(invItem) => router.push(`/(app)/inventory/${invItem.id}`)}
						style={{ marginBottom: s.md }}
					/>
				)}
				ListEmptyComponent={renderEmpty}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						colors={[c.primary]}
						tintColor={c.primary}
					/>
				}
				onEndReached={() => {
					if (hasMore && !loading) {
						fetchItems();
					}
				}}
				onEndReachedThreshold={0.5}
				ListFooterComponent={
					loading && items.length > 0 ? (
						<ActivityIndicator style={{ padding: s.md }} color={c.primary} />
					) : null
				}
			/>

			{/* FAB */}
			<TouchableOpacity
				style={[
					styles.fab,
					{ backgroundColor: c.primary, ...(theme.shadows.lg as object) },
				]}
				onPress={() => router.push('/(app)/inventory/add')}
				activeOpacity={0.85}
			>
				<Plus size={28} color={c.onPrimary} strokeWidth={2.5} />
			</TouchableOpacity>
		</Screen>
	);
}

// Map the icon since SlidersHorizontal isn't standard in older lucide but we imported it, if it fails we can fallback.
const FiltersIcon = SlidersHorizontal;

const styles = StyleSheet.create({
	filterBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
	chipScrollWrap: { marginTop: 8, marginHorizontal: -20, paddingHorizontal: 20 },
	centerFlex: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 32,
		marginTop: 100,
	},
	fab: {
		position: 'absolute',
		right: 20,
		bottom: 20,
		width: 60,
		height: 60,
		borderRadius: 30,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
