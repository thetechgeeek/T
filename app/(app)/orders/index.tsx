import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, ChevronRight, FileText } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/hooks/useLocale';
import { useOrderStore } from '@/src/stores/orderStore';
import { Button } from '@/src/components/atoms/Button';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';

export default function OrdersListScreen() {
  const { theme } = useTheme();
  const { formatDateShort } = useLocale();
  const router = useRouter();
  
  const c = theme.colors;
  const s = theme.spacing;
  const r = theme.borderRadius;

  const { orders, loading, fetchOrders } = useOrderStore();

  React.useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <Screen safeAreaEdges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <ThemedText variant="h2">Purchase Orders</ThemedText>
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
          <ThemedText variant="h3" style={{ marginBottom: 8 }}>No Orders Yet</ThemedText>
          <ThemedText color={c.placeholder} align="center" style={{ marginBottom: s.xl }}>
            Import a supplier performa invoice (PDF or Image) to automatically extract items and restock inventory using AI.
          </ThemedText>
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
                <ThemedText weight="bold" style={{ fontSize: 16 }}>
                  {item.party_name || 'Unknown Supplier'}
                </ThemedText>
                <ThemedText variant="caption" color={c.onSurfaceVariant} style={{ marginTop: 4 }}>
                  {formatDateShort(item.created_at)} • {item.total_quantity} items imported
                </ThemedText>
              </View>
              <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                <View style={[styles.badge, { backgroundColor: c.success + '15' }]}>
                  <ThemedText color={c.success} weight="semibold" style={{ fontSize: 12 }}>Imported</ThemedText>
                </View>
                <ChevronRight size={20} color={c.placeholder} style={{ marginTop: 8 }} />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
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
