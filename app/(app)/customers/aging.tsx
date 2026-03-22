import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { Stack } from 'expo-router';
import { useCustomerStore } from '@/src/stores/customerStore';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/hooks/useLocale';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { EmptyState } from '@/src/components/ui/EmptyState';

export default function AgingReportScreen() {
  const { theme } = useTheme();
  const { formatCurrency } = useLocale();
  const { customers, fetchCustomers, loading } = useCustomerStore();

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Simple aging logic: just group by balance for now as a placeholder for real date-based aging
  const agingData = customers
    .filter(c => (c.current_balance || 0) > 0)
    .sort((a, b) => (b.current_balance || 0) - (a.current_balance || 0));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: 'Aging Report' }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryCard}>
          <Card padding="lg" variant="elevated">
            <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>Total Outstanding</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.error, fontSize: 32, fontWeight: '800' }]}>
              {formatCurrency(agingData.reduce((acc, curr) => acc + (curr.current_balance || 0), 0))}
            </Text>
          </Card>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, fontWeight: '700' }]}>Customer Breakup</Text>

        {agingData.length === 0 ? (
          <EmptyState title="No outstanding balances" />
        ) : (
          agingData.map((c) => (
            <Card key={c.id} style={styles.customerCard} padding="md">
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: theme.colors.onSurface, fontWeight: '600' }]}>{c.name}</Text>
                  <Text style={[styles.type, { color: theme.colors.onSurfaceVariant }]}>{c.type.toUpperCase()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.balance, { color: theme.colors.error, fontWeight: '700' }]}>
                    {formatCurrency(c.current_balance || 0)}
                  </Text>
                  <Badge 
                    label="Overdue" 
                    variant="error" 
                    style={{ marginTop: 4 }}
                  />
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  summaryCard: { marginBottom: 24 },
  summaryLabel: { fontSize: 14, marginBottom: 4 },
  summaryValue: { marginBottom: 8 },
  sectionTitle: { fontSize: 18, marginBottom: 16 },
  customerCard: { marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16 },
  type: { fontSize: 12, marginTop: 2 },
  balance: { fontSize: 16 },
});
