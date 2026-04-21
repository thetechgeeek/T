import React from 'react';
import { Card, CardBody, CardHeader, ThemedText } from '@easydesign/design-system';
import { useShellEnvironment } from '../../ShellEnvironment';

export interface ShellDeepLinkGuardProps {
	url: string;
	children: React.ReactNode;
	invalidFallback?: React.ReactNode;
	unauthorizedFallback?: React.ReactNode;
}

export function ShellDeepLinkGuard({
	url,
	children,
	invalidFallback,
	unauthorizedFallback,
}: ShellDeepLinkGuardProps) {
	const { deepLinks, translate } = useShellEnvironment();
	const resolution = deepLinks.resolve(url);

	if (resolution.status === 'handled') {
		return <>{children}</>;
	}

	if (resolution.status === 'unauthorized') {
		return (
			<>
				{unauthorizedFallback ?? (
					<Card variant="outlined" padding="lg">
						<CardHeader>
							<ThemedText variant="sectionTitle">
								{translate('shell.deeplink.unauthorizedTitle', 'Access blocked')}
							</ThemedText>
						</CardHeader>
						<CardBody>
							<ThemedText variant="body" color="muted">
								{resolution.reason ??
									translate(
										'shell.deeplink.unauthorizedDescription',
										'The shell rejected this deep link because the current session cannot open it.',
									)}
							</ThemedText>
						</CardBody>
					</Card>
				)}
			</>
		);
	}

	return (
		<>
			{invalidFallback ?? (
				<Card variant="outlined" padding="lg">
					<CardHeader>
						<ThemedText variant="sectionTitle">
							{translate('shell.deeplink.invalidTitle', 'Link unavailable')}
						</ThemedText>
					</CardHeader>
					<CardBody>
						<ThemedText variant="body" color="muted">
							{resolution.reason ??
								translate(
									'shell.deeplink.invalidDescription',
									'The shell could not map this link to a safe destination.',
								)}
						</ThemedText>
					</CardBody>
				</Card>
			)}
		</>
	);
}
