import React, { useEffect } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  RefreshControl, useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  FileText, Package, QrCode, CreditCard,
  TrendingUp, AlertTriangle, Users,
} from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/hooks/useLocale';
import { useAuthStore } from '@/src/stores/authStore';

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { t, formatCurrency } = useLocale();
  const { user } = useAuthStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);
  const { width } = useWindowDimensions();

  const c = theme.colors;
  const s = theme.spacing;
  const r = theme.borderRadius;
  const typo = theme.typography;

  const quickActions = [
    { label: t('dashboard.newInvoice'), icon: FileText, route: '/(app)/invoices/create', color: c.primary },
    { label: t('dashboard.scanItem'), icon: QrCode, route: '/(app)/(tabs)/scan', color: c.info },
    { label: t('dashboard.addStock'), icon: Package, route: '/(app)/inventory/stock-op', color: c.success },
    { label: t('dashboard.recordPayment'), icon: CreditCard, route: '/(app)/finance/payments', color: c.warning },
  ];

  const stats = [
    { label: t('dashboard.todaySales'), value: formatCurrency(0), icon: TrendingUp, color: c.success },
    { label: t('dashboard.outstandingCredit'), value: formatCurrency(0), icon: Users, color: c.warning },
    { label: t('dashboard.lowStock'), value: '0 items', icon: AlertTriangle, color: c.error },
  ];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={{ paddingBottom: s.xl }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.primary, paddingTop: 60, paddingHorizontal: s.lg, paddingBottom: s.xl }]}>
        <Text style={[styles.greeting, { color: c.onPrimary, fontSize: typo.sizes.lg, opacity: 0.9 }]}>
          {t('dashboard.greeting')} 🙏
        </Text>
        <Text style={[styles.businessName, { color: c.onPrimary, fontSize: typo.sizes['2xl'], fontWeight: typo.weights.bold }]}>
          TileMaster
        </Text>
        <Text style={[{ color: c.onPrimary, fontSize: typo.sizes.sm, opacity: 0.8, marginTop: 2 }]}>
          {new Date().toLocaleDateString('hi-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={[styles.statsRow, { paddingHorizontal: s.md, marginTop: -s.lg }]}>
        {stats.map((stat, i) => (
          <View key={i} style={[styles.statCard, {
            flex: 1, backgroundColor: c.card, borderRadius: r.md,
            marginHorizontal: 4, padding: s.md,
            ...(theme.shadows.md as object),
          }]}>
            <stat.icon size={20} color={stat.color} strokeWidth={2} />
            <Text style={[styles.statValue, { color: c.onSurface, fontSize: typo.sizes.lg, fontWeight: typo.weights.bold, marginTop: 6 }]}>
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, { color: c.onSurfaceVariant, fontSize: typo.sizes.xs }]}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={[styles.section, { paddingHorizontal: s.lg, marginTop: s.lg }]}>
        <Text style={[styles.sectionTitle, { color: c.onBackground, fontSize: typo.sizes.md, fontWeight: typo.weights.semibold, marginBottom: s.md }]}>
          {t('dashboard.quickActions')}
        </Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.actionBtn, {
                backgroundColor: c.card,
                borderRadius: r.lg,
                width: (width - s.lg * 2 - 8 * 3) / 2,
                padding: s.md,
                ...(theme.shadows.sm as object),
              }]}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color + '20', borderRadius: r.md, padding: s.sm }]}>
                <action.icon size={24} color={action.color} strokeWidth={2} />
              </View>
              <Text style={[styles.actionLabel, { color: c.onSurface, fontSize: typo.sizes.sm, fontWeight: typo.weights.medium, marginTop: s.sm }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Invoices Placeholder */}
      <View style={[styles.section, { paddingHorizontal: s.lg, marginTop: s.lg }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: c.onBackground, fontSize: typo.sizes.md, fontWeight: typo.weights.semibold }]}>
            {t('dashboard.recentInvoices')}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/invoices')}>
            <Text style={[{ color: c.primary, fontSize: typo.sizes.sm }]}>{t('common.seeAll')}</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.emptyCard, { backgroundColor: c.surfaceVariant, borderRadius: r.md, padding: s.xl }]}>
          <FileText size={32} color={c.placeholder} strokeWidth={1.5} />
          <Text style={[{ color: c.placeholder, fontSize: typo.sizes.sm, marginTop: s.sm, textAlign: 'center' }]}>
            {t('invoice.noInvoices')}{'\n'}{t('invoice.createFirst')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {},
  greeting: {},
  businessName: {},
  statsRow: { flexDirection: 'row' },
  statCard: {},
  statValue: {},
  statLabel: {},
  section: {},
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: {},
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionBtn: {},
  actionIcon: {},
  actionLabel: {},
  emptyCard: { alignItems: 'center' },
});
