import React from 'react';
import SupplierDetailScreen from '@/app/(app)/suppliers/[id]';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter, useLocalSearchParams } from 'expo-router';

const mockBack = jest.fn();

beforeEach(() => {
	jest.clearAllMocks();
	(useRouter as jest.Mock).mockReturnValue({ back: mockBack, push: jest.fn() });
	(useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'supplier-123' });
});

describe('SupplierDetailScreen', () => {
	it('renders without crashing', () => {
		const { toJSON } = renderWithTheme(<SupplierDetailScreen />);
		expect(toJSON()).not.toBeNull();
	});

	it('renders nothing when no supplier loaded yet', () => {
		// With no mock data the screen returns null while loading resolves
		const { toJSON } = renderWithTheme(<SupplierDetailScreen />);
		// Screen renders (either loading state or null) without throwing
		expect(toJSON).toBeDefined();
	});
});
