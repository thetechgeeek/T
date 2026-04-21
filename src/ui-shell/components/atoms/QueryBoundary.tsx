import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { EmptyState, SkeletonBlock, ThemedText } from '@easydesign/design-system';
import { SPACING_PX, useTheme } from '@easydesign/design-system/foundation';
import type { AppError } from '@/src/errors';
import { useShellEnvironment } from '../../ShellEnvironment';

interface QueryBoundaryProps {
	loading: boolean;
	error: AppError | Error | string | null;
	empty?: boolean;
	children: React.ReactNode;
	onRetry?: () => void;
	emptyState?: React.ReactNode;
	loadingComponent?: React.ReactNode;
}

export function QueryBoundary({
	loading,
	error,
	empty,
	children,
	onRetry,
	emptyState,
	loadingComponent,
}: QueryBoundaryProps) {
	const { theme } = useTheme();
	const { translate } = useShellEnvironment();

	if (loading && !React.Children.count(children)) {
		return (
			loadingComponent ?? (
				<View style={styles.loadingContainer}>
					<SkeletonBlock height={14} style={{ marginBottom: SPACING_PX.sm }} />
					<SkeletonBlock
						width="75%"
						height={14}
						style={{ marginBottom: SPACING_PX.sm }}
					/>
					<SkeletonBlock width="50%" height={14} />
				</View>
			)
		);
	}

	if (error) {
		const message =
			typeof error === 'string'
				? error
				: 'userMessage' in error
					? (error as AppError).userMessage
					: error.message;
		return (
			<View style={styles.center}>
				<ThemedText
					variant="body"
					style={[styles.errorText, { color: theme.colors.error }]}
				>
					{message}
				</ThemedText>
				{onRetry && (
					<TouchableOpacity onPress={onRetry} style={styles.retryButton}>
						<ThemedText variant="body" style={{ color: theme.colors.primary }}>
							{translate('common.retry', 'Retry')}
						</ThemedText>
					</TouchableOpacity>
				)}
			</View>
		);
	}

	if (empty) {
		return (
			<>
				{emptyState ?? (
					<EmptyState title={translate('common.noResults', 'No results found')} />
				)}
			</>
		);
	}

	return <>{children}</>;
}

const styles = StyleSheet.create({
	center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING_PX.xl },
	loadingContainer: { flex: 1, padding: SPACING_PX.xl },
	errorText: { textAlign: 'center', marginBottom: SPACING_PX.md },
	retryButton: { paddingHorizontal: SPACING_PX.lg, paddingVertical: SPACING_PX.sm },
});
