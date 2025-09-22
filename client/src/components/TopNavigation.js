import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';

import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';

import {
    Search, X, ChevronLeft, ChevronRight, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";



// --- NEW PROPS ADDED: `categories` ---
const TopNavigation = ({ activeCategory, onCategoryChange, setSearchQuery, onLogoClick, categories }) => {
    const { t, i18n } = useTranslation(); // <-- ADDED `i18n` to get the current language

    const [showSearchInput, setShowSearchInput] = useState(false);
    const [inputValue, setInputValue] = useState('');
    // const [isSidebarOpen] = useState(false);

    const scrollRef = useRef(null);
    const itemRefs = useRef([]);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const checkArrows = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const isScrollable = el.scrollWidth > el.clientWidth;
        setShowLeftArrow(isScrollable && el.scrollLeft > 5);
        setShowRightArrow(isScrollable && (el.scrollWidth - el.clientWidth - el.scrollLeft > 5));
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            el.scrollLeft = 0;
            checkArrows();

            let resizeTimer;
            const handleResize = () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(checkArrows, 100);
            };
            el.addEventListener("scroll", checkArrows);
            window.addEventListener("resize", handleResize);
            return () => {
                el.removeEventListener("scroll", checkArrows);
                window.removeEventListener("resize", handleResize);
            };
        }
    }, [checkArrows, categories]);

    const handleNext = () => {
        scrollRef.current?.scrollBy({ left: scrollRef.current.clientWidth * 0.5, behavior: "smooth" });
    };

    const handlePrev = () => {
        scrollRef.current?.scrollBy({ left: -scrollRef.current.clientWidth * 0.5, behavior: "smooth" });
    };

    // --- UPDATED CATEGORY CLICK HANDLER TO USE DYNAMIC DATA ---
    const handleCategoryClick = (categoryValue) => {
        onCategoryChange(categoryValue.trim());
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const searchTerm = inputValue.trim();

        // Check if there's an exact match for a blog title
        try {
            const response = await axios.get(`/api/blogs/search?q=${encodeURIComponent(searchTerm)}&limit=1&_t=${Date.now()}`);
            const blogs = response.data.blogs;

            if (blogs && blogs.length > 0) {
                const blog = blogs[0];
                console.log('Smart search - Found blog:', blog.title);
                console.log('Smart search - Search term:', searchTerm);

                // Check if the search term matches the blog title exactly (case insensitive)
                // Use word boundaries for more precise matching
                const exactTitleMatch = blog.title && new RegExp(`\\b${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(blog.title);
                const exactTitleEnMatch = blog.title_en && new RegExp(`\\b${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(blog.title_en);
                const exactTitleHiMatch = blog.title_hi && new RegExp(`\\b${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(blog.title_hi);

                console.log('Smart search - Title match:', exactTitleMatch);
                console.log('Smart search - Title EN match:', exactTitleEnMatch);
                console.log('Smart search - Title HI match:', exactTitleHiMatch);

                if (exactTitleMatch || exactTitleEnMatch || exactTitleHiMatch) {
                    console.log('Smart search - Redirecting to:', blog.slug);
                    // Redirect to the blog detail page
                    const frontendUrl = process.env.NODE_ENV === 'production'
                        ? process.env.REACT_APP_FRONTEND_URL || 'https://www.innvibs.com'
                        : 'http://localhost:3000';

                    window.location.href = `${frontendUrl}/blog-detail/${blog.slug}`;
                    return;
                } else {
                    console.log('Smart search - No exact match found, proceeding with regular search');
                }
            } else {
                console.log('Smart search - No blogs found');
            }
        } catch (error) {
            console.error('Error checking for exact blog match:', error);
        }

        // If no exact match found, proceed with regular search
        setSearchQuery(searchTerm);
    };

    const handleCloseSearch = () => {
        setShowSearchInput(false);
        setInputValue('');
        setSearchQuery('');
    };

    const handleSearchClick = () => setShowSearchInput(true);


    // --- CREATE A NEW DYNAMIC CATEGORIES LIST FOR RENDERING ---
    const dynamicCategories = [
        { name_en: t('navigation.categories'), name_hi: t('navigation.categories'), value: "all" },
        ...categories.map(cat => ({
            name_en: cat.name_en,
            name_hi: cat.name_hi,
            value: cat.name_en
        }))
    ];

    const getCategoryName = (category) => {
        if (category.value === 'all') return t('navigation.categories');
        return i18n.language === 'hi' ? (category.name_hi || category.name_en) : (category.name_en || category.name_hi);
    };


    return (
        <nav className="sticky top-0 z-50 bg-white/90 dark:bg-dark-bg-secondary backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-dark-bg-secondary shadow">
            <div className="py-2.5 px-3 sm:px-4 md:px-8 flex flex-col md:flex-row gap-2 md:gap-0 md:justify-between md:items-center">
                {/* Left - Logo + Controls (mobile) */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <a
                        href="/"
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
                    </a>
                    <div className="md:hidden ml-auto flex items-center gap-2">
                        {/* Search icon moved left on mobile - place before language/theme if desired */}
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

                {/* Center - Scrollable Categories (mobile dropdown + desktop scroller) */}
                <div className="flex flex-grow justify-center items-center order-last md:order-none">
                    <div className="relative flex items-center w-full max-w-[920px] mx-auto">
                        {/* Mobile dropdown */}
                        <div className="w-full md:hidden px-3">
                            <div className="relative">
                                <select
                                    aria-label="Select category"
                                    className="appearance-none w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-3 pr-9 py-2 text-sm font-medium shadow-sm"
                                    value={activeCategory}
                                    onChange={(e) => handleCategoryClick(e.target.value)}
                                >
                                    {dynamicCategories.map((cat) => (
                                        <option key={cat.value} value={cat.value}>{getCategoryName(cat)}</option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            </div>
                        </div>

                        {/* Desktop scroller */}
                        <AnimatePresence>
                            {showLeftArrow && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="hidden md:block absolute left-0 z-20 bg-light-bg-secondary dark:bg-dark-bg-secondary pr-4 rounded-r-full"
                                >
                                    <button onClick={handlePrev} className="p-1.5 rounded-full shadow-md hover:bg-gray-200 dark:hover:bg-gray-700">
                                        <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div
                            ref={scrollRef}
                            className="hidden md:flex items-center space-x-2 whitespace-nowrap overflow-x-auto scroll-smooth no-scrollbar px-3 sm:px-10"
                        >
                            {dynamicCategories.map((cat, idx) => (
                                <button
                                    key={cat.value}
                                    ref={(el) => (itemRefs.current[idx] = el)}
                                    onClick={() => handleCategoryClick(cat.value)}
                                    className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-colors duration-200 border ${activeCategory === cat.value
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
                                    className="hidden md:block absolute right-0 z-20 bg-light-bg-secondary dark:bg-dark-bg-secondary pl-4 rounded-l-full"
                                >
                                    <button onClick={handleNext} className="p-1.5 rounded-full shadow-md hover:bg-gray-200 dark:hover:bg-gray-700">
                                        <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right - Controls */}
                <div className="hidden md:flex items-center gap-3 flex-shrink-0 md:self-auto self-end w-full md:w-auto justify-end">
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

                    <div className="hidden md:block">
                        <LanguageSelector />
                    </div>
                    <div className="hidden md:block">
                        <ThemeToggle />
                    </div>
                </div>
            </div>
            {/* Mobile search input */}
            {showSearchInput && (
                <div className="px-3 pb-2 md:hidden">
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
