import React from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	Platform,
	type ViewStyle,
	type ScrollViewProps,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
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
	accessibilityLabel?: string;
}

export const Screen: React.FC<ScreenProps> = ({
	children,
	scrollable = false,
	withKeyboard = true,
	style,
	contentContainerStyle,
	safeAreaEdges = ['top'],
	scrollViewProps,
	backgroundColor,
	accessibilityLabel,
}) => {
	const { theme } = useTheme();
	const insets = useSafeAreaInsets();

	const bg = backgroundColor || theme.colors.background;

	const containerStyle = [
		styles.container,
		{
			backgroundColor: bg,
			// Default to 0 if edge is not in safeAreaEdges, but most screens should include 'top'
			paddingTop: safeAreaEdges.includes('top') ? insets.top : 0,
			paddingBottom: safeAreaEdges.includes('bottom') ? insets.bottom : 0,
		},
		style,
	];

	const inner = scrollable ? (
		<ScrollView
			showsVerticalScrollIndicator={false}
			{...scrollViewProps}
			contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
		>
			{children}
		</ScrollView>
	) : (
		<View style={[styles.flex, contentContainerStyle]}>{children}</View>
	);

	if (withKeyboard) {
		return (
			<KeyboardAvoidingView
				style={containerStyle}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				accessibilityLabel={accessibilityLabel}
			>
				{inner}
			</KeyboardAvoidingView>
		);
	}

	return (
		<View style={containerStyle} accessibilityLabel={accessibilityLabel}>
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
