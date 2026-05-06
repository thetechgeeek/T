#!/usr/bin/env node
import fs from 'fs';
import { parseCliArgs } from './lib/repo-tools.mjs';

const ALLOWED_TYPES = new Set([
	'build',
	'chore',
	'ci',
	'docs',
	'feat',
	'fix',
	'perf',
	'refactor',
	'revert',
	'style',
	'test',
]);

function readMessage(positionals, flags) {
	if (typeof flags.message === 'string') return flags.message;
	const [first] = positionals;
	if (!first) return '';
	if (fs.existsSync(first)) return fs.readFileSync(first, 'utf8');
	return first;
}

function firstMeaningfulLine(message) {
	return message
		.split(/\r?\n/)
		.map((line) => line.trim())
		.find((line) => line && !line.startsWith('#'));
}

function isGeneratedGitMessage(subject) {
	return (
		subject.startsWith('Merge ') ||
		subject.startsWith('Revert "') ||
		subject.startsWith('fixup! ') ||
		subject.startsWith('squash! ')
	);
}

function validateSubject(subject) {
	if (isGeneratedGitMessage(subject)) return [];

	const match = /^(?<type>[a-z]+)(\([a-z0-9._/-]+\))?(?<breaking>!)?: (?<summary>.+)$/.exec(
		subject,
	);
	if (!match?.groups) {
		return ['Commit subject must follow Conventional Commits: type(optional-scope): summary.'];
	}

	const errors = [];
	const { type, summary } = match.groups;
	if (!ALLOWED_TYPES.has(type)) {
		errors.push(`Unsupported commit type "${type}".`);
	}
	if (summary.trim().length === 0) {
		errors.push('Commit summary must not be empty.');
	}
	if (summary.length > 100) {
		errors.push('Commit summary must be 100 characters or fewer.');
	}
	if (/^[A-Z]/.test(summary)) {
		errors.push('Commit summary should start lowercase unless it begins with a product name.');
	}
	return errors;
}

const { flags, positionals } = parseCliArgs(process.argv.slice(2), {
	string: ['message'],
});
const subject = firstMeaningfulLine(readMessage(positionals, flags));

if (!subject) {
	console.error('Commit message is empty.');
	process.exit(1);
}

const errors = validateSubject(subject);
if (errors.length > 0) {
	console.error(
		['Invalid commit message:', `  ${subject}`, '', ...errors.map((e) => `- ${e}`)].join('\n'),
	);
	process.exit(1);
}

console.log(`commitlint: OK (${subject})`);
