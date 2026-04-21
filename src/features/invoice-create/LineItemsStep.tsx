import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { useThemeTokens } from '@easydesign/design-system/foundation';
import { useLocale } from '@/src/hooks/useLocale';
import { ThemedText } from '@easydesign/design-system';
import { Button } from '@easydesign/design-system';
import { FormField } from '@easydesign/design-system';
import { Card } from '@easydesign/design-system';
import { Badge } from '@easydesign/design-system';
import { SearchBar } from '@easydesign/design-system';
import { layout } from '@easydesign/design-system/foundation';
import type { InvoiceLineItemInput } from '@/src/types/invoice';
import { SkeletonBlock } from '@easydesign/design-system';
import type { InventoryItem } from '@/src/types/inventory';
import { withOpacity } from '@easydesign/design-system/foundation';
import { OPACITY_TINT_SOFT, SIZE_DROPDOWN_MAX_HEIGHT } from '@easydesign/design-system/foundation';
import { SPACING_PX } from '@easydesign/design-system/foundation';

const FIELD_MIN_WIDTH_PX = 150;

interface Props {
	lineItems: InvoiceLineItemInput[];
	removeLineItem: (index: number) => void;
	isAddingItem: boolean;
	setIsAddingItem: (v: boolean) => void;
	inventoryItems: InventoryItem[];
	inventoryLoading: boolean;
	searchQuery: string;
	setSearchQuery: (q: string) => void;
	selectedItem: InventoryItem | null;
	selectInventoryItem: (item: InventoryItem) => void;
	cancelItemSelection: () => void;
	inputQuantity: string;
	setInputQuantity: (v: string) => void;
	inputDiscount: string;
	setInputDiscount: (v: string) => void;
	addLineItem: () => void;
}

export function LineItemsStep({
	lineItems,
	removeLineItem,
	isAddingItem,
	setIsAddingItem,
	inventoryItems,
	inventoryLoading,
	searchQuery,
	setSearchQuery,
	selectedItem,
	selectInventoryItem,
	cancelItemSelection,
	inputQuantity,
	setInputQuantity,
	inputDiscount,
	setInputDiscount,
	addLineItem,
}: Props) {
	const { c, s, r } = useThemeTokens();
	const { t, formatCurrency } = useLocale();
	const subtotal = lineItems.reduce((acc, item) => {
		const lineSubtotal = item.quantity * item.rate_per_unit - (item.discount || 0);
		return acc + lineSubtotal;
	}, 0);
	const gst = lineItems.reduce((acc, item) => {
		const lineSubtotal = item.quantity * item.rate_per_unit - (item.discount || 0);
		return acc + lineSubtotal * (item.gst_rate / 100);
	}, 0);
	const grandTotal = subtotal + gst;

	return (
		<View>
			<View style={[layout.rowBetween, { marginBottom: s.md, gap: s.md }]}>
				<ThemedText variant="h3">{t('invoice.lineItems')}</ThemedText>
				<Button
					title={t('invoice.add')}
					accessibilityLabel="add-item-button"
					onPress={() => setIsAddingItem(true)}
					size="sm"
				/>
			</View>

			{lineItems.length === 0 ? (
				<Card
					variant="outlined"
					padding="lg"
					style={{
						alignItems: 'center',
						backgroundColor: c.surface,
					}}
				>
					<ThemedText variant="caption" color={c.placeholder} align="center">
						{t('invoice.noItems')}
					</ThemedText>
				</Card>
			) : (
				<Card variant="outlined" padding="none" style={{ backgroundColor: c.surface }}>
					{lineItems.map((item, index) => (
						<View
							key={item.item_id ?? `${item.design_name}-${index}`}
							style={{
								paddingHorizontal: s.lg,
								paddingVertical: s.md,
								borderBottomWidth: index === lineItems.length - 1 ? 0 : 1,
								borderBottomColor: c.border,
							}}
						>
							<View
								style={[layout.rowBetween, { alignItems: 'flex-start', gap: s.md }]}
							>
								<View style={{ flex: 1 }}>
									<ThemedText weight="semibold">{item.design_name}</ThemedText>
									<View
										style={{
											flexDirection: 'row',
											flexWrap: 'wrap',
											gap: s.xs,
											marginTop: SPACING_PX.xs,
										}}
									>
										<Badge
											label={`GST ${item.gst_rate}%`}
											variant="neutral"
											size="sm"
										/>
										<Badge
											label={`${item.quantity} ${t('invoice.itemPlural')}`}
											variant="neutral"
											size="sm"
										/>
									</View>
								</View>
								<ThemedText weight="bold" color={c.primary}>
									{formatCurrency(item.quantity * item.rate_per_unit)}
								</ThemedText>
							</View>
							<View
								style={[
									layout.rowBetween,
									{
										alignItems: 'center',
										marginTop: s.sm,
										gap: s.md,
									},
								]}
							>
								<View style={{ flex: 1 }}>
									<ThemedText variant="caption" color={c.onSurfaceVariant}>
										{item.quantity}{' '}
										{t('invoice.unitsAt', {
											price: formatCurrency(item.rate_per_unit),
										})}
									</ThemedText>
									{!!item.discount && item.discount > 0 && (
										<ThemedText
											variant="caption"
											color={c.error}
											style={{ marginTop: SPACING_PX.xxs }}
										>
											{t('invoice.discountAmount')}:{' '}
											{formatCurrency(item.discount)}
										</ThemedText>
									)}
								</View>
								<TouchableOpacity
									onPress={() => removeLineItem(index)}
									accessibilityRole="button"
									accessibilityLabel={`remove-line-item-${index}`}
									accessibilityHint={t('invoice.removeHint', {
										name: item.design_name,
									})}
									style={{
										paddingHorizontal: s.sm,
										paddingVertical: SPACING_PX.xxs,
										borderRadius: r.sm,
										backgroundColor: c.surfaceVariant,
									}}
								>
									<ThemedText variant="caption" color={c.error}>
										{t('invoice.remove')}
									</ThemedText>
								</TouchableOpacity>
							</View>
						</View>
					))}
				</Card>
			)}

			{lineItems.length > 0 ? (
				<Card
					variant="outlined"
					padding="md"
					style={{ marginTop: s.md, backgroundColor: c.surface }}
				>
					<View style={[layout.rowBetween, { marginBottom: SPACING_PX.xs }]}>
						<ThemedText variant="caption" color={c.onSurfaceVariant}>
							{t('invoice.subtotal')}
						</ThemedText>
						<ThemedText variant="caption" color={c.onSurfaceVariant}>
							{formatCurrency(subtotal)}
						</ThemedText>
					</View>
					<View style={[layout.rowBetween, { marginBottom: SPACING_PX.sm }]}>
						<ThemedText variant="caption" color={c.onSurfaceVariant}>
							GST
						</ThemedText>
						<ThemedText variant="caption" color={c.onSurfaceVariant}>
							{formatCurrency(gst)}
						</ThemedText>
					</View>
					<View
						style={{
							height: 1,
							backgroundColor: c.border,
							marginBottom: s.sm,
						}}
					/>
					<View style={layout.rowBetween}>
						<ThemedText weight="semibold">
							{lineItems.length}{' '}
							{lineItems.length === 1
								? t('invoice.itemSingular')
								: t('invoice.itemPlural')}
						</ThemedText>
						<ThemedText variant="h3" color={c.primary}>
							{formatCurrency(grandTotal)}
						</ThemedText>
					</View>
				</Card>
			) : null}

			{isAddingItem && (
				<Card
					variant="outlined"
					padding="md"
					style={{
						marginTop: s.xl,
						backgroundColor: withOpacity(c.surfaceVariant, OPACITY_TINT_SOFT),
					}}
				>
					<View style={[layout.rowBetween, { marginBottom: s.sm, gap: s.md }]}>
						<View style={{ flex: 1 }}>
							<ThemedText weight="bold">
								{t('invoice.selectFromInventory')}
							</ThemedText>
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={{ marginTop: SPACING_PX.xxs }}
							>
								{selectedItem
									? t('invoice.availableStock', {
											count: selectedItem.box_count,
										})
									: `${inventoryItems.length} ${
											inventoryItems.length === 1
												? t('invoice.itemSingular')
												: t('invoice.itemPlural')
										}`}
							</ThemedText>
						</View>
						{inventoryLoading && (
							<SkeletonBlock width={20} height={20} borderRadius={10} />
						)}
					</View>

					{!selectedItem ? (
						<>
							<SearchBar
								accessibilityLabel="inventory-search-input"
								accessibilityHint={t('scanner.searchHint')}
								placeholder={t('invoice.searchDesign')}
								value={searchQuery}
								onChangeText={setSearchQuery}
								style={{ marginBottom: s.md }}
							/>
							<View
								style={{
									maxHeight: SIZE_DROPDOWN_MAX_HEIGHT,
									borderWidth: 1,
									borderColor: c.border,
									borderRadius: r.md,
									overflow: 'hidden',
									backgroundColor: c.surface,
								}}
							>
								<ScrollView accessibilityRole="list">
									{inventoryItems.length === 0 && !inventoryLoading ? (
										<ThemedText
											variant="caption"
											color={c.placeholder}
											align="center"
											style={{ padding: s.md }}
										>
											{t('invoice.noResults')}
										</ThemedText>
									) : (
										inventoryItems.map((item, index) => (
											<TouchableOpacity
												key={item.id}
												style={{
													paddingHorizontal: s.md,
													paddingVertical: s.sm,
													borderBottomWidth:
														index === inventoryItems.length - 1 ? 0 : 1,
													borderBottomColor: c.border,
												}}
												onPress={() => selectInventoryItem(item)}
												accessibilityRole="button"
												accessibilityLabel={item.design_name}
											>
												<View
													style={[
														layout.rowBetween,
														{ alignItems: 'flex-start', gap: s.md },
													]}
												>
													<View style={{ flex: 1 }}>
														<ThemedText>{item.design_name}</ThemedText>
														<ThemedText
															variant="caption"
															color={c.onSurfaceVariant}
															style={{ marginTop: SPACING_PX.xxs }}
														>
															{t('inventory.stockStatus', {
																count: item.box_count,
															})}{' '}
															• {t('common.price')}:{' '}
															{formatCurrency(item.selling_price)}
														</ThemedText>
													</View>
													<Badge
														label={
															item.category ?? item.base_item_number
														}
														variant="neutral"
														size="sm"
													/>
												</View>
											</TouchableOpacity>
										))
									)}
								</ScrollView>
							</View>
							<Button
								title={t('common.done')}
								onPress={() => setIsAddingItem(false)}
								tone="neutral"
								emphasis="medium"
								style={{ marginTop: s.md }}
							/>
						</>
					) : (
						<View>
							<Card
								variant="flat"
								padding="md"
								style={{ marginBottom: s.md, backgroundColor: c.surface }}
							>
								<View
									style={[
										layout.rowBetween,
										{ alignItems: 'flex-start', gap: s.md },
									]}
								>
									<View style={{ flex: 1 }}>
										<ThemedText variant="h3">
											{selectedItem.design_name}
										</ThemedText>
										<ThemedText
											variant="body"
											color={c.onSurfaceVariant}
											style={{ marginTop: SPACING_PX.xxs }}
										>
											{t('invoice.availableStock', {
												count: selectedItem.box_count,
											})}
										</ThemedText>
									</View>
									<Badge
										label={formatCurrency(selectedItem.selling_price)}
										variant="neutral"
										size="sm"
									/>
								</View>
							</Card>
							<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.sm }}>
								<View style={{ flex: 1, minWidth: FIELD_MIN_WIDTH_PX }}>
									<FormField
										label={t('inventory.quantity')}
										accessibilityLabel="item-quantity-input"
										value={inputQuantity}
										placeholder={t('invoice.placeholders.enterQuantity')}
										keyboardType="numeric"
										onChangeText={setInputQuantity}
										error={
											parseInt(inputQuantity) > selectedItem.box_count
												? t('invoice.exceedsStock', {
														count: selectedItem.box_count,
													})
												: undefined
										}
									/>
								</View>
								<View style={{ flex: 1, minWidth: FIELD_MIN_WIDTH_PX }}>
									<FormField
										label={t('invoice.discountTotal')}
										accessibilityLabel="item-discount-input"
										value={inputDiscount}
										placeholder={t('invoice.placeholders.enterDiscount')}
										keyboardType="numeric"
										onChangeText={setInputDiscount}
									/>
								</View>
							</View>
							<View style={{ flexDirection: 'row', gap: s.sm, marginTop: s.md }}>
								<Button
									title={t('common.cancel')}
									accessibilityLabel="cancel-add-item"
									onPress={cancelItemSelection}
									tone="neutral"
									emphasis="medium"
									style={{ flex: 1 }}
								/>
								<Button
									title={t('common.confirm')}
									accessibilityLabel="confirm-add-item"
									onPress={addLineItem}
									style={{ flex: 1 }}
								/>
							</View>
						</View>
					)}
				</Card>
			)}
		</View>
	);
}
