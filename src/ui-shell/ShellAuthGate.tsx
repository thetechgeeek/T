import React, { useEffect } from 'react';

export interface ShellAuthGateProps {
	children: React.ReactNode;
	loading: boolean;
	isAuthenticated: boolean;
	inAuthArea: boolean;
	onAuthRequired: () => void;
	onAuthenticated: () => void;
	initialize?: () => Promise<void> | void;
	skip?: boolean;
}

export function ShellAuthGate({
	children,
	loading,
	isAuthenticated,
	inAuthArea,
	onAuthRequired,
	onAuthenticated,
	initialize,
	skip = false,
}: ShellAuthGateProps) {
	useEffect(() => {
		if (skip || !initialize) {
			return;
		}

		void initialize();
	}, [initialize, skip]);

	useEffect(() => {
		if (loading || skip) {
			return;
		}

		if (!isAuthenticated && !inAuthArea) {
			onAuthRequired();
			return;
		}

		if (isAuthenticated && inAuthArea) {
			onAuthenticated();
		}
	}, [inAuthArea, isAuthenticated, loading, onAuthenticated, onAuthRequired, skip]);

	return <>{children}</>;
}
