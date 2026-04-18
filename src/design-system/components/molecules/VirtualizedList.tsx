import React, { useMemo, useState } from 'react';
import { RefreshControl, SectionList, View, type StyleProp, type ViewStyle } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { EmptyState } from '@/src/design-system/components/molecules/EmptyState';
import { SkeletonRow } from '@/src/design-system/components/molecules/SkeletonRow';
import { useTheme } from '@/src/theme/ThemeProvider';

export type VirtualizedListDensity = 'compact' | 'default';

export interface VirtualizedListSection<T> {
	title: string;
	data: T[];
}

export interface VirtualizedListRenderContext<T> {
	item: T;
	index: number;
	selected: boolean;
	toggleSelected: () => void;
}

export interface VirtualizedListProps<T> {
	data?: T[];
	sections?: VirtualizedListSection<T>[];
	renderItem: (context: VirtualizedListRenderContext<T>) => React.ReactElement | null;
	keyExtractor: (item: T, index: number) => string;
	renderSectionHeader?: (section: VirtualizedListSection<T>) => React.ReactElement | null;
	selectedKeys?: string[];
	defaultSelectedKeys?: string[];
	onSelectedKeysChange?: (keys: string[]) => void;
	isLoading?: boolean;
	onLoadMore?: () => void;
	onRefresh?: () => void;
	isRefreshing?: boolean;
	itemHeight?: number;
	estimatedItemSize?: number;
	initialNumToRender?: number;
	maxToRenderPerBatch?: number;
	windowSize?: number;
	stickySectionHeadersEnabled?: boolean;
	emptyTitle?: string;
	emptyDescription?: string;
	density?: VirtualizedListDensity;
	style?: StyleProp<ViewStyle>;
	contentContainerStyle?: StyleProp<ViewStyle>;
	testID?: string;
}

export function VirtualizedList<T>({
	data = [],
	sections,
	renderItem,
	keyExtractor,
	renderSectionHeader,
	selectedKeys,
	defaultSelectedKeys = [],
	onSelectedKeysChange,
	isLoading = false,
	onLoadMore,
	onRefresh,
	isRefreshing = false,
	itemHeight,
	estimatedItemSize = 72,
	initialNumToRender = 8,
	maxToRenderPerBatch = 8,
	windowSize = 5,
	stickySectionHeadersEnabled = true,
	emptyTitle = 'No records yet',
	emptyDescription,
	density = 'default',
	style,
	contentContainerStyle,
	testID,
}: VirtualizedListProps<T>) {
	const { theme } = useTheme();
	const [uncontrolledSelectedKeys, setUncontrolledSelectedKeys] = useState(defaultSelectedKeys);
	const resolvedSelectedKeys = selectedKeys ?? uncontrolledSelectedKeys;
	const selectedSet = useMemo(() => new Set(resolvedSelectedKeys), [resolvedSelectedKeys]);

	const updateSelectedKeys = (nextKeys: string[]) => {
		if (selectedKeys === undefined) {
			setUncontrolledSelectedKeys(nextKeys);
		}
		onSelectedKeysChange?.(nextKeys);
	};

	const toggleSelected = (key: string) => {
		updateSelectedKeys(
			selectedSet.has(key)
				? resolvedSelectedKeys.filter((itemKey) => itemKey !== key)
				: [...resolvedSelectedKeys, key],
		);
	};

	if (isLoading && data.length === 0 && (!sections || sections.length === 0)) {
		return (
			<View style={style}>
				{Array.from({ length: density === 'compact' ? 4 : 3 }, (_, index) => (
					<SkeletonRow
						key={index}
						withAvatar={density !== 'compact'}
						lines={density === 'compact' ? 1 : 2}
						testID="virtualized-list-skeleton"
					/>
				))}
			</View>
		);
	}

	if (sections && sections.length > 0) {
		return (
			<SectionList
				testID={testID}
				style={style}
				sections={sections}
				keyExtractor={keyExtractor}
				removeClippedSubviews={true}
				initialNumToRender={initialNumToRender}
				maxToRenderPerBatch={maxToRenderPerBatch}
				windowSize={windowSize}
				stickySectionHeadersEnabled={stickySectionHeadersEnabled}
				onEndReached={onLoadMore}
				onEndReachedThreshold={0.35}
				refreshControl={
					onRefresh ? (
						<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
					) : undefined
				}
				renderSectionHeader={({ section }) =>
					renderSectionHeader ? renderSectionHeader(section) : null
				}
				renderItem={({ item, index }) => {
					const key = keyExtractor(item, index);
					return renderItem({
						item,
						index,
						selected: selectedSet.has(key),
						toggleSelected: () => toggleSelected(key),
					});
				}}
			/>
		);
	}

	return (
		<FlashList
			testID={testID}
			data={data}
			style={style}
			contentContainerStyle={contentContainerStyle}
			estimatedItemSize={estimatedItemSize}
			removeClippedSubviews={true}
			initialNumToRender={initialNumToRender}
			maxToRenderPerBatch={maxToRenderPerBatch}
			windowSize={windowSize}
			onEndReached={onLoadMore}
			onEndReachedThreshold={0.35}
			onRefresh={onRefresh}
			refreshing={isRefreshing}
			getItemLayout={
				itemHeight
					? (_ignored, index) => ({
							length: itemHeight,
							offset: itemHeight * index,
							index,
						})
					: undefined
			}
			keyExtractor={keyExtractor}
			ListEmptyComponent={
				<EmptyState
					title={emptyTitle}
					description={emptyDescription}
					style={{ flex: 0, paddingVertical: theme.spacing.xl }}
				/>
			}
			renderItem={({ item, index }) => {
				const key = keyExtractor(item, index);
				return renderItem({
					item,
					index,
					selected: selectedSet.has(key),
					toggleSelected: () => toggleSelected(key),
				});
			}}
		/>
	);
}
