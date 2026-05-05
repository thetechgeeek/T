import en from '@/src/i18n/locales/en.json';
import hi from '@/src/i18n/locales/hi.json';
import { InsufficientStockError, NetworkError, getTranslatedErrorMessage } from './AppError';

function lookup(
	resources: Record<string, unknown>,
	key: string,
	options?: Record<string, unknown>,
) {
	const template = key.split('.').reduce<unknown>((node, part) => {
		if (node && typeof node === 'object' && part in node) {
			return (node as Record<string, unknown>)[part];
		}
		return undefined;
	}, resources);

	const raw = typeof template === 'string' ? template : String(options?.defaultValue ?? key);
	return raw.replace(/\{\{(\w+)\}\}/g, (_, token: string) => String(options?.[token] ?? ''));
}

describe('AppError i18n resources', () => {
	it('renders English AppError output from translation keys', () => {
		expect(
			getTranslatedErrorMessage(new NetworkError('offline'), (key, options) =>
				lookup(en, key, options),
			),
		).toBe('Network error. Please check your connection.');
	});

	it('renders Hindi AppError output with interpolation', () => {
		const err = new InsufficientStockError('Marble Tile', 5, 20);

		expect(getTranslatedErrorMessage(err, (key, options) => lookup(hi, key, options))).toBe(
			'"Marble Tile" के लिए पर्याप्त स्टॉक नहीं है। उपलब्ध: 5, मांगा गया: 20',
		);
	});
});
