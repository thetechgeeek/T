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
import { TextInput } from '@/src/design-system/components/atoms/TextInput';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { SPACING_PX, TOUCH_TARGET_MIN_PX } from '@/src/theme/layoutMetrics';

/* eslint-disable @typescript-eslint/no-magic-numbers -- these widths define the explicit small / medium / large dialog variants. */
const MODAL_MAX_WIDTH = {
	sm: 360,
	md: 480,
	lg: 640,
} as const;
/* eslint-enable @typescript-eslint/no-magic-numbers */

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
	size?: keyof typeof MODAL_MAX_WIDTH;
	restoreFocusRef?: React.RefObject<unknown> | { current: unknown } | null;
	hardConfirmValue?: string;
	hardConfirmLabel?: string;
	hardConfirmPlaceholder?: string;
	hardConfirmHelperText?: string;
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
			size = 'md',
			restoreFocusRef,
			hardConfirmValue,
			hardConfirmLabel = 'Type to confirm',
			hardConfirmPlaceholder,
			hardConfirmHelperText,
			testID,
			style,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const cancelButtonRef = useRef<React.ElementRef<typeof Pressable> | null>(null);
		const wasOpenRef = useRef(false);
		const [focusedAction, setFocusedAction] = useState<'cancel' | 'confirm' | null>(null);
		const [confirmationInput, setConfirmationInput] = useState('');
		const [isOpen, setIsOpen] = useControllableState({
			value: open ?? visible,
			defaultValue: defaultOpen || visible === true,
			onChange: (nextOpen, meta) =>
				onOpenChange?.(nextOpen, {
					source: meta?.source === 'confirm' ? 'confirm' : 'cancel',
				}),
		});
		const requiresHardConfirmation = Boolean(hardConfirmValue?.trim());
		const expectedConfirmationValue = hardConfirmValue?.trim() ?? '';
		const hardConfirmationMatches =
			!requiresHardConfirmation || confirmationInput.trim() === expectedConfirmationValue;

		useEffect(() => {
			if (!isOpen) {
				return;
			}

			void announceForScreenReader(`${title}. ${message}`);
			void Promise.resolve().then(() => {
				setConfirmationInput('');
				setAccessibilityFocus(cancelButtonRef);
			});
		}, [isOpen, message, title]);

		useEffect(() => {
			if (wasOpenRef.current && !isOpen) {
				void Promise.resolve().then(() => {
					setAccessibilityFocus(restoreFocusRef);
				});
			}

			wasOpenRef.current = isOpen;
		}, [isOpen, restoreFocusRef]);

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
						testID={testID ? `${testID}-card` : undefined}
						style={[
							styles.card,
							{
								backgroundColor: c.surface,
								borderRadius: theme.borderRadius.lg,
								maxWidth: MODAL_MAX_WIDTH[size],
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
						{requiresHardConfirmation ? (
							<TextInput
								label={hardConfirmLabel}
								accessibilityLabel={hardConfirmLabel}
								value={confirmationInput}
								onValueChange={setConfirmationInput}
								placeholder={hardConfirmPlaceholder ?? expectedConfirmationValue}
								helperText={
									hardConfirmHelperText ??
									`Type ${expectedConfirmationValue} to enable ${confirmLabel}.`
								}
								autoCapitalize="none"
								autoCorrect={false}
								testID={testID ? `${testID}-hard-confirm` : undefined}
								containerStyle={styles.hardConfirmField}
							/>
						) : null}
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
									if (!hardConfirmationMatches) {
										return;
									}
									onConfirm();
									setIsOpen(false, { source: 'confirm' });
								}}
								onFocus={() => setFocusedAction('confirm')}
								onBlur={() => setFocusedAction(null)}
								accessibilityRole="button"
								accessibilityLabel={confirmLabel}
								accessibilityState={{ disabled: !hardConfirmationMatches }}
								disabled={!hardConfirmationMatches}
								style={[
									styles.button,
									{
										backgroundColor: hardConfirmationMatches
											? variant === 'destructive'
												? c.error
												: c.primary
											: c.surfaceVariant,
										borderRadius: theme.borderRadius.md,
										marginStart: theme.spacing.sm,
									},
									hardConfirmationMatches && focusedAction === 'confirm'
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
										color: hardConfirmationMatches
											? variant === 'destructive'
												? c.onError
												: c.onPrimary
											: c.onSurfaceVariant,
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
	hardConfirmField: {
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
