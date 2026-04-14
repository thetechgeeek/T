import React, { useEffect, useState, useCallback } from 'react';
import {
	AMOUNT_SHORT_FORMAT_ONE_CRORE,
	AMOUNT_SHORT_FORMAT_ONE_LAKH,
	AMOUNT_SHORT_FORMAT_ONE_THOUSAND,
} from '@/constants/money';
import {
	View,
	StyleSheet,
	ScrollView,
	Platform,
	TouchableOpacity,
	Linking,
	Alert,
	ActionSheetIOS,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
	Share2,
	Printer,
	MoreVertical,
	Phone,
	ChevronDown,
	ChevronUp,
	Edit2,
} from 'lucide-react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { pdfService } from '@/src/services/pdfService';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Screen } from '@/src/components/atoms/Screen';
import { Button } from '@/src/components/atoms/Button';
import { Divider } from '@/src/components/atoms/Divider';
import { Badge } from '@/src/components/atoms/Badge';
import { useLocale } from '@/src/hooks/useLocale';
import { SectionHeader } from '@/src/components/molecules/SectionHeader';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { InvoiceDetailSkeleton } from '@/src/components/molecules/skeletons/InvoiceDetailSkeleton';
import { layout } from '@/src/theme/layout';
import { PaymentModal } from '@/src/components/organisms/PaymentModal';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { SIZE_BUTTON_HEIGHT_SM } from '@/theme/uiMetrics';
import type { UUID } from '@/src/types/common';
import type { BadgeVariant } from '@/src/components/atoms/Badge';
import type { PaymentStatus } from '@/src/types/invoice';

// ─── helpers ────────────────────────────────────────────────────────────────

type ExtendedStatus = PaymentStatus | 'overdue' | 'draft' | 'void';

const STATUS_BADGE_VARIANT: Record<ExtendedStatus, BadgeVariant> = {
	paid: 'paid',
	partial: 'partial',
	unpaid: 'unpaid',
	overdue: 'error',
	draft: 'neutral',
	void: 'neutral',
};

const STATUS_LABEL: Record<ExtendedStatus, string> = {
	paid: 'Paid',
	partial: 'Partial',
	unpaid: 'Unpaid',
	overdue: 'Overdue',
	draft: 'Draft',
	void: 'Void',
};

/** Very small number-to-words converter (English, up to crores) */
function numberToWords(n: number): string {
	if (n === 0) return 'Zero';

	const ones = [
		'',
		'One',
		'Two',
		'Three',
		'Four',
		'Five',
		'Six',
		'Seven',
		'Eight',
		'Nine',
		'Ten',
		'Eleven',
		'Twelve',
		'Thirteen',
		'Fourteen',
		'Fifteen',
		'Sixteen',
		'Seventeen',
		'Eighteen',
		'Nineteen',
	];
	const tens = [
		'',
		'',
		'Twenty',
		'Thirty',
		'Forty',
		'Fifty',
		'Sixty',
		'Seventy',
		'Eighty',
		'Ninety',
	];

	function below100(num: number): string {
		if (num < 20) return ones[num];
		return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
	}

	function below1000(num: number): string {
		if (num < 100) return below100(num);
		return (
			ones[Math.floor(num / 100)] +
			' Hundred' +
			(num % 100 !== 0 ? ' ' + below100(num % 100) : '')
		);
	}

	const wholePart = Math.floor(n);
	const paise = Math.round((n - wholePart) * 100);

	let result = '';
	let remaining = wholePart;

	const crore = Math.floor(remaining / AMOUNT_SHORT_FORMAT_ONE_CRORE);
	remaining %= AMOUNT_SHORT_FORMAT_ONE_CRORE;
	if (crore > 0) result += below1000(crore) + ' Crore ';

	const lakh = Math.floor(remaining / AMOUNT_SHORT_FORMAT_ONE_LAKH);
	remaining %= AMOUNT_SHORT_FORMAT_ONE_LAKH;
	if (lakh > 0) result += below1000(lakh) + ' Lakh ';

	const thousand = Math.floor(remaining / AMOUNT_SHORT_FORMAT_ONE_THOUSAND);
	remaining %= AMOUNT_SHORT_FORMAT_ONE_THOUSAND;
	if (thousand > 0) result += below1000(thousand) + ' Thousand ';

	if (remaining > 0) result += below1000(remaining) + ' ';

	result = 'Rupees ' + result.trim();
	if (paise > 0) result += ' and ' + below100(paise) + ' Paise';
	result += ' Only';

	return result;
}

// ─── component ──────────────────────────────────────────────────────────────

export default function InvoiceDetailScreen() {
	const { id } = useLocalSearchParams();
	const router = useRouter();
	const { theme, c, s, r } = useThemeTokens();
	const { t, formatCurrency, formatDate, formatDateShort } = useLocale();

	const { currentInvoice, fetchInvoiceById, loading, error, clearCurrentInvoice } =
		useInvoiceStore();
	const [sharing, setSharing] = useState(false);
	const [paymentModalVisible, setPaymentModalVisible] = useState(false);
	const [paymentsExpanded, setPaymentsExpanded] = useState(true);

	useEffect(() => {
		if (id) fetchInvoiceById(id as string);
		return () => clearCurrentInvoice();
	}, [id, fetchInvoiceById, clearCurrentInvoice]);

	const handleShare = useCallback(async () => {
		if (!currentInvoice) return;
		setSharing(true);
		await pdfService.printAndShareInvoice(currentInvoice, t, formatDateShort);
		setSharing(false);
	}, [currentInvoice, t, formatDateShort]);

	const handleCall = useCallback((phone: string) => {
		Linking.openURL(`tel:${phone}`).catch(() =>
			Alert.alert('Error', 'Unable to open phone dialer'),
		);
	}, []);

	const handleKebab = useCallback(() => {
		const options = ['Edit Invoice', 'Print', 'Cancel'];
		if (Platform.OS === 'ios') {
			ActionSheetIOS.showActionSheetWithOptions({ options, cancelButtonIndex: 2 }, (idx) => {
				if (idx === 0) router.push(`/(app)/invoices/create?edit=${currentInvoice?.id}`);
				if (idx === 1) Alert.alert('Print', 'Print feature coming soon');
			});
		} else {
			Alert.alert('Options', '', [
				{
					text: 'Edit Invoice',
					onPress: () => router.push(`/(app)/invoices/create?edit=${currentInvoice?.id}`),
				},
				{ text: 'Print', onPress: () => Alert.alert('Print', 'Print feature coming soon') },
				{ text: 'Cancel', style: 'cancel' },
			]);
		}
	}, [currentInvoice, router]);

	// ── loading ──
	if (loading) {
		return (
			<Screen safeAreaEdges={['top', 'bottom']} withKeyboard={false}>
				<ScreenHeader title="" />
				<InvoiceDetailSkeleton />
			</Screen>
		);
	}

	// ── error / not found ──
	if (error || !currentInvoice) {
		return (
			<Screen safeAreaEdges={['top', 'bottom']} withKeyboard={false}>
				<ScreenHeader title="Invoice" />
				<View style={styles.center}>
					<ThemedText color={c.error} style={{ marginBottom: s.md }}>
						{error || t('invoice.loadError')}
					</ThemedText>
					<Button
						title={t('common.retry')}
						onPress={() => id && fetchInvoiceById(id as string)}
						style={{ marginBottom: s.sm }}
					/>
					<Button
						title={t('common.back')}
						variant="outline"
						onPress={() => router.back()}
					/>
				</View>
			</Screen>
		);
	}

	const invoice = currentInvoice;
	const balanceDue = invoice.grand_total - invoice.amount_paid;
	const status = (invoice.payment_status ?? 'unpaid') as ExtendedStatus;
	// due_date may exist on extended DB rows even if not in the TS type
	const dueDateStr = (invoice as unknown as Record<string, unknown>).due_date as
		| string
		| undefined;
	const isOverdue = status === 'unpaid' && !!dueDateStr && new Date(dueDateStr) < new Date();
	const effectiveStatus: ExtendedStatus = isOverdue ? 'overdue' : status;

	// Status banner colour
	const statusBannerColor: Record<ExtendedStatus, string> = {
		paid: c.successLight,
		partial: c.warningLight,
		unpaid: c.errorLight,
		overdue: c.errorLight,
		draft: c.surfaceVariant,
		void: c.surfaceVariant,
	};
	const statusTextColor: Record<ExtendedStatus, string> = {
		paid: c.success,
		partial: c.warning,
		unpaid: c.error,
		overdue: c.overdue,
		draft: c.onSurfaceVariant,
		void: c.onSurfaceVariant,
	};

	return (
		<Screen safeAreaEdges={['top']} withKeyboard={false}>
			{/* ── Header ── */}
			<ScreenHeader
				title={invoice.invoice_number}
				rightElement={
					<TouchableOpacity
						onPress={handleKebab}
						style={styles.iconBtn}
						accessibilityLabel="more-options"
						accessibilityRole="button"
					>
						<MoreVertical size={22} color={c.onSurface} />
					</TouchableOpacity>
				}
			/>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					padding: s.md,
					paddingBottom: balanceDue > 0 ? 96 : s.xl,
				}}
			>
				{/* ── Status Banner ── */}
				<View
					style={[
						styles.statusBanner,
						{
							backgroundColor: statusBannerColor[effectiveStatus],
							borderRadius: r.md,
							marginBottom: s.md,
							padding: s.md,
						},
					]}
				>
					<View style={layout.rowBetween}>
						<Badge
							label={STATUS_LABEL[effectiveStatus]}
							variant={STATUS_BADGE_VARIANT[effectiveStatus]}
							size="md"
						/>
						<ThemedText variant="h2" color={statusTextColor[effectiveStatus]}>
							{formatCurrency(invoice.grand_total)}
						</ThemedText>
					</View>
					{effectiveStatus !== 'paid' &&
						effectiveStatus !== 'draft' &&
						effectiveStatus !== 'void' && (
							<View style={[layout.rowBetween, { marginTop: s.xs }]}>
								<ThemedText
									variant="caption"
									color={statusTextColor[effectiveStatus]}
								>
									{t('invoice.amountPaid')}: {formatCurrency(invoice.amount_paid)}
								</ThemedText>
								{balanceDue > 0 && (
									<ThemedText
										variant="captionBold"
										color={statusTextColor[effectiveStatus]}
									>
										{t('invoice.balance')}: {formatCurrency(balanceDue)}
									</ThemedText>
								)}
							</View>
						)}
				</View>

				{/* ── Invoice Header Card ── */}
				<View
					style={[
						{ overflow: 'hidden' },
						{
							backgroundColor: c.card,
							borderRadius: r.md,
							marginBottom: s.md,
							...(theme.shadows.sm as object),
						},
					]}
				>
					<View
						style={[styles.cardHeader, { borderBottomColor: c.border, padding: s.md }]}
					>
						<ThemedText variant="captionBold" color={c.onSurfaceVariant}>
							TAX INVOICE
						</ThemedText>
						<ThemedText variant="h3">{invoice.customer_name}</ThemedText>
					</View>
					<View style={{ padding: s.md, gap: s.xs }}>
						<View style={layout.rowBetween}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{t('invoice.invoiceNumber')}
							</ThemedText>
							<ThemedText variant="bodyBold">{invoice.invoice_number}</ThemedText>
						</View>
						<View style={layout.rowBetween}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{t('invoice.invoiceDate')}
							</ThemedText>
							<ThemedText>{formatDate(invoice.invoice_date)}</ThemedText>
						</View>
						{!!dueDateStr && (
							<View style={layout.rowBetween}>
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									Due Date
								</ThemedText>
								<ThemedText
									color={isOverdue ? c.error : c.onSurface}
									weight={isOverdue ? 'bold' : 'regular'}
								>
									{formatDate(dueDateStr)}
								</ThemedText>
							</View>
						)}
					</View>
				</View>

				{/* ── Billed To ── */}
				<View
					style={[
						{ overflow: 'hidden' },
						{
							backgroundColor: c.card,
							borderRadius: r.md,
							marginBottom: s.md,
							...(theme.shadows.sm as object),
						},
					]}
				>
					<SectionHeader
						title={t('invoice.billedTo')}
						titleColor={c.onSurfaceVariant}
						style={{
							borderBottomColor: c.border,
							borderBottomWidth: StyleSheet.hairlineWidth,
							paddingHorizontal: s.md,
							paddingVertical: s.md,
						}}
					/>
					<View style={{ padding: s.md, gap: s.xs }}>
						<ThemedText variant="h3">{invoice.customer_name}</ThemedText>
						{!!invoice.customer_phone && (
							<TouchableOpacity
								onPress={() => handleCall(invoice.customer_phone)}
								style={layout.row}
								accessibilityRole="button"
								accessibilityLabel={`Call ${invoice.customer_phone}`}
							>
								<Phone
									size={14}
									color={c.primary}
									style={{ marginRight: SPACING_PX.xs }}
								/>
								<ThemedText color={c.primary}>{invoice.customer_phone}</ThemedText>
							</TouchableOpacity>
						)}
						{!!invoice.customer_gstin && (
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{t('customer.gstin')}: {invoice.customer_gstin}
							</ThemedText>
						)}
						{!!invoice.customer_address && (
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{invoice.customer_address}
							</ThemedText>
						)}
					</View>
				</View>

				{/* ── Line Items Table ── */}
				<View
					style={[
						{ overflow: 'hidden' },
						{
							backgroundColor: c.card,
							borderRadius: r.md,
							marginBottom: s.md,
							...(theme.shadows.sm as object),
						},
					]}
				>
					{/* Table Header */}
					<View
						style={[
							styles.tableRow,
							{
								borderBottomColor: c.border,
								borderBottomWidth: StyleSheet.hairlineWidth,
								backgroundColor: c.surfaceVariant,
								borderTopLeftRadius: r.md,
								borderTopRightRadius: r.md,
								paddingVertical: s.xs,
								paddingHorizontal: s.md,
							},
						]}
					>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={styles.colDesc}
						>
							ITEM
						</ThemedText>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={styles.colQty}
						>
							QTY
						</ThemedText>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={styles.colRate}
						>
							RATE
						</ThemedText>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={styles.colGst}
						>
							GST%
						</ThemedText>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={styles.colAmt}
						>
							AMT
						</ThemedText>
					</View>

					{/* Table Rows */}
					{invoice.line_items?.map((item, index) => (
						<View
							key={item.id}
							style={[
								styles.tableRow,
								{
									borderBottomColor: c.border,
									borderBottomWidth:
										index === (invoice.line_items?.length ?? 0) - 1
											? 0
											: StyleSheet.hairlineWidth,
									paddingVertical: s.sm,
									paddingHorizontal: s.md,
								},
							]}
						>
							<View style={styles.colDesc}>
								<ThemedText variant="body" weight="semibold" numberOfLines={2}>
									{item.design_name}
								</ThemedText>
								{!!item.description && (
									<ThemedText variant="caption" color={c.onSurfaceVariant}>
										{item.description}
									</ThemedText>
								)}
								{!!item.hsn_code && (
									<ThemedText variant="caption" color={c.onSurfaceVariant}>
										HSN: {item.hsn_code}
									</ThemedText>
								)}
							</View>
							<ThemedText variant="caption" style={styles.colQty}>
								{item.quantity}
							</ThemedText>
							<ThemedText variant="caption" style={styles.colRate}>
								{formatCurrency(item.rate_per_unit, false)}
							</ThemedText>
							<ThemedText variant="caption" style={styles.colGst}>
								{item.gst_rate}%
							</ThemedText>
							<ThemedText variant="caption" weight="semibold" style={styles.colAmt}>
								{formatCurrency(item.line_total, false)}
							</ThemedText>
						</View>
					))}
				</View>

				{/* ── Totals Section ── */}
				<View
					style={[
						{ overflow: 'hidden' },
						{
							backgroundColor: c.card,
							borderRadius: r.md,
							marginBottom: s.md,
							...(theme.shadows.sm as object),
						},
					]}
				>
					<SectionHeader
						title={t('invoice.summary')}
						titleColor={c.onSurfaceVariant}
						variant="uppercase"
						style={{
							borderBottomColor: c.border,
							borderBottomWidth: StyleSheet.hairlineWidth,
							paddingHorizontal: s.md,
							paddingVertical: s.md,
						}}
					/>
					<View style={{ padding: s.md, gap: s.sm }}>
						<View style={layout.rowBetween}>
							<ThemedText color={c.onSurfaceVariant}>
								{t('invoice.subtotal')}
							</ThemedText>
							<ThemedText>{formatCurrency(invoice.subtotal)}</ThemedText>
						</View>
						{invoice.discount_total > 0 && (
							<View style={layout.rowBetween}>
								<ThemedText color={c.onSurfaceVariant}>
									{t('invoice.discount')}
								</ThemedText>
								<ThemedText color={c.success}>
									- {formatCurrency(invoice.discount_total)}
								</ThemedText>
							</View>
						)}

						{/* GST Breakdown */}
						{invoice.is_inter_state ? (
							<View style={layout.rowBetween}>
								<ThemedText color={c.onSurfaceVariant}>
									{t('invoice.igst')}
								</ThemedText>
								<ThemedText>{formatCurrency(invoice.igst_total)}</ThemedText>
							</View>
						) : (
							<>
								{invoice.cgst_total > 0 && (
									<View style={layout.rowBetween}>
										<ThemedText color={c.onSurfaceVariant}>
											{t('invoice.cgst')}
										</ThemedText>
										<ThemedText>
											{formatCurrency(invoice.cgst_total)}
										</ThemedText>
									</View>
								)}
								{invoice.sgst_total > 0 && (
									<View style={layout.rowBetween}>
										<ThemedText color={c.onSurfaceVariant}>
											{t('invoice.sgst')}
										</ThemedText>
										<ThemedText>
											{formatCurrency(invoice.sgst_total)}
										</ThemedText>
									</View>
								)}
							</>
						)}

						<Divider style={{ marginVertical: s.xs }} />

						<View style={layout.rowBetween}>
							<ThemedText variant="bodyBold">{t('invoice.grandTotal')}</ThemedText>
							<ThemedText variant="amountLarge" color={c.primary}>
								{formatCurrency(invoice.grand_total)}
							</ThemedText>
						</View>
					</View>
				</View>

				{/* ── Amount in Words ── */}
				<View
					style={[
						{
							backgroundColor: c.surfaceVariant,
							borderRadius: r.sm,
							padding: s.sm,
							marginBottom: s.md,
						},
					]}
				>
					<ThemedText variant="caption" color={c.onSurfaceVariant}>
						{numberToWords(invoice.grand_total)}
					</ThemedText>
				</View>

				{/* ── Payment History (Collapsible) ── */}
				<View
					style={[
						{ overflow: 'hidden' },
						{
							backgroundColor: c.card,
							borderRadius: r.md,
							marginBottom: s.md,
							...(theme.shadows.sm as object),
						},
					]}
				>
					<TouchableOpacity
						onPress={() => setPaymentsExpanded((v) => !v)}
						accessibilityRole="button"
						accessibilityLabel="Toggle payment history"
					>
						<SectionHeader
							title={t('common.payments')}
							titleColor={c.onSurfaceVariant}
							variant="uppercase"
							action={
								paymentsExpanded ? (
									<ChevronUp size={18} color={c.onSurfaceVariant} />
								) : (
									<ChevronDown size={18} color={c.onSurfaceVariant} />
								)
							}
							style={{
								borderBottomColor: c.border,
								borderBottomWidth: paymentsExpanded ? StyleSheet.hairlineWidth : 0,
								paddingHorizontal: s.md,
								paddingVertical: s.md,
							}}
						/>
					</TouchableOpacity>

					{paymentsExpanded && (
						<View style={{ padding: s.md, gap: s.sm }}>
							{invoice.amount_paid > 0 ? (
								<View style={layout.rowBetween}>
									<ThemedText color={c.onSurfaceVariant}>
										Amount Received
									</ThemedText>
									<ThemedText weight="semibold" color={c.success}>
										{formatCurrency(invoice.amount_paid)}
									</ThemedText>
								</View>
							) : (
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									No payments recorded yet.
								</ThemedText>
							)}

							<Divider style={{ marginVertical: s.xs }} />

							<View style={layout.rowBetween}>
								<ThemedText color={c.onSurfaceVariant}>Total Received</ThemedText>
								<ThemedText weight="semibold" color={c.success}>
									{formatCurrency(invoice.amount_paid)}
								</ThemedText>
							</View>
							<View style={layout.rowBetween}>
								<ThemedText color={balanceDue > 0 ? c.error : c.onSurfaceVariant}>
									Balance Due
								</ThemedText>
								<ThemedText
									weight="semibold"
									color={balanceDue > 0 ? c.error : c.success}
								>
									{formatCurrency(balanceDue)}
								</ThemedText>
							</View>

							{balanceDue > 0 && (
								<Button
									title="+ Record Payment"
									variant="outline"
									size="sm"
									style={{ marginTop: s.xs }}
									onPress={() => setPaymentModalVisible(true)}
									accessibilityLabel="record-payment-inline"
								/>
							)}
						</View>
					)}
				</View>

				{/* ── Notes / Terms ── */}
				{(!!invoice.notes || !!invoice.terms) && (
					<View
						style={[
							{ overflow: 'hidden' },
							{
								backgroundColor: c.card,
								borderRadius: r.md,
								marginBottom: s.md,
								...(theme.shadows.sm as object),
							},
						]}
					>
						{!!invoice.notes && (
							<View style={{ padding: s.md }}>
								<ThemedText
									variant="captionBold"
									color={c.onSurfaceVariant}
									style={{ marginBottom: s.xs }}
								>
									NOTES
								</ThemedText>
								<ThemedText variant="caption">{invoice.notes}</ThemedText>
							</View>
						)}
						{!!invoice.notes && !!invoice.terms && <Divider />}
						{!!invoice.terms && (
							<View style={{ padding: s.md }}>
								<ThemedText
									variant="captionBold"
									color={c.onSurfaceVariant}
									style={{ marginBottom: s.xs }}
								>
									TERMS & CONDITIONS
								</ThemedText>
								<ThemedText variant="caption">{invoice.terms}</ThemedText>
							</View>
						)}
					</View>
				)}
			</ScrollView>

			{/* ── Sticky Action Bar ── */}
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
				{balanceDue > 0 ? (
					<View style={styles.actionRow}>
						<Button
							title={t('invoice.recordPayment')}
							accessibilityLabel="record-payment-button"
							style={{ flex: 1, marginRight: s.sm }}
							onPress={() => setPaymentModalVisible(true)}
						/>
						<TouchableOpacity
							style={[
								styles.iconActionBtn,
								{ backgroundColor: c.success, borderRadius: r.md },
							]}
							onPress={handleShare}
							accessibilityRole="button"
							accessibilityLabel="share-whatsapp"
						>
							<Share2 size={20} color={c.onSuccess} />
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.iconActionBtn,
								{
									backgroundColor: c.surfaceVariant,
									borderRadius: r.md,
									marginLeft: s.xs,
								},
							]}
							onPress={() => Alert.alert('Print', 'Print feature coming soon')}
							accessibilityRole="button"
							accessibilityLabel="print-invoice"
						>
							<Printer size={20} color={c.onSurfaceVariant} />
						</TouchableOpacity>
					</View>
				) : (
					<View style={styles.actionRow}>
						<Button
							title={t('invoice.sharePdf')}
							leftIcon={<Share2 size={18} color={c.onSuccess} />}
							style={{
								flex: 1,
								marginRight: s.sm,
								backgroundColor: c.success,
							}}
							onPress={handleShare}
							loading={sharing}
							accessibilityLabel="share-pdf-button"
						/>
						<TouchableOpacity
							style={[
								styles.iconActionBtn,
								{ backgroundColor: c.surfaceVariant, borderRadius: r.md },
							]}
							onPress={() => Alert.alert('Print', 'Print feature coming soon')}
							accessibilityRole="button"
							accessibilityLabel="print-invoice"
						>
							<Printer size={20} color={c.onSurfaceVariant} />
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.iconActionBtn,
								{
									backgroundColor: c.surfaceVariant,
									borderRadius: r.md,
									marginLeft: s.xs,
								},
							]}
							onPress={() => router.push(`/(app)/invoices/create?edit=${invoice.id}`)}
							accessibilityRole="button"
							accessibilityLabel="edit-invoice"
						>
							<Edit2 size={20} color={c.onSurfaceVariant} />
						</TouchableOpacity>
					</View>
				)}
			</View>

			{/* ── Payment Modal ── */}
			<PaymentModal
				visible={paymentModalVisible}
				onClose={() => setPaymentModalVisible(false)}
				customerId={invoice.customer_id as UUID}
				customerName={invoice.customer_name}
				invoiceId={invoice.id as UUID}
				invoiceNumber={invoice.invoice_number}
				totalAmount={balanceDue}
				onSuccess={() => fetchInvoiceById(id as string)}
			/>
		</Screen>
	);
}

// ─── styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: SPACING_PX.xl,
	},
	iconBtn: { padding: SPACING_PX.sm },
	statusBanner: { overflow: 'hidden' },
	cardHeader: {
		borderBottomWidth: StyleSheet.hairlineWidth,
		gap: SPACING_PX.xs,
	},
	// Table columns
	tableRow: { flexDirection: 'row', alignItems: 'flex-start' },
	colDesc: { flex: 3, paddingRight: SPACING_PX.xs },
	colQty: { flex: 1, textAlign: 'right' },
	colRate: { flex: 2, textAlign: 'right' },
	colGst: { flex: 1, textAlign: 'right' },
	colAmt: { flex: 2, textAlign: 'right' },
	// Action bar
	actionBar: {
		borderTopWidth: StyleSheet.hairlineWidth,
	},
	actionRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	iconActionBtn: {
		width: SIZE_BUTTON_HEIGHT_SM,
		height: SIZE_BUTTON_HEIGHT_SM,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
