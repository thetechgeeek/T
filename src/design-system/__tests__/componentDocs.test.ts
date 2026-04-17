import { DESIGN_SYSTEM_COMPONENT_DOC_LIST, DESIGN_SYSTEM_COMPONENT_DOCS } from '../componentDocs';
import { DESIGN_SYSTEM_COMPONENTS } from '../generated/componentCatalog';

describe('design-system component docs contract', () => {
	it('covers every supported component with a docs entry', () => {
		expect(DESIGN_SYSTEM_COMPONENT_DOC_LIST).toHaveLength(DESIGN_SYSTEM_COMPONENTS.length);
		expect(Object.keys(DESIGN_SYSTEM_COMPONENT_DOCS).sort()).toEqual(
			DESIGN_SYSTEM_COMPONENTS.map((component) => component.name).sort(),
		);
	});

	it('documents required sections for every supported component', () => {
		for (const component of DESIGN_SYSTEM_COMPONENTS) {
			const docsEntry = DESIGN_SYSTEM_COMPONENT_DOCS[component.name];

			expect(docsEntry.filePath).toBe(component.filePath);
			expect(docsEntry.summary).toBeTruthy();
			expect(docsEntry.exampleStories.length).toBeGreaterThan(0);
			expect(docsEntry.variants.length).toBeGreaterThan(0);
			expect(docsEntry.sizes.length).toBeGreaterThan(0);
			expect(docsEntry.states.length).toBeGreaterThan(0);
			expect(docsEntry.compositionExample).toBeTruthy();
			expect(docsEntry.usage.relaxed).toBeTruthy();
			expect(docsEntry.usage.operational).toBeTruthy();
			expect(docsEntry.usage.noMedia).toBeTruthy();
			expect(docsEntry.propTable.length).toBeGreaterThan(0);
			expect(docsEntry.doList.length).toBeGreaterThan(0);
			expect(docsEntry.dontList.length).toBeGreaterThan(0);
			expect(docsEntry.accessibilityNotes.length).toBeGreaterThan(0);
			expect(docsEntry.platformNotes.length).toBeGreaterThan(0);

			for (const prop of docsEntry.propTable) {
				expect(prop.name).toBeTruthy();
				expect(prop.type).toBeTruthy();
				expect(prop.description).toBeTruthy();
			}
		}
	});
});
