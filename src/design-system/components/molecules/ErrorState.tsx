import React from 'react';
import { WifiOff, AlertTriangle, FileQuestion } from 'lucide-react-native';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { LucideIconGlyph } from '../../iconography';
import { DEFAULT_RETRY_LABEL, ERROR_STATE_COPY } from '../../microcopy';
import { useTheme } from '../../foundation/theme/ThemeProvider';
import { Button } from '../atoms/Button';
import { ThemedText } from '../atoms/ThemedText';

export type ErrorStateVariant = 'server' | 'not-found' | 'offline';

export interface ErrorStateProps {
	variant: ErrorStateVariant;
	title?: string;
	description?: string;
	actionLabel?: string;
	onAction?: () => void;
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

export function ErrorState({
	variant,
	title,
	description,
	actionLabel = DEFAULT_RETRY_LABEL,
	onAction,
	testID,
	style,
}: ErrorStateProps) {
	const { theme } = useTheme();
	const c = theme.colors;
	const copy = ERROR_STATE_COPY[variant];
	const Icon =
		variant === 'server' ? AlertTriangle : variant === 'offline' ? WifiOff : FileQuestion;

	return (
		<View
			testID={testID}
			style={[
				{
					padding: theme.spacing.xl,
					alignItems: 'center',
					borderWidth: theme.borderWidth.sm,
					borderColor: c.border,
					borderRadius: theme.borderRadius.md,
					backgroundColor: theme.visual.surfaces.raised,
				},
				style,
			]}
		>
			<LucideIconGlyph
				icon={Icon}
				size={theme.spacing.xl}
				color={variant === 'offline' ? c.warning : c.error}
			/>
			<ThemedText
				variant="sectionTitle"
				style={{ color: c.onSurface, marginTop: theme.spacing.sm }}
			>
				{title ?? copy.title}
			</ThemedText>
			<ThemedText
				variant="caption"
				style={{
					color: c.onSurfaceVariant,
					textAlign: 'center',
					marginTop: theme.spacing.xs,
				}}
			>
				{description ?? copy.description}
			</ThemedText>
			{onAction ? (
				<Button
					title={actionLabel}
					variant="secondary"
					onPress={onAction}
					style={{ marginTop: theme.spacing.md }}
				/>
			) : null}
		</View>
	);
}
