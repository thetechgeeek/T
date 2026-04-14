import {
	FAB_OFFSET_BOTTOM,
	FAB_OFFSET_RIGHT,
	GLASS_WHITE_STRONG,
	OVERLAY_COLOR_MEDIUM,
	RADIUS_FAB,
	SIZE_BUTTON_HEIGHT_SM,
	SIZE_FAB,
	SIZE_MENU_SHEET_WIDTH,
	Z_INDEX,
} from '@/theme/uiMetrics';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
	View,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	RefreshControl,
	Alert,
	ActivityIndicator,
	Modal,
	Pressable,
	ScrollView,
} from 'react-native';
import { useRouter as useExpoRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import {
	Plus,
	Package,
	Search,
	SlidersHorizontal,
	MoreVertical,
	FileDown,
	FileUp,
} from 'lucide-react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { TileSetCard } from '@/src/components/organisms/TileSetCard';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { InventoryListSkeleton } from '@/src/components/molecules/skeletons/InventoryListSkeleton';
import { SkeletonBlock } from '@/src/components/molecules/SkeletonBlock';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { TextInput } from '@/src/components/atoms/TextInput';
import { Chip } from '@/src/components/atoms/Chip';
import { inventoryService } from '@/src/services/inventoryService';
import type { TileSetGroup, TileCategory, InventoryFilters } from '@/src/types/inventory';
import { layout } from '@/src/theme/layout';
import { SPACING_PX, TOUCH_TARGET_MIN_PX } from '@/src/theme/layoutMetrics';

interface SortOption {
	label: string;
	sortBy: string;
	sortDir: 'asc' | 'desc';
}

const SORT_OPTIONS: SortOption[] = [
	{ label: 'A–Z', sortBy: 'design_name', sortDir: 'asc' },
	{ label: 'Z–A', sortBy: 'design_name', sortDir: 'desc' },
	{ label: 'Stock: Low→High', sortBy: 'box_count', sortDir: 'asc' },
	{ label: 'Stock: High→Low', sortBy: 'box_count', sortDir: 'desc' },
	{ label: 'Recently Added', sortBy: 'created_at', sortDir: 'desc' },
];

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

const FiltersIcon = SlidersHorizontal;

export default function InventoryTab() {
	const { theme, c, s, r } = useThemeTokens();
	const { t, formatCurrency } = useLocale();
	const router = useExpoRouter();
	const listBottomPadding = FAB_OFFSET_BOTTOM + SIZE_FAB + s.xl;
	const sortSheetHeaderPadding = s.lg + s.xs;

	const { items, loading, hasMore, filters, fetchItems, setFilters } = useInventoryStore(
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
	const [sortSheetOpen, setSortSheetOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [exporting, setExporting] = useState(false);
	const initialized = useRef(false);

	const totalValue = useMemo(
		() => items.reduce((acc, item) => acc + (item.box_count || 0) * (item.cost_price || 0), 0),
		[items],
	);

	useEffect(() => {
		// Only auto-fetch on first mount; after that, setFilters drives fetches
		if (!initialized.current) {
			initialized.current = true;
			Promise.resolve(fetchItems(true)).catch((_e) => {
				Alert.alert(t('common.errorTitle'), t('inventory.loadError'), [
					{ text: t('common.ok') },
				]);
			});
		}
	}, [fetchItems, t]);

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

	const handleExport = async () => {
		try {
			setMenuOpen(false);
			setExporting(true);
			const data = await inventoryService.exportToExcel();

			const ws = XLSX.utils.json_to_sheet(data);
			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
			const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

			const base = FileSystem.documentDirectory;
			if (!base) {
				Alert.alert(t('common.errorTitle'), 'Storage unavailable');
				return;
			}
			const uri = base + `Inventory_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
			await FileSystem.writeAsStringAsync(uri, wbout, {
				encoding: FileSystem.EncodingType.Base64,
			});
			await Sharing.shareAsync(uri);
		} catch {
			Alert.alert(t('common.errorTitle'), 'Export failed');
		} finally {
			setExporting(false);
		}
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
				<View style={[styles.centerFlex, { marginTop: listBottomPadding }]}>
					<ActivityIndicator size="large" color={c.primary} />
					<InventoryListSkeleton />
				</View>
			);
		}
		return (
			<View style={[styles.centerFlex, { marginTop: listBottomPadding }]}>
				<Package size={64} color={c.placeholder} strokeWidth={1} />
				<ThemedText variant="h3" style={{ marginTop: s.md }}>
					{t('inventory.noItems')}
				</ThemedText>
				<ThemedText
					variant="body"
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
		<AtomicScreen safeAreaEdges={['top']} withKeyboard={false}>
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
				<View style={[layout.rowBetween, { marginBottom: s.lg }]}>
					<ThemedText variant="h1" accessibilityLabel="inventory-screen">
						{t('inventory.title')}
					</ThemedText>
					<TouchableOpacity
						onPress={() => setMenuOpen(true)}
						accessibilityRole="button"
						accessibilityLabel="inventory-more-options"
					>
						<MoreVertical size={24} color={c.onSurface} />
					</TouchableOpacity>
				</View>

				{/* Search Bar */}
				<View style={[layout.row, { gap: s.md }]}>
					<View style={{ flex: 1 }}>
						<TextInput
							accessibilityLabel="inventory-search-input"
							accessibilityHint="Search by design name or item number"
							placeholder={t('inventory.placeholders.designName')}
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
						onPress={() => setSortSheetOpen(true)}
						accessibilityRole="button"
						accessibilityLabel="inventory-filter-button"
						accessibilityHint={t('inventory.filterHint')}
					>
						<FiltersIcon
							size={20}
							color={c.onSurfaceVariant}
							importantForAccessibility="no"
						/>
					</TouchableOpacity>
				</View>

				{/* Categories (Horizontal Scroll) + Low Stock */}
				<View style={styles.chipScrollWrap}>
					<FlatList
						horizontal
						showsHorizontalScrollIndicator={false}
						data={CATEGORIES}
						keyExtractor={(item) => item}
						contentContainerStyle={{ paddingVertical: s.sm }}
						renderItem={({ item }) => {
							const isActive = filters.category === item;
							const categoryLabel = t(`inventory.categories.${item.toLowerCase()}`);
							return (
								<Chip
									label={categoryLabel}
									accessibilityLabel={`category-chip-${item}`}
									selected={isActive}
									onPress={() => handleCategorySelect(item)}
									style={{ marginRight: s.sm }}
								/>
							);
						}}
						ListFooterComponent={
							<Chip
								label="Low Stock"
								accessibilityLabel="category-chip-lowstock"
								selected={!!filters.lowStockOnly}
								onPress={() => setFilters({ lowStockOnly: !filters.lowStockOnly })}
								style={{ marginRight: s.sm }}
							/>
						}
					/>
				</View>
			</View>

			{/* Exporting Loader Overlay */}
			{exporting && (
				<View
					style={[
						StyleSheet.absoluteFill,
						{
							backgroundColor: GLASS_WHITE_STRONG,
							zIndex: Z_INDEX.max,
							alignItems: 'center',
							justifyContent: 'center',
						},
					]}
				>
					<ActivityIndicator size="large" color={c.primary} />
					<ThemedText variant="body" style={{ marginTop: s.md, color: c.primary }}>
						{t('inventory.exportingItems')}
					</ThemedText>
				</View>
			)}

			{/* Summary Bar */}
			<View
				style={[
					styles.summaryBar,
					{ backgroundColor: c.surfaceVariant, borderBottomColor: c.border },
				]}
			>
				<ThemedText variant="caption" color={c.onSurfaceVariant}>
					{`${items.length} items · Stock value: ${formatCurrency(totalValue)}`}
				</ThemedText>
			</View>

			{/* More Options Modal */}
			<Modal
				visible={menuOpen}
				transparent
				animationType="fade"
				onRequestClose={() => setMenuOpen(false)}
			>
				<Pressable
					style={[styles.sortBackdrop, { backgroundColor: OVERLAY_COLOR_MEDIUM }]}
					onPress={() => setMenuOpen(false)}
				/>
				<View
					style={[
						styles.menuSheet,
						{
							backgroundColor: c.surface,
							borderRadius: r.lg,
							margin: s.lg,
							...(theme.shadows.lg as object),
						},
					]}
				>
					<Pressable
						onPress={() => {
							setMenuOpen(false);
							router.push('/(app)/inventory/import');
						}}
						style={styles.menuRow}
					>
						<FileUp size={20} color={c.onSurface} style={{ marginRight: s.md }} />
						<ThemedText variant="body">{t('inventory.importItems')}</ThemedText>
					</Pressable>
					<Pressable onPress={handleExport} style={styles.menuRow}>
						<FileDown size={20} color={c.onSurface} style={{ marginRight: s.md }} />
						<ThemedText variant="body">{t('inventory.exportItems')}</ThemedText>
					</Pressable>
				</View>
			</Modal>

			{/* Sort Bottom Sheet */}
			<Modal
				visible={sortSheetOpen}
				transparent
				animationType="slide"
				onRequestClose={() => setSortSheetOpen(false)}
			>
				<Pressable
					style={[styles.sortBackdrop, { backgroundColor: OVERLAY_COLOR_MEDIUM }]}
					onPress={() => setSortSheetOpen(false)}
				/>
				<View
					style={[
						styles.sortSheet,
						{
							backgroundColor: c.surface,
							borderTopLeftRadius: r.xl,
							borderTopRightRadius: r.xl,
						},
					]}
				>
					<ThemedText
						variant="h3"
						style={{
							paddingHorizontal: sortSheetHeaderPadding,
							paddingTop: sortSheetHeaderPadding,
							paddingBottom: s.md,
						}}
					>
						Sort By
					</ThemedText>
					<ScrollView keyboardShouldPersistTaps="handled">
						{SORT_OPTIONS.map((opt) => {
							const isActive =
								filters.sortBy === opt.sortBy && filters.sortDir === opt.sortDir;
							return (
								<Pressable
									key={opt.label}
									onPress={() => {
										setFilters({
											sortBy: opt.sortBy as InventoryFilters['sortBy'],
											sortDir: opt.sortDir,
										});
										setSortSheetOpen(false);
									}}
									style={[
										styles.sortOption,
										{ borderBottomColor: c.border },
										isActive
											? { backgroundColor: c.surfaceVariant }
											: undefined,
									]}
								>
									<ThemedText
										variant="body"
										color={isActive ? c.primary : c.onSurface}
										style={isActive ? { fontWeight: '600' } : undefined}
									>
										{opt.label}
									</ThemedText>
									{isActive ? (
										<ThemedText variant="h3" color={c.primary}>
											✓
										</ThemedText>
									) : null}
								</Pressable>
							);
						})}
					</ScrollView>
				</View>
			</Modal>

			{/* List */}
			<FlatList
				data={groupedSets}
				keyExtractor={(item) => item.baseItemNumber}
				contentContainerStyle={{ padding: s.md, paddingBottom: listBottomPadding }}
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
						<View style={{ padding: s.md, gap: s.sm }}>
							<SkeletonBlock height={80} borderRadius={r.lg} />
						</View>
					) : null
				}
			/>

			{/* FAB */}
			<TouchableOpacity
				style={[styles.fab, { backgroundColor: c.primary, ...theme.shadows.lg }]}
				onPress={() => router.push('/(app)/inventory/add')}
				activeOpacity={0.85}
				accessibilityRole="button"
				accessibilityLabel="add-inventory-button"
				accessibilityHint="Add a new inventory item"
			>
				<Plus
					size={28}
					color={c.onPrimary}
					strokeWidth={2.5}
					importantForAccessibility="no"
				/>
			</TouchableOpacity>
		</AtomicScreen>
	);
}

// Map the icon since SlidersHorizontal isn't standard in older lucide but we imported it, if it fails we can fallback.

const styles = StyleSheet.create({
	filterBtn: {
		width: SIZE_BUTTON_HEIGHT_SM,
		height: SIZE_BUTTON_HEIGHT_SM,
		alignItems: 'center',
		justifyContent: 'center',
	},
	chipScrollWrap: { marginTop: SPACING_PX.sm },
	centerFlex: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: SPACING_PX['2xl'],
	},
	fab: {
		position: 'absolute',
		right: FAB_OFFSET_RIGHT,
		bottom: FAB_OFFSET_BOTTOM,
		width: SIZE_FAB,
		height: SIZE_FAB,
		borderRadius: RADIUS_FAB,
		alignItems: 'center',
		justifyContent: 'center',
	},
	summaryBar: {
		paddingHorizontal: SPACING_PX.lg,
		paddingVertical: SPACING_PX.xs + SPACING_PX.xxs,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	sortBackdrop: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	sortSheet: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		maxHeight: '60%',
		paddingBottom: SPACING_PX.xl,
	},
	menuSheet: {
		position: 'absolute',
		top: SIZE_FAB,
		right: 0,
		width: SIZE_MENU_SHEET_WIDTH,
	},
	menuRow: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: SPACING_PX.lg,
	},
	sortOption: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: SPACING_PX.lg + SPACING_PX.xs,
		paddingVertical: SPACING_PX.md + SPACING_PX.xxs,
		borderBottomWidth: StyleSheet.hairlineWidth,
		minHeight: TOUCH_TARGET_MIN_PX,
	},
});
