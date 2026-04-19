import {
	DESIGN_LIBRARY_COMPONENT_OVERVIEW,
	DESIGN_LIBRARY_OVERVIEW,
	filterCatalogComponents,
	filterLibraryItems,
	isLivePreviewComponent,
	isPreviewableItem,
} from '../catalog';

describe('design system catalog', () => {
	it('tracks total and Common + Mobile checklist scope', () => {
		expect(DESIGN_LIBRARY_OVERVIEW.total).toBe(1175);
		expect(DESIGN_LIBRARY_OVERVIEW.commonMobile).toBe(895);
		expect(DESIGN_LIBRARY_OVERVIEW.common).toBe(638);
		expect(DESIGN_LIBRARY_OVERVIEW.mobile).toBe(257);
		expect(DESIGN_LIBRARY_OVERVIEW.completed).toBe(646);
		expect(DESIGN_LIBRARY_OVERVIEW.completed).toBeGreaterThan(0);
		expect(DESIGN_LIBRARY_OVERVIEW.completed + DESIGN_LIBRARY_OVERVIEW.open).toBe(
			DESIGN_LIBRARY_OVERVIEW.total,
		);
	});

	it('tracks the generated component inventory and live demo coverage', () => {
		expect(DESIGN_LIBRARY_COMPONENT_OVERVIEW.total).toBe(72);
		expect(DESIGN_LIBRARY_COMPONENT_OVERVIEW.tested).toBe(72);
		expect(DESIGN_LIBRARY_COMPONENT_OVERVIEW.byKind.atoms).toBe(14);
		expect(DESIGN_LIBRARY_COMPONENT_OVERVIEW.byKind.molecules).toBe(51);
		expect(DESIGN_LIBRARY_COMPONENT_OVERVIEW.byKind.organisms).toBe(5);
		expect(DESIGN_LIBRARY_COMPONENT_OVERVIEW.byKind.skeletons).toBe(2);
		expect(DESIGN_LIBRARY_COMPONENT_OVERVIEW.livePreviewCount).toBeGreaterThan(10);
	});

	it('filters checklist items by query and platform', () => {
		const commonMobileMatches = filterLibraryItems('Date Picker', 'common-mobile');
		const mobileOnlyMatches = filterLibraryItems('External keyboard support', 'mobile');
		const webOnlyMatches = filterLibraryItems('Cmd+K', 'web');
		const completedMatches = filterLibraryItems('ThemeProvider', 'mobile', 'completed');

		expect(commonMobileMatches.some((item) => item.title === 'Date Picker')).toBe(true);
		expect(
			mobileOnlyMatches.some((item) =>
				item.title.includes(
					'External keyboard support (iPad, Android tablets with keyboard)',
				),
			),
		).toBe(true);
		expect(
			webOnlyMatches.some((item) => item.title.includes('Command Palette (`Cmd+K`)')),
		).toBe(true);
		expect(completedMatches.some((item) => item.completed)).toBe(true);
	});

	it('marks preview-backed checklist rows', () => {
		const [firstPreviewable] = filterLibraryItems('Date Picker', 'common-mobile').filter(
			isPreviewableItem,
		);
		const [confirmationDialog] = filterLibraryItems(
			'Confirmation Dialog',
			'common-mobile',
		).filter(isPreviewableItem);
		const [denseDataSurface] = filterLibraryItems(
			'dense operational variant',
			'common-mobile',
		).filter(isPreviewableItem);

		expect(firstPreviewable).toBeDefined();
		expect(firstPreviewable?.title).toBe('Date Picker');
		expect(confirmationDialog?.title).toBe('Confirmation Dialog');
		expect(denseDataSurface?.title).toBe(
			'Every data surface has a dense operational variant where the domain requires comparison or bulk scanning',
		);
	});

	it('filters component inventory and identifies live demos', () => {
		const [button] = filterCatalogComponents('Button', 'atoms');
		const [collapsibleSection] = filterCatalogComponents('CollapsibleSection', 'molecules');
		const livePreviewComponents = filterCatalogComponents('', 'all').filter(
			isLivePreviewComponent,
		);

		expect(button).toBeDefined();
		expect(button?.name).toBe('Button');
		expect(collapsibleSection?.name).toBe('CollapsibleSection');
		expect(isLivePreviewComponent(button!)).toBe(true);
		expect(isLivePreviewComponent(collapsibleSection!)).toBe(true);
		expect(livePreviewComponents.every((component) => component.hasTests)).toBe(true);
	});
});
