import React from 'react';
import { View } from 'react-native';
import { Badge, Button, ThemedText } from '@easydesign/design-system';
import { useThemeTokens } from '@easydesign/design-system/foundation';
import { useShellEnvironment } from '../../ShellEnvironment';

export function ShellTenantSwitcher() {
	const { tenant, translate, analytics } = useShellEnvironment();
	const { current, switchTenant } = tenant;
	const { s } = useThemeTokens();

	return (
		<View
			style={{
				alignItems: 'flex-start',
				gap: s.xs,
			}}
		>
			<ThemedText variant="captionBold" color="muted">
				{translate('shell.tenant.label', 'Workspace')}
			</ThemedText>
			<ThemedText variant="bodyStrong">{current.name}</ThemedText>
			{current.accentLabel ? (
				<Badge
					label={current.accentLabel}
					variant="neutral"
					size="sm"
					accessibilityLabel={current.accentLabel}
				/>
			) : null}
			{switchTenant && current.canSwitch ? (
				<Button
					title={translate('shell.tenant.switchAction', 'Switch workspace')}
					variant="ghost"
					size="sm"
					onPress={() => {
						analytics.track('shell.tenant.switch');
						switchTenant();
					}}
				/>
			) : null}
		</View>
	);
}
