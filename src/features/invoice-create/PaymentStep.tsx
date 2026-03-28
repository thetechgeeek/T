import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { FormField } from '@/src/components/molecules/FormField';
import { layout } from '@/src/theme/layout';
import type { InvoiceLineItemInput } from '@/src/types/invoice';
import type { CustomerDraft, PaymentMode } from './useInvoiceCreateFlow';

const PAYMENT_MODES: PaymentMode[] = ['cash', 'upi', 'bank_transfer', 'cheque'];

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
	const { theme } = useTheme();
	const c = theme.colors;
	const s = theme.spacing;
	const r = theme.borderRadius;

	const balanceDue = Math.max(0, grandTotal - amountPaidNum);
	const isPaid = amountPaidNum >= grandTotal;

	return (
		<View>
			<ThemedText variant="h3" style={{ marginBottom: s.md }}>
				Review & Payment
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
				<ThemedText weight="bold">Customer: {customer?.name}</ThemedText>
				<ThemedText variant="caption" color={c.onSurfaceVariant}>
					{customer?.phone || 'No phone provided'}
				</ThemedText>

				<View style={{ marginTop: s.md }}>
					{lineItems.map((item, idx) => (
						<View key={idx} style={[layout.rowBetween, { marginTop: 4 }]}>
							<ThemedText variant="body2">
								{item.quantity}x {item.design_name}
							</ThemedText>
							<ThemedText variant="body2">
								₹{(item.quantity * item.rate_per_unit).toFixed(2)}
							</ThemedText>
						</View>
					))}
				</View>

				<View style={{ height: 1, backgroundColor: c.border, marginVertical: s.md }} />

				<View style={layout.rowBetween}>
					<ThemedText weight="bold">Grand Total (inc. GST)</ThemedText>
					<ThemedText variant="h3" color={c.primary}>
						₹{grandTotal.toFixed(2)}
					</ThemedText>
				</View>
			</View>

			{/* Payment Collection */}
			<ThemedText weight="bold" style={{ marginBottom: s.sm }}>
				Payment Collection
			</ThemedText>

			<FormField
				label="Amount Paid (₹)"
				value={amountPaid}
				placeholder="Enter amount paid"
				keyboardType="numeric"
				onChangeText={setAmountPaid}
			/>

			<ThemedText variant="caption" color={c.onSurfaceVariant} style={{ marginBottom: 4 }}>
				Payment Mode
			</ThemedText>
			<View style={[layout.row, { gap: s.sm, marginBottom: s.xl, flexWrap: 'wrap' }]}>
				{PAYMENT_MODES.map((mode) => (
					<TouchableOpacity
						key={mode}
						onPress={() => setPaymentMode(mode)}
						accessibilityRole="togglebutton"
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
							style={{ textTransform: 'capitalize' }}
						>
							{mode.replace('_', ' ')}
						</ThemedText>
					</TouchableOpacity>
				))}
			</View>

			{/* Balance */}
			<View
				style={{
					padding: s.md,
					backgroundColor: isPaid ? c.success + '20' : c.warning + '20',
					borderRadius: r.md,
				}}
			>
				<ThemedText weight="bold" color={isPaid ? c.success : c.warning}>
					Balance Due: ₹{balanceDue.toFixed(2)}
				</ThemedText>
			</View>
		</View>
	);
}
