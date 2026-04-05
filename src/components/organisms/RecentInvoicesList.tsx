import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { FileText, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { InvoiceStatusBadge } from '@/src/components/molecules/InvoiceStatusBadge';
import type { InvoiceStatus } from '@/src/components/molecules/InvoiceStatusBadge';
import { useLocale } from '@/src/hooks/useLocale';
import { formatDate } from '@/src/utils/dateUtils';
import { layout } from '@/src/theme/layout';

export interface Invoice {
	id: string;
	customer_name: string;
	invoice_number: string;
	invoice_date: string;
	grand_total: number;
	payment_status: string;
}

export interface RecentInvoicesListProps {
	invoices: Invoice[];
}

export const RecentInvoicesList: React.FC<RecentInvoicesListProps> = ({ invoices }) => {
	const { theme } = useTheme();
	const { t, formatCurrency } = useLocale();
	const router = useRouter();

	const c = theme.colors;
	const s = theme.spacing;
	const r = theme.borderRadius;

	return (
		<View style={[styles.section, { paddingHorizontal: s.lg, marginTop: s.lg }]}>
			<View style={[layout.rowBetween, { marginBottom: s.sm }]}>
				<ThemedText variant="h3">{t('dashboard.recentInvoices')}</ThemedText>
				<TouchableOpacity
					onPress={() => router.push('/(app)/(tabs)/invoices')}
					accessibilityRole="button"
					accessibilityLabel={t('invoice.viewAllInvoices')}
					accessibilityHint={t('invoice.viewAllInvoices')}
				>
					<ThemedText variant="body2" color={c.primary}>
						{t('common.seeAll')}
					</ThemedText>
				</TouchableOpacity>
			</View>

			{invoices.length === 0 ? (
				<View
					style={[
						styles.emptyCard,
						{ backgroundColor: c.surfaceVariant, borderRadius: r.md, padding: s.xl },
					]}
				>
					<FileText
						size={32}
						color={c.placeholder}
						strokeWidth={1.5}
						importantForAccessibility="no"
					/>
					<ThemedText
						variant="caption"
						color={c.placeholder}
						align="center"
						style={{ marginTop: s.sm }}
					>
						{t('invoice.noInvoices')}
						{'\n'}
						{t('invoice.createFirst')}
					</ThemedText>
				</View>
			) : (
				<View accessibilityRole="list" style={{ gap: s.sm }}>
					{invoices.map((inv) => (
						<TouchableOpacity
							key={inv.id}
							onPress={() => router.push(`/(app)/invoices/${inv.id}` as Href)}
							accessibilityRole="button"
							accessibilityLabel={`invoice-${inv.invoice_number}`}
							accessibilityHint={`${inv.payment_status}, ${formatCurrency(inv.grand_total)}. ${t('invoice.tapToOpen')}`}
							style={[
								styles.invoiceItem,
								{
									backgroundColor: c.card,
									borderRadius: r.md,
									padding: s.md,
									...(theme.shadows.sm as object),
								},
							]}
						>
							<View style={layout.rowBetween}>
								<View style={{ flex: 1 }}>
									<ThemedText weight="semibold">{inv.customer_name}</ThemedText>
									<ThemedText variant="caption" color={c.onSurfaceVariant}>
										{inv.invoice_number} • {formatDate(inv.invoice_date)}
									</ThemedText>
								</View>
								<View style={{ alignItems: 'flex-end' }}>
									<ThemedText weight="bold" color={c.primary}>
										{formatCurrency(inv.grand_total)}
									</ThemedText>
									<View style={{ marginTop: 4 }}>
										<InvoiceStatusBadge
											status={inv.payment_status as InvoiceStatus}
											size="sm"
										/>
									</View>
								</View>
								<ChevronRight
									size={18}
									color={c.placeholder}
									style={{ marginLeft: s.xs }}
									importantForAccessibility="no"
								/>
							</View>
						</TouchableOpacity>
					))}
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	section: {},
	emptyCard: { alignItems: 'center' },
	invoiceItem: {},
});
