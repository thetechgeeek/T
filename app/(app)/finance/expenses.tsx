import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Modal, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Plus, X } from 'lucide-react-native';
import { useFinanceStore } from '@/src/stores/financeStore';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/hooks/useLocale';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Card } from '@/src/components/atoms/Card';
import { Button } from '@/src/components/atoms/Button';
import { Screen } from '@/src/components/atoms/Screen';
import { TextInput } from '@/src/components/atoms/TextInput';
import { FormField } from '@/src/components/molecules/FormField';
import { EmptyState } from '@/src/components/molecules/EmptyState';
import { format } from 'date-fns';

export default function ExpensesScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { formatCurrency, formatDate } = useLocale();
  const { expenses, loading, fetchExpenses, addExpense } = useFinanceStore();
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchExpenses().catch(e => {
      Alert.alert('Error', 'Failed to load expenses. ' + e.message, [{ text: 'OK' }]);
    });
  }, []);

  const handleSave = async () => {
    if (!amount || !category) return;
    setSaving(true);
    try {
      await addExpense({
        amount: parseFloat(amount),
        category,
        notes,
        expense_date: format(new Date(), 'yyyy-MM-dd'),
      });
      setModalVisible(false);
      setAmount('');
      setCategory('');
      setNotes('');
    } catch (e: any) {
      console.error(e);
      Alert.alert(
        'Error Saving Expense',
        e.message || 'An unexpected error occurred. Please ensure your database is set up correctly.',
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen safeAreaEdges={['top', 'bottom']} withKeyboard={false}>
      <Stack.Screen options={{ title: 'Expenses' }} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetchExpenses()} />}
      >
        {expenses.length === 0 && !loading ? (
          <EmptyState
            title="No expenses found"
            actionLabel="Add Expense"
            onAction={() => setModalVisible(true)}
          />
        ) : (
          expenses.map((exp) => (
            <Card key={exp.id} style={styles.expenseCard} padding="md">
              <View style={theme.layout.rowBetween}>
                <View style={{ flex: 1 }}>
                  <ThemedText weight="bold">
                    {exp.category}
                  </ThemedText>
                  <ThemedText variant="caption" color={theme.colors.onSurfaceVariant}>
                    {formatDate(exp.expense_date)}
                  </ThemedText>
                  {exp.notes && (
                    <ThemedText variant="caption" color={theme.colors.onSurfaceVariant} style={{ fontStyle: 'italic', marginTop: 2 }}>
                      {exp.notes}
                    </ThemedText>
                  )}
                </View>
                <ThemedText weight="bold" color={theme.colors.error}>
                  - {formatCurrency(exp.amount)}
                </ThemedText>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

       <View style={[styles.fabContainer, { bottom: 32 + insets.bottom }]}>
        <Button
          title="Add Expense"
          onPress={() => setModalVisible(true)}
          leftIcon={<Plus color="white" size={24} />}
          style={styles.fab}
        />
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ width: '100%' }}
          >
            <View style={[styles.modalContent, { backgroundColor: theme.colors.background, paddingBottom: 20 + insets.bottom }]}>
              <View style={[theme.layout.rowBetween, { marginBottom: 20 }]}>
                <ThemedText variant="h2">
                  New Expense
                </ThemedText>
                <Button variant="ghost" size="sm" onPress={() => setModalVisible(false)} leftIcon={<X size={24} color={theme.colors.onSurface} />} />
              </View>

              <FormField
                label="Amount (₹)"
                required
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
              />

              <FormField
                label="Category"
                required
                value={category}
                onChangeText={setCategory}
                placeholder="e.g. Electricity, Rent, Salary"
              />

              <FormField
                label="Notes"
                value={notes}
                onChangeText={setNotes}
                placeholder="Optional description"
                multiline
                numberOfLines={2}
              />

              <Button
                title={saving ? 'Saving...' : 'Save Expense'}
                onPress={handleSave}
                loading={saving}
                style={{ marginTop: 16 }}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  expenseCard: { marginBottom: 12 },
  fabContainer: { position: 'absolute', bottom: 32, left: 16, right: 16 },
  fab: { elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
});
