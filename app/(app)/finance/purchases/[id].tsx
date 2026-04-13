import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Alert, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { OPACITY_TINT_LIGHT, Z_INDEX } from '@/theme/uiMetrics';

/** Minimum width of the kebab-menu dropdown */
const KEBAB_MENU_MIN_WIDTH = 140;
import type { Href } from 'expo-router';
import {
	Trash2,
	Share2,
	Pencil,
	MoreVertical,
	Phone,
	User,
	Calendar,
	Plus,
} from 'lucide-react-native';
import { supabase } from '@/src/config/supabase';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { withOpacity } from '@/src/utils/color';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { Badge } from '@/src/components/atoms/Badge';
import { Divider } from '@/src/components/atoms/Divider';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { SkeletonBlock } from '@/src/components/molecules/SkeletonBlock';
import type { Purchase, PurchaseLineItem, Payment } from '@/src/types/finance';
import type { UUID } from '@/src/types/common';
import type { ThemeColors } from '@/src/theme';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

const PURCHASE_DETAIL_SCROLL_BOTTOM_PADDING = 100;
const PURCHASE_KEBAB_TOP_OFFSET = 56;
const PURCHASE_KEBAB_ELEVATION = 8;

type PurchaseWithDetails = Purchase & {
	suppliers?: { name: string; phone?: string } | null;
	purchase_line_items?: PurchaseLineItem[];
};

type PaymentWithParty = Payment & {
	customer?: { name: string };
	supplier?: { name: string };
};

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

	const [purchase, setPurchase] = useState<PurchaseWithDetails | null>(null);
	const [payments, setPayments] = useState<PaymentWithParty[]>([]);
	const [loading, setLoading] = useState(true);
	const [showKebab, setShowKebab] = useState(false);

	const loadData = useCallback(async () => {
		if (!id) return;
		setLoading(true);
		try {
			const [purchaseRes, paymentsRes] = await Promise.all([
				supabase
					.from('purchases')
					.select('*, suppliers(name, phone), purchase_line_items(*)')
					.eq('id', id)
					.single(),
				supabase
					.from('payments')
					.select('*')
					.eq('purchase_id', id)
					.order('payment_date', { ascending: false }),
			]);

			if (purchaseRes.error) throw purchaseRes.error;
			setPurchase(purchaseRes.data as PurchaseWithDetails);

			if (!paymentsRes.error) {
				setPayments((paymentsRes.data as PaymentWithParty[]) ?? []);
			}
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
							const { error } = await supabase
								.from('purchases')
								.delete()
								.eq('id', id);
							if (error) throw error;
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

	const handleShare = () => {
		if (!purchase) return;
		// Share basic purchase summary as text
		Alert.alert('Share', 'PDF sharing coming soon.');
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
		<Screen safeAreaEdges={['bottom']} withKeyboard={false}>
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

			{/* Kebab menu */}
			{showKebab && (
				<View
					style={[
						styles.kebabMenu,
						{
							backgroundColor: c.card ?? c.surface,
							borderColor: c.border,
							borderRadius: r.md,
							right: s.md,
							top: 0,
							...(theme.shadows.lg as object),
						},
					]}
				>
					<Pressable
						style={[styles.kebabItem, { borderBottomColor: c.border }]}
						onPress={() => {
							setShowKebab(false);
							Alert.alert('Edit', 'Edit functionality coming soon.');
						}}
					>
						<Pencil size={16} color={c.onSurface} />
						<ThemedText style={{ marginLeft: SPACING_PX.sm }}>Edit</ThemedText>
					</Pressable>
					<Pressable style={styles.kebabItem} onPress={handleDelete}>
						<Trash2 size={16} color={c.error} />
						<ThemedText style={{ marginLeft: SPACING_PX.sm }} color={c.error}>
							Delete
						</ThemedText>
					</Pressable>
				</View>
			)}

			{/* Tap outside to close kebab */}
			{showKebab && (
				<Pressable style={StyleSheet.absoluteFill} onPress={() => setShowKebab(false)} />
			)}

			<ScrollView
				contentContainerStyle={[
					styles.scroll,
					{ padding: s.md, paddingBottom: PURCHASE_DETAIL_SCROLL_BOTTOM_PADDING },
				]}
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
						<ThemedText
							variant="h2"
							color={statusTextColor(purchase.payment_status, c)}
						>
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
					<View
						style={[
							styles.sectionHeader,
							{
								borderBottomColor: c.border,
								paddingHorizontal: s.md,
								paddingVertical: s.sm,
							},
						]}
					>
						<ThemedText variant="label" color={c.onSurfaceVariant}>
							Purchase Info
						</ThemedText>
					</View>
					<View style={{ padding: s.md, gap: s.sm }}>
						{!!purchase.purchase_number && (
							<View style={styles.detailRow}>
								<ThemedText color={c.onSurfaceVariant}>Bill No.</ThemedText>
								<ThemedText variant="bodyBold">
									{purchase.purchase_number}
								</ThemedText>
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
							style={[
								styles.sectionHeader,
								{
									borderBottomColor: c.border,
									paddingHorizontal: s.md,
									paddingVertical: s.sm,
								},
							]}
						>
							<ThemedText
								variant="label"
								color={c.onSurfaceVariant}
								style={{ flex: 2 }}
							>
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
						<View
							style={[
								styles.sectionHeader,
								{
									borderBottomColor: c.border,
									paddingHorizontal: s.md,
									paddingVertical: s.sm,
								},
							]}
						>
							<ThemedText variant="label" color={c.onSurfaceVariant}>
								Summary
							</ThemedText>
						</View>
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
					<View
						style={[
							styles.sectionHeader,
							{
								borderBottomColor: c.border,
								paddingHorizontal: s.md,
								paddingVertical: s.sm,
							},
						]}
					>
						<ThemedText variant="label" color={c.onSurfaceVariant} style={{ flex: 1 }}>
							Payment History
						</ThemedText>
						{balanceDue > 0 && (
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
						)}
					</View>
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
											<ThemedText
												variant="caption"
												color={c.onSurfaceVariant}
											>
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
			</ScrollView>

			{/* Sticky bottom bar */}
			{balanceDue > 0 && (
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
			)}
		</Screen>
	);
}

const styles = StyleSheet.create({
	scroll: {},
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
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
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
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
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
