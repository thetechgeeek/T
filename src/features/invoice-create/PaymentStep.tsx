import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeTokens } from '@easydesign/design-system/foundation';
import { useLocale } from '@/src/hooks/useLocale';
import { ThemedText } from '@easydesign/design-system';
import { FormField } from '@easydesign/design-system';
import { Card } from '@easydesign/design-system';
import { Avatar } from '@easydesign/design-system';
import { layout } from '@easydesign/design-system/foundation';
import type { InvoiceLineItemInput } from '@/src/types/invoice';
import type { CustomerDraft, PaymentMode } from './invoiceCreateTypes';
import { withOpacity } from '@easydesign/design-system/foundation';
import { OPACITY_BADGE_BG } from '@easydesign/design-system/foundation';
import { SPACING_PX } from '@easydesign/design-system/foundation';

import { PAYMENT_MODES } from '@/src/constants/paymentModes';

const STATUS_BORDER_OPACITY = 0.24;

interface Props {
	customer: CustomerDraft | null;
	lineItems: InvoiceLineItemInput[];
	grandTotal: number;
	amountPaid: string;
	setAmountPaid: (v: string) => void;
	amountPaidNum: number;
	paymentMode: PaymentMode;
	setPaymentMode: (mode: PaymentMode) => void;
}

export function PaymentStep({
	customer,
	lineItems,
	grandTotal,
	amountPaid,
	setAmountPaid,
	amountPaidNum,
	paymentMode,
	setPaymentMode,
}: Props) {
	const { c, s, r } = useThemeTokens();
	const { t, formatCurrency } = useLocale();

	const balanceDue = Math.max(0, grandTotal - amountPaidNum);
	const isPaid = amountPaidNum >= grandTotal;
	const taxableAmount = lineItems.reduce((acc, item) => {
		return acc + item.quantity * item.rate_per_unit - (item.discount || 0);
	}, 0);
	const gstAmount = lineItems.reduce((acc, item) => {
		const lineSubtotal = item.quantity * item.rate_per_unit - (item.discount || 0);
		return acc + lineSubtotal * (item.gst_rate / 100);
	}, 0);
	const customerName = customer?.name || t('invoice.cashWalkInCustomer');
	const customerPhone = customer?.phone || t('invoice.noPhone');

	return (
		<View>
			<ThemedText variant="h3" style={{ marginBottom: s.md }}>
				{t('invoice.reviewAndPayment')}
			</ThemedText>

			<Card
				variant="outlined"
				padding="md"
				style={{ marginBottom: s.lg, backgroundColor: c.surface }}
			>
				<View style={[layout.rowBetween, { alignItems: 'center', gap: s.md }]}>
					<View
						style={{ flexDirection: 'row', alignItems: 'center', gap: s.md, flex: 1 }}
					>
						<Avatar name={customerName} size="md" />
						<View style={{ flex: 1 }}>
							<ThemedText weight="bold">
								{t('invoice.customer')}: {customerName}
							</ThemedText>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{customerPhone}
							</ThemedText>
						</View>
					</View>
				</View>

				<View style={{ marginTop: s.md }}>
					{lineItems.map((item, idx) => (
						<View key={idx} style={[layout.rowBetween, { marginTop: SPACING_PX.xs }]}>
							<View style={{ flex: 1, paddingRight: s.sm }}>
								<ThemedText variant="body">
									{item.quantity}x {item.design_name}
								</ThemedText>
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									GST {item.gst_rate}%
								</ThemedText>
							</View>
							<ThemedText variant="body">
								{formatCurrency(item.quantity * item.rate_per_unit)}
							</ThemedText>
						</View>
					))}
				</View>

				<View
					style={{
						height: StyleSheet.hairlineWidth,
						backgroundColor: c.border,
						marginVertical: s.md,
					}}
				/>

				<View style={{ marginBottom: s.sm }}>
					<View style={layout.rowBetween}>
						<ThemedText variant="caption" color={c.onSurfaceVariant}>
							{t('invoice.taxableAmount')}
						</ThemedText>
						<ThemedText variant="caption" color={c.onSurfaceVariant}>
							{formatCurrency(taxableAmount)}
						</ThemedText>
					</View>
					<View style={layout.rowBetween}>
						<ThemedText variant="caption" color={c.onSurfaceVariant}>
							{t('invoice.gstAmount', { rate: 18 })}
						</ThemedText>
						<ThemedText variant="caption" color={c.onSurfaceVariant}>
							{formatCurrency(gstAmount)}
						</ThemedText>
					</View>
				</View>

				<View style={layout.rowBetween}>
					<ThemedText weight="bold">{t('invoice.grandTotalIncGst')}</ThemedText>
					<ThemedText variant="h3" color={c.primary}>
						{formatCurrency(grandTotal)}
					</ThemedText>
				</View>
			</Card>

			<ThemedText weight="bold" style={{ marginBottom: s.sm }}>
				{t('invoice.paymentCollection')}
			</ThemedText>

			<Card
				variant="outlined"
				padding="md"
				style={{ marginBottom: s.lg, backgroundColor: c.surface }}
			>
				<View style={[layout.row, { gap: s.sm, marginBottom: s.md, flexWrap: 'wrap' }]}>
					<TouchableOpacity
						onPress={() => setAmountPaid(String(grandTotal))}
						accessibilityRole="button"
						accessibilityLabel="paid-in-full-chip"
						style={{
							paddingHorizontal: s.md,
							paddingVertical: s.sm,
							backgroundColor:
								amountPaidNum >= grandTotal && amountPaidNum > 0
									? c.primary
									: c.surfaceVariant,
							borderRadius: r.sm,
							borderWidth: 1,
							borderColor: c.primary,
						}}
					>
						<ThemedText
							variant="caption"
							color={
								amountPaidNum >= grandTotal && amountPaidNum > 0
									? c.onPrimary
									: c.primary
							}
						>
							{t('invoice.paidInFull')} {formatCurrency(grandTotal)}
						</ThemedText>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={() => setAmountPaid('0')}
						accessibilityRole="button"
						accessibilityLabel="credit-no-payment-chip"
						style={{
							paddingHorizontal: s.md,
							paddingVertical: s.sm,
							backgroundColor:
								amountPaid === '0' || (amountPaid === '' && amountPaidNum === 0)
									? c.surfaceVariant
									: c.surface,
							borderRadius: r.sm,
							borderWidth: 1,
							borderColor: c.border,
						}}
					>
						<ThemedText variant="caption" color={c.onSurfaceVariant}>
							{t('invoice.creditNoPayment')}
						</ThemedText>
					</TouchableOpacity>
				</View>

				<FormField
					label={`${t('invoice.paymentCollection')} (${t('finance.currencySymbol')})`}
					accessibilityLabel="amount-paid-input"
					value={amountPaid}
					placeholder={t('invoice.placeholders.enterAmountPaid')}
					keyboardType="numeric"
					onChangeText={setAmountPaid}
				/>

				<ThemedText
					variant="caption"
					color={c.onSurfaceVariant}
					importantForAccessibility="no"
					style={{ marginBottom: SPACING_PX.xs }}
				>
					{t('invoice.paymentMode')}
				</ThemedText>
				<View style={[layout.row, { gap: s.sm, flexWrap: 'wrap' }]}>
					{PAYMENT_MODES.map(({ value: mode }) => (
						<TouchableOpacity
							key={mode}
							onPress={() => setPaymentMode(mode)}
							accessibilityRole="button"
							accessibilityLabel={`payment-mode-${mode}`}
							accessibilityHint={t('invoice.payVia', {
								mode: t(`invoice.paymentModes.${mode}`),
							})}
							accessibilityState={{ selected: paymentMode === mode }}
							style={{
								paddingHorizontal: s.md,
								paddingVertical: s.sm,
								backgroundColor:
									paymentMode === mode ? c.primary : c.surfaceVariant,
								borderRadius: r.sm,
								borderWidth: 1,
								borderColor: paymentMode === mode ? c.primary : c.border,
							}}
						>
							<ThemedText
								variant="caption"
								color={paymentMode === mode ? c.onPrimary : c.onSurface}
							>
								{t(`invoice.paymentModes.${mode}`)}
							</ThemedText>
						</TouchableOpacity>
					))}
				</View>
			</Card>

			<View
				accessible={true}
				accessibilityRole="summary"
				accessibilityLabel="balance-due-indicator"
				accessibilityValue={{
					text: isPaid
						? t('invoice.fullyPaid')
						: t('invoice.balanceDue', { amount: formatCurrency(balanceDue) }),
				}}
				style={{
					padding: s.md,
					backgroundColor: isPaid
						? withOpacity(c.success, OPACITY_BADGE_BG)
						: withOpacity(c.warning, OPACITY_BADGE_BG),
					borderRadius: r.md,
					borderWidth: 1,
					borderColor: isPaid
						? withOpacity(c.success, STATUS_BORDER_OPACITY)
						: withOpacity(c.warning, STATUS_BORDER_OPACITY),
				}}
			>
				<ThemedText
					weight="bold"
					color={isPaid ? c.success : c.warning}
					importantForAccessibility="no"
				>
					{isPaid
						? t('invoice.fullyPaid')
						: t('invoice.balanceDue', { amount: formatCurrency(balanceDue) })}
				</ThemedText>
			</View>
		</View>
	);
}
