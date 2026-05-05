#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import {
	createViolation,
	findRepoRoot,
	formatViolations,
	parseCliArgs,
	toViolationReport,
} from './lib/repo-tools.mjs';

const REQUIRED_SNIPPETS = [
	{
		rule: 'database-types-table',
		snippet: 'inventory_items:',
		message: 'inventory_items table type missing.',
	},
	{
		rule: 'database-types-table',
		snippet: 'invoice_line_items:',
		message: 'invoice_line_items table type missing.',
	},
	{
		rule: 'database-types-table',
		snippet: 'stock_operations:',
		message: 'stock_operations table type missing.',
	},
	{
		rule: 'database-types-fractional',
		snippet: 'box_count: number;',
		message: 'box_count must remain numeric/number typed.',
	},
	{
		rule: 'database-types-fractional',
		snippet: 'quantity_change: number;',
		message: 'stock quantity_change must remain numeric/number typed.',
	},
	{
		rule: 'database-types-rpc',
		snippet: 'perform_stock_operation_v1:',
		message: 'versioned stock RPC type missing.',
	},
	{
		rule: 'database-types-rpc',
		snippet: 'create_invoice_with_items_v1:',
		message: 'versioned invoice RPC type missing.',
	},
];

export function checkDatabaseTypes({ typesPath }) {
	const source = fs.existsSync(typesPath) ? fs.readFileSync(typesPath, 'utf8') : '';
	const violations = REQUIRED_SNIPPETS.flatMap((requirement) =>
		source.includes(requirement.snippet)
			? []
			: [
					createViolation({
						file: typesPath,
						rule: requirement.rule,
						message: requirement.message,
					}),
				],
	);

	return toViolationReport('database-types', violations);
}

function main() {
	const root = findRepoRoot(process.cwd());
	const { flags } = parseCliArgs(process.argv.slice(2), {
		boolean: ['json'],
		string: ['types-path'],
	});
	const typesPath = path.resolve(root, String(flags['types-path'] ?? 'src/types/database.ts'));
	const report = checkDatabaseTypes({ typesPath });

	if (flags.json) {
		console.log(JSON.stringify(report, null, 2));
	} else if (report.violations.length > 0) {
		console.error(formatViolations(report.violations));
	} else {
		console.log('Database type contract check passed.');
	}

	if (report.violations.length > 0) {
		process.exit(1);
	}
}

main();
