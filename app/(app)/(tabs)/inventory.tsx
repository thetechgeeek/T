import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter as useExpoRouter } from 'expo-router';
import { Plus, Package, Search, SlidersHorizontal, Grid as GridIcon, List as ListIcon } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/hooks/useLocale';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { TileSetCard } from '@/src/components/shared/TileSetCard';
import { TextInput } from '../../../src/components/ui/TextInput';
import { Chip } from '../../../src/components/ui/Chip';
import type { TileSetGroup, TileCategory } from '@/src/types/inventory';

const CATEGORIES: ('ALL' | TileCategory)[] = ['ALL', 'GLOSSY', 'MATT', 'ELEVATION', 'FLOOR', 'WOODEN', 'OTHER'];

export default function InventoryTab() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const router = useExpoRouter();
  const c = theme.colors;
  const s = theme.spacing;
  const r = theme.borderRadius;
  const typo = theme.typography;

  const { items, loading, hasMore, filters, page, fetchItems, setFilters } = useInventoryStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || '');

  useEffect(() => {
    // Initial fetch if empty and not loading
    if (items.length === 0 && !loading && page === 1) {
      fetchItems(true);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchItems(true);
    setRefreshing(false);
  };

  const handleSearchSubmit = () => {
    setFilters({ search: searchInput });
  };

  const handleCategorySelect = (cat: 'ALL' | TileCategory) => {
    setFilters({ category: cat });
  };

  const groupedSets = useMemo(() => {
    const map: Record<string, TileSetGroup> = {};
    items.forEach(item => {
      const g = item.base_item_number || 'UNKNOWN';
      if (!map[g]) map[g] = { baseItemNumber: g, items: [] };
      map[g].items.push(item);
    });
    return Object.values(map);
  }, [items]);

  const renderEmpty = () => {
    if (loading && items.length === 0) {
      return (
        <View style={styles.centerFlex}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      );
    }
    return (
      <View style={styles.centerFlex}>
        <Package size={64} color={c.placeholder} strokeWidth={1} />
        <Text style={[{ color: c.onSurface, fontSize: typo.sizes.lg, fontWeight: typo.weights.semibold, marginTop: s.md }]}>
          {t('inventory.noItems')}
        </Text>
        <Text style={[{ color: c.onSurfaceVariant, fontSize: typo.sizes.sm, marginTop: s.sm, textAlign: 'center' }]}>
          {filters.search || filters.category !== 'ALL' ? 'Try adjusting your search or filters.' : t('inventory.addFirstItem')}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border, borderBottomWidth: StyleSheet.hairlineWidth, paddingTop: 56, paddingHorizontal: s.lg, paddingBottom: s.md }]}>
        <View style={styles.headerTitleRow}>
          <Text style={[{ color: c.onBackground, fontSize: typo.sizes['2xl'], fontWeight: typo.weights.bold }]}>
            {t('inventory.title')}
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <TextInput
              placeholder="Search design or item number..."
              value={searchInput}
              onChangeText={setSearchInput}
              leftIcon={<Search size={18} color={c.placeholder} />}
              containerStyle={{ marginBottom: 0 }}
              returnKeyType="search"
              onSubmitEditing={handleSearchSubmit}
            />
          </View>
          <TouchableOpacity style={[styles.filterBtn, { backgroundColor: c.surfaceVariant, borderRadius: r.md }]}>
            <FiltersIcon size={20} color={c.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Categories (Horizontal Scroll) */}
        <View style={styles.chipScrollWrap}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={item => item}
            contentContainerStyle={{ paddingVertical: s.sm }}
            renderItem={({ item }) => {
              const isActive = filters.category === item;
              return (
                <Chip
                  label={item}
                  selected={isActive}
                  onPress={() => handleCategorySelect(item)}
                  style={{ marginRight: s.sm }}
                />
              );
            }}
          />
        </View>
      </View>

      {/* List */}
      <FlatList
        data={groupedSets}
        keyExtractor={item => item.baseItemNumber}
        contentContainerStyle={{ padding: s.md, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TileSetCard
            group={item}
            onPressItem={(invItem) => router.push(`/(app)/inventory/${invItem.id}`)}
            style={{ marginBottom: s.md }}
          />
        )}
        ListEmptyComponent={renderEmpty}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[c.primary]} tintColor={c.primary} />}
        onEndReached={() => {
          if (hasMore && !loading) {
            fetchItems();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading && items.length > 0 ? <ActivityIndicator style={{ padding: s.md }} color={c.primary} /> : null}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: c.primary, ...theme.shadows.lg as object }]}
        onPress={() => router.push('/(app)/inventory/add')}
        activeOpacity={0.85}
      >
        <Plus size={28} color={c.onPrimary} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

// Map the icon since SlidersHorizontal isn't standard in older lucide but we imported it, if it fails we can fallback.
const FiltersIcon = SlidersHorizontal;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {},
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  searchRow: { flexDirection: 'row', alignItems: 'center' },
  searchWrap: { flex: 1, marginRight: 12 },
  filterBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  chipScrollWrap: { marginTop: 8, marginHorizontal: -20, paddingHorizontal: 20 },
  centerFlex: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: 100 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
});
