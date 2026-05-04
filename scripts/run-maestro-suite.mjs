#!/usr/bin/env node

import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn, spawnSync } from 'child_process';

const APP_ID = 'com.easystock.app';
const DEFAULT_DESIGN_SYSTEM_DEEPLINK = 'easystock://design-system';
const DEFAULT_DEV_CLIENT_SCHEME = 'easystock';
const DEFAULT_E2E_EXPO_PORT = '8088';
const DEFAULT_TEST_OUTPUT_DIR = path.join(os.homedir(), '.maestro', 'artifacts');
const DEFAULT_MAESTRO_PATHS = [
	path.join(os.homedir(), '.maestro', 'bin', 'maestro'),
	'/opt/homebrew/bin/maestro',
];
const IOS_PERMISSION_SERVICES = ['camera', 'photos', 'faceid'];
const MAESTRO_FLOW_ENV_KEYS = [
	'INTEGRATION_TEST_EMAIL',
	'INTEGRATION_TEST_PASSWORD',
	'DESIGN_SYSTEM_DEEPLINK',
	'E2E_DEV_CLIENT_URL',
];
const MAESTRO_FLAGS_WITH_VALUE = new Set([
	'-e',
	'--env',
	'--format',
	'--output',
	'--device',
	'--shards',
	'--device-timeout',
	'--test-output-dir',
]);
const RETRIABLE_MAESTRO_PATTERNS = [
	/Not enough devices connected/i,
	/Failed to connect to \/127\.0\.0\.1:\d+/i,
	/Unable to set permissions for app/i,
	/only one gesture can be performed at a time/i,
];
const EXPO_SERVER_START_TIMEOUT_MS = 120_000;

let managedExpoServerProcess = null;
let managedExpoServerLogTail = '';

function appendManagedExpoServerLog(chunk) {
	managedExpoServerLogTail = `${managedExpoServerLogTail}${String(chunk)}`.slice(-8_000);
}

function stopManagedExpoServer() {
	if (managedExpoServerProcess && managedExpoServerProcess.exitCode === null) {
		managedExpoServerProcess.kill('SIGTERM');
	}

	managedExpoServerProcess = null;
}

process.once('exit', stopManagedExpoServer);

function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

function getExpoPort(envFromFile = {}) {
	return String(process.env.E2E_EXPO_PORT ?? envFromFile.E2E_EXPO_PORT ?? DEFAULT_E2E_EXPO_PORT);
}

function createExpoIosManifestUrls(port) {
	return [
		`http://127.0.0.1:${port}/?platform=ios&dev=true`,
		`http://localhost:${port}/?platform=ios&dev=true`,
	];
}

function toInspectableBundleUrl(launchAssetUrl) {
	try {
		const bundleUrl = new URL(launchAssetUrl);
		if (bundleUrl.searchParams.get('transform.bytecode') === '1') {
			bundleUrl.searchParams.set('transform.bytecode', '0');
		}

		return bundleUrl.toString();
	} catch {
		return launchAssetUrl;
	}
}

async function fetchExpoManifest(manifestUrls) {
	for (const manifestUrl of manifestUrls) {
		try {
			const manifestResponse = await fetch(manifestUrl, {
				headers: { Accept: 'application/json' },
			});

			if (!manifestResponse.ok) {
				continue;
			}

			const manifest = await manifestResponse.json();
			const launchAssetUrl = manifest?.launchAsset?.url;

			if (!launchAssetUrl) {
				continue;
			}

			return { manifestUrl, manifest, launchAssetUrl };
		} catch {
			// Ignore and fall back to the next known manifest URL.
		}
	}

	return null;
}

async function fetchExpoBundleSource(launchAssetUrl) {
	try {
		const bundleResponse = await fetch(toInspectableBundleUrl(launchAssetUrl));
		if (!bundleResponse.ok) {
			return null;
		}

		return await bundleResponse.text();
	} catch {
		return null;
	}
}

function bundleMatchesExpectedRuntime(bundleSource, expectedSupabaseUrl, expectedAppEnv) {
	if (!bundleSource || !expectedSupabaseUrl) {
		return false;
	}

	const quotedSupabaseUrl = JSON.stringify(expectedSupabaseUrl);
	const quotedAppEnv = JSON.stringify(expectedAppEnv);

	return (
		bundleSource.includes(
			`"EXPO_PUBLIC_SUPABASE_URL": { enumerable: true, value: ${quotedSupabaseUrl} }`,
		) &&
		bundleSource.includes(`"EXPO_PUBLIC_APP_ENV": { enumerable: true, value: ${quotedAppEnv} }`)
	);
}

async function resolveReadyExpoManifest(manifestUrls, expectedSupabaseUrl, expectedAppEnv) {
	const manifestDetails = await fetchExpoManifest(manifestUrls);
	if (!manifestDetails) {
		return null;
	}

	const bundleSource = await fetchExpoBundleSource(manifestDetails.launchAssetUrl);
	if (!bundleMatchesExpectedRuntime(bundleSource, expectedSupabaseUrl, expectedAppEnv)) {
		return null;
	}

	return manifestDetails;
}

function startExpoE2eServer(port) {
	const child = spawn(
		process.execPath,
		[
			path.join(process.cwd(), 'scripts', 'run-expo-e2e.mjs'),
			'start',
			'--dev-client',
			'--clear',
			'--localhost',
			'--port',
			String(port),
		],
		{
			cwd: process.cwd(),
			env: {
				...process.env,
				E2E_EXPO_PORT: String(port),
			},
			stdio: ['ignore', 'pipe', 'pipe'],
		},
	);

	child.stdout?.on('data', appendManagedExpoServerLog);
	child.stderr?.on('data', appendManagedExpoServerLog);

	managedExpoServerProcess = child;
	return child;
}

async function ensureExpoE2eServer(envFromFile) {
	const port = getExpoPort(envFromFile);
	const manifestUrls = createExpoIosManifestUrls(port);
	const expectedSupabaseUrl =
		envFromFile.EXPO_PUBLIC_SUPABASE_URL ?? envFromFile.SUPABASE_TEST_URL ?? '';
	const expectedAppEnv = envFromFile.EXPO_PUBLIC_APP_ENV ?? 'e2e';

	const existingManifest = await resolveReadyExpoManifest(
		manifestUrls,
		expectedSupabaseUrl,
		expectedAppEnv,
	);
	if (existingManifest) {
		return {
			port,
			launchAssetUrl: existingManifest.launchAssetUrl,
			managed: false,
		};
	}

	console.error(`[maestro] Starting dedicated Expo e2e server on port ${port}`);
	const child = startExpoE2eServer(port);
	const deadline = Date.now() + EXPO_SERVER_START_TIMEOUT_MS;

	while (Date.now() < deadline) {
		if (child.exitCode !== null) {
			break;
		}

		const readyManifest = await resolveReadyExpoManifest(
			manifestUrls,
			expectedSupabaseUrl,
			expectedAppEnv,
		);
		if (readyManifest) {
			return {
				port,
				launchAssetUrl: readyManifest.launchAssetUrl,
				managed: true,
			};
		}

		await sleep(1_000);
	}

	const exitCode = child.exitCode;
	stopManagedExpoServer();
	throw new Error(
		[
			`Expo e2e dev server did not become ready on port ${port}.`,
			exitCode === null ? null : `Process exited with code ${exitCode}.`,
			managedExpoServerLogTail.trim() || null,
		]
			.filter(Boolean)
			.join('\n'),
	);
}

function buildDevClientOpenUrl(launchAssetUrl) {
	return `${DEFAULT_DEV_CLIENT_SCHEME}://expo-development-client/?url=${encodeURIComponent(launchAssetUrl)}&disableOnboarding=1`;
}

function collectExcludeArgs(args) {
	const filteredArgs = [];
	const excludedTargets = [];

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];

		if ((arg === '--exclude' || arg === '--exclude-flow') && args[index + 1]) {
			excludedTargets.push(args[index + 1]);
			index += 1;
			continue;
		}

		if (arg.startsWith('--exclude=')) {
			excludedTargets.push(arg.slice('--exclude='.length));
			continue;
		}

		if (arg.startsWith('--exclude-flow=')) {
			excludedTargets.push(arg.slice('--exclude-flow='.length));
			continue;
		}

		filteredArgs.push(arg);
	}

	return { filteredArgs, excludedTargets };
}

function normalizeComparablePath(candidate) {
	if (!candidate || candidate.startsWith('-')) {
		return candidate;
	}

	return path.resolve(process.cwd(), candidate);
}

function filterExcludedTargets(args, excludedTargets) {
	if (args[0] !== 'test' || excludedTargets.length === 0) {
		return args;
	}

	const excludedPathSet = new Set(excludedTargets.map(normalizeComparablePath));

	return args.filter((arg, index) => {
		if (index === 0 || arg.startsWith('-')) {
			return true;
		}

		return !excludedPathSet.has(normalizeComparablePath(arg));
	});
}

function isExecutable(filePath) {
	try {
		fs.accessSync(filePath, fs.constants.X_OK);
		return true;
	} catch {
		return false;
	}
}

function resolveExecutable(commandName, fallbacks = []) {
	const lookup = spawnSync('bash', ['-lc', `command -v ${commandName}`], {
		encoding: 'utf8',
	});
	const fromPath = lookup.status === 0 ? lookup.stdout.trim() : '';
	if (fromPath && isExecutable(fromPath)) {
		return fromPath;
	}

	for (const candidate of fallbacks) {
		if (candidate && isExecutable(candidate)) {
			return candidate;
		}
	}

	return null;
}

function loadEnvFile(filePath) {
	if (!fs.existsSync(filePath)) {
		return {};
	}

	const parsed = {};
	const contents = fs.readFileSync(filePath, 'utf8');

	for (const rawLine of contents.split(/\r?\n/u)) {
		const line = rawLine.trim();
		if (!line || line.startsWith('#')) {
			continue;
		}

		const separatorIndex = line.indexOf('=');
		if (separatorIndex <= 0) {
			continue;
		}

		const key = line.slice(0, separatorIndex).trim();
		let value = line.slice(separatorIndex + 1).trim();

		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}

		if (key) {
			parsed[key] = value;
		}
	}

	return parsed;
}

function run(command, args, options = {}) {
	const result = spawnSync(command, args, {
		stdio: options.stdio ?? 'inherit',
		cwd: options.cwd ?? process.cwd(),
		env: options.env ?? process.env,
		encoding: options.encoding ?? 'utf8',
	});

	return result;
}

function runCaptured(command, args, options = {}) {
	return spawnSync(command, args, {
		stdio: 'pipe',
		cwd: options.cwd ?? process.cwd(),
		env: options.env ?? process.env,
		encoding: 'utf8',
		maxBuffer: 1024 * 1024 * 50,
	});
}

function getProvidedEnvKeys(args) {
	const providedKeys = new Set();

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];

		if ((arg === '-e' || arg === '--env') && args[index + 1]) {
			providedKeys.add(args[index + 1].split('=')[0]);
			index += 1;
			continue;
		}

		if (arg.startsWith('--env=')) {
			providedKeys.add(arg.slice('--env='.length).split('=')[0]);
		}
	}

	return providedKeys;
}

function injectFlowEnvArgs(args, env) {
	if (args[0] !== 'test') {
		return args;
	}

	const providedKeys = getProvidedEnvKeys(args);
	const injectedArgs = ['test'];

	for (const key of MAESTRO_FLOW_ENV_KEYS) {
		const value = env[key];
		if (!value || providedKeys.has(key)) {
			continue;
		}

		injectedArgs.push('-e', `${key}=${value}`);
	}

	injectedArgs.push(...args.slice(1));
	return injectedArgs;
}

function injectTestOutputDirArg(args) {
	if (args[0] !== 'test') {
		return args;
	}

	const alreadyConfigured = args.some(
		(arg) => arg === '--test-output-dir' || arg.startsWith('--test-output-dir='),
	);
	if (alreadyConfigured) {
		return args;
	}

	fs.mkdirSync(DEFAULT_TEST_OUTPUT_DIR, { recursive: true });
	return ['test', '--test-output-dir', DEFAULT_TEST_OUTPUT_DIR, ...args.slice(1)];
}

function bootedSimulatorExists(xcrunPath) {
	const result = run(xcrunPath, ['simctl', 'list', 'devices', 'booted', '--json'], {
		stdio: 'pipe',
	});

	if (result.status !== 0 || !result.stdout) {
		return false;
	}

	try {
		const parsed = JSON.parse(result.stdout);
		return Object.values(parsed.devices ?? {}).some((devices) =>
			Array.isArray(devices) ? devices.some((device) => device.state === 'Booted') : false,
		);
	} catch {
		return false;
	}
}

function listAvailableIosSimulators(xcrunPath) {
	const result = run(xcrunPath, ['simctl', 'list', 'devices', 'available', '--json'], {
		stdio: 'pipe',
	});

	if (result.status !== 0 || !result.stdout) {
		return [];
	}

	try {
		const parsed = JSON.parse(result.stdout);
		return Object.values(parsed.devices ?? {}).flatMap((devices) =>
			Array.isArray(devices) ? devices.filter((device) => device?.isAvailable) : [],
		);
	} catch {
		return [];
	}
}

function pickPreferredIosSimulator(devices) {
	if (!Array.isArray(devices) || devices.length === 0) {
		return null;
	}

	const scoreDevice = (device) => {
		const name = String(device?.name ?? '');
		const typeIdentifier = String(device?.deviceTypeIdentifier ?? '');
		const isIphone = name.includes('iPhone') || typeIdentifier.includes('iPhone');
		const lastBootedAt = Date.parse(device?.lastBootedAt ?? '') || 0;

		return {
			isIphone,
			lastBootedAt,
		};
	};

	return [...devices].sort((left, right) => {
		const leftScore = scoreDevice(left);
		const rightScore = scoreDevice(right);

		if (leftScore.isIphone !== rightScore.isIphone) {
			return leftScore.isIphone ? -1 : 1;
		}

		if (leftScore.lastBootedAt !== rightScore.lastBootedAt) {
			return rightScore.lastBootedAt - leftScore.lastBootedAt;
		}

		return String(left?.name ?? '').localeCompare(String(right?.name ?? ''));
	})[0];
}

function ensureBootedIosSimulator() {
	if (process.platform !== 'darwin') {
		return;
	}

	const xcrunPath = resolveExecutable('xcrun', ['/usr/bin/xcrun']);
	if (!xcrunPath) {
		return;
	}

	if (bootedSimulatorExists(xcrunPath)) {
		return;
	}

	const preferredDevice = pickPreferredIosSimulator(listAvailableIosSimulators(xcrunPath));
	if (!preferredDevice?.udid) {
		return;
	}

	run('/usr/bin/open', ['-a', 'Simulator'], { stdio: 'ignore' });
	run(xcrunPath, ['simctl', 'boot', preferredDevice.udid], { stdio: 'ignore' });
	run(xcrunPath, ['simctl', 'bootstatus', preferredDevice.udid, '-b'], { stdio: 'ignore' });
	console.error(
		`[maestro] Booted iOS simulator ${preferredDevice.name} (${preferredDevice.udid})`,
	);
}

function pregrantIosSimulatorPermissions() {
	if (process.platform !== 'darwin') {
		return;
	}

	const xcrunPath = resolveExecutable('xcrun', ['/usr/bin/xcrun']);
	if (!xcrunPath || !bootedSimulatorExists(xcrunPath)) {
		return;
	}

	for (const service of IOS_PERMISSION_SERVICES) {
		run(xcrunPath, ['simctl', 'privacy', 'booted', 'grant', service, APP_ID], {
			stdio: 'ignore',
		});
	}
}

async function warmExpoIosBundle(options = {}) {
	const launchAssetCandidates = [];

	if (options.launchAssetUrl) {
		launchAssetCandidates.push(options.launchAssetUrl);
	} else {
		const manifestDetails = await fetchExpoManifest(options.manifestUrls ?? []);
		if (manifestDetails?.launchAssetUrl) {
			launchAssetCandidates.push(manifestDetails.launchAssetUrl);
		}
	}

	for (const launchAssetUrl of launchAssetCandidates) {
		try {
			const bundleResponse = await fetch(launchAssetUrl);
			if (!bundleResponse.ok) {
				continue;
			}

			if (bundleResponse.body) {
				for await (const _chunk of bundleResponse.body) {
					// Drain the stream so Metro completes the first compile before Maestro launches.
				}
			} else {
				await bundleResponse.arrayBuffer();
			}

			console.error(`[maestro] Warmed Expo iOS bundle from ${launchAssetUrl}`);
			return true;
		} catch {
			// Ignore and fall back to the next known launch asset URL.
		}
	}

	return false;
}

function splitTestArgs(args) {
	const commonArgs = ['test'];
	const targets = [];
	let expectingValue = false;

	for (let index = 1; index < args.length; index += 1) {
		const arg = args[index];

		if (expectingValue) {
			commonArgs.push(arg);
			expectingValue = false;
			continue;
		}

		if (arg.startsWith('--env=')) {
			commonArgs.push(arg);
			continue;
		}

		if (arg.startsWith('--format=')) {
			commonArgs.push(arg);
			continue;
		}

		if (arg.startsWith('--output=')) {
			commonArgs.push(arg);
			continue;
		}

		if (arg.startsWith('-')) {
			commonArgs.push(arg);
			expectingValue = MAESTRO_FLAGS_WITH_VALUE.has(arg);
			continue;
		}

		targets.push(arg);
	}

	return { commonArgs, targets };
}

function expandFlowTargets(targets) {
	const expandedTargets = [];

	for (const target of targets) {
		if (!target || target.startsWith('-')) {
			continue;
		}

		const absoluteTarget = path.resolve(process.cwd(), target);
		if (!fs.existsSync(absoluteTarget)) {
			expandedTargets.push(target);
			continue;
		}

		const stats = fs.statSync(absoluteTarget);
		if (!stats.isDirectory()) {
			expandedTargets.push(target);
			continue;
		}

		const nestedFlows = fs
			.readdirSync(absoluteTarget)
			.filter((entry) => entry.endsWith('.yaml'))
			.sort((left, right) => left.localeCompare(right))
			.map((entry) => path.join(target, entry));

		if (nestedFlows.length === 0) {
			expandedTargets.push(target);
			continue;
		}

		expandedTargets.push(...nestedFlows);
	}

	return expandedTargets;
}

function emitCapturedOutput(result) {
	if (result.stdout) {
		process.stdout.write(result.stdout);
	}

	if (result.stderr) {
		process.stderr.write(result.stderr);
	}
}

function isRetriableMaestroFailure(result) {
	const output = [result.stdout ?? '', result.stderr ?? '', result.error?.message ?? '']
		.join('\n')
		.trim();

	return RETRIABLE_MAESTRO_PATTERNS.some((pattern) => pattern.test(output));
}

async function runMaestroWithRetries(maestroPath, args, env) {
	const maxAttempts = 2;
	const manifestUrls = createExpoIosManifestUrls(getExpoPort(env));

	for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
		const result = runCaptured(maestroPath, args, { env });
		emitCapturedOutput(result);

		if ((result.status ?? 1) === 0) {
			return result;
		}

		if (attempt === maxAttempts || !isRetriableMaestroFailure(result)) {
			return result;
		}

		console.error(
			`[maestro] Retrying after transient iOS automation failure (${attempt}/${maxAttempts})`,
		);
		ensureBootedIosSimulator();
		pregrantIosSimulatorPermissions();
		await warmExpoIosBundle({ manifestUrls });
	}

	return { status: 1 };
}

async function runSequentialTestFlows(maestroPath, args, env) {
	const { commonArgs, targets } = splitTestArgs(args);
	const expandedTargets = expandFlowTargets(targets);
	const failures = [];

	for (const target of expandedTargets) {
		console.error(`[maestro] Running ${target}`);
		const result = await runMaestroWithRetries(maestroPath, [...commonArgs, target], env);
		if ((result.status ?? 1) !== 0) {
			failures.push(target);
		}
	}

	if (failures.length > 0) {
		console.error(`[maestro] Failed flows: ${failures.join(', ')}`);
		return 1;
	}

	return 0;
}

async function main() {
	const maestroPath = resolveExecutable('maestro', DEFAULT_MAESTRO_PATHS);
	if (!maestroPath) {
		console.error(
			'Maestro CLI was not found. Install it or add ~/.maestro/bin to your PATH before running e2e tests.',
		);
		process.exit(127);
	}

	const envFromFile = loadEnvFile(path.join(process.cwd(), '.env.test'));
	ensureBootedIosSimulator();
	pregrantIosSimulatorPermissions();
	const expoServer = await ensureExpoE2eServer(envFromFile);
	await warmExpoIosBundle({ launchAssetUrl: expoServer.launchAssetUrl });

	const env = {
		...envFromFile,
		...process.env,
		E2E_EXPO_PORT: process.env.E2E_EXPO_PORT ?? expoServer.port,
		DESIGN_SYSTEM_DEEPLINK:
			process.env.DESIGN_SYSTEM_DEEPLINK ||
			envFromFile.DESIGN_SYSTEM_DEEPLINK ||
			DEFAULT_DESIGN_SYSTEM_DEEPLINK,
		E2E_DEV_CLIENT_URL:
			process.env.E2E_DEV_CLIENT_URL ?? buildDevClientOpenUrl(expoServer.launchAssetUrl),
	};

	const { filteredArgs, excludedTargets } = collectExcludeArgs(process.argv.slice(2));
	const args = injectFlowEnvArgs(
		injectTestOutputDirArg(filterExcludedTargets(filteredArgs, excludedTargets)),
		env,
	);
	const shouldRunSequentially =
		args[0] === 'test' &&
		!args.some(
			(arg) =>
				arg === '--format' ||
				arg.startsWith('--format=') ||
				arg === '--output' ||
				arg.startsWith('--output='),
		);

	if (shouldRunSequentially) {
		process.exit(await runSequentialTestFlows(maestroPath, args, env));
	}

	const result = await runMaestroWithRetries(maestroPath, args, env);
	process.exit(result.status ?? 1);
}

void main();
