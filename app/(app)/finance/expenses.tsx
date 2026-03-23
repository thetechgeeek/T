import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Modal, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Plus, X } from 'lucide-react-native';
import { useFinanceStore } from '@/src/stores/financeStore';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/hooks/useLocale';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { TextInput } from '@/src/components/ui/TextInput';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { format } from 'date-fns';

export default function ExpensesScreen() {
  const { theme } = useTheme();
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
              <View style={styles.expenseRow}>
                <View>
                  <Text style={[styles.category, { color: theme.colors.onSurface, fontFamily: theme.typography.fontFamilyBold, fontWeight: '700' }]}>
                    {exp.category}
                  </Text>
                  <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
                    {formatDate(exp.expense_date)}
                  </Text>
                  {exp.notes && (
                    <Text style={[styles.notes, { color: theme.colors.onSurfaceVariant }]}>
                      {exp.notes}
                    </Text>
                  )}
                </View>
                <Text style={[styles.amount, { color: theme.colors.error, fontFamily: theme.typography.fontFamilyBold, fontWeight: '700' }]}>
                  - {formatCurrency(exp.amount)}
                </Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <View style={styles.fabContainer}>
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
            <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.onSurface, fontFamily: theme.typography.fontFamilyBold, fontWeight: '700' }]}>
                  New Expense
                </Text>
                <Button variant="ghost" size="sm" onPress={() => setModalVisible(false)} leftIcon={<X size={24} color={theme.colors.onSurface} />} />
              </View>

              <TextInput
                label="Amount (₹) *"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
              />

              <TextInput
                label="Category *"
                value={category}
                onChangeText={setCategory}
                placeholder="e.g. Electricity, Rent, Salary"
              />

              <TextInput
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  expenseCard: { marginBottom: 12 },
  expenseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  category: { fontSize: 16 },
  date: { fontSize: 12, marginTop: 2 },
  notes: { fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  amount: { fontSize: 16 },
  fabContainer: { position: 'absolute', bottom: 32, left: 16, right: 16 },
  fab: { elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20 },
});
