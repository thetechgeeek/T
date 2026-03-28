import { useAuthStore } from './authStore';
import { authService } from '@/src/services/authService';

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
});
