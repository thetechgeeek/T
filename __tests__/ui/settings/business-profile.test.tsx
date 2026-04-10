import React from 'react';
import { fireEvent, waitFor, act } from '@testing-library/react-native';
import { renderWithTheme } from '../../utils/renderWithTheme';
import BusinessProfileScreen from '@/app/(app)/settings/business-profile';

const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
	useRouter: () => ({ back: mockBack, push: mockPush }),
}));

const mockFetch = jest.fn();
const mockUpsert = jest.fn();

jest.mock('@/src/services/businessProfileService', () => ({
	businessProfileService: {
		fetch: jest.fn().mockImplementation(() => mockFetch()),
		upsert: jest.fn().mockImplementation(() => mockUpsert()),
	},
}));

const existingProfile = {
	id: 'abc123',
	business_name: 'Sharma Tiles',
	phone: '+919876543210',
	gstin: '29AABCT1332L1ZV',
	address: '12, MG Road',
	city: 'Jaipur',
	state: 'Rajasthan',
	invoice_prefix: 'INV-',
	invoice_sequence: 5,
};

describe('BusinessProfileScreen (P1.5)', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockFetch.mockResolvedValue(existingProfile);
		mockUpsert.mockResolvedValue({});
	});

	it('renders Business Profile heading', async () => {
		const { getByTestId } = renderWithTheme(<BusinessProfileScreen />);
		await waitFor(() => {
			expect(getByTestId('business-name-field')).toBeTruthy();
		});
	});

	it('loads existing profile data into form fields', async () => {
		const { getByTestId } = renderWithTheme(<BusinessProfileScreen />);
		await waitFor(() => {
			expect(getByTestId('business-name-field').props.value).toBe('Sharma Tiles');
		});
		expect(getByTestId('gstin-field').props.value).toBe('29AABCT1332L1ZV');
		expect(getByTestId('city-field').props.value).toBe('Jaipur');
	});

	it('shows Save button', async () => {
		const { getByTestId } = renderWithTheme(<BusinessProfileScreen />);
		await waitFor(() => {
			expect(getByTestId('save-button')).toBeTruthy();
		});
	});

	it('calls businessProfileService.upsert on Save', async () => {
		const { getByTestId } = renderWithTheme(<BusinessProfileScreen />);
		await waitFor(() => {
			expect(getByTestId('business-name-field')).toBeTruthy();
		});
		fireEvent.changeText(getByTestId('business-name-field'), 'Updated Tiles Co');
		await act(async () => {
			fireEvent.press(getByTestId('save-button'));
		});
		await waitFor(() => {
			expect(mockUpsert).toHaveBeenCalled();
		});
	});

	it('shows loading state when profile is fetching', () => {
		// Delay the fetch so we catch the loading state
		mockFetch.mockImplementation(
			() => new Promise((resolve) => setTimeout(() => resolve(null), 5000)),
		);
		const { getByTestId } = renderWithTheme(<BusinessProfileScreen />);
		expect(getByTestId('loading-indicator')).toBeTruthy();
	});

	it('shows error state when fetch fails', async () => {
		mockFetch.mockRejectedValue(new Error('Network error'));
		const { getByTestId } = renderWithTheme(<BusinessProfileScreen />);
		await waitFor(() => {
			expect(getByTestId('error-message')).toBeTruthy();
		});
	});
});
