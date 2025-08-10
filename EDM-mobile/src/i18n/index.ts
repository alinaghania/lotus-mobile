import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Try to polyfill Intl.PluralRules if missing (common on RN/Hermes)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (typeof (global as any).Intl === 'undefined' || typeof (Intl as any).PluralRules === 'undefined') {
  try {
    // Optional polyfill if installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('intl-pluralrules');
  } catch {
    // Minimal fallback: supports only 'one' / 'other'
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (global as any).Intl = (global as any).Intl || {};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (global as any).Intl.PluralRules = function () {
      return {
        select: (n: number) => (n === 1 ? 'one' : 'other'),
      };
    } as any;
  }
}

import en from '../locales/en.json';
import fr from '../locales/fr.json';
import es from '../locales/es.json';
import de from '../locales/de.json';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es },
  de: { translation: de },
};

function detectLanguage() {
  try {
    // Expo SDK 49+: use getLocales()
    // @ts-ignore
    if (typeof (Localization as any).getLocales === 'function') {
      // @ts-ignore
      const locales = (Localization as any).getLocales();
      const tag = locales && locales.length > 0 ? locales[0].languageTag : 'en-US';
      return (tag || 'en-US').split('-')[0];
    }
    // Fallback to Localization.locale
    const tag = (Localization as any).locale || 'en-US';
    return (tag || 'en-US').split('-')[0];
  } catch {
    return 'en';
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: detectLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n; 