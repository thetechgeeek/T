import fs from 'fs';
import path from 'path';
import { DESIGN_SYSTEM_COMPONENTS } from '../generated/componentCatalog';

describe('design-system boundary', () => {
	const designSystemRoutePattern = /['"`](?:\/design-system|app\/design-system)['"`]/;

	it('keeps the supported component catalog app-agnostic and fully tested', () => {
		const bannedComponentPattern =
			/(DashboardHeader|ErrorBoundary|InvoiceStatusBadge|OfflineBanner|PaymentModal|QueryBoundary|QuickActionsGrid|RecentInvoicesList|ScreenHeader|SyncIndicator|TileSetCard)/;

		expect(DESIGN_SYSTEM_COMPONENTS).toHaveLength(65);
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
});
