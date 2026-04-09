import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Share2 } from 'lucide-react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { pdfService } from '@/src/services/pdfService';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Screen } from '@/src/components/atoms/Screen';
import { Button } from '@/src/components/atoms/Button';
import { Divider } from '@/src/components/atoms/Divider';
import { useLocale } from '@/src/hooks/useLocale';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { InvoiceDetailSkeleton } from '@/src/components/molecules/skeletons/InvoiceDetailSkeleton';
import { layout } from '@/src/theme/layout';
import { PaymentModal } from '@/src/components/organisms/PaymentModal';
import type { UUID } from '@/src/types/common';

export default function InvoiceDetailScreen() {
	const { id } = useLocalSearchParams();
	const router = useRouter();
	const { theme, c, s, r } = useThemeTokens();
	const { t, formatCurrency, formatDateShort } = useLocale();

	const { currentInvoice, fetchInvoiceById, loading, error, clearCurrentInvoice } =
		useInvoiceStore();
	const [sharing, setSharing] = useState(false);
	const [paymentModalVisible, setPaymentModalVisible] = useState(false);

	useEffect(() => {
		if (id) {
			fetchInvoiceById(id as string);
		}
		return () => clearCurrentInvoice();
	}, [id, fetchInvoiceById, clearCurrentInvoice]);

	const handleShare = async () => {
		if (!currentInvoice) return;
		setSharing(true);
		await pdfService.printAndShareInvoice(currentInvoice, t, formatDateShort);
		setSharing(false);
	};

	if (loading) {
		return (
			<Screen safeAreaEdges={['bottom']} withKeyboard={false}>
				<ScreenHeader title="" />
				<InvoiceDetailSkeleton />
			</Screen>
		);
	}

	if (error || !currentInvoice) {
		return (
			<Screen safeAreaEdges={['top', 'bottom']} withKeyboard={false}>
				<View style={styles.center}>
					<ThemedText color={c.error}>{t('invoice.loadError')}</ThemedText>
					<Button
						title={t('common.back')}
						onPress={() => router.back()}
						style={{ marginTop: s.lg }}
					/>
				</View>
			</Screen>
		);
	}

	const balanceDue = currentInvoice.grand_total - currentInvoice.amount_paid;

	return (
		<Screen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader
				title={currentInvoice.invoice_number}
				rightElement={
					<Button
						title={t('invoice.sharePdf')}
						accessibilityLabel="share-pdf-button"
						variant="outline"
						leftIcon={
							<Share2 size={20} color={c.primary} importantForAccessibility="no" />
						}
						onPress={handleShare}
						loading={sharing}
					/>
				}
			/>

			<ScrollView
				contentContainerStyle={{ padding: s.lg, paddingBottom: balanceDue > 0 ? 96 : s.lg }}
			>
				{/* Hero — Balance Due */}
				{balanceDue > 0 && (
					<View
						style={[
							styles.heroCard,
							{
								backgroundColor: c.errorLight,
								borderRadius: r.lg,
								marginBottom: s.lg,
								padding: s.lg,
							},
						]}
					>
						<ThemedText
							variant="captionBold"
							color={c.error}
							style={{ marginBottom: 4 }}
						>
							{t('invoice.balance')}
						</ThemedText>
						<ThemedText variant="display" color={c.error}>
							{formatCurrency(balanceDue)}
						</ThemedText>
						<ThemedText variant="caption" color={c.error} style={{ marginTop: 4 }}>
							{t('invoice.grandTotal')} {formatCurrency(currentInvoice.grand_total)} ·{' '}
							{t('invoice.paid')} {formatCurrency(currentInvoice.amount_paid)}
						</ThemedText>
					</View>
				)}

				{/* Billed To */}
				<View
					style={[
						styles.section,
						{
							backgroundColor: c.card,
							borderRadius: r.md,
							marginBottom: s.lg,
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
							{t('invoice.billedTo')}
						</ThemedText>
					</View>
					<View style={{ padding: s.md, gap: 2 }}>
						<ThemedText variant="h3">{currentInvoice.customer_name}</ThemedText>
						{!!currentInvoice.customer_phone && (
							<ThemedText variant="body" color={c.onSurfaceVariant}>
								{currentInvoice.customer_phone}
							</ThemedText>
						)}
						{!!currentInvoice.customer_gstin && (
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{t('customer.gstin')}: {currentInvoice.customer_gstin}
							</ThemedText>
						)}
					</View>
				</View>

				{/* Items Table */}
				<View
					style={[
						styles.section,
						{
							backgroundColor: c.card,
							borderRadius: r.md,
							marginBottom: s.lg,
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
							{t('invoice.item')}
						</ThemedText>
						<ThemedText variant="label" color={c.onSurfaceVariant}>
							{t('invoice.total').toUpperCase()}
						</ThemedText>
					</View>
					{currentInvoice.line_items?.map((item, index) => (
						<View
							key={item.id}
							style={{
								paddingHorizontal: s.md,
								paddingVertical: s.sm,
								borderBottomWidth:
									index === currentInvoice.line_items!.length - 1
										? 0
										: StyleSheet.hairlineWidth,
								borderBottomColor: c.border,
							}}
						>
							<View style={layout.rowBetween}>
								<ThemedText
									weight="semibold"
									style={{ flex: 1, marginRight: s.sm }}
								>
									{item.design_name}
								</ThemedText>
								<ThemedText weight="semibold">
									{formatCurrency(item.line_total)}
								</ThemedText>
							</View>
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={{ marginTop: 2 }}
							>
								{t('invoice.unitsAt', {
									count: item.quantity,
									price: formatCurrency(item.rate_per_unit),
								})}
							</ThemedText>
						</View>
					))}
				</View>

				{/* Totals summary */}
				<View
					style={[
						styles.section,
						{
							backgroundColor: c.card,
							borderRadius: r.md,
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
							{t('invoice.summary')}
						</ThemedText>
					</View>
					<View style={{ padding: s.md, gap: s.sm }}>
						<View style={layout.rowBetween}>
							<ThemedText color={c.onSurfaceVariant}>
								{t('invoice.subtotal')}
							</ThemedText>
							<ThemedText>{formatCurrency(currentInvoice.subtotal)}</ThemedText>
						</View>
						{currentInvoice.is_inter_state ? (
							<View style={layout.rowBetween}>
								<ThemedText color={c.onSurfaceVariant}>
									{t('finance.igst')}
								</ThemedText>
								<ThemedText>{formatCurrency(currentInvoice.igst_total)}</ThemedText>
							</View>
						) : (
							<>
								<View style={layout.rowBetween}>
									<ThemedText color={c.onSurfaceVariant}>
										{t('finance.cgst')}
									</ThemedText>
									<ThemedText>
										{formatCurrency(currentInvoice.cgst_total)}
									</ThemedText>
								</View>
								<View style={layout.rowBetween}>
									<ThemedText color={c.onSurfaceVariant}>
										{t('finance.sgst')}
									</ThemedText>
									<ThemedText>
										{formatCurrency(currentInvoice.sgst_total)}
									</ThemedText>
								</View>
							</>
						)}

						<Divider style={{ marginVertical: s.xs }} />

						<View style={layout.rowBetween}>
							<ThemedText weight="bold">{t('invoice.grandTotal')}</ThemedText>
							<ThemedText variant="h2" color={c.primary}>
								{formatCurrency(currentInvoice.grand_total)}
							</ThemedText>
						</View>
						<View style={layout.rowBetween}>
							<ThemedText color={c.onSurfaceVariant}>
								{t('invoice.amountPaid')}
							</ThemedText>
							<ThemedText weight="semibold" color={c.success}>
								{formatCurrency(currentInvoice.amount_paid)}
							</ThemedText>
						</View>
						{balanceDue > 0 && (
							<View style={layout.rowBetween}>
								<ThemedText color={c.error}>{t('invoice.balance')}</ThemedText>
								<ThemedText variant="h3" color={c.error}>
									{formatCurrency(balanceDue)}
								</ThemedText>
							</View>
						)}
					</View>
				</View>
			</ScrollView>

			{/* Sticky Record Payment footer */}
			{balanceDue > 0 && (
				<View
					style={[
						styles.footer,
						{
							backgroundColor: c.background,
							borderTopColor: c.border,
							paddingHorizontal: s.lg,
							paddingTop: s.sm,
							paddingBottom: Platform.OS === 'ios' ? s.lg : s.md,
						},
					]}
				>
					<Button
						title={t('invoice.recordPayment')}
						accessibilityLabel="record-payment-button"
						onPress={() => setPaymentModalVisible(true)}
					/>
				</View>
			)}

			<PaymentModal
				visible={paymentModalVisible}
				onClose={() => setPaymentModalVisible(false)}
				customerId={currentInvoice.customer_id as UUID}
				customerName={currentInvoice.customer_name}
				invoiceId={currentInvoice.id as UUID}
				invoiceNumber={currentInvoice.invoice_number}
				totalAmount={balanceDue}
				onSuccess={() => fetchInvoiceById(id as string)}
			/>
		</Screen>
	);
}

const styles = StyleSheet.create({
	center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	heroCard: { overflow: 'hidden' },
	section: { overflow: 'hidden' },
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	footer: {
		borderTopWidth: StyleSheet.hairlineWidth,
	},
});
