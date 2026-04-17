import React from 'react';
import { WifiOff, AlertTriangle, FileQuestion } from 'lucide-react-native';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { LucideIconGlyph } from '@/src/design-system/iconography';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Button } from '@/src/design-system/components/atoms/Button';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';

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

const DEFAULT_COPY: Record<ErrorStateVariant, { title: string; description: string }> = {
	server: {
		title: 'Server error',
		description: 'We could not load this information right now.',
	},
	'not-found': {
		title: 'Not found',
		description: 'This record is no longer available.',
	},
	offline: {
		title: 'Offline',
		description: 'Reconnect to refresh this content.',
	},
};

export function ErrorState({
	variant,
	title,
	description,
	actionLabel = 'Retry',
	onAction,
	testID,
	style,
}: ErrorStateProps) {
	const { theme } = useTheme();
	const c = theme.colors;
	const copy = DEFAULT_COPY[variant];
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
