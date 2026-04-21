import fs from 'fs';
import path from 'path';
import { DESIGN_SYSTEM_COMPONENTS } from '../generated/componentCatalog';

const LEGACY_SHARED_LAYER_IMPORT_RE =
	/from\s*['"](?:@\/src\/theme\/|@\/theme\/|@\/src\/hooks\/|@\/src\/utils\/|@\/src\/i18n\/)/;

function collectDesignSystemSourceFiles(rootDir: string, currentDir = rootDir, out: string[] = []) {
	for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
		if (entry.name.startsWith('.')) {
			continue;
		}

		const absolutePath = path.join(currentDir, entry.name);
		if (entry.isDirectory()) {
			if (entry.name === '__tests__' || entry.name === 'generated') {
				continue;
			}

			collectDesignSystemSourceFiles(rootDir, absolutePath, out);
			continue;
		}

		if (!/\.(ts|tsx)$/.test(entry.name)) {
			continue;
		}

		out.push(absolutePath);
	}

	return out;
}

describe('design-system boundary', () => {
	const designSystemRoutePattern = /['"`](?:\/design-system|app\/design-system)['"`]/;

	it('keeps the supported component catalog app-agnostic and fully tested', () => {
		const bannedComponentPattern =
			/(DashboardHeader|ErrorBoundary|InvoiceStatusBadge|OfflineBanner|PaymentModal|QueryBoundary|QuickActionsGrid|RecentInvoicesList|ScreenHeader|SyncIndicator|TileSetCard)/;

		expect(DESIGN_SYSTEM_COMPONENTS).toHaveLength(72);
		expect(DESIGN_SYSTEM_COMPONENTS.every((component) => component.hasTests)).toBe(true);
		expect(
			DESIGN_SYSTEM_COMPONENTS.every((component) =>
				component.filePath.startsWith('src/design-system/components/'),
			),
		).toBe(true);
		expect(
			DESIGN_SYSTEM_COMPONENTS.some((component) =>
				bannedComponentPattern.test(component.name),
			),
		).toBe(false);
	});

	it('owns a dedicated route outside the product app shell', () => {
		const root = process.cwd();

		expect(fs.existsSync(path.join(root, 'app/design-system/index.tsx'))).toBe(true);
		expect(fs.existsSync(path.join(root, 'app/(app)/design-system'))).toBe(false);
	});

	it('does not leak through the product More tab', () => {
		const moreTab = fs.readFileSync(
			path.join(process.cwd(), 'app/(app)/(tabs)/more.tsx'),
			'utf8',
		);

		expect(designSystemRoutePattern.test(moreTab)).toBe(false);
	});

	it('keeps the extractable package self-contained under src/design-system', () => {
		const root = process.cwd();
		const designSystemRoot = path.join(root, 'src/design-system');
		const sourceFiles = collectDesignSystemSourceFiles(designSystemRoot);

		expect(fs.existsSync(path.join(root, 'src/design-system/foundation/index.ts'))).toBe(true);
		expect(fs.existsSync(path.join(root, 'src/design-system/index.ts'))).toBe(true);

		for (const absolutePath of sourceFiles) {
			const text = fs.readFileSync(absolutePath, 'utf8');
			expect(text).not.toMatch(LEGACY_SHARED_LAYER_IMPORT_RE);
		}
	});
});
