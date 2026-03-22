import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { pdfService } from '@/src/services/pdfService';
import { Button } from '@/src/components/ui/Button';
import { useLocale } from '@/src/hooks/useLocale';
import { Share2, ArrowLeft } from 'lucide-react-native';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { formatCurrency } = useLocale();
  const c = theme.colors;
  const s = theme.spacing;

  const { currentInvoice, fetchInvoiceById, loading, error, clearCurrentInvoice } = useInvoiceStore();
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInvoiceById(id as string);
    }
    return () => clearCurrentInvoice();
  }, [id, fetchInvoiceById, clearCurrentInvoice]);

  const handleShare = async () => {
    if (!currentInvoice) return;
    setSharing(true);
    await pdfService.printAndShareInvoice(currentInvoice);
    setSharing(false);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (error || !currentInvoice) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={{ color: c.error }}>Failed to load invoice.</Text>
        <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: s.lg }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <ArrowLeft color={c.onBackground} size={24} onPress={() => router.back()} style={{ marginRight: s.md }} />
        <Text style={{ color: c.onBackground, fontSize: 20, fontWeight: '700', flex: 1 }}>{currentInvoice.invoice_number}</Text>
        <Button
          title="Share PDF"
          variant="outline"
          leftIcon={<Share2 size={20} color={c.primary} />}
          onPress={handleShare}
          loading={sharing}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: s.lg }}>
        <View style={{ marginBottom: s.xl }}>
          <Text style={{ color: c.onSurfaceVariant, fontSize: 14 }}>Billed To</Text>
          <Text style={{ color: c.onBackground, fontSize: 18, fontWeight: '700' }}>{currentInvoice.customer_name}</Text>
          <Text style={{ color: c.onSurface }}>{currentInvoice.customer_phone}</Text>
          {currentInvoice.customer_gstin && <Text style={{ color: c.onSurface }}>GSTIN: {currentInvoice.customer_gstin}</Text>}
        </View>

        <Text style={{ color: c.onBackground, fontSize: 16, fontWeight: '700', marginBottom: s.md }}>Items</Text>
        <View style={{ backgroundColor: c.surface, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }}>
          {currentInvoice.line_items?.map((item, index) => (
            <View key={item.id} style={{ padding: s.md, borderBottomWidth: index === currentInvoice.line_items!.length - 1 ? 0 : 1, borderBottomColor: c.border }}>
              <Text style={{ color: c.onSurface, fontWeight: '600' }}>{item.design_name}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ color: c.onSurfaceVariant }}>{item.quantity} units @ {formatCurrency(item.rate_per_unit)}</Text>
                <Text style={{ color: c.onSurface, fontWeight: '600' }}>{formatCurrency(item.line_total)}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ marginTop: s.xl, backgroundColor: c.surface, padding: s.md, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: c.border }}>
          <View style={styles.summaryRow}>
            <Text style={{ color: c.onSurfaceVariant }}>Subtotal</Text>
            <Text style={{ color: c.onSurface }}>{formatCurrency(currentInvoice.subtotal)}</Text>
          </View>
          {currentInvoice.is_inter_state ? (
            <View style={styles.summaryRow}>
              <Text style={{ color: c.onSurfaceVariant }}>IGST</Text>
              <Text style={{ color: c.onSurface }}>{formatCurrency(currentInvoice.igst_total)}</Text>
            </View>
          ) : (
            <>
              <View style={styles.summaryRow}>
                <Text style={{ color: c.onSurfaceVariant }}>CGST</Text>
                <Text style={{ color: c.onSurface }}>{formatCurrency(currentInvoice.cgst_total)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={{ color: c.onSurfaceVariant }}>SGST</Text>
                <Text style={{ color: c.onSurface }}>{formatCurrency(currentInvoice.sgst_total)}</Text>
              </View>
            </>
          )}
          
          <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: c.border, paddingTop: s.sm, marginTop: s.sm }]}>
            <Text style={{ color: c.onBackground, fontWeight: '700', fontSize: 16 }}>Grand Total</Text>
            <Text style={{ color: c.primary, fontWeight: '700', fontSize: 18 }}>{formatCurrency(currentInvoice.grand_total)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={{ color: c.onSurfaceVariant }}>Amount Paid</Text>
            <Text style={{ color: c.success, fontWeight: '600' }}>{formatCurrency(currentInvoice.amount_paid)}</Text>
          </View>

          {currentInvoice.grand_total - currentInvoice.amount_paid > 0 && (
            <View style={styles.summaryRow}>
              <Text style={{ color: c.error }}>Balance Due</Text>
              <Text style={{ color: c.error, fontWeight: '700' }}>{formatCurrency(currentInvoice.grand_total - currentInvoice.amount_paid)}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  }
});
