import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/hooks/useLocale';
import { orderService, Order } from '@/src/services/orderService';
import type { InventoryItem } from '@/src/types/inventory';
import { Package, FileText, CheckCircle2 } from 'lucide-react-native';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { formatDateShort } = useLocale();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const c = theme.colors;
  const s = theme.spacing;
  const r = theme.borderRadius;

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const orderData = await orderService.fetchOrderById(id);
        const itemsData = await orderService.fetchItemsByOrderId(id);
        setOrder(orderData);
        setItems(itemsData as any);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading || !order) {
    return (
      <View style={[styles.container, { backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView>
        <View style={styles.headerArea}>
          <Package size={48} color={c.primary} style={{ marginBottom: s.md }} />
          <Text style={{ color: c.onBackground, fontSize: 24, fontWeight: '700', textAlign: 'center' }}>
            {order.party_name || 'Import Name Unknown'}
          </Text>
          <Text style={{ color: c.onSurfaceVariant, fontSize: 14, marginTop: s.xs, textAlign: 'center' }}>
            Imported on {formatDateShort(order.created_at)}
          </Text>
        </View>

        <View style={{ padding: s.lg }}>
          <View style={[styles.section, { backgroundColor: c.surface, borderRadius: r.md, borderColor: c.border }]}>
            <Text style={{ color: c.onSurface, fontSize: 18, fontWeight: '700', marginBottom: s.md }}>
              Summary
            </Text>
            
            <View style={styles.row}>
              <Text style={{ color: c.placeholder, flex: 1 }}>Total Box Quantity</Text>
              <Text style={{ color: c.onSurface, fontWeight: '600' }}>{order.total_quantity} boxes</Text>
            </View>
            <View style={styles.row}>
              <Text style={{ color: c.placeholder, flex: 1 }}>Status</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={16} color={c.success} />
                <Text style={{ color: c.success, fontWeight: '600' }}>Successfully Restocked</Text>
              </View>
            </View>
          </View>

          <Text style={{ color: c.onBackground, fontSize: 16, fontWeight: '600', marginTop: s.lg, marginBottom: s.md }}>
            Items Processed ({items.length})
          </Text>

          {items.map((item, index) => (
            <View key={item.id || index} style={[styles.itemCard, { backgroundColor: c.surface, borderRadius: r.md, borderColor: c.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.onSurface, fontSize: 16, fontWeight: '700' }}>
                  {item.design_name}
                </Text>
                <Text style={{ color: c.onSurfaceVariant, fontSize: 13, marginTop: 4 }}>
                  {item.category} {item.size_name ? `• ${item.size_name}` : ''}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                <Text style={{ color: c.primary, fontSize: 18, fontWeight: '700' }}>
                  +{item.box_count}
                </Text>
                <Text style={{ color: c.onSurfaceVariant, fontSize: 12 }}>Stocked</Text>
              </View>
            </View>
          ))}
          
          {items.length === 0 && (
             <View style={{ padding: s.lg, alignItems: 'center' }}>
               <Text style={{ color: c.placeholder }}>No individual items were created.</Text>
             </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  section: {
    padding: 16,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  itemCard: {
    flexDirection: 'row',
    padding: 16,
    borderWidth: 1,
    marginBottom: 8,
  }
});
