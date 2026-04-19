import { authService } from './authService';
import { AppError, NetworkError } from '@/src/errors';
import { supabase } from '@/src/config/supabase';

jest.mock('@/src/config/supabase', () => ({
	supabase: {
		auth: {
			signUp: jest.fn(),
			signInWithPassword: jest.fn(),
			signInWithOtp: jest.fn(),
			verifyOtp: jest.fn(),
			signOut: jest.fn(),
			getSession: jest.fn(),
			refreshSession: jest.fn(),
			onAuthStateChange: jest.fn(),
		},
	},
}));

describe('authService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('signUp calls supabase.auth.signUp', async () => {
		const mockData = { user: { id: '1' }, session: null };
		(supabase.auth.signUp as jest.Mock).mockResolvedValue({ data: mockData, error: null });

		const result = await authService.signUp('test@example.com', 'password');
		expect(supabase.auth.signUp).toHaveBeenCalledWith({
			email: 'test@example.com',
			password: 'password',
		});
		expect(result).toEqual(mockData);
	});

	it('signIn calls supabase.auth.signInWithPassword', async () => {
		const mockData = { user: { id: '1' }, session: { access_token: 'abc' } };
		(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
			data: mockData,
			error: null,
		});

		const result = await authService.signIn('test@example.com', 'password');
		expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
			email: 'test@example.com',
			password: 'password',
		});
		expect(result).toEqual(mockData);
	});

	it('getSession returns the current session', async () => {
		const mockSession = { access_token: 'abc' };
		(supabase.auth.getSession as jest.Mock).mockResolvedValue({
			data: { session: mockSession },
			error: null,
		});

		const result = await authService.getSession();
		expect(result).toEqual(mockSession);
	});

	it('getSession throws AppError on error', async () => {
		(supabase.auth.getSession as jest.Mock).mockResolvedValue({
			data: { session: null },
			error: { message: 'Session failed', status: 500 },
		});

		await expect(authService.getSession()).rejects.toBeInstanceOf(AppError);
	});

	it('handles auth errors — wraps into AppError', async () => {
		const mockError = { message: 'Invalid credentials' };
		(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
			data: null,
			error: mockError,
		});

		await expect(authService.signIn('test@example.com', 'wrong')).rejects.toBeInstanceOf(
			AppError,
		);
		await expect(authService.signIn('test@example.com', 'wrong')).rejects.toMatchObject({
			message: 'Invalid credentials',
			code: 'AUTH_ERROR',
		});
	});

	it('wraps network errors (status=0) as NetworkError', async () => {
		(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
			data: null,
			error: { message: 'network request failed', status: 0 },
		});

		await expect(authService.signIn('a@b.com', 'pw')).rejects.toBeInstanceOf(NetworkError);
	});

	it('wraps errors containing "network" in message as NetworkError', async () => {
		(supabase.auth.signUp as jest.Mock).mockResolvedValue({
			data: null,
			error: { message: 'Network timeout occurred' },
		});

		await expect(authService.signUp('a@b.com', 'pw')).rejects.toBeInstanceOf(NetworkError);
	});

	it('sendOtp maps unsupported phone provider to a helpful user message', async () => {
		(supabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({
			error: { message: 'Unsupported phone provider' },
		});

		await expect(authService.sendOtp('+919876543210')).rejects.toMatchObject({
			message: 'Unsupported phone provider',
			code: 'AUTH_ERROR',
			userMessage:
				'Phone OTP is not enabled for this Supabase project. Enable Phone auth and configure an SMS provider in Supabase before trying again.',
		});
	});

	it('signOut calls supabase.auth.signOut and resolves void', async () => {
		(supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

		const result = await authService.signOut();

		expect(supabase.auth.signOut).toHaveBeenCalled();
		expect(result).toBeUndefined();
	});

	it('signOut throws AppError when supabase returns an error', async () => {
		(supabase.auth.signOut as jest.Mock).mockResolvedValue({
			error: { message: 'Sign out failed' },
		});

		await expect(authService.signOut()).rejects.toBeInstanceOf(AppError);
	});

	it('onAuthStateChange passes callback to supabase and returns subscription', () => {
		const mockSub = { data: { subscription: { unsubscribe: jest.fn() } } };
		(supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue(mockSub);

		const callback = jest.fn();
		const result = authService.onAuthStateChange(callback);

		expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(callback);
		expect(result).toEqual(mockSub);
	});

	it('signIn with rejected promise propagates as error', async () => {
		(supabase.auth.signInWithPassword as jest.Mock).mockRejectedValue(
			new Error('Network request failed'),
		);

		await expect(authService.signIn('test@example.com', 'pass')).rejects.toBeDefined();
	});

	// ─── refreshSession ───────────────────────────────────────────────────────
	it('refreshSession returns session on success', async () => {
		const mockSession = { access_token: 'refreshed' };
		(supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
			data: { session: mockSession },
			error: null,
		});

		const result = await authService.refreshSession();
		expect(result).toEqual(mockSession);
	});

	it('refreshSession throws AppError on auth error (terminal, no retry)', async () => {
		(supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
			data: { session: null },
			error: { message: 'Refresh token expired', status: 401 },
		});

		await expect(authService.refreshSession()).rejects.toBeInstanceOf(AppError);
	});
});
