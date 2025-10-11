'use client';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { setApiLanguage } from '../lib/api';

export default function LangSync() {
  const { i18n } = useTranslation();
  useEffect(() => {
    const lng = i18n?.resolvedLanguage || i18n?.language || 'en';
    setApiLanguage(lng);
    const onChange = (newLng: string) => setApiLanguage(newLng || 'en');
    i18n?.on?.('languageChanged', onChange);
    return () => i18n?.off?.('languageChanged', onChange);
  }, [i18n]);
  return null;
}
