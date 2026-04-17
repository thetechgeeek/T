import React from 'react';
import {
	View,
	FlatList,
	ActivityIndicator,
	StyleSheet,
	type ListRenderItem,
	type StyleProp,
	type ViewStyle,
} from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SkeletonRow } from '@/src/design-system/components/molecules/SkeletonRow';
import { Button } from '@/src/design-system/components/atoms/Button';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { SPACING_PX, TOUCH_TARGET_MIN_PX } from '@/src/theme/layoutMetrics';

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
	style?: StyleProp<ViewStyle>;
	contentContainerStyle?: StyleProp<ViewStyle>;
	testID?: string;
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
	style,
	contentContainerStyle,
	testID,
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
				<ThemedText
					variant="body"
					align="center"
					style={{
						color: c.error,
						fontSize: theme.typography.sizes.md,
						marginBottom: SPACING_PX.lg,
					}}
				>
					Something went wrong. Please try again.
				</ThemedText>
				{onRetry ? (
					<Button
						testID="error-retry-btn"
						onPress={onRetry}
						title="Retry"
						style={styles.retryBtn}
					/>
				) : null}
			</View>
		);
	}

	return (
		<FlatList
			testID={testID}
			data={data}
			renderItem={renderItem}
			keyExtractor={keyExtractor}
			onEndReached={onLoadMore}
			onEndReachedThreshold={0.3}
			onRefresh={onRefresh}
			refreshing={isRefreshing}
			style={style}
			contentContainerStyle={contentContainerStyle}
			ListHeaderComponent={ListHeaderComponent}
			ListEmptyComponent={
				<View testID="empty-state" style={styles.center}>
					<ThemedText
						variant="sectionTitle"
						align="center"
						style={{
							fontSize: theme.typography.sizes.lg,
							fontWeight: '700',
							color: c.onSurface,
							marginBottom: SPACING_PX.sm,
						}}
					>
						{emptyTitle}
					</ThemedText>
					{emptyDescription ? (
						<ThemedText
							variant="body"
							align="center"
							style={{
								fontSize: theme.typography.sizes.md,
								color: c.onSurfaceVariant,
							}}
						>
							{emptyDescription}
						</ThemedText>
					) : null}
				</View>
			}
			ListFooterComponent={
				isLoading && data.length > 0 ? (
					<ActivityIndicator
						testID="load-more-indicator"
						color={c.primary}
						style={{ paddingVertical: SPACING_PX.lg }}
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
		padding: SPACING_PX.xl,
	},
	retryBtn: {
		minHeight: TOUCH_TARGET_MIN_PX,
	},
});
