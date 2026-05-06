#!/usr/bin/env node
import { spawnSync } from 'child_process';
import { parseCliArgs } from './lib/repo-tools.mjs';

const TYPE_HEADINGS = {
	feat: 'Features',
	fix: 'Fixes',
	perf: 'Performance',
	refactor: 'Refactors',
	ci: 'CI',
	docs: 'Docs',
	test: 'Tests',
	chore: 'Chores',
	build: 'Build',
	style: 'Style',
	revert: 'Reverts',
};

function git(args) {
	const result = spawnSync('git', args, { encoding: 'utf8' });
	if (result.status !== 0) {
		throw new Error(result.stderr || `git ${args.join(' ')} failed`);
	}
	return result.stdout.trim();
}

function latestTag() {
	const result = spawnSync('git', ['describe', '--tags', '--abbrev=0'], { encoding: 'utf8' });
	return result.status === 0 ? result.stdout.trim() : '';
}

function parseSubject(line) {
	const [hash, subject] = line.split('\t');
	const match = /^(?<type>[a-z]+)(\([^)]+\))?!?: (?<summary>.+)$/.exec(subject ?? '');
	return {
		hash,
		subject,
		type: match?.groups?.type ?? 'chore',
		summary: match?.groups?.summary ?? subject,
	};
}

const { flags } = parseCliArgs(process.argv.slice(2), {
	string: ['from', 'to'],
});
const from = flags.from ? String(flags.from) : latestTag();
const to = flags.to ? String(flags.to) : 'HEAD';
const range = from ? `${from}..${to}` : to;
const log = git(['log', '--pretty=format:%h%x09%s', range]);
const commits = log ? log.split(/\r?\n/).map(parseSubject) : [];
const grouped = new Map();

for (const commit of commits) {
	const list = grouped.get(commit.type) ?? [];
	list.push(commit);
	grouped.set(commit.type, list);
}

const lines = [`# Release Notes`, '', `Range: ${range}`, ''];

if (commits.length === 0) {
	lines.push('No commits found.');
} else {
	for (const [type, heading] of Object.entries(TYPE_HEADINGS)) {
		const list = grouped.get(type);
		if (!list?.length) continue;
		lines.push(`## ${heading}`, '');
		for (const commit of list) {
			lines.push(`- ${commit.summary} (${commit.hash})`);
		}
		lines.push('');
	}
}

process.stdout.write(`${lines.join('\n').trimEnd()}\n`);
