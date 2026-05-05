import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import { getErrorMessage } from '../errors/AppError';
import {
	hasAuthSessionSubscription,
	setAuthSessionUnsubscribe,
	stopAuthSessionSubscription,
} from './authSessionSubscription';

let startPromise: Promise<void> | null = null;

function applySession(session: Session | null): void {
	useAuthStore.setState({
		session,
		user: session?.user ?? null,
		isAuthenticated: !!session,
		loading: false,
		error: null,
	});
}

function subscriptionUnsubscribe(
	result: ReturnType<typeof authService.onAuthStateChange>,
): () => void {
	return () => result.data.subscription.unsubscribe();
}

export async function validateAuthSession(): Promise<void> {
	try {
		const session = await authService.getSession();
		applySession(session);
	} catch (error: unknown) {
		useAuthStore.setState({ loading: false, error: getErrorMessage(error) });
	}
}

async function handleAuthStateChange(
	event: AuthChangeEvent,
	session: Session | null,
): Promise<void> {
	if (event === 'SIGNED_OUT') {
		applySession(null);
		return;
	}

	if (
		event === 'TOKEN_REFRESHED' ||
		event === 'SIGNED_IN' ||
		event === 'INITIAL_SESSION' ||
		session
	) {
		applySession(session);
		return;
	}

	await useAuthStore.getState().logout();
}

export async function startAuthSessionOrchestrator(): Promise<void> {
	if (startPromise) return startPromise;

	startPromise = (async () => {
		await validateAuthSession();
		if (!hasAuthSessionSubscription()) {
			setAuthSessionUnsubscribe(
				subscriptionUnsubscribe(authService.onAuthStateChange(handleAuthStateChange)),
			);
		}
	})();

	try {
		await startPromise;
	} finally {
		startPromise = null;
	}
}

export function stopAuthSessionOrchestrator(): void {
	stopAuthSessionSubscription();
	startPromise = null;
}
