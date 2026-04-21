import { createInventoryShellEnvironment } from '../createInventoryShellEnvironment';

describe('createInventoryShellEnvironment', () => {
	const baseInput = {
		translate: (key: string, fallback?: string) => fallback ?? key,
		isConnected: true,
		syncStatus: {
			lastSyncedAt: null,
			isSyncing: false,
			pendingCount: 0,
		},
		notifications: {
			items: [
				{
					id: 'notification-1',
					title: 'Low stock',
					body: 'Adhesive stock is running low.',
					type: 'low_stock',
					read: false,
					metadata: {},
					created_at: '2026-04-21T00:00:00.000Z',
				},
			],
			unreadCount: 1,
			loading: false,
		},
		pushRoute: jest.fn(),
		replaceRoute: jest.fn(),
	};

	it('maps inventory notifications and routes into shell adapters', () => {
		const environment = createInventoryShellEnvironment({
			...baseInput,
			width: 1024,
		});

		expect(environment.notifications.items).toEqual([
			expect.objectContaining({
				id: 'notification-1',
				category: 'Low Stock',
				severity: 'warning',
				read: false,
			}),
		]);
		expect(environment.deepLinks.resolve('/inventory/add')).toEqual({
			status: 'handled',
			href: '/inventory/add',
		});
		expect(environment.adaptiveRuntime).toEqual({
			widthClass: 'expanded',
			layoutVariant: 'split-pane',
			isTablet: true,
		});
	});

	it('marks protected routes unauthorized and restores auth through session adapters', () => {
		const replaceRoute = jest.fn();
		const validateOnResume = jest.fn();
		const environment = createInventoryShellEnvironment({
			...baseInput,
			width: 480,
			replaceRoute,
			onValidateSession: validateOnResume,
		});

		expect(environment.deepLinks.resolve('/settings/users')).toEqual(
			expect.objectContaining({
				status: 'unauthorized',
			}),
		);
		expect(environment.adaptiveRuntime).toEqual({
			widthClass: 'compact',
			layoutVariant: 'single-pane',
			isTablet: false,
		});

		environment.session.reauthenticate?.();
		environment.session.recoverSession?.();
		void environment.session.validateOnResume?.();

		expect(replaceRoute).toHaveBeenCalledWith('/(auth)/login');
		expect(validateOnResume).toHaveBeenCalledTimes(1);
	});
});
