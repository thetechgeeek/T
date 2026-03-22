import type { TextStyle } from 'react-native';

export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  surfaceVariant: string;
  card: string;
  // Text
  onBackground: string;
  onSurface: string;
  onSurfaceVariant: string;
  placeholder: string;
  // Brand
  primary: string;
  primaryLight: string;
  primaryDark: string;
  onPrimary: string;
  // Semantic
  success: string;
  onSuccess: string;
  successLight: string;
  warning: string;
  onWarning: string;
  warningLight: string;
  error: string;
  onError: string;
  errorLight: string;
  info: string;
  onInfo: string;
  infoLight: string;
  // UI
  border: string;
  borderStrong: string;
  separator: string;
  overlay: string;
  scrim: string;
  // Tabs & Nav
  tabBar: string;
  tabActive: string;
  tabInactive: string;
  // Specific
  badge: string;
  paid: string;
  partial: string;
  unpaid: string;
  lowStock: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontFamilyBold: string;
  sizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
  };
  weights: {
    regular: TextStyle['fontWeight'];
    medium: TextStyle['fontWeight'];
    semibold: TextStyle['fontWeight'];
    bold: TextStyle['fontWeight'];
  };
  lineHeights: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface Theme {
  isDark: boolean;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: {
    xs: number;     // 4
    sm: number;     // 8
    md: number;     // 16
    lg: number;     // 24
    xl: number;     // 32
    '2xl': number;  // 48
    '3xl': number;  // 64
  };
  borderRadius: {
    sm: number;   // 6
    md: number;   // 12
    lg: number;   // 20
    full: number; // 9999
  };
  shadows: {
    sm: object;
    md: object;
    lg: object;
  };
  touchTarget: number; // minimum 48
}

export type ThemeMode = 'light' | 'dark' | 'system';
