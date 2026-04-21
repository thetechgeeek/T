import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useThemeTokens } from '@easydesign/design-system/foundation';
import { useLocale } from '@/src/hooks/useLocale';
import { ThemedText } from '@easydesign/design-system';
import { Button } from '@easydesign/design-system';
import { Screen } from '@easydesign/design-system';
import { Card } from '@easydesign/design-system';
import { Badge } from '@easydesign/design-system';
import { ScreenHeader } from '@easydesign/ui-shell';
import { SPACING_PX } from '@easydesign/design-system/foundation';
import { FONT_SIZE } from '@easydesign/design-system/foundation';
import { useInvoiceCreateFlow } from './useInvoiceCreateFlow';
import { CustomerStep } from './CustomerStep';
import { LineItemsStep } from './LineItemsStep';
import { PaymentStep } from './PaymentStep';

const STEP_BORDER_WIDTH = 1.5;
const STEP_PILL_SIZE = SPACING_PX.xl + SPACING_PX.xs;
const STEP_COUNT = 3;

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
			<View style={[styles.headerSection, { paddingHorizontal: s.lg }]}>
				<Card
					variant="outlined"
					padding="none"
					style={[styles.metaCard, { backgroundColor: c.surface }]}
				>
					<View style={[styles.metaCardHeader, { borderBottomColor: c.border }]}>
						<View style={{ flex: 1 }}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{t('invoice.invoiceNumber')}
							</ThemedText>
							<ThemedText weight="semibold" style={{ marginTop: SPACING_PX.xxs }}>
								{flow.invoiceNumber}
							</ThemedText>
						</View>
						<Badge label={`${flow.step}/${STEP_COUNT}`} variant="neutral" size="sm" />
					</View>
					<View style={styles.metaCardBody}>
						<View
							style={[
								styles.metaCell,
								{
									borderRightColor: c.border,
								},
							]}
						>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{t('invoice.invoiceDate')}
							</ThemedText>
							<ThemedText weight="semibold" style={{ marginTop: SPACING_PX.xxs }}>
								{flow.invoiceDate}
							</ThemedText>
						</View>
						<View style={styles.metaCell}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{t('common.stepIndicator', {
									current: flow.step,
									total: STEP_COUNT,
									label: steps[flow.step - 1],
								})}
							</ThemedText>
						</View>
					</View>
				</Card>

				<Card
					variant="outlined"
					padding="md"
					style={[styles.stepperCard, { backgroundColor: c.surface }]}
				>
					<View
						style={styles.stepper}
						accessibilityRole="progressbar"
						accessibilityValue={{ now: flow.step, min: 1, max: STEP_COUNT }}
						accessibilityLabel={t('common.stepIndicator', {
							current: flow.step,
							total: STEP_COUNT,
							label: steps[flow.step - 1],
						})}
					>
						{steps.map((label, i) => {
							const stepNum = i + 1;
							const isActive = flow.step === stepNum;
							const isCompleted = flow.step > stepNum;
							const circleBackgroundColor =
								isActive || isCompleted ? c.primary : c.surfaceVariant;
							const circleBorderColor = isCompleted
								? c.primary
								: isActive
									? c.primary
									: c.borderStrong;
							const circleTextColor =
								isActive || isCompleted ? c.onPrimary : c.onSurfaceVariant;

							return (
								<React.Fragment key={label}>
									{i > 0 && (
										<View
											style={[
												styles.stepConnector,
												{
													backgroundColor:
														flow.step > stepNum ? c.primary : c.border,
													marginBottom: FONT_SIZE.h3,
												},
											]}
										/>
									)}
									<View style={styles.stepItem}>
										<View
											accessibilityLabel={`invoice-step-${stepNum}`}
											importantForAccessibility={isActive ? 'yes' : 'no'}
											style={[
												styles.stepPill,
												{
													width: STEP_PILL_SIZE,
													height: STEP_PILL_SIZE,
													borderRadius: STEP_PILL_SIZE / 2,
													backgroundColor: circleBackgroundColor,
													borderWidth: isActive ? 0 : STEP_BORDER_WIDTH,
													borderColor: circleBorderColor,
												},
											]}
										>
											<ThemedText
												variant="caption"
												weight="semibold"
												color={circleTextColor}
											>
												{stepNum}
											</ThemedText>
										</View>
										<ThemedText
											variant="caption"
											style={{
												fontSize: FONT_SIZE.captionSmall,
												marginTop: SPACING_PX.sm,
											}}
											color={isActive ? c.onSurface : c.onSurfaceVariant}
											weight={isActive ? 'semibold' : 'regular'}
										>
											{label}
										</ThemedText>
									</View>
								</React.Fragment>
							);
						})}
					</View>
				</Card>
			</View>

			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={{
					paddingHorizontal: s.lg,
					paddingBottom: s.xl,
					gap: s.lg,
				}}
			>
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

			<View
				style={[
					styles.footer,
					{
						borderTopColor: c.border,
						backgroundColor: c.surface,
					},
				]}
			>
				<Button
					title={t('common.back')}
					accessibilityLabel="invoice-back-button"
					accessibilityHint={
						flow.step > 1
							? t('common.goBackToStep', { step: flow.step - 1 })
							: undefined
					}
					variant="ghost"
					tone="neutral"
					emphasis="medium"
					onPress={flow.handleBack}
					disabled={flow.step === 1 || flow.submitting}
					style={{ flex: 1 }}
				/>
				{flow.step < 3 ? (
					<Button
						title={t('common.next')}
						accessibilityLabel="invoice-next-button"
						accessibilityHint={t('common.proceedToStep', { step: flow.step + 1 })}
						onPress={flow.handleNext}
						disabled={!flow.canGoNext}
						style={{ flex: 1 }}
					/>
				) : (
					<Button
						title={flow.submitting ? t('invoice.generating') : t('invoice.generatePDF')}
						onPress={flow.submitInvoice}
						loading={flow.submitting}
						style={{ flex: 1 }}
					/>
				)}
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	headerSection: {
		paddingBottom: SPACING_PX.md,
		gap: SPACING_PX.sm,
	},
	metaCard: {
		overflow: 'hidden',
	},
	metaCardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: SPACING_PX.md,
		paddingHorizontal: SPACING_PX.lg,
		paddingVertical: SPACING_PX.md,
		borderBottomWidth: 1,
	},
	metaCardBody: {
		flexDirection: 'row',
	},
	metaCell: {
		flex: 1,
		paddingHorizontal: SPACING_PX.lg,
		paddingVertical: SPACING_PX.md,
		borderRightWidth: 1,
	},
	stepperCard: {
		overflow: 'hidden',
	},
	stepper: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
	},
	stepItem: {
		alignItems: 'center',
		flexShrink: 1,
	},
	stepConnector: {
		flex: 1,
		height: 2,
		alignSelf: 'center',
		borderRadius: SPACING_PX.xxs,
		marginHorizontal: SPACING_PX.xs,
	},
	stepPill: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	footer: {
		flexDirection: 'row',
		gap: SPACING_PX.sm,
		paddingHorizontal: SPACING_PX.lg,
		paddingTop: SPACING_PX.md,
		paddingBottom: SPACING_PX.lg,
		borderTopWidth: 1,
	},
});
