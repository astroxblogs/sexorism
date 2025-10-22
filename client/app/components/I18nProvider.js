'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

export default function I18nProvider({ children }) {
  const [i18nInstance, setI18nInstance] = useState(null);

  useEffect(() => {
     // Initialize i18n on client side
    if (typeof window !== 'undefined' && !i18n.isInitialized) {
      // Prefer the server-set cookie (set by middleware) so /hi boots in Hindi,
      // then fall back to localStorage, then 'en'.
      let initialLng = 'en';
      try {
        const m = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=(hi|en)/i);
        if (m && m[1]) initialLng = m[1].toLowerCase();
      } catch {}
      if (!initialLng) {
        try { initialLng = (localStorage.getItem('lang') || 'en').toLowerCase(); } catch {}
      }
      if (initialLng !== 'hi') initialLng = 'en';

      i18n.init({
        resources: {
          en: { translation: require('../i18n/en.json') },
          hi: { translation: require('../i18n/hi.json') }
        },
        lng: initialLng,
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false
        },
        react: {
          useSuspense: false
        }
      }).then(() => {
        // Persist chosen language so client-only transitions stay aligned
        try { localStorage.setItem('lang', i18n.language || initialLng); } catch {}
        // Mirror to cookie for consistency with middleware
        try {
         document.cookie = `NEXT_LOCALE=${i18n.language || initialLng}; Path=/; Max-Age=${60*60*24*365}; SameSite=Lax`;
        } catch {}
        setI18nInstance(i18n);
      });
    } else {
      setI18nInstance(i18n);
    }
  }, []);

   // Avoid any UI flash before i18n is ready
  if (!i18nInstance) return null;

  return (
    <I18nextProvider i18n={i18nInstance}>
      {children}
    </I18nextProvider>
  );
}