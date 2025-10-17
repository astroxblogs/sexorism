import React, { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';

export default function CategoryNav({ activeCategory, onCategoryChange, categories = [] }) {
  const { t, i18n } = useTranslation();
  const basePrefix = ''; // no /hi prefix anymore

  const scrollRef = useRef(null);
  const itemRefs = useRef([]);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

// Prefix links with /hi when Hindi is active; English stays unprefixed


  const normalize = (s) => String(s || '').trim().toLowerCase();
  const toSlug = (text) => String(text || '')
  .toLowerCase()
  .replace(/\s*&\s*/g, '-and-')  // match TopNavigation behavior
  .replace(/\s+/g, '-')          // spaces → hyphen
  .replace(/[^a-z0-9\-&]/g, '')  // allow a–z, 0–9, -, &
  .replace(/-+/g, '-')           // collapse multiple hyphens
  .replace(/^-+|-+$/g, '');      // trim hyphens


  const visibleCategories = categories.filter(
    (c) => normalize(c.value) !== 'categories' && normalize(c.label) !== 'categories'
  );

  const checkArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isScrollable = el.scrollWidth > el.clientWidth;
    setShowLeftArrow(isScrollable && el.scrollLeft > 1);
    setShowRightArrow(isScrollable && (el.scrollWidth - el.clientWidth - el.scrollLeft > 1));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    checkArrows();
    el?.addEventListener("scroll", checkArrows);
    window.addEventListener("resize", checkArrows);
    return () => {
      el?.removeEventListener("scroll", checkArrows);
      window.removeEventListener("resize", checkArrows);
    };
  }, [checkArrows]);

  const handleCategoryClick = (categoryValue) => {
    if (typeof onCategoryChange === 'function') onCategoryChange(categoryValue);
    setMobileOpen(false);
    const idx = visibleCategories.findIndex((c) => c.value === categoryValue);
    const itemEl = itemRefs.current[idx];
    const scrollEl = scrollRef.current;
    if (itemEl && scrollEl) {
      const scrollAmount = itemEl.offsetLeft - scrollEl.offsetWidth / 2 + itemEl.offsetWidth / 2;
      scrollEl.scrollTo({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleArrowScroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const activeObj = visibleCategories.find(c => c.value === activeCategory);
  const activeLabel =
    t(
      `category.${String(activeObj?.value || '').toLowerCase().replace(/ & /g, '_').replace(/\s+/g, '_').replace(/&/g, '_')}`,
      { defaultValue: activeObj?.label || t('navigation.browse', 'Browse') }
    );

  return (
    <div className="w-full bg-background py-2 border-b dark:border-gray-800">
      {/* Mobile */}
      <div
        className="relative mx-auto block max-w-2xl sm:hidden"
        onMouseEnter={() => setMobileOpen(true)}
        onMouseLeave={() => setMobileOpen(false)}
      >
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="w-full flex justify-between items-center rounded-md px-4 py-2 text-sm font-medium bg-white border border-gray-200 shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          aria-expanded={mobileOpen}
          aria-haspopup="true"
        >
          {activeLabel}
          <ChevronRight className={`h-4 w-4 transition-transform ${mobileOpen ? "rotate-90" : "rotate-0"}`} />
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute left-0 right-0 mt-2 rounded-md border border-gray-200 bg-white shadow-lg dark:bg-gray-900 dark:border-gray-700 z-20"
            >
              <ul className="py-2">
                {visibleCategories.map((cat) => (
                  <li key={toSlug(cat.value)}>
                    <Link
                     href={`${basePrefix}/${toSlug(cat.value)}`}
                      onClick={() => handleCategoryClick(cat.value)}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                        activeCategory === cat.value
                          ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                          : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      {t(
                        `category.${String(cat.value).toLowerCase().replace(/ & /g, '_').replace(/\s+/g, '_').replace(/&/g, '_')}`,
                        { defaultValue: cat.label }
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop/tablet */}
      <div className="relative mx-auto hidden sm:flex max-w-2xl items-center">
        <AnimatePresence>
          {showLeftArrow && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -left-4 sm:-left-12 top-0 bottom-0 flex items-center z-10"
            >
              <button
                onClick={() => handleArrowScroll("left")}
                className="rounded-full bg-white p-1.5 shadow-md border border-gray-200 hover:bg-gray-100 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-200" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          ref={scrollRef}
          className="flex items-center space-x-3 overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar px-2"
        >
          {visibleCategories.map((cat, idx) => (
            <Link
              key={toSlug(cat.value)}
              href={`${basePrefix}/${toSlug(cat.value)}`}
              ref={(el) => (itemRefs.current[idx] = el)}
              onClick={() => handleCategoryClick(cat.value)}
              className={`
                flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                ${activeCategory === cat.value
                  ? "bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
                }
              `}
            >
              {t(
                `category.${String(cat.value).toLowerCase().replace(/ & /g, '_').replace(/\s+/g, '_').replace(/&/g, '_')}`,
                { defaultValue: cat.label }
              )}
            </Link>
          ))}
        </div>

        <AnimatePresence>
          {showRightArrow && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -right-4 sm:-right-12 top-0 bottom-0 flex items-center z-10"
            >
              <button
                onClick={() => handleArrowScroll("right")}
                className="rounded-full bg-white p-1.5 shadow-md border border-gray-200 hover:bg-gray-100 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-200" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
