import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useAuthStore } from '@/src/stores/authStore';
import { useLocale } from '@/src/hooks/useLocale';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { login, loading } = useAuthStore();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    try {
      await login(email, password);
    } catch (e: any) {
      Alert.alert('Login Failed', e.message ?? 'Invalid credentials');
    }
  };

  const c = theme.colors;
  const s = theme.spacing;
  const r = theme.borderRadius;
  const typo = theme.typography;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={[styles.header, { backgroundColor: c.primary }]}>
          <Text style={[styles.logo, { color: c.onPrimary, fontSize: typo.sizes['3xl'] }]}>🏺</Text>
          <Text style={[styles.appName, { color: c.onPrimary, fontSize: typo.sizes['2xl'], fontWeight: typo.weights.bold }]}>
            TileMaster
          </Text>
          <Text style={[styles.subtitle, { color: c.onPrimary, fontSize: typo.sizes.sm, opacity: 0.9 }]}>
            {t('auth.subtitle')}
          </Text>
        </View>

        {/* Form */}
        <View style={[styles.form, { padding: s.lg }]}>
          <Text style={[styles.title, { color: c.onBackground, fontSize: typo.sizes.xl, fontWeight: typo.weights.bold, marginBottom: s.lg }]}>
            {t('auth.signIn')}
          </Text>

          {/* Email */}
          <View style={[styles.inputWrap, { borderColor: c.border, borderRadius: r.md, backgroundColor: c.surface }]}>
            <Text style={[styles.inputLabel, { color: c.onSurfaceVariant, fontSize: typo.sizes.xs }]}>
              {t('auth.email')}
            </Text>
            <TextInput
              style={[styles.input, { color: c.onSurface, fontSize: typo.sizes.md }]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="you@example.com"
              placeholderTextColor={c.placeholder}
            />
          </View>

          {/* Password */}
          <View style={[styles.inputWrap, { borderColor: c.border, borderRadius: r.md, backgroundColor: c.surface, marginTop: s.md }]}>
            <Text style={[styles.inputLabel, { color: c.onSurfaceVariant, fontSize: typo.sizes.xs }]}>
              {t('auth.password')}
            </Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.flex, { color: c.onSurface, fontSize: typo.sizes.md }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                placeholder="••••••••"
                placeholderTextColor={c.placeholder}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Text style={{ color: c.primary }}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: c.primary, borderRadius: r.md, marginTop: s.lg }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={c.onPrimary} />
            ) : (
              <Text style={[styles.buttonText, { color: c.onPrimary, fontSize: typo.sizes.md, fontWeight: typo.weights.semibold }]}>
                {t('auth.signIn')}
              </Text>
            )}
          </TouchableOpacity>

          {/* Setup link */}
          <TouchableOpacity
            style={[styles.linkBtn, { marginTop: s.md }]}
            onPress={() => router.push('/(auth)/setup')}
          >
            <Text style={[{ color: c.primary, fontSize: typo.sizes.sm }]}>
              {t('auth.setupBusiness')} →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1 },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  logo: { marginBottom: 8 },
  appName: { marginBottom: 4 },
  subtitle: { textAlign: 'center' },
  form: { flex: 1 },
  title: {},
  inputWrap: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputLabel: { marginBottom: 2 },
  input: { height: 40 },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  eyeBtn: { padding: 4 },
  button: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {},
  linkBtn: { alignItems: 'center', height: 44, justifyContent: 'center' },
});
