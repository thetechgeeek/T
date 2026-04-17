import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { Card } from '@/src/design-system/components/atoms/Card';
import { TouchableCard } from '@/src/design-system/components/atoms/TouchableCard';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';

export interface SettingsCardProps {
	title?: string;
	subtitle?: string;
	children?: React.ReactNode;
	selected?: boolean;
	onPress?: () => void;
	padding?: 'none' | 'sm' | 'md' | 'lg';
	style?: StyleProp<ViewStyle>;
	testID?: string;
	accessibilityLabel?: string;
}

export function SettingsCard({
	title,
	subtitle,
	children,
	selected = false,
	onPress,
	padding = 'lg',
	style,
	testID,
	accessibilityLabel,
}: SettingsCardProps) {
	const { c, s, r } = useThemeTokens();

	const containerStyle: ViewStyle = {
		borderRadius: r.md,
		borderWidth: 1,
		borderColor: selected ? c.primary : c.border,
		backgroundColor: c.card,
	};

	if (padding !== 'none') {
		containerStyle.padding = padding === 'sm' ? s.sm : padding === 'md' ? s.md : s.lg;
	}

	const hasHeader = Boolean(title || subtitle);

	const content = (
		<View style={styles.content}>
			{title ? (
				<ThemedText variant="body" weight="semibold">
					{title}
				</ThemedText>
			) : null}
			{subtitle ? (
				<ThemedText variant="caption" color={c.onSurfaceVariant}>
					{subtitle}
				</ThemedText>
			) : null}
			{children ? <View style={{ marginTop: hasHeader ? s.sm : 0 }}>{children}</View> : null}
		</View>
	);

	if (onPress) {
		return (
			<TouchableCard
				testID={testID}
				accessibilityLabel={accessibilityLabel ?? title}
				onPress={onPress}
				style={[containerStyle, style]}
			>
				{content}
			</TouchableCard>
		);
	}

	return (
		<Card
			accessible={true}
			accessibilityLabel={accessibilityLabel ?? title}
			variant="flat"
			padding="none"
			style={[containerStyle, style]}
		>
			{content}
		</Card>
	);
}

const styles = StyleSheet.create({
	content: {},
});
