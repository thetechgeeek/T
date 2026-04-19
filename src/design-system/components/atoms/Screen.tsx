import React from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	Platform,
	Keyboard,
	TouchableWithoutFeedback,
	type ViewStyle,
	type StyleProp,
	type ScrollViewProps,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/ThemeProvider';

export interface ScreenProps {
	children: React.ReactNode;
	scrollable?: boolean;
	withKeyboard?: boolean;
	style?: StyleProp<ViewStyle>;
	contentContainerStyle?: StyleProp<ViewStyle>;
	header?: React.ReactNode;
	footer?: React.ReactNode;
	overlay?: React.ReactNode;
	safeAreaEdges?: ('top' | 'bottom' | 'left' | 'right')[];
	scrollViewProps?: ScrollViewProps;
	backgroundColor?: string;
	accessibilityLabel?: string;
	testID?: string;
	dismissKeyboardOnBackgroundTap?: boolean;
	onMagicTap?: () => void;
}

export const Screen: React.FC<ScreenProps> = ({
	children,
	scrollable = false,
	withKeyboard = true,
	style,
	contentContainerStyle,
	header,
	footer,
	overlay,
	safeAreaEdges = ['top'],
	scrollViewProps,
	backgroundColor,
	accessibilityLabel,
	testID,
	dismissKeyboardOnBackgroundTap = false,
	onMagicTap,
}) => {
	const { theme } = useTheme();
	const insets = useSafeAreaInsets();

	const bg = backgroundColor || theme.colors.background;
	const topInset = safeAreaEdges.includes('top') ? insets.top : 0;
	const bottomInset = safeAreaEdges.includes('bottom') ? insets.bottom : 0;
	const { style: scrollStyle, ...restScrollViewProps } = scrollViewProps ?? {};

	const containerStyle = [
		styles.container,
		{
			backgroundColor: bg,
			// Default to 0 if edge is not in safeAreaEdges, but most screens should include 'top'
			paddingTop: topInset,
			paddingBottom: footer ? 0 : bottomInset,
		},
		style,
	];

	const inner = scrollable ? (
		<ScrollView
			style={[styles.flex, scrollStyle]}
			showsVerticalScrollIndicator={false}
			{...restScrollViewProps}
			contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
		>
			{children}
		</ScrollView>
	) : (
		<View style={[styles.flex, contentContainerStyle]}>{children}</View>
	);

	const interactiveBody = dismissKeyboardOnBackgroundTap ? (
		<TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
			<View style={styles.flex}>{inner}</View>
		</TouchableWithoutFeedback>
	) : (
		inner
	);

	const content = (
		<>
			{header}
			{interactiveBody}
			{footer ? (
				<View style={bottomInset ? { paddingBottom: bottomInset } : undefined}>
					{footer}
				</View>
			) : null}
			{overlay}
		</>
	);

	if (withKeyboard) {
		return (
			<KeyboardAvoidingView
				testID={testID}
				style={containerStyle}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				accessibilityLabel={accessibilityLabel}
				onMagicTap={onMagicTap}
			>
				{content}
			</KeyboardAvoidingView>
		);
	}

	return (
		<View
			testID={testID}
			style={containerStyle}
			accessibilityLabel={accessibilityLabel}
			onMagicTap={onMagicTap}
		>
			{content}
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
