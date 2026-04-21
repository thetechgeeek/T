import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Package, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@easydesign/design-system/foundation';
import { useLocale } from '@/src/hooks/useLocale';
import { withOpacity } from '@easydesign/design-system/foundation';
import {
	OPACITY_SKELETON_BASE,
	SIZE_THUMBNAIL_MD,
	SIZE_TILE_IMAGE,
} from '@easydesign/design-system/foundation';
import type { ViewStyle } from 'react-native';
import type { TileSetGroup, InventoryItem } from '@/src/types/inventory';
import { getThumbUrl } from '@/src/utils/imageTransform';
import { SPACING_PX } from '@easydesign/design-system/foundation';
import { Card, ThemedText } from '@easydesign/design-system';

const LOW_BADGE_HORIZONTAL_PADDING = SPACING_PX.xs + SPACING_PX.xxs;

interface TileSetCardProps {
	group: TileSetGroup;
	onPressItem: (item: InventoryItem) => void;
	style?: ViewStyle;
}

export function TileSetCard({ group, onPressItem, style }: TileSetCardProps) {
	const { theme } = useTheme();
	const { formatCurrency, t } = useLocale();
	const c = theme.colors;
	const s = theme.spacing;
	const r = theme.borderRadius;

	const totalStock = group.items.reduce((sum, item) => sum + item.box_count, 0);
	const lowStock = group.items.some((item) => item.box_count <= item.low_stock_threshold);

	return (
		<Card
			padding="none"
			style={[
				styles.card,
				{
					borderRadius: r.xl,
					overflow: 'hidden',
				},
				style,
			]}
			variant="outlined"
		>
			<View
				style={[
					styles.header,
					{
						borderBottomColor: c.separator,
						borderBottomWidth: StyleSheet.hairlineWidth,
						paddingHorizontal: s.md,
						paddingVertical: s.md,
					},
				]}
			>
				<View style={styles.headerTitleRow}>
					<ThemedText variant="bodyStrong" numberOfLines={1}>
						{group.baseItemNumber}
					</ThemedText>
					{lowStock ? (
						<View
							accessible={true}
							accessibilityLabel={t('inventory.lowStockWarning')}
							style={[
								styles.lowStockBadge,
								{
									backgroundColor: c.errorLight,
									borderRadius: r.full,
								},
							]}
						>
							<AlertCircle
								size={12}
								color={c.error}
								strokeWidth={2.25}
								importantForAccessibility="no"
							/>
							<ThemedText
								variant="captionSmall"
								color={c.error}
								weight="bold"
								style={{ marginLeft: s.xxs }}
							>
								{t('common.low').toUpperCase()}
							</ThemedText>
						</View>
					) : null}
				</View>
				<ThemedText
					variant="caption"
					color={c.onSurfaceVariant}
					style={{ marginTop: s.xxs }}
				>
					{group.items.length}{' '}
					{group.items.length === 1 ? t('inventory.variant') : t('inventory.variants')} •{' '}
					{totalStock} {t('inventory.boxesTotal')}
				</ThemedText>
			</View>

			{group.items.map((item, index) => {
				const isLow = item.box_count <= item.low_stock_threshold;
				const isOut = item.box_count <= 0;
				const rowBorderWidth =
					index === group.items.length - 1 ? 0 : StyleSheet.hairlineWidth;
				const metadataParts = [
					item.size_name || t('inventory.itemNotFound'),
					item.category && item.category !== 'OTHER'
						? t(`inventory.categories.${item.category.toLowerCase()}`)
						: null,
				].filter(Boolean);

				return (
					<Pressable
						key={item.id}
						onPress={() => onPressItem(item)}
						accessibilityRole="button"
						accessibilityLabel={`${item.design_name}, ${item.box_count} boxes in stock`}
						accessibilityHint={
							isLow
								? `${t('inventory.lowStockWarning')}. ${t('common.doubleTapToView')}`
								: t('common.doubleTapToView')
						}
						style={({ pressed }) => [
							styles.variantRow,
							{
								backgroundColor: pressed ? c.surfaceVariant : c.card,
								borderBottomColor: c.separator,
								borderBottomWidth: rowBorderWidth,
								paddingHorizontal: s.md,
								paddingVertical: s.md,
							},
						]}
					>
						<View
							style={[
								styles.thumbnail,
								{
									backgroundColor: c.surfaceVariant,
									borderRadius: r.md,
									marginRight: s.md,
								},
							]}
						>
							{item.tile_image_url ? (
								<Image
									source={{
										uri: getThumbUrl(item.tile_image_url, SIZE_TILE_IMAGE),
									}}
									style={styles.image}
									contentFit="cover"
									accessible={true}
									accessibilityLabel={item.design_name}
								/>
							) : (
								<Package
									size={20}
									color={c.placeholder}
									strokeWidth={1.5}
									importantForAccessibility="no"
								/>
							)}
						</View>

						<View style={styles.variantInfo}>
							<ThemedText variant="body" weight="semibold" numberOfLines={1}>
								{item.design_name}
							</ThemedText>
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								numberOfLines={1}
								style={{ marginTop: s.xxs }}
							>
								{metadataParts.join(' • ')}
							</ThemedText>
						</View>

						<View style={styles.stockCol}>
							<ThemedText
								variant="bodyStrong"
								color={isOut ? c.error : isLow ? c.warning : c.onSurface}
							>
								{t('inventory.boxCount', { count: item.box_count })}
							</ThemedText>
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={{ marginTop: s.xxs }}
							>
								{formatCurrency(item.selling_price)}
							</ThemedText>
							{item.category !== 'OTHER' ? (
								<View
									style={[
										styles.categoryDot,
										{
											backgroundColor: withOpacity(
												c.primary,
												OPACITY_SKELETON_BASE,
											),
											borderRadius: r.full,
										},
									]}
								/>
							) : null}
						</View>
					</Pressable>
				);
			})}
		</Card>
	);
}

const styles = StyleSheet.create({
	card: {},
	header: {},
	headerTitleRow: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	lowStockBadge: {
		alignItems: 'center',
		flexDirection: 'row',
		paddingHorizontal: LOW_BADGE_HORIZONTAL_PADDING,
		paddingVertical: SPACING_PX.xxs,
	},
	variantRow: {
		alignItems: 'center',
		flexDirection: 'row',
	},
	thumbnail: {
		alignItems: 'center',
		height: SIZE_THUMBNAIL_MD,
		justifyContent: 'center',
		overflow: 'hidden',
		width: SIZE_THUMBNAIL_MD,
	},
	image: { width: '100%', height: '100%' },
	variantInfo: {
		flex: 1,
		justifyContent: 'center',
	},
	stockCol: {
		alignItems: 'flex-end',
		justifyContent: 'center',
		marginLeft: SPACING_PX.md,
		minWidth: 72,
	},
	categoryDot: {
		height: 6,
		marginTop: SPACING_PX.xs,
		width: 6,
	},
});
