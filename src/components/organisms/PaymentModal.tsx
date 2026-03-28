import React, { useState } from 'react';
import { Modal, View, StyleSheet, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Button } from '@/src/components/atoms/Button';
import { TextInput } from '@/src/components/atoms/TextInput';
import { Card } from '@/src/components/atoms/Card';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import type { PaymentMode } from '@/src/types/invoice';
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
	const [amount, setAmount] = useState(totalAmount > 0 ? totalAmount.toString() : '');
	const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
	const [notes, setNotes] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSave = async () => {
		if (!amount || parseFloat(amount) <= 0) return;

		setLoading(true);
		try {
			await paymentService.recordPayment({
				payment_date: new Date().toISOString().split('T')[0],
				amount: parseFloat(amount),
				payment_mode: paymentMode,
				direction: 'received',
				customer_id: customerId,
				invoice_id: invoiceId,
				notes: notes || (invoiceNumber ? `Payment for ${invoiceNumber}` : undefined),
			});
			onSuccess();
			onClose();
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	const modes: PaymentMode[] = ['cash', 'upi', 'bank_transfer', 'cheque'];

	return (
		<Modal visible={visible} transparent animationType="slide">
			<View style={styles.overlay}>
				<Screen
					backgroundColor="transparent"
					safeAreaEdges={[]}
					style={styles.keyboardView}
				>
					<View style={[styles.content, { backgroundColor: theme.colors.background }]}>
						<View style={styles.header}>
							<ThemedText variant="h2">Record Payment</ThemedText>
							<Button
								variant="ghost"
								size="sm"
								onPress={onClose}
								leftIcon={<X size={24} color={theme.colors.onSurface} />}
							/>
						</View>

						<ScrollView contentContainerStyle={styles.scroll}>
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
								value={amount}
								onChangeText={setAmount}
								keyboardType="numeric"
								placeholder="0.00"
								style={styles.input}
							/>

							<ThemedText
								variant="label"
								color={theme.colors.onSurfaceVariant}
								style={{
									marginTop: 16,
									marginBottom: 8,
									textTransform: 'uppercase',
								}}
							>
								Payment Mode
							</ThemedText>
							<View style={styles.modeGrid}>
								{modes.map((mode) => (
									<Button
										key={mode}
										title={mode.replace('_', ' ').toUpperCase()}
										variant={paymentMode === mode ? 'primary' : 'outline'}
										size="sm"
										style={styles.modeButton}
										onPress={() => setPaymentMode(mode)}
									/>
								))}
							</View>

							<TextInput
								label="Notes"
								value={notes}
								onChangeText={setNotes}
								placeholder="Optional remarks"
								multiline
								numberOfLines={2}
								style={styles.input}
							/>

							<Button
								title={loading ? 'Processing...' : 'Record Payment'}
								onPress={handleSave}
								loading={loading}
								style={styles.saveButton}
							/>
						</ScrollView>
					</View>
				</Screen>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.5)',
		justifyContent: 'flex-end',
	},
	keyboardView: {
		width: '100%',
	},
	content: {
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
		maxHeight: '80%',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	title: {
		fontSize: 20,
	},
	subtitle: {
		fontSize: 14,
		marginBottom: 20,
	},
	scroll: {
		paddingBottom: 20,
	},
	label: {
		fontSize: 12,
		fontWeight: '700',
		marginBottom: 8,
		textTransform: 'uppercase',
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
	input: {
		marginBottom: 16,
	},
	saveButton: {
		marginTop: 12,
	},
});
