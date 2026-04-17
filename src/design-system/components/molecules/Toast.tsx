import React, { useEffect, useRef, useState } from 'react';
import {
	Keyboard,
	Pressable,
	View,
	StyleSheet,
	type StyleProp,
	type ViewStyle,
} from 'react-native';
import { triggerDesignSystemHaptic } from '@/src/design-system/haptics';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SIZE_TOAST_BOTTOM_OFFSET } from '@/theme/uiMetrics';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

const DEFAULT_TOAST_DURATION_MS = 3000;

export interface ToastProps {
	visible: boolean;
	message: string;
	variant: ToastVariant;
	onDismiss: () => void;
	/** Auto-dismiss duration in ms. Default 3000. */
	duration?: number;
	actionLabel?: string;
	onAction?: () => void;
	dismissLabel?: string;
	placement?: 'bottom' | 'top';
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

export interface ToastStackItem extends Omit<
	ToastProps,
	'visible' | 'onDismiss' | 'style' | 'placement'
> {
	id: string;
}

export interface ToastViewportProps {
	items: ToastStackItem[];
	maxVisible?: number;
	onDismiss: (id: string) => void;
	placement?: 'bottom' | 'top';
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

/**
 * P0.5 — Toast
 * Appears at bottom of screen above tab bar.
 * Success, info, and warning auto-dismiss by default after 3s. Error stays visible unless
 * an explicit duration is provided.
 */
export function Toast({
	visible,
	message,
	variant,
	onDismiss,
	duration,
	actionLabel,
	onAction,
	dismissLabel = 'Dismiss',
	placement = 'bottom',
	testID,
	style,
}: ToastProps) {
	const { theme } = useTheme();
	const c = theme.colors;
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [keyboardOffset, setKeyboardOffset] = useState(0);

	useEffect(() => {
		const shouldAutoDismiss = variant !== 'error' || duration !== undefined;
		if (visible && shouldAutoDismiss) {
			timerRef.current = setTimeout(() => {
				onDismiss();
			}, duration ?? DEFAULT_TOAST_DURATION_MS);
		}
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [visible, duration, onDismiss, variant]);

	useEffect(() => {
		if (!visible) {
			return;
		}

		void triggerDesignSystemHaptic(
			variant === 'success'
				? 'success'
				: variant === 'warning'
					? 'warning'
					: variant === 'error'
						? 'error'
						: 'selection',
		);
	}, [variant, visible]);

	useEffect(() => {
		const showSubscription = Keyboard.addListener('keyboardDidShow', (event) => {
			setKeyboardOffset(event.endCoordinates?.height ?? 0);
		});
		const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
			setKeyboardOffset(0);
		});

		return () => {
			showSubscription.remove();
			hideSubscription.remove();
		};
	}, []);

	if (!visible) return null;

	const borderColor =
		variant === 'success'
			? c.success
			: variant === 'error'
				? c.error
				: variant === 'warning'
					? c.warning
					: c.info;

	return (
		<View
			testID={testID}
			style={[
				styles.container,
				theme.elevation.modal,
				{
					backgroundColor: c.surface,
					borderLeftColor: borderColor,
					borderRadius: theme.borderRadius.md,
					bottom:
						placement === 'bottom'
							? SIZE_TOAST_BOTTOM_OFFSET + keyboardOffset
							: undefined,
					top: placement === 'top' ? theme.spacing.xl : undefined,
				},
				style,
			]}
			accessibilityLiveRegion="polite"
			accessibilityRole="alert"
		>
			<View style={styles.row}>
				<ThemedText variant="caption" style={{ color: c.onSurface, flex: 1 }}>
					{message}
				</ThemedText>
				{actionLabel && onAction ? (
					<Pressable
						testID={`${testID ?? 'toast'}-action`}
						onPress={onAction}
						accessibilityRole="button"
						accessibilityLabel={actionLabel}
						style={styles.button}
					>
						<ThemedText variant="captionBold" style={{ color: borderColor }}>
							{actionLabel}
						</ThemedText>
					</Pressable>
				) : null}
				<Pressable
					testID={`${testID ?? 'toast'}-dismiss`}
					onPress={onDismiss}
					accessibilityRole="button"
					accessibilityLabel={dismissLabel}
					style={styles.button}
				>
					<ThemedText variant="captionBold" style={{ color: c.onSurfaceVariant }}>
						×
					</ThemedText>
				</Pressable>
			</View>
		</View>
	);
}

export function ToastViewport({
	items,
	maxVisible = 3,
	onDismiss,
	placement = 'bottom',
	testID,
	style,
}: ToastViewportProps) {
	const visibleItems = items.slice(0, maxVisible);

	return (
		<View
			testID={testID}
			pointerEvents="box-none"
			style={[
				{
					position: 'absolute',
					top: placement === 'top' ? 0 : undefined,
					bottom: placement === 'bottom' ? 0 : undefined,
					start: 0,
					end: 0,
				},
				style,
			]}
		>
			{visibleItems.map((item, index) => (
				<Toast
					key={item.id}
					visible
					message={item.message}
					variant={item.variant}
					onDismiss={() => onDismiss(item.id)}
					duration={item.duration}
					actionLabel={item.actionLabel}
					onAction={item.onAction}
					dismissLabel={item.dismissLabel}
					placement={placement}
					style={{
						...(placement === 'bottom'
							? {
									bottom:
										SIZE_TOAST_BOTTOM_OFFSET +
										index * (SPACING_PX['3xl'] + SPACING_PX.xs),
								}
							: { top: SPACING_PX.xl + index * (SPACING_PX['3xl'] + SPACING_PX.xs) }),
					}}
				/>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		start: SPACING_PX.lg,
		end: SPACING_PX.lg,
		borderLeftWidth: SPACING_PX.xs,
		paddingVertical: SPACING_PX.md,
		paddingHorizontal: SPACING_PX.lg,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: SPACING_PX.sm,
	},
	button: {
		minWidth: SPACING_PX.xl,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
