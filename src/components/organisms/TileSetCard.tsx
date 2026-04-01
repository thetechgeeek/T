import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Package, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/hooks/useLocale';
import type { ViewStyle } from 'react-native';
import type { TileSetGroup, InventoryItem } from '@/src/types/inventory';
import { getThumbUrl } from '@/src/utils/imageTransform';

interface TileSetCardProps {
	group: TileSetGroup;
	onPressItem: (item: InventoryItem) => void;
	style?: ViewStyle;
}

export function TileSetCard({ group, onPressItem, style }: TileSetCardProps) {
	const { theme } = useTheme();
	const { formatCurrency } = useLocale();
	const c = theme.colors;
	const s = theme.spacing;
	const r = theme.borderRadius;

	// We'll show the main image as the first item's image, or placeholder

	// Total stock across all variants in this set
	const totalStock = group.items.reduce((sum, item) => sum + item.box_count, 0);
	const lowStock = group.items.some((i) => i.box_count <= i.low_stock_threshold);

	return (
		<View
			style={[
				styles.card,
				{ backgroundColor: c.card, borderRadius: r.lg, ...(theme.shadows.sm as object) },
				style,
			]}
		>
			{/* Set Header */}
			<View
				style={[
					styles.header,
					{
						borderBottomColor: c.border,
						borderBottomWidth: StyleSheet.hairlineWidth,
						padding: s.md,
					},
				]}
			>
				<View style={styles.headerTitleRow}>
					<Text
						style={[
							{
								color: c.onSurface,
								fontSize: theme.typography.sizes.lg,
								fontWeight: theme.typography.weights.bold,
							},
						]}
						numberOfLines={1}
					>
						{group.baseItemNumber}
					</Text>
					{lowStock && (
						<View
							accessible={true}
							accessibilityLabel="Low stock warning"
							style={[
								styles.lowStockBadge,
								{ backgroundColor: c.errorLight, borderRadius: r.sm },
							]}
						>
							<AlertCircle
								size={12}
								color={c.error}
								strokeWidth={2.5}
								importantForAccessibility="no"
							/>
							<Text
								importantForAccessibility="no"
								style={[
									{
										color: c.error,
										fontSize: theme.typography.sizes.xs,
										fontWeight: theme.typography.weights.bold,
										marginLeft: 4,
									},
								]}
							>
								LOW
							</Text>
						</View>
					)}
				</View>
				<Text
					style={[
						{
							color: c.onSurfaceVariant,
							fontSize: theme.typography.sizes.sm,
							marginTop: 2,
						},
					]}
				>
					{group.items.length} Variant{group.items.length !== 1 ? 's' : ''} • {totalStock}{' '}
					Boxes Total
				</Text>
			</View>

			{/* Variants List */}
			<View style={{ padding: s.md }}>
				{group.items.map((item, index) => {
					const isLow = item.box_count <= item.low_stock_threshold;
					return (
						<TouchableOpacity
							key={item.id}
							activeOpacity={0.7}
							accessibilityRole="button"
							accessibilityLabel={`${item.design_name}, ${item.box_count} boxes in stock`}
							accessibilityHint={
								isLow
									? 'Low stock. Double tap to view details'
									: 'Double tap to view details'
							}
							style={[styles.variantRow, { marginTop: index > 0 ? s.md : 0 }]}
							onPress={() => onPressItem(item)}
						>
							{/* Image thumbnail */}
							<View
								style={[
									styles.thumbnail,
									{ backgroundColor: c.surface, borderRadius: r.md },
								]}
							>
								{item.tile_image_url ? (
									<Image
										source={{ uri: getThumbUrl(item.tile_image_url, 88) }}
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

							{/* Variant Info */}
							<View style={styles.variantInfo}>
								<Text
									style={[
										{
											color: c.onSurface,
											fontSize: theme.typography.sizes.md,
											fontWeight: theme.typography.weights.semibold,
										},
									]}
									numberOfLines={1}
								>
									{item.design_name}
								</Text>
								<View style={styles.metaRow}>
									<Text
										style={[
											{
												color: c.onSurfaceVariant,
												fontSize: theme.typography.sizes.xs,
											},
										]}
									>
										{item.size_name || 'Size N/A'}
									</Text>
									{item.category !== 'OTHER' && (
										<View
											importantForAccessibility="no"
											style={[
												styles.catBadge,
												{
													backgroundColor: c.primary + '15',
													borderRadius: r.sm,
												},
											]}
										>
											<Text
												style={[
													{
														color: c.primary,
														fontSize: 10,
														fontWeight: theme.typography.weights.bold,
													},
												]}
											>
												{item.category}
											</Text>
										</View>
									)}
								</View>
							</View>

							{/* Variant Stock & Price */}
							<View style={styles.stockCol}>
								<Text
									style={[
										{
											color: isLow ? c.error : c.success,
											fontSize: theme.typography.sizes.sm,
											fontWeight: theme.typography.weights.bold,
										},
									]}
								>
									{item.box_count} Box
								</Text>
								<Text
									style={[
										{
											color: c.onSurface,
											fontSize: theme.typography.sizes.xs,
											fontWeight: theme.typography.weights.medium,
											marginTop: 2,
										},
									]}
								>
									{formatCurrency(item.selling_price)}
								</Text>
							</View>
						</TouchableOpacity>
					);
				})}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: { overflow: 'hidden' },
	header: {},
	headerTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	lowStockBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 6,
		paddingVertical: 2,
	},
	variantRow: { flexDirection: 'row', alignItems: 'center' },
	thumbnail: {
		width: 44,
		height: 44,
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
		marginRight: 12,
	},
	image: { width: '100%', height: '100%' },
	variantInfo: { flex: 1, justifyContent: 'center' },
	metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
	catBadge: { paddingHorizontal: 6, paddingVertical: 2, marginLeft: 8 },
	stockCol: { alignItems: 'flex-end', justifyContent: 'center', marginLeft: 12 },
});
