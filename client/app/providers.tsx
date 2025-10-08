'use client';

import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './components/ThemeContext';
import { ShareProvider } from './context/ShareContext';
import { BlogProvider } from './context/BlogContext';

// ⬇️ NEW: wire i18n -> api language
import { useTranslation } from 'react-i18next';
import { setApiLanguage } from './lib/api'; // make sure path resolves

export function Providers({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    // set immediately for first render
    const lng = i18n?.resolvedLanguage || i18n?.language || 'en';
    setApiLanguage(lng);

    // keep api lang in sync on every toggle
    const onChange = (newLng: string) => setApiLanguage(newLng || 'en');
    i18n?.on?.('languageChanged', onChange);

    return () => {
      i18n?.off?.('languageChanged', onChange);
    };
  }, [i18n]);

  return (
    <ThemeProvider>
      <ShareProvider>
        <BlogProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { background: '#363636', color: '#fff' },
              success: { style: { background: '#10B981' } },
              error: { style: { background: '#EF4444' } },
            }}
          />
        </BlogProvider>
      </ShareProvider>
    </ThemeProvider>
  );
}
