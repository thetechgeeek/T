import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Package, Edit, Clock, HelpCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/hooks/useLocale';
import { inventoryService } from '@/src/services/inventoryService';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import type { InventoryItem, StockOperation } from '@/src/types/inventory';
import type { UUID } from '@/src/types/common';

export default function ItemDetailScreen() {
  const { theme } = useTheme();
  const { t, formatCurrency, formatDateShort } = useLocale();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: UUID }>();
  
  const c = theme.colors;
  const s = theme.spacing;
  const r = theme.borderRadius;

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [history, setHistory] = useState<StockOperation[]>([]);
  const [loading, setLoading] = useState(true);

  // Instead of only using local store, fetch fresh so we always have latest
  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    const fetchAll = async () => {
      try {
        const [itemData, historyData] = await Promise.all([
          inventoryService.fetchItemById(id),
          inventoryService.fetchStockHistory(id)
        ]);
        if (isMounted) {
          setItem(itemData);
          setHistory(historyData);
        }
      } catch (err) {
        console.error("Failed to load item detail", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAll();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border, borderBottomWidth: 1, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <ArrowLeft size={22} color={c.primary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <HelpCircle size={48} color={c.placeholder} strokeWidth={1} />
          <Text style={{ color: c.onSurface, marginTop: 16 }}>Item not found</Text>
        </View>
      </View>
    );
  }

  const isLowStock = item.box_count <= item.low_stock_threshold;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border, borderBottomWidth: 1, paddingTop: 56, paddingHorizontal: s.lg, paddingBottom: s.md }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <ArrowLeft size={24} color={c.onBackground} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={[{ color: c.onBackground, fontSize: 20, fontWeight: '700', marginLeft: s.md, flex: 1 }]} numberOfLines={1}>
            {item.design_name}
          </Text>
        </View>
        <TouchableOpacity style={{ padding: 4 }} onPress={() => router.push(`/(app)/inventory/add?id=${item.id}`)}>
          <Edit size={22} color={c.primary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: s.lg }}>
        {/* Image Card */}
        <View style={[styles.imageCard, { backgroundColor: c.surface, borderRadius: r.lg, ...theme.shadows.sm as object }]}>
          {item.tile_image_url ? (
            <Image source={{ uri: item.tile_image_url }} style={{ width: '100%', aspectRatio: 1, borderRadius: r.lg }} contentFit="cover" />
          ) : (
            <View style={{ width: '100%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceVariant, borderRadius: r.lg }}>
              <Package size={64} color={c.placeholder} strokeWidth={1} />
            </View>
          )}
        </View>

        {/* Specs Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: s.lg, marginHorizontal: -6 }}>
          <SpecBox label="Base Item" value={item.base_item_number} />
          <SpecBox label="Category" value={item.category} />
          <SpecBox label="Size" value={item.size_name || 'N/A'} />
          <SpecBox label="Grade" value={item.grade || 'N/A'} />
          <SpecBox label="Pcs / Box" value={item.pcs_per_box?.toString() || 'N/A'} />
          <SpecBox label="Sqft / Box" value={item.sqft_per_box?.toString() || 'N/A'} />
          <SpecBox label="Selling Price" value={formatCurrency(item.selling_price)} highlight />
          {/* <SpecBox label="Cost Price" value={formatCurrency(item.cost_price)} /> */}
        </View>

        {/* Stock Status */}
        <View style={[styles.stockBox, { backgroundColor: isLowStock ? c.errorLight : c.success + '15', borderRadius: r.md, marginTop: s.xl, borderColor: isLowStock ? c.error : c.success, borderWidth: 1 }]}>
          <Text style={{ color: isLowStock ? c.error : c.success, fontSize: theme.typography.sizes.lg, fontWeight: '700' }}>
            {item.box_count} Boxes in Stock
          </Text>
          <Text style={{ color: c.onSurfaceVariant, fontSize: theme.typography.sizes.sm, marginTop: 2 }}>
            Threshold: {item.low_stock_threshold} boxes
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={{ flexDirection: 'row', marginTop: s.md, gap: s.md }}>
          <TouchableOpacity 
            style={[styles.actionBtn, { flex: 1, backgroundColor: c.surfaceVariant, borderRadius: r.md }]}
            onPress={() => router.push(`/(app)/inventory/stock-op?id=${item.id}&type=stock_in`)}>
            <ArrowDownRight size={20} color={c.success} strokeWidth={2.5} />
            <Text style={{ color: c.onSurface, fontWeight: '600', marginLeft: 8 }}>Stock In</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, { flex: 1, backgroundColor: c.surfaceVariant, borderRadius: r.md }]}
            onPress={() => router.push(`/(app)/inventory/stock-op?id=${item.id}&type=stock_out`)}>
            <ArrowUpRight size={20} color={c.error} strokeWidth={2.5} />
            <Text style={{ color: c.onSurface, fontWeight: '600', marginLeft: 8 }}>Stock Out</Text>
          </TouchableOpacity>
        </View>

        {/* Stock History */}
        <View style={{ marginTop: s.xl }}>
          <Text style={{ color: c.onBackground, fontSize: 18, fontWeight: '700', marginBottom: s.md }}>
            Recent Operations
          </Text>
          {history.length === 0 ? (
            <Text style={{ color: c.placeholder }}>No stock operations recorded yet.</Text>
          ) : (
            history.map((op, index) => (
              <View key={op.id} style={[styles.historyRow, { borderBottomColor: c.border, borderBottomWidth: index === history.length - 1 ? 0 : StyleSheet.hairlineWidth }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.onSurface, fontWeight: '600', textTransform: 'capitalize' }}>
                    {op.operation_type.replace('_', ' ')}
                  </Text>
                  <Text style={{ color: c.onSurfaceVariant, fontSize: 12, marginTop: 2 }}>
                    {formatDateShort(op.created_at)}
                    {op.reason ? ` • ${op.reason}` : ''}
                  </Text>
                </View>
                <Text style={{ color: op.quantity_change > 0 ? c.success : c.error, fontWeight: '700' }}>
                  {op.quantity_change > 0 ? '+' : ''}{op.quantity_change}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );

  function SpecBox({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
    return (
      <View style={{ width: '50%', padding: 6 }}>
        <View style={{ backgroundColor: highlight ? c.primary + '10' : c.surfaceVariant, padding: 12, borderRadius: r.md }}>
          <Text style={{ color: c.onSurfaceVariant, fontSize: 12, marginBottom: 4 }}>{label}</Text>
          <Text style={{ color: highlight ? c.primary : c.onSurface, fontWeight: '600', fontSize: 15 }} numberOfLines={1}>{value}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imageCard: { padding: 4 },
  stockBox: { padding: 16, alignItems: 'center' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
});
