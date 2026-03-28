import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { Screen } from '@/src/components/atoms/Screen';
import { useInvoiceCreateFlow } from './useInvoiceCreateFlow';
import { CustomerStep } from './CustomerStep';
import { LineItemsStep } from './LineItemsStep';
import { PaymentStep } from './PaymentStep';

export default function InvoiceCreateScreen() {
	const { c, s } = useThemeTokens();

	const flow = useInvoiceCreateFlow();

	return (
		<Screen withKeyboard safeAreaEdges={['top', 'bottom']}>
			{/* Stepper */}
			<View style={[styles.stepper, { borderBottomColor: c.border }]}>
				{(['Customer', 'Items', 'Review'] as const).map((label, i) => (
					<ThemedText
						key={label}
						variant="label"
						color={flow.step === i + 1 ? c.primary : c.onSurfaceVariant}
					>
						{i + 1}. {label}
					</ThemedText>
				))}
			</View>

			<ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: s.lg }}>
				{flow.step === 1 && (
					<CustomerStep
						customer={flow.customer}
						setCustomer={flow.setCustomer}
						isInterState={flow.isInterState}
						setIsInterState={flow.setIsInterState}
					/>
				)}
				{flow.step === 2 && (
					<LineItemsStep
						lineItems={flow.lineItems}
						removeLineItem={flow.removeLineItem}
						isAddingItem={flow.isAddingItem}
						setIsAddingItem={flow.setIsAddingItem}
						inventoryItems={flow.inventoryItems}
						inventoryLoading={flow.inventoryLoading}
						searchQuery={flow.searchQuery}
						setSearchQuery={flow.setSearchQuery}
						selectedItem={flow.selectedItem}
						selectInventoryItem={flow.selectInventoryItem}
						cancelItemSelection={flow.cancelItemSelection}
						inputQuantity={flow.inputQuantity}
						setInputQuantity={flow.setInputQuantity}
						inputDiscount={flow.inputDiscount}
						setInputDiscount={flow.setInputDiscount}
						addLineItem={flow.addLineItem}
					/>
				)}
				{flow.step === 3 && (
					<PaymentStep
						customer={flow.customer}
						lineItems={flow.lineItems}
						grandTotal={flow.grandTotal}
						amountPaid={flow.amountPaid}
						setAmountPaid={flow.setAmountPaid}
						amountPaidNum={flow.amountPaidNum}
						paymentMode={flow.paymentMode}
						setPaymentMode={flow.setPaymentMode}
					/>
				)}
			</ScrollView>

			{/* Footer nav */}
			<View style={[styles.footer, { borderTopColor: c.border, backgroundColor: c.surface }]}>
				<Button
					title="Back"
					variant="ghost"
					onPress={flow.handleBack}
					disabled={flow.step === 1 || flow.submitting}
					style={{ flex: 1, marginRight: s.xs }}
				/>
				{flow.step < 3 ? (
					<Button
						title="Next"
						onPress={flow.handleNext}
						disabled={!flow.canGoNext}
						style={{ flex: 1, marginLeft: s.xs }}
					/>
				) : (
					<Button
						title={flow.submitting ? 'Generating...' : 'Generate Invoice'}
						onPress={flow.submitInvoice}
						loading={flow.submitting}
						style={{ flex: 1, marginLeft: s.xs }}
					/>
				)}
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	stepper: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		padding: 16,
		borderBottomWidth: 1,
	},
	footer: {
		flexDirection: 'row',
		padding: 16,
		borderTopWidth: 1,
	},
});
