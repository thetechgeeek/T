import fs from 'fs';
import path from 'path';

describe('design-system native proof contract', () => {
	it('keeps the Maestro smoke flow, baseline, audit notes, and CI jobs in place', () => {
		const root = process.cwd();
		const maestroFlowPath = path.join(root, '.maestro', 'design_system_workbench.yaml');
		const baselinePath = path.join(
			root,
			'artifacts',
			'design-system-baselines',
			'ios',
			'screenshots',
			'design-system-foundation.png',
		);
		const auditDocPath = path.join(root, 'docs', 'DESIGN_SYSTEM_ACCESSIBILITY_AUDIT.md');
		const packageJsonPath = path.join(root, 'package.json');
		const ciWorkflowPath = path.join(root, '.github', 'workflows', 'ci.yml');

		const maestroFlow = fs.readFileSync(maestroFlowPath, 'utf8');
		const packageJson = fs.readFileSync(packageJsonPath, 'utf8');
		const ciWorkflow = fs.readFileSync(ciWorkflowPath, 'utf8');

		expect(maestroFlow).toContain('DESIGN_SYSTEM_DEEPLINK');
		expect(maestroFlow).toContain("label: 'Internal design system workbench'");
		expect(maestroFlow).toContain('takeScreenshot: design-system-foundation');
		expect(fs.existsSync(baselinePath)).toBe(true);
		expect(fs.existsSync(auditDocPath)).toBe(true);
		expect(packageJson).toContain('"test:design-system:ios"');
		expect(packageJson).toContain('"test:design-system:android"');
		expect(ciWorkflow).toContain('design-system-ios:');
		expect(ciWorkflow).toContain('design-system-android:');
	});
});
