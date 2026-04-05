import React, { useState, useEffect } from 'react';
import { Alert, Modal, View, StyleSheet, ScrollView, Platform } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PAYMENT_MODES } from '@/src/constants/paymentModes';
import { X } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Button } from '@/src/components/atoms/Button';
import { TextInput } from '@/src/components/atoms/TextInput';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import type { UUID } from '@/src/types/common';
import { paymentService } from '@/src/services/paymentService';

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
			Alert.alert('Invalid Amount', 'Please enter a valid amount greater than zero.');
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
				notes: notes || (invoiceNumber ? `Payment for ${invoiceNumber}` : undefined),
			});
			onSuccess();
			onClose();
		} catch (e) {
			Alert.alert(
				'Payment Failed',
				e instanceof Error ? e.message : 'An unexpected error occurred',
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
							paddingBottom: Math.max(insets.bottom, 16),
						},
					]}
					accessibilityViewIsModal={true}
					importantForAccessibility="yes"
				>
					<View style={styles.handle} />

					<View style={styles.header}>
						<ThemedText variant="h2">Record Payment</ThemedText>
						<Button
							variant="ghost"
							size="sm"
							onPress={onClose}
							accessibilityLabel="Close payment dialog"
							testID="close-modal-button"
							accessibilityHint="Dismiss the payment dialog"
							leftIcon={<X size={24} color={theme.colors.onSurface} />}
						/>
					</View>

					<ScrollView
						contentContainerStyle={styles.scroll}
						keyboardShouldPersistTaps="handled"
					>
						<ThemedText
							variant="body2"
							color={theme.colors.onSurfaceVariant}
							style={{ marginBottom: 20 }}
						>
							{invoiceNumber
								? `Invoice: ${invoiceNumber}`
								: `Customer: ${customerName}`}
						</ThemedText>

						<TextInput
							label="Amount (₹)"
							accessibilityLabel="payment-amount-input"
							accessibilityHint="Enter the payment amount in rupees"
							value={amount}
							onChangeText={setAmount}
							keyboardType="numeric"
							placeholder="0.00"
							autoFocus
						/>

						<ThemedText
							variant="label"
							color={theme.colors.onSurfaceVariant}
							importantForAccessibility="no"
							style={{
								marginTop: 16,
								marginBottom: 8,
								textTransform: 'uppercase',
							}}
						>
							Payment Mode
						</ThemedText>
						<View
							style={styles.modeGrid}
							accessible={false}
							accessibilityLabel="Select payment mode"
						>
							{modes.map((mode) => (
								<Button
									key={mode}
									title={mode.replace('_', ' ').toUpperCase()}
									accessibilityLabel={`payment-mode-${mode}`}
									accessibilityHint={`Pay via ${mode.replace('_', ' ')}`}
									variant={paymentMode === mode ? 'primary' : 'outline'}
									size="sm"
									style={styles.modeButton}
									onPress={() => setPaymentMode(mode)}
								/>
							))}
						</View>

						<TextInput
							label="Notes"
							accessibilityLabel="payment-notes-input"
							value={notes}
							onChangeText={setNotes}
							placeholder="Optional remarks"
							multiline
							numberOfLines={2}
						/>

						<Button
							title={loading ? 'Processing...' : 'Record Payment'}
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
		backgroundColor: 'rgba(0,0,0,0.5)',
		justifyContent: 'flex-end',
	},
	handle: {
		width: 40,
		height: 4,
		borderRadius: 2,
		backgroundColor: 'rgba(128,128,128,0.4)',
		alignSelf: 'center',
		marginBottom: 12,
	},
	content: {
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		paddingTop: 12,
		paddingHorizontal: 20,
		maxHeight: '90%',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	scroll: {
		paddingBottom: 8,
	},
	modeGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		marginBottom: 20,
	},
	modeButton: {
		flex: 1,
		minWidth: '45%',
	},
	saveButton: {
		marginTop: 12,
	},
});
