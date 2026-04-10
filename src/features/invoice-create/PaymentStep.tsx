import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { FormField } from '@/src/components/molecules/FormField';
import { layout } from '@/src/theme/layout';
import type { InvoiceLineItemInput } from '@/src/types/invoice';
import type { CustomerDraft, PaymentMode } from './useInvoiceCreateFlow';

import { PAYMENT_MODES } from '@/src/constants/paymentModes';

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

	return (
		<View>
			<ThemedText variant="h3" style={{ marginBottom: s.md }}>
				{t('invoice.reviewAndPayment')}
			</ThemedText>

			{/* Order Summary */}
			<View
				style={{
					padding: s.md,
					backgroundColor: c.surface,
					borderRadius: r.md,
					borderWidth: 1,
					borderColor: c.border,
					marginBottom: s.lg,
				}}
			>
				<ThemedText weight="bold">
					{t('invoice.customer')}: {customer?.name}
				</ThemedText>
				<ThemedText variant="caption" color={c.onSurfaceVariant}>
					{customer?.phone || t('invoice.noPhone')}
				</ThemedText>

				<View style={{ marginTop: s.md }}>
					{lineItems.map((item, idx) => (
						<View key={idx} style={[layout.rowBetween, { marginTop: 4 }]}>
							<ThemedText variant="body">
								{item.quantity}x {item.design_name}
							</ThemedText>
							<ThemedText variant="body">
								{formatCurrency(item.quantity * item.rate_per_unit)}
							</ThemedText>
						</View>
					))}
				</View>

				<View style={{ height: 1, backgroundColor: c.border, marginVertical: s.md }} />

				{/* GST breakdown */}
				{(() => {
					const taxableAmount = lineItems.reduce((acc, item) => {
						return acc + item.quantity * item.rate_per_unit - (item.discount || 0);
					}, 0);
					const gstAmount = lineItems.reduce((acc, item) => {
						const lineSubtotal =
							item.quantity * item.rate_per_unit - (item.discount || 0);
						return acc + lineSubtotal * (item.gst_rate / 100);
					}, 0);
					return (
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
					);
				})()}

				<View style={layout.rowBetween}>
					<ThemedText weight="bold">{t('invoice.grandTotalIncGst')}</ThemedText>
					<ThemedText variant="h3" color={c.primary}>
						{formatCurrency(grandTotal)}
					</ThemedText>
				</View>
			</View>

			{/* Payment Collection */}
			<ThemedText weight="bold" style={{ marginBottom: s.sm }}>
				{t('invoice.paymentCollection')}
			</ThemedText>

			{/* Quick-fill chips */}
			<View style={[layout.row, { gap: s.sm, marginBottom: s.md }]}>
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
								: c.surface,
						borderRadius: r.sm,
						borderWidth: 1,
						borderColor: c.primary,
					}}
				>
					<ThemedText
						variant="caption"
						color={
							amountPaidNum >= grandTotal && amountPaidNum > 0 ? '#FFF' : c.primary
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
								? c.surface
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
				style={{ marginBottom: 4 }}
			>
				{t('invoice.paymentMode')}
			</ThemedText>
			<View style={[layout.row, { gap: s.sm, marginBottom: s.xl, flexWrap: 'wrap' }]}>
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
							backgroundColor: paymentMode === mode ? c.primary : c.surface,
							borderRadius: r.sm,
							borderWidth: 1,
							borderColor: paymentMode === mode ? c.primary : c.border,
						}}
					>
						<ThemedText
							variant="caption"
							color={paymentMode === mode ? '#FFF' : c.onSurface}
						>
							{t(`invoice.paymentModes.${mode}`)}
						</ThemedText>
					</TouchableOpacity>
				))}
			</View>

			{/* Balance — not color-only; label + value announced together */}
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
					backgroundColor: isPaid ? c.success + '20' : c.warning + '20',
					borderRadius: r.md,
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
