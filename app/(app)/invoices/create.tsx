import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Button } from '@/src/components/ui/Button';
import { useLocale } from '@/src/hooks/useLocale';
import type { Customer } from '@/src/types/customer';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import type { InvoiceLineItemInput } from '@/src/types/invoice';

import { useInventoryStore } from '@/src/stores/inventoryStore';

import { calculateInvoiceTotals } from '@/src/utils/gstCalculator';

export default function CreateInvoiceScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLocale();
  const c = theme.colors;
  const s = theme.spacing;

  // Load inventory for step 2
  React.useEffect(() => {
    useInventoryStore.getState().fetchItems();
  }, []);

  const { items, loading: inventoryLoading, setFilters } = useInventoryStore();

  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [lineItems, setLineItems] = useState<InvoiceLineItemInput[]>([]);
  
  // Payment state for Step 3
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMode, setPaymentMode] = useState<any>('cash');
  
  // Add Item Modal state
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [inputQuantity, setInputQuantity] = useState('1');
  const [inputDiscount, setInputDiscount] = useState('0');

  const [isInterState, setIsInterState] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Debounced search for inventory
  React.useEffect(() => {
    if (!isAddingItem) return;
    const timer = setTimeout(() => {
      setFilters({ search: searchQuery });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, isAddingItem]);

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  // Compute grand total for Step 3
  const invoiceTotals = calculateInvoiceTotals(lineItems, isInterState);
  const grandTotal = invoiceTotals.grand_total;

  const submitInvoice = async () => {
    if (!customer || lineItems.length === 0) return;
    setSubmitting(true);
    try {
      const newInvoice = await useInvoiceStore.getState().createInvoice({
        customer_id: customer.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: customer.address,
        customer_gstin: customer.gstin,
        is_inter_state: isInterState,
        line_items: lineItems,
        invoice_date: new Date().toISOString().split('T')[0],
        payment_status: parseFloat(amountPaid) >= grandTotal ? 'paid' : parseFloat(amountPaid) > 0 ? 'partial' : 'unpaid',
        payment_mode: parseFloat(amountPaid) > 0 ? paymentMode : undefined,
        amount_paid: parseFloat(amountPaid) || 0,
      });
      router.replace(`/(app)/invoices/${newInvoice.id}`);
    } catch (e: any) {
      console.error('Failed to create invoice', e);
      Alert.alert(
        'Error Creating Invoice',
        e.message || 'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <View style={[styles.stepperMenu, { borderBottomColor: c.border }]}>
          <Text style={{ color: step === 1 ? c.primary : c.onSurfaceVariant, fontWeight: 'bold' }}>1. Customer</Text>
          <Text style={{ color: step === 2 ? c.primary : c.onSurfaceVariant, fontWeight: 'bold' }}>2. Items</Text>
          <Text style={{ color: step === 3 ? c.primary : c.onSurfaceVariant, fontWeight: 'bold' }}>3. Review</Text>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: s.lg }}>
          {step === 1 && (
            <View>
              <Text style={{ color: c.onBackground, fontSize: 18, marginBottom: s.md, fontWeight: '700' }}>Customer Details</Text>
              
              <Text style={{ color: c.onSurfaceVariant, marginBottom: 4 }}>Name *</Text>
              <TextInput
                style={[styles.input, { borderColor: c.border, color: c.onSurface, backgroundColor: c.surface }]}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor={c.placeholder}
                value={customer?.name || ''}
                onChangeText={(text) => setCustomer(prev => ({ ...prev, id: prev?.id, name: text } as any))}
              />

              <Text style={{ color: c.onSurfaceVariant, marginBottom: 4, marginTop: s.sm }}>Phone</Text>
              <TextInput
                style={[styles.input, { borderColor: c.border, color: c.onSurface, backgroundColor: c.surface }]}
                placeholder="10-digit mobile number"
                keyboardType="phone-pad"
                placeholderTextColor={c.placeholder}
                value={customer?.phone || ''}
                onChangeText={(text) => setCustomer(prev => ({ ...prev, id: prev?.id, name: prev?.name || '', phone: text } as any))}
              />

              <Text style={{ color: c.onSurfaceVariant, marginBottom: 4, marginTop: s.sm }}>GSTIN (Optional)</Text>
              <TextInput
                style={[styles.input, { borderColor: c.border, color: c.onSurface, backgroundColor: c.surface }]}
                placeholder="22AAAAA0000A1Z5"
                autoCapitalize="characters"
                placeholderTextColor={c.placeholder}
                value={customer?.gstin || ''}
                onChangeText={(text) => setCustomer(prev => ({ ...prev, id: prev?.id, name: prev?.name || '', gstin: text } as any))}
              />

              <TouchableOpacity 
                onPress={() => setIsInterState(!isInterState)}
                style={{ marginTop: s.lg, padding: s.md, backgroundColor: isInterState ? c.primary + '20' : c.surface, borderWidth: 1, borderColor: isInterState ? c.primary : c.border, borderRadius: theme.borderRadius.md }}
              >
                <Text style={{ color: c.onSurface, fontWeight: isInterState ? 'bold' : 'normal' }}>
                  Inter-State (IGST): {isInterState ? 'Yes' : 'No'}
                </Text>
                <Text style={{ color: c.onSurfaceVariant, fontSize: 12, marginTop: 4 }}>
                  Toggle this if the customer is located in a different state.
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: s.md }}>
                <Text style={{ color: c.onBackground, fontSize: 18, fontWeight: '700' }}>Line Items</Text>
                <Button title="+ Add Item" onPress={() => setIsAddingItem(true)} size="sm" />
              </View>

              {lineItems.length === 0 ? (
                <View style={{ padding: s.xl, alignItems: 'center', backgroundColor: c.surface, borderRadius: theme.borderRadius.md }}>
                  <Text style={{ color: c.placeholder, textAlign: 'center' }}>No items added yet.</Text>
                </View>
              ) : (
                lineItems.map((item, index) => (
                  <View key={index} style={{ padding: s.md, marginBottom: s.sm, backgroundColor: c.surface, borderRadius: theme.borderRadius.sm, borderWidth: 1, borderColor: c.border }}>
                    <Text style={{ color: c.onSurface, fontWeight: '600' }}>{item.design_name}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                      <Text style={{ color: c.onSurfaceVariant }}>{item.quantity} units @ ₹{item.rate_per_unit.toFixed(2)}</Text>
                      <Text style={{ color: c.primary, fontWeight: '700' }}>₹{(item.quantity * item.rate_per_unit).toFixed(2)}</Text>
                    </View>
                    {!!item.discount && item.discount > 0 && (
                       <Text style={{ color: c.error, fontSize: 12 }}>Discount: ₹{item.discount.toFixed(2)}</Text>
                    )}
                    <TouchableOpacity onPress={() => {
                      const newItems = [...lineItems];
                      newItems.splice(index, 1);
                      setLineItems(newItems);
                    }} style={{ alignSelf: 'flex-end', marginTop: 8 }}>
                      <Text style={{ color: c.error }}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}

              {isAddingItem && (
                <View style={{ marginTop: s.xl, padding: s.lg, backgroundColor: c.surfaceVariant + '40', borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: c.border }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: s.xs }}>
                    <Text style={{ color: c.onSurface, fontWeight: 'bold' }}>Select from Inventory</Text>
                    {inventoryLoading && <ActivityIndicator size="small" color={c.primary} />}
                  </View>
                  
                  {!selectedItem ? (
                    <>
                      <TextInput 
                        style={[styles.input, { borderColor: c.border, color: c.onSurface, backgroundColor: c.surface, marginBottom: s.sm }]}
                        placeholder="Search design name..."
                        placeholderTextColor={c.placeholder}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                      />
                      <ScrollView style={{ maxHeight: 200 }}>
                        {items.length === 0 && !inventoryLoading ? (
                          <Text style={{ color: c.placeholder, padding: s.md, textAlign: 'center' }}>No items found.</Text>
                        ) : (
                          items.map(item => (
                            <TouchableOpacity 
                              key={item.id} 
                              style={{ padding: s.sm, borderBottomWidth: 1, borderBottomColor: c.border }}
                              onPress={() => { setSelectedItem(item); setInputQuantity('1'); setInputDiscount('0'); }}
                            >
                              <Text style={{ color: c.onSurface }}>{item.design_name}</Text>
                              <Text style={{ color: c.onSurfaceVariant, fontSize: 12 }}>Stock: {item.box_count} • Price: ₹{item.selling_price}</Text>
                            </TouchableOpacity>
                          ))
                        )}
                      </ScrollView>
                      <Button title="Close" onPress={() => setIsAddingItem(false)} variant="outline" style={{ marginTop: s.md }} />
                    </>
                  ) : (
                    <View>
                      <Text style={{ color: c.onSurface, fontWeight: 'bold', fontSize: 16 }}>{selectedItem.design_name}</Text>
                      <Text style={{ color: c.onSurfaceVariant, marginBottom: s.md }}>Available: {selectedItem.box_count} units</Text>
                      
                      <Text style={{ color: c.onSurfaceVariant, marginBottom: 4 }}>Quantity</Text>
                      <TextInput 
                        style={[styles.input, { borderColor: c.border, color: c.onSurface, backgroundColor: c.surface, marginBottom: s.sm }]}
                        value={inputQuantity}
                        placeholder="Enter quantity"
                        keyboardType="numeric"
                        onChangeText={setInputQuantity}
                      />

                      <Text style={{ color: c.onSurfaceVariant, marginBottom: 4 }}>Discount (₹ total)</Text>
                      <TextInput 
                        style={[styles.input, { borderColor: c.border, color: c.onSurface, backgroundColor: c.surface, marginBottom: s.sm }]}
                        value={inputDiscount}
                        placeholder="Enter discount amount"
                        keyboardType="numeric"
                        onChangeText={setInputDiscount}
                      />

                      <View style={{ flexDirection: 'row', gap: s.sm, marginTop: s.md }}>
                        <Button title="Cancel" onPress={() => setSelectedItem(null)} variant="outline" style={{ flex: 1 }} />
                        <Button title="Confirm" onPress={() => {
                          setLineItems([...lineItems, {
                            item_id: selectedItem.id,
                            design_name: selectedItem.design_name,
                            quantity: parseInt(inputQuantity) || 1,
                            rate_per_unit: selectedItem.selling_price || 0,
                            discount: parseFloat(inputDiscount) || 0,
                            gst_rate: 18, // Default
                            tile_image_url: selectedItem.image_url,
                          }]);
                          setSelectedItem(null);
                          setIsAddingItem(false);
                        }} style={{ flex: 1 }} />
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={{ color: c.onBackground, fontSize: 18, marginBottom: s.md, fontWeight: '700' }}>Review & Payment</Text>
              
              <View style={{ padding: s.md, backgroundColor: c.surface, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: c.border, marginBottom: s.lg }}>
                <Text style={{ color: c.onSurface, fontWeight: '600', fontSize: 16 }}>Customer: {customer?.name}</Text>
                <Text style={{ color: c.onSurfaceVariant }}>{customer?.phone || 'No phone provided'}</Text>
                
                <View style={{ marginTop: s.md }}>
                  {lineItems.map((item, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                      <Text style={{ color: c.onSurface }}>{item.quantity}x {item.design_name}</Text>
                      <Text style={{ color: c.onSurface }}>₹{(item.quantity * item.rate_per_unit).toFixed(2)}</Text>
                    </View>
                  ))}
                </View>
                
                <View style={{ height: 1, backgroundColor: c.border, marginVertical: s.md }} />
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: c.onSurface, fontWeight: '700', fontSize: 16 }}>Grand Total (inc. GST)</Text>
                  <Text style={{ color: c.primary, fontWeight: '700', fontSize: 16 }}>₹{grandTotal.toFixed(2)}</Text>
                </View>
              </View>

              <Text style={{ color: c.onBackground, fontSize: 16, marginBottom: s.sm, fontWeight: '600' }}>Payment Collection</Text>
              
              <Text style={{ color: c.onSurfaceVariant, marginBottom: 4 }}>Amount Paid (₹)</Text>
              <TextInput 
                 style={[styles.input, { borderColor: c.border, color: c.onSurface, backgroundColor: c.surface, marginBottom: s.sm }]}
                 value={amountPaid}
                 placeholder="Enter amount paid"
                 placeholderTextColor={c.placeholder}
                 keyboardType="numeric"
                 onChangeText={setAmountPaid}
              />

              <Text style={{ color: c.onSurfaceVariant, marginBottom: 4 }}>Payment Mode</Text>
              <View style={{ flexDirection: 'row', gap: s.sm, marginBottom: s.xl }}>
                {['cash', 'upi', 'bank_transfer', 'cheque'].map(mode => (
                  <TouchableOpacity 
                    key={mode}
                    onPress={() => setPaymentMode(mode)}
                    style={{ padding: s.sm, backgroundColor: paymentMode === mode ? c.primary : c.surface, borderRadius: theme.borderRadius.sm, borderWidth: 1, borderColor: paymentMode === mode ? c.primary : c.border }}
                  >
                    <Text style={{ color: paymentMode === mode ? '#FFF' : c.onSurface, textTransform: 'capitalize' }}>{mode.replace('_', ' ')}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ padding: s.md, backgroundColor: parseFloat(amountPaid) >= grandTotal ? c.success + '20' : c.warning + '20', borderRadius: theme.borderRadius.md }}>
                 <Text style={{ color: parseFloat(amountPaid) >= grandTotal ? c.success : c.warning, fontWeight: '600' }}>
                   Balance Due: ₹{Math.max(0, grandTotal - (parseFloat(amountPaid) || 0)).toFixed(2)}
                 </Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: c.border, backgroundColor: c.surface }]}>
          <Button 
            title="Back" 
            variant="ghost"
            onPress={handleBack}
            disabled={step === 1 || submitting}
            style={{ flex: 1, marginRight: s.xs }} 
          />
          {step < 3 ? (
            <Button 
              title="Next" 
              onPress={handleNext}
              disabled={step === 1 && !customer || step === 2 && lineItems.length === 0}
              style={{ flex: 1, marginLeft: s.xs }} 
            />
          ) : (
            <Button 
              title={submitting ? "Generating..." : "Generate Invoice"} 
              onPress={submitInvoice}
              loading={submitting}
              style={{ flex: 1, marginLeft: s.xs }} 
            />
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  stepperMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderBottomWidth: 1,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
  }
});
