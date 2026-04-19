import React from 'react';
import { act, render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import DesignLibraryScreen from '../DesignLibraryScreen';
import { getDesignSystemCopy, type DesignSystemLocale } from '../copy';

jest.setTimeout(15000);

function renderDesignSystem(
	locale: DesignSystemLocale,
	mode: 'light' | 'dark' = 'light',
	runtimeOverrides?: React.ComponentProps<typeof ThemeProvider>['runtimeOverrides'],
) {
	return render(
		<ThemeProvider initialMode={mode} persist={false} runtimeOverrides={runtimeOverrides}>
			<DesignLibraryScreen locale={locale} />
		</ThemeProvider>,
	);
}

describe('design-system quality matrix', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	});

	it('renders localized pseudo copy without losing critical sections', async () => {
		const copy = getDesignSystemCopy('pseudo');
		const { getByText } = renderDesignSystem('pseudo', 'dark');
		await act(async () => {
			jest.runOnlyPendingTimers();
			await Promise.resolve();
		});

		expect(getByText(copy.hero.title)).toBeTruthy();
		expect(getByText(copy.qualityBar.title)).toBeTruthy();
		expect(getByText(copy.runtimeTheming.title)).toBeTruthy();
		expect(getByText(copy.presentationModes.title)).toBeTruthy();
		expect(getByText(copy.stateProof.title)).toBeTruthy();
		expect(getByText(copy.componentInventory.title)).toBeTruthy();
		expect(getByText(copy.checklistExplorer.title)).toBeTruthy();
	});

	it('renders rtl locale metadata and exposes a stable root accessibility label', async () => {
		const copy = getDesignSystemCopy('ar');
		const { getByText, getByLabelText } = renderDesignSystem('ar');
		await act(async () => {
			jest.runOnlyPendingTimers();
			await Promise.resolve();
		});

		expect(getByLabelText(copy.screen.accessibilityLabel)).toBeTruthy();
		expect(getByText(copy.meta.localeBadge)).toBeTruthy();
		expect(getByText(copy.meta.directionBadge)).toBeTruthy();
	});

	it('keeps primary controls accessible in english mode', async () => {
		const copy = getDesignSystemCopy('en');
		const { getAllByLabelText, getAllByText, getByLabelText, getByText } =
			renderDesignSystem('en');
		await act(async () => {
			jest.runOnlyPendingTimers();
			await Promise.resolve();
		});

		expect(getByLabelText(copy.runtimeTheming.cycleLookAndFeel)).toBeTruthy();
		expect(getAllByLabelText(copy.componentGallery.buttons.primary).length).toBeGreaterThan(0);
		expect(getAllByLabelText(copy.componentGallery.iconButtons.search).length).toBeGreaterThan(
			0,
		);
		expect(getByText(copy.stateProof.noMedia.title)).toBeTruthy();
		expect(getAllByText(copy.presentationModes.relaxed.title).length).toBeGreaterThan(0);
	});

	it('keeps the workbench hierarchy intact at the largest accessibility font scale stress size', async () => {
		const copy = getDesignSystemCopy('en');
		const { getByText } = renderDesignSystem('en', 'dark', {
			boldTextEnabled: true,
			fontScale: 3,
			reduceMotionEnabled: true,
		});
		await act(async () => {
			jest.runOnlyPendingTimers();
			await Promise.resolve();
		});

		expect(getByText(copy.hero.title)).toBeTruthy();
		expect(getByText(copy.qualityBar.title)).toBeTruthy();
		expect(getByText(copy.runtimeTheming.title)).toBeTruthy();
		expect(getByText(copy.componentInventory.title)).toBeTruthy();
		expect(getByText(copy.checklistExplorer.title)).toBeTruthy();
	});
});
