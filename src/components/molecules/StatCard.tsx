import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { LucideIcon } from 'lucide-react-native';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: string;
  trend?: string;
  trendLabel?: string;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, value, icon: Icon, color, trend, trendLabel, style 
}) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const r = theme.borderRadius;
  const s = theme.spacing;

  return (
    <View style={[styles.container, { 
      backgroundColor: c.card, 
      borderRadius: r.md, 
      padding: s.md,
      ...(theme.shadows.md as object),
    }, style]}>
      {Icon && (
        <View style={styles.iconContainer}>
          <Icon size={20} color={color || c.primary} strokeWidth={2} />
        </View>
      )}
      <Text 
        numberOfLines={1} 
        adjustsFontSizeToFit 
        style={[styles.value, { color: c.onSurface, fontSize: 18, fontWeight: '700', marginTop: Icon ? 6 : 0 }]}
      >
        {value}
      </Text>
      <Text style={[styles.label, { color: c.onSurfaceVariant, fontSize: 10, fontWeight: '600' }]}>
        {label}
      </Text>
      
      {trend && (
        <View style={styles.trendRow}>
          <Text style={[styles.trend, { color: trend.startsWith('+') ? c.success : c.error }]}>
            {trend}
          </Text>
          <Text style={[styles.trendLabel, { color: c.onSurfaceVariant, fontSize: 10 }]}>
            {trendLabel}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 2,
  },
  label: {
    marginTop: 2,
  },
  value: {
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trend: {
    fontSize: 10,
    fontWeight: '700',
    marginRight: 4,
  },
  trendLabel: {
  },
});

