import React, { forwardRef, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Modal, View, StyleSheet, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import {
	createModalStackId,
	claimModalStackSlot,
	getModalStackSnapshot,
	releaseModalStackSlot,
	subscribeModalStack,
} from '@/src/design-system/modalStack';
import { resolveOverlayDensityStyles, type OverlayDensity } from '@/src/design-system/overlayUtils';
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
	density?: OverlayDensity;
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
			density = 'default',
			testID,
			style,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const cancelButtonRef = useRef<React.ElementRef<typeof Pressable> | null>(null);
		const wasOpenRef = useRef(false);
		const [stackId] = useState(() => createModalStackId('confirmation-modal'));
		const stackRegisteredRef = useRef(false);
		const stackBlockedRef = useRef(false);
		const onCancelRef = useRef(onCancel);
		const [focusedAction, setFocusedAction] = useState<'cancel' | 'confirm' | null>(null);
		const [confirmationInput, setConfirmationInput] = useState('');
		const activeModalStack = useSyncExternalStore(subscribeModalStack, getModalStackSnapshot);
		const [isOpen, setIsOpen] = useControllableState({
			value: open ?? visible,
			defaultValue: defaultOpen || visible === true,
			onChange: (nextOpen, meta) =>
				onOpenChange?.(nextOpen, {
					source: meta?.source === 'confirm' ? 'confirm' : 'cancel',
				}),
		});
		const setIsOpenRef = useRef(setIsOpen);
		const requiresHardConfirmation = Boolean(hardConfirmValue?.trim());
		const expectedConfirmationValue = hardConfirmValue?.trim() ?? '';
		const hardConfirmationMatches =
			!requiresHardConfirmation || confirmationInput.trim() === expectedConfirmationValue;
		const densityStyles = resolveOverlayDensityStyles(theme, density);
		const stackAccepted = !isOpen || activeModalStack.includes(stackId);
		const resetConfirmationInput = () => {
			if (confirmationInput.length > 0) {
				setConfirmationInput('');
			}
		};
		const closeModal = (source: 'confirm' | 'cancel', callback?: () => void) => {
			resetConfirmationInput();
			setIsOpen(false, { source });
			callback?.();
		};

		useEffect(() => {
			onCancelRef.current = onCancel;
		}, [onCancel]);

		useEffect(() => {
			setIsOpenRef.current = setIsOpen;
		}, [setIsOpen]);

		useEffect(() => {
			if (!isOpen) {
				return;
			}

			void announceForScreenReader(`${title}. ${message}`);
			void Promise.resolve().then(() => {
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

		useEffect(() => {
			if (!isOpen) {
				stackBlockedRef.current = false;
				return;
			}

			if (stackBlockedRef.current || stackRegisteredRef.current) {
				return;
			}

			const claim = claimModalStackSlot(stackId);
			if (!claim.accepted) {
				stackBlockedRef.current = true;
				setIsOpenRef.current(false, { source: 'cancel' });
				onCancelRef.current();
				return;
			}

			stackRegisteredRef.current = true;

			return () => {
				if (stackRegisteredRef.current) {
					releaseModalStackSlot(stackId);
					stackRegisteredRef.current = false;
				}
			};
		}, [isOpen, stackId]);

		if (!isOpen || !stackAccepted) {
			return null;
		}

		return (
			<Modal
				visible={isOpen}
				transparent
				animationType="fade"
				onRequestClose={() => closeModal('cancel', onCancel)}
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
							if (!hardConfirmationMatches) {
								return;
							}
							closeModal('confirm', onConfirm);
							return;
						}
						if (event.nativeEvent.actionName === 'cancel') {
							closeModal('cancel', onCancel);
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
								paddingHorizontal: densityStyles.paddingHorizontal,
								paddingVertical: densityStyles.paddingVertical,
							},
							style,
						]}
					>
						<ThemedText
							variant="sectionTitle"
							style={[
								styles.title,
								{
									color: c.onSurface,
									fontSize: theme.typography.sizes.lg,
									marginBottom: densityStyles.headerGap,
								},
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
									marginBottom: densityStyles.sectionGap,
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
								containerStyle={{
									marginBottom: densityStyles.sectionGap,
								}}
							/>
						) : null}
						<View
							style={[
								styles.actions,
								{
									columnGap: densityStyles.actionGap,
								},
							]}
						>
							<Pressable
								ref={cancelButtonRef}
								onPress={() => closeModal('cancel', onCancel)}
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
									closeModal('confirm', onConfirm);
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
	},
	title: {
		fontWeight: '700',
	},
	message: {
		flexShrink: 1,
	},
	actions: {
		flexDirection: 'row',
	},
	button: {
		flex: 1,
		minHeight: TOUCH_TARGET_MIN_PX,
		paddingHorizontal: SPACING_PX.lg,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
