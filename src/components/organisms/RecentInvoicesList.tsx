import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { FileText, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/components/atoms/ThemedText';
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
	const typo = theme.typography;

	return (
		<View style={[styles.section, { paddingHorizontal: s.lg, marginTop: s.lg }]}>
			<View style={[layout.rowBetween, { marginBottom: s.sm }]}>
				<ThemedText variant="h3">{t('dashboard.recentInvoices')}</ThemedText>
				<TouchableOpacity
					onPress={() => router.push('/(app)/(tabs)/invoices')}
					accessibilityRole="button"
					accessibilityLabel="see-all-invoices"
					accessibilityHint="View all invoices"
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
							accessibilityHint={`${inv.payment_status}, ${formatCurrency(inv.grand_total)}. Double tap to open`}
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
									{/* Status badge — color + text, not color-only */}
									<View
										accessible={true}
										accessibilityLabel={inv.payment_status}
										style={[
											styles.statusBadge,
											{
												backgroundColor:
													inv.payment_status === 'paid'
														? c.success + '20'
														: inv.payment_status === 'partial'
															? c.warning + '20'
															: c.error + '20',
												paddingHorizontal: 6,
												paddingVertical: 2,
												borderRadius: 4,
												marginTop: 4,
											},
										]}
									>
										<ThemedText
											importantForAccessibility="no"
											variant="caption"
											style={{
												fontSize: 10,
												color:
													inv.payment_status === 'paid'
														? c.success
														: inv.payment_status === 'partial'
															? c.warning
															: c.error,
												textTransform: 'capitalize',
											}}
										>
											{inv.payment_status}
										</ThemedText>
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
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	sectionTitle: {},
	emptyCard: { alignItems: 'center' },
	invoiceItem: { marginBottom: 8 },
	statusBadge: { alignSelf: 'flex-start' },
});
