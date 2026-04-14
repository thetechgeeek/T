import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Phone, MapPin, Wallet, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useCustomerStore } from '@/src/stores/customerStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { Card } from '@/src/components/atoms/Card';
import { Divider } from '@/src/components/atoms/Divider';
import { Button } from '@/src/components/atoms/Button';
import { ListItem } from '@/src/components/molecules/ListItem';
import { PaymentModal } from '@/src/components/organisms/PaymentModal';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { CustomerDetailSkeleton } from '@/src/components/molecules/skeletons/CustomerDetailSkeleton';
import { BORDER_RADIUS_PX, SPACING_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

import type { CustomerLedgerEntry } from '@/src/types/customer';

export default function CustomerDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { theme } = useThemeTokens();
	const { formatCurrency, formatDate } = useLocale();
	const { t } = useTranslation();
	const router = useRouter();

	const [paymentModalVisible, setPaymentModalVisible] = React.useState(false);
	const [refreshing, setRefreshing] = useState(false);

	const {
		selectedCustomer: customer,
		ledger,
		summary,
		fetchCustomerDetail,
		loading,
	} = useCustomerStore();

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
						{t('common.amount')}
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
						{t('common.balance')}
					</ThemedText>
					<ThemedText weight="bold">{formatCurrency(item.balance)}</ThemedText>
				</View>
			</View>
		</View>
	);

	if (!customer) {
		if (loading) {
			return (
				<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
					<ScreenHeader title="" />
					<CustomerDetailSkeleton />
				</AtomicScreen>
			);
		}
		return null;
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
								variant="captionBold"
								color={theme.colors.onSurfaceVariant}
								style={{ marginBottom: SPACING_PX.xs }}
							>
								{t('common.outstandingBalance')}
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

							<Divider style={{ marginVertical: SPACING_PX.md }} />

							<View style={styles.statsRow}>
								<View style={styles.stat}>
									<ThemedText
										variant="caption"
										color={theme.colors.onSurfaceVariant}
									>
										{t('common.totalInvoiced')}
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
										{t('common.totalPaid')}
									</ThemedText>
									<ThemedText weight="bold" color={theme.colors.success}>
										{formatCurrency(summary?.total_paid || 0)}
									</ThemedText>
								</View>
							</View>
						</Card>

						<View style={styles.actions}>
							<Button
								title={t('dashboard.recordPayment')}
								variant="primary"
								leftIcon={<Wallet size={18} color="white" />}
								style={{ flex: 1, marginRight: SPACING_PX.sm }}
								onPress={() => setPaymentModalVisible(true)}
							/>
							<Button
								title={t('invoice.newInvoice')}
								variant="outline"
								leftIcon={<Plus size={18} color={theme.colors.primary} />}
								style={{ flex: 1, marginLeft: SPACING_PX.sm }}
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
							style={{
								marginTop: SPACING_PX.lg,
								marginBottom: SPACING_PX.sm,
								paddingHorizontal: SPACING_PX.xs,
							}}
						>
							{t('common.customerInfo')}
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
								title={t('customer.type')}
								subtitle={customer.type.toUpperCase()}
								showChevron={false}
							/>
						</Card>

						<ThemedText
							variant="h3"
							style={{
								marginTop: SPACING_PX.lg,
								marginBottom: SPACING_PX.sm,
								paddingHorizontal: SPACING_PX.xs,
							}}
						>
							{t('common.ledgerHistory')}
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
	summaryContainer: { padding: SPACING_PX.lg, paddingTop: 0 },
	summaryCard: { alignItems: 'center' },
	statsRow: { flexDirection: 'row', width: '100%' },
	stat: { flex: 1, alignItems: 'center' },
	actions: { flexDirection: 'row', marginTop: SPACING_PX.lg },
	infoCard: { padding: 0 },
	list: { flexGrow: 1, paddingBottom: SPACING_PX['3xl'] - SPACING_PX.sm },
	ledgerItem: {
		marginHorizontal: SPACING_PX.lg,
		marginBottom: SPACING_PX.md,
		padding: SPACING_PX.md,
		borderRadius: BORDER_RADIUS_PX.lg,
		borderLeftWidth: SPACING_PX.xs,
	},
	ledgerHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: SPACING_PX.sm,
	},
	ledgerRef: { fontSize: FONT_SIZE.caption },
	ledgerRow: { flexDirection: 'row' },
	ledgerCol: { flex: 1 },
});
