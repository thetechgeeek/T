import { SIZE_AVATAR_MD } from '@/theme/uiMetrics';
import React, { useCallback, useState, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { View, FlatList, StyleSheet, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { UserPlus } from 'lucide-react-native';
import { useCustomerStore } from '@/src/stores/customerStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { SearchBar } from '@/src/components/molecules/SearchBar';
import { FilterBar } from '@/src/components/molecules/FilterBar';
import { ListItem } from '@/src/components/molecules/ListItem';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { EmptyState } from '@/src/components/molecules/EmptyState';
import { Badge } from '@/src/components/atoms/Badge';
import { CustomerListSkeleton } from '@/src/components/molecules/skeletons/CustomerListSkeleton';
import { useLocale } from '@/src/hooks/useLocale';
import type { Customer } from '@/src/types/customer';

function getInitials(name: string): string {
	return name
		.split(' ')
		.slice(0, 2)
		.map((w) => w.charAt(0).toUpperCase())
		.join('');
}

function getAvatarColor(name: string, colors: readonly string[]): string {
	return colors[name.charCodeAt(0) % colors.length] ?? colors[0];
}

const CUSTOMER_FILTERS = [
	{ label: 'All', value: 'all' },
	{ label: 'With Balance', value: 'with_balance' },
	{ label: 'No Balance', value: 'no_balance' },
	{ label: 'Overdue', value: 'overdue' },
];

export default function CustomersScreen() {
	const { theme } = useThemeTokens();
	const router = useRouter();
	const { t, formatCurrency } = useLocale();
	const { customers, loading, fetchCustomers, setFilters, filters } = useCustomerStore(
		useShallow((s) => ({
			customers: s.customers,
			loading: s.loading,
			fetchCustomers: s.fetchCustomers,
			setFilters: s.setFilters,
			filters: s.filters,
		})),
	);

	const [search, setSearch] = useState(filters.search || '');
	const [refreshing, setRefreshing] = useState(false);
	const [activeFilter, setActiveFilter] = useState('all');

	const totalOutstanding = useMemo(
		() =>
			customers.reduce((acc, c) => {
				const bal = (c as Customer & { current_balance?: number }).current_balance || 0;
				return acc + (bal > 0 ? bal : 0);
			}, 0),
		[customers],
	);

	const handleFilterSelect = (value: string) => {
		setActiveFilter(value);
		if (value === 'all') {
			setFilters({ hasOutstanding: undefined });
		} else if (value === 'with_balance') {
			setFilters({ hasOutstanding: true });
		} else if (value === 'no_balance') {
			setFilters({ hasOutstanding: false });
		} else if (value === 'overdue') {
			setFilters({ hasOutstanding: true });
		}
	};

	useFocusEffect(
		useCallback(() => {
			fetchCustomers(true).catch((e) => {
				Alert.alert(
					t('common.errorTitle'),
					t('customer.loadError') + ' ' + (e?.message || ''),
					[{ text: t('common.ok') }],
				);
			});
		}, [fetchCustomers, t]),
	);

	const handleRefresh = async () => {
		setRefreshing(true);
		try {
			await fetchCustomers(true);
		} finally {
			setRefreshing(false);
		}
	};

	const handleSearch = (text: string) => {
		setSearch(text);
		setFilters({ search: text });
	};

	const renderCustomer = ({ item }: { item: Customer }) => (
		<ListItem
			title={item.name}
			subtitle={item.phone || item.city || t('customer.noContactInfo')}
			onPress={() => router.push(`/(app)/customers/${item.id}`)}
			leftIcon={
				<View
					style={[
						styles.avatar,
						{
							backgroundColor: getAvatarColor(
								item.name,
								theme.collections.partyAvatarColors,
							),
						},
					]}
				>
					<ThemedText weight="bold" color={theme.colors.white} style={{ fontSize: 15 }}>
						{getInitials(item.name)}
					</ThemedText>
				</View>
			}
			rightElement={
				<Badge
					label={t(`customer.types.${item.type}`).toUpperCase()}
					variant="neutral"
					size="sm"
				/>
			}
		/>
	);

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title={t('customer.title')} />

			<View
				style={[
					styles.header,
					{ borderBottomColor: theme.colors.border, borderBottomWidth: 1 },
				]}
			>
				<SearchBar
					value={search}
					onChangeText={handleSearch}
					placeholder="Search customers..."
					style={styles.searchBar}
				/>
				<FilterBar
					filters={CUSTOMER_FILTERS}
					activeValue={activeFilter}
					onSelect={handleFilterSelect}
					defaultValue="all"
					onClear={() => handleFilterSelect('all')}
				/>
				{/* Summary Bar */}
				<View style={[styles.summaryBar, { backgroundColor: theme.colors.surfaceVariant }]}>
					<ThemedText variant="caption" color={theme.colors.onSurfaceVariant}>
						{`${customers.length} customers · ₹ ${formatCurrency(totalOutstanding)} to receive`}
					</ThemedText>
				</View>
			</View>

			{loading && customers.length === 0 ? (
				<CustomerListSkeleton />
			) : (
				<FlatList
					data={customers}
					renderItem={renderCustomer}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.list}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={handleRefresh}
							tintColor={theme.colors.primary}
						/>
					}
					ListEmptyComponent={
						!loading ? (
							<EmptyState
								title={t('customer.noCustomers')}
								description={t('customer.addFirstHint')}
								icon={<UserPlus size={48} color={theme.colors.placeholder} />}
								actionLabel={t('customer.addCustomer')}
								onAction={() => router.push('/(app)/customers/add' as Href)}
							/>
						) : null
					}
				/>
			)}

			{/* FAB */}
			<TouchableOpacity
				style={[
					styles.fab,
					{ backgroundColor: theme.colors.primary, ...(theme.shadows?.lg || {}) },
				]}
				onPress={() => router.push('/(app)/customers/add' as Href)}
				activeOpacity={0.85}
				accessibilityRole="button"
				accessibilityLabel="add-customer-button"
				accessibilityHint={t('customer.addHint')}
			>
				<UserPlus size={26} color="white" strokeWidth={2.5} />
			</TouchableOpacity>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	header: {
		padding: 16,
	},
	searchBar: {
		marginBottom: 0,
	},
	list: {
		flexGrow: 1,
		paddingBottom: 80,
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	summaryBar: {
		paddingHorizontal: 4,
		paddingVertical: 6,
		borderRadius: 6,
		marginTop: 4,
	},
	fab: {
		position: 'absolute',
		right: 20,
		bottom: 20,
		width: SIZE_AVATAR_MD,
		height: SIZE_AVATAR_MD,
		borderRadius: SIZE_AVATAR_MD / 2,
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 8,
	},
});
