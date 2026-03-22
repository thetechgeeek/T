import type { Theme, ThemeColors } from './index';
import { Platform } from 'react-native';

// ─── Terracotta / Rust-themed color palette for ceramics/tiles domain ───

const LIGHT_COLORS: ThemeColors = {
  // Backgrounds
  background: '#FAFAF8',        // warm off-white
  surface: '#FFFFFF',
  surfaceVariant: '#F5F0EC',    // warm gray tint
  card: '#FFFFFF',
  // Text
  onBackground: '#1A1412',      // near-black with warm tint
  onSurface: '#2C2420',
  onSurfaceVariant: '#6B5E57',
  placeholder: '#A89B94',
  // Brand: terracotta / rust
  primary: '#C1440E',           // terracotta
  primaryLight: '#E8622A',
  primaryDark: '#8B2F07',
  onPrimary: '#FFFFFF',
  // Semantic
  success: '#2D7A3E',
  onSuccess: '#FFFFFF',
  successLight: '#E8F5EB',
  warning: '#A85F00',
  onWarning: '#FFFFFF',
  warningLight: '#FFF3E0',
  error: '#C62828',
  onError: '#FFFFFF',
  errorLight: '#FFEBEE',
  info: '#1565C0',
  onInfo: '#FFFFFF',
  infoLight: '#E3F2FD',
  // UI
  border: '#E0D8D2',
  borderStrong: '#B0A49C',
  separator: '#EDE8E4',
  overlay: 'rgba(0,0,0,0.4)',
  scrim: 'rgba(0,0,0,0.6)',
  // Tabs
  tabBar: '#FFFFFF',
  tabActive: '#C1440E',
  tabInactive: '#9E8F88',
  // Specific
  badge: '#C1440E',
  paid: '#2D7A3E',
  partial: '#A85F00',
  unpaid: '#C62828',
  lowStock: '#C62828',
};

const DARK_COLORS: ThemeColors = {
  // Backgrounds
  background: '#1A1210',        // deep warm charcoal
  surface: '#252018',
  surfaceVariant: '#302820',
  card: '#2C2218',
  // Text
  onBackground: '#F2EDE8',
  onSurface: '#EAE4DE',
  onSurfaceVariant: '#B0A49C',
  placeholder: '#7A6E68',
  // Brand: darkened terracotta
  primary: '#E8622A',           // brighter in dark mode for visibility
  primaryLight: '#FF8A60',
  primaryDark: '#C1440E',
  onPrimary: '#FFFFFF',
  // Semantic
  success: '#4CAF70',
  onSuccess: '#000000',
  successLight: '#1A3A24',
  warning: '#FFB74D',
  onWarning: '#000000',
  warningLight: '#3A2A10',
  error: '#EF5350',
  onError: '#000000',
  errorLight: '#3A1818',
  info: '#42A5F5',
  onInfo: '#000000',
  infoLight: '#1A2A3A',
  // UI
  border: '#3D3028',
  borderStrong: '#5D4838',
  separator: '#302820',
  overlay: 'rgba(0,0,0,0.6)',
  scrim: 'rgba(0,0,0,0.8)',
  // Tabs
  tabBar: '#1E1810',
  tabActive: '#E8622A',
  tabInactive: '#7A6E68',
  // Specific
  badge: '#E8622A',
  paid: '#4CAF70',
  partial: '#FFB74D',
  unpaid: '#EF5350',
  lowStock: '#EF5350',
};

const TYPOGRAPHY: Theme['typography'] = {
  fontFamily: Platform?.select({ ios: 'System', android: 'sans-serif', default: 'System' }) ?? 'System',
  fontFamilyBold: Platform?.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }) ?? 'System',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

const SPACING: Theme['spacing'] = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

const BORDER_RADIUS: Theme['borderRadius'] = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 9999,
};

const makeShadows = (isDark: boolean): Theme['shadows'] => ({
  sm: Platform?.select({
    ios: { shadowColor: isDark ? '#000' : '#4A3828', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 2 },
    android: { elevation: 2 },
    default: {},
  }) ?? {},
  md: Platform?.select({
    ios: { shadowColor: isDark ? '#000' : '#4A3828', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.4 : 0.12, shadowRadius: 6 },
    android: { elevation: 4 },
    default: {},
  }) ?? {},
  lg: Platform?.select({
    ios: { shadowColor: isDark ? '#000' : '#4A3828', shadowOffset: { width: 0, height: 6 }, shadowOpacity: isDark ? 0.5 : 0.16, shadowRadius: 12 },
    android: { elevation: 8 },
    default: {},
  }) ?? {},
});

export function buildTheme(isDark: boolean): Theme {
  return {
    isDark,
    colors: isDark ? DARK_COLORS : LIGHT_COLORS,
    typography: TYPOGRAPHY,
    spacing: SPACING,
    borderRadius: BORDER_RADIUS,
    shadows: makeShadows(isDark),
    touchTarget: 48,
  };
}

export const lightTheme = buildTheme(false);
export const darkTheme = buildTheme(true);
