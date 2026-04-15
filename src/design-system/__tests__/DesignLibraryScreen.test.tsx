import React from 'react';
import { renderWithTheme } from '@/__tests__/utils/renderWithTheme';
import DesignLibraryScreen from '../DesignLibraryScreen';

describe('DesignLibraryScreen', () => {
	it('renders the design library hero and checklist stats', () => {
		const { getByText, getAllByText } = renderWithTheme(<DesignLibraryScreen />);

		expect(getByText('Design System Workbench')).toBeTruthy();
		expect(getByText('All checklist items')).toBeTruthy();
		expect(getByText('1239')).toBeTruthy();
		expect(getAllByText('Common + Mobile').length).toBeGreaterThan(0);
		expect(getByText('909')).toBeTruthy();
		expect(getByText('Supported Component Catalog')).toBeTruthy();
		expect(getAllByText('Button').length).toBeGreaterThan(0);
	});
});
