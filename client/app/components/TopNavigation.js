'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { makeCategoryLink } from '../lib/paths';

import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';

import { Search, X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// slug helper
const toSlug = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/\s*&\s*/g, '-and-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-&]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

const TopNavigation = ({ activeCategory, onCategoryChange, setSearchQuery, onLogoClick, categories }) => {
  const { t, i18n } = useTranslation();
  const lang = (i18n?.resolvedLanguage || i18n?.language || 'en').toLowerCase();
  // const basePrefix = lang.startsWith('hi') ? '/hi' : ''; // ✅ prefix when Hindi
  const locale = lang.startsWith('hi') ? 'hi' : 'en';
 const router = useRouter();
const pathname = usePathname();

const isHindiPath = pathname === '/hi' || pathname.startsWith('/hi/');
const cookieLang = (() => {
  try {
    const m = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=(hi|en)/i);
    return m && m[1] ? m[1].toLowerCase() : '';
  } catch { return ''; }
})();

const effectiveLang = isHindiPath ? 'hi' : (cookieLang || (i18n?.resolvedLanguage || i18n?.language || 'en')).toLowerCase().startsWith('hi') ? 'hi' : 'en';
const basePrefix = effectiveLang === 'hi' ? '/hi' : '';

  const [showSearchInput, setShowSearchInput] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const scrollRef = useRef(null);
  const itemRefs = useRef([]);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isScrollable = el.scrollWidth - el.clientWidth > 1;
    const atStart = el.scrollLeft <= 1;
    const atEnd = el.scrollWidth - el.clientWidth - el.scrollLeft <= 1;
    setShowLeftArrow(isScrollable && !atStart);
    setShowRightArrow(isScrollable && !atEnd);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = 0;
      checkArrows();
      let resizeTimer;
      const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(checkArrows, 100);
      };
      el.addEventListener('scroll', checkArrows);
      window.addEventListener('resize', handleResize);
      return () => {
        el.removeEventListener('scroll', checkArrows);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [checkArrows, categories]);

  const handleNext = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: scrollRef.current.clientWidth * 0.5, behavior: 'smooth' });
    setTimeout(checkArrows, 300);
  };

  const handlePrev = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: -scrollRef.current.clientWidth * 0.5, behavior: 'smooth' });
    setTimeout(checkArrows, 300);
  };

  // ✅ push clean/prefixed category URL
  const handleCategoryClick = (categoryValue) => {
    const slug = toSlug(categoryValue);
    if (typeof onCategoryChange === 'function') onCategoryChange(slug);
    if (slug && slug !== 'all') {
      router.push(makeCategoryLink(locale, slug));
    } else {
      router.push(basePrefix || '/');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const searchTerm = inputValue.trim();
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

const handleLogoClick = () => {
  // If you're already on the effective home, do a route refresh (no URL change)
  const targetHome = basePrefix || '/';
  if (pathname === targetHome) {
    router.refresh();
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
    return;
  }
  // Otherwise navigate to the right home, preserving /hi when Hindi
  router.push(targetHome);
};



  const handleCloseSearch = () => {
    setShowSearchInput(false);
    setInputValue('');
    setSearchQuery('');
  };

  const handleSearchClick = () => setShowSearchInput(true);

  const dynamicCategories = (categories || []).map((cat) => ({
    name_en: cat.name_en,
    name_hi: cat.name_hi,
    value: toSlug(cat.name_en),
  }));

  const normalizedActive = toSlug(activeCategory || '');
  const selectValue = dynamicCategories.some((c) => c.value === normalizedActive)
    ? normalizedActive
    : dynamicCategories[0]?.value || '';

  const getCategoryName = (category) => {
    return lang.startsWith('hi') ? category.name_hi || category.name_en : category.name_en || category.name_hi;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-dark-bg-secondary backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-dark-bg-secondary shadow">
      <div className="py-2.5 px-3 sm:px-4 md:px-8 flex flex-col lg:flex-row gap-2 lg:gap-6 lg:justify-between lg:items-center">


        <div className="flex items-center gap-3 w-full lg:w-auto lg:mr-4">

          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 flex-shrink-0 max-w-[120px] sm:max-w-[140px] md:max-w-none"
          >
            <img
              src="/lm1.png"
              alt="Logo Light"
              className="h-8 sm:h-10 w-auto object-contain block dark:hidden"
            />
            <img
              src="/tp2..png"
              alt="Logo Dark"
              className="h-8 sm:h-10 w-auto object-contain hidden dark:block"
            />
          </button>
          <div className="lg:hidden ml-auto flex items-center gap-2">
            <button
              onClick={handleSearchClick}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <Search className="w-5 h-5" />
            </button>
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>

        {/* ✅ min-w-0 allows this flex item to shrink properly. */}
        <div className="flex flex-grow justify-center items-center order-last lg:order-none min-w-0 lg:ml-8">

          <div className="relative flex items-center w-full max-w-[920px] mx-auto lg:px-8">

            <div className="w-full lg:hidden px-3">
              <div className="relative">
                <select
                  aria-label="Select category"
                  className="appearance-none w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-3 pr-9 py-2 text-sm font-medium shadow-sm"
                  value={selectValue}
                  onChange={(e) => handleCategoryClick(e.target.value)}
                >
                  {dynamicCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{getCategoryName(cat)}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>

            <AnimatePresence>
              {showLeftArrow && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="hidden lg:block absolute left-0 z-20 bg-light-bg-secondary dark:bg-dark-bg-secondary pr-4 rounded-r-full"
                >
                  <button onClick={handlePrev} className="p-1.5 rounded-full shadow-md hover:bg-gray-200 dark:hover:bg-gray-700">
                    <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div
              ref={scrollRef}
              className="hidden lg:flex items-center space-x-2 whitespace-nowrap overflow-x-auto scroll-smooth no-scrollbar px-3 sm:px-10"
            >
              {dynamicCategories.map((cat, idx) => (
                <button
                  key={cat.value}
                  ref={(el) => (itemRefs.current[idx] = el)}
                  onClick={() => handleCategoryClick(cat.value)}
                  className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-colors duration-200 border ${normalizedActive === cat.value
                      ? "bg-violet-600 border-violet-600 text-white"
                      : "bg-white/70 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  {getCategoryName(cat)}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {showRightArrow && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="hidden lg:block absolute right-0 z-20 bg-light-bg-secondary dark:bg-dark-bg-secondary pl-4 rounded-l-full"
                >
                  <button onClick={handleNext} className="p-1.5 rounded-full shadow-md hover:bg-gray-200 dark:hover:bg-gray-700">
                    <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3 flex-shrink-0 lg:self-auto self-end w-full lg:w-auto justify-end">
          {showSearchInput ? (
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-1 w-full max-w-xs border border-gray-200 dark:border-gray-700"
            >
              <input
                type="text"
                placeholder={t('Search...')}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="bg-transparent text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-0 border-none w-full"
              />
              <button type="button" onClick={handleCloseSearch}>
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button
              onClick={handleSearchClick}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          <div className="hidden lg:block">
            <LanguageSelector />
          </div>
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {showSearchInput && (
        <div className="px-3 pb-2 lg:hidden">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 border border-gray-200 dark:border-gray-700"
          >
            <input
              type="text"
              placeholder={t('Search...')}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="bg-transparent text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-0 border-none w-full"
              autoFocus
            />
            <button type="button" onClick={handleCloseSearch}>
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </nav>
  );
};

export default TopNavigation;
