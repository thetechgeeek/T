import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import 'intl-pluralrules';

import en from './locales/en.json';
import hi from './locales/hi.json';
import { resolveSupportedLanguage, SUPPORTED_LANGUAGES } from './runtime';

i18n.use(initReactI18next).init({
	resources: {
		en: { translation: en },
		hi: { translation: hi },
	},
	lng: resolveSupportedLanguage(),
	fallbackLng: 'en',
	supportedLngs: [...SUPPORTED_LANGUAGES],
	nonExplicitSupportedLngs: true,
	interpolation: {
		escapeValue: false,
	},
});

export default i18n;
export {
	detectDeviceLocale,
	resolveSupportedLanguage,
	SUPPORTED_LANGUAGES,
	type SupportedLanguage,
} from './runtime';
