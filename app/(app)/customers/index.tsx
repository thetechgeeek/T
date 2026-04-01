import React, { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { View, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { UserPlus } from 'lucide-react-native';
import { useCustomerStore } from '@/src/stores/customerStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { SearchBar } from '@/src/components/molecules/SearchBar';
import { ListItem } from '@/src/components/molecules/ListItem';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { Button } from '@/src/components/atoms/Button';
import { EmptyState } from '@/src/components/molecules/EmptyState';
import { Badge } from '@/src/components/atoms/Badge';
import { useLocale } from '@/src/hooks/useLocale';
import type { Customer } from '@/src/types/customer';

export default function CustomersScreen() {
	const { theme } = useThemeTokens();
	const router = useRouter();
	const { t } = useLocale();
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

	useEffect(() => {
		fetchCustomers().catch((e) => {
			Alert.alert(t('common.errorTitle'), t('customer.loadError') + ' ' + e.message, [
				{ text: t('common.ok') },
			]);
		});
	}, [fetchCustomers, t]);

	const handleSearch = (text: string) => {
		setSearch(text);
		setFilters({ search: text });
	};

	const renderCustomer = ({ item }: { item: Customer }) => (
		<ListItem
			title={item.name}
			subtitle={item.phone || item.city || 'No contact info'}
			onPress={() => router.push(`/customers/${item.id}`)}
			leftIcon={
				<View style={[styles.avatar, { backgroundColor: theme.colors.surfaceVariant }]}>
					<ThemedText weight="bold" color={theme.colors.primary} style={{ fontSize: 18 }}>
						{item.name.charAt(0).toUpperCase()}
					</ThemedText>
				</View>
			}
			rightElement={<Badge label={item.type.toUpperCase()} variant="neutral" size="sm" />}
		/>
	);

	return (
		<AtomicScreen safeAreaEdges={['top']} withKeyboard={false}>
			<Stack.Screen
				options={{
					title: 'Customers',
					headerRight: () => (
						<Button
							variant="ghost"
							size="sm"
							accessibilityLabel="add-customer-button"
							accessibilityHint="Add a new customer"
							onPress={() => router.push('/customers/add')}
							leftIcon={
								<UserPlus
									size={22}
									color={theme.colors.primary}
									importantForAccessibility="no"
								/>
							}
						/>
					),
				}}
			/>

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
			</View>

			<FlatList
				data={customers}
				renderItem={renderCustomer}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.list}
				refreshControl={
					<RefreshControl
						refreshing={loading && customers.length > 0}
						onRefresh={() => fetchCustomers(true)}
						tintColor={theme.colors.primary}
					/>
				}
				ListEmptyComponent={
					!loading ? (
						<EmptyState
							title="No customers found"
							description="Start by adding your first customer to manage their credit and invoices."
							icon={<UserPlus size={48} color={theme.colors.placeholder} />}
							actionLabel="Add Customer"
							onAction={() => router.push('/customers/add')}
						/>
					) : null
				}
			/>
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
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
