import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, Truck, BarChart2, Settings, ChevronRight, Package } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/hooks/useLocale';
import { useAuthStore } from '@/src/stores/authStore';
import { Languages } from 'lucide-react-native';

export default function MoreTab() {
  const { theme } = useTheme();
  const { t, currentLanguage, toggleLanguage } = useLocale();
  const { logout } = useAuthStore();
  const router = useRouter();
  const c = theme.colors;
  const s = theme.spacing;

  const menuItems = [
    { label: t('customer.title'), icon: Users, route: '/(app)/customers/', color: c.info },
    { label: t('supplier.title'), icon: Truck, route: '/(app)/suppliers/', color: c.success },
    { label: t('order.title'), icon: Package, route: '/(app)/orders/', color: c.warning },
    { label: t('finance.title'), icon: BarChart2, route: '/(app)/finance/', color: c.primary },
    { label: t('settings.title'), icon: Settings, route: '/(app)/settings/', color: c.onSurfaceVariant },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border, borderBottomWidth: StyleSheet.hairlineWidth, paddingTop: 56, paddingHorizontal: s.lg, paddingBottom: s.md }]}>
        <Text style={[{ color: c.onBackground, fontSize: theme.typography.sizes['2xl'], fontWeight: theme.typography.weights.bold }]}>
          More
        </Text>
      </View>
      <View style={{ padding: s.lg }}>
        {menuItems.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.menuItem, { backgroundColor: c.card, borderRadius: theme.borderRadius.md, marginBottom: s.sm, ...theme.shadows.sm as object }]}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconWrap, { backgroundColor: item.color + '20', borderRadius: 10 }]}>
              <item.icon size={22} color={item.color} strokeWidth={2} />
            </View>
            <Text style={[styles.menuLabel, { color: c.onSurface, fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.medium }]}>
              {item.label}
            </Text>
            <ChevronRight size={18} color={c.placeholder} strokeWidth={2} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: c.card, borderRadius: theme.borderRadius.md, marginBottom: s.sm, marginTop: s.sm, ...theme.shadows.sm as object }]}
          onPress={toggleLanguage}
          activeOpacity={0.8}
        >
          <View style={[styles.iconWrap, { backgroundColor: c.primary + '20', borderRadius: 10 }]}>
            <Languages size={22} color={c.primary} strokeWidth={2} />
          </View>
          <Text style={[styles.menuLabel, { color: c.onSurface, fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.medium }]}>
            {currentLanguage === 'en' ? 'Switch to Hindi (हिंदी)' : 'Switch to English'}
          </Text>
          <ChevronRight size={18} color={c.placeholder} strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: c.errorLight, borderRadius: theme.borderRadius.md, marginTop: s.lg }]}
          onPress={logout}
        >
          <Text style={[{ color: c.error, fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.medium, flex: 1, textAlign: 'center' }]}>
            {t('auth.signOut')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {},
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  iconWrap: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuLabel: { flex: 1 },
});
