import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ 
  label, 
  variant = 'primary', 
  style,
  textStyle,
  size = 'md'
}) => {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return { bg: theme.colors.successLight, text: theme.colors.success };
      case 'warning':
        return { bg: theme.colors.warningLight, text: theme.colors.warning };
      case 'error':
        return { bg: theme.colors.errorLight, text: theme.colors.error };
      case 'info':
        return { bg: theme.colors.infoLight, text: theme.colors.info };
      case 'neutral':
        return { bg: theme.colors.surfaceVariant, text: theme.colors.onSurfaceVariant };
      default:
        return { bg: theme.colors.primary + '20', text: theme.colors.primary };
    }
  };

  const { bg, text } = getVariantStyles();

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: bg, 
        borderRadius: theme.borderRadius.full,
        paddingHorizontal: size === 'sm' ? 6 : 10,
        paddingVertical: size === 'sm' ? 2 : 4,
      }, 
      style
    ]}>
      <Text style={[
        styles.text, 
        { 
          color: text, 
          fontSize: size === 'sm' ? theme.typography.sizes.xs : theme.typography.sizes.sm,
          fontWeight: theme.typography.weights.semibold as any,
          fontFamily: theme.typography.fontFamilyBold
        }, 
        textStyle
      ]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
