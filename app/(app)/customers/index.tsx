import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { UserPlus } from 'lucide-react-native';
import { useCustomerStore } from '@/src/stores/customerStore';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SearchBar } from '@/src/components/ui/SearchBar';
import { ListItem } from '@/src/components/ui/ListItem';
import { Button } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Badge } from '@/src/components/ui/Badge';
import { useLocale } from '@/src/hooks/useLocale';
import type { Customer } from '@/src/types/customer';

export default function CustomersScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { formatCurrency } = useLocale();
  const { 
    customers, 
    loading, 
    fetchCustomers, 
    setFilters, 
    filters 
  } = useCustomerStore();

  const [search, setSearch] = useState(filters.search || '');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    setFilters({ search: text });
  };

  const renderCustomer = ({ item }: { item: Customer }) => (
    <ListItem
      title={item.name}
      subtitle={item.phone || item.city || 'No contact info'}
      onPress={() => router.push(`/customers/${item.id}`)}
      leftIcon={
        <View style={[styles.avatar, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text style={{ 
            color: theme.colors.primary, 
            fontWeight: '700', 
            fontSize: 18,
            fontFamily: theme.typography.fontFamilyBold 
          }}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      }
      rightElement={
        <Badge 
          label={item.type.toUpperCase()} 
          variant="neutral" 
          size="sm" 
        />
      }
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: 'Customers',
          headerRight: () => (
            <Button 
              variant="ghost" 
              size="sm" 
              onPress={() => router.push('/customers/add')}
              leftIcon={<UserPlus size={22} color={theme.colors.primary} />}
            />
          )
        }} 
      />

      <View style={[styles.header, { borderBottomColor: theme.colors.separator }]}>
        <SearchBar
          value={search}
          onChangeText={handleSearch}
          placeholder="Search customers..."
          style={styles.searchBar}
        />
      </View>

      <FlatList
        data={customers}
        renderItem={renderCustomer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl 
            refreshing={loading && customers.length > 0} 
            onRefresh={() => fetchCustomers(true)}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              title="No customers found"
              description="Start by adding your first customer to manage their credit and invoices."
              icon={<UserPlus size={48} color={theme.colors.placeholder} />}
              actionLabel="Add Customer"
              onAction={() => router.push('/customers/add')}
            />
          ) : null
        }
      />
    </View>
  );
}

import { Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchBar: {
    marginBottom: 0,
  },
  list: {
    flexGrow: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
