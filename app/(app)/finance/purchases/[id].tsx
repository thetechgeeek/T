import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Alert, Pressable, Platform, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { OPACITY_TINT_LIGHT, Z_INDEX } from '@easydesign/design-system/foundation';
import type { Href } from 'expo-router';
import { Trash2, Share2, MoreVertical, Phone, User, Calendar, Plus } from 'lucide-react-native';
import {
	financeService,
	type PurchaseDetail,
	type PurchasePayment,
} from '@/src/services/financeService';
import type { PurchaseLineItem } from '@/src/types/finance';
import { useThemeTokens } from '@easydesign/design-system/foundation';
import { useLocale } from '@/src/hooks/useLocale';
import { withOpacity } from '@easydesign/design-system/foundation';
import { Screen } from '@easydesign/design-system';
import { ThemedText } from '@easydesign/design-system';
import { Button } from '@easydesign/design-system';
import { Badge } from '@easydesign/design-system';
import { Divider } from '@easydesign/design-system';
import { ScreenHeader } from '@easydesign/ui-shell';
import { SectionHeader } from '@easydesign/design-system';
import { SkeletonBlock } from '@easydesign/design-system';
import type { UUID } from '@/src/types/common';
import type { ThemeColors } from '@/src/theme';
import { SPACING_PX } from '@easydesign/design-system/foundation';

/** Minimum width of the kebab-menu dropdown */
const KEBAB_MENU_MIN_WIDTH = 140;
const PURCHASE_KEBAB_TOP_OFFSET = 56;
const PURCHASE_KEBAB_ELEVATION = 8;

function statusVariant(status: string): 'success' | 'warning' | 'error' | 'default' {
	if (status === 'paid') return 'success';
	if (status === 'partial') return 'warning';
	return 'error';
}

function statusLabel(status: string): string {
	if (status === 'paid') return 'PAID';
	if (status === 'partial') return 'PARTIAL';
	return 'UNPAID';
}

function statusBannerColor(status: string, c: ThemeColors): string {
	if (status === 'paid') return c.successLight ?? withOpacity(c.success, OPACITY_TINT_LIGHT);
	if (status === 'partial') return c.warningLight ?? withOpacity(c.warning, OPACITY_TINT_LIGHT);
	return c.errorLight ?? withOpacity(c.error, OPACITY_TINT_LIGHT);
}

function statusTextColor(status: string, c: ThemeColors): string {
	if (status === 'paid') return c.success;
	if (status === 'partial') return c.warning;
	return c.error;
}

export default function PurchaseBillDetailScreen() {
	const { id } = useLocalSearchParams<{ id: UUID }>();
	const router = useRouter();
	const { c, s, r, theme } = useThemeTokens();
	const { formatCurrency, formatDate } = useLocale();

	const [purchase, setPurchase] = useState<PurchaseDetail | null>(null);
	const [payments, setPayments] = useState<PurchasePayment[]>([]);
	const [loading, setLoading] = useState(true);
	const [showKebab, setShowKebab] = useState(false);

	const loadData = useCallback(async () => {
		if (!id) return;
		setLoading(true);
		try {
			const result = await financeService.fetchPurchaseDetailScreenData(id);
			setPurchase(result.purchase);
			setPayments(result.payments);
		} catch {
			setPurchase(null);
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const handleDelete = () => {
		setShowKebab(false);
		Alert.alert(
			'Delete Purchase Bill?',
			'This will permanently delete this purchase record. This action cannot be undone.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: async () => {
						try {
							await financeService.deletePurchase(id);
							router.back();
						} catch (err: unknown) {
							Alert.alert(
								'Error',
								err instanceof Error ? err.message : 'Failed to delete purchase.',
							);
						}
					},
				},
			],
		);
	};

	const handleShare = async () => {
		if (!purchase) return;
		await Share.share({
			message: [
				`Purchase: ${purchase.purchase_number ?? purchase.id}`,
				`Supplier: ${purchase.suppliers?.name ?? purchase.supplier_name ?? 'Supplier'}`,
				`Date: ${purchase.purchase_date}`,
				`Total: ${formatCurrency(purchase.grand_total ?? 0)}`,
				`Paid: ${formatCurrency(purchase.amount_paid ?? 0)}`,
			].join('\n'),
		});
	};

	const handleRecordPayment = () => {
		router.push('/(app)/finance/payments/make' as Href);
	};

	if (loading) {
		return (
			<Screen safeAreaEdges={['bottom']} withKeyboard={false}>
				<ScreenHeader title="Purchase Bill" />
				<View style={{ padding: s.md, gap: s.sm }}>
					<SkeletonBlock height={80} borderRadius={8} />
					<SkeletonBlock height={120} borderRadius={12} />
					<SkeletonBlock height={160} borderRadius={12} />
					<SkeletonBlock height={100} borderRadius={8} />
				</View>
			</Screen>
		);
	}

	if (!purchase) {
		return (
			<Screen safeAreaEdges={['bottom']} withKeyboard={false}>
				<ScreenHeader title="Purchase Bill" />
				<View style={styles.center}>
					<ThemedText color={c.error}>Purchase bill not found.</ThemedText>
					<Button
						title="Go Back"
						variant="ghost"
						onPress={() => router.back()}
						style={{ marginTop: s.md }}
					/>
				</View>
			</Screen>
		);
	}

	const balanceDue = (purchase.grand_total ?? 0) - (purchase.amount_paid ?? 0);
	const lineItems: PurchaseLineItem[] = purchase.purchase_line_items ?? [];
	const supplierName = purchase.suppliers?.name ?? purchase.supplier_name ?? 'Supplier';
	const supplierPhone = purchase.suppliers?.phone;

	return (
		<Screen
			safeAreaEdges={['bottom']}
			withKeyboard={false}
			scrollable
			header={
				<ScreenHeader
					title={purchase.purchase_number ?? 'Purchase Bill'}
					rightElement={
						<View style={styles.headerActions}>
							<Pressable
								onPress={handleShare}
								style={{ padding: SPACING_PX.sm }}
								accessibilityLabel="Share purchase"
							>
								<Share2 size={20} color={c.onSurfaceVariant} />
							</Pressable>
							<Pressable
								onPress={() => setShowKebab((v) => !v)}
								style={{ padding: SPACING_PX.sm }}
								accessibilityLabel="More options"
							>
								<MoreVertical size={20} color={c.onSurfaceVariant} />
							</Pressable>
						</View>
					}
				/>
			}
			contentContainerStyle={{ padding: s.md }}
			footer={
				balanceDue > 0 ? (
					<View
						style={[
							styles.actionBar,
							{
								backgroundColor: c.background,
								borderTopColor: c.border,
								paddingHorizontal: s.md,
								paddingTop: s.sm,
								paddingBottom: Platform.OS === 'ios' ? s.lg : s.md,
							},
						]}
					>
						<Button
							title="Record Payment"
							onPress={handleRecordPayment}
							accessibilityLabel="record-payment"
						/>
					</View>
				) : null
			}
			overlay={
				showKebab ? (
					<>
						<Pressable
							style={StyleSheet.absoluteFill}
							onPress={() => setShowKebab(false)}
						/>
						<View
							style={[
								styles.kebabMenu,
								{
									backgroundColor: c.card ?? c.surface,
									borderColor: c.border,
									borderRadius: r.md,
									right: s.md,
									...(theme.shadows.lg as object),
								},
							]}
						>
							<Pressable style={styles.kebabItem} onPress={handleDelete}>
								<Trash2 size={16} color={c.error} />
								<ThemedText style={{ marginLeft: SPACING_PX.sm }} color={c.error}>
									Delete
								</ThemedText>
							</Pressable>
						</View>
					</>
				) : null
			}
		>
			{/* Status Banner */}
			<View
				style={[
					styles.statusBanner,
					{
						backgroundColor: statusBannerColor(purchase.payment_status, c),
						borderRadius: r.md,
						marginBottom: s.md,
						padding: s.md,
					},
				]}
			>
				<View style={styles.statusRow}>
					<Badge
						label={statusLabel(purchase.payment_status)}
						variant={statusVariant(purchase.payment_status)}
					/>
					<ThemedText variant="h2" color={statusTextColor(purchase.payment_status, c)}>
						{formatCurrency(purchase.grand_total ?? 0)}
					</ThemedText>
				</View>
				{balanceDue > 0 && (
					<ThemedText
						variant="caption"
						color={c.error}
						style={{ marginTop: SPACING_PX.xs }}
					>
						Balance Due: {formatCurrency(balanceDue)}
					</ThemedText>
				)}
			</View>

			{/* Purchase Header */}
			<View
				style={[
					styles.section,
					{
						backgroundColor: c.card ?? c.surface,
						borderRadius: r.md,
						marginBottom: s.md,
						...(theme.shadows.sm as object),
					},
				]}
			>
				<SectionHeader
					title="Purchase Info"
					titleColor={c.onSurfaceVariant}
					style={{
						borderBottomColor: c.border,
						borderBottomWidth: StyleSheet.hairlineWidth,
						paddingHorizontal: s.md,
						paddingVertical: s.sm,
					}}
				/>
				<View style={{ padding: s.md, gap: s.sm }}>
					{!!purchase.purchase_number && (
						<View style={styles.detailRow}>
							<ThemedText color={c.onSurfaceVariant}>Bill No.</ThemedText>
							<ThemedText variant="bodyBold">{purchase.purchase_number}</ThemedText>
						</View>
					)}
					<Divider />
					<View style={styles.detailRow}>
						<View style={styles.iconRow}>
							<Calendar size={14} color={c.onSurfaceVariant} />
							<ThemedText
								color={c.onSurfaceVariant}
								style={{ marginLeft: SPACING_PX.xs }}
							>
								Date
							</ThemedText>
						</View>
						<ThemedText>{formatDate(purchase.purchase_date)}</ThemedText>
					</View>
					<Divider />
					<View style={styles.detailRow}>
						<View style={styles.iconRow}>
							<User size={14} color={c.onSurfaceVariant} />
							<ThemedText
								color={c.onSurfaceVariant}
								style={{ marginLeft: SPACING_PX.xs }}
							>
								Supplier
							</ThemedText>
						</View>
						<ThemedText variant="bodyBold">{supplierName}</ThemedText>
					</View>
					{!!supplierPhone && (
						<>
							<Divider />
							<View style={styles.detailRow}>
								<View style={styles.iconRow}>
									<Phone size={14} color={c.onSurfaceVariant} />
									<ThemedText
										color={c.onSurfaceVariant}
										style={{ marginLeft: SPACING_PX.xs }}
									>
										Phone
									</ThemedText>
								</View>
								<ThemedText>{supplierPhone}</ThemedText>
							</View>
						</>
					)}
					{!!purchase.notes && (
						<>
							<Divider />
							<View style={styles.detailRow}>
								<ThemedText color={c.onSurfaceVariant}>Notes</ThemedText>
								<ThemedText
									style={{
										flex: 1,
										textAlign: 'right',
										marginLeft: SPACING_PX.sm,
									}}
								>
									{purchase.notes}
								</ThemedText>
							</View>
						</>
					)}
				</View>
			</View>

			{/* Line Items */}
			{lineItems.length > 0 && (
				<View
					style={[
						styles.section,
						{
							backgroundColor: c.card ?? c.surface,
							borderRadius: r.md,
							marginBottom: s.md,
							...(theme.shadows.sm as object),
						},
					]}
				>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							borderBottomColor: c.border,
							borderBottomWidth: StyleSheet.hairlineWidth,
							paddingHorizontal: s.md,
							paddingVertical: s.sm,
						}}
					>
						<ThemedText variant="label" color={c.onSurfaceVariant} style={{ flex: 2 }}>
							Item
						</ThemedText>
						<ThemedText
							variant="label"
							color={c.onSurfaceVariant}
							style={styles.colCenter}
						>
							Qty
						</ThemedText>
						<ThemedText
							variant="label"
							color={c.onSurfaceVariant}
							style={styles.colCenter}
						>
							Rate
						</ThemedText>
						<ThemedText
							variant="label"
							color={c.onSurfaceVariant}
							style={styles.colRight}
						>
							Amount
						</ThemedText>
					</View>
					{lineItems.map((li, idx) => (
						<View
							key={li.id}
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								paddingHorizontal: s.md,
								paddingVertical: s.sm,
								borderBottomWidth:
									idx === lineItems.length - 1 ? 0 : StyleSheet.hairlineWidth,
								borderBottomColor: c.border,
							}}
						>
							<ThemedText style={{ flex: 2 }}>{li.design_name}</ThemedText>
							<ThemedText style={styles.colCenter}>{li.quantity}</ThemedText>
							<ThemedText style={styles.colCenter}>
								{formatCurrency(li.rate_per_unit)}
							</ThemedText>
							<ThemedText weight="semibold" style={styles.colRight}>
								{formatCurrency(li.amount)}
							</ThemedText>
						</View>
					))}

					{/* Totals */}
					<View
						style={[
							styles.totalsBlock,
							{
								borderTopColor: c.border,
								padding: s.md,
								gap: s.sm,
							},
						]}
					>
						<View style={styles.detailRow}>
							<ThemedText color={c.onSurfaceVariant}>Subtotal</ThemedText>
							<ThemedText>{formatCurrency(purchase.subtotal ?? 0)}</ThemedText>
						</View>
						<View style={styles.detailRow}>
							<ThemedText color={c.onSurfaceVariant}>GST</ThemedText>
							<ThemedText>{formatCurrency(purchase.tax_total ?? 0)}</ThemedText>
						</View>
						<Divider />
						<View style={styles.detailRow}>
							<ThemedText weight="bold">Grand Total</ThemedText>
							<ThemedText variant="h3" color={c.primary}>
								{formatCurrency(purchase.grand_total ?? 0)}
							</ThemedText>
						</View>
					</View>
				</View>
			)}

			{/* No line items — still show totals */}
			{lineItems.length === 0 && (
				<View
					style={[
						styles.section,
						{
							backgroundColor: c.card ?? c.surface,
							borderRadius: r.md,
							marginBottom: s.md,
							...(theme.shadows.sm as object),
						},
					]}
				>
					<SectionHeader
						title="Summary"
						titleColor={c.onSurfaceVariant}
						style={{
							borderBottomColor: c.border,
							borderBottomWidth: StyleSheet.hairlineWidth,
							paddingHorizontal: s.md,
							paddingVertical: s.sm,
						}}
					/>
					<View style={{ padding: s.md, gap: s.sm }}>
						<View style={styles.detailRow}>
							<ThemedText color={c.onSurfaceVariant}>Subtotal</ThemedText>
							<ThemedText>{formatCurrency(purchase.subtotal ?? 0)}</ThemedText>
						</View>
						<View style={styles.detailRow}>
							<ThemedText color={c.onSurfaceVariant}>GST</ThemedText>
							<ThemedText>{formatCurrency(purchase.tax_total ?? 0)}</ThemedText>
						</View>
						<Divider />
						<View style={styles.detailRow}>
							<ThemedText weight="bold">Grand Total</ThemedText>
							<ThemedText variant="h3" color={c.primary}>
								{formatCurrency(purchase.grand_total ?? 0)}
							</ThemedText>
						</View>
					</View>
				</View>
			)}

			{/* Payment History */}
			<View
				style={[
					styles.section,
					{
						backgroundColor: c.card ?? c.surface,
						borderRadius: r.md,
						marginBottom: s.md,
						...(theme.shadows.sm as object),
					},
				]}
			>
				<SectionHeader
					title="Payment History"
					titleColor={c.onSurfaceVariant}
					action={
						balanceDue > 0 ? (
							<Pressable onPress={handleRecordPayment} style={styles.addPayBtn}>
								<Plus size={14} color={c.primary} />
								<ThemedText
									variant="caption"
									color={c.primary}
									style={{ marginLeft: SPACING_PX.xs }}
								>
									Record
								</ThemedText>
							</Pressable>
						) : null
					}
					style={{
						borderBottomColor: c.border,
						borderBottomWidth: StyleSheet.hairlineWidth,
						paddingHorizontal: s.md,
						paddingVertical: s.sm,
					}}
				/>
				<View style={{ padding: s.md, gap: s.sm }}>
					{payments.length === 0 ? (
						<ThemedText color={c.onSurfaceVariant} style={styles.centered}>
							No payments recorded yet.
						</ThemedText>
					) : (
						payments.map((p, idx) => (
							<View key={p.id}>
								<View style={styles.detailRow}>
									<View>
										<ThemedText variant="bodyBold">
											{formatCurrency(p.amount)}
										</ThemedText>
										<ThemedText variant="caption" color={c.onSurfaceVariant}>
											{formatDate(p.payment_date)} ·{' '}
											{p.payment_mode.replace('_', ' ')}
										</ThemedText>
									</View>
									<Badge label="PAID" variant="success" />
								</View>
								{idx < payments.length - 1 && (
									<Divider style={{ marginTop: s.sm }} />
								)}
							</View>
						))
					)}

					{payments.length > 0 && (
						<>
							<Divider />
							<View style={styles.detailRow}>
								<ThemedText color={c.onSurfaceVariant}>Total Paid</ThemedText>
								<ThemedText color={c.success} weight="semibold">
									{formatCurrency(purchase.amount_paid ?? 0)}
								</ThemedText>
							</View>
							{balanceDue > 0 && (
								<View style={styles.detailRow}>
									<ThemedText color={c.error}>Balance Due</ThemedText>
									<ThemedText color={c.error} weight="semibold">
										{formatCurrency(balanceDue)}
									</ThemedText>
								</View>
							)}
						</>
					)}
				</View>
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		textAlign: 'center',
	},
	centered: { textAlign: 'center' },
	statusBanner: {},
	statusRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	section: { overflow: 'hidden' },
	detailRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	iconRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	colCenter: { flex: 1, textAlign: 'center' },
	colRight: { flex: 1, textAlign: 'right' },
	totalsBlock: {
		borderTopWidth: StyleSheet.hairlineWidth,
	},
	addPayBtn: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	actionBar: {
		borderTopWidth: StyleSheet.hairlineWidth,
	},
	headerActions: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	kebabMenu: {
		position: 'absolute',
		zIndex: Z_INDEX.overlay,
		top: PURCHASE_KEBAB_TOP_OFFSET,
		minWidth: KEBAB_MENU_MIN_WIDTH,
		borderWidth: 1,
		elevation: PURCHASE_KEBAB_ELEVATION,
	},
	kebabItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: SPACING_PX.lg,
		paddingVertical: SPACING_PX.md,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
});
