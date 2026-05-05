import React from 'react';
import {
	View,
	FlatList,
	ActivityIndicator,
	type ListRenderItem,
	type StyleProp,
	type ViewStyle,
} from 'react-native';
import { useTheme } from '../../foundation/theme/ThemeProvider';
import { PAGINATED_LIST_COPY } from '../../microcopy';
import { SkeletonRow } from './SkeletonRow';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { SPACING_PX } from '../../foundation/theme/layoutMetrics';

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
	emptyActionLabel?: string;
	onEmptyAction?: () => void;
	errorTitle?: string;
	errorDescription?: string;
	retryLabel?: string;
	ListHeaderComponent?: React.ReactElement | null;
	skeletonCount?: number;
	style?: StyleProp<ViewStyle>;
	contentContainerStyle?: StyleProp<ViewStyle>;
	testID?: string;
	accessibilityLabel?: string;
	accessibilityHint?: string;
}

/**
 * P0.7 — PaginatedList
 * FlatList-based paginated list with skeleton loading, empty state, and error/retry states.
 */
function PaginatedListComponent<T>({
	data,
	renderItem,
	keyExtractor,
	isLoading,
	hasError,
	onRetry,
	onLoadMore,
	onRefresh,
	isRefreshing = false,
	emptyTitle = PAGINATED_LIST_COPY.emptyTitle,
	emptyDescription,
	emptyActionLabel,
	onEmptyAction,
	errorTitle = PAGINATED_LIST_COPY.errorTitle,
	errorDescription = PAGINATED_LIST_COPY.errorDescription,
	retryLabel = PAGINATED_LIST_COPY.retryLabel,
	ListHeaderComponent,
	skeletonCount = 3,
	style,
	contentContainerStyle,
	testID,
	accessibilityLabel,
	accessibilityHint,
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
			<View style={{ padding: SPACING_PX.xl }}>
				{ListHeaderComponent}
				<ErrorState
					testID="error-state"
					variant="server"
					title={errorTitle}
					description={errorDescription}
					actionLabel={onRetry ? retryLabel : undefined}
					onAction={onRetry}
				/>
			</View>
		);
	}

	return (
		<FlatList
			testID={testID}
			accessibilityRole="list"
			accessibilityLabel={accessibilityLabel}
			accessibilityHint={accessibilityHint}
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
				<EmptyState
					testID="empty-state"
					title={emptyTitle}
					description={emptyDescription}
					actionLabel={emptyActionLabel}
					onAction={onEmptyAction}
				/>
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

const MemoizedPaginatedList = React.memo(PaginatedListComponent) as typeof PaginatedListComponent;
(MemoizedPaginatedList as { displayName?: string }).displayName = 'PaginatedList';

export { MemoizedPaginatedList as PaginatedList };
