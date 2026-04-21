import React from 'react';
import { SkeletonBlock } from '@easydesign/design-system';
import { useShellEnvironment } from '../../ShellEnvironment';

export interface ShellFeatureFlagBoundaryProps {
	flag: string;
	children: React.ReactNode;
	fallback?: React.ReactNode;
	loadingFallback?: React.ReactNode;
}

export function ShellFeatureFlagBoundary({
	flag,
	children,
	fallback = null,
	loadingFallback,
}: ShellFeatureFlagBoundaryProps) {
	const { featureFlags } = useShellEnvironment();

	if (featureFlags.isResolving) {
		return <>{loadingFallback ?? <SkeletonBlock height={72} />}</>;
	}

	if (!featureFlags.isEnabled(flag)) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
}
