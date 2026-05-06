import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
	View,
	StyleSheet,
	FlatList,
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
import {
	Plus,
	Package,
	SlidersHorizontal,
	FileDown,
	FileUp,
	ArrowUpDown,
} from 'lucide-react-native';
import { useThemeTokens, withOpacity } from '@easydesign/design-system/foundation';
import { useLocale } from '@/src/hooks/useLocale';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { TileSetCard } from '@/app/components/organisms/TileSetCard';
import { ThemedText, Card, SearchBar } from '@easydesign/design-system';
import { InventoryListSkeleton } from '@/app/components/molecules/skeletons/InventoryListSkeleton';
import { SkeletonBlock } from '@easydesign/design-system';
import { Screen as AtomicScreen } from '@easydesign/design-system';
import { inventoryService } from '@/src/services/inventoryService';
import type { TileSetGroup, TileCategory, InventoryFilters } from '@/src/types/inventory';
import { layout } from '@easydesign/design-system/foundation';
import {
	SPACING_PX,
	TOUCH_TARGET_MIN_PX,
	OVERLAY_COLOR_MEDIUM,
	GLASS_WHITE_STRONG,
	SIZE_MENU_SHEET_WIDTH,
	Z_INDEX,
} from '@easydesign/design-system/foundation';
import { ScreenHeader } from '@easydesign/ui-shell';
import {
	announceListLoadMoreComplete,
	announceListRefreshComplete,
} from '@/src/accessibility/announcements';
import { rowsToCsv } from '@/src/utils/csv';

interface SortOption {
	label: string;
	sortBy: string;
	sortDir: 'asc' | 'desc';
}

const SORT_OPTIONS: SortOption[] = [
	{ label: 'A-Z', sortBy: 'design_name', sortDir: 'asc' },
	{ label: 'Z-A', sortBy: 'design_name', sortDir: 'desc' },
	{ label: 'Stock: Low to High', sortBy: 'box_count', sortDir: 'asc' },
	{ label: 'Stock: High to Low', sortBy: 'box_count', sortDir: 'desc' },
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

const FILTER_PILL_ACTIVE_OPACITY = 0.08;
const FILTER_PILL_TOUCH_MIN_WIDTH = 72;
const HEADER_ACTION_ICON_SIZE = 18;
const HEADER_ACTION_SIZE = 40;
const MENU_TOP_OFFSET = 84;
const SORT_SHEET_MAX_HEIGHT = '60%';
const SUMMARY_SEGMENTS = 3;
const INVENTORY_SCREEN_ACCESSIBILITY_LABEL = 'inventory-screen';

export default function InventoryTab() {
	const { theme, c, s, r } = useThemeTokens();
	const { t, formatCurrency } = useLocale();
	const router = useExpoRouter();
	const listBottomPadding = s['3xl'];

	const { items, loading, hasMore, filters, fetchItems, setFilters } = useInventoryStore(
		useShallow((state) => ({
			items: state.items,
			loading: state.loading,
			hasMore: state.hasMore,
			filters: state.filters,
			fetchItems: state.fetchItems,
			setFilters: state.setFilters,
		})),
	);
	const [refreshing, setRefreshing] = useState(false);
	const [searchInput, setSearchInput] = useState(filters.search || '');
	const [sortSheetOpen, setSortSheetOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [exporting, setExporting] = useState(false);
	const initialized = useRef(false);
	const searchInputRef = useRef(searchInput);

	useEffect(() => {
		searchInputRef.current = searchInput;
	}, [searchInput]);

	useEffect(() => {
		const nextSearchInput = filters.search || '';
		if (searchInputRef.current !== nextSearchInput) {
			searchInputRef.current = nextSearchInput;
			setSearchInput(nextSearchInput);
		}
	}, [filters.search]);

	useEffect(() => {
		if (!initialized.current) {
			initialized.current = true;
			Promise.resolve(fetchItems(true)).catch(() => {
				Alert.alert(t('common.errorTitle'), t('inventory.loadError'), [
					{ text: t('common.ok') },
				]);
			});
		}
	}, [fetchItems, t]);

	const groupedSets = useMemo(() => {
		const map: Record<string, TileSetGroup> = {};
		items.forEach((item) => {
			const groupKey = item.base_item_number || 'UNKNOWN';
			if (!map[groupKey]) {
				map[groupKey] = { baseItemNumber: groupKey, items: [] };
			}
			map[groupKey].items.push(item);
		});
		return Object.values(map);
	}, [items]);

	const totalValue = useMemo(
		() => items.reduce((acc, item) => acc + (item.box_count || 0) * (item.cost_price || 0), 0),
		[items],
	);
	const lowStockSetCount = useMemo(
		() =>
			groupedSets.filter((group) =>
				group.items.some((item) => item.box_count <= item.low_stock_threshold),
			).length,
		[groupedSets],
	);
	const outOfStockSetCount = useMemo(
		() =>
			groupedSets.filter((group) => group.items.every((item) => item.box_count <= 0)).length,
		[groupedSets],
	);
	const inventorySubtitle =
		groupedSets.length > 0
			? t('inventory.setsInCatalog', { count: groupedSets.length })
			: loading
				? t('common.loading')
				: t('inventory.addFirstItem');

	const handleRefresh = async () => {
		setRefreshing(true);
		try {
			await fetchItems(true);
			await announceListRefreshComplete(t('inventory.title'), groupedSets.length);
		} finally {
			setRefreshing(false);
		}
	};

	const handleLoadMore = async () => {
		if (!hasMore || loading) {
			return;
		}

		const beforeCount = useInventoryStore.getState().items.length;
		await fetchItems();
		const afterCount = useInventoryStore.getState().items.length;
		if (afterCount > beforeCount) {
			await announceListLoadMoreComplete(
				t('inventory.title'),
				afterCount - beforeCount,
				afterCount,
			);
		}
	};

	const handleCategorySelect = (category: 'ALL' | TileCategory) => {
		if (filters.lowStockOnly) {
			setFilters({ lowStockOnly: false });
		}
		setFilters({ category });
	};

	const handleLowStockToggle = () => {
		setFilters({
			category: 'ALL',
			lowStockOnly: !filters.lowStockOnly,
		});
	};

	const handleExport = async () => {
		try {
			setMenuOpen(false);
			setExporting(true);
			const data = await inventoryService.exportToCsvRows();
			const csv = rowsToCsv(data);

			const baseDirectory = FileSystem.documentDirectory;
			if (!baseDirectory) {
				Alert.alert(t('common.errorTitle'), t('inventory.storageUnavailable'));
				return;
			}

			const uri =
				baseDirectory + `Inventory_Export_${new Date().toISOString().split('T')[0]}.csv`;
			await FileSystem.writeAsStringAsync(uri, csv, {
				encoding: FileSystem.EncodingType.UTF8,
			});
			await Sharing.shareAsync(uri, {
				mimeType: 'text/csv',
				dialogTitle: t('inventory.exportCsv'),
			});
		} catch {
			Alert.alert(t('common.errorTitle'), t('inventory.exportFailed'));
		} finally {
			setExporting(false);
		}
	};

	const renderInventoryFilter = (
		label: string,
		selected: boolean,
		onPress: () => void,
		accessibilityLabel: string,
		key: string,
	) => (
		<Pressable
			key={key}
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel}
			accessibilityState={{ selected }}
			style={({ pressed }) => [
				styles.filterPill,
				{
					backgroundColor: selected ? c.onSurface : c.surface,
					borderColor: selected ? c.onSurface : c.border,
					borderRadius: r.full,
					minWidth: FILTER_PILL_TOUCH_MIN_WIDTH,
					opacity: pressed ? theme.opacity.pressed : 1,
					paddingHorizontal: s.md,
					paddingVertical: s.xs,
				},
				pressed && !selected
					? {
							backgroundColor: withOpacity(c.onSurface, FILTER_PILL_ACTIVE_OPACITY),
						}
					: null,
			]}
		>
			<ThemedText
				variant="caption"
				weight="medium"
				style={{ color: selected ? c.surface : c.onSurface }}
			>
				{label}
			</ThemedText>
		</Pressable>
	);

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
			<Card
				style={{
					marginTop: s.lg,
					padding: s.xl,
				}}
				variant="outlined"
			>
				<View style={styles.emptyState}>
					<Package size={56} color={c.placeholder} strokeWidth={1.25} />
					<ThemedText variant="h3" style={{ marginTop: s.md }}>
						{t('inventory.noItems')}
					</ThemedText>
					<ThemedText
						variant="body"
						color={c.onSurfaceVariant}
						style={{ marginTop: s.sm, textAlign: 'center' }}
					>
						{filters.search || filters.category !== 'ALL' || filters.lowStockOnly
							? t('inventory.emptyFilterHint')
							: t('inventory.addFirstItem')}
					</ThemedText>
				</View>
			</Card>
		);
	};

	return (
		<AtomicScreen safeAreaEdges={[]} withKeyboard={false}>
			<View
				accessible
				accessibilityLabel={INVENTORY_SCREEN_ACCESSIBILITY_LABEL}
				style={styles.a11yOnly}
			/>

			<ScreenHeader
				eyebrow="Stock"
				title={t('inventory.title')}
				subtitle={inventorySubtitle}
				showBackButton={false}
				showSyncStatus={false}
				rightElement={
					<View style={styles.headerActionRow}>
						<Pressable
							onPress={() => setMenuOpen(true)}
							accessibilityRole="button"
							accessibilityLabel={t('inventory.importExportActions')}
							accessibilityHint={t('inventory.importExportHint')}
							style={({ pressed }) => [
								styles.headerAction,
								{
									backgroundColor: c.surface,
									borderColor: c.border,
									borderRadius: r.md,
									height: HEADER_ACTION_SIZE,
									width: HEADER_ACTION_SIZE,
									opacity: pressed ? theme.opacity.pressed : 1,
								},
							]}
						>
							<FileUp
								size={HEADER_ACTION_ICON_SIZE}
								color={c.onSurface}
								strokeWidth={2}
								importantForAccessibility="no"
							/>
						</Pressable>
						<Pressable
							onPress={() => router.push('/(app)/inventory/add')}
							accessibilityRole="button"
							accessibilityLabel={t('inventory.addItem')}
							accessibilityHint={t('inventory.addHint')}
							style={({ pressed }) => [
								styles.headerAction,
								{
									backgroundColor: c.surface,
									borderColor: c.border,
									borderRadius: r.md,
									height: HEADER_ACTION_SIZE,
									width: HEADER_ACTION_SIZE,
									opacity: pressed ? theme.opacity.pressed : 1,
								},
							]}
						>
							<Plus
								size={HEADER_ACTION_ICON_SIZE}
								color={c.onSurface}
								strokeWidth={2.2}
								importantForAccessibility="no"
							/>
						</Pressable>
					</View>
				}
			/>

			{exporting ? (
				<View
					style={[
						StyleSheet.absoluteFill,
						styles.exportOverlay,
						{ backgroundColor: GLASS_WHITE_STRONG, zIndex: Z_INDEX.max },
					]}
				>
					<ActivityIndicator size="large" color={c.primary} />
					<ThemedText variant="body" style={{ marginTop: s.md, color: c.primary }}>
						{t('inventory.exportingItems')}
					</ThemedText>
				</View>
			) : null}

			<View style={{ paddingHorizontal: s.lg, paddingTop: s.lg }}>
				<Card
					accessibilityLabel={t('inventory.summaryLabel')}
					padding="none"
					variant="outlined"
				>
					<View style={styles.summaryRow}>
						<View style={[styles.summaryCell, { padding: s.md }]}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{t('inventory.stockValue')}
							</ThemedText>
							<ThemedText variant="h3" style={{ marginTop: s.xxs }}>
								{formatCurrency(totalValue)}
							</ThemedText>
						</View>
						<View
							style={[
								styles.summaryCell,
								styles.summaryDivider,
								{ borderLeftColor: c.separator, padding: s.md },
							]}
						>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{t('inventory.lowStockCount')}
							</ThemedText>
							<ThemedText variant="h3" color={c.warning} style={{ marginTop: s.xxs }}>
								{lowStockSetCount}
							</ThemedText>
						</View>
						<View
							style={[
								styles.summaryCell,
								styles.summaryDivider,
								{ borderLeftColor: c.separator, padding: s.md },
							]}
						>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{t('inventory.outOfStockCount')}
							</ThemedText>
							<ThemedText variant="h3" color={c.error} style={{ marginTop: s.xxs }}>
								{outOfStockSetCount}
							</ThemedText>
						</View>
					</View>
				</Card>

				<View style={[layout.row, { gap: s.sm, marginTop: s.md }]}>
					<SearchBar
						accessibilityLabel={t('inventory.searchLabel')}
						accessibilityHint={t('inventory.searchHint')}
						placeholder={t('inventory.searchPlaceholder')}
						value={searchInput}
						onChangeText={setSearchInput}
						onDebouncedChange={(value) => setFilters({ search: value })}
						style={{ flex: 1 }}
					/>
					<Pressable
						style={({ pressed }) => [
							styles.sortButton,
							{
								backgroundColor: c.surface,
								borderColor: c.border,
								borderRadius: r.md,
								height: 40,
								width: 40,
								opacity: pressed ? theme.opacity.pressed : 1,
							},
						]}
						onPress={() => setSortSheetOpen(true)}
						accessibilityRole="button"
						accessibilityLabel={t('inventory.filterLabel')}
						accessibilityHint={t('inventory.filterHint')}
					>
						<SlidersHorizontal
							size={18}
							color={c.onSurface}
							strokeWidth={2}
							importantForAccessibility="no"
						/>
					</Pressable>
				</View>

				<ScrollView
					accessibilityRole="list"
					accessibilityLabel={t('inventory.categoryFiltersLabel')}
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ gap: s.sm, paddingVertical: s.md }}
				>
					{CATEGORIES.map((category) => {
						const isSelected = filters.category === category && !filters.lowStockOnly;
						const label =
							category === 'ALL'
								? t(`inventory.categories.${category.toLowerCase()}`)
								: t(`inventory.categories.${category.toLowerCase()}`);
						return renderInventoryFilter(
							label,
							isSelected,
							() => handleCategorySelect(category),
							t('inventory.categoryFilterLabel', { label }),
							`category-${category}`,
						);
					})}
					{renderInventoryFilter(
						t('inventory.lowStockFilterWithCount', { count: lowStockSetCount }),
						Boolean(filters.lowStockOnly),
						handleLowStockToggle,
						t('inventory.lowStockFilterLabel'),
						'low-stock',
					)}
				</ScrollView>
			</View>

			<Modal
				visible={menuOpen}
				transparent
				animationType="fade"
				onRequestClose={() => setMenuOpen(false)}
			>
				<Pressable
					style={[styles.modalBackdrop, { backgroundColor: OVERLAY_COLOR_MEDIUM }]}
					onPress={() => setMenuOpen(false)}
					accessibilityElementsHidden
					importantForAccessibility="no-hide-descendants"
				/>
				<View
					style={[
						styles.menuSheet,
						{
							backgroundColor: c.surface,
							borderColor: c.border,
							borderRadius: r.lg,
							right: s.lg,
							top: MENU_TOP_OFFSET,
						},
						theme.shadows.lg,
					]}
				>
					<Pressable
						onPress={() => {
							setMenuOpen(false);
							router.push('/(app)/inventory/import');
						}}
						accessibilityRole="button"
						accessibilityLabel={t('inventory.importItems')}
						style={({ pressed }) => [
							styles.menuRow,
							{ opacity: pressed ? theme.opacity.pressed : 1 },
						]}
					>
						<FileUp
							size={18}
							color={c.onSurface}
							style={{ marginRight: s.md }}
							importantForAccessibility="no"
						/>
						<ThemedText variant="body">{t('inventory.importItems')}</ThemedText>
					</Pressable>
					<Pressable
						onPress={handleExport}
						accessibilityRole="button"
						accessibilityLabel={t('inventory.exportItems')}
						style={({ pressed }) => [
							styles.menuRow,
							{ opacity: pressed ? theme.opacity.pressed : 1 },
						]}
					>
						<FileDown
							size={18}
							color={c.onSurface}
							style={{ marginRight: s.md }}
							importantForAccessibility="no"
						/>
						<ThemedText variant="body">{t('inventory.exportItems')}</ThemedText>
					</Pressable>
				</View>
			</Modal>

			<Modal
				visible={sortSheetOpen}
				transparent
				animationType="slide"
				onRequestClose={() => setSortSheetOpen(false)}
			>
				<Pressable
					style={[styles.modalBackdrop, { backgroundColor: OVERLAY_COLOR_MEDIUM }]}
					onPress={() => setSortSheetOpen(false)}
					accessibilityElementsHidden
					importantForAccessibility="no-hide-descendants"
				/>
				<View
					style={[
						styles.sortSheet,
						{
							backgroundColor: c.surface,
							borderTopLeftRadius: r.xl,
							borderTopRightRadius: r.xl,
							paddingBottom: s.xl,
						},
					]}
				>
					<View
						style={[
							styles.sheetHandle,
							{ backgroundColor: c.borderStrong, borderRadius: r.full },
						]}
					/>
					<View
						style={{ paddingHorizontal: s.lg, paddingBottom: s.md, paddingTop: s.md }}
					>
						<ThemedText variant="sectionTitle">{t('inventory.sortTitle')}</ThemedText>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={{ marginTop: s.xxs }}
						>
							{t('inventory.sortDescription')}
						</ThemedText>
					</View>
					{SORT_OPTIONS.map((option, index) => {
						const isActive =
							filters.sortBy === option.sortBy && filters.sortDir === option.sortDir;
						return (
							<Pressable
								key={option.label}
								onPress={() => {
									setFilters({
										sortBy: option.sortBy as InventoryFilters['sortBy'],
										sortDir: option.sortDir,
									});
									setSortSheetOpen(false);
								}}
								accessibilityRole="button"
								accessibilityLabel={t('inventory.sortByLabel', {
									label: option.label,
								})}
								accessibilityState={{ selected: isActive }}
								style={({ pressed }) => [
									styles.sortOption,
									{
										backgroundColor: pressed
											? c.surfaceVariant
											: isActive
												? c.surfaceVariant
												: c.surface,
										borderBottomColor: c.separator,
										borderBottomWidth:
											index === SORT_OPTIONS.length - 1
												? 0
												: StyleSheet.hairlineWidth,
										paddingHorizontal: s.lg,
										paddingVertical: s.md,
									},
								]}
							>
								<View style={[layout.row, styles.sortOptionContent]}>
									<View
										style={[
											styles.sortIconWrap,
											{
												backgroundColor: c.surface,
												borderColor: c.border,
												borderRadius: r.md,
											},
										]}
									>
										<ArrowUpDown
											size={16}
											color={isActive ? c.primary : c.onSurfaceVariant}
											strokeWidth={2}
											importantForAccessibility="no"
										/>
									</View>
									<ThemedText
										variant="body"
										color={isActive ? c.primary : c.onSurface}
										weight={isActive ? 'semibold' : 'regular'}
									>
										{option.label}
									</ThemedText>
								</View>
								{isActive ? (
									<ThemedText
										variant="caption"
										color={c.primary}
										weight="semibold"
									>
										{t('common.selected')}
									</ThemedText>
								) : null}
							</Pressable>
						);
					})}
				</View>
			</Modal>

			<FlatList
				accessibilityRole="list"
				accessibilityLabel={t('inventory.setsListLabel')}
				data={groupedSets}
				keyExtractor={(item) => item.baseItemNumber}
				contentContainerStyle={{
					paddingHorizontal: s.lg,
					paddingTop: s.md,
					paddingBottom: listBottomPadding,
				}}
				renderItem={({ item }) => (
					<TileSetCard
						group={item}
						onPressItem={(inventoryItem) =>
							router.push(`/(app)/inventory/${inventoryItem.id}`)
						}
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
				onEndReached={() => void handleLoadMore()}
				onEndReachedThreshold={0.5}
				ListFooterComponent={
					loading && items.length > 0 ? (
						<View style={{ paddingVertical: s.md, gap: s.sm }}>
							<SkeletonBlock height={96} borderRadius={r.xl} />
						</View>
					) : null
				}
			/>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	a11yOnly: {
		height: 0,
		opacity: 0,
		width: 0,
	},
	headerActionRow: {
		flexDirection: 'row',
		gap: SPACING_PX.xs,
	},
	headerAction: {
		alignItems: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		justifyContent: 'center',
	},
	exportOverlay: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	summaryRow: {
		flexDirection: 'row',
	},
	summaryCell: {
		flex: 1 / SUMMARY_SEGMENTS,
	},
	summaryDivider: {
		borderLeftWidth: StyleSheet.hairlineWidth,
	},
	sortButton: {
		alignItems: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		justifyContent: 'center',
	},
	filterPill: {
		alignItems: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		flexDirection: 'row',
		justifyContent: 'center',
	},
	centerFlex: {
		alignItems: 'center',
		flex: 1,
		justifyContent: 'center',
		paddingBottom: SPACING_PX['2xl'],
		paddingTop: SPACING_PX['2xl'],
	},
	emptyState: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	modalBackdrop: {
		bottom: 0,
		left: 0,
		position: 'absolute',
		right: 0,
		top: 0,
	},
	menuSheet: {
		borderWidth: StyleSheet.hairlineWidth,
		position: 'absolute',
		width: SIZE_MENU_SHEET_WIDTH,
	},
	menuRow: {
		alignItems: 'center',
		flexDirection: 'row',
		padding: SPACING_PX.lg,
	},
	sortSheet: {
		bottom: 0,
		left: 0,
		maxHeight: SORT_SHEET_MAX_HEIGHT,
		position: 'absolute',
		right: 0,
	},
	sheetHandle: {
		alignSelf: 'center',
		height: 4,
		marginTop: SPACING_PX.sm,
		width: 36,
	},
	sortOption: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
		minHeight: TOUCH_TARGET_MIN_PX,
	},
	sortOptionContent: {
		alignItems: 'center',
		flex: 1,
	},
	sortIconWrap: {
		alignItems: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		height: 32,
		justifyContent: 'center',
		marginRight: SPACING_PX.sm,
		width: 32,
	},
});
