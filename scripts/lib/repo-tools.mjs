import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const DEFAULT_IGNORE_DIRS = new Set([
	'.expo',
	'.git',
	'.turbo',
	'coverage',
	'dist',
	'node_modules',
]);

export class ToolingError extends Error {
	constructor(message, details = {}) {
		super(message);
		this.name = 'ToolingError';
		this.details = details;
	}
}

export function findRepoRoot(startDir = process.cwd()) {
	let current = path.resolve(startDir);

	while (true) {
		if (fs.existsSync(path.join(current, 'package.json'))) {
			return current;
		}

		const parent = path.dirname(current);
		if (parent === current) {
			throw new ToolingError('Could not find repository root.', { startDir });
		}
		current = parent;
	}
}

export function parseCliArgs(args = process.argv.slice(2), spec = {}) {
	const stringFlags = new Set(spec.string ?? []);
	const booleanFlags = new Set(spec.boolean ?? []);
	const aliases = spec.aliases ?? {};
	const flags = {};
	const positionals = [];

	function canonical(name) {
		return aliases[name] ?? name;
	}

	function setFlag(name, value) {
		flags[canonical(name)] = value;
	}

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];

		if (!arg.startsWith('--')) {
			positionals.push(arg);
			continue;
		}

		if (arg.startsWith('--no-')) {
			setFlag(arg.slice('--no-'.length), false);
			continue;
		}

		const eqIndex = arg.indexOf('=');
		if (eqIndex !== -1) {
			setFlag(arg.slice(2, eqIndex), arg.slice(eqIndex + 1));
			continue;
		}

		const name = arg.slice(2);
		if (stringFlags.has(name)) {
			const next = args[index + 1];
			if (!next || next.startsWith('--')) {
				throw new ToolingError(`Missing value for --${name}.`, { flag: name });
			}
			setFlag(name, next);
			index += 1;
			continue;
		}

		if (booleanFlags.has(name) || !stringFlags.has(name)) {
			setFlag(name, true);
		}
	}

	return { flags, positionals };
}

export function isDryRun(flags) {
	return Boolean(flags['dry-run'] ?? flags.dryRun);
}

export function loadEnvFile(filePath, options = {}) {
	const optional = options.optional ?? true;
	const resolved = path.resolve(filePath);

	if (!fs.existsSync(resolved)) {
		if (optional) return {};
		throw new ToolingError('Missing environment file.', { filePath: resolved });
	}

	const env = {};
	const lines = fs.readFileSync(resolved, 'utf8').split(/\r?\n/);

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;

		const eqIndex = trimmed.indexOf('=');
		if (eqIndex === -1) continue;

		const key = trimmed.slice(0, eqIndex).trim();
		let value = trimmed.slice(eqIndex + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		env[key] = value;
	}

	return env;
}

export function resolveScriptConfig(options = {}) {
	const mode = options.mode ?? process.env.NODE_ENV ?? 'dev';
	const envFile = options.envFile ? loadEnvFile(options.envFile, { optional: true }) : {};
	const env = { ...envFile, ...process.env, ...(options.env ?? {}) };
	const requiredEnv = options.requiredEnv ?? [];
	const missingEnv = requiredEnv.filter((name) => !env[name]);

	if (missingEnv.length > 0) {
		throw new ToolingError('Missing required environment variables.', { mode, missingEnv });
	}

	return {
		mode,
		env,
		root: options.root ?? findRepoRoot(options.cwd ?? process.cwd()),
		dryRun: Boolean(options.dryRun),
	};
}

export function walkFiles(root, options = {}) {
	const resolvedRoot = path.resolve(root);
	const ignoreDirs = new Set([...(options.ignoreDirs ?? DEFAULT_IGNORE_DIRS)]);
	const extensions = options.extensions ? new Set(options.extensions) : null;
	const include = options.include ?? (() => true);
	const exclude = options.exclude ?? (() => false);
	const out = [];

	function walk(dir) {
		let entries;
		try {
			entries = fs.readdirSync(dir, { withFileTypes: true });
		} catch {
			return;
		}

		for (const entry of entries) {
			if (entry.name.startsWith('.') && ignoreDirs.has(entry.name)) continue;
			const absolute = path.join(dir, entry.name);

			if (entry.isDirectory()) {
				if (!ignoreDirs.has(entry.name)) walk(absolute);
				continue;
			}

			const relative = path.relative(resolvedRoot, absolute).split(path.sep).join('/');
			if (extensions && !extensions.has(path.extname(entry.name))) continue;
			if (!include(relative, absolute)) continue;
			if (exclude(relative, absolute)) continue;
			out.push(relative);
		}
	}

	walk(resolvedRoot);
	return out.sort();
}

export function assertToolAvailable(command, options = {}) {
	const pathEnv = options.pathEnv ?? process.env.PATH ?? '';
	const pathEntries = pathEnv.split(path.delimiter).filter(Boolean);
	const executableNames =
		process.platform === 'win32' ? [command, `${command}.cmd`, `${command}.exe`] : [command];

	for (const dir of pathEntries) {
		for (const executableName of executableNames) {
			const candidate = path.join(dir, executableName);
			try {
				fs.accessSync(candidate, fs.constants.X_OK);
				return candidate;
			} catch {
				// Keep scanning PATH.
			}
		}
	}

	throw new ToolingError(`Missing prerequisite tool: ${command}.`, { command });
}

export function runCommand(command, args = [], options = {}) {
	const result = spawnSync(command, args, {
		cwd: options.cwd ?? process.cwd(),
		env: options.env ?? process.env,
		encoding: 'utf8',
		stdio: options.stdio ?? 'pipe',
	});

	if (result.error) {
		throw new ToolingError(`Failed to run ${command}.`, {
			command,
			args,
			cause: result.error.message,
		});
	}

	if (result.status !== 0 && !options.allowFailure) {
		throw new ToolingError(`${command} exited with status ${result.status}.`, {
			command,
			args,
			status: result.status,
			stdout: result.stdout,
			stderr: result.stderr,
		});
	}

	return result;
}

export function createViolation(input) {
	return {
		severity: input.severity ?? 'error',
		file: input.file ?? '',
		line: input.line,
		rule: input.rule,
		message: input.message,
	};
}

export function formatViolation(violation) {
	const location = violation.line ? `${violation.file}:${violation.line}` : violation.file;
	return `${violation.severity} ${location} ${violation.rule} ${violation.message}`.trim();
}

export function formatViolations(violations) {
	return violations.map(formatViolation).join('\n');
}

export function toViolationReport(name, violations) {
	return {
		name,
		status: violations.length > 0 ? 'failed' : 'ok',
		violations,
	};
}

export function printViolationReport(name, violations, options = {}) {
	const stream = options.stream ?? process.stderr;
	const json = options.json ?? false;
	const report = toViolationReport(name, violations);

	if (json) {
		stream.write(`${JSON.stringify(report, null, 2)}\n`);
		return report;
	}

	if (violations.length > 0) {
		stream.write(`${name} violations found:\n\n${formatViolations(violations)}\n`);
		return report;
	}

	stream.write(`${name}: OK\n`);
	return report;
}
