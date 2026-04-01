import React, { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { View, StyleSheet, RefreshControl, Modal, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Plus, X } from 'lucide-react-native';
import { FlashList } from '@shopify/flash-list';
import { useFinanceStore } from '@/src/stores/financeStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Card } from '@/src/components/atoms/Card';
import { Button } from '@/src/components/atoms/Button';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { FormField } from '@/src/components/molecules/FormField';
import { EmptyState } from '@/src/components/molecules/EmptyState';
import type { Expense } from '@/src/types/finance';
import { format } from 'date-fns';
import { layout } from '@/src/theme/layout';

export default function ExpensesScreen() {
	const { theme } = useThemeTokens();
	const insets = useSafeAreaInsets();
	const { t, formatCurrency, formatDate } = useLocale();
	const { expenses, loading, fetchExpenses, addExpense } = useFinanceStore(
		useShallow((s) => ({
			expenses: s.expenses,
			loading: s.loading,
			fetchExpenses: s.fetchExpenses,
			addExpense: s.addExpense,
		})),
	);
	const [modalVisible, setModalVisible] = useState(false);

	// Form state
	const [amount, setAmount] = useState('');
	const [category, setCategory] = useState('');
	const [notes, setNotes] = useState('');
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		fetchExpenses().catch((e: unknown) => {
			Alert.alert(
				t('common.errorTitle'),
				e instanceof Error ? e.message : t('common.unexpectedError'),
				[{ text: t('common.ok') }],
			);
		});
	}, [fetchExpenses, t]);

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
		} catch (e: unknown) {
			Alert.alert(
				t('finance.saveExpenseErrorTitle'),
				e instanceof Error ? e.message : t('common.unexpectedError'),
				[{ text: t('common.ok') }],
			);
		} finally {
			setSaving(false);
		}
	};

	return (
		<AtomicScreen safeAreaEdges={['top', 'bottom']} withKeyboard={false}>
			<Stack.Screen options={{ title: 'Expenses' }} />

			<FlashList
				data={expenses}
				estimatedItemSize={80}
				keyExtractor={(item: Expense) => item.id}
				contentContainerStyle={styles.scrollContent}
				refreshControl={
					<RefreshControl refreshing={loading} onRefresh={() => fetchExpenses()} />
				}
				ListEmptyComponent={
					!loading ? (
						<EmptyState
							title="No expenses found"
							actionLabel="Add Expense"
							onAction={() => setModalVisible(true)}
						/>
					) : null
				}
				renderItem={({ item: exp }: { item: Expense }) => (
					<Card style={styles.expenseCard} padding="md">
						<View style={layout.rowBetween}>
							<View style={{ flex: 1 }}>
								<ThemedText weight="bold">{exp.category}</ThemedText>
								<ThemedText variant="caption" color={theme.colors.onSurfaceVariant}>
									{formatDate(exp.expense_date)}
								</ThemedText>
								{exp.notes && (
									<ThemedText
										variant="caption"
										color={theme.colors.onSurfaceVariant}
										style={{ fontStyle: 'italic', marginTop: 2 }}
									>
										{exp.notes}
									</ThemedText>
								)}
							</View>
							<ThemedText weight="bold" color={theme.colors.error}>
								- {formatCurrency(exp.amount)}
							</ThemedText>
						</View>
					</Card>
				)}
			/>

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
					<AtomicScreen
						backgroundColor="transparent"
						safeAreaEdges={['top']}
						style={{ width: '100%' }}
					>
						<View
							style={[
								styles.modalContent,
								{ backgroundColor: theme.colors.background },
							]}
						>
							<View style={[layout.rowBetween, { marginBottom: 20 }]}>
								<ThemedText variant="h2">New Expense</ThemedText>
								<Button
									variant="ghost"
									size="sm"
									onPress={() => setModalVisible(false)}
									leftIcon={<X size={24} color={theme.colors.onSurface} />}
								/>
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
					</AtomicScreen>
				</View>
			</Modal>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	scrollContent: { padding: 16, paddingBottom: 100 },
	expenseCard: { marginBottom: 12 },
	fabContainer: { position: 'absolute', bottom: 32, left: 16, right: 16 },
	fab: {
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
	modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
});
