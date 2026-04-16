import React from 'react';
import { renderWithTheme } from '@/__tests__/utils/renderWithTheme';
import DesignLibraryScreen from '../DesignLibraryScreen';
import { DESIGN_LIBRARY_OVERVIEW } from '../catalog';

describe('DesignLibraryScreen', () => {
	it('renders the premium-quality workbench sections and generated counts', () => {
		const { getByText } = renderWithTheme(<DesignLibraryScreen />);

		expect(getByText('Design System Workbench')).toBeTruthy();
		expect(getByText('Enterprise x Premium Quality Bar')).toBeTruthy();
		expect(getByText('Relaxed vs Operational Presentation')).toBeTruthy();
		expect(getByText('State Proof Deck')).toBeTruthy();
		expect(getByText(String(DESIGN_LIBRARY_OVERVIEW.total))).toBeTruthy();
		expect(getByText(String(DESIGN_LIBRARY_OVERVIEW.commonMobile))).toBeTruthy();
		expect(getByText('Supported Component Catalog')).toBeTruthy();
		expect(getByText('Checklist Explorer')).toBeTruthy();
		expect(getByText(`All (${DESIGN_LIBRARY_OVERVIEW.total})`)).toBeTruthy();
	});
});
