import React, { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { triggerDesignSystemHaptic } from '@/src/design-system/haptics';
import {
	Avatar,
	type AvatarSize,
	type AvatarStatus,
} from '@/src/design-system/components/atoms/Avatar';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { announceForScreenReader, buildFocusRingStyle } from '@/src/utils/accessibility';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

export interface AvatarGroupItem {
	id: string;
	name: string;
	source?: string;
	status?: AvatarStatus;
}

export interface AvatarGroupProps {
	items: AvatarGroupItem[];
	maxVisible?: number;
	size?: AvatarSize;
	expanded?: boolean;
	defaultExpanded?: boolean;
	onExpandedChange?: (expanded: boolean) => void;
	style?: StyleProp<ViewStyle>;
	testID?: string;
	accessibilityLabel?: string;
}

const OVERLAP_BY_SIZE: Record<AvatarSize, number> = {
	sm: 8,
	md: 10,
	lg: 12,
	xl: 14,
};

export const AvatarGroup = forwardRef<React.ElementRef<typeof View>, AvatarGroupProps>(
	(
		{
			items,
			maxVisible = 3,
			size = 'md',
			expanded,
			defaultExpanded = false,
			onExpandedChange,
			style,
			testID,
			accessibilityLabel,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
		const [isFocused, setIsFocused] = useState(false);
		const isExpanded = expanded ?? uncontrolledExpanded;
		const visibleItems = isExpanded ? items : items.slice(0, maxVisible);
		const overflowCount = Math.max(0, items.length - maxVisible);

		const setExpanded = (nextExpanded: boolean) => {
			if (expanded === undefined) {
				setUncontrolledExpanded(nextExpanded);
			}
			onExpandedChange?.(nextExpanded);
			void triggerDesignSystemHaptic('selection');
			void announceForScreenReader(
				nextExpanded ? `${overflowCount} more avatars expanded` : 'Avatar group collapsed',
			);
		};

		return (
			<View
				ref={ref}
				testID={testID}
				accessible={true}
				accessibilityRole="image"
				accessibilityLabel={accessibilityLabel ?? `${items.length} avatars in group`}
				style={[styles.container, style]}
			>
				<View style={styles.row}>
					{visibleItems.map((item, index) => (
						<View
							key={item.id}
							style={{ marginStart: index === 0 ? 0 : -OVERLAP_BY_SIZE[size] }}
						>
							<Avatar
								name={item.name}
								source={item.source}
								status={item.status}
								size={size}
							/>
						</View>
					))}
					{overflowCount > 0 && !isExpanded ? (
						<Pressable
							testID="avatar-group-overflow"
							onPress={() => setExpanded(true)}
							onFocus={() => setIsFocused(true)}
							onBlur={() => setIsFocused(false)}
							accessibilityRole="button"
							accessibilityLabel={`Show ${overflowCount} more avatars`}
							style={[
								styles.overflowAvatar,
								{
									marginStart:
										visibleItems.length === 0 ? 0 : -OVERLAP_BY_SIZE[size],
									width:
										size === 'xl'
											? 72
											: size === 'lg'
												? 56
												: size === 'sm'
													? 32
													: 44,
									height:
										size === 'xl'
											? 72
											: size === 'lg'
												? 56
												: size === 'sm'
													? 32
													: 44,
									borderRadius:
										(size === 'xl'
											? 72
											: size === 'lg'
												? 56
												: size === 'sm'
													? 32
													: 44) / 2,
									backgroundColor: theme.colors.surfaceVariant,
									borderColor: theme.colors.card,
								},
								isFocused
									? buildFocusRingStyle({
											color: theme.colors.primary,
											radius: theme.visual.silhouette.avatar,
										})
									: null,
							]}
						>
							<ThemedText
								variant="captionBold"
								style={{ color: theme.colors.onSurface }}
							>
								{`+${overflowCount}`}
							</ThemedText>
						</Pressable>
					) : null}
				</View>

				{isExpanded && overflowCount > 0 ? (
					<Pressable
						testID="avatar-group-collapse"
						onPress={() => setExpanded(false)}
						accessibilityRole="button"
						accessibilityLabel="Collapse avatar group"
						style={styles.collapseAction}
					>
						<ThemedText
							variant="caption"
							weight="semibold"
							style={{ color: theme.colors.primary }}
						>
							{`Hide ${overflowCount}`}
						</ThemedText>
					</Pressable>
				) : null}
			</View>
		);
	},
);

AvatarGroup.displayName = 'AvatarGroup';

const styles = StyleSheet.create({
	container: {
		gap: SPACING_PX.sm,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	overflowAvatar: {
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 2,
	},
	collapseAction: {
		alignSelf: 'flex-start',
	},
});
