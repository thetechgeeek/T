import React, { forwardRef } from 'react';
import { SectionList, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useControllableState } from '@/src/hooks/useControllableState';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Badge } from '@/src/design-system/components/atoms/Badge';
import { EmptyState } from '@/src/design-system/components/molecules/EmptyState';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';

export interface NotificationItem {
	id: string;
	title: string;
	description?: string;
	category: string;
	read?: boolean;
}

export interface NotificationCenterProps {
	items?: NotificationItem[];
	defaultItems?: NotificationItem[];
	onChange?: (items: NotificationItem[]) => void;
	onValueChange?: (items: NotificationItem[], meta?: { source: 'selection' | 'clear' }) => void;
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

export const NotificationCenter = forwardRef<View, NotificationCenterProps>(
	({ items, defaultItems = [], onChange, onValueChange, testID, style }, ref) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const [currentItems, setCurrentItems] = useControllableState({
			value: items,
			defaultValue: defaultItems,
			onChange: (nextItems, meta) => {
				onChange?.(nextItems);
				onValueChange?.(nextItems, {
					source: meta?.source === 'clear' ? 'clear' : 'selection',
				});
			},
		});
		const sections = Object.entries(
			currentItems.reduce<Record<string, NotificationItem[]>>((groups, item) => {
				const nextGroup = groups[item.category] ?? [];
				nextGroup.push(item);
				groups[item.category] = nextGroup;
				return groups;
			}, {}),
		).map(([title, data]) => ({ title, data }));

		if (currentItems.length === 0) {
			return (
				<EmptyState
					testID={testID}
					title="No notifications"
					description="Updates, mentions, and system alerts will appear here."
					style={style}
				/>
			);
		}

		return (
			<View ref={ref} testID={testID} style={style}>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						marginBottom: theme.spacing.sm,
					}}
				>
					<ThemedText variant="sectionTitle" style={{ color: c.onSurface }}>
						Notifications
					</ThemedText>
					<Pressable
						onPress={() =>
							setCurrentItems(
								currentItems.map((item) => ({ ...item, read: true })),
								{ source: 'clear' },
							)
						}
						accessibilityRole="button"
						accessibilityLabel="Mark all notifications as read"
					>
						<ThemedText variant="captionBold" style={{ color: c.primary }}>
							Mark all as read
						</ThemedText>
					</Pressable>
				</View>
				<SectionList
					sections={sections}
					keyExtractor={(item) => item.id}
					renderSectionHeader={({ section }) => (
						<ThemedText
							variant="captionBold"
							style={{
								color: c.onSurfaceVariant,
								marginTop: theme.spacing.sm,
								marginBottom: theme.spacing.xs,
							}}
						>
							{section.title}
						</ThemedText>
					)}
					renderItem={({ item }) => (
						<Pressable
							testID={`notification-${item.id}`}
							onPress={() =>
								setCurrentItems(
									currentItems.map((entry) =>
										entry.id === item.id ? { ...entry, read: true } : entry,
									),
									{ source: 'selection' },
								)
							}
							style={{
								paddingVertical: theme.spacing.sm,
								flexDirection: 'row',
								alignItems: 'flex-start',
								gap: theme.spacing.sm,
								opacity: item.read ? theme.opacity.inactive : 1,
							}}
						>
							<Badge
								label=""
								showStatusDot
								variant={item.read ? 'neutral' : 'info'}
								accessibilityLabel={
									item.read ? 'Read notification' : 'Unread notification'
								}
							/>
							<View style={{ flex: 1 }}>
								<ThemedText variant="bodyStrong" style={{ color: c.onSurface }}>
									{item.title}
								</ThemedText>
								{item.description ? (
									<ThemedText
										variant="caption"
										style={{
											color: c.onSurfaceVariant,
											marginTop: theme.spacing.xxs,
										}}
									>
										{item.description}
									</ThemedText>
								) : null}
							</View>
							{item.read ? <Badge label="Read" variant="neutral" size="sm" /> : null}
						</Pressable>
					)}
				/>
			</View>
		);
	},
);

NotificationCenter.displayName = 'NotificationCenter';
