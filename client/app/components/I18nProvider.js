'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

export default function I18nProvider({ children }) {
  const [i18nInstance, setI18nInstance] = useState(null);

  useEffect(() => {
    // Initialize i18n on client side
    if (typeof window !== 'undefined' && !i18n.isInitialized) {
      i18n.init({
        resources: {
          en: { translation: require('../i18n/en.json') },
          hi: { translation: require('../i18n/hi.json') }
        },
        lng: localStorage.getItem('lang') || 'en',
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false
        },
        react: {
          useSuspense: false
        }
      }).then(() => {
        setI18nInstance(i18n);
      });
    } else {
      setI18nInstance(i18n);
    }
  }, []);

  if (!i18nInstance) {
    return <div>Loading...</div>;
  }

  return (
    <I18nextProvider i18n={i18nInstance}>
      {children}
    </I18nextProvider>
  );
}