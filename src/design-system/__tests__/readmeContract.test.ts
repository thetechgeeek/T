import fs from 'fs';
import path from 'path';

describe('design-system README contract', () => {
	it('documents the premium quality bar, foundation laws, and mobile component contract', () => {
		const readme = fs.readFileSync(
			path.join(process.cwd(), 'src', 'design-system', 'README.md'),
			'utf8',
		);

		expect(readme).toContain('## Enterprise x Premium Quality Contract');
		expect(readme).toContain('Accent budget is explicit.');
		expect(readme).toContain('The full spacing step scale is defined');
		expect(readme).toContain(
			'The design-system icon sizes are fixed: `16` dense, `20` default, `24` standalone.',
		);
		expect(readme).toContain(
			'Mobile components standardize on `style`, `testID`, `accessibilityLabel`',
		);
		expect(readme).toContain(
			'Product typography is capped at two families: the core UI family plus an optional display/brand family.',
		);
		expect(readme).toContain('DESIGN_SYSTEM_OPERATIONS_CHECKLIST.md');
		expect(readme).toContain(
			'Non-Latin locales must fall back to script-safe families for Arabic, Devanagari, and CJK',
		);
		expect(readme).toContain(
			'Lucide SVG icons are the primary DS path; a Material Icons adapter remains available',
		);
		expect(readme).toContain(
			'The qualitative chart palette must remain distinguishable under deuteranopia and protanopia simulation',
		);
		expect(readme).toContain(
			'Large text, pseudo-localization, RTL, reduced motion, and bold-text behavior are part of the component contract',
		);
		expect(readme).toContain('npm run test:design-system:ios');
		expect(readme).toContain('.maestro/design_system_workbench.yaml');
		expect(readme).toContain('DESIGN_SYSTEM_ACCESSIBILITY_AUDIT.md');
	});
});
