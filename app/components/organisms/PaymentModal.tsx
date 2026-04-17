import React, { useState, useEffect } from 'react';
import { Alert, Modal, View, StyleSheet, ScrollView, Platform } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PAYMENT_MODES } from '@/src/constants/paymentModes';
import {
	OVERLAY_COLOR_STRONG,
	OPACITY_SEPARATOR,
	SIZE_MODAL_HANDLE_HEIGHT,
	SIZE_MODAL_HANDLE_WIDTH,
} from '@/src/theme/uiMetrics';
import { SPACING_PX, BORDER_RADIUS_PX } from '@/src/theme/layoutMetrics';
import { withOpacity } from '@/src/utils/color';
import { X } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Button } from '@/src/design-system/components/atoms/Button';
import { TextInput } from '@/src/design-system/components/atoms/TextInput';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import type { UUID } from '@/src/types/common';
import { paymentService } from '@/src/services/paymentService';
import { useLocale } from '@/src/hooks/useLocale';

interface PaymentModalProps {
	visible: boolean;
	onClose: () => void;
	customerId?: UUID;
	customerName?: string;
	invoiceId?: UUID;
	invoiceNumber?: string;
	totalAmount?: number;
	onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
	visible,
	onClose,
	customerId,
	customerName,
	invoiceId,
	invoiceNumber,
	totalAmount = 0,
	onSuccess,
}) => {
	const { theme } = useTheme();
	const { t } = useLocale();
	const insets = useSafeAreaInsets();
	const [amount, setAmount] = useState(totalAmount > 0 ? totalAmount.toString() : '');
	const [paymentMode, setPaymentMode] = useState(PAYMENT_MODES[0].value);
	const [notes, setNotes] = useState('');
	const [loading, setLoading] = useState(false);

	// Reset form state each time the modal opens
	useEffect(() => {
		if (visible) {
			setAmount(totalAmount > 0 ? totalAmount.toString() : '');
			setPaymentMode(PAYMENT_MODES[0].value);
			setNotes('');
			setLoading(false);
		}
	}, [visible, totalAmount]);

	const handleSave = async () => {
		const parsed = parseFloat(amount);
		if (!amount || isNaN(parsed) || parsed <= 0) {
			Alert.alert(t('common.errorTitle'), t('inventory.stockOpValidationError'));
			return;
		}

		setLoading(true);
		try {
			await paymentService.recordPayment({
				payment_date: new Date().toISOString().split('T')[0],
				amount: parsed,
				payment_mode: paymentMode,
				direction: 'received',
				customer_id: customerId,
				invoice_id: invoiceId,
				notes:
					notes ||
					(invoiceNumber ? t('invoice.paymentFor', { invoiceNumber }) : undefined),
			});
			onSuccess();
			onClose();
		} catch (e) {
			Alert.alert(
				t('common.errorTitle'),
				e instanceof Error ? e.message : t('common.unexpectedError'),
			);
		} finally {
			setLoading(false);
		}
	};

	const modes = PAYMENT_MODES.map((m) => m.value);

	return (
		<Modal visible={visible} transparent animationType="slide">
			<KeyboardAvoidingView
				style={styles.overlay}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			>
				<View
					style={[
						styles.content,
						{
							backgroundColor: theme.colors.background,
							paddingBottom: Math.max(insets.bottom, theme.spacing.lg),
						},
					]}
					accessibilityViewIsModal={true}
					importantForAccessibility="yes"
				>
					<View
						style={[
							styles.handle,
							{
								backgroundColor: withOpacity(
									theme.colors.onSurfaceVariant,
									OPACITY_SEPARATOR,
								),
							},
						]}
					/>

					<View style={styles.header}>
						<ThemedText variant="h2">{t('invoice.recordPayment')}</ThemedText>
						<Button
							variant="ghost"
							size="sm"
							onPress={onClose}
							accessibilityLabel={t('common.cancel')}
							testID="close-modal-button"
							accessibilityHint={t('common.cancel')}
							leftIcon={<X size={24} color={theme.colors.onSurface} />}
						/>
					</View>

					<ScrollView
						contentContainerStyle={styles.scroll}
						keyboardShouldPersistTaps="handled"
					>
						<ThemedText
							variant="body"
							color={theme.colors.onSurfaceVariant}
							style={{ marginBottom: theme.spacing.xl }}
						>
							{invoiceNumber
								? t('invoice.invoiceNumber') + `: ${invoiceNumber}`
								: t('invoice.customer') + `: ${customerName}`}
						</ThemedText>

						<TextInput
							label={t('finance.amount')}
							accessibilityLabel="payment-amount-input"
							accessibilityHint={t('finance.placeholders.amount')}
							value={amount}
							onChangeText={setAmount}
							keyboardType="numeric"
							placeholder={t('finance.placeholders.amount')}
							autoFocus
						/>

						<ThemedText
							variant="label"
							color={theme.colors.onSurfaceVariant}
							importantForAccessibility="no"
							style={{
								marginTop: theme.spacing.lg,
								marginBottom: theme.spacing.sm,
								textTransform: 'uppercase',
							}}
						>
							{t('invoice.paymentMode')}
						</ThemedText>
						<View
							style={styles.modeGrid}
							accessible={false}
							accessibilityLabel={t('invoice.paymentMode')}
						>
							{modes.map((mode) => (
								<Button
									key={mode}
									title={t(`invoice.paymentModes.${mode}`).toUpperCase()}
									accessibilityLabel={`payment-mode-${mode}`}
									accessibilityHint={t(`invoice.paymentModes.${mode}`)}
									variant={paymentMode === mode ? 'primary' : 'outline'}
									size="sm"
									style={styles.modeButton}
									onPress={() => setPaymentMode(mode)}
								/>
							))}
						</View>

						<TextInput
							label={t('inventory.notes')}
							accessibilityLabel="payment-notes-input"
							value={notes}
							onChangeText={setNotes}
							placeholder={t('finance.placeholders.notes')}
							multiline
							numberOfLines={2}
						/>

						<Button
							title={loading ? t('common.loading') : t('invoice.recordPayment')}
							accessibilityLabel="submit-payment-button"
							testID="submit-payment-button"
							onPress={handleSave}
							loading={loading}
							style={styles.saveButton}
						/>
					</ScrollView>
				</View>
			</KeyboardAvoidingView>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: OVERLAY_COLOR_STRONG,
		justifyContent: 'flex-end',
	},
	handle: {
		width: SIZE_MODAL_HANDLE_WIDTH,
		height: SIZE_MODAL_HANDLE_HEIGHT,
		borderRadius: BORDER_RADIUS_PX.xs,
		alignSelf: 'center',
		marginBottom: SPACING_PX.md,
	},
	content: {
		borderTopLeftRadius: BORDER_RADIUS_PX.xl,
		borderTopRightRadius: BORDER_RADIUS_PX.xl,
		paddingTop: SPACING_PX.md,
		paddingHorizontal: SPACING_PX.xl,
		maxHeight: '90%',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: SPACING_PX.lg,
	},
	scroll: {
		paddingBottom: SPACING_PX.sm,
	},
	modeGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: SPACING_PX.sm,
		marginBottom: SPACING_PX.xl,
	},
	modeButton: {
		flex: 1,
		minWidth: '45%',
	},
	saveButton: {
		marginTop: SPACING_PX.md,
	},
});
