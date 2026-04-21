import React from 'react';
import { View } from 'react-native';
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	NotificationCenter,
	ThemedText,
	type NotificationItem,
} from '@easydesign/design-system';
import { useThemeTokens } from '@easydesign/design-system/foundation';
import { useShellEnvironment } from '../../ShellEnvironment';

function toNotificationCenterItems(
	items: ReturnType<typeof useShellEnvironment>['notifications']['items'],
): NotificationItem[] {
	return items.map((item) => ({
		id: item.id,
		title: item.title,
		description: item.description,
		category: item.category,
		read: item.read,
	}));
}

export function ShellNotificationHost() {
	const { notifications, translate, analytics } = useShellEnvironment();
	const { s } = useThemeTokens();
	const items = toNotificationCenterItems(notifications.items);
	const readStateById = new Map(items.map((item) => [item.id, Boolean(item.read)]));

	return (
		<Card variant="outlined" padding="lg">
			<CardHeader>
				<View style={{ gap: s.xs }}>
					<ThemedText variant="sectionTitle">
						{translate('shell.notifications.title', 'Notification center')}
					</ThemedText>
					<ThemedText variant="body" color="muted">
						{translate(
							'shell.notifications.description',
							'Shared shell alerts, inbox items, and action prompts appear here.',
						)}
					</ThemedText>
				</View>
			</CardHeader>
			<CardBody>
				<NotificationCenter
					items={items}
					onValueChange={(nextItems, meta) => {
						if (meta?.source === 'clear') {
							analytics.track('shell.notifications.markAllRead', {
								count: nextItems.length,
							});
							void notifications.markAllAsRead?.();
							return;
						}

						const justRead = nextItems.find(
							(item) => item.read && !readStateById.get(item.id),
						);
						if (justRead) {
							analytics.track('shell.notifications.markRead', { id: justRead.id });
							void notifications.markAsRead?.(justRead.id);
						}
					}}
				/>
				<View
					style={{
						flexDirection: 'row',
						gap: s.sm,
						marginTop: s.md,
					}}
				>
					<Button
						title={translate('shell.notifications.refresh', 'Refresh')}
						variant="secondary"
						size="sm"
						onPress={() => {
							analytics.track('shell.notifications.refresh');
							void notifications.refresh?.();
						}}
					/>
					{notifications.openPreferences ? (
						<Button
							title={translate('shell.notifications.preferences', 'Preferences')}
							variant="ghost"
							size="sm"
							onPress={() => {
								analytics.track('shell.notifications.preferences');
								notifications.openPreferences?.();
							}}
						/>
					) : null}
				</View>
			</CardBody>
		</Card>
	);
}
