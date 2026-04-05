import React, { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { Button } from '@/src/components/atoms/Button';
import { useLocale } from '@/src/hooks/useLocale';
import { FileText, Plus } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { InvoiceStatusBadge } from '@/src/components/molecules/InvoiceStatusBadge';
import type { InvoiceStatus } from '@/src/components/molecules/InvoiceStatusBadge';
import { InvoiceListSkeleton } from '@/src/components/molecules/skeletons/InvoiceListSkeleton';

export default function InvoicesListScreen() {
	const router = useRouter();
	const { theme, c, s } = useThemeTokens();
	const { t, formatCurrency } = useLocale();

	const { invoices, loading, fetchInvoices } = useInvoiceStore(
		useShallow((s) => ({
			invoices: s.invoices,
			loading: s.loading,
			fetchInvoices: s.fetchInvoices,
		})),
	);
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		fetchInvoices().catch((_e) => {
			Alert.alert(t('common.errorTitle'), t('invoice.loadError'), [{ text: t('common.ok') }]);
		});
	}, [fetchInvoices, t]);

	const handleRefresh = async () => {
		setRefreshing(true);
		try {
			await fetchInvoices(1);
		} finally {
			setRefreshing(false);
		}
	};

	return (
		<AtomicScreen safeAreaEdges={['top']}>
			<View style={[styles.header, { borderBottomColor: c.border }]}>
				<ThemedText variant="h1" accessibilityLabel="invoices-screen">
					Invoices
				</ThemedText>
				<Button
					title="New Invoice"
					accessibilityLabel="new-invoice-button"
					leftIcon={<Plus color="#FFF" size={20} />}
					onPress={() => router.push('/(app)/invoices/create')}
				/>
			</View>

			{loading && invoices.length === 0 ? <InvoiceListSkeleton /> : null}
			<FlatList
				data={loading && invoices.length === 0 ? [] : invoices}
				keyExtractor={(item) => item.id}
				refreshing={refreshing}
				onRefresh={handleRefresh}
				initialNumToRender={10}
				windowSize={5}
				maxToRenderPerBatch={10}
				contentContainerStyle={{ padding: s.md }}
				ListEmptyComponent={() => (
					<View style={{ alignItems: 'center', marginTop: s['2xl'] }}>
						<FileText color={c.placeholder} size={64} />
						<ThemedText color={c.onSurfaceVariant} style={{ marginTop: s.md }}>
							No invoices found.
						</ThemedText>
						<Button
							title="Create your first invoice"
							variant="outline"
							style={{ marginTop: s.lg }}
							onPress={() => router.push('/(app)/invoices/create')}
						/>
					</View>
				)}
				renderItem={({ item }) => (
					<TouchableOpacity
						style={[
							styles.invoiceCard,
							{
								backgroundColor: theme.colors.card,
								...(theme.shadows.sm as object),
							},
						]}
						accessibilityRole="button"
						accessibilityLabel={`invoice-${item.invoice_number}`}
						accessibilityHint={`${item.payment_status}, ${formatCurrency(item.grand_total)}. Double tap to open`}
						onPress={() => router.push(`/(app)/invoices/${item.id}`)}
					>
						<View style={styles.cardHeader}>
							<ThemedText weight="bold" variant="body1">
								{item.invoice_number}
							</ThemedText>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{new Date(item.invoice_date).toLocaleDateString('en-IN')}
							</ThemedText>
						</View>
						<ThemedText color={c.onSurfaceVariant} style={{ marginBottom: s.sm }}>
							{item.customer_name}
						</ThemedText>
						<View style={styles.cardFooter}>
							<InvoiceStatusBadge
								status={item.payment_status as InvoiceStatus}
								size="sm"
							/>
							<ThemedText variant="h3" color={c.primary}>
								{formatCurrency(item.grand_total)}
							</ThemedText>
						</View>
					</TouchableOpacity>
				)}
			/>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	header: {
		padding: 16,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderBottomWidth: 1,
	},
	invoiceCard: {
		padding: 16,
		borderRadius: 12,
		marginBottom: 12,
	},
	cardHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 4,
	},
	cardFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 8,
	},
});
