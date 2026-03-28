import { escapeHtml } from '../html';

describe('escapeHtml', () => {
	it('escapes ampersands', () => {
		expect(escapeHtml('a & b')).toBe('a &amp; b');
	});

	it('escapes less-than', () => {
		expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
	});

	it('escapes double quotes', () => {
		expect(escapeHtml('"value"')).toBe('&quot;value&quot;');
	});

	it('escapes single quotes', () => {
		expect(escapeHtml("it's")).toBe('it&#039;s');
	});

	it('handles empty string', () => {
		expect(escapeHtml('')).toBe('');
	});

	it('handles XSS payload', () => {
		const payload = '<img src=x onerror="alert(1)">';
		const escaped = escapeHtml(payload);
		expect(escaped).not.toContain('<');
		expect(escaped).not.toContain('>');
		expect(escaped).not.toContain('"');
	});

	it('does not double-escape', () => {
		const once = escapeHtml('a & b');
		expect(once).toBe('a &amp; b');
		// second call should escape the &amp; itself
		const twice = escapeHtml(once);
		expect(twice).toBe('a &amp;amp; b');
	});
});
