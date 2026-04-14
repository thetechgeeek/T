import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import {
	Banknote,
	Smartphone,
	Building2,
	Coins,
	CreditCard,
	Trash2,
	ReceiptText,
	ArrowDownLeft,
	ArrowUpRight,
} from 'lucide-react-native';
import { paymentService } from '@/src/services/paymentService';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { Badge } from '@/src/components/atoms/Badge';
import { Divider } from '@/src/components/atoms/Divider';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { SectionHeader } from '@/src/components/molecules/SectionHeader';
import { SkeletonBlock } from '@/src/components/molecules/SkeletonBlock';
import type { Payment } from '@/src/types/finance';
import type { UUID } from '@/src/types/common';
import { withOpacity } from '@/src/utils/color';
import { OPACITY_TINT_LIGHT } from '@/theme/uiMetrics';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

const ID_TAIL_DIGITS = 6;

type PaymentWithParty = Payment & {
	customer?: { name: string };
	supplier?: { name: string };
};

function getModeIcon(mode: string, color: string) {
	const size = 20;
	switch (mode) {
		case 'cash':
			return <Banknote size={size} color={color} />;
		case 'upi':
			return <Smartphone size={size} color={color} />;
		case 'bank_transfer':
			return <Building2 size={size} color={color} />;
		case 'cheque':
			return <Coins size={size} color={color} />;
		default:
			return <CreditCard size={size} color={color} />;
	}
}

function formatMode(mode: string): string {
	return mode.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function padId(id: string): string {
	const numeric = id.replace(/\D/g, '').slice(-ID_TAIL_DIGITS);
	return numeric.padStart(ID_TAIL_DIGITS, '0');
}

export default function PaymentDetailScreen() {
	const { id } = useLocalSearchParams<{ id: UUID }>();
	const router = useRouter();
	const { c, s, r, theme } = useThemeTokens();
	const { formatCurrency, formatDate } = useLocale();

	const [payment, setPayment] = useState<PaymentWithParty | null>(null);
	const [loading, setLoading] = useState(true);
	const [, setDeleting] = useState(false);

	const loadPayment = useCallback(() => {
		if (!id) return;
		setLoading(true);
		paymentService
			.fetchPayments({})
			.then((all) => {
				const found = (all ?? []).find((p) => p.id === id);
				setPayment(found ? (found as PaymentWithParty) : null);
			})
			.catch(() => setPayment(null))
			.finally(() => setLoading(false));
	}, [id]);

	useEffect(() => {
		loadPayment();
	}, [loadPayment]);

	const handleDelete = () => {
		Alert.alert(
			'Delete Payment?',
			'Deleting this payment will revert any associated invoice status. This cannot be undone.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: async () => {
						setDeleting(true);
						try {
							// NOTE: paymentRepository.delete would be used here when exposed
							// For now show a not-implemented alert
							Alert.alert(
								'Not Available',
								'Payment deletion is not yet supported. Please contact support.',
							);
						} finally {
							setDeleting(false);
						}
					},
				},
			],
		);
	};

	const handleViewReceipt = () => {
		router.push(`/(app)/finance/payments/${id}/receipt` as Href);
	};

	if (loading) {
		return (
			<Screen safeAreaEdges={['bottom']} withKeyboard={false}>
				<ScreenHeader title="Payment Details" />
				<View style={{ padding: s.md, gap: s.sm }}>
					<SkeletonBlock height={120} borderRadius={12} />
					<SkeletonBlock height={80} borderRadius={8} />
					<SkeletonBlock height={80} borderRadius={8} />
				</View>
			</Screen>
		);
	}

	if (!payment) {
		return (
			<Screen safeAreaEdges={['bottom']} withKeyboard={false}>
				<ScreenHeader title="Payment Details" />
				<View style={styles.center}>
					<ThemedText color={c.error}>Payment not found.</ThemedText>
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

	const isReceived = payment.direction === 'received';
	const partyName = isReceived
		? (payment.customer?.name ?? 'Customer')
		: (payment.supplier?.name ?? 'Supplier');
	const amountColor = isReceived ? c.success : c.error;
	const directionLabel = isReceived ? 'Payment Received' : 'Payment Made';
	const receiptNumber = `REC-${padId(id)}`;

	// Linked invoice section — the payment may have invoice_id
	const hasLinkedInvoice = !!payment.invoice_id;
	const hasLinkedPurchase = !!payment.purchase_id;
	const isAdvance = !hasLinkedInvoice && !hasLinkedPurchase;

	return (
		<Screen
			safeAreaEdges={['bottom']}
			withKeyboard={false}
			scrollable
			header={
				<ScreenHeader
					title={receiptNumber}
					rightElement={
						<Pressable
							onPress={handleDelete}
							style={{ padding: SPACING_PX.sm }}
							accessibilityLabel="Delete payment"
						>
							<Trash2 size={20} color={c.error} />
						</Pressable>
					}
				/>
			}
			contentContainerStyle={{ padding: s.md }}
			footer={
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
						title="View Receipt"
						variant="outline"
						leftIcon={<ReceiptText size={18} color={c.primary} />}
						onPress={handleViewReceipt}
						style={{ flex: 1 }}
						accessibilityLabel="view-receipt"
					/>
				</View>
			}
		>
			{/* Direction badge */}
			<View style={styles.directionRow}>
				{isReceived ? (
					<ArrowDownLeft size={20} color={c.success} />
				) : (
					<ArrowUpRight size={20} color={c.error} />
				)}
				<ThemedText
					variant="captionBold"
					color={amountColor}
					style={{ marginLeft: SPACING_PX.xs }}
				>
					{directionLabel}
				</ThemedText>
			</View>

			{/* Amount Hero */}
			<View
				style={[
					styles.amountCard,
					{
						backgroundColor: isReceived
							? (c.successLight ?? withOpacity(c.success, OPACITY_TINT_LIGHT))
							: (c.errorLight ?? withOpacity(c.error, OPACITY_TINT_LIGHT)),
						borderRadius: r.lg,
						marginBottom: s.md,
					},
				]}
			>
				<ThemedText variant="display" color={amountColor} style={styles.centered}>
					{isReceived ? '+' : '-'}
					{formatCurrency(payment.amount)}
				</ThemedText>
				<ThemedText
					variant="caption"
					color={c.onSurfaceVariant}
					style={[styles.centered, { marginTop: SPACING_PX.xs }]}
				>
					{formatDate(payment.payment_date)}
				</ThemedText>
			</View>

			{/* Details Card */}
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
					title="Details"
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
						<ThemedText color={c.onSurfaceVariant}>
							{isReceived ? 'Received from' : 'Paid to'}
						</ThemedText>
						<ThemedText variant="bodyBold">{partyName}</ThemedText>
					</View>
					<Divider />
					<View style={styles.detailRow}>
						<ThemedText color={c.onSurfaceVariant}>Date</ThemedText>
						<ThemedText>{formatDate(payment.payment_date)}</ThemedText>
					</View>
					<Divider />
					<View style={styles.detailRow}>
						<ThemedText color={c.onSurfaceVariant}>Mode</ThemedText>
						<View style={styles.modeRow}>
							{getModeIcon(payment.payment_mode, c.onSurfaceVariant)}
							<ThemedText style={{ marginLeft: SPACING_PX.xs + SPACING_PX.xxs }}>
								{formatMode(payment.payment_mode)}
							</ThemedText>
						</View>
					</View>
					{!!payment.notes && (
						<>
							<Divider />
							<View style={styles.detailRow}>
								<ThemedText color={c.onSurfaceVariant}>Reference</ThemedText>
								<ThemedText>{payment.notes}</ThemedText>
							</View>
						</>
					)}
				</View>
			</View>

			{/* Allocation Section */}
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
					title="Allocated to"
					titleColor={c.onSurfaceVariant}
					style={{
						borderBottomColor: c.border,
						borderBottomWidth: StyleSheet.hairlineWidth,
						paddingHorizontal: s.md,
						paddingVertical: s.sm,
					}}
				/>
				<View style={{ padding: s.md }}>
					{isAdvance ? (
						<View style={styles.advanceRow}>
							<Badge label="ADVANCE" variant="warning" />
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={{ marginTop: SPACING_PX.xs + SPACING_PX.xxs }}
							>
								This payment is not linked to any invoice. It will be applied as
								advance credit.
							</ThemedText>
						</View>
					) : hasLinkedInvoice ? (
						<View style={styles.detailRow}>
							<ThemedText color={c.onSurfaceVariant}>Invoice</ThemedText>
							<Pressable
								onPress={() =>
									router.push(`/(app)/invoices/${payment.invoice_id}` as Href)
								}
							>
								<ThemedText color={c.primary} variant="bodyBold">
									View Invoice →
								</ThemedText>
							</Pressable>
						</View>
					) : hasLinkedPurchase ? (
						<View style={styles.detailRow}>
							<ThemedText color={c.onSurfaceVariant}>Purchase Bill</ThemedText>
							<Pressable
								onPress={() =>
									router.push(
										`/(app)/finance/purchases/${payment.purchase_id}` as Href,
									)
								}
							>
								<ThemedText color={c.primary} variant="bodyBold">
									View Purchase →
								</ThemedText>
							</Pressable>
						</View>
					) : null}
				</View>
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	centered: { textAlign: 'center' },
	directionRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: SPACING_PX.sm,
	},
	amountCard: {
		padding: SPACING_PX.xl,
		alignItems: 'center',
	},
	section: { overflow: 'hidden' },
	detailRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	modeRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	advanceRow: {
		gap: SPACING_PX.xs + SPACING_PX.xxs,
	},
	actionBar: {
		flexDirection: 'row',
		gap: SPACING_PX.sm,
		borderTopWidth: StyleSheet.hairlineWidth,
	},
});
