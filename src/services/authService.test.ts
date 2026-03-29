import { authService } from './authService';
import { AppError } from '@/src/errors';
import { supabase } from '@/src/config/supabase';

jest.mock('@/src/config/supabase', () => ({
	supabase: {
		auth: {
			signUp: jest.fn(),
			signInWithPassword: jest.fn(),
			signOut: jest.fn(),
			getSession: jest.fn(),
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
});
