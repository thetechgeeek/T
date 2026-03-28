/**
 * Appends Supabase Storage image transform parameters to a URL.
 * Only applies to Supabase storage URLs — passes other URLs through unchanged.
 *
 * @param url    Original image URL (may be null/undefined)
 * @param width  Desired width in px (default 200 for list thumbnails)
 * @param quality JPEG quality 1-100 (default 75)
 */
export function getThumbUrl(
	url: string | null | undefined,
	width = 200,
	quality = 75,
): string | undefined {
	if (!url) return undefined;

	// Only transform Supabase storage URLs
	if (!url.includes('/storage/v1/object/')) return url;

	// Avoid double-transforming already-transformed URLs
	if (url.includes('width=') || url.includes('quality=')) return url;

	const separator = url.includes('?') ? '&' : '?';
	return `${url}${separator}width=${width}&quality=${quality}`;
}
