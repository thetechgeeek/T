import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

interface DividerProps {
	style?: ViewStyle;
	inset?: boolean;
}

export const Divider: React.FC<DividerProps> = ({ style, inset }) => {
	const { theme } = useTheme();

	return (
		<View
			accessible={false}
			importantForAccessibility="no"
			style={[
				styles.divider,
				{
					backgroundColor: theme.colors.separator,
					marginLeft: inset ? theme.spacing.md : 0,
				},
				style,
			]}
		/>
	);
};

const styles = StyleSheet.create({
	divider: {
		height: StyleSheet.hairlineWidth,
		width: '100%',
	},
});
