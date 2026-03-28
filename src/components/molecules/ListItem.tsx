import React from 'react';
import { Pressable, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

interface ListItemProps {
	title: string;
	subtitle?: string;
	leftIcon?: React.ReactNode;
	rightElement?: React.ReactNode;
	onPress?: () => void;
	style?: ViewStyle;
	showChevron?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
	title,
	subtitle,
	leftIcon,
	rightElement,
	onPress,
	style,
	showChevron = true,
}) => {
	const { theme } = useTheme();

	return (
		<Pressable
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={title}
			style={({ pressed }) => [
				styles.container,
				{ borderBottomWidth: 1, borderBottomColor: theme.colors.separator },
				pressed && { backgroundColor: theme.colors.surfaceVariant },
				style,
			]}
		>
			<View style={styles.content}>
				{leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
				<View style={styles.textContainer}>
					<Text
						style={[
							styles.title,
							{
								color: theme.colors.onSurface,
								fontSize: theme.typography.sizes.md,
								fontFamily: theme.typography.fontFamilyBold,
							},
						]}
					>
						{title}
					</Text>
					{!!subtitle && (
						<Text
							style={[
								styles.subtitle,
								{
									color: theme.colors.onSurfaceVariant,
									fontSize: theme.typography.sizes.sm,
									fontFamily: theme.typography.fontFamily,
								},
							]}
						>
							{subtitle}
						</Text>
					)}
				</View>
				{rightElement}
				{onPress && showChevron && (
					<ChevronRight
						size={20}
						color={theme.colors.onSurfaceVariant}
						style={styles.chevron}
					/>
				)}
			</View>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	container: {
		paddingVertical: 12,
		paddingHorizontal: 16,
	},
	content: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	leftIcon: {
		marginRight: 16,
	},
	textContainer: {
		flex: 1,
	},
	title: {
		marginBottom: 2,
	},
	subtitle: {},
	chevron: {
		marginLeft: 8,
	},
});
