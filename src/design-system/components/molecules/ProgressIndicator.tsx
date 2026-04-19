import React from 'react';
import { ActivityIndicator, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';

export interface ProgressIndicatorProps {
	variant: 'linear' | 'circular';
	value?: number;
	label?: string;
	indeterminate?: boolean;
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

export function ProgressIndicator({
	variant,
	value = 0,
	label,
	indeterminate = false,
	testID,
	style,
}: ProgressIndicatorProps) {
	const { theme } = useTheme();
	const c = theme.colors;
	const clampedValue = Math.max(0, Math.min(100, value));
	const accessibilityLabel = label ?? 'Progress';
	const accessibilityValue = {
		min: 0,
		max: 100,
		now: clampedValue,
		text: `${clampedValue}%`,
	};

	if (indeterminate) {
		return (
			<View
				testID={testID}
				style={style}
				accessibilityRole="progressbar"
				accessibilityLabel={accessibilityLabel}
				accessibilityState={{ busy: true }}
				accessibilityValue={{ text: 'In progress' }}
			>
				{label ? (
					<ThemedText
						variant="caption"
						style={{ color: c.onSurfaceVariant, marginBottom: theme.spacing.xs }}
					>
						{label}
					</ThemedText>
				) : null}
				<ActivityIndicator color={c.primary} />
			</View>
		);
	}

	if (variant === 'circular') {
		return (
			<View
				testID={testID}
				style={[{ alignItems: 'center', justifyContent: 'center' }, style]}
				accessibilityRole="progressbar"
				accessibilityLabel={accessibilityLabel}
				accessibilityValue={accessibilityValue}
			>
				<View
					style={{
						width: theme.spacing['4xl'],
						height: theme.spacing['4xl'],
						borderRadius: theme.borderRadius.full,
						borderWidth: theme.borderWidth.md,
						borderColor: c.border,
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<ThemedText variant="captionBold" style={{ color: c.primary }}>
						{clampedValue}%
					</ThemedText>
				</View>
				{label ? (
					<ThemedText
						variant="caption"
						style={{ color: c.onSurfaceVariant, marginTop: theme.spacing.xs }}
					>
						{label}
					</ThemedText>
				) : null}
			</View>
		);
	}

	return (
		<View
			testID={testID}
			style={style}
			accessibilityRole="progressbar"
			accessibilityLabel={accessibilityLabel}
			accessibilityValue={accessibilityValue}
		>
			{label ? (
				<ThemedText
					variant="caption"
					style={{ color: c.onSurfaceVariant, marginBottom: theme.spacing.xs }}
				>
					{label}
				</ThemedText>
			) : null}
			<View
				style={{
					height: theme.borderWidth.lg * 2,
					backgroundColor: c.surfaceVariant,
					borderRadius: theme.borderRadius.full,
					overflow: 'hidden',
				}}
			>
				<View
					style={{
						width: `${clampedValue}%`,
						height: '100%',
						backgroundColor: c.primary,
						borderRadius: theme.borderRadius.full,
					}}
				/>
			</View>
		</View>
	);
}
