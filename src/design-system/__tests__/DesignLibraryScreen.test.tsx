import React from 'react';
import { act } from '@testing-library/react-native';
import { renderWithTheme } from '@/__tests__/utils/renderWithTheme';
import DesignLibraryScreen from '../DesignLibraryScreen';
import { DESIGN_LIBRARY_OVERVIEW } from '../catalog';

describe('DesignLibraryScreen', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	});

	it('renders the premium-quality workbench sections and generated counts', async () => {
		const { getByText, queryByText } = renderWithTheme(<DesignLibraryScreen />);
		await act(async () => {
			jest.runOnlyPendingTimers();
		});

		expect(getByText('Design System Workbench')).toBeTruthy();
		expect(getByText('Enterprise x Premium Quality Bar')).toBeTruthy();
		expect(getByText('Relaxed vs Operational Presentation')).toBeTruthy();
		expect(getByText('Forms & validation')).toBeTruthy();
		expect(getByText('State Proof Deck')).toBeTruthy();
		expect(getByText(String(DESIGN_LIBRARY_OVERVIEW.total))).toBeTruthy();
		expect(getByText(String(DESIGN_LIBRARY_OVERVIEW.commonMobile))).toBeTruthy();
		expect(getByText('Supported Component Catalog')).toBeTruthy();
		expect(getByText('Checklist Explorer')).toBeTruthy();
		expect(getByText(`All (${DESIGN_LIBRARY_OVERVIEW.total})`)).toBeTruthy();
		expect(queryByText('Example stories')).toBeNull();
		expect(queryByText('Prop table')).toBeNull();
	});
});
