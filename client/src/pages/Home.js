import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import BlogList from '../components/BlogFiles/BlogList';
import HeroCarousel from '../components/HeroCarousel.jsx';
import SidebarSection from '../components/SidebarSection.jsx';
import SidebarLatest from '../components/SidebarLatest.jsx';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

// Use the configured API service
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.innvibs.com';


const INITIAL_PAGE_SIZE = 6;

const Home = ({ activeCategory, searchQuery, setSearchQuery }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [blogs, setBlogs] = useState([]);
    const [featuredBlogs, setFeaturedBlogs] = useState([]);
    const [sidebarSections, setSidebarSections] = useState([]);
    const [sidebarLatest, setSidebarLatest] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBlogsCount, setTotalBlogsCount] = useState(0);

    const [sidebarLoading, setSidebarLoading] = useState(true);

    const textVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    };

    const taglineVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.8, ease: "easeOut" } },
    };

    useEffect(() => {
        const fetchFeaturedBlogs = async () => {
            try {
                const baseUrl = process.env.NODE_ENV === 'production'
                    ? (process.env.REACT_APP_API_BASE_URL || 'https://api.innvibs.com')
                    : (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081');
                const res = await axios.get(`${baseUrl}/api/blogs/latest`);
                setFeaturedBlogs(res.data);
            } catch (err) {
                console.error("Error fetching featured blogs:", err);
            }
        };

        fetchFeaturedBlogs();
    }, []);

    useEffect(() => {
        const buildHomeSidebar = async () => {
            try {
                const baseUrl = process.env.NODE_ENV === 'production'
                    ? (process.env.REACT_APP_API_BASE_URL || 'https://api.innvibs.com')
                    : (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081');
                const catRes = await axios.get(`${baseUrl}/api/blogs/categories`);
                const categories = Array.isArray(catRes.data) ? catRes.data : [];

                const preferred = ['Technology', 'Health & Wellness', 'Fashion', 'Vastu Shastra'];

                const preferredPresent = preferred
                    .map(name => categories.find(c => c.name_en === name))
                    .filter(Boolean);
                const others = categories.filter(c => !preferred.includes(c.name_en));
                const chosen = (preferredPresent.length ? preferredPresent : others).slice(0, 4);
                const sections = await Promise.all(
                    chosen.map(async (cat) => {
                        const url = `${baseUrl}/api/blogs?category=${encodeURIComponent(cat.name_en)}&page=1&limit=3`;
                        const res = await axios.get(url);
                        return { title: cat.name_en, items: res.data?.blogs || [] };
                    })
                );
                setSidebarSections(sections);
            } catch (err) {
                console.error('Error building sidebar sections:', err);
                setSidebarSections([]);
            }
        };

        const buildLatestSidebar = async () => {
            try {
                const baseUrl = process.env.NODE_ENV === 'production'
                    ? (process.env.REACT_APP_API_BASE_URL || 'https://api.innvibs.com')
                    : (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081');
                let url = `${baseUrl}/api/blogs/latest`;
                if (activeCategory && activeCategory.toLowerCase() !== 'all') {
                    url = `${baseUrl}/api/blogs?page=1&limit=5&excludeCategory=${encodeURIComponent(activeCategory)}`;
                }

                const res = await axios.get(url);
                setSidebarLatest(res.data?.blogs || res.data || []);
            } catch (err) {
                console.error('Error fetching latest for sidebar:', err);
                setSidebarLatest([]);
            }
        };

        const loadSidebar = async () => {
            setSidebarLoading(true); 
            if (searchQuery) {
                setSidebarSections([]);
                setSidebarLatest([]);
                setSidebarLoading(false); 
                return;
            }

            if (activeCategory && activeCategory.toLowerCase() !== 'all') {
                setSidebarSections([]);
                await buildLatestSidebar();
            } else {
                await buildHomeSidebar();
                setSidebarLatest([]);
            }
            setSidebarLoading(false); 
        };

        loadSidebar();
    }, [activeCategory, searchQuery]);

    const fetchBlogs = useCallback(async (pageToLoad = 1, append = false) => {
        if (pageToLoad === 1) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const baseUrl = process.env.NODE_ENV === 'production'
                ? (process.env.REACT_APP_API_BASE_URL || 'https://api.innvibs.com')
                : (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081');
            let url = `${baseUrl}/api/blogs?page=${pageToLoad}&limit=${INITIAL_PAGE_SIZE}`;

            if (searchQuery) {
                url = `${baseUrl}/api/blogs/search?q=${encodeURIComponent(searchQuery)}&page=${pageToLoad}&limit=${INITIAL_PAGE_SIZE}&_t=${Date.now()}`;
            } else if (activeCategory && activeCategory.toLowerCase() !== 'all') {
                url = `${baseUrl}/api/blogs?category=${encodeURIComponent(activeCategory)}&page=${pageToLoad}&limit=${INITIAL_PAGE_SIZE}`;
            }

            console.log('Fetching blogs from URL:', url); // Debug log
            const res = await axios.get(url);
            console.log('API Response:', res.data); // Debug log
            console.log('Search query:', searchQuery); // Debug log
            console.log('Active category:', activeCategory); // Debug log

            const { blogs: newBlogs, currentPage: apiCurrentPage, totalPages: apiTotalPages, totalBlogs: apiTotalBlogs } = res.data;

            if (append) {
                setBlogs(prevBlogs => [...prevBlogs, ...newBlogs]);
            } else {
                setBlogs(newBlogs);
            }
            setCurrentPage(apiCurrentPage);
            setTotalPages(apiTotalPages);
            setTotalBlogsCount(apiTotalBlogs);
        } catch (err) {
            console.error("Error fetching blogs:", err);
            setBlogs([]);
            setTotalPages(0);
            setTotalBlogsCount(0);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [activeCategory, searchQuery]);

    useEffect(() => {
        fetchBlogs(1, false);
    }, [fetchBlogs]);

    const loadMoreBlogs = () => {
        if (currentPage < totalPages && !loadingMore) {
            fetchBlogs(currentPage + 1, true);
        }
    };

    const isSearchView = !!searchQuery;
    const isCategoryView = activeCategory && activeCategory.toLowerCase() !== 'all';

    const pageTitle = isSearchView
        ? t('general.search_results_for', { query: searchQuery })
        : isCategoryView
            ? t('general.blogs_in_category', { category: t(`category.${String(activeCategory).toLowerCase().replace(/ & /g, '_').replace(/\s+/g, '_')}`, { defaultValue: activeCategory }) })
            : '';

    if (loading) {
        return <div className="text-center py-20 dark:text-gray-200">{t('loading blogs')}</div>;
    }

    const showDynamicPageTitle = isSearchView || isCategoryView;
    const hasBlogsToDisplay = blogs?.length > 0;

    return (
        <div className="min-h-screen">
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {!isSearchView && !isCategoryView && featuredBlogs.length > 0 && (
                            <HeroCarousel blogs={featuredBlogs} />
                        )}

                        {!isSearchView && !isCategoryView && (
                            <div className="text-center md:text-left">
                                <motion.h1
                                    className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white"
                                    variants={textVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    {t('homepage.welcome_title')}
                                </motion.h1>
                                <motion.p
                                    className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl"
                                    variants={taglineVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    {t('homepage.tagline')}
                                </motion.p>
                            </div>
                        )}

                        {showDynamicPageTitle && (
                            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white capitalize">
                                {pageTitle}
                            </h2>
                        )}

                        {!isSearchView && !isCategoryView && (
                            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                                {t('homepage.featured_posts').replace('Featured Posts', 'Latest Articles')}
                            </h2>
                        )}

                        <BlogList
                            blogs={blogs}
                            loadingMore={loadingMore}
                            hasMore={currentPage < totalPages}
                            onLoadMore={loadMoreBlogs}
                            totalBlogsCount={totalBlogsCount}
                            searchQuery={searchQuery}
                        />

                        {!hasBlogsToDisplay && !loading && (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-10">
                                {t('No blogs')}
                            </p>
                        )}
                    </div>

                    <div className="space-y-6">
                        {sidebarLoading ? (
                            <div className="text-center text-gray-500 dark:text-gray-400">Loading sidebar...</div>
                        ) : (
                            <>
                                {!isSearchView && !isCategoryView && sidebarSections.map((sec) => (
                                    <SidebarSection
                                        key={sec.title}
                                        title={sec.title}
                                        items={sec.items}
                                        onViewMore={() => {
                                            const slug = sec.title.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
                                            navigate(`/category/${slug}`);
                                        }}
                                    />
                                ))}

                                {!isSearchView && isCategoryView && (
                                    <SidebarLatest 
                                        title={t('homepage.featured_posts').replace('Featured Posts', 'Latest Articles')} 
                                        items={sidebarLatest} 
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;