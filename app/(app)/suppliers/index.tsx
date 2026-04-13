import { SIZE_AVATAR_MD } from '@/theme/uiMetrics';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { UserPlus } from 'lucide-react-native';
import { supplierRepository } from '@/src/repositories/supplierRepository';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { SearchBar } from '@/src/components/molecules/SearchBar';
import { ListItem } from '@/src/components/molecules/ListItem';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { EmptyState } from '@/src/components/molecules/EmptyState';
import { CustomerListSkeleton } from '@/src/components/molecules/skeletons/CustomerListSkeleton';
import { useLocale } from '@/src/hooks/useLocale';
import type { Supplier } from '@/src/types/supplier';
import { partyAvatarColors, palette } from '@/src/theme/palette';

function getInitials(name: string): string {
	return name
		.split(' ')
		.slice(0, 2)
		.map((w) => w.charAt(0).toUpperCase())
		.join('');
}

function getAvatarColor(name: string): string {
	return partyAvatarColors[name.charCodeAt(0) % 8] ?? partyAvatarColors[0];
}

export default function SupplierListScreen() {
	const { theme } = useThemeTokens();
	const router = useRouter();
	const { t } = useLocale();

	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [search, setSearch] = useState('');
	const initialized = useRef(false);

	const fetchSuppliers = useCallback(
		async (searchTerm: string) => {
			setLoading(true);
			try {
				const result = await supplierRepository.findMany({
					search: searchTerm
						? { columns: ['name', 'contact_person'], term: searchTerm }
						: undefined,
					sort: { column: 'name', ascending: true },
				});
				setSuppliers(result.data);
			} catch (e: unknown) {
				Alert.alert(
					t('common.errorTitle'),
					(e instanceof Error ? e.message : '') || 'Failed to load suppliers',
					[{ text: t('common.ok') }],
				);
			} finally {
				setLoading(false);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	// Initial load
	useEffect(() => {
		if (!initialized.current) {
			initialized.current = true;
			fetchSuppliers('');
		}
	}, [fetchSuppliers]);

	// Debounced search
	useEffect(() => {
		if (!initialized.current) return;
		const timer = setTimeout(() => {
			fetchSuppliers(search);
		}, 300);
		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [search]);

	const handleRefresh = async () => {
		setRefreshing(true);
		try {
			await fetchSuppliers(search);
		} finally {
			setRefreshing(false);
		}
	};

	const handleSearch = (text: string) => {
		setSearch(text);
	};

	const renderSupplier = ({ item }: { item: Supplier }) => (
		<ListItem
			title={item.name}
			subtitle={item.contact_person || item.phone || item.city || 'No contact info'}
			onPress={() => router.push(`/(app)/suppliers/${item.id}`)}
			leftIcon={
				<View style={[styles.avatar, { backgroundColor: getAvatarColor(item.name) }]}>
					<ThemedText weight="bold" color={palette.white} style={{ fontSize: 15 }}>
						{getInitials(item.name)}
					</ThemedText>
				</View>
			}
		/>
	);

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title={t('supplier.title')} />

			<View
				style={[
					styles.header,
					{ borderBottomColor: theme.colors.border, borderBottomWidth: 1 },
				]}
			>
				<SearchBar
					value={search}
					onChangeText={handleSearch}
					placeholder="Search suppliers..."
					style={styles.searchBar}
				/>
				<View style={[styles.summaryBar, { backgroundColor: theme.colors.surfaceVariant }]}>
					<ThemedText variant="caption" color={theme.colors.onSurfaceVariant}>
						{`${suppliers.length} suppliers`}
					</ThemedText>
				</View>
			</View>

			{loading && suppliers.length === 0 ? (
				<CustomerListSkeleton />
			) : (
				<FlatList
					data={suppliers}
					renderItem={renderSupplier}
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
								title="No suppliers found"
								description="Add your first supplier to get started"
								icon={<UserPlus size={48} color={theme.colors.placeholder} />}
								actionLabel="Add Supplier"
								onAction={() => router.push('/(app)/suppliers/add' as Href)}
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
				onPress={() => router.push('/(app)/suppliers/add' as Href)}
				activeOpacity={0.85}
				accessibilityRole="button"
				accessibilityLabel="add-supplier-button"
				accessibilityHint="Add a new supplier"
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
	summaryBar: {
		paddingHorizontal: 4,
		paddingVertical: 6,
		borderRadius: 6,
		marginTop: 8,
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
