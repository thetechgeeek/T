import fs from 'fs';
import path from 'path';

describe('design-system accessibility audit contract', () => {
	it('documents the compliance target and legal accessibility references', () => {
		const audit = fs.readFileSync(
			path.join(process.cwd(), 'docs', 'DESIGN_SYSTEM_ACCESSIBILITY_AUDIT.md'),
			'utf8',
		);

		expect(audit).toContain('WCAG 2.2 Level AA');
		expect(audit).toContain('WCAG 2.2 Level AAA');
		expect(audit).toContain('auth, account settings, and checkout');
		expect(audit).toContain('Section 508');
		expect(audit).toContain('EN 301 549');
		expect(audit).toContain('AODA');
		expect(audit).toContain('Premium and branded surfaces have no accessibility exemptions');
	});
});
