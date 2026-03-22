import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Package, Plus, ChevronRight, FileText } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/hooks/useLocale';
import { useOrderStore } from '@/src/stores/orderStore';
import { Button } from '@/src/components/ui/Button';

export default function OrdersListScreen() {
  const { theme } = useTheme();
  const { formatDateShort } = useLocale();
  const router = useRouter();
  
  const c = theme.colors;
  const s = theme.spacing;
  const r = theme.borderRadius;

  const { orders, loading, fetchOrders } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Text style={{ color: c.onSurface, fontSize: 22, fontWeight: '700' }}>Purchase Orders</Text>
        <Button 
          title="Import PDF" 
          size="sm" 
          leftIcon={<Plus size={16} color={c.onPrimary} />}
          onPress={() => router.push('/(app)/orders/import')}
        />
      </View>

      {loading && orders.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: s.xl }}>
          <FileText size={64} color={c.placeholder} style={{ marginBottom: s.lg }} />
          <Text style={{ color: c.onBackground, fontSize: 18, fontWeight: '600', marginBottom: 8 }}>No Orders Yet</Text>
          <Text style={{ color: c.placeholder, textAlign: 'center', marginBottom: s.xl }}>
            Import a supplier performa invoice (PDF or Image) to automatically extract items and restock inventory using AI.
          </Text>
          <Button title="Import First Order" onPress={() => router.push('/(app)/orders/import')} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={o => o.id}
          contentContainerStyle={{ padding: s.md }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.card, { backgroundColor: c.surface, borderRadius: r.md, borderColor: c.border }]}
              onPress={() => router.push(`/(app)/orders/${item.id}`)}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.onSurface, fontSize: 16, fontWeight: '700' }}>
                  {item.party_name || 'Unknown Supplier'}
                </Text>
                <Text style={{ color: c.onSurfaceVariant, fontSize: 13, marginTop: 4 }}>
                  {formatDateShort(item.created_at)} • {item.total_quantity} items imported
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                <View style={[styles.badge, { backgroundColor: c.success + '15' }]}>
                  <Text style={{ color: c.success, fontSize: 12, fontWeight: '600' }}>Imported</Text>
                </View>
                <ChevronRight size={20} color={c.placeholder} style={{ marginTop: 8 }} />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  }
});
