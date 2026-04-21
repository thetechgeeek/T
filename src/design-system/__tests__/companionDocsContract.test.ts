import fs from 'fs';
import path from 'path';

function readDoc(name: string) {
	return fs.readFileSync(path.join(process.cwd(), 'docs', name), 'utf8');
}

describe('design-system companion docs contract', () => {
	it('documents motion rules and ownership boundaries', () => {
		const motionDoc = readDoc('DESIGN_SYSTEM_MOTION_GUIDELINES.md');

		expect(motionDoc).toContain('Reanimated');
		expect(motionDoc).toContain('useReducedMotion()');
		expect(motionDoc).toContain('UI_Library_Web_Backlog.md');
		expect(motionDoc).toContain('UI_Integration_Checklist.md');
	});

	it('documents copy, fallback, and formatting rules', () => {
		const copyDoc = readDoc('DESIGN_SYSTEM_COPY_STANDARDS.md');

		expect(copyDoc).toContain('microcopy.ts');
		expect(copyDoc).toContain('formatters.ts');
		expect(copyDoc).toContain('—');
		expect(copyDoc).toContain('action-framed');
	});

	it('documents governance and living-documentation policy', () => {
		const governanceDoc = readDoc('DESIGN_SYSTEM_GOVERNANCE.md');

		expect(governanceDoc).toContain('Semantic Versioning');
		expect(governanceDoc).toContain('two minor releases');
		expect(governanceDoc).toContain('.github/workflows/ci.yml');
		expect(governanceDoc).toContain('componentDocs.ts');
		expect(governanceDoc).toContain('componentRegistry.json');
	});

	it('documents the state-resilience split between DS and app orchestration', () => {
		const resilienceDoc = readDoc('DESIGN_SYSTEM_STATE_RESILIENCE.md');
		const normalizedResilienceDoc = resilienceDoc.toLowerCase();

		expect(resilienceDoc).toContain('UI_Integration_Checklist.md');
		expect(resilienceDoc).toContain('DesignLibraryScreen.tsx');
		expect(resilienceDoc).toContain('ThemeSnapshotPreview.tsx');
		expect(normalizedResilienceDoc).toContain('partial');
		expect(normalizedResilienceDoc).toContain('stale');
	});

	it('documents the visual review gates for realistic enterprise content', () => {
		const reviewDoc = readDoc('DESIGN_SYSTEM_REVIEW_GATES.md');
		const normalizedReviewDoc = reviewDoc.toLowerCase();

		expect(normalizedReviewDoc).toContain('hierarchy');
		expect(normalizedReviewDoc).toContain('accent budget');
		expect(normalizedReviewDoc).toContain('surface calm');
		expect(normalizedReviewDoc).toContain('ugly data');
		expect(normalizedReviewDoc).toContain('translated copy');
		expect(normalizedReviewDoc).toContain('phone and tablet');
		expect(normalizedReviewDoc).toContain('reduced motion');
		expect(normalizedReviewDoc).toContain('max font scale');
	});

	it('documents the RN-first verification stack and screenshot proof lanes', () => {
		const verificationDoc = readDoc('DESIGN_SYSTEM_VERIFICATION_STRATEGY.md');

		expect(verificationDoc).toContain('npm run validate');
		expect(verificationDoc).toContain('Jest + React Native Testing Library');
		expect(verificationDoc).toContain('Maestro');
		expect(verificationDoc).toContain('ThemeSnapshotPreview.tsx');
		expect(verificationDoc).toContain('check-design-system-visual-regression.mjs');
		expect(verificationDoc).toContain('FlatList');
		expect(verificationDoc).toContain('German');
	});
});
