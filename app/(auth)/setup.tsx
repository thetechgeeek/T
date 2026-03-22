import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useAuthStore } from '@/src/stores/authStore';
import { useLocale } from '@/src/hooks/useLocale';
import { supabase } from '@/src/config/supabase';

export default function SetupScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { register } = useAuthStore();
  const router = useRouter();

  const [step, setStep] = useState<'account' | 'business'>('account');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [gstin, setGstin] = useState('');
  const [loading, setLoading] = useState(false);

  const c = theme.colors;
  const s = theme.spacing;
  const r = theme.borderRadius;
  const typo = theme.typography;

  const handleCreateAccount = async () => {
    if (!email || !password) return Alert.alert('Error', 'Email and password are required');
    if (password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(email, password);
      setStep('business');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBusiness = async () => {
    if (!businessName) return Alert.alert('Error', 'Business name is required');
    setLoading(true);
    try {
      await supabase.from('business_profile').upsert({
        business_name: businessName,
        phone,
        gstin,
        invoice_prefix: 'TM',
        invoice_sequence: 0,
      });
      router.replace('/(app)/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to save business profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={[styles.scroll, { padding: s.lg }]} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: c.primary, fontSize: typo.sizes['2xl'], fontWeight: typo.weights.bold, marginBottom: s.sm }]}>
          🏺 TileMaster
        </Text>
        <Text style={[styles.subtitle, { color: c.onSurfaceVariant, fontSize: typo.sizes.md, marginBottom: s.xl }]}>
          {step === 'account' ? t('auth.welcome') : t('auth.setupBusiness')}
        </Text>

        {step === 'account' ? (
          <>
            <InputField label={t('auth.email')} placeholder="you@example.com" value={email} onChangeText={setEmail}
              keyboardType="email-address" autoCapitalize="none" theme={theme} />
            <View style={{ height: s.md }} />
            <InputField label={t('auth.password')} placeholder="••••••••" value={password} onChangeText={setPassword}
              secureTextEntry theme={theme} />
            <TouchableOpacity
              style={[styles.button, { backgroundColor: c.primary, borderRadius: r.md, marginTop: s.xl }]}
              onPress={handleCreateAccount} disabled={loading}
            >
              {loading ? <ActivityIndicator color={c.onPrimary} /> :
                <Text style={{ color: c.onPrimary, fontSize: typo.sizes.md, fontWeight: typo.weights.semibold }}>
                  {t('common.add')} Account →
                </Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkBtn} onPress={() => router.push('/(auth)/login')}>
              <Text style={{ color: c.primary, fontSize: typo.sizes.sm }}>Already have an account? {t('auth.signIn')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <InputField label="Business Name *" placeholder="Enter business name" value={businessName} onChangeText={setBusinessName} theme={theme} />
            <View style={{ height: s.md }} />
            <InputField label="Phone" placeholder="Enter phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" theme={theme} />
            <View style={{ height: s.md }} />
            <InputField label="GSTIN (optional)" placeholder="Enter GSTIN" value={gstin} onChangeText={setGstin} autoCapitalize="characters" theme={theme} />
            <TouchableOpacity
              style={[styles.button, { backgroundColor: c.primary, borderRadius: r.md, marginTop: s.xl }]}
              onPress={handleSaveBusiness} disabled={loading}
            >
              {loading ? <ActivityIndicator color={c.onPrimary} /> :
                <Text style={{ color: c.onPrimary, fontSize: typo.sizes.md, fontWeight: typo.weights.semibold }}>
                  {t('common.save')} & Continue →
                </Text>}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InputField({ label, theme, ...props }: any) {
  const c = theme.colors;
  const typo = theme.typography;
  const r = theme.borderRadius;
  return (
    <View style={[styles.inputWrap, { borderColor: c.border, borderRadius: r.md, backgroundColor: c.surface }]}>
      <Text style={[styles.inputLabel, { color: c.onSurfaceVariant, fontSize: typo.sizes.xs }]}>{label}</Text>
      <TextInput style={[{ color: c.onSurface, fontSize: typo.sizes.md, height: 40 }]} placeholderTextColor={c.placeholder} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingTop: 80 },
  title: {},
  subtitle: {},
  inputWrap: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  inputLabel: { marginBottom: 2 },
  button: { height: 52, alignItems: 'center', justifyContent: 'center' },
  linkBtn: { alignItems: 'center', height: 44, justifyContent: 'center', marginTop: 8 },
});
