import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

const scriptPath = path.join(process.cwd(), 'scripts', 'check-target-architecture.mjs');

const REQUIRED_DOCS = [
	'docs/TARGET_STATE_ARCHITECTURE_GATES.md',
	'docs/ENTERPRISE_EXIT_CRITERIA_EVIDENCE.md',
	'docs/RUNTIME_DEPENDENCY_GRAPH.md',
	'docs/CRITICAL_WRITE_POLICY.md',
	'docs/MOBILE_RELEASE_COMPATIBILITY_CONTRACT.md',
	'docs/PERSISTED_STORE_MIGRATION_POLICY.md',
	'docs/DATABASE_ROLLBACK_AND_DATA_IMPACT.md',
	'docs/BACKUP_RESTORE_INCIDENT_RUNBOOK.md',
	'docs/OBSERVABILITY_TELEMETRY_RUNBOOK.md',
];

function createFixture(overrides: Record<string, string> = {}) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-target-architecture-'));
	const files: Record<string, string> = {
		'package.json': '{"name":"fixture"}\n',
		'.github/PULL_REQUEST_TEMPLATE.md':
			'- [ ] `npm run check:target-architecture`\n- [ ] Previous-supported-client smoke path is documented\n',
		'src/services/authService.ts':
			"import { supabase } from '@/src/config/supabase';\nimport { toAppError } from '@/src/errors/AppError';\nexport const authService = { onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) { try { return supabase.auth.onAuthStateChange(callback); } catch (error) { throw toAppError(error); } } };\n",
		'src/orchestrators/authSessionOrchestrator.ts':
			"import { authService } from '../services/authService';\nimport { stopAuthSessionSubscription } from './authSessionSubscription';\nexport function startAuthSessionOrchestrator() { authService.onAuthStateChange(() => undefined); }\nexport function stopAuthSessionOrchestrator() { stopAuthSessionSubscription(); }\n",
		'src/orchestrators/authSessionSubscription.ts':
			'export function stopAuthSessionSubscription() {}\n',
		'src/orchestrators/storeOrchestrator.ts':
			"import { eventBus } from '../events/appEvents';\nlet unsubscribeStoreEvents: (() => void) | null = null;\nexport function startStoreOrchestrator() { unsubscribeStoreEvents = eventBus.subscribe(() => undefined); }\nexport function stopStoreOrchestrator() { unsubscribeStoreEvents?.(); unsubscribeStoreEvents = null; }\n",
		'src/events/appEvents.ts':
			'export const eventBus = { subscribe(_handler: unknown) { return () => undefined; } };\n',
		'src/stores/invoiceStore.ts':
			"import { persist } from 'zustand/middleware';\nexport const store = persist(() => ({}), { name: 'invoice-storage', version: 1, migrate: (state) => state });\n",
		'src/services/invoiceService.ts':
			"import { supabase } from '@/src/config/supabase';\nimport { toAppError } from '@/src/errors/AppError';\nexport async function load() { const { error } = await supabase.from('invoices').select('*'); if (error) throw toAppError(error); }\n",
		'src/config/runtimeConfig.ts': 'export const config = {};\n',
		'supabase/migrations/025_fractional_stock_quantities.sql': '-- fractional stock\n',
		'supabase/migrations/026_server_authoritative_invoice_totals.sql': '-- server totals\n',
		'supabase/migrations/028_expand_audit_logging.sql': '-- audit\n',
		'supabase/migrations/029_scope_business_rls.sql':
			'CREATE TABLE IF NOT EXISTS public.business_memberships();\nSELECT public.has_business_access(NULL);\nDROP POLICY IF EXISTS "auth_full_access" ON public.customers;\nCREATE POLICY "business_scoped_access" ON public.customers FOR ALL USING (public.has_business_access(business_id));\n',
		'supabase/tests/15_scoped_business_rls.sql':
			"SELECT ok(true, 'business tables have no blanket true RLS policies');\n",
		...Object.fromEntries(REQUIRED_DOCS.map((doc) => [doc, '# Evidence\n'])),
		...overrides,
	};

	for (const [relPath, contents] of Object.entries(files)) {
		const absolute = path.join(root, relPath);
		fs.mkdirSync(path.dirname(absolute), { recursive: true });
		fs.writeFileSync(absolute, contents);
	}

	return root;
}

function runCheck(root: string) {
	return execFileSync(process.execPath, [scriptPath, '--root', root], {
		encoding: 'utf8',
	});
}

function runCheckFailure(root: string) {
	try {
		execFileSync(process.execPath, [scriptPath, '--root', root, '--json'], {
			encoding: 'utf8',
		});
		throw new Error('Expected target architecture check to fail.');
	} catch (error) {
		const failure = error as { stdout?: string; stderr?: string };
		return `${failure.stdout ?? ''}${failure.stderr ?? ''}`;
	}
}

describe('check-target-architecture', () => {
	const roots: string[] = [];

	afterEach(() => {
		while (roots.length > 0) {
			fs.rmSync(roots.pop() as string, { recursive: true, force: true });
		}
	});

	it('passes when target-state ownership and evidence gates exist', () => {
		const root = createFixture();
		roots.push(root);

		expect(runCheck(root)).toContain('check-target-architecture: OK');
	});

	it('fails on a second auth subscription owner', () => {
		const root = createFixture({
			'src/features/auth/useSession.ts':
				'export function start(auth: any) { return auth.onAuthStateChange(() => undefined); }\n',
		});
		roots.push(root);

		const output = runCheckFailure(root);

		expect(output).toContain('target-auth-subscription-owner');
		expect(output).toContain('src/features/auth/useSession.ts');
	});

	it('fails when a persisted store lacks a migration', () => {
		const root = createFixture({
			'src/stores/invoiceStore.ts':
				"import { persist } from 'zustand/middleware';\nexport const store = persist(() => ({}), { name: 'invoice-storage', version: 1 });\n",
		});
		roots.push(root);

		const output = runCheckFailure(root);

		expect(output).toContain('target-persisted-store-migrate');
		expect(output).toContain('src/stores/invoiceStore.ts');
	});

	it('fails on module-scope event subscriptions outside the orchestrator', () => {
		const root = createFixture({
			'src/stores/dashboardStore.ts':
				"import { eventBus } from '../events/appEvents';\neventBus.subscribe(() => undefined);\n",
		});
		roots.push(root);

		const output = runCheckFailure(root);

		expect(output).toContain('target-event-subscription-owner');
		expect(output).toContain('src/stores/dashboardStore.ts');
	});

	it('fails on direct env reads in feature code', () => {
		const root = createFixture({
			'src/features/orders/buildPayload.ts':
				'export const mode = process.env.APP_CONFIG_MODE;\n',
		});
		roots.push(root);

		const output = runCheckFailure(root);

		expect(output).toContain('target-env-resolution-owner');
		expect(output).toContain('src/features/orders/buildPayload.ts');
	});
});
