import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { TrendingUp, TrendingDown, Wallet, Receipt, ShoppingCart, ChevronRight } from 'lucide-react-native';
import { useFinanceStore } from '@/src/stores/financeStore';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/hooks/useLocale';
import { Card } from '@/src/components/ui/Card';
import { StatCard } from '@/src/components/ui/StatCard';
import { ListItem } from '@/src/components/ui/ListItem';
import { Divider } from '@/src/components/ui/Divider';

export default function FinanceOverviewScreen() {
  const { theme } = useTheme();
  const { formatCurrency } = useLocale();
  const router = useRouter();
  const { summary, loading, fetchSummary } = useFinanceStore();

  useEffect(() => {
    fetchSummary();
  }, []);

  const metrics = [
    {
      title: 'Gross Profit',
      value: formatCurrency(summary?.gross_profit || 0),
      icon: <TrendingUp size={24} color={theme.colors.success} />,
      color: theme.colors.success,
    },
    {
      title: 'Net Profit',
      value: formatCurrency(summary?.net_profit || 0),
      icon: <Wallet size={24} color={theme.colors.primary} />,
      color: theme.colors.primary,
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(summary?.total_expenses || 0),
      icon: <TrendingDown size={24} color={theme.colors.error} />,
      color: theme.colors.error,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: 'Finance Overview' }} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchSummary} />}
      >
        <View style={styles.metricsGrid}>
          {metrics.map((m, i) => (
            <Card key={i} style={styles.metricCard} padding="md" variant="elevated">
              <View style={styles.metricHeader}>
                {m.icon}
                <Text style={[styles.metricTitle, { color: theme.colors.onSurfaceVariant }]}>{m.title}</Text>
              </View>
              <StatCard
                label=""
                value={m.value}
              />
            </Card>
          ))}
        </View>

        <Divider style={{ marginVertical: 24 }} />

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, fontFamily: theme.typography.fontFamilyBold }]}>
          Reports & Management
        </Text>
        
        <View style={styles.section}>
          <ListItem
            title="Expenses"
            subtitle="View and add business expenses"
            onPress={() => router.push('/(app)/finance/expenses')}
            leftIcon={<Receipt color={theme.colors.primary} />}
          />
          <ListItem
            title="Purchases"
            subtitle="Supplier bills and inventory procurement"
            onPress={() => router.push('/finance/purchases')}
            leftIcon={<ShoppingCart color={theme.colors.primary} size={24} />}
          />
          <ListItem
            title="Aging Report"
            subtitle="Outstanding balances from customers"
            onPress={() => router.push('/customers/aging')}
            leftIcon={<TrendingDown color={theme.colors.error} />}
          />
          <ListItem
            title="Profit & Loss"
            subtitle="Detailed financial performance"
            onPress={() => {}} // TODO
            leftIcon={<TrendingUp color={theme.colors.success} />}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  metricsGrid: {
    gap: 16,
  },
  metricCard: {
    marginBottom: 8,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricTitle: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    paddingLeft: 4,
  },
  section: {
    gap: 8,
  },
});
