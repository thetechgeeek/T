import fs from 'node:fs';
import process from 'node:process';

const TARGETS = [
	{
		file: 'app/(app)/settings/items.tsx',
		phrases: [
			'Item Settings',
			'General',
			'Pricing',
			'Display',
			'Tracking',
			'Items Module',
			'Master switch for all item features',
			'Barcode Scanning',
			'Track Stock by Default',
		],
	},
	{
		file: 'app/(app)/settings/reminders.tsx',
		phrases: [
			'Payment Reminders',
			'Auto Reminders',
			'Reminder Schedule',
			'First reminder after',
			'Second reminder after',
			'Third reminder after',
			'Channel',
			'WhatsApp',
			'SMS',
			'Both',
			'नमस्ते {PartyName}',
		],
	},
	{
		file: 'app/(app)/settings/firms.tsx',
		phrases: ['Add Business', 'Manage Businesses', 'My Business'],
	},
	{
		file: 'app/(app)/settings/business-profile.tsx',
		phrases: ['Business Profile', 'Business Description (max 200 chars)', 'Business Logo'],
	},
	{
		file: 'app/(app)/suppliers/add.tsx',
		phrases: [
			'Add Supplier',
			'Supplier Name',
			'Contact Person',
			'GST Type',
			'GST Details',
			'Terms & Notes',
			'Save Supplier',
			'Regular',
			'Composition',
			'Unregistered',
		],
	},
	{
		file: 'app/(app)/customers/add.tsx',
		phrases: ['Customer Type', 'Individual', 'Business'],
	},
	{
		file: 'src/features/inventory-add/InventoryAddScreen.tsx',
		phrases: ['Basic Info', 'Pricing', 'Track Stock', 'Primary Unit'],
	},
];

const violations = [];

function escapeRegex(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

for (const target of TARGETS) {
	const source = fs.readFileSync(target.file, 'utf8');
	for (const phrase of target.phrases) {
		const literalPattern = new RegExp(`(["'\`])${escapeRegex(phrase)}\\1`);
		if (literalPattern.test(source)) {
			violations.push(`${target.file}: ${phrase}`);
		}
	}
}

if (violations.length) {
	console.error('Hardcoded i18n audit phrases remain:');
	for (const violation of violations) console.error(`  - ${violation}`);
	process.exit(1);
}

console.log('No hardcoded i18n audit phrases remain.');
