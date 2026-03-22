import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function SecurityLockScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const c = theme.colors;
  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border, borderBottomWidth: 1, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ArrowLeft size={22} color={c.primary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[{ color: c.onBackground, fontSize: 22, fontWeight: '700' }]}>Security & Lock</Text>
      </View>
      <View style={styles.center}>
        <Text style={[{ color: c.placeholder }]}>Security & Lock — coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { marginRight: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
