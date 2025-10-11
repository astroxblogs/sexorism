'use client';

import { useEffect, useState } from 'react';
import i18n from '../i18n';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';

// We will lazy-load react-i18next on the client only.
let initialized = false;

export default function I18nProvider({ children }) {
  const [I18nextProvider, setI18nextProvider] = useState(null);

  useEffect(() => {
    let mounted = true;

    // Dynamically import react-i18next ONLY on the client
    (async () => {
      const { I18nextProvider: Provider, initReactI18next } = await import('react-i18next');

      if (!initialized && !i18n.isInitialized) {
        await i18n
          .use(initReactI18next)
          .init({
            resources: { en: { translation: en }, hi: { translation: hi } },
            lng: (typeof window !== 'undefined' && localStorage.getItem('lang')) || 'en',
            fallbackLng: 'en',
            interpolation: { escapeValue: false },
            react: { useSuspense: false },
          });
        initialized = true;
      }

      if (mounted) setI18nextProvider(() => Provider);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ✅ Never block initial render (good for SSR/crawlers).
  // If the provider isn't ready yet, just render children;
  // components using useTranslation will hydrate once Provider is mounted.
  if (!I18nextProvider) return <>{children}</>;

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
