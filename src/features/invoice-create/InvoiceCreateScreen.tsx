import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { Screen } from '@/src/components/atoms/Screen';
import { useInvoiceCreateFlow } from './useInvoiceCreateFlow';
import { CustomerStep } from './CustomerStep';
import { LineItemsStep } from './LineItemsStep';
import { PaymentStep } from './PaymentStep';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';

export default function InvoiceCreateScreen() {
	const { c, s } = useThemeTokens();
	const { t } = useLocale();

	const flow = useInvoiceCreateFlow();
	const steps = [
		t('invoice.stepCustomer'),
		t('invoice.stepItems'),
		t('invoice.stepReview'),
	] as const;

	return (
		<Screen withKeyboard safeAreaEdges={['bottom']}>
			<ScreenHeader title={t('invoice.createInvoice')} />
			{/* Stepper — announced as a progress indicator */}
			<View
				style={[styles.stepper, { borderBottomColor: c.border }]}
				accessibilityRole="progressbar"
				accessibilityValue={{ now: flow.step, min: 1, max: 3 }}
				accessibilityLabel={t('common.stepIndicator', {
					current: flow.step,
					total: 3,
					label: steps[flow.step - 1],
				})}
			>
				{steps.map((label, i) => {
					const stepNum = i + 1;
					const isActive = flow.step === stepNum;
					const isCompleted = flow.step > stepNum;

					const dotSize = isActive ? 12 : 10;
					const dotStyle = isActive
						? { backgroundColor: c.primary, borderWidth: 0 }
						: isCompleted
							? {
									backgroundColor: 'transparent',
									borderWidth: 1.5,
									borderColor: c.primary,
								}
							: {
									backgroundColor: '#E0E0E0',
									borderWidth: 1.5,
									borderColor: '#B0B0B0',
								};

					return (
						<React.Fragment key={label}>
							{i > 0 && (
								<View
									style={{
										flex: 1,
										height: 1,
										backgroundColor: '#B0B0B0',
										alignSelf: 'center',
										marginBottom: 18,
									}}
								/>
							)}
							<View style={{ alignItems: 'center' }}>
								<View
									accessibilityLabel={`invoice-step-${stepNum}`}
									importantForAccessibility={isActive ? 'yes' : 'no'}
									style={[
										{
											width: dotSize,
											height: dotSize,
											borderRadius: dotSize / 2,
										},
										dotStyle,
									]}
								/>
								<ThemedText
									variant="caption"
									style={{ fontSize: 11, marginTop: 4 }}
									color={isActive ? c.primary : c.onSurfaceVariant}
								>
									{label}
								</ThemedText>
							</View>
						</React.Fragment>
					);
				})}
			</View>

			<ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: s.lg }}>
				{flow.step === 1 && (
					<CustomerStep
						customer={flow.customer}
						setCustomer={flow.setCustomer}
						isInterState={flow.isInterState}
						setIsInterState={flow.setIsInterState}
						invoiceDate={flow.invoiceDate}
						setInvoiceDate={flow.setInvoiceDate}
						invoiceNumber={flow.invoiceNumber}
						setInvoiceNumber={flow.setInvoiceNumber}
						isCashSale={flow.isCashSale}
						setIsCashSale={flow.setIsCashSale}
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
					title={t('common.back')}
					accessibilityLabel="invoice-back-button"
					accessibilityHint={
						flow.step > 1
							? t('common.goBackToStep', { step: flow.step - 1 })
							: undefined
					}
					variant="ghost"
					onPress={flow.handleBack}
					disabled={flow.step === 1 || flow.submitting}
					style={{ flex: 1, marginRight: s.xs }}
				/>
				{flow.step < 3 ? (
					<Button
						title={t('common.next')}
						accessibilityLabel="invoice-next-button"
						accessibilityHint={t('common.proceedToStep', { step: flow.step + 1 })}
						onPress={flow.handleNext}
						disabled={!flow.canGoNext}
						style={{ flex: 1, marginLeft: s.xs }}
					/>
				) : (
					<Button
						title={flow.submitting ? t('invoice.generating') : t('invoice.generatePDF')}
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
		justifyContent: 'center',
		alignItems: 'flex-start',
		paddingHorizontal: 32,
		paddingVertical: 12,
		borderBottomWidth: 1,
	},
	footer: {
		flexDirection: 'row',
		padding: 16,
		borderTopWidth: 1,
	},
});
