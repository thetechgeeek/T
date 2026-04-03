import { useAuthStore } from './authStore';
import { authService } from '@/src/services/authService';
import { makeUser, makeSession } from '../../__tests__/fixtures/authFixtures';

jest.mock('@/src/services/authService', () => ({
	authService: {
		signIn: jest.fn(),
		signUp: jest.fn(),
		signOut: jest.fn(),
		getSession: jest.fn(),
		onAuthStateChange: jest.fn(),
	},
}));

describe('authStore', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		useAuthStore.setState({
			user: null,
			session: null,
			loading: false,
			isAuthenticated: false,
		});
	});

	it('initialize sets state from session', async () => {
		const mockSession = { user: { id: '1' } };
		(authService.getSession as jest.Mock).mockResolvedValue(mockSession);
		(authService.onAuthStateChange as jest.Mock).mockReturnValue({
			data: { subscription: { unsubscribe: jest.fn() } },
		});

		await useAuthStore.getState().initialize();

		const state = useAuthStore.getState();
		expect(state.session).toEqual(mockSession);
		expect(state.user).toEqual(mockSession.user);
		expect(state.isAuthenticated).toBe(true);
		expect(state.loading).toBe(false);
	});

	it('login updates state on success', async () => {
		const mockData = { user: { id: '1' }, session: { access_token: 'abc' } };
		(authService.signIn as jest.Mock).mockResolvedValue(mockData);

		await useAuthStore.getState().login('test@example.com', 'password');

		const state = useAuthStore.getState();
		expect(state.user).toEqual(mockData.user);
		expect(state.isAuthenticated).toBe(true);
		expect(state.loading).toBe(false);
	});

	it('logout resets the state', async () => {
		useAuthStore.setState({
			user: { id: '1' } as unknown as ReturnType<typeof makeUser>,
			session: {} as unknown as ReturnType<typeof makeSession>,
			isAuthenticated: true,
		});

		await useAuthStore.getState().logout();

		const state = useAuthStore.getState();
		expect(state.user).toBeNull();
		expect(state.isAuthenticated).toBe(false);
	});

	it('login failure keeps user null and isAuthenticated false', async () => {
		(authService.signIn as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

		try {
			await useAuthStore.getState().login('a@b.com', 'wrong');
		} catch {
			// may rethrow
		}

		const state = useAuthStore.getState();
		expect(state.isAuthenticated).toBe(false);
		expect(state.user).toBeNull();
		expect(state.loading).toBe(false);
	});

	it('login loading state — true during login, false after', async () => {
		let resolveP!: (v: unknown) => void;
		const p = new Promise((r) => {
			resolveP = r;
		});
		(authService.signIn as jest.Mock).mockReturnValue(p);

		const loginPromise = useAuthStore.getState().login('a@b.com', 'password');
		expect(useAuthStore.getState().loading).toBe(true);

		resolveP({ user: makeUser(), session: makeSession() });
		await loginPromise;

		expect(useAuthStore.getState().loading).toBe(false);
	});

	it('register calls authService.signUp and sets user', async () => {
		const user = makeUser();
		const session = makeSession();
		(authService.signUp as jest.Mock).mockResolvedValue({ user, session });

		await useAuthStore.getState().register('a@b.com', 'password');

		expect(authService.signUp).toHaveBeenCalledWith('a@b.com', 'password');
		expect(useAuthStore.getState().user).not.toBeNull();
	});

	it('logout calls authService.signOut and sets isAuthenticated false', async () => {
		useAuthStore.setState({
			user: makeUser() as unknown as ReturnType<typeof makeUser>,
			isAuthenticated: true,
		});
		(authService.signOut as jest.Mock).mockResolvedValue(undefined);

		await useAuthStore.getState().logout();

		expect(authService.signOut).toHaveBeenCalled();
		expect(useAuthStore.getState().isAuthenticated).toBe(false);
	});

	// ─── initialize: null session ─────────────────────────────────────────────

	it('initialize handles null session gracefully — user stays null, not authenticated', async () => {
		(authService.getSession as jest.Mock).mockResolvedValue(null);
		(authService.onAuthStateChange as jest.Mock).mockReturnValue({
			data: { subscription: { unsubscribe: jest.fn() } },
		});

		await useAuthStore.getState().initialize();

		const state = useAuthStore.getState();
		expect(state.session).toBeNull();
		expect(state.user).toBeNull();
		expect(state.isAuthenticated).toBe(false);
		expect(state.loading).toBe(false);
	});

	it('initialize sets loading=false after completing (regardless of session)', async () => {
		(authService.getSession as jest.Mock).mockResolvedValue(null);
		(authService.onAuthStateChange as jest.Mock).mockReturnValue({
			data: { subscription: { unsubscribe: jest.fn() } },
		});

		await useAuthStore.getState().initialize();

		expect(useAuthStore.getState().loading).toBe(false);
	});

	// ─── login ────────────────────────────────────────────────────────────────

	it('login: loading=false after signIn rejects (no stuck spinner)', async () => {
		(authService.signIn as jest.Mock).mockRejectedValue(new Error('Wrong password'));

		try {
			await useAuthStore.getState().login('a@b.com', 'wrong');
		} catch {
			// login re-throws after finally
		}

		// loading is cleared in the finally block
		expect(useAuthStore.getState().loading).toBe(false);
		// session and user remain null
		expect(useAuthStore.getState().user).toBeNull();
		expect(useAuthStore.getState().isAuthenticated).toBe(false);
	});

	it('login sets session from signIn response', async () => {
		const mockSession = makeSession();
		const mockUser = makeUser();
		(authService.signIn as jest.Mock).mockResolvedValue({
			user: mockUser,
			session: mockSession,
		});

		await useAuthStore.getState().login('a@b.com', 'password');

		expect(useAuthStore.getState().session).toEqual(mockSession);
		expect(useAuthStore.getState().user).toEqual(mockUser);
	});

	// ─── logout ───────────────────────────────────────────────────────────────

	it('logout clears session and user', async () => {
		useAuthStore.setState({
			user: makeUser() as any,
			session: makeSession() as any,
			isAuthenticated: true,
		});
		(authService.signOut as jest.Mock).mockResolvedValue(undefined);

		await useAuthStore.getState().logout();

		const state = useAuthStore.getState();
		expect(state.session).toBeNull();
		expect(state.user).toBeNull();
	});

	it('logout clears auth state even when signOut throws', async () => {
		useAuthStore.setState({
			user: makeUser() as any,
			session: makeSession() as any,
			isAuthenticated: true,
		});
		(authService.signOut as jest.Mock).mockRejectedValue(new Error('Network error'));

		// logout swallows signOut errors and still clears local state
		await useAuthStore.getState().logout();

		const state = useAuthStore.getState();
		expect(state.user).toBeNull();
		expect(state.session).toBeNull();
		expect(state.isAuthenticated).toBe(false);
	});

	// ─── register ─────────────────────────────────────────────────────────────

	it('register loading lifecycle', async () => {
		let resolve!: (v: unknown) => void;
		const p = new Promise((r) => {
			resolve = r;
		});
		(authService.signUp as jest.Mock).mockReturnValue(p);

		const regPromise = useAuthStore.getState().register('a@b.com', 'password');
		expect(useAuthStore.getState().loading).toBe(true);

		resolve({ user: makeUser(), session: makeSession() });
		await regPromise;

		expect(useAuthStore.getState().loading).toBe(false);
	});

	it('register failure sets error and keeps user null', async () => {
		(authService.signUp as jest.Mock).mockRejectedValue(new Error('Email in use'));

		try {
			await useAuthStore.getState().register('a@b.com', 'pass');
		} catch {
			// may rethrow
		}

		expect(useAuthStore.getState().user).toBeNull();
		expect(useAuthStore.getState().loading).toBe(false);
	});
});
