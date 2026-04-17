import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';

export interface WorkbenchHeaderProps {
	title: string;
}

export function WorkbenchHeader({ title }: WorkbenchHeaderProps) {
	const { c, s } = useThemeTokens();
	const insets = useSafeAreaInsets();

	return (
		<View
			style={[
				styles.root,
				{
					borderBottomColor: c.border,
					paddingHorizontal: s.lg,
					paddingTop: Math.max(insets.top, s.sm),
					paddingBottom: s.md,
				},
			]}
		>
			<ThemedText variant="h2">{title}</ThemedText>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
});
