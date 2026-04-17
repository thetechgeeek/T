import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Modal, View, StyleSheet, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { useControllableState } from '@/src/hooks/useControllableState';
import {
	announceForScreenReader,
	buildFocusRingStyle,
	mapAccessibilityActionNames,
	setAccessibilityFocus,
} from '@/src/utils/accessibility';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { SPACING_PX, TOUCH_TARGET_MIN_PX } from '@/src/theme/layoutMetrics';

export interface ConfirmationModalProps {
	visible?: boolean;
	open?: boolean;
	defaultOpen?: boolean;
	title: string;
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
	onOpenChange?: (open: boolean, meta?: { source: 'confirm' | 'cancel' }) => void;
	confirmLabel?: string;
	cancelLabel?: string;
	/** Use 'destructive' for delete/void actions — confirm button renders red */
	variant?: 'default' | 'destructive';
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

/**
 * P0.5 — ConfirmationModal
 * Dark overlay, white card, title + message, Cancel + Confirm buttons side-by-side.
 * Accessible: role alert (closest available in RN), Cancel is first focusable.
 */
export const ConfirmationModal = forwardRef<React.ElementRef<typeof View>, ConfirmationModalProps>(
	(
		{
			visible,
			open,
			defaultOpen = false,
			title,
			message,
			onConfirm,
			onCancel,
			onOpenChange,
			confirmLabel = 'Confirm',
			cancelLabel = 'Cancel',
			variant = 'default',
			testID,
			style,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const cancelButtonRef = useRef<React.ElementRef<typeof Pressable> | null>(null);
		const [focusedAction, setFocusedAction] = useState<'cancel' | 'confirm' | null>(null);
		const [isOpen, setIsOpen] = useControllableState({
			value: open ?? visible,
			defaultValue: defaultOpen || visible === true,
			onChange: (nextOpen, meta) =>
				onOpenChange?.(nextOpen, {
					source: meta?.source === 'confirm' ? 'confirm' : 'cancel',
				}),
		});

		useEffect(() => {
			if (!isOpen) {
				return;
			}

			void announceForScreenReader(`${title}. ${message}`);
			void Promise.resolve().then(() => {
				setAccessibilityFocus(cancelButtonRef);
			});
		}, [isOpen, message, title]);

		if (!isOpen) {
			return null;
		}

		return (
			<Modal
				visible={isOpen}
				transparent
				animationType="fade"
				onRequestClose={() => {
					setIsOpen(false, { source: 'cancel' });
					onCancel();
				}}
				statusBarTranslucent
			>
				<View
					testID={testID}
					style={[styles.overlay, { backgroundColor: c.scrim }]}
					accessibilityRole="alert"
					accessibilityViewIsModal
					importantForAccessibility="yes"
					accessibilityActions={mapAccessibilityActionNames([
						{ name: 'confirm', label: confirmLabel },
						{ name: 'cancel', label: cancelLabel },
					])}
					onAccessibilityAction={(event) => {
						if (event.nativeEvent.actionName === 'confirm') {
							onConfirm();
							setIsOpen(false, { source: 'confirm' });
							return;
						}
						if (event.nativeEvent.actionName === 'cancel') {
							onCancel();
							setIsOpen(false, { source: 'cancel' });
						}
					}}
				>
					<View
						ref={ref}
						style={[
							styles.card,
							{
								backgroundColor: c.surface,
								borderRadius: theme.borderRadius.lg,
							},
							style,
						]}
					>
						<ThemedText
							variant="sectionTitle"
							style={[
								styles.title,
								{ color: c.onSurface, fontSize: theme.typography.sizes.lg },
							]}
						>
							{title}
						</ThemedText>
						<ThemedText
							variant="body"
							style={[
								styles.message,
								{
									color: c.onSurfaceVariant,
									fontSize: theme.typography.sizes.md,
									lineHeight: theme.typography.variants.body.lineHeight,
								},
							]}
						>
							{message}
						</ThemedText>
						<View style={styles.actions}>
							<Pressable
								ref={cancelButtonRef}
								onPress={() => {
									setIsOpen(false, { source: 'cancel' });
									onCancel();
								}}
								onFocus={() => setFocusedAction('cancel')}
								onBlur={() => setFocusedAction(null)}
								accessibilityRole="button"
								accessibilityLabel={cancelLabel}
								style={[
									styles.button,
									{
										borderColor: c.border,
										borderWidth: 1,
										borderRadius: theme.borderRadius.md,
									},
									focusedAction === 'cancel'
										? buildFocusRingStyle({
												color: c.primary,
												radius: theme.borderRadius.md,
											})
										: null,
								]}
							>
								<ThemedText
									variant="body"
									style={{
										color: c.onSurface,
										fontSize: theme.typography.sizes.md,
									}}
								>
									{cancelLabel}
								</ThemedText>
							</Pressable>
							<Pressable
								onPress={() => {
									onConfirm();
									setIsOpen(false, { source: 'confirm' });
								}}
								onFocus={() => setFocusedAction('confirm')}
								onBlur={() => setFocusedAction(null)}
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
									focusedAction === 'confirm'
										? buildFocusRingStyle({
												color:
													variant === 'destructive'
														? c.onError
														: c.onPrimary,
												radius: theme.borderRadius.md,
											})
										: null,
								]}
							>
								<ThemedText
									variant="body"
									weight="semibold"
									style={{
										color: variant === 'destructive' ? c.onError : c.onPrimary,
										fontSize: theme.typography.sizes.md,
									}}
								>
									{confirmLabel}
								</ThemedText>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		);
	},
);

ConfirmationModal.displayName = 'ConfirmationModal';

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: SPACING_PX.xl,
	},
	card: {
		width: '100%',
		padding: SPACING_PX.xl,
	},
	title: {
		fontWeight: '700',
		marginBottom: SPACING_PX.sm,
	},
	message: {
		marginBottom: SPACING_PX.xl,
	},
	actions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
	},
	button: {
		minHeight: TOUCH_TARGET_MIN_PX,
		paddingHorizontal: SPACING_PX.lg,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
