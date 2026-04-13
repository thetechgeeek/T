import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { SectionHeader, type SectionHeaderVariant } from './SectionHeader';

export interface FormSectionProps {
	title: string;
	subtitle?: string;
	children: React.ReactNode;
	/** Optional action rendered on the header */
	action?: React.ReactNode;
	actionLabel?: string;
	onActionPress?: () => void;
	headerVariant?: SectionHeaderVariant;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

export function FormSection({
	title,
	subtitle,
	children,
	action,
	actionLabel,
	onActionPress,
	headerVariant,
	style,
	testID,
}: FormSectionProps) {
	const { s } = useThemeTokens();

	return (
		<View testID={testID} style={[styles.container, { gap: s.sm }, style]}>
			<SectionHeader
				title={title}
				subtitle={subtitle}
				action={action}
				actionLabel={actionLabel}
				onActionPress={onActionPress}
				variant={headerVariant}
			/>
			<View style={{ paddingHorizontal: s.lg }}>{children}</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {},
});
