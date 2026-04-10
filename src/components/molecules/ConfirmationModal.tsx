import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

export interface ConfirmationModalProps {
	visible: boolean;
	title: string;
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
	confirmLabel?: string;
	cancelLabel?: string;
	/** Use 'destructive' for delete/void actions — confirm button renders red */
	variant?: 'default' | 'destructive';
	testID?: string;
}

/**
 * P0.5 — ConfirmationModal
 * Dark overlay, white card, title + message, Cancel + Confirm buttons side-by-side.
 * Accessible: role alert (closest available in RN), Cancel is first focusable.
 */
export function ConfirmationModal({
	visible,
	title,
	message,
	onConfirm,
	onCancel,
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
	variant = 'default',
	testID,
}: ConfirmationModalProps) {
	const { theme } = useTheme();
	const c = theme.colors;

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onCancel}
			statusBarTranslucent
		>
			<View
				testID={testID}
				style={[styles.overlay, { backgroundColor: c.scrim }]}
				accessibilityRole="alert"
				accessibilityViewIsModal
				importantForAccessibility="yes"
			>
				<View
					style={[
						styles.card,
						{
							backgroundColor: c.surface,
							borderRadius: theme.borderRadius.lg,
						},
					]}
				>
					<Text
						style={[
							styles.title,
							{ color: c.onSurface, fontSize: theme.typography.sizes.lg },
						]}
					>
						{title}
					</Text>
					<Text
						style={[
							styles.message,
							{ color: c.onSurfaceVariant, fontSize: theme.typography.sizes.md },
						]}
					>
						{message}
					</Text>
					<View style={styles.actions}>
						<Pressable
							onPress={onCancel}
							accessibilityRole="button"
							accessibilityLabel={cancelLabel}
							style={[
								styles.button,
								{
									borderColor: c.border,
									borderWidth: 1,
									borderRadius: theme.borderRadius.md,
								},
							]}
						>
							<Text
								style={{ color: c.onSurface, fontSize: theme.typography.sizes.md }}
							>
								{cancelLabel}
							</Text>
						</Pressable>
						<Pressable
							onPress={onConfirm}
							accessibilityRole="button"
							accessibilityLabel={confirmLabel}
							style={[
								styles.button,
								{
									backgroundColor:
										variant === 'destructive' ? c.error : c.primary,
									borderRadius: theme.borderRadius.md,
									marginLeft: theme.spacing.sm,
								},
							]}
						>
							<Text
								style={{
									color: variant === 'destructive' ? c.onError : c.onPrimary,
									fontSize: theme.typography.sizes.md,
									fontWeight: '600',
								}}
							>
								{confirmLabel}
							</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 24,
	},
	card: {
		width: '100%',
		padding: 24,
	},
	title: {
		fontWeight: '700',
		marginBottom: 8,
	},
	message: {
		marginBottom: 24,
		lineHeight: 24,
	},
	actions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
	},
	button: {
		minHeight: 48,
		paddingHorizontal: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
