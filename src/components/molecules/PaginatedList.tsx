import React from 'react';
import {
	View,
	Text,
	FlatList,
	Pressable,
	ActivityIndicator,
	StyleSheet,
	type ListRenderItem,
} from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SkeletonRow } from '@/src/components/molecules/SkeletonRow';

export interface PaginatedListProps<T> {
	data: T[];
	renderItem: ListRenderItem<T>;
	keyExtractor: (item: T, index: number) => string;
	isLoading: boolean;
	hasError: boolean;
	onRetry?: () => void;
	onLoadMore?: () => void;
	onRefresh?: () => void;
	isRefreshing?: boolean;
	emptyTitle?: string;
	emptyDescription?: string;
	ListHeaderComponent?: React.ReactElement | null;
	skeletonCount?: number;
}

/**
 * P0.7 — PaginatedList
 * FlatList-based paginated list with skeleton loading, empty state, and error/retry states.
 */
export function PaginatedList<T>({
	data,
	renderItem,
	keyExtractor,
	isLoading,
	hasError,
	onRetry,
	onLoadMore,
	onRefresh,
	isRefreshing = false,
	emptyTitle = 'No data found',
	emptyDescription,
	ListHeaderComponent,
	skeletonCount = 3,
}: PaginatedListProps<T>) {
	const { theme } = useTheme();
	const c = theme.colors;

	// Loading state — show skeletons
	if (isLoading && data.length === 0) {
		return (
			<View>
				{ListHeaderComponent}
				{Array.from({ length: skeletonCount }, (_, i) => (
					<SkeletonRow key={i} testID="skeleton-row" />
				))}
			</View>
		);
	}

	// Error state
	if (hasError) {
		return (
			<View style={styles.center}>
				{ListHeaderComponent}
				<Text
					style={{
						color: c.error,
						fontSize: theme.typography.sizes.md,
						marginBottom: 16,
					}}
				>
					Something went wrong. Please try again.
				</Text>
				{onRetry ? (
					<Pressable
						testID="error-retry-btn"
						onPress={onRetry}
						accessibilityRole="button"
						style={[
							styles.retryBtn,
							{
								backgroundColor: c.primary,
								borderRadius: theme.borderRadius.md,
							},
						]}
					>
						<Text style={{ color: c.onPrimary, fontWeight: '600' }}>Retry</Text>
					</Pressable>
				) : null}
			</View>
		);
	}

	return (
		<FlatList
			data={data}
			renderItem={renderItem}
			keyExtractor={keyExtractor}
			onEndReached={onLoadMore}
			onEndReachedThreshold={0.3}
			onRefresh={onRefresh}
			refreshing={isRefreshing}
			ListHeaderComponent={ListHeaderComponent}
			ListEmptyComponent={
				<View testID="empty-state" style={styles.center}>
					<Text
						style={{
							fontSize: theme.typography.sizes.lg,
							fontWeight: '700',
							color: c.onSurface,
							marginBottom: 8,
							textAlign: 'center',
						}}
					>
						{emptyTitle}
					</Text>
					{emptyDescription ? (
						<Text
							style={{
								fontSize: theme.typography.sizes.md,
								color: c.onSurfaceVariant,
								textAlign: 'center',
							}}
						>
							{emptyDescription}
						</Text>
					) : null}
				</View>
			}
			ListFooterComponent={
				isLoading && data.length > 0 ? (
					<ActivityIndicator
						testID="load-more-indicator"
						color={c.primary}
						style={{ paddingVertical: 16 }}
					/>
				) : null
			}
		/>
	);
}

const styles = StyleSheet.create({
	center: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 24,
	},
	retryBtn: {
		paddingHorizontal: 24,
		paddingVertical: 12,
		minHeight: 48,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
