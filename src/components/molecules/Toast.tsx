import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SIZE_TOAST_BOTTOM_OFFSET } from '@/theme/uiMetrics';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastProps {
	visible: boolean;
	message: string;
	variant: ToastVariant;
	onDismiss: () => void;
	/** Auto-dismiss duration in ms. Default 3000. */
	duration?: number;
	testID?: string;
}

/**
 * P0.5 — Toast
 * Appears at bottom of screen above tab bar. Auto-dismisses after 3s.
 * success → green left border, error → red left border, info → blue left border.
 */
export function Toast({
	visible,
	message,
	variant,
	onDismiss,
	duration = 3000,
	testID,
}: ToastProps) {
	const { theme } = useTheme();
	const c = theme.colors;
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (visible) {
			timerRef.current = setTimeout(() => {
				onDismiss();
			}, duration);
		}
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, [visible, duration, onDismiss]);

	if (!visible) return null;

	const borderColor = variant === 'success' ? c.success : variant === 'error' ? c.error : c.info;

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
