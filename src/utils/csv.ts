export type CsvCell = string | number | boolean | null | undefined;

function normalizeCell(value: CsvCell): string {
	if (value == null) return '';
	return String(value);
}

function escapeCsvCell(value: CsvCell): string {
	const cell = normalizeCell(value);
	if (/[",\r\n]/.test(cell)) {
		return `"${cell.replace(/"/g, '""')}"`;
	}
	return cell;
}

export function rowsToCsv(rows: Record<string, CsvCell>[]): string {
	const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
	const lines = [
		headers.map(escapeCsvCell).join(','),
		...rows.map((row) => headers.map((header) => escapeCsvCell(row[header])).join(',')),
	];
	return lines.join('\n');
}

export function parseCsv(text: string): Record<string, string>[] {
	const rows: string[][] = [];
	let current = '';
	let row: string[] = [];
	let inQuotes = false;

	for (let index = 0; index < text.length; index += 1) {
		const char = text[index];
		const next = text[index + 1];

		if (char === '"' && inQuotes && next === '"') {
			current += '"';
			index += 1;
			continue;
		}

		if (char === '"') {
			inQuotes = !inQuotes;
			continue;
		}

		if (char === ',' && !inQuotes) {
			row.push(current);
			current = '';
			continue;
		}

		if ((char === '\n' || char === '\r') && !inQuotes) {
			if (char === '\r' && next === '\n') index += 1;
			row.push(current);
			rows.push(row);
			current = '';
			row = [];
			continue;
		}

		current += char;
	}

	row.push(current);
	rows.push(row);

	const [headerRow, ...dataRows] = rows.filter((cells) =>
		cells.some((cell) => cell.trim().length > 0),
	);
	if (!headerRow) return [];

	const headers = headerRow.map((header) => header.trim());
	return dataRows
		.filter((cells) => cells.some((cell) => cell.trim().length > 0))
		.map((cells) =>
			Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ''])),
		);
}
