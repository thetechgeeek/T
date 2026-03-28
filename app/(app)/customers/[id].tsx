import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Phone, MapPin, Wallet, Plus } from 'lucide-react-native';
import { useCustomerStore } from '@/src/stores/customerStore';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/hooks/useLocale';
import { Card } from '@/src/components/atoms/Card';
import { Badge } from '@/src/components/atoms/Badge';
import { Divider } from '@/src/components/atoms/Divider';
import { Button } from '@/src/components/atoms/Button';
import { ListItem } from '@/src/components/molecules/ListItem';
import { PaymentModal } from '@/src/components/organisms/PaymentModal';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import type { CustomerLedgerEntry } from '@/src/types/customer';

export default function CustomerDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { theme } = useTheme();
	const { formatCurrency, formatDate } = useLocale();
	const router = useRouter();

	const [paymentModalVisible, setPaymentModalVisible] = React.useState(false);

	const {
		selectedCustomer: customer,
		ledger,
		summary,
		loading,
		fetchCustomerDetail,
	} = useCustomerStore();

	useEffect(() => {
		if (id) fetchCustomerDetail(id);
	}, [id]);

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

	if (!customer) return null;

	return (
		<Screen safeAreaEdges={['top', 'bottom']}>
			<Stack.Screen options={{ title: customer.name }} />

			<FlatList
				data={ledger}
				renderItem={renderLedgerItem}
				keyExtractor={(item, index) => `${item.reference}-${index}`}
				ListHeaderComponent={
					<View style={styles.header}>
						<Card style={styles.summaryCard}>
							<ThemedText
								variant="caption"
								color={theme.colors.onSurfaceVariant}
								style={{
									textTransform: 'uppercase',
									letterSpacing: 1,
									marginBottom: 4,
								}}
							>
								Outstanding Balance
							</ThemedText>
							<ThemedText
								variant="h1"
								style={{
									color:
										(summary?.outstanding_balance || 0) > 0
											? theme.colors.error
											: theme.colors.onSurface,
									fontSize: 32,
								}}
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
										pathname: '/invoices/create',
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
								title={`Type: ${customer.type.toUpperCase()}`}
								leftIcon={
									<Badge
										label={customer.type.charAt(0)}
										variant="neutral"
										size="sm"
									/>
								}
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
						refreshing={loading}
						onRefresh={() => fetchCustomerDetail(customer.id)}
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
		</Screen>
	);
}

const styles = StyleSheet.create({
	header: { padding: 16 },
	summaryCard: { padding: 20, alignItems: 'center' },
	statsRow: { flexDirection: 'row', width: '100%' },
	stat: { flex: 1, alignItems: 'center' },
	actions: { flexDirection: 'row', marginTop: 16 },
	infoCard: { padding: 0 },
	list: { flexGrow: 1, paddingBottom: 40 },
	ledgerItem: {
		marginHorizontal: 16,
		marginBottom: 12,
		padding: 12,
		borderRadius: 8,
		borderLeftWidth: 4,
	},
	ledgerHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
	ledgerRef: { fontSize: 14 },
	ledgerRow: { flexDirection: 'row' },
	ledgerCol: { flex: 1 },
});
