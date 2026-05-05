import en from '../locales/en.json';
import hi from '../locales/hi.json';

const i18next = jest.requireActual<typeof import('i18next')>('i18next');

async function createTestI18n(lng: 'en' | 'hi') {
	const instance = i18next.createInstance();
	await instance.init({
		lng,
		fallbackLng: 'en',
		resources: {
			en: { translation: en },
			hi: { translation: hi },
		},
		interpolation: { escapeValue: false },
	});
	return instance;
}

describe('i18n pluralization', () => {
	it('uses English plural forms for inventory and invoice counts', async () => {
		const i18n = await createTestI18n('en');

		expect(i18n.t('inventory.variantCount', { count: 1 })).toBe('1 Variant');
		expect(i18n.t('inventory.variantCount', { count: 2 })).toBe('2 Variants');
		expect(i18n.t('invoice.itemCount', { count: 0 })).toBe('0 items');
		expect(i18n.t('invoice.itemCount', { count: 1 })).toBe('1 item');
		expect(i18n.t('invoice.itemCount', { count: 2 })).toBe('2 items');
	});

	it('uses Hindi plural forms through i18next rules', async () => {
		const i18n = await createTestI18n('hi');

		expect(i18n.t('inventory.variantCount', { count: 1 })).toBe('1 वैरिएंट');
		expect(i18n.t('inventory.variantCount', { count: 2 })).toBe('2 वैरिएंट');
		expect(i18n.t('invoice.itemCount', { count: 0 })).toBe('0 आइटम');
		expect(i18n.t('invoice.itemCount', { count: 1 })).toBe('1 आइटम');
		expect(i18n.t('invoice.itemCount', { count: 2 })).toBe('2 आइटम');
	});
});
