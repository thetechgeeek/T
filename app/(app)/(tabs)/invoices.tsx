import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
	View,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	Alert,
	TextInput,
	type ListRenderItem,
	type StyleProp,
	type TextStyle,
	type ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeTokens } from '@easydesign/design-system/foundation';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { Button } from '@easydesign/design-system';
import { useLocale } from '@/src/hooks/useLocale';
import { FileText, Plus, Search, X } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@easydesign/design-system';
import { ThemedText } from '@easydesign/design-system';
import { InvoiceStatusBadge } from '@/app/components/molecules/InvoiceStatusBadge';
import type { InvoiceStatus } from '@/app/components/molecules/InvoiceStatusBadge';
import { InvoiceListSkeleton } from '@/app/components/molecules/skeletons/InvoiceListSkeleton';
import type { Invoice, PaymentStatus } from '@/src/types/invoice';
import { SPACING_PX } from '@easydesign/design-system/foundation';
import type { UUID } from '@/src/types/common';

// ─── types ───────────────────────────────────────────────────────────────────

type DateChip = 'all' | 'today' | 'week' | 'month' | 'fy';
type StatusChip = 'ALL' | PaymentStatus | 'overdue';

// ─── helpers ─────────────────────────────────────────────────────────────────

function getDateRange(chip: DateChip): { from?: string; to?: string } {
	const now = new Date();
	const pad = (n: number) => String(n).padStart(2, '0');
	const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

	if (chip === 'today') {
		const s = fmt(now);
		return { from: s, to: s };
	}
	if (chip === 'week') {
		const start = new Date(now);
		start.setDate(now.getDate() - now.getDay());
		return { from: fmt(start), to: fmt(now) };
	}
	if (chip === 'month') {
		const start = new Date(now.getFullYear(), now.getMonth(), 1);
		return { from: fmt(start), to: fmt(now) };
	}
	if (chip === 'fy') {
		// Indian financial year: April 1 – March 31
		const fyStart =
			now.getMonth() >= 3
				? new Date(now.getFullYear(), 3, 1)
				: new Date(now.getFullYear() - 1, 3, 1);
		return { from: fmt(fyStart), to: fmt(now) };
	}
	return {};
}

const DATE_CHIP_LABELS: Record<DateChip, string> = {
	all: 'All Time',
	today: 'Today',
	week: 'This Week',
	month: 'This Month',
	fy: 'This FY',
};

const DATE_CHIPS: DateChip[] = ['all', 'today', 'week', 'month', 'fy'];
const STATUS_CHIPS: StatusChip[] = ['ALL', 'paid', 'partial', 'unpaid'];
const INVOICES_SCREEN_ACCESSIBILITY_LABEL = 'invoices-screen';
const chipKeyExtractor = (chip: string) => chip;
const invoiceKeyExtractor = (invoice: Invoice) => invoice.id;

function getStatusDotColor(
	status: PaymentStatus,
	isOverdue: boolean,
	colors: {
		error: string;
		overdue: string;
		success: string;
		warning: string;
	},
) {
	if (isOverdue) return colors.overdue;
	if (status === 'paid') return colors.success;
	if (status === 'partial') return colors.warning;
	return colors.error;
}

interface DateChipButtonProps {
	chip: DateChip;
	isActive: boolean;
	label: string;
	activeBackgroundColor: string;
	inactiveBackgroundColor: string;
	activeTextColor: string;
	inactiveTextColor: string;
	borderRadius: number;
	onPress: (chip: DateChip) => void;
}

const DateChipButton = React.memo(function DateChipButton({
	chip,
	isActive,
	label,
	activeBackgroundColor,
	inactiveBackgroundColor,
	activeTextColor,
	inactiveTextColor,
	borderRadius,
	onPress,
}: DateChipButtonProps) {
	const handlePress = useCallback(() => onPress(chip), [chip, onPress]);

	return (
		<TouchableOpacity
			style={[
				styles.chip,
				{
					backgroundColor: isActive ? activeBackgroundColor : inactiveBackgroundColor,
					borderRadius,
				},
			]}
			onPress={handlePress}
			accessibilityRole="button"
			accessibilityLabel={`date-filter-${chip}`}
		>
			<ThemedText
				variant="captionBold"
				color={isActive ? activeTextColor : inactiveTextColor}
			>
				{label}
			</ThemedText>
		</TouchableOpacity>
	);
});

interface StatusChipButtonProps {
	chip: StatusChip;
	isActive: boolean;
	activeBackgroundColor: string;
	inactiveBackgroundColor: string;
	activeTextColor: string;
	inactiveTextColor: string;
	dotColor: string;
	borderRadius: number;
	onPress: (chip: StatusChip) => void;
}

const StatusChipButton = React.memo(function StatusChipButton({
	chip,
	isActive,
	activeBackgroundColor,
	inactiveBackgroundColor,
	activeTextColor,
	inactiveTextColor,
	dotColor,
	borderRadius,
	onPress,
}: StatusChipButtonProps) {
	const handlePress = useCallback(() => onPress(chip), [chip, onPress]);

	return (
		<TouchableOpacity
			style={[
				styles.chip,
				styles.statusChip,
				{
					backgroundColor: isActive ? activeBackgroundColor : inactiveBackgroundColor,
					borderRadius,
				},
			]}
			onPress={handlePress}
			accessibilityRole="button"
			accessibilityLabel={`status-filter-${chip}`}
		>
			{chip !== 'ALL' && (
				<View
					style={[
						styles.statusDot,
						{ backgroundColor: isActive ? activeTextColor : dotColor },
					]}
				/>
			)}
			<ThemedText
				variant="captionBold"
				color={isActive ? activeTextColor : inactiveTextColor}
			>
				{chip === 'ALL' ? 'All' : chip.charAt(0).toUpperCase() + chip.slice(1)}
			</ThemedText>
		</TouchableOpacity>
	);
});

interface InvoiceRowProps {
	invoice: Invoice;
	cardStyle: StyleProp<ViewStyle>;
	customerNameStyle: StyleProp<TextStyle>;
	onSurfaceVariantColor: string;
	primaryColor: string;
	statusColors: {
		error: string;
		overdue: string;
		success: string;
		warning: string;
	};
	formatCurrency: (amount: number) => string;
	formatDate: (date: string) => string;
	onPressInvoice: (id: UUID) => void;
	t: (key: string) => string;
}

const InvoiceRow = React.memo(function InvoiceRow({
	invoice,
	cardStyle,
	customerNameStyle,
	onSurfaceVariantColor,
	primaryColor,
	statusColors,
	formatCurrency,
	formatDate,
	onPressInvoice,
	t,
}: InvoiceRowProps) {
	const dueDateStr = invoice.due_date;
	const isOverdue =
		invoice.payment_status === 'unpaid' && !!dueDateStr && new Date(dueDateStr) < new Date();
	const dotColor = getStatusDotColor(invoice.payment_status, isOverdue, statusColors);
	const handlePress = useCallback(() => onPressInvoice(invoice.id), [invoice.id, onPressInvoice]);

	return (
		<TouchableOpacity
			style={cardStyle}
			accessibilityRole="button"
			accessibilityLabel={`invoice-${invoice.invoice_number}`}
			accessibilityHint={`${t('invoice.' + invoice.payment_status)}, ${formatCurrency(invoice.grand_total)}. ${t('invoice.tapToOpen')}`}
			onPress={handlePress}
		>
			<View style={styles.cardHeader}>
				<View style={[styles.statusDotInline, { backgroundColor: dotColor }]} />
				<ThemedText weight="bold" variant="body" style={styles.cardTitle}>
					{invoice.invoice_number}
				</ThemedText>
				<ThemedText variant="caption" color={onSurfaceVariantColor}>
					{formatDate(invoice.invoice_date)}
				</ThemedText>
			</View>
			<ThemedText color={onSurfaceVariantColor} style={customerNameStyle}>
				{invoice.customer_name}
			</ThemedText>
			<View style={styles.cardFooter}>
				<InvoiceStatusBadge status={invoice.payment_status as InvoiceStatus} size="sm" />
				<ThemedText variant="h3" color={primaryColor}>
					{formatCurrency(invoice.grand_total)}
				</ThemedText>
			</View>
		</TouchableOpacity>
	);
});

// ─── component ───────────────────────────────────────────────────────────────

export default function InvoicesListScreen() {
	const router = useRouter();
	const { theme, c, s, r, typo } = useThemeTokens();
	const { t, formatCurrency, formatDate } = useLocale();

	const { invoices, loading, fetchInvoices } = useInvoiceStore(
		useShallow((st) => ({
			invoices: st.invoices,
			loading: st.loading,
			fetchInvoices: st.fetchInvoices,
		})),
	);

	const [refreshing, setRefreshing] = useState(false);
	const [search, setSearch] = useState('');
	const [dateChip, setDateChip] = useState<DateChip>('all');
	const [statusChip, setStatusChip] = useState<StatusChip>('ALL');

	const handleNewInvoice = useCallback(() => {
		router.push('/(app)/invoices/create');
	}, [router]);

	const handleOpenInvoice = useCallback(
		(id: UUID) => {
			router.push(`/(app)/invoices/${id}`);
		},
		[router],
	);

	const handleClearSearch = useCallback(() => setSearch(''), []);
	const handleDateChipPress = useCallback((chip: DateChip) => setDateChip(chip), []);
	const handleStatusChipPress = useCallback((chip: StatusChip) => setStatusChip(chip), []);

	useEffect(() => {
		fetchInvoices().catch(() => {
			Alert.alert(t('common.errorTitle'), t('invoice.loadError'), [{ text: t('common.ok') }]);
		});
	}, [fetchInvoices, t]);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await fetchInvoices(1);
		} finally {
			setRefreshing(false);
		}
	}, [fetchInvoices]);

	// ── client-side filter (search + date + status) ──
	const filtered = useMemo<Invoice[]>(() => {
		const { from, to } = getDateRange(dateChip);
		const q = search.trim().toLowerCase();

		return invoices.filter((inv) => {
			// Search
			if (q) {
				const match =
					inv.invoice_number.toLowerCase().includes(q) ||
					inv.customer_name.toLowerCase().includes(q);
				if (!match) return false;
			}
			// Date range
			if (from && inv.invoice_date < from) return false;
			if (to && inv.invoice_date > to) return false;
			// Status
			if (statusChip !== 'ALL' && statusChip !== 'overdue') {
				if (inv.payment_status !== statusChip) return false;
			}
			if (statusChip === 'overdue') {
				const dueDateStr = inv.due_date;
				const isOverdue =
					inv.payment_status === 'unpaid' &&
					!!dueDateStr &&
					new Date(dueDateStr) < new Date();
				if (!isOverdue) return false;
			}
			return true;
		});
	}, [invoices, search, dateChip, statusChip]);

	// ── summary card stats (filtered by this month always, independent of chips) ──
	const monthlySummary = useMemo(() => {
		const now = new Date();
		const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
		const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
			.toISOString()
			.slice(0, 10);
		const thisMonth = invoices.filter(
			(inv) => inv.invoice_date >= monthStart && inv.invoice_date <= monthEnd,
		);
		const billed = thisMonth.reduce((s, i) => s + i.grand_total, 0);
		const collected = thisMonth.reduce((s, i) => s + i.amount_paid, 0);
		const pending = billed - collected;
		return { billed, collected, pending };
	}, [invoices]);

	const summaryCardStyle = useMemo<StyleProp<ViewStyle>>(
		() => [
			styles.summaryCard,
			{
				backgroundColor: c.card,
				marginHorizontal: s.md,
				marginTop: s.md,
				borderRadius: r.md,
				...theme.shadows.sm,
			},
		],
		[c.card, r.md, s.md, theme.shadows.sm],
	);

	const searchBarStyle = useMemo<StyleProp<ViewStyle>>(
		() => [
			styles.searchBar,
			{
				backgroundColor: c.surfaceVariant,
				borderRadius: r.md,
				marginHorizontal: s.md,
				marginTop: s.md,
			},
		],
		[c.surfaceVariant, r.md, s.md],
	);

	const searchInputStyle = useMemo<StyleProp<TextStyle>>(
		() => [
			styles.searchInput,
			{ color: c.onSurface, fontSize: typo.variants.caption.fontSize },
		],
		[c.onSurface, typo.variants.caption.fontSize],
	);

	const invoiceCardStyle = useMemo<StyleProp<ViewStyle>>(
		() => [
			styles.invoiceCard,
			{
				backgroundColor: theme.colors.card,
				borderRadius: r.lg,
				...theme.shadows.sm,
			},
		],
		[r.lg, theme.colors.card, theme.shadows.sm],
	);

	const statusColors = useMemo(
		() => ({
			error: c.error,
			overdue: c.overdue,
			success: c.success,
			warning: c.warning,
		}),
		[c.error, c.overdue, c.success, c.warning],
	);

	const renderDateChip = useCallback<ListRenderItem<DateChip>>(
		({ item: chip }) => (
			<DateChipButton
				chip={chip}
				isActive={dateChip === chip}
				label={DATE_CHIP_LABELS[chip]}
				activeBackgroundColor={c.primary}
				inactiveBackgroundColor={c.surfaceVariant}
				activeTextColor={c.onPrimary}
				inactiveTextColor={c.onSurfaceVariant}
				borderRadius={r.full}
				onPress={handleDateChipPress}
			/>
		),
		[
			c.onPrimary,
			c.onSurfaceVariant,
			c.primary,
			c.surfaceVariant,
			dateChip,
			handleDateChipPress,
			r.full,
		],
	);

	const renderStatusChip = useCallback<ListRenderItem<StatusChip>>(
		({ item: chip }) => {
			const isActive = statusChip === chip;
			const dotColor =
				chip === 'paid'
					? c.success
					: chip === 'partial'
						? c.warning
						: chip === 'unpaid'
							? c.error
							: 'transparent';

			return (
				<StatusChipButton
					chip={chip}
					isActive={isActive}
					activeBackgroundColor={c.primary}
					inactiveBackgroundColor={c.surfaceVariant}
					activeTextColor={c.onPrimary}
					inactiveTextColor={c.onSurfaceVariant}
					dotColor={dotColor}
					borderRadius={r.full}
					onPress={handleStatusChipPress}
				/>
			);
		},
		[
			c.error,
			c.onPrimary,
			c.onSurfaceVariant,
			c.primary,
			c.success,
			c.surfaceVariant,
			c.warning,
			handleStatusChipPress,
			r.full,
			statusChip,
		],
	);

	const renderInvoice = useCallback<ListRenderItem<Invoice>>(
		({ item }) => (
			<InvoiceRow
				invoice={item}
				cardStyle={invoiceCardStyle}
				customerNameStyle={styles.invoiceCustomerName}
				onSurfaceVariantColor={c.onSurfaceVariant}
				primaryColor={c.primary}
				statusColors={statusColors}
				formatCurrency={formatCurrency}
				formatDate={formatDate}
				onPressInvoice={handleOpenInvoice}
				t={t}
			/>
		),
		[
			c.onSurfaceVariant,
			c.primary,
			formatCurrency,
			formatDate,
			handleOpenInvoice,
			invoiceCardStyle,
			statusColors,
			t,
		],
	);

	const renderEmptyInvoices = useCallback(
		() => (
			<View style={styles.emptyState}>
				<FileText color={c.placeholder} size={64} />
				<ThemedText color={c.onSurfaceVariant} style={styles.emptyText}>
					{search || statusChip !== 'ALL' || dateChip !== 'all'
						? t('common.noResults')
						: t('invoice.noInvoices')}
				</ThemedText>
				{!search && statusChip === 'ALL' && dateChip === 'all' && (
					<Button
						title={t('invoice.createFirst')}
						variant="outline"
						style={styles.createFirstButton}
						onPress={handleNewInvoice}
					/>
				)}
			</View>
		),
		[c.onSurfaceVariant, c.placeholder, dateChip, handleNewInvoice, search, statusChip, t],
	);

	return (
		<AtomicScreen safeAreaEdges={['top']}>
			{/* ── Top Header ── */}
			<View style={[styles.header, { borderBottomColor: c.border }]}>
				<ThemedText variant="h1" accessibilityLabel={INVOICES_SCREEN_ACCESSIBILITY_LABEL}>
					{t('invoice.title')}
				</ThemedText>
				<Button
					title={t('invoice.newInvoice')}
					accessibilityLabel="new-invoice-button"
					leftIcon={<Plus color={c.onPrimary} size={20} />}
					onPress={handleNewInvoice}
				/>
			</View>

			{/* ── Monthly Summary Card ── */}
			{invoices.length > 0 && (
				<View style={summaryCardStyle}>
					<ThemedText
						variant="caption"
						color={c.onSurfaceVariant}
						style={styles.summaryTitle}
					>
						This Month
					</ThemedText>
					<View style={styles.summaryRow}>
						<View style={styles.summaryCol}>
							<ThemedText variant="captionBold" color={c.onSurfaceVariant}>
								Billed
							</ThemedText>
							<ThemedText variant="bodyBold" color={c.onSurface}>
								{formatCurrency(monthlySummary.billed)}
							</ThemedText>
						</View>
						<View style={[styles.summaryDivider, { backgroundColor: c.border }]} />
						<View style={styles.summaryCol}>
							<ThemedText variant="captionBold" color={c.onSurfaceVariant}>
								Collected
							</ThemedText>
							<ThemedText variant="bodyBold" color={c.success}>
								{formatCurrency(monthlySummary.collected)}
							</ThemedText>
						</View>
						<View style={[styles.summaryDivider, { backgroundColor: c.border }]} />
						<View style={styles.summaryCol}>
							<ThemedText variant="captionBold" color={c.onSurfaceVariant}>
								Pending
							</ThemedText>
							<ThemedText
								variant="bodyBold"
								color={monthlySummary.pending > 0 ? c.error : c.onSurface}
							>
								{formatCurrency(monthlySummary.pending)}
							</ThemedText>
						</View>
					</View>
				</View>
			)}

			{/* ── Search Bar ── */}
			<View style={searchBarStyle}>
				<Search size={16} color={c.placeholder} style={styles.searchIcon} />
				<TextInput
					style={searchInputStyle}
					placeholder="Search invoice no. or customer..."
					placeholderTextColor={c.placeholder}
					value={search}
					onChangeText={setSearch}
					returnKeyType="search"
					clearButtonMode="never"
					accessibilityLabel="invoice-search-input"
				/>
				{search.length > 0 && (
					<TouchableOpacity onPress={handleClearSearch} accessibilityLabel="clear-search">
						<X size={16} color={c.placeholder} />
					</TouchableOpacity>
				)}
			</View>

			{/* ── Date Filter Chips ── */}
			<FlatList
				horizontal
				data={DATE_CHIPS}
				keyExtractor={chipKeyExtractor}
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.dateChipContent}
				renderItem={renderDateChip}
			/>

			{/* ── Status Filter Chips ── */}
			<FlatList
				horizontal
				data={STATUS_CHIPS}
				keyExtractor={chipKeyExtractor}
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.statusChipContent}
				renderItem={renderStatusChip}
			/>

			{/* ── Invoice List ── */}
			{loading && invoices.length === 0 ? <InvoiceListSkeleton /> : null}
			<FlatList
				data={loading && invoices.length === 0 ? [] : filtered}
				keyExtractor={invoiceKeyExtractor}
				refreshing={refreshing}
				onRefresh={handleRefresh}
				initialNumToRender={10}
				windowSize={5}
				maxToRenderPerBatch={10}
				removeClippedSubviews={true}
				contentContainerStyle={styles.invoiceListContent}
				ListEmptyComponent={renderEmptyInvoices}
				renderItem={renderInvoice}
			/>
		</AtomicScreen>
	);
}

// ─── styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
	header: {
		padding: SPACING_PX.lg,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	summaryCard: {
		padding: SPACING_PX.md,
	},
	summaryTitle: {
		marginBottom: SPACING_PX.xs,
	},
	summaryRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	summaryCol: {
		flex: 1,
		alignItems: 'center',
		gap: SPACING_PX.xxs,
	},
	summaryDivider: {
		width: StyleSheet.hairlineWidth,
		height: SPACING_PX['2xl'],
		marginHorizontal: SPACING_PX.xs,
	},
	searchBar: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm,
	},
	searchInput: {
		flex: 1,
		paddingVertical: 0,
	},
	searchIcon: {
		marginRight: SPACING_PX.xs,
	},
	dateChipContent: {
		paddingHorizontal: SPACING_PX.md,
		paddingTop: SPACING_PX.sm,
		gap: SPACING_PX.xs,
	},
	statusChipContent: {
		paddingHorizontal: SPACING_PX.md,
		paddingTop: SPACING_PX.xs,
		paddingBottom: SPACING_PX.sm,
		gap: SPACING_PX.xs,
	},
	chip: {
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.xs,
	},
	statusChip: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: SPACING_PX.xs,
	},
	statusDot: {
		width: SPACING_PX.sm,
		height: SPACING_PX.sm,
		borderRadius: SPACING_PX.sm,
	},
	invoiceCard: {
		padding: SPACING_PX.lg,
		marginBottom: SPACING_PX.md,
	},
	invoiceListContent: {
		padding: SPACING_PX.md,
		flexGrow: 1,
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: SPACING_PX.xs,
		gap: SPACING_PX.xs,
	},
	cardTitle: {
		flex: 1,
	},
	invoiceCustomerName: {
		marginBottom: SPACING_PX.sm,
	},
	statusDotInline: {
		width: SPACING_PX.sm,
		height: SPACING_PX.sm,
		borderRadius: SPACING_PX.sm,
	},
	cardFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: SPACING_PX.sm,
	},
	emptyState: {
		alignItems: 'center',
		marginTop: SPACING_PX['2xl'],
	},
	emptyText: {
		marginTop: SPACING_PX.md,
	},
	createFirstButton: {
		marginTop: SPACING_PX.lg,
	},
});
