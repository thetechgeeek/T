import { act, renderHook } from '@testing-library/react-native';
import { useAuthStore } from '@/src/stores/authStore';
import { businessProfileService } from '@/src/services/businessProfileService';
import { useSetupFlow } from './useSetupFlow';
import {
	buildBusinessProfileSetupPayload,
	canAdvanceSetupStep,
	createInitialWizardData,
} from './setupFlowModel';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
	useRouter: jest.fn(() => ({ replace: mockReplace })),
}));

jest.mock('@/src/stores/authStore', () => ({
	useAuthStore: jest.fn(),
}));

jest.mock('@/src/services/businessProfileService', () => ({
	businessProfileService: {
		upsert: jest.fn(),
	},
}));

describe('useSetupFlow', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(useAuthStore as unknown as jest.Mock).mockReturnValue({
			user: { phone: '+919876543210' },
		});
		(businessProfileService.upsert as jest.Mock).mockResolvedValue(undefined);
	});

	it('keeps setup step validation in the feature flow', () => {
		const draft = createInitialWizardData();
		expect(canAdvanceSetupStep(1, draft)).toBe(false);

		const valid = { ...draft, businessName: 'Tile Mart', ownerName: 'Rupesh' };
		expect(canAdvanceSetupStep(1, valid)).toBe(true);
		expect(canAdvanceSetupStep(2, draft)).toBe(true);
	});

	it('builds the service payload without screen-local request shaping', () => {
		const payload = buildBusinessProfileSetupPayload({
			...createInitialWizardData(),
			businessName: 'Tile Mart',
			phone: '9876543210',
			invoicePrefix: '',
			invoiceStartNumber: '7',
		});

		expect(payload).toEqual(
			expect.objectContaining({
				business_name: 'Tile Mart',
				phone: '+919876543210',
				invoice_prefix: 'INV-',
				invoice_sequence: 7,
			}),
		);
	});

	it('submits setup through the business profile service and navigates to the app', async () => {
		const { result } = renderHook(() => useSetupFlow());

		act(() => {
			result.current.update('businessName', 'Tile Mart');
			result.current.update('ownerName', 'Rupesh');
		});

		await act(async () => {
			await result.current.handleFinish();
		});

		expect(businessProfileService.upsert).toHaveBeenCalledWith(
			expect.objectContaining({ business_name: 'Tile Mart' }),
		);
		expect(mockReplace).toHaveBeenCalledWith('/(app)/(tabs)');
	});
});
