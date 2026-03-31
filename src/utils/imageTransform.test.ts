import { getThumbUrl } from './imageTransform';

describe('getThumbUrl', () => {
	const supabaseStorageUrl = 'https://abc.supabase.co/storage/v1/object/public/tiles/image.jpg';

	it('returns undefined for null input', () => {
		expect(getThumbUrl(null)).toBeUndefined();
	});

	it('returns undefined for undefined input', () => {
		expect(getThumbUrl(undefined)).toBeUndefined();
	});

	it('returns undefined for empty string', () => {
		expect(getThumbUrl('')).toBeUndefined();
	});

	it('appends width and quality to a Supabase storage URL', () => {
		const result = getThumbUrl(supabaseStorageUrl, 200, 75);
		expect(result).toBe(`${supabaseStorageUrl}?width=200&quality=75`);
	});

	it('uses default width=200 and quality=75 when not specified', () => {
		const result = getThumbUrl(supabaseStorageUrl);
		expect(result).toContain('width=200');
		expect(result).toContain('quality=75');
	});

	it('passes non-Supabase URLs through unchanged', () => {
		const cdnUrl = 'https://cdn.example.com/image.jpg';
		expect(getThumbUrl(cdnUrl)).toBe(cdnUrl);
	});

	it('uses & separator when URL already has query params', () => {
		const urlWithParams = `${supabaseStorageUrl}?token=abc`;
		const result = getThumbUrl(urlWithParams, 100, 80);
		expect(result).toContain('&width=100&quality=80');
	});

	it('does not double-transform a URL that already has width param', () => {
		const alreadyTransformed = `${supabaseStorageUrl}?width=200&quality=75`;
		expect(getThumbUrl(alreadyTransformed)).toBe(alreadyTransformed);
	});

	it('does not double-transform a URL that already has quality param', () => {
		const alreadyTransformed = `${supabaseStorageUrl}?quality=50`;
		expect(getThumbUrl(alreadyTransformed)).toBe(alreadyTransformed);
	});

	it('respects custom width parameter', () => {
		const result = getThumbUrl(supabaseStorageUrl, 400, 90);
		expect(result).toContain('width=400');
		expect(result).toContain('quality=90');
	});

	it('a URL without /storage/v1/object/ is not transformed', () => {
		const nonStorageUrl = 'https://abc.supabase.co/rest/v1/table?select=*';
		expect(getThumbUrl(nonStorageUrl)).toBe(nonStorageUrl);
	});
});
