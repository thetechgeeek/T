import { parseCsv, rowsToCsv } from '../csv';

describe('csv utilities', () => {
	it('escapes comma, quote, and newline cells', () => {
		const csv = rowsToCsv([
			{ name: 'Glossy, White', notes: 'Size "60x60"', active: true },
			{ name: 'Floor', notes: 'Line\nbreak', active: false },
		]);

		expect(csv).toContain('"Glossy, White"');
		expect(csv).toContain('"Size ""60x60"""');
		expect(csv).toContain('"Line\nbreak"');
	});

	it('parses quoted CSV rows', () => {
		expect(parseCsv('name,notes\n"Glossy, White","Size ""60x60"""')).toEqual([
			{ name: 'Glossy, White', notes: 'Size "60x60"' },
		]);
	});
});
