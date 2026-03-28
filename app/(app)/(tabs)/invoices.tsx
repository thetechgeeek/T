import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { Button } from '@/src/components/atoms/Button';
import { useLocale } from '@/src/hooks/useLocale';
import { FileText, Plus } from 'lucide-react-native';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';

export default function InvoicesListScreen() {
	const router = useRouter();
	const { theme } = useTheme();
	const { formatCurrency } = useLocale();
	const c = theme.colors;
	const s = theme.spacing;

	const { invoices, fetchInvoices, loading, totalCount } = useInvoiceStore();

	useEffect(() => {
		fetchInvoices().catch((e) => {
			Alert.alert('Error', 'Failed to load invoices. ' + e.message, [{ text: 'OK' }]);
		});
	}, [fetchInvoices]);

	return (
		<Screen safeAreaEdges={['top']}>
			<View style={[styles.header, { borderBottomColor: c.border }]}>
				<ThemedText variant="h1">Invoices</ThemedText>
				<Button
					title="New Invoice"
					leftIcon={<Plus color="#FFF" size={20} />}
					onPress={() => router.push('/(app)/invoices/create')}
				/>
			</View>

			<FlatList
				data={invoices}
				keyExtractor={(item) => item.id}
				refreshing={loading}
				onRefresh={() => fetchInvoices(1)}
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
								borderColor: c.border,
								...(theme.shadows.sm as object),
							},
						]}
						onPress={() => router.push(`/(app)/invoices/${item.id}`)}
					>
						<View style={styles.cardHeader}>
							<ThemedText weight="bold" style={{ fontSize: 16 }}>
								{item.invoice_number}
							</ThemedText>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{new Date(item.invoice_date).toLocaleDateString()}
							</ThemedText>
						</View>
						<ThemedText color={c.onSurfaceVariant} style={{ marginBottom: s.sm }}>
							{item.customer_name}
						</ThemedText>
						<View style={styles.cardFooter}>
							<View
								style={[
									styles.badge,
									{
										backgroundColor:
											item.payment_status === 'paid'
												? c.success + '20'
												: c.warning + '20',
									},
								]}
							>
								<ThemedText
									color={item.payment_status === 'paid' ? c.success : c.warning}
									weight="semibold"
									style={{ fontSize: 12, textTransform: 'capitalize' }}
								>
									{item.payment_status}
								</ThemedText>
							</View>
							<ThemedText variant="h3" color={c.primary}>
								{formatCurrency(item.grand_total)}
							</ThemedText>
						</View>
					</TouchableOpacity>
				)}
			/>
		</Screen>
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
		borderWidth: 1,
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
	badge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
	},
});
