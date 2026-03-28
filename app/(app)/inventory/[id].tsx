import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
	ArrowLeft,
	Package,
	Edit,
	Clock,
	HelpCircle,
	ArrowUpRight,
	ArrowDownRight,
} from 'lucide-react-native';
import { Image } from 'expo-image';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { inventoryService } from '@/src/services/inventoryService';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Screen } from '@/src/components/atoms/Screen';
import type { InventoryItem, StockOperation } from '@/src/types/inventory';
import type { UUID } from '@/src/types/common';
import { layout } from '@/src/theme/layout';
import logger from '@/src/utils/logger';

export default function ItemDetailScreen() {
	const { theme, c, s, r } = useThemeTokens();
	const { t, formatCurrency, formatDateShort } = useLocale();
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: UUID }>();

	const [item, setItem] = useState<InventoryItem | null>(null);
	const [history, setHistory] = useState<StockOperation[]>([]);
	const [loading, setLoading] = useState(true);

	// Instead of only using local store, fetch fresh so we always have latest
	useEffect(() => {
		if (!id) return;
		let isMounted = true;
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
	}, [id]);

	if (loading) {
		return (
			<View
				style={[
					styles.container,
					{
						backgroundColor: c.background,
						justifyContent: 'center',
						alignItems: 'center',
					},
				]}
			>
				<ActivityIndicator size="large" color={c.primary} />
			</View>
		);
	}

	if (!item) {
		return (
			<Screen safeAreaEdges={['top']}>
				<View
					style={[
						styles.header,
						layout.rowBetween,
						{
							borderBottomColor: c.border,
							borderBottomWidth: 1,
							paddingHorizontal: 20,
							paddingBottom: 16,
						},
					]}
				>
					<TouchableOpacity onPress={() => router.back()} style={styles.back}>
						<ArrowLeft size={22} color={c.primary} strokeWidth={2} />
					</TouchableOpacity>
				</View>
				<View style={styles.center}>
					<HelpCircle size={48} color={c.placeholder} strokeWidth={1} />
					<ThemedText style={{ marginTop: 16 }}>Item not found</ThemedText>
				</View>
			</Screen>
		);
	}

	const isLowStock = item.box_count <= item.low_stock_threshold;

	return (
		<Screen safeAreaEdges={['top']} withKeyboard={false}>
			{/* Header */}
			<View
				style={[
					styles.header,
					layout.rowBetween,
					{
						borderBottomColor: c.border,
						borderBottomWidth: 1,
						paddingHorizontal: s.lg,
						paddingBottom: s.md,
					},
				]}
			>
				<View style={[layout.row, { flex: 1 }]}>
					<TouchableOpacity onPress={() => router.back()} style={styles.back}>
						<ArrowLeft size={24} color={c.onBackground} strokeWidth={2.5} />
					</TouchableOpacity>
					<ThemedText
						variant="h2"
						style={{ marginLeft: s.md, flex: 1 }}
						numberOfLines={1}
					>
						{item.design_name}
					</ThemedText>
				</View>
				<TouchableOpacity
					style={{ padding: 4 }}
					onPress={() => router.push(`/(app)/inventory/add?id=${item.id}`)}
				>
					<Edit size={22} color={c.primary} strokeWidth={2} />
				</TouchableOpacity>
			</View>

			<ScrollView contentContainerStyle={{ padding: s.lg }}>
				{/* Image Card */}
				<View
					style={[
						styles.imageCard,
						{
							backgroundColor: c.surface,
							borderRadius: r.lg,
							...(theme.shadows.sm as object),
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
					<SpecBox label="Base Item" value={item.base_item_number} />
					<SpecBox label="Category" value={item.category} />
					<SpecBox label="Size" value={item.size_name || 'N/A'} />
					<SpecBox label="Grade" value={item.grade || 'N/A'} />
					<SpecBox label="Pcs / Box" value={item.pcs_per_box?.toString() || 'N/A'} />
					<SpecBox label="Sqft / Box" value={item.sqft_per_box?.toString() || 'N/A'} />
					<SpecBox
						label="Selling Price"
						value={formatCurrency(item.selling_price)}
						highlight
					/>
				</View>

				{/* Stock Status */}
				<View
					style={[
						styles.stockBox,
						{
							backgroundColor: isLowStock ? c.errorLight : c.success + '15',
							borderRadius: r.md,
							marginTop: s.xl,
							borderColor: isLowStock ? c.error : c.success,
							borderWidth: 1,
						},
					]}
				>
					<ThemedText variant="h3" color={isLowStock ? c.error : c.success}>
						{item.box_count} Boxes in Stock
					</ThemedText>
					<ThemedText
						variant="caption"
						color={c.onSurfaceVariant}
						style={{ marginTop: 2 }}
					>
						Threshold: {item.low_stock_threshold} boxes
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
							Stock In
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
							Stock Out
						</ThemedText>
					</TouchableOpacity>
				</View>

				{/* Stock History */}
				<View style={{ marginTop: s.xl }}>
					<ThemedText variant="h3" style={{ marginBottom: s.md }}>
						Recent Operations
					</ThemedText>
					{history.length === 0 ? (
						<ThemedText color={c.placeholder}>
							No stock operations recorded yet.
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
										{op.operation_type.replace('_', ' ')}
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
		</Screen>
	);

	function SpecBox({
		label,
		value,
		highlight = false,
	}: {
		label: string;
		value: string;
		highlight?: boolean;
	}) {
		return (
			<View style={{ width: '50%', padding: 6 }}>
				<View
					style={{
						backgroundColor: highlight ? c.primary + '10' : c.surfaceVariant,
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
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	header: {},
	back: {},
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	imageCard: { padding: 4 },
	stockBox: { padding: 16, alignItems: 'center' },
	actionBtn: { paddingVertical: 14 },
	historyRow: { paddingVertical: 12 },
});
