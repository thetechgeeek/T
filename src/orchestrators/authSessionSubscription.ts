let unsubscribeAuthSession: (() => void) | null = null;

export function setAuthSessionUnsubscribe(unsubscribe: () => void): void {
	unsubscribeAuthSession?.();
	unsubscribeAuthSession = unsubscribe;
}

export function stopAuthSessionSubscription(): void {
	unsubscribeAuthSession?.();
	unsubscribeAuthSession = null;
}

export function hasAuthSessionSubscription(): boolean {
	return unsubscribeAuthSession !== null;
}
