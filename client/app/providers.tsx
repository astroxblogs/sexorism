'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './components/ThemeContext';
import { ShareProvider } from './context/ShareContext';
import { BlogProvider } from './context/BlogContext';

// i18n -> api language
import { useTranslation } from 'react-i18next';
import { setApiLanguage } from './lib/api';

// --- Consent state + helpers (minimal, no UI impact elsewhere) ---
type ConsentState = 'granted' | 'denied' | 'unset';

const GTM_ID = 'GTM-PJPB3FJL';

// Simple cookie get/set that avoids external deps
function getConsentFromCookie(): ConsentState {
  try {
    const cookie = ('; ' + document.cookie).split('; ').find(c => c.startsWith('Sexorism_consent='));
    if (!cookie) return 'unset';
    const val = decodeURIComponent(cookie.split('=')[1] || '');
    if (val === 'granted' || val === 'denied') return val;
    return 'unset';
  } catch { return 'unset'; }
}
function setConsentCookie(val: Exclude<ConsentState, 'unset'>) {
  try {
    const fifteenDays = 15 * 24 * 60 * 60; // 15 days in seconds
    document.cookie = `Sexorism_consent=${val}; Max-Age=${fifteenDays}; Path=/; SameSite=Lax`;
  } catch {}
}


// Lazy create noscript iframe only after consent
function renderGtmNoscript() {
  if (document.getElementById('__gtm_noscript')) return;
  const wrap = document.createElement('div');
  wrap.id = '__gtm_noscript';
  wrap.style.display = 'contents';
  wrap.innerHTML = `
    <noscript>
      <iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0"
        style="display:none;visibility:hidden"></iframe>
    </noscript>`;
  document.body.prepend(wrap);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  // NEW: avoid SSR/client mismatch
  const [mounted, setMounted] = useState(false);

  const [consent, setConsent] = useState<ConsentState>('unset');

  // --- Keep API lang synced with i18n ---
  useEffect(() => {
    const lng = i18n?.resolvedLanguage || i18n?.language || 'en';
    setApiLanguage(lng);
    const onChange = (newLng: string) => setApiLanguage(newLng || 'en');
    i18n?.on?.('languageChanged', onChange);
    return () => i18n?.off?.('languageChanged', onChange);
  }, [i18n]);

  // Mount + initialize consent ONLY on client
  useEffect(() => {
    setMounted(true); // let React hydrate first with no banner differences
    const fromCookie = getConsentFromCookie();
    setConsent(fromCookie);

    if (fromCookie === 'granted') {
      (window as any).gtag?.('consent', 'update', {
        'ad_storage': 'granted',
        'analytics_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted'
      });
      (window as any).__loadGTM?.(GTM_ID);
      renderGtmNoscript();
    }
  }, []);

  const accept = useCallback(() => {
    setConsent('granted');
    setConsentCookie('granted');
    (window as any).gtag?.('consent', 'update', {
      'ad_storage': 'granted',
      'analytics_storage': 'granted',
      'ad_user_data': 'granted',
      'ad_personalization': 'granted'
    });
    (window as any).__loadGTM?.(GTM_ID);
    renderGtmNoscript();
  }, []);

  const reject = useCallback(() => {
    setConsent('denied');
    setConsentCookie('denied');
    (window as any).gtag?.('consent', 'update', {
      'ad_storage': 'denied',
      'analytics_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied'
    });
  }, []);

  // Only render the banner AFTER mount, and only if consent is unset
  const Banner = useMemo(() => {
    if (!mounted || consent !== 'unset') return null;
    return (
      <div
        className="fixed inset-x-0 bottom-0 z-50 bg-black/90 text-white px-4 py-3 md:py-4"
        style={{ backdropFilter: 'saturate(180%) blur(6px)' }}
      >
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-sm md:text-base leading-snug">
            We and selected partners (Google) use cookies and similar technologies for analytics and ads.
            Click “Accept” to enable; “Reject” to continue with essential cookies only. You can change this later in Privacy Policy.
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={reject}
              className="px-3 py-2 rounded-md border border-white/30 text-sm hover:bg-white/10 transition"
            >
              Reject
            </button>
            <button
              onClick={accept}
              className="px-3 py-2 rounded-md bg-white text-black text-sm hover:opacity-90 transition"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    );
  }, [mounted, consent, accept, reject]);

  return (
    <ThemeProvider>
      <ShareProvider>
        <BlogProvider>
          {children}
          {Banner}
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
