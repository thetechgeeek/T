import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

const scriptPath = path.join(process.cwd(), 'scripts', 'check-design-system-guardrails.mjs');

function writeFiles(root: string, files: Record<string, string>) {
	for (const [rel, contents] of Object.entries(files)) {
		const abs = path.join(root, rel);
		fs.mkdirSync(path.dirname(abs), { recursive: true });
		fs.writeFileSync(abs, contents);
	}
}

function createFixture(componentSource: string) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-design-system-guardrails-'));
	writeFiles(root, {
		'src/design-system/README.md': [
			'# Design System',
			'',
			'- Relaxed showcase',
			'- Operational dense',
			'- loading, empty, error, read-only, denied, no-media, and ugly-data',
			'',
		].join('\n'),
		'src/design-system/fixtures.ts': 'export const fixtures = [];\n',
		'src/design-system/components/ThemeSnapshotPreview.tsx':
			'export function ThemeSnapshotPreview() { return null; }\n',
		'src/design-system/__tests__/boundary.test.ts':
			"describe('boundary', () => it('exists', () => expect(true).toBe(true)));\n",
		'src/design-system/__tests__/fixtures.test.ts':
			"describe('fixtures', () => it('exists', () => expect(true).toBe(true)));\n",
		'src/design-system/__tests__/qualityMatrix.test.tsx':
			"describe('quality matrix', () => it('exists', () => expect(true).toBe(true)));\n",
		'src/design-system/__tests__/themeMatrix.test.tsx':
			"describe('theme matrix', () => it('exists', () => expect(true).toBe(true)));\n",
		'app/design-system/index.tsx':
			'export default function DesignSystemRoute() { return null; }\n',
		'app/(app)/(tabs)/more.tsx': 'export default function MoreTab() { return null; }\n',
		'src/design-system/catalog.ts': [
			'export const DESIGN_LIBRARY_PREVIEW_LABELS = [] as const;',
			'const PREVIEW_LABEL_SET = new Set<string>(DESIGN_LIBRARY_PREVIEW_LABELS);',
			'const LIVE_PREVIEW_COMPONENTS = [] as const;',
			'export { LIVE_PREVIEW_COMPONENTS, PREVIEW_LABEL_SET };',
			'',
		].join('\n'),
		'src/design-system/componentRegistry.json': JSON.stringify(
			[
				{
					kind: 'molecules',
					filePath: 'src/design-system/components/molecules/MotionCard.tsx',
				},
			],
			null,
			2,
		),
		'src/design-system/generated/componentCatalog.ts': [
			'export const DESIGN_SYSTEM_COMPONENTS = [',
			'	{',
			"		name: 'MotionCard',",
			"		kind: 'molecules',",
			"		filePath: 'src/design-system/components/molecules/MotionCard.tsx',",
			'		hasTests: true,',
			'	},',
			'];',
			'',
		].join('\n'),
		'src/design-system/generated/uiLibraryCatalog.ts': 'export const UI_LIBRARY_ITEMS = [];\n',
		'src/design-system/components/molecules/MotionCard.tsx': componentSource,
		'src/design-system/components/molecules/__tests__/MotionCard.test.tsx':
			"describe('MotionCard', () => it('exists', () => expect(true).toBe(true)));\n",
	});
	return root;
}

function runCheck(root: string) {
	return execFileSync(process.execPath, [scriptPath, '--root', root], {
		encoding: 'utf8',
	});
}

function runCheckFailure(root: string) {
	try {
		runCheck(root);
		throw new Error('Expected check-design-system-guardrails to fail.');
	} catch (error) {
		const failure = error as { stdout?: string; stderr?: string };
		return `${failure.stdout ?? ''}${failure.stderr ?? ''}`;
	}
}

describe('check-design-system-guardrails', () => {
	const roots: string[] = [];

	afterEach(() => {
		while (roots.length > 0) {
			fs.rmSync(roots.pop() as string, { recursive: true, force: true });
		}
	});

	it('passes when animated DS components gate motion through useReducedMotion', () => {
		const root = createFixture(`
			import { withSpring } from 'react-native-reanimated';
			import { useReducedMotion } from '@/src/hooks/useReducedMotion';

			export function MotionCard() {
				const reduceMotionEnabled = useReducedMotion();
				const opacity = reduceMotionEnabled ? 1 : withSpring(1);

				return opacity ? null : null;
			}
		`);
		roots.push(root);

		expect(runCheck(root)).toContain('"status": "ok"');
	});

	it('fails when an animated DS component omits the reduced-motion gate', () => {
		const root = createFixture(`
			import { withSpring } from 'react-native-reanimated';

			export function MotionCard() {
				const opacity = withSpring(1);

				return opacity ? null : null;
			}
		`);
		roots.push(root);

		const output = runCheckFailure(root);

		expect(output).toContain('reduced-motion-animation-gate');
		expect(output).toContain('MotionCard.tsx');
	});
});
