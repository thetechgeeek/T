#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
	createViolation,
	findRepoRoot,
	formatViolations,
	parseCliArgs,
	printViolationReport,
	walkFiles,
} from './lib/repo-tools.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { flags } = parseCliArgs(process.argv.slice(2), {
	boolean: ['json'],
	string: ['root'],
});
const root = flags.root
	? path.resolve(String(flags.root))
	: findRepoRoot(path.join(__dirname, '..'));

const PRODUCTION_EXTENSIONS = ['.ts', '.tsx'];
const COMMON_EXCLUDES = [
	'__tests__/',
	'__mocks__/',
	'.test.',
	'.spec.',
	'design-system/generated/',
];

const AUTH_SUBSCRIPTION_ALLOWED_FILES = new Set([
	'src/services/authService.ts',
	'src/orchestrators/authSessionOrchestrator.ts',
]);

const EVENT_SUBSCRIPTION_ALLOWED_FILES = new Set(['src/orchestrators/storeOrchestrator.ts']);

const ENV_ALLOWED_PREFIXES = ['src/config/'];
const ENV_ALLOWED_FILES = new Set(['src/utils/logger.ts', 'src/repositories/baseRepository.ts']);

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

function fileExists(relPath) {
	return fs.existsSync(path.join(root, relPath));
}

function readFile(relPath) {
	return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function lineForIndex(text, index) {
	return text.slice(0, index).split(/\r?\n/u).length;
}

function createFileViolation(file, rule, message, line = 1) {
	return createViolation({ file, line, rule, message });
}

function productionFiles(...dirs) {
	return dirs.flatMap((dir) => {
		const absoluteDir = path.join(root, dir);
		if (!fs.existsSync(absoluteDir)) return [];
		return walkFiles(absoluteDir, {
			extensions: PRODUCTION_EXTENSIONS,
			exclude: (relPath) => COMMON_EXCLUDES.some((exclude) => relPath.includes(exclude)),
		}).map((relPath) => `${dir}/${relPath}`);
	});
}

function collectPatternViolations({ files, pattern, rule, message, allowFile = () => false }) {
	return files.flatMap((file) => {
		if (allowFile(file)) return [];
		const text = readFile(file);
		const violations = [];
		pattern.lastIndex = 0;
		let match;
		while ((match = pattern.exec(text)) !== null) {
			violations.push(
				createFileViolation(file, rule, message, lineForIndex(text, match.index)),
			);
		}
		return violations;
	});
}

function collectAuthSubscriptionViolations(files) {
	const violations = collectPatternViolations({
		files,
		pattern: /onAuthStateChange\s*\(/gu,
		rule: 'target-auth-subscription-owner',
		message:
			'Auth state subscriptions must be exposed by authService and lifecycle-owned by authSessionOrchestrator only.',
		allowFile: (file) => AUTH_SUBSCRIPTION_ALLOWED_FILES.has(file),
	});

	const owner = 'src/orchestrators/authSessionOrchestrator.ts';
	if (!fileExists(owner)) {
		violations.push(
			createFileViolation(
				owner,
				'target-auth-subscription-owner',
				'Auth orchestrator is missing.',
			),
		);
		return violations;
	}

	const ownerSource = readFile(owner);
	if (!/authService\.onAuthStateChange\s*\(/u.test(ownerSource)) {
		violations.push(
			createFileViolation(
				owner,
				'target-auth-subscription-owner',
				'Auth orchestrator must own the single authService.onAuthStateChange subscription.',
			),
		);
	}
	if (
		!/stopAuthSessionOrchestrator/u.test(ownerSource) ||
		!/stopAuthSessionSubscription/u.test(ownerSource)
	) {
		violations.push(
			createFileViolation(
				owner,
				'target-auth-subscription-teardown',
				'Auth orchestrator must expose teardown through stopAuthSessionOrchestrator.',
			),
		);
	}

	return violations;
}

function collectEventSubscriptionViolations(files) {
	const violations = collectPatternViolations({
		files,
		pattern: /eventBus\.subscribe\s*\(/gu,
		rule: 'target-event-subscription-owner',
		message: 'Event bus subscriptions must live in the lifecycle-owned store orchestrator.',
		allowFile: (file) => EVENT_SUBSCRIPTION_ALLOWED_FILES.has(file),
	});

	const owner = 'src/orchestrators/storeOrchestrator.ts';
	if (!fileExists(owner)) {
		violations.push(
			createFileViolation(
				owner,
				'target-event-subscription-owner',
				'Store orchestrator is missing.',
			),
		);
		return violations;
	}

	const ownerSource = readFile(owner);
	if (!/eventBus\.subscribe\s*\(/u.test(ownerSource)) {
		violations.push(
			createFileViolation(
				owner,
				'target-event-subscription-owner',
				'Store orchestrator must own eventBus.subscribe.',
			),
		);
	}
	if (
		!/stopStoreOrchestrator/u.test(ownerSource) ||
		!/unsubscribeStoreEvents/u.test(ownerSource)
	) {
		violations.push(
			createFileViolation(
				owner,
				'target-event-subscription-teardown',
				'Store orchestrator must expose teardown and clear the active subscription.',
			),
		);
	}

	return violations;
}

function collectPersistedStoreViolations() {
	const storesDir = path.join(root, 'src', 'stores');
	if (!fs.existsSync(storesDir)) return [];

	return walkFiles(storesDir, {
		extensions: ['.ts', '.tsx'],
		exclude: (relPath) => relPath.includes('.test.') || relPath.includes('__tests__/'),
	}).flatMap((relPath) => {
		const file = `src/stores/${relPath}`;
		const text = readFile(file);
		if (!/persist\s*\(/u.test(text)) return [];

		const violations = [];
		if (!/\bversion\s*:/u.test(text)) {
			violations.push(
				createFileViolation(
					file,
					'target-persisted-store-version',
					'Persisted stores must declare a version.',
				),
			);
		}
		if (!/\bmigrate\s*:/u.test(text)) {
			violations.push(
				createFileViolation(
					file,
					'target-persisted-store-migrate',
					'Persisted stores must declare a migration function.',
				),
			);
		}
		return violations;
	});
}

function collectServiceErrorViolations() {
	const servicesDir = path.join(root, 'src', 'services');
	if (!fs.existsSync(servicesDir)) return [];

	return walkFiles(servicesDir, {
		extensions: ['.ts', '.tsx'],
		exclude: (relPath) => relPath.includes('.test.') || relPath.includes('__tests__/'),
	}).flatMap((relPath) => {
		const file = `src/services/${relPath}`;
		const text = readFile(file);
		const usesBackend =
			/from\s+['"][^'"]*config\/supabase['"]/u.test(text) || /\bsupabase\./u.test(text);
		if (!usesBackend) return [];
		if (/\b(toAppError|AppError|ValidationError|NetworkError|ConflictError)\b/u.test(text)) {
			return [];
		}
		return [
			createFileViolation(
				file,
				'target-service-error-normalization',
				'Services that touch backend clients must normalize failures to AppError or a successor.',
			),
		];
	});
}

function collectEnvViolations(files) {
	return collectPatternViolations({
		files,
		pattern: /\bprocess\.env\b/gu,
		rule: 'target-env-resolution-owner',
		message:
			'Runtime env access must stay in typed config/platform modules or approved release metadata sinks.',
		allowFile: (file) =>
			ENV_ALLOWED_FILES.has(file) ||
			ENV_ALLOWED_PREFIXES.some((prefix) => file.startsWith(prefix)),
	});
}

function collectSecurityUiViolations() {
	const files = ['app/(app)/settings/security.tsx', 'app/(app)/settings/lock.tsx'].filter(
		fileExists,
	);
	const fakeControlPattern =
		/\b(Switch|ToggleSwitch|enableLock|enableBiometric|setPin|lockEnabled)\b/u;

	return files.flatMap((file) => {
		const text = readFile(file);
		if (!fakeControlPattern.test(text)) return [];
		if (/expo-local-authentication|LocalAuthentication|secureSupabaseStorage/u.test(text))
			return [];
		return [
			createFileViolation(
				file,
				'target-security-ui-enforcement',
				'Security UI must be unavailable copy or backed by real enforcement.',
			),
		];
	});
}

function collectRlsEvidenceViolations() {
	const migration = 'supabase/migrations/029_scope_business_rls.sql';
	const test = 'supabase/tests/15_scoped_business_rls.sql';
	const violations = [];

	if (!fileExists(migration)) {
		violations.push(
			createFileViolation(
				migration,
				'target-business-rls-scope',
				'Scoped business-table RLS migration is missing.',
			),
		);
	} else {
		const text = readFile(migration);
		for (const required of [
			'CREATE TABLE IF NOT EXISTS public.business_memberships',
			'public.has_business_access',
			'DROP POLICY IF EXISTS "auth_full_access"',
			'CREATE POLICY "business_scoped_access"',
		]) {
			if (!text.includes(required)) {
				violations.push(
					createFileViolation(
						migration,
						'target-business-rls-scope',
						`Scoped RLS migration must include ${required}.`,
					),
				);
			}
		}
	}

	if (!fileExists(test)) {
		violations.push(
			createFileViolation(
				test,
				'target-business-rls-test',
				'Scoped business RLS test is missing.',
			),
		);
	} else {
		const text = readFile(test);
		if (!/business tables have no blanket true RLS policies/u.test(text)) {
			violations.push(
				createFileViolation(
					test,
					'target-business-rls-test',
					'Scoped business RLS test must prove blanket true policies are absent.',
				),
			);
		}
	}

	return violations;
}

function collectCriticalWriteViolations() {
	const criticalWritePolicy = 'docs/CRITICAL_WRITE_POLICY.md';
	const migrations = [
		'supabase/migrations/025_fractional_stock_quantities.sql',
		'supabase/migrations/026_server_authoritative_invoice_totals.sql',
		'supabase/migrations/028_expand_audit_logging.sql',
	];
	const violations = [];

	if (!fileExists(criticalWritePolicy)) {
		violations.push(
			createFileViolation(
				criticalWritePolicy,
				'target-critical-write-policy',
				'Critical write policy is missing.',
			),
		);
	}

	for (const migration of migrations) {
		if (!fileExists(migration)) {
			violations.push(
				createFileViolation(
					migration,
					'target-critical-write-server-authority',
					'Server-authoritative write migration/test evidence is missing.',
				),
			);
		}
	}

	return violations;
}

function collectRequiredDocsViolations() {
	return REQUIRED_DOCS.flatMap((doc) =>
		fileExists(doc)
			? []
			: [
					createFileViolation(
						doc,
						'target-required-architecture-document',
						'Target-state architecture evidence document is missing.',
					),
				],
	);
}

function collectPrTemplateViolations() {
	const template = '.github/PULL_REQUEST_TEMPLATE.md';
	if (!fileExists(template)) {
		return [
			createFileViolation(
				template,
				'target-review-gate',
				'Pull request template is required for review gates.',
			),
		];
	}

	const text = readFile(template);
	const requiredChecks = [
		'npm run check:target-architecture',
		'Previous-supported-client smoke path',
	];
	return requiredChecks.flatMap((required) =>
		text.includes(required)
			? []
			: [
					createFileViolation(
						template,
						'target-review-gate',
						`Pull request template must include ${required}.`,
					),
				],
	);
}

function collectViolations() {
	const files = productionFiles('app', 'src');

	return [
		...collectAuthSubscriptionViolations(files),
		...collectEventSubscriptionViolations(files),
		...collectPersistedStoreViolations(),
		...collectServiceErrorViolations(),
		...collectEnvViolations(files),
		...collectSecurityUiViolations(),
		...collectRlsEvidenceViolations(),
		...collectCriticalWriteViolations(),
		...collectRequiredDocsViolations(),
		...collectPrTemplateViolations(),
	];
}

const violations = collectViolations();

if (flags.json) {
	process.stdout.write(
		`${JSON.stringify(
			{
				status: violations.length > 0 ? 'failed' : 'ok',
				violations,
			},
			null,
			2,
		)}\n`,
	);
} else if (violations.length > 0) {
	printViolationReport('check-target-architecture', violations, { stream: process.stderr });
} else {
	process.stdout.write('check-target-architecture: OK\n');
}

if (violations.length > 0) {
	if (!flags.json) {
		process.stderr.write(`\n${formatViolations(violations)}\n`);
	}
	process.exit(1);
}
