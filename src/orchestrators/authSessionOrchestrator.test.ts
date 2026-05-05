import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import {
	startAuthSessionOrchestrator,
	stopAuthSessionOrchestrator,
	validateAuthSession,
} from './authSessionOrchestrator';
import { hasAuthSessionSubscription } from './authSessionSubscription';

jest.mock('../services/authService', () => ({
	authService: {
		getSession: jest.fn(),
		onAuthStateChange: jest.fn(),
		signOut: jest.fn(),
	},
}));

const mockedAuthService = authService as jest.Mocked<typeof authService>;

function makeSession(id = 'user-1') {
	return { user: { id } } as Session;
}

describe('authSessionOrchestrator', () => {
	let unsubscribe: jest.Mock;
	let authHandler: ((event: AuthChangeEvent, session: Session | null) => void) | null;

	beforeEach(() => {
		stopAuthSessionOrchestrator();
		jest.clearAllMocks();
		unsubscribe = jest.fn();
		authHandler = null;
		useAuthStore.setState({
			user: null,
			session: null,
			loading: true,
			isAuthenticated: false,
			error: null,
		});
		mockedAuthService.onAuthStateChange.mockImplementation((handler) => {
			authHandler = handler;
			return {
				data: {
					subscription: {
						id: 'auth-subscription',
						callback: handler,
						unsubscribe,
					},
				},
			};
		});
	});

	afterEach(() => {
		stopAuthSessionOrchestrator();
	});

	it('validates the current session without registering a listener', async () => {
		const session = makeSession();
		mockedAuthService.getSession.mockResolvedValue(session);

		await validateAuthSession();

		expect(useAuthStore.getState().session).toBe(session);
		expect(useAuthStore.getState().isAuthenticated).toBe(true);
		expect(mockedAuthService.onAuthStateChange).not.toHaveBeenCalled();
	});

	it('starts exactly one listener across duplicate starts', async () => {
		mockedAuthService.getSession.mockResolvedValue(makeSession());

		await Promise.all([startAuthSessionOrchestrator(), startAuthSessionOrchestrator()]);

		expect(mockedAuthService.onAuthStateChange).toHaveBeenCalledTimes(1);
		expect(hasAuthSessionSubscription()).toBe(true);
	});

	it('applies auth events and tears down the listener', async () => {
		mockedAuthService.getSession.mockResolvedValue(null);

		await startAuthSessionOrchestrator();
		authHandler?.('SIGNED_IN', makeSession('user-2'));

		expect(useAuthStore.getState().user?.id).toBe('user-2');

		stopAuthSessionOrchestrator();

		expect(unsubscribe).toHaveBeenCalledTimes(1);
		expect(hasAuthSessionSubscription()).toBe(false);
	});

	it('logout stops the subscription before clearing local state', async () => {
		mockedAuthService.getSession.mockResolvedValue(makeSession());
		mockedAuthService.signOut.mockResolvedValue(undefined);

		await startAuthSessionOrchestrator();
		await useAuthStore.getState().logout();

		expect(unsubscribe).toHaveBeenCalledTimes(1);
		expect(hasAuthSessionSubscription()).toBe(false);
		expect(useAuthStore.getState().isAuthenticated).toBe(false);
	});
});
