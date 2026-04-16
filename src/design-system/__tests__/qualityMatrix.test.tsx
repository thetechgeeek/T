import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import DesignLibraryScreen from '../DesignLibraryScreen';
import { getDesignSystemCopy, type DesignSystemLocale } from '../copy';

function renderDesignSystem(locale: DesignSystemLocale, mode: 'light' | 'dark' = 'light') {
	return render(
		<ThemeProvider initialMode={mode} persist={false}>
			<DesignLibraryScreen locale={locale} />
		</ThemeProvider>,
	);
}

describe('design-system quality matrix', () => {
	it('renders localized pseudo copy without losing critical sections', () => {
		const copy = getDesignSystemCopy('pseudo');
		const { getByText } = renderDesignSystem('pseudo', 'dark');

		expect(getByText(copy.hero.title)).toBeTruthy();
		expect(getByText(copy.qualityBar.title)).toBeTruthy();
		expect(getByText(copy.runtimeTheming.title)).toBeTruthy();
		expect(getByText(copy.presentationModes.title)).toBeTruthy();
		expect(getByText(copy.stateProof.title)).toBeTruthy();
		expect(getByText(copy.componentInventory.title)).toBeTruthy();
		expect(getByText(copy.checklistExplorer.title)).toBeTruthy();
	});

	it('renders rtl locale metadata and exposes a stable root accessibility label', () => {
		const copy = getDesignSystemCopy('ar');
		const { getByText, getByLabelText } = renderDesignSystem('ar');

		expect(getByLabelText(copy.screen.accessibilityLabel)).toBeTruthy();
		expect(getByText(copy.meta.localeBadge)).toBeTruthy();
		expect(getByText(copy.meta.directionBadge)).toBeTruthy();
	});

	it('keeps primary controls accessible in english mode', () => {
		const copy = getDesignSystemCopy('en');
		const { getByLabelText, getByText } = renderDesignSystem('en');

		expect(getByLabelText(copy.runtimeTheming.cycleLookAndFeel)).toBeTruthy();
		expect(getByLabelText(copy.componentGallery.buttons.primary)).toBeTruthy();
		expect(getByLabelText(copy.componentGallery.iconButtons.search)).toBeTruthy();
		expect(getByText(copy.stateProof.noMedia.title)).toBeTruthy();
		expect(getByText(copy.presentationModes.relaxed.title)).toBeTruthy();
	});
});
