import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';

export type AlertBannerVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertBannerProps {
	title: string;
	description?: string;
	variant?: AlertBannerVariant;
	actionLabel?: string;
	onAction?: () => void;
	dismissible?: boolean;
	onDismiss?: () => void;
	persistent?: boolean;
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

export function AlertBanner({
	title,
	description,
	variant = 'info',
	actionLabel,
	onAction,
	dismissible = false,
	onDismiss,
	persistent = false,
	testID,
	style,
}: AlertBannerProps) {
	const { theme } = useTheme();
	const c = theme.colors;
	const accent =
		variant === 'success'
			? c.success
			: variant === 'warning'
				? c.warning
				: variant === 'error'
					? c.error
					: c.info;

	return (
		<View
			testID={testID}
			accessibilityRole={variant === 'error' ? 'alert' : undefined}
			style={[
				{
					borderWidth: theme.borderWidth.sm,
					borderColor: accent,
					borderRadius: theme.borderRadius.md,
					paddingHorizontal: theme.spacing.md,
					paddingVertical: theme.spacing.md,
					backgroundColor: theme.visual.surfaces.raised,
				},
				style,
			]}
		>
			<View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm }}>
				<View
					style={{
						width: theme.spacing.xs,
						alignSelf: 'stretch',
						borderRadius: theme.borderRadius.full,
						backgroundColor: accent,
					}}
				/>
				<View style={{ flex: 1 }}>
					<ThemedText
						variant="captionBold"
						style={{ color: accent, marginBottom: theme.spacing.xxs }}
					>
						{variant === 'success'
							? 'Success'
							: variant === 'warning'
								? 'Warning'
								: variant === 'error'
									? 'Error'
									: 'Info'}
					</ThemedText>
					<ThemedText variant="bodyStrong" style={{ color: c.onSurface }}>
						{title}
					</ThemedText>
					{description ? (
						<ThemedText
							variant="caption"
							style={{
								color: c.onSurfaceVariant,
								marginTop: theme.spacing.xxs,
							}}
						>
							{description}
						</ThemedText>
					) : null}
					<View
						style={{
							flexDirection: 'row',
							flexWrap: 'wrap',
							gap: theme.spacing.sm,
							marginTop: theme.spacing.sm,
						}}
					>
						{actionLabel && onAction ? (
							<Pressable
								onPress={onAction}
								accessibilityRole="button"
								accessibilityLabel={actionLabel}
								style={{
									minHeight: theme.touchTarget,
									justifyContent: 'center',
								}}
							>
								<ThemedText variant="captionBold" style={{ color: accent }}>
									{actionLabel}
								</ThemedText>
							</Pressable>
						) : null}
						{dismissible && onDismiss ? (
							<Pressable
								onPress={onDismiss}
								accessibilityRole="button"
								accessibilityLabel="Dismiss banner"
								style={{
									minHeight: theme.touchTarget,
									justifyContent: 'center',
								}}
							>
								<ThemedText
									variant="captionBold"
									style={{ color: c.onSurfaceVariant }}
								>
									{persistent ? 'Hide' : 'Dismiss'}
								</ThemedText>
							</Pressable>
						) : null}
					</View>
				</View>
			</View>
		</View>
	);
}
