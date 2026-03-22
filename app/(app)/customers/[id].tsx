import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Phone, MapPin, Receipt, Wallet, Plus } from 'lucide-react-native';
import { useCustomerStore } from '@/src/stores/customerStore';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/hooks/useLocale';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Divider } from '@/src/components/ui/Divider';
import { Button } from '@/src/components/ui/Button';
import { ListItem } from '@/src/components/ui/ListItem';
import { PaymentModal } from '@/src/components/shared/PaymentModal';
import type { CustomerLedgerEntry } from '@/src/types/customer';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { formatCurrency, formatDate } = useLocale();
  const router = useRouter();
  
  const [paymentModalVisible, setPaymentModalVisible] = React.useState(false);
  
  const { 
    selectedCustomer: customer, 
    ledger, 
    summary, 
    loading, 
    fetchCustomerDetail 
  } = useCustomerStore();

  useEffect(() => {
    if (id) fetchCustomerDetail(id);
  }, [id]);

  const renderLedgerItem = ({ item }: { item: CustomerLedgerEntry }) => (
    <View style={[styles.ledgerItem, { borderLeftColor: item.type === 'invoice' ? theme.colors.error : theme.colors.success }]}>
      <View style={styles.ledgerHeader}>
        <Text style={[styles.ledgerRef, { color: theme.colors.onSurface, fontFamily: theme.typography.fontFamilyBold }]}>
          {item.reference}
        </Text>
        <Text style={[styles.ledgerDate, { color: theme.colors.onSurfaceVariant }]}>
          {formatDate(item.date)}
        </Text>
      </View>
      
      <View style={styles.ledgerRow}>
        <View style={styles.ledgerCol}>
          <Text style={[styles.ledgerLabel, { color: theme.colors.onSurfaceVariant }]}>Amount</Text>
          <Text style={[
            styles.ledgerValue, 
            { color: item.type === 'invoice' ? theme.colors.error : theme.colors.success, fontFamily: theme.typography.fontFamilyBold }
          ]}>
            {item.debit > 0 ? `+${formatCurrency(item.debit)}` : `-${formatCurrency(item.credit)}`}
          </Text>
        </View>
        <View style={styles.ledgerCol}>
          <Text style={[styles.ledgerLabel, { color: theme.colors.onSurfaceVariant }]}>Balance</Text>
          <Text style={[styles.ledgerValue, { color: theme.colors.onSurface, fontFamily: theme.typography.fontFamilyBold }]}>
            {formatCurrency(item.balance)}
          </Text>
        </View>
      </View>
    </View>
  );

  if (!customer) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: customer.name }} />
      
      <FlatList
        data={ledger}
        renderItem={renderLedgerItem}
        keyExtractor={(item, index) => `${item.reference}-${index}`}
        ListHeaderComponent={
          <View style={styles.header}>
            <Card style={styles.summaryCard}>
              <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>Outstanding Balance</Text>
              <Text style={[styles.summaryAmount, { color: (summary?.outstanding_balance || 0) > 0 ? theme.colors.error : theme.colors.onSurface }]}>
                {formatCurrency(summary?.outstanding_balance || 0)}
              </Text>
              
              <Divider style={{ marginVertical: 12 }} />
              
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Total Invoiced</Text>
                  <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{formatCurrency(summary?.total_invoiced || 0)}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Total Paid</Text>
                  <Text style={[styles.statValue, { color: theme.colors.success }]}>{formatCurrency(summary?.total_paid || 0)}</Text>
                </View>
              </View>
            </Card>

            <View style={styles.actions}>
              <Button 
                title="Record Payment" 
                variant="primary" 
                leftIcon={<Wallet size={18} color="white" />}
                style={{ flex: 1, marginRight: 8 }}
                onPress={() => setPaymentModalVisible(true)}
              />
              <Button 
                title="New Invoice" 
                variant="outline" 
                leftIcon={<Plus size={18} color={theme.colors.primary} />}
                style={{ flex: 1, marginLeft: 8 }}
                onPress={() => router.push({ pathname: '/invoices/create', params: { customerId: customer.id } })}
              />
            </View>

            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, marginTop: 16 }]}>Customer Info</Text>
            <Card style={styles.infoCard}>
              {customer.phone && (
                <ListItem 
                  title={customer.phone} 
                  leftIcon={<Phone size={18} color={theme.colors.onSurfaceVariant} />} 
                  showChevron={false}
                />
              )}
              {customer.city && (
                <ListItem 
                  title={`${customer.city}, ${customer.state || ''}`} 
                  leftIcon={<MapPin size={18} color={theme.colors.onSurfaceVariant} />} 
                  showChevron={false}
                />
              )}
              <ListItem 
                title={`Type: ${customer.type.toUpperCase()}`} 
                leftIcon={<Badge label={customer.type.charAt(0)} variant="neutral" size="sm" />} 
                showChevron={false}
              />
            </Card>

            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, marginTop: 16 }]}>Ledger History</Text>
          </View>
        }
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={() => fetchCustomerDetail(customer.id)}
            tintColor={theme.colors.primary}
          />
        }
      />

      {customer && (
        <PaymentModal
          visible={paymentModalVisible}
          onClose={() => setPaymentModalVisible(false)}
          customerId={customer.id}
          customerName={customer.name}
          onSuccess={() => fetchCustomerDetail(customer.id)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16 },
  summaryCard: { padding: 20, alignItems: 'center' },
  summaryLabel: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  summaryAmount: { fontSize: 32, fontWeight: '800' },
  statsRow: { flexDirection: 'row', width: '100%' },
  stat: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 11, textTransform: 'uppercase', marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: '700' },
  actions: { flexDirection: 'row', marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, paddingHorizontal: 4 },
  infoCard: { padding: 0 },
  list: { flexGrow: 1, paddingBottom: 40 },
  ledgerItem: { 
    marginHorizontal: 16, 
    marginBottom: 12, 
    padding: 12, 
    backgroundColor: 'white', 
    borderRadius: 8,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ledgerHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  ledgerRef: { fontSize: 14 },
  ledgerDate: { fontSize: 12 },
  ledgerRow: { flexDirection: 'row' },
  ledgerCol: { flex: 1 },
  ledgerLabel: { fontSize: 10, textTransform: 'uppercase', marginBottom: 2 },
  ledgerValue: { fontSize: 14 },
});
