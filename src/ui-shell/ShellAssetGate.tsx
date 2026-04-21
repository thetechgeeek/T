import React from 'react';
import { View } from 'react-native';
import { SkeletonBlock, ThemedText } from '@easydesign/design-system';
import { useThemeTokens } from '@easydesign/design-system/foundation';
import { useShellEnvironment } from './ShellEnvironment';

export interface ShellAssetGateProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

export function ShellAssetGate({ children, fallback }: ShellAssetGateProps) {
	const { assets, translate } = useShellEnvironment();
	const { s } = useThemeTokens();

	if (assets.ready) {
		return <>{children}</>;
	}

	if (fallback) {
		return <>{fallback}</>;
	}

	return (
		<View
			style={{
				paddingHorizontal: s.lg,
				paddingVertical: s.xl,
				gap: s.md,
			}}
		>
			<ThemedText variant="sectionTitle">
				{translate('shell.assets.loadingTitle', 'Preparing the workspace')}
			</ThemedText>
			<ThemedText variant="body" color="muted">
				{translate(
					'shell.assets.loadingDescription',
					'Fonts, icons, and shell assets are still loading. The shell will appear as soon as they are ready.',
				)}
			</ThemedText>
			<SkeletonBlock height={56} />
			<SkeletonBlock height={96} />
		</View>
	);
}
