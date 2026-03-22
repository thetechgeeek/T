import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendLabel?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, trend, trendLabel }) => {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: c.onSurfaceVariant, fontSize: theme.typography.sizes.xs, letterSpacing: 0.5 }]}>
        {label.toUpperCase()}
      </Text>
      <Text style={[styles.value, { color: c.onSurface, fontSize: 24, fontFamily: theme.typography.fontFamilyBold }]}>
        {value}
      </Text>
      {trend && (
        <View style={styles.trendRow}>
          <Text style={[styles.trend, { color: trend.startsWith('+') ? c.success : c.error }]}>
            {trend}
          </Text>
          <Text style={[styles.trendLabel, { color: c.onSurfaceVariant }]}>
            {trendLabel}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  label: {
    marginBottom: 4,
    fontWeight: '600',
  },
  value: {
    marginBottom: 2,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trend: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
  trendLabel: {
    fontSize: 12,
  },
});
