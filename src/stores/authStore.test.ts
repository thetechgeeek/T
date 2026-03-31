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
			user: { id: '1' } as any,
			session: {} as any,
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
		useAuthStore.setState({ user: makeUser() as any, isAuthenticated: true });
		(authService.signOut as jest.Mock).mockResolvedValue(undefined);

		await useAuthStore.getState().logout();

		expect(authService.signOut).toHaveBeenCalled();
		expect(useAuthStore.getState().isAuthenticated).toBe(false);
	});
});
