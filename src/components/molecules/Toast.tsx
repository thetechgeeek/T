import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SIZE_TOAST_BOTTOM_OFFSET } from '@/theme/uiMetrics';
import { ThemedText } from '@/src/components/atoms/ThemedText';
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
	testID,
	style,
}: ToastProps) {
	const { theme } = useTheme();
	const c = theme.colors;
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
				},
				style,
			]}
			accessibilityLiveRegion="polite"
			accessibilityRole="alert"
		>
			<ThemedText variant="caption" style={{ color: c.onSurface }}>
				{message}
			</ThemedText>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		bottom: SIZE_TOAST_BOTTOM_OFFSET,
		left: SPACING_PX.lg,
		right: SPACING_PX.lg,
		borderLeftWidth: SPACING_PX.xs,
		paddingVertical: SPACING_PX.md,
		paddingHorizontal: SPACING_PX.lg,
	},
});
