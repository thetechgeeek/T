import React, { useMemo } from 'react';
import {
  View, StyleSheet, RefreshControl,
} from 'react-native';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/hooks/useLocale';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { useCustomerStore } from '@/src/stores/customerStore';
import { todayISO } from '@/src/utils/dateUtils';

// Atomic Design Components
import { StatCard } from '@/src/components/molecules/StatCard';
import { DashboardHeader } from '@/src/components/organisms/DashboardHeader';
import { QuickActionsGrid } from '@/src/components/organisms/QuickActionsGrid';
import { RecentInvoicesList } from '@/src/components/organisms/RecentInvoicesList';
import { TrendingUp, AlertTriangle, Users, FileText, QrCode, Package, CreditCard } from 'lucide-react-native';

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { t, formatCurrency } = useLocale();
  const [refreshing, setRefreshing] = React.useState(false);

  const { invoices, fetchInvoices } = useInvoiceStore();
  const { items, fetchItems } = useInventoryStore();
  const { fetchCustomers } = useCustomerStore();

  const c = theme.colors;
  const s = theme.spacing;

  const quickActions = [
    { label: t('dashboard.newInvoice'), icon: FileText, route: '/(app)/invoices/create', color: c.primary },
    { label: t('dashboard.scanItem'), icon: QrCode, route: '/(app)/(tabs)/scan', color: c.info },
    { label: t('dashboard.addStock'), icon: Package, route: '/(app)/inventory/stock-op', color: c.success },
    { label: t('dashboard.recordPayment'), icon: CreditCard, route: '/(app)/finance/payments', color: c.warning },
  ];

  const today = todayISO();
  
  const todaySales = useMemo(() => {
    return invoices
      .filter(inv => inv.invoice_date === today)
      .reduce((sum, inv) => sum + inv.grand_total, 0);
  }, [invoices, today]);

  const outstandingCredit = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + (inv.grand_total - (inv.amount_paid || 0)), 0);
  }, [invoices]);

  const lowStockCount = useMemo(() => {
    return items.filter(item => item.box_count <= (item.low_stock_threshold || 10)).length;
  }, [items]);

  const recentInvoices = useMemo(() => {
    return invoices.slice(0, 5);
  }, [invoices]);

  const stats = [
    { label: t('dashboard.todaySales'), value: formatCurrency(todaySales), icon: TrendingUp, color: c.success },
    { label: t('dashboard.outstandingCredit'), value: formatCurrency(outstandingCredit), icon: Users, color: c.warning },
    { label: t('dashboard.lowStock'), value: `${lowStockCount} items`, icon: AlertTriangle, color: c.error },
  ];

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchInvoices(1),
        fetchItems(true),
        fetchCustomers(true),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchInvoices, fetchItems, fetchCustomers]);

  return (
    <Screen
      scrollable
      safeAreaEdges={[]}
      scrollViewProps={{
        refreshControl: <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />
      }}
      contentContainerStyle={{ paddingBottom: s.xl }}
    >
      <DashboardHeader businessName="TileMaster" />

      {/* Stats Cards */}
      <View style={[theme.layout.row, { paddingHorizontal: s.md, marginTop: -s.lg }]}>
        {stats.map((stat, i) => (
          <StatCard
            key={i}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            style={{ flex: 1, marginHorizontal: s.xs }}
          />
        ))}
      </View>

      <QuickActionsGrid actions={quickActions as any} />

      <RecentInvoicesList invoices={recentInvoices as any} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
