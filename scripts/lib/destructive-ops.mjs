import fs from 'fs';
import path from 'path';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

const PRODUCTION_MODE_PATTERN = /^(prod|production|live)$/i;
const PRODUCTION_LABEL_PATTERN = /\b(prod|production|live)\b/i;
const LOCAL_PROJECT_REFS = new Set(['local', 'localhost', '127']);
const DEFAULT_CONFIRMATION_PHRASE = 'RESET TEST DATA';

export class DestructiveOperationError extends Error {
	constructor(message, details = {}) {
		super(message);
		this.name = 'DestructiveOperationError';
		this.details = details;
	}
}

export function parseCsv(value) {
	return String(value ?? '')
		.split(',')
		.map((entry) => entry.trim())
		.filter(Boolean);
}

export function extractSupabaseProjectRef(rawUrl) {
	if (!rawUrl) return 'unknown';

	try {
		const parsed = new URL(rawUrl);
		const hostname = parsed.hostname.toLowerCase();

		if (hostname === 'localhost' || hostname === '127.0.0.1') return 'local';
		if (hostname.endsWith('.supabase.co')) return hostname.split('.')[0];

		return hostname.split('.')[0] || 'unknown';
	} catch {
		return 'unknown';
	}
}

export function resolveDestructiveTarget({
	env = process.env,
	urlEnvName = 'SUPABASE_TEST_URL',
	mode = env.APP_CONFIG_MODE || env.EXPO_PUBLIC_APP_ENV || env.NODE_ENV || 'integration',
} = {}) {
	const supabaseUrl = env[urlEnvName];
	const projectRef = extractSupabaseProjectRef(supabaseUrl);

	return {
		mode,
		urlEnvName,
		supabaseUrl,
		projectRef,
		isCi: env.CI === 'true',
	};
}

function isLocalProject(projectRef) {
	return LOCAL_PROJECT_REFS.has(projectRef);
}

export function assertNotProductionLikeTarget(target) {
	if (PRODUCTION_MODE_PATTERN.test(target.mode ?? '')) {
		throw new DestructiveOperationError('Refusing destructive operation in production mode.', {
			mode: target.mode,
			projectRef: target.projectRef,
		});
	}

	const url = target.supabaseUrl ?? '';
	if (PRODUCTION_LABEL_PATTERN.test(url) && !target.urlEnvName?.includes('_TEST_')) {
		throw new DestructiveOperationError(
			'Refusing destructive operation against a production-like Supabase URL.',
			{
				urlEnvName: target.urlEnvName,
				projectRef: target.projectRef,
			},
		);
	}
}

export function assertProjectAllowed({
	target,
	env = process.env,
	allowlistEnvNames = [
		'SUPABASE_TEST_PROJECT_REF_ALLOWLIST',
		'EASYSTOCK_DESTRUCTIVE_PROJECT_ALLOWLIST',
	],
} = {}) {
	if (isLocalProject(target.projectRef)) return;

	const allowlist = allowlistEnvNames.flatMap((name) => parseCsv(env[name]));
	if (allowlist.includes(target.projectRef)) return;

	throw new DestructiveOperationError('Destructive operation target is not allowlisted.', {
		projectRef: target.projectRef,
		allowlistEnvNames,
	});
}

export async function confirmDestructiveOperation({
	argv = process.argv.slice(2),
	env = process.env,
	isCi = env.CI === 'true',
	dryRun = false,
	confirmationPhrase = DEFAULT_CONFIRMATION_PHRASE,
	operationName,
	target,
} = {}) {
	if (
		dryRun ||
		argv.includes('--yes') ||
		env.EASYSTOCK_CONFIRM_DESTRUCTIVE_TEST_OPS === confirmationPhrase
	) {
		return;
	}

	if (isCi) {
		return;
	}

	if (!input.isTTY || !output.isTTY) {
		throw new DestructiveOperationError(
			`Refusing to run ${operationName} without confirmation. Re-run with --yes after verifying the target.`,
			{ operationName, projectRef: target?.projectRef },
		);
	}

	const rl = readline.createInterface({ input, output });
	try {
		const answer = await rl.question(
			`Type "${confirmationPhrase}" to run ${operationName} against ${target?.projectRef ?? 'unknown'}: `,
		);
		if (answer !== confirmationPhrase) {
			throw new DestructiveOperationError(
				'Destructive operation confirmation did not match.',
				{
					operationName,
				},
			);
		}
	} finally {
		rl.close();
	}
}

export async function verifyDestructiveOperationTarget(options = {}) {
	const target = resolveDestructiveTarget(options);
	assertNotProductionLikeTarget(target);
	assertProjectAllowed({ target, env: options.env ?? process.env });
	await confirmDestructiveOperation({
		argv: options.argv,
		env: options.env,
		isCi: target.isCi,
		dryRun: options.dryRun,
		operationName: options.operationName,
		target,
		confirmationPhrase: options.confirmationPhrase,
	});
	return target;
}

export function emitDestructiveOperationLog(event) {
	console.log(
		JSON.stringify(
			{
				ts: new Date().toISOString(),
				category: 'destructive-operation',
				...event,
			},
			null,
			2,
		),
	);
}

export function assertPathWithinRoots(targetPath, allowedRoots, label = 'path') {
	const resolvedTarget = path.resolve(targetPath);
	const resolvedAllowedRoots = allowedRoots.map((root) => path.resolve(root));
	const isAllowed = resolvedAllowedRoots.some((root) => {
		const relative = path.relative(root, resolvedTarget);
		return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
	});

	if (!isAllowed) {
		throw new DestructiveOperationError(`Refusing to clear ${label} outside allowed roots.`, {
			label,
			targetPath: resolvedTarget,
			allowedRoots: resolvedAllowedRoots,
		});
	}
}

export function ensureCleanDirInsideAllowedRoots(dirPath, allowedRoots, label) {
	assertPathWithinRoots(dirPath, allowedRoots, label);
	fs.rmSync(dirPath, { recursive: true, force: true });
	fs.mkdirSync(dirPath, { recursive: true });
}
