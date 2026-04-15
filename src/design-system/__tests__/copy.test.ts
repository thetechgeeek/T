import { getDesignSystemCopy } from '../copy';

describe('design-system copy registry', () => {
	it('returns stable english copy by default', () => {
		const copy = getDesignSystemCopy();

		expect(copy.locale).toBe('en');
		expect(copy.direction).toBe('ltr');
		expect(copy.hero.title).toBe('Design System Workbench');
		expect(copy.stats.completed).toBe('Completed');
	});

	it('produces pseudo-localized stress copy', () => {
		const english = getDesignSystemCopy('en');
		const pseudo = getDesignSystemCopy('pseudo');

		expect(pseudo.direction).toBe('ltr');
		expect(pseudo.hero.title).not.toBe(english.hero.title);
		expect(pseudo.hero.title).toContain('[~');
		expect(pseudo.componentGallery.notesSeed).toContain('[~');
	});

	it('produces rtl-aware localized copy', () => {
		const arabic = getDesignSystemCopy('ar');

		expect(arabic.direction).toBe('rtl');
		expect(arabic.meta.directionBadge).toBeTruthy();
		expect(arabic.screen.accessibilityLabel).not.toBe('Internal design system workbench');
	});
});
