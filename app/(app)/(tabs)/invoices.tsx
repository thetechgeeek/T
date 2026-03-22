import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { Button } from '@/src/components/ui/Button';
import { useLocale } from '@/src/hooks/useLocale';
import { FileText, Plus, Search } from 'lucide-react-native';

export default function InvoicesListScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { formatCurrency } = useLocale();
  const c = theme.colors;
  const s = theme.spacing;

  const { invoices, fetchInvoices, loading, totalCount } = useInvoiceStore();

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <Text style={{ color: c.onBackground, fontSize: 24, fontWeight: '700' }}>Invoices</Text>
        <Button 
          title="New Invoice" 
          leftIcon={<Plus color="#FFF" size={20} />}
          onPress={() => router.push('/(app)/invoices/create')}
        />
      </View>

      <FlatList
        data={invoices}
        keyExtractor={item => item.id}
        refreshing={loading}
        onRefresh={() => fetchInvoices(1)}
        contentContainerStyle={{ padding: s.md }}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', marginTop: s['2xl'] }}>
            <FileText color={c.placeholder} size={64} />
            <Text style={{ color: c.onSurfaceVariant, marginTop: s.md, fontSize: 16 }}>No invoices found.</Text>
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
            style={[styles.invoiceCard, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={() => router.push(`/(app)/invoices/${item.id}`)}
          >
            <View style={styles.cardHeader}>
              <Text style={{ color: c.onSurface, fontWeight: '700', fontSize: 16 }}>{item.invoice_number}</Text>
              <Text style={{ color: c.onSurfaceVariant, fontSize: 14 }}>{new Date(item.invoice_date).toLocaleDateString()}</Text>
            </View>
            <Text style={{ color: c.onSurfaceVariant, marginBottom: s.sm }}>{item.customer_name}</Text>
            <View style={styles.cardFooter}>
              <View style={[styles.badge, { backgroundColor: item.payment_status === 'paid' ? c.success + '20' : c.warning + '20' }]}>
                 <Text style={{ color: item.payment_status === 'paid' ? c.success : c.warning, fontSize: 12, fontWeight: '600', textTransform: 'capitalize' }}>
                   {item.payment_status}
                 </Text>
              </View>
              <Text style={{ color: c.primary, fontWeight: '700', fontSize: 18 }}>
                {formatCurrency(item.grand_total)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  }
});
