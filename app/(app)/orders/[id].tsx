import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { orderService, Order } from '@/src/services/orderService';
import type { InventoryItem } from '@/src/types/inventory';
import { Package, CheckCircle2 } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/design-system/components/atoms/Screen';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { ScreenHeader } from '@/app/components/molecules/ScreenHeader';
import { SkeletonBlock } from '@/src/design-system/components/molecules/SkeletonBlock';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';
import logger from '@/src/utils/logger';

export default function OrderDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { c, s, r } = useThemeTokens();
	const { formatDateShort, t } = useLocale();

	const [order, setOrder] = useState<Order | null>(null);
	const [items, setItems] = useState<InventoryItem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadData() {
			if (!id) return;
			try {
				const orderData = await orderService.fetchOrderById(id);
				const itemsData = await orderService.fetchItemsByOrderId(id);
				setOrder(orderData);
				setItems(itemsData as InventoryItem[]);
			} catch (err: unknown) {
				logger.error('error', err);
			} finally {
				setLoading(false);
			}
		}
		loadData();
	}, [id]);

	if (loading || !order) {
		return (
			<AtomicScreen safeAreaEdges={['bottom']} header={<ScreenHeader title="" />}>
				<View style={{ padding: s.lg, gap: s.md }}>
					<SkeletonBlock width="60%" height={28} />
					<SkeletonBlock width="40%" height={14} />
					<View style={{ marginTop: s.lg, gap: s.sm }}>
						<SkeletonBlock height={48} borderRadius={r.md} />
						<SkeletonBlock height={48} borderRadius={r.md} />
					</View>
					<SkeletonBlock width="40%" height={20} style={{ marginTop: s.lg }} />
					{[0, 1, 2].map((i) => (
						<SkeletonBlock key={i} height={64} borderRadius={r.md} />
					))}
				</View>
			</AtomicScreen>
		);
	}

	return (
		<AtomicScreen
			safeAreaEdges={['bottom']}
			scrollable
			header={<ScreenHeader title={order.party_name || t('order.orderDetail')} />}
		>
			<View style={styles.headerArea}>
				<Package size={48} color={c.primary} style={{ marginBottom: s.md }} />
				<ThemedText variant="h1" align="center">
					{order.party_name || t('inventory.itemNotFound')}
				</ThemedText>
				<ThemedText color={c.onSurfaceVariant} align="center" style={{ marginTop: s.xs }}>
					{t('invoice.invoiceDate')}: {formatDateShort(order.created_at)}
				</ThemedText>
			</View>

			<View style={{ padding: s.lg }}>
				<View
					style={[
						styles.section,
						{
							backgroundColor: c.surface,
							borderRadius: r.md,
							borderColor: c.border,
						},
					]}
				>
					<ThemedText variant="h3" style={{ marginBottom: s.md }}>
						{t('invoice.stepReview')}
					</ThemedText>
					<View style={styles.row}>
						<ThemedText color={c.placeholder} style={{ flex: 1 }}>
							{t('order.totalBoxes')}
						</ThemedText>
						<ThemedText weight="semibold">
							{t('inventory.stockStatus', { count: order.total_quantity })}
						</ThemedText>
					</View>
					<View style={styles.row}>
						<ThemedText color={c.placeholder} style={{ flex: 1 }}>
							{t('order.status')}
						</ThemedText>
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								gap: SPACING_PX.xs,
							}}
						>
							<CheckCircle2 size={16} color={c.success} />
							<ThemedText color={c.success} weight="semibold">
								{t('order.importSuccess')}
							</ThemedText>
						</View>
					</View>
				</View>

				<ThemedText variant="h3" style={{ marginTop: s.lg, marginBottom: s.md }}>
					{t('order.extractedItems')} ({items.length})
				</ThemedText>

				{items.map((item: InventoryItem, index: number) => (
					<View
						key={item.id || index}
						style={[
							styles.itemCard,
							{
								backgroundColor: c.surface,
								borderRadius: r.md,
								borderColor: c.border,
							},
						]}
					>
						<View style={{ flex: 1 }}>
							<ThemedText weight="bold" style={{ fontSize: FONT_SIZE.body }}>
								{item.design_name}
							</ThemedText>
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={{ marginTop: SPACING_PX.xs }}
							>
								{item.category} {item.size_name ? `• ${item.size_name}` : ''}
							</ThemedText>
						</View>
						<View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
							<ThemedText color={c.primary} variant="h3">
								+{item.box_count}
							</ThemedText>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{t('common.done')}
							</ThemedText>
						</View>
					</View>
				))}

				{items.length === 0 && (
					<View style={{ padding: s.lg, alignItems: 'center' }}>
						<ThemedText color={c.placeholder}>{t('order.noItemsMessage')}</ThemedText>
					</View>
				)}
			</View>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	headerArea: {
		padding: SPACING_PX['2xl'],
		alignItems: 'center',
		justifyContent: 'center',
	},
	section: {
		padding: SPACING_PX.lg,
		borderWidth: 1,
	},
	row: {
		flexDirection: 'row',
		marginBottom: SPACING_PX.md,
	},
	itemCard: {
		flexDirection: 'row',
		padding: SPACING_PX.lg,
		borderWidth: 1,
		marginBottom: SPACING_PX.sm,
	},
});
