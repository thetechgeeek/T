import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Phone, MapPin, Wallet, Plus } from 'lucide-react-native';
import { useCustomerStore } from '@/src/stores/customerStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { Card } from '@/src/components/atoms/Card';
import { Badge } from '@/src/components/atoms/Badge';
import { Divider } from '@/src/components/atoms/Divider';
import { Button } from '@/src/components/atoms/Button';
import { ListItem } from '@/src/components/molecules/ListItem';
import { PaymentModal } from '@/src/components/organisms/PaymentModal';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { CustomerDetailSkeleton } from '@/src/components/molecules/skeletons/CustomerDetailSkeleton';

import type { CustomerLedgerEntry } from '@/src/types/customer';

export default function CustomerDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { theme } = useThemeTokens();
	const { formatCurrency, formatDate } = useLocale();
	const router = useRouter();

	const [paymentModalVisible, setPaymentModalVisible] = React.useState(false);
	const [refreshing, setRefreshing] = useState(false);

	const { selectedCustomer: customer, ledger, summary, fetchCustomerDetail } = useCustomerStore();

	// Refresh the customer detail (customer info + ledger + summary) every time
	// this screen comes into focus. This ensures the ledger stays up-to-date
	// if e.g. the user records a payment from the customer list and navigates back.
	// fetchCustomerDetail's isSameCustomer guard keeps stale data visible during
	// background refresh (no blank-screen flash for the same customer).
	useFocusEffect(
		useCallback(() => {
			if (id) fetchCustomerDetail(id);
		}, [id, fetchCustomerDetail]),
	);

	const renderLedgerItem = ({ item }: { item: CustomerLedgerEntry }) => (
		<View
			style={[
				styles.ledgerItem,
				{
					borderLeftColor:
						item.type === 'invoice' ? theme.colors.error : theme.colors.success,
					backgroundColor: theme.colors.card,
				},
			]}
		>
			<View style={styles.ledgerHeader}>
				<ThemedText weight="bold" style={styles.ledgerRef}>
					{item.reference}
				</ThemedText>
				<ThemedText variant="caption" color={theme.colors.onSurfaceVariant}>
					{formatDate(item.date)}
				</ThemedText>
			</View>

			<View style={styles.ledgerRow}>
				<View style={styles.ledgerCol}>
					<ThemedText
						variant="caption"
						color={theme.colors.onSurfaceVariant}
						style={{ textTransform: 'uppercase' }}
					>
						Amount
					</ThemedText>
					<ThemedText
						weight="bold"
						style={{
							color:
								item.type === 'invoice' ? theme.colors.error : theme.colors.success,
						}}
					>
						{item.debit > 0
							? `+${formatCurrency(item.debit)}`
							: `-${formatCurrency(item.credit)}`}
					</ThemedText>
				</View>
				<View style={styles.ledgerCol}>
					<ThemedText
						variant="caption"
						color={theme.colors.onSurfaceVariant}
						style={{ textTransform: 'uppercase' }}
					>
						Balance
					</ThemedText>
					<ThemedText weight="bold">{formatCurrency(item.balance)}</ThemedText>
				</View>
			</View>
		</View>
	);

	if (!customer) {
		return (
			<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
				<ScreenHeader title="" />
				<CustomerDetailSkeleton />
			</AtomicScreen>
		);
	}

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title={customer.name} />

			<FlatList
				data={ledger}
				renderItem={renderLedgerItem}
				keyExtractor={(item, index) => `${item.reference}-${index}`}
				ListHeaderComponent={
					<View style={styles.summaryContainer}>
						<Card style={styles.summaryCard}>
							<ThemedText
								variant="overline"
								color={theme.colors.onSurfaceVariant}
								style={{ marginBottom: 4 }}
							>
								Outstanding Balance
							</ThemedText>
							<ThemedText
								variant="display"
								color={
									(summary?.outstanding_balance || 0) > 0
										? theme.colors.error
										: theme.colors.onSurface
								}
							>
								{formatCurrency(summary?.outstanding_balance || 0)}
							</ThemedText>

							<Divider style={{ marginVertical: 12 }} />

							<View style={styles.statsRow}>
								<View style={styles.stat}>
									<ThemedText
										variant="caption"
										color={theme.colors.onSurfaceVariant}
									>
										Total Invoiced
									</ThemedText>
									<ThemedText weight="bold">
										{formatCurrency(summary?.total_invoiced || 0)}
									</ThemedText>
								</View>
								<View style={styles.stat}>
									<ThemedText
										variant="caption"
										color={theme.colors.onSurfaceVariant}
									>
										Total Paid
									</ThemedText>
									<ThemedText weight="bold" color={theme.colors.success}>
										{formatCurrency(summary?.total_paid || 0)}
									</ThemedText>
								</View>
							</View>
						</Card>

						<View style={styles.actions}>
							<Button
								title="Record Payment"
								variant="primary"
								leftIcon={<Wallet size={18} color="white" />}
								style={{ flex: 1, marginRight: 8 }}
								onPress={() => setPaymentModalVisible(true)}
							/>
							<Button
								title="New Invoice"
								variant="outline"
								leftIcon={<Plus size={18} color={theme.colors.primary} />}
								style={{ flex: 1, marginLeft: 8 }}
								onPress={() =>
									router.push({
										pathname: '/(app)/invoices/create',
										params: { customerId: customer.id },
									})
								}
							/>
						</View>

						<ThemedText
							variant="h3"
							style={{ marginTop: 16, marginBottom: 8, paddingHorizontal: 4 }}
						>
							Customer Info
						</ThemedText>
						<Card style={styles.infoCard}>
							{customer.phone && (
								<ListItem
									title={customer.phone}
									leftIcon={
										<Phone size={18} color={theme.colors.onSurfaceVariant} />
									}
									showChevron={false}
								/>
							)}
							{customer.city && (
								<ListItem
									title={`${customer.city}, ${customer.state || ''}`}
									leftIcon={
										<MapPin size={18} color={theme.colors.onSurfaceVariant} />
									}
									showChevron={false}
								/>
							)}
							<ListItem
								title="Customer Type"
								subtitle={customer.type.toUpperCase()}
								showChevron={false}
							/>
						</Card>

						<ThemedText
							variant="h3"
							style={{ marginTop: 16, marginBottom: 8, paddingHorizontal: 4 }}
						>
							Ledger History
						</ThemedText>
					</View>
				}
				contentContainerStyle={styles.list}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={async () => {
							setRefreshing(true);
							try {
								await fetchCustomerDetail(customer.id);
							} finally {
								setRefreshing(false);
							}
						}}
						tintColor={theme.colors.primary}
					/>
				}
			/>

			{customer && (
				<PaymentModal
					visible={paymentModalVisible}
					onClose={() => setPaymentModalVisible(false)}
					customerId={customer.id}
					customerName={customer.name}
					onSuccess={() => fetchCustomerDetail(customer.id)}
				/>
			)}
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	summaryContainer: { padding: 16, paddingTop: 0 },
	summaryCard: { alignItems: 'center' },
	statsRow: { flexDirection: 'row', width: '100%' },
	stat: { flex: 1, alignItems: 'center' },
	actions: { flexDirection: 'row', marginTop: 16 },
	infoCard: { padding: 0 },
	list: { flexGrow: 1, paddingBottom: 40 },
	ledgerItem: {
		marginHorizontal: 16,
		marginBottom: 12,
		padding: 12,
		borderRadius: 12,
		borderLeftWidth: 4,
	},
	ledgerHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
	ledgerRef: { fontSize: 14 },
	ledgerRow: { flexDirection: 'row' },
	ledgerCol: { flex: 1 },
});
