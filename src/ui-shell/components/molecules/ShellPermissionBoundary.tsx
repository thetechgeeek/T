import React from 'react';
import { View } from 'react-native';
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	SkeletonBlock,
	ThemedText,
} from '@easydesign/design-system';
import { useThemeTokens } from '@easydesign/design-system/foundation';
import type { ShellPermissionResolution } from '../../ShellAdapters';
import { useShellEnvironment } from '../../ShellEnvironment';

export interface ShellPermissionBoundaryProps {
	capability: string;
	children?: React.ReactNode;
	loadingFallback?: React.ReactNode;
	deniedFallback?: React.ReactNode;
	maskedFallback?: React.ReactNode;
	limitedFallback?: React.ReactNode;
}

interface ShellPermissionFallbackProps {
	resolution: ShellPermissionResolution;
	capability: string;
}

function ShellPermissionFallback({ resolution, capability }: ShellPermissionFallbackProps) {
	const { permissions, translate } = useShellEnvironment();
	const { s } = useThemeTokens();

	const fallbackCopy = {
		denied: {
			title: translate('shell.permissions.deniedTitle', 'Access required'),
			description: translate(
				'shell.permissions.deniedDescription',
				'This part of the workspace is unavailable until the app grants access.',
			),
		},
		masked: {
			title: translate('shell.permissions.maskedTitle', 'Content hidden'),
			description: translate(
				'shell.permissions.maskedDescription',
				'The shell is masking this content until the permission adapter resolves it.',
			),
		},
		limited: {
			title: translate('shell.permissions.limitedTitle', 'Limited access'),
			description: translate(
				'shell.permissions.limitedDescription',
				'You can continue in a limited mode or ask the app for broader access.',
			),
		},
	};

	const copy =
		resolution.state === 'masked'
			? fallbackCopy.masked
			: resolution.state === 'limited'
				? fallbackCopy.limited
				: fallbackCopy.denied;
	const title = resolution.title ?? copy.title;
	const description = resolution.description ?? copy.description;
	const handleAction = resolution.onAction ?? (() => permissions.requestAccess?.(capability));
	const actionLabel =
		resolution.actionLabel ?? translate('shell.permissions.requestAction', 'Request access');

	return (
		<Card
			variant="outlined"
			padding="lg"
			accessibilityRole="summary"
			accessibilityLabel={title}
		>
			<CardHeader>
				<ThemedText variant="sectionTitle">{title}</ThemedText>
			</CardHeader>
			<CardBody>
				<ThemedText variant="body" color="muted">
					{description}
				</ThemedText>
			</CardBody>
			{handleAction ? (
				<CardFooter>
					<View style={{ marginTop: s.sm }}>
						<Button
							title={actionLabel}
							variant="secondary"
							onPress={handleAction}
							accessibilityLabel={actionLabel}
						/>
					</View>
				</CardFooter>
			) : null}
		</Card>
	);
}

function ShellPermissionLoadingFallback() {
	const { s } = useThemeTokens();

	return (
		<View style={{ gap: s.sm }}>
			<SkeletonBlock height={32} />
			<SkeletonBlock height={88} />
		</View>
	);
}

export function ShellPermissionBoundary({
	capability,
	children,
	loadingFallback,
	deniedFallback,
	maskedFallback,
	limitedFallback,
}: ShellPermissionBoundaryProps) {
	const { permissions } = useShellEnvironment();
	const resolution = permissions.resolve(capability);

	if (resolution.state === 'allowed') {
		return <>{children}</>;
	}

	if (resolution.state === 'loading') {
		return <>{loadingFallback ?? <ShellPermissionLoadingFallback />}</>;
	}

	if (resolution.state === 'masked') {
		return (
			<>
				{maskedFallback ?? (
					<ShellPermissionFallback capability={capability} resolution={resolution} />
				)}
			</>
		);
	}

	if (resolution.state === 'limited') {
		return (
			<>
				{limitedFallback ?? (
					<ShellPermissionFallback capability={capability} resolution={resolution} />
				)}
			</>
		);
	}

	return (
		<>
			{deniedFallback ?? (
				<ShellPermissionFallback capability={capability} resolution={resolution} />
			)}
		</>
	);
}
