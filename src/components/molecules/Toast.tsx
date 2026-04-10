import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

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
				{
					backgroundColor: c.surface,
					borderLeftColor: borderColor,
					borderRadius: theme.borderRadius.md,
				},
			]}
			accessibilityLiveRegion="polite"
			accessibilityRole="alert"
		>
			<Text
				style={{
					color: c.onSurface,
					fontSize: 15,
					lineHeight: 22,
				}}
			>
				{message}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		bottom: 90,
		left: 16,
		right: 16,
		borderLeftWidth: 4,
		paddingVertical: 12,
		paddingHorizontal: 16,
		elevation: 6,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
	},
});
