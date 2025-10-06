// client/src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json'; // Keep English
import hi from './hi.json'; // Keep Hindi

// Removed all other language imports (es, fr, bn, mr, te, ta, gu)

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi }

    },
    lng: typeof window !== 'undefined' ? localStorage.getItem('lang') || 'en' : 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;