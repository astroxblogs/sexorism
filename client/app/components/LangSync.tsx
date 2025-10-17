'use client';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { setApiLanguage } from '../lib/api';

const ONE_YEAR = 60 * 60 * 24 * 365;

type Lang = 'en' | 'hi';

const readCookieLang = (): Lang | '' => {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=(hi|en)/i);
  const v = (m && m[1]) ? m[1].toLowerCase() : '';
  return v === 'hi' ? 'hi' : v === 'en' ? 'en' : '';
};

const writeCookieLang = (lang: Lang) => {
  if (typeof document === 'undefined') return;
  const v: Lang = lang === 'hi' ? 'hi' : 'en';
  document.cookie = `NEXT_LOCALE=${v}; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax`;
  try { localStorage.setItem('lang', v); } catch {}
};

export default function LangSync(): null {
  const { i18n } = useTranslation();

  useEffect(() => {
    const i18nLangRaw = (i18n?.resolvedLanguage || i18n?.language || 'en').toLowerCase();
    const i18nLang: Lang = i18nLangRaw.startsWith('hi') ? 'hi' : 'en';

    // 1) cookie wins (so SSR & CSR agree), else i18n, else 'en'
    const cookieLang = readCookieLang();
    const effective: Lang = cookieLang || i18nLang;

    // 2) persist so SSR reads it
    writeCookieLang(effective);

    // 3) tell axios layer
    setApiLanguage(effective);

    // 4) keep cookie + axios in sync when i18n language changes
    const onChange = (newLng: string) => {
      const v: Lang = String(newLng || '').toLowerCase().startsWith('hi') ? 'hi' : 'en';
      writeCookieLang(v);
      setApiLanguage(v);
    };

    i18n?.on?.('languageChanged', onChange);
    return () => {
      i18n?.off?.('languageChanged', onChange);
    };
  }, [i18n]);

  return null;
}
