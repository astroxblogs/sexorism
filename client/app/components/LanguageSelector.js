'use client'

import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
 import { useRouter } from 'next/navigation'
import { setApiLanguage } from '../lib/api'


const LanguageSelector = () => {
    const { i18n, t } = useTranslation();

    const [open, setOpen] = useState(false);
   const router = useRouter()
 const changeLanguage = async (newLang) => {
  await i18n.changeLanguage(newLang)
  setApiLanguage(newLang)        // make axios send ?lang + Accept-Language
  localStorage.setItem('lang', newLang)
   setOpen(false)
   router.refresh()               // re-fetch data in App Router
 }

    // Open dropdown smoothly on hover; close when mouse leaves the wrapper
    const hoverTimer = useRef(null);
    const handleMouseEnter = () => {
        clearTimeout(hoverTimer.current);
        setOpen(true);
    };
    const handleMouseLeave = () => {
        clearTimeout(hoverTimer.current);
        hoverTimer.current = setTimeout(() => setOpen(false), 150);
    };

    return (
        <div
            className="relative language-selector"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
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
                <ul
                    className="absolute z-50 mt-1 w-36 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden"
                    role="listbox"
                >
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