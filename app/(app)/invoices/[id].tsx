import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { pdfService } from '@/src/services/pdfService';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Screen } from '@/src/components/atoms/Screen';
import { Button } from '@/src/components/atoms/Button';
import { useLocale } from '@/src/hooks/useLocale';
import { Share2, ArrowLeft } from 'lucide-react-native';

export default function InvoiceDetailScreen() {
	const { id } = useLocalSearchParams();
	const router = useRouter();
	const { theme } = useTheme();
	const { formatCurrency } = useLocale();
	const c = theme.colors;
	const s = theme.spacing;

	const { currentInvoice, fetchInvoiceById, loading, error, clearCurrentInvoice } =
		useInvoiceStore();
	const [sharing, setSharing] = useState(false);

	useEffect(() => {
		if (id) {
			fetchInvoiceById(id as string);
		}
		return () => clearCurrentInvoice();
	}, [id, fetchInvoiceById, clearCurrentInvoice]);

	const handleShare = async () => {
		if (!currentInvoice) return;
		setSharing(true);
		await pdfService.printAndShareInvoice(currentInvoice);
		setSharing(false);
	};

	if (loading) {
		return (
			<Screen safeAreaEdges={['top']} withKeyboard={false}>
				<View style={styles.center}>
					<ActivityIndicator size="large" color={c.primary} />
				</View>
			</Screen>
		);
	}

	if (error || !currentInvoice) {
		return (
			<Screen safeAreaEdges={['top']} withKeyboard={false}>
				<View style={styles.center}>
					<ThemedText color={c.error}>Failed to load invoice.</ThemedText>
					<Button
						title="Go Back"
						onPress={() => router.back()}
						style={{ marginTop: s.lg }}
					/>
				</View>
			</Screen>
		);
	}

	return (
		<Screen safeAreaEdges={['top']} withKeyboard={false}>
			<View
				style={[
					styles.header,
					theme.layout.rowBetween,
					{ borderBottomColor: c.border, borderBottomWidth: 1 },
				]}
			>
				<View style={[theme.layout.row, { flex: 1 }]}>
					<ArrowLeft
						color={c.onBackground}
						size={24}
						onPress={() => router.back()}
						style={{ marginRight: s.md }}
					/>
					<ThemedText variant="h2" style={{ flex: 1 }}>
						{currentInvoice.invoice_number}
					</ThemedText>
				</View>
				<Button
					title="Share PDF"
					variant="outline"
					leftIcon={<Share2 size={20} color={c.primary} />}
					onPress={handleShare}
					loading={sharing}
				/>
			</View>

			<ScrollView contentContainerStyle={{ padding: s.lg }}>
				<View style={{ marginBottom: s.xl }}>
					<ThemedText variant="caption" color={c.onSurfaceVariant}>
						Billed To
					</ThemedText>
					<ThemedText variant="h3">{currentInvoice.customer_name}</ThemedText>
					<ThemedText color={c.onSurface}>{currentInvoice.customer_phone}</ThemedText>
					{!!currentInvoice.customer_gstin && (
						<ThemedText color={c.onSurface}>
							GSTIN: {currentInvoice.customer_gstin}
						</ThemedText>
					)}
				</View>
				<ThemedText variant="h3" style={{ marginBottom: s.md }}>
					Items
				</ThemedText>
				<View
					style={{
						backgroundColor: c.surface,
						borderRadius: theme.borderRadius.md,
						borderWidth: 1,
						borderColor: c.border,
						overflow: 'hidden',
					}}
				>
					{currentInvoice.line_items?.map((item, index) => (
						<View
							key={item.id}
							style={{
								padding: s.md,
								borderBottomWidth:
									index === currentInvoice.line_items!.length - 1 ? 0 : 1,
								borderBottomColor: c.border,
							}}
						>
							<ThemedText weight="semibold">{item.design_name}</ThemedText>
							<View style={[theme.layout.rowBetween, { marginTop: 4 }]}>
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									{item.quantity} units @ {formatCurrency(item.rate_per_unit)}
								</ThemedText>
								<ThemedText weight="semibold">
									{formatCurrency(item.line_total)}
								</ThemedText>
							</View>
						</View>
					))}
				</View>
				<View
					style={{
						marginTop: s.xl,
						backgroundColor: c.surface,
						padding: s.md,
						borderRadius: theme.borderRadius.md,
						borderWidth: 1,
						borderColor: c.border,
					}}
				>
					<View style={theme.layout.rowBetween}>
						<ThemedText color={c.onSurfaceVariant}>Subtotal</ThemedText>
						<ThemedText color={c.onSurface}>
							{formatCurrency(currentInvoice.subtotal)}
						</ThemedText>
					</View>
					{currentInvoice.is_inter_state ? (
						<View style={theme.layout.rowBetween}>
							<ThemedText color={c.onSurfaceVariant}>IGST</ThemedText>
							<ThemedText color={c.onSurface}>
								{formatCurrency(currentInvoice.igst_total)}
							</ThemedText>
						</View>
					) : (
						<>
							<View style={theme.layout.rowBetween}>
								<ThemedText color={c.onSurfaceVariant}>CGST</ThemedText>
								<ThemedText color={c.onSurface}>
									{formatCurrency(currentInvoice.cgst_total)}
								</ThemedText>
							</View>
							<View style={theme.layout.rowBetween}>
								<ThemedText color={c.onSurfaceVariant}>SGST</ThemedText>
								<ThemedText color={c.onSurface}>
									{formatCurrency(currentInvoice.sgst_total)}
								</ThemedText>
							</View>
						</>
					)}
					<View
						style={[
							theme.layout.rowBetween,
							{
								borderTopWidth: 1,
								borderTopColor: c.border,
								paddingTop: s.sm,
								marginTop: s.sm,
							},
						]}
					>
						<ThemedText weight="bold">Grand Total</ThemedText>
						<ThemedText variant="h2" color={c.primary}>
							{formatCurrency(currentInvoice.grand_total)}
						</ThemedText>
					</View>
					<View style={theme.layout.rowBetween}>
						<ThemedText color={c.onSurfaceVariant}>Amount Paid</ThemedText>
						<ThemedText weight="semibold" color={c.success}>
							{formatCurrency(currentInvoice.amount_paid)}
						</ThemedText>
					</View>
					{currentInvoice.grand_total - currentInvoice.amount_paid > 0 && (
						<View style={theme.layout.rowBetween}>
							<ThemedText color={c.error}>Balance Due</ThemedText>
							<ThemedText variant="h3" color={c.error}>
								{formatCurrency(
									currentInvoice.grand_total - currentInvoice.amount_paid,
								)}
							</ThemedText>
						</View>
					)}
				</View>
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	header: {
		padding: 16,
	},
});
