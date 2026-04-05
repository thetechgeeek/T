import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Package, Edit, HelpCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { inventoryService } from '@/src/services/inventoryService';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { SkeletonBlock } from '@/src/components/molecules/SkeletonBlock';
import { withOpacity } from '@/src/utils/color';
import type { InventoryItem, StockOperation } from '@/src/types/inventory';
import type { UUID } from '@/src/types/common';
import { layout } from '@/src/theme/layout';
import logger from '@/src/utils/logger';

export default function ItemDetailScreen() {
	const { theme, c, s, r } = useThemeTokens();
	const { formatCurrency, formatDateShort, t } = useLocale();
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: UUID }>();

	const [item, setItem] = useState<InventoryItem | null>(null);
	const [history, setHistory] = useState<StockOperation[]>([]);
	const [loading, setLoading] = useState(true);

	// Re-fetch every time screen comes into focus so stock counts are fresh after stock ops.
	// Only show full-screen loading on first load (item is null); subsequent focus re-fetches
	// update silently in the background to avoid blanking the screen.
	useFocusEffect(
		useCallback(() => {
			if (!id) return;
			let isMounted = true;
			const isFirstLoad = item === null;
			if (isFirstLoad) setLoading(true);
			const fetchAll = async () => {
				try {
					const [itemData, historyData] = await Promise.all([
						inventoryService.fetchItemById(id),
						inventoryService.fetchStockHistory(id),
					]);
					if (isMounted) {
						setItem(itemData);
						setHistory(historyData);
					}
				} catch (err) {
					logger.error('Failed to load item detail', err);
				} finally {
					if (isMounted) setLoading(false);
				}
			};
			fetchAll();
			return () => {
				isMounted = false;
			};
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [id]),
	);

	if (loading) {
		return (
			<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
				<ScreenHeader title="" />
				<View style={{ padding: s.lg, gap: s.md }}>
					<SkeletonBlock height={120} borderRadius={r.lg} />
					<SkeletonBlock height={60} borderRadius={r.md} />
					<SkeletonBlock height={60} borderRadius={r.md} />
					<SkeletonBlock width="50%" height={20} style={{ marginTop: s.sm }} />
					<SkeletonBlock height={80} borderRadius={r.md} />
				</View>
			</AtomicScreen>
		);
	}

	if (!item) {
		return (
			<AtomicScreen safeAreaEdges={['bottom']}>
				<ScreenHeader title="" />
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
					<HelpCircle size={48} color={c.placeholder} strokeWidth={1} />
					<ThemedText style={{ marginTop: 16 }}>{t('inventory.itemNotFound')}</ThemedText>
				</View>
			</AtomicScreen>
		);
	}

	const isLowStock = item.box_count <= item.low_stock_threshold;

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader
				title={item.design_name}
				rightElement={
					<TouchableOpacity
						style={{ padding: 4 }}
						onPress={() => router.push(`/(app)/inventory/add?id=${item.id}`)}
					>
						<Edit size={22} color={c.primary} strokeWidth={2} />
					</TouchableOpacity>
				}
			/>

			<ScrollView contentContainerStyle={{ padding: s.lg }}>
				{/* Image Card */}
				<View
					style={[
						styles.imageCard,
						{
							backgroundColor: c.surface,
							borderRadius: r.lg,
							...(theme.shadows?.sm || {}),
						},
					]}
				>
					{item.tile_image_url ? (
						<Image
							source={{ uri: item.tile_image_url }}
							style={{ width: '100%', aspectRatio: 1, borderRadius: r.lg }}
							contentFit="cover"
						/>
					) : (
						<View
							style={{
								width: '100%',
								aspectRatio: 1,
								alignItems: 'center',
								justifyContent: 'center',
								backgroundColor: c.surfaceVariant,
								borderRadius: r.lg,
							}}
						>
							<Package size={64} color={c.placeholder} strokeWidth={1} />
						</View>
					)}
				</View>

				{/* Specs Grid */}
				<View
					style={[
						layout.row,
						{ flexWrap: 'wrap', marginTop: s.lg, marginHorizontal: -6 },
					]}
				>
					<SpecBox label={t('inventory.addItem')} value={item.base_item_number} />
					<SpecBox
						label={t('inventory.category')}
						value={t(`inventory.categories.${item.category.toLowerCase()}`)}
					/>
					<SpecBox label={t('inventory.size')} value={item.size_name || t('common.na')} />
					<SpecBox label={t('inventory.grade')} value={item.grade || t('common.na')} />
					<SpecBox
						label={t('inventory.pcsPerBox')}
						value={item.pcs_per_box?.toString() || t('common.na')}
					/>
					<SpecBox
						label={t('inventory.sqftPerBox')}
						value={item.sqft_per_box?.toString() || t('common.na')}
					/>
					<SpecBox
						label={t('inventory.sellingPrice')}
						value={formatCurrency(item.selling_price)}
						highlight
					/>
				</View>

				{/* Stock Status */}
				<View
					style={[
						styles.stockBox,
						{
							backgroundColor: isLowStock
								? c.errorLight
								: withOpacity(c.success, 0.08),
							borderRadius: r.md,
							marginTop: s.xl,
							borderColor: isLowStock ? c.error : c.success,
							borderWidth: 1,
						},
					]}
				>
					<ThemedText variant="h3" color={isLowStock ? c.error : c.success}>
						{t('inventory.stockStatus', { count: item.box_count })}
					</ThemedText>
					<ThemedText
						variant="caption"
						color={c.onSurfaceVariant}
						style={{ marginTop: 2 }}
					>
						{t('inventory.thresholdStatus', { count: item.low_stock_threshold })}
					</ThemedText>
				</View>

				{/* Quick Actions */}
				<View style={[layout.row, { marginTop: s.md, gap: s.md }]}>
					<TouchableOpacity
						style={[
							styles.actionBtn,
							layout.row,
							{ flex: 1, backgroundColor: c.surfaceVariant, borderRadius: r.md },
						]}
						onPress={() =>
							router.push(`/(app)/inventory/stock-op?id=${item.id}&type=stock_in`)
						}
					>
						<ArrowDownRight size={20} color={c.success} strokeWidth={2.5} />
						<ThemedText weight="semibold" style={{ marginLeft: 8 }}>
							{t('inventory.stockIn')}
						</ThemedText>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.actionBtn,
							layout.row,
							{ flex: 1, backgroundColor: c.surfaceVariant, borderRadius: r.md },
						]}
						onPress={() =>
							router.push(`/(app)/inventory/stock-op?id=${item.id}&type=stock_out`)
						}
					>
						<ArrowUpRight size={20} color={c.error} strokeWidth={2.5} />
						<ThemedText weight="semibold" style={{ marginLeft: 8 }}>
							{t('inventory.stockOut')}
						</ThemedText>
					</TouchableOpacity>
				</View>

				{/* Stock History */}
				<View style={{ marginTop: s.xl }}>
					<ThemedText variant="h3" style={{ marginBottom: s.md }}>
						{t('inventory.stockHistory')}
					</ThemedText>
					{history.length === 0 ? (
						<ThemedText color={c.placeholder}>
							{t('inventory.emptyFilterHint')}
						</ThemedText>
					) : (
						history.map((op, index) => (
							<View
								key={op.id}
								style={[
									styles.historyRow,
									layout.row,
									{
										borderBottomColor: c.border,
										borderBottomWidth:
											index === history.length - 1
												? 0
												: StyleSheet.hairlineWidth,
									},
								]}
							>
								<View style={{ flex: 1 }}>
									<ThemedText
										weight="semibold"
										style={{ textTransform: 'capitalize' }}
									>
										{t(`inventory.operations.${op.operation_type}`)}
									</ThemedText>
									<ThemedText
										variant="caption"
										color={c.onSurfaceVariant}
										style={{ marginTop: 2 }}
									>
										{formatDateShort(op.created_at)}
										{op.reason ? ` • ${op.reason}` : ''}
									</ThemedText>
								</View>
								<ThemedText
									weight="bold"
									color={op.quantity_change > 0 ? c.success : c.error}
								>
									{op.quantity_change > 0 ? '+' : ''}
									{op.quantity_change}
								</ThemedText>
							</View>
						))
					)}
				</View>
			</ScrollView>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	imageCard: { padding: 4 },
	stockBox: { padding: 16, alignItems: 'center' },
	actionBtn: { paddingVertical: 14 },
	historyRow: { paddingVertical: 12 },
});

function SpecBox({
	label,
	value,
	highlight = false,
}: {
	label: string;
	value: string;
	highlight?: boolean;
}) {
	const { c, r } = useThemeTokens();
	return (
		<View style={{ width: '50%', padding: 6 }}>
			<View
				style={{
					backgroundColor: highlight ? withOpacity(c.primary, 0.06) : c.surfaceVariant,
					padding: 12,
					borderRadius: r.md,
				}}
			>
				<ThemedText
					variant="caption"
					color={c.onSurfaceVariant}
					style={{ marginBottom: 4 }}
				>
					{label}
				</ThemedText>
				<ThemedText
					variant="body1"
					weight="semibold"
					color={highlight ? c.primary : c.onSurface}
					numberOfLines={1}
				>
					{value}
				</ThemedText>
			</View>
		</View>
	);
}
