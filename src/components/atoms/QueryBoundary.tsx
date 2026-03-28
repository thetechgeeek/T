import React from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { EmptyState } from '../molecules/EmptyState';
import type { AppError } from '@/src/errors';

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

	if (loading && !React.Children.count(children)) {
		return (
			loadingComponent ?? (
				<View style={styles.center}>
					<ActivityIndicator size="large" color={theme.colors.primary} />
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
				<Text style={[styles.errorText, { color: theme.colors.error }]}>{message}</Text>
				{onRetry && (
					<TouchableOpacity onPress={onRetry} style={styles.retryButton}>
						<Text style={{ color: theme.colors.primary }}>Retry</Text>
					</TouchableOpacity>
				)}
			</View>
		);
	}

	if (empty) {
		return <>{emptyState ?? <EmptyState title="No results found" />}</>;
	}

	return <>{children}</>;
}

const styles = StyleSheet.create({
	center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
	errorText: { textAlign: 'center', marginBottom: 12 },
	retryButton: { paddingHorizontal: 16, paddingVertical: 8 },
});
