import React from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  type ViewStyle,
  type ScrollViewProps
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/ThemeProvider';

export interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  withKeyboard?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  safeAreaEdges?: ('top' | 'bottom' | 'left' | 'right')[];
  scrollViewProps?: ScrollViewProps;
  backgroundColor?: string;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  withKeyboard = true,
  style,
  contentContainerStyle,
  safeAreaEdges = ['top', 'bottom'],
  scrollViewProps,
  backgroundColor,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  const bg = backgroundColor || theme.colors.background;
  
  const containerStyle = [
    styles.container,
    { 
      backgroundColor: bg,
      paddingTop: safeAreaEdges.includes('top') ? insets.top : 0,
      paddingBottom: safeAreaEdges.includes('bottom') ? insets.bottom : 0,
    },
    style
  ];

  const Content = scrollable ? ScrollView : View;
  const contentProps = scrollable ? {
    showsVerticalScrollIndicator: false,
    ...scrollViewProps,
    contentContainerStyle: [styles.scrollContent, contentContainerStyle],
  } : {
    style: [styles.flex, contentContainerStyle],
  };

  const inner = (
    <Content {...(contentProps as any)}>
      {children}
    </Content>
  );

  if (withKeyboard) {
    return (
      <KeyboardAvoidingView
        style={containerStyle}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {inner}
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={containerStyle}>
      {inner}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
