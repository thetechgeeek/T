import React from 'react';
import { Badge, Button } from '@easydesign/design-system';
import { useShellEnvironment } from '../../ShellEnvironment';

const NOTIFICATION_COUNT_CAP = 99;

export interface ShellNotificationBadgeProps {
	showZero?: boolean;
}

export function ShellNotificationBadge({ showZero = false }: ShellNotificationBadgeProps) {
	const { notifications, translate, analytics } = useShellEnvironment();
	const { unreadCount, openInbox } = notifications;

	if (!showZero && unreadCount === 0) {
		return null;
	}

	const countLabel =
		unreadCount > NOTIFICATION_COUNT_CAP ? `${NOTIFICATION_COUNT_CAP}+` : String(unreadCount);
	const title = translate('shell.notifications.openInbox', 'Notifications');

	return (
		<Button
			title={title}
			variant="ghost"
			size="sm"
			tone="neutral"
			onPress={() => {
				analytics.track('shell.notifications.openInbox', { unreadCount });
				openInbox?.();
			}}
			rightIcon={
				<Badge
					label={countLabel}
					variant={unreadCount > 0 ? 'info' : 'neutral'}
					size="sm"
					accessibilityLabel={translate(
						'shell.notifications.unreadCount',
						`${countLabel} unread notifications`,
					)}
				/>
			}
			accessibilityLabel={`${title}: ${countLabel}`}
		/>
	);
}
