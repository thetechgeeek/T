import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, ArrowDownRight, ArrowUpRight } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { inventoryService } from '@/src/services/inventoryService';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { TextInput } from '@/src/components/atoms/TextInput';
import { Button } from '@/src/components/atoms/Button';
import { Screen } from '@/src/components/atoms/Screen';
import type { UUID } from '@/src/types/common';
import type { StockOpType, InventoryItem } from '@/src/types/inventory';

const schema = z.object({
  quantity: z.string().min(1, 'Quantity is required'),
  reason: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function StockOpScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id, type } = useLocalSearchParams<{ id: UUID, type: StockOpType }>();
  
  const c = theme.colors;
  const s = theme.spacing;
  const r = theme.borderRadius;

  const { performStockOperation } = useInventoryStore();
  const [submitting, setSubmitting] = useState(false);
  const [item, setItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    if (id) {
      inventoryService.fetchItemById(id).then(setItem).catch(console.error);
    }
  }, [id]);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: '', reason: '' }
  });

  const isStockIn = type === 'stock_in';
  const Icon = isStockIn ? ArrowDownRight : ArrowUpRight;
  const color = isStockIn ? c.success : c.error;
  const title = isStockIn ? 'Stock In (Add)' : 'Stock Out (Remove)';

  const onSubmit = async (data: FormData) => {
    if (!id || !type) return;
    const qty = parseInt(data.quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert("Error", "Please enter a valid positive number.", [{ text: 'OK' }]);
      return;
    }

    setSubmitting(true);
    try {
      const change = isStockIn ? qty : -qty;
      await performStockOperation(id, type, change, data.reason || undefined);
      Alert.alert("Success", "Stock updated successfully!");
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update stock", [{ text: 'OK' }]);
    } finally {
      setSubmitting(false);
    }
  };

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: c.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  return (
    <Screen safeAreaEdges={['top', 'bottom']} withKeyboard>
        <View style={[styles.header, theme.layout.rowBetween, { borderBottomColor: c.border, paddingHorizontal: 20, paddingBottom: 16 }]}>
          <View style={theme.layout.row}>
            <View style={[styles.iconWrap, { backgroundColor: color + '20' }]}>
              <Icon size={22} color={color} strokeWidth={2.5} />
            </View>
            <ThemedText variant="h3" style={{ marginLeft: 12 }}>
              {title}
            </ThemedText>
          </View>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <X size={24} color={c.placeholder} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={{ padding: s.lg }}>
          <View style={[styles.infoBox, { backgroundColor: c.surfaceVariant, borderRadius: r.md, marginBottom: s.xl }]}>
            <ThemedText variant="caption" color={c.onSurfaceVariant}>Item</ThemedText>
            <ThemedText weight="bold" style={{ marginTop: 4 }}>{item.design_name}</ThemedText>
            <ThemedText variant="body2" style={{ marginTop: 4 }}>
              Current Stock: <ThemedText weight="bold">{item.box_count} Boxes</ThemedText>
            </ThemedText>
          </View>

          <Controller
            control={control}
            name="quantity"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Quantity (Boxes) *"
                placeholder="e.g. 50"
                keyboardType="number-pad"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.quantity?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="reason"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Reason / Note (Optional)"
                placeholder="e.g. Broken tiles, Return, Missing piece"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Button 
            title="Confirm" 
            onPress={handleSubmit(onSubmit)} 
            loading={submitting} 
            style={{ marginTop: s.lg }}
            leftIcon={<Save size={20} color={c.onPrimary} />}
          />
        </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: 1 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  infoBox: { padding: 16 },
});
