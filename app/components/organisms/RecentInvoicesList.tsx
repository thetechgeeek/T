import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { FileText, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@easydesign/design-system/foundation';
import { ThemedText } from '@easydesign/design-system';
import { Card } from '@easydesign/design-system';
import { InvoiceStatusBadge } from '@/app/components/molecules/InvoiceStatusBadge';
import type { InvoiceStatus } from '@/app/components/molecules/InvoiceStatusBadge';
import { useLocale } from '@/src/hooks/useLocale';
import { formatDate } from '@/src/utils/dateUtils';
import { layout } from '@easydesign/design-system/foundation';

const RECENT_INVOICES_LABEL_LETTER_SPACING = 0.6;

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
				<ThemedText
					variant="caption"
					color={c.onSurfaceVariant}
					style={{
						letterSpacing: RECENT_INVOICES_LABEL_LETTER_SPACING,
						textTransform: 'uppercase',
					}}
				>
					{t('dashboard.recentInvoices')}
				</ThemedText>
				<Pressable
					onPress={() => router.push('/(app)/(tabs)/invoices' as Href)}
					accessibilityRole="button"
					accessibilityLabel="see-all-invoices"
					accessibilityHint="View all invoices"
				>
					<ThemedText variant="caption" weight="semibold" color={c.primary}>
						{t('common.seeAll')}
					</ThemedText>
				</Pressable>
			</View>

			{invoices.length === 0 ? (
				<Card
					style={[
						styles.emptyCard,
						{
							backgroundColor: c.card,
							borderColor: c.border,
							borderRadius: r.xl,
							padding: s.xl,
						},
					]}
					variant="outlined"
				>
					<FileText
						size={32}
						color={c.onSurfaceVariant}
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
				</Card>
			) : (
				<Card
					accessibilityRole="list"
					padding="none"
					style={{
						borderColor: c.border,
						borderRadius: r.xl,
						overflow: 'hidden',
					}}
					variant="outlined"
				>
					{invoices.map((inv, index) => (
						<Pressable
							key={inv.id}
							onPress={() => router.push(`/(app)/invoices/${inv.id}` as Href)}
							accessibilityRole="button"
							accessibilityLabel={`invoice-${inv.invoice_number}`}
							accessibilityHint={`${inv.payment_status}, ${formatCurrency(inv.grand_total)}. ${t('invoice.tapToOpen')}`}
							style={({ pressed }) => [
								styles.invoiceItem,
								{
									backgroundColor: pressed ? c.surfaceVariant : c.card,
									borderBottomColor: c.separator,
									borderBottomWidth:
										index === invoices.length - 1
											? 0
											: StyleSheet.hairlineWidth,
									paddingHorizontal: s.md,
									paddingVertical: s.md,
								},
							]}
						>
							<View style={layout.rowBetween}>
								<View style={[layout.row, styles.primaryBlock]}>
									<View
										style={[
											styles.invoiceIcon,
											{
												backgroundColor: c.surfaceVariant,
												borderRadius: r.md,
											},
										]}
									>
										<FileText
											size={16}
											color={c.onSurfaceVariant}
											strokeWidth={1.8}
										/>
									</View>
									<View style={{ flex: 1, marginLeft: s.sm }}>
										<ThemedText weight="semibold">
											{inv.customer_name}
										</ThemedText>
										<ThemedText variant="caption" color={c.onSurfaceVariant}>
											{inv.invoice_number} • {formatDate(inv.invoice_date)}
										</ThemedText>
									</View>
								</View>
								<View style={{ alignItems: 'flex-end', marginLeft: s.sm }}>
									<ThemedText weight="bold" color={c.onSurface}>
										{formatCurrency(inv.grand_total)}
									</ThemedText>
									<View style={{ marginTop: s.xs }}>
										<InvoiceStatusBadge
											status={inv.payment_status as InvoiceStatus}
											size="sm"
										/>
									</View>
								</View>
								<ChevronRight
									size={16}
									color={c.placeholder}
									style={{ marginLeft: s.sm }}
									importantForAccessibility="no"
								/>
							</View>
						</Pressable>
					))}
				</Card>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	section: {},
	primaryBlock: {
		flex: 1,
	},
	emptyCard: { alignItems: 'center' },
	invoiceItem: {},
	invoiceIcon: {
		alignItems: 'center',
		height: 36,
		justifyContent: 'center',
		width: 36,
	},
});
