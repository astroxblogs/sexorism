'use client';

import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { setApiLanguage } from '../lib/api';

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const changeLanguage = async (newLang) => {
    const v = newLang === 'hi' ? 'hi' : 'en';

    // 1) Instant UI switch
    await i18n.changeLanguage(v);

    // 2) Persist for SSR/API
    const ONE_YEAR = 60 * 60 * 24 * 365;
    document.cookie = `NEXT_LOCALE=${v}; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax`;
    try { localStorage.setItem('lang', v); } catch {}
    setApiLanguage(v);

    setOpen(false);

    // 3) Single soft navigation with prefix/strip logic
    const { pathname, search, hash } = window.location;
    const isHiNow = pathname === '/hi' || pathname.startsWith('/hi/');
    let nextPath;

    if (v === 'hi') {
      nextPath = isHiNow ? pathname : (pathname === '/' ? '/hi' : `/hi${pathname}`);
    } else {
      nextPath = isHiNow ? (pathname.slice(3) || '/') : pathname; // remove '/hi'
    }

    router.replace(`${nextPath}${search || ''}${hash || ''}`, { scroll: false });
  };

  // hover open/close (unchanged)
  const hoverTimer = useRef(null);
  const handleMouseEnter = () => { clearTimeout(hoverTimer.current); setOpen(true); };
  const handleMouseLeave = () => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div className="relative language-selector" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1.5 text-sm font-medium shadow-sm"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {(i18n.resolvedLanguage || i18n.language) === 'hi'
          ? t('language_selector.hindi')
          : t('language_selector.english')}
      </button>

      {open && (
        <ul className="absolute z-50 mt-1 w-36 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden" role="listbox">
          <li>
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              onClick={() => changeLanguage('en')}
              role="option"
              aria-selected={i18n.language === 'en'}
            >
              {t('language_selector.english')}
            </button>
          </li>
          <li>
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              onClick={() => changeLanguage('hi')}
              role="option"
              aria-selected={i18n.language === 'hi'}
            >
              {t('language_selector.hindi')}
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default LanguageSelector;
