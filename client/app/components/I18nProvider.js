'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';

if (!i18n.isInitialized) {
  // Initialize once, synchronously kick off. No suspense, no gating.
  i18n.init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    lng: (typeof window !== 'undefined' && localStorage.getItem('lang')) || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export default function I18nProvider({ children }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
