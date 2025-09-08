import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import BlogList from '../components/BlogList';
import HeroCarousel from '../components/HeroCarousel.jsx';
import SidebarSection from '../components/SidebarSection.jsx';
import SidebarLatest from '../components/SidebarLatest.jsx';
import { useNavigate } from 'react-router-dom';
// --- THIS IS THE FIX ---
// The package name was misspelled as 'react-i-next'. 
// I have corrected it to 'react-i18next'.
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';


const INITIAL_PAGE_SIZE = 6;

const Home = ({ activeCategory, searchQuery }) => {
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

    // --- State to track if sidebar data has finished loading ---
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
                const res = await axios.get('/api/blogs/latest');
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
                const catRes = await axios.get('/api/blogs/categories');
                const categories = Array.isArray(catRes.data) ? catRes.data : [];
                
                // --- THIS IS THE CHANGE ---
                // I've updated this array to use the categories you requested.
                // The code will now specifically look for these three categories to build the sidebar.
                const preferred = ['Technology', 'Health & Wellness', 'Fashion'];

                const preferredPresent = preferred
                    .map(name => categories.find(c => c.name_en === name))
                    .filter(Boolean);
                const others = categories.filter(c => !preferred.includes(c.name_en));
                const chosen = (preferredPresent.length ? preferredPresent : others).slice(0, 3);
                const sections = await Promise.all(
                    chosen.map(async (cat) => {
                        const url = `/api/blogs?category=${encodeURIComponent(cat.name_en)}&page=1&limit=3`;
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
                let url = '/api/blogs/latest'; // Default URL
                // If on a category page, exclude blogs from the current category
                if (activeCategory && activeCategory.toLowerCase() !== 'all') {
                    url = `/api/blogs?page=1&limit=5&excludeCategory=${encodeURIComponent(activeCategory)}`;
                }
                
                const res = await axios.get(url);
                // The API response structure might be { blogs: [...] } or just [...]
                setSidebarLatest(res.data?.blogs || res.data || []);
            } catch (err) {
                console.error('Error fetching latest for sidebar:', err);
                setSidebarLatest([]);
            }
        };

        const loadSidebar = async () => {
            setSidebarLoading(true); // Start loading
            if (searchQuery) {
                setSidebarSections([]);
                setSidebarLatest([]);
                setSidebarLoading(false); // Stop loading
                return;
            }

            if (activeCategory && activeCategory.toLowerCase() !== 'all') {
                // Category page: show latest from other categories
                setSidebarSections([]);
                await buildLatestSidebar();
            } else {
                // Home page: show curated category sections
                await buildHomeSidebar();
                setSidebarLatest([]);
            }
            setSidebarLoading(false); // Stop loading after data is fetched
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
            let url = `/api/blogs?page=${pageToLoad}&limit=${INITIAL_PAGE_SIZE}`;

            if (searchQuery) {
                url = `/api/blogs/search?q=${encodeURIComponent(searchQuery)}&page=${pageToLoad}&limit=${INITIAL_PAGE_SIZE}`;
            } else if (activeCategory && activeCategory.toLowerCase() !== 'all') {
                url = `/api/blogs?category=${encodeURIComponent(activeCategory)}&page=${pageToLoad}&limit=${INITIAL_PAGE_SIZE}`;
            }

            const res = await axios.get(url);
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
                        />

                        {!hasBlogsToDisplay && !loading && (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-10">
                                {t('No blogs')}
                            </p>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* --- REVISED SIDEBAR LOGIC --- */}
                        {sidebarLoading ? (
                            <div className="text-center text-gray-500 dark:text-gray-400">Loading sidebar...</div>
                        ) : (
                            <>
                                {/* On Home, show sections */}
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

                                {/* On Category pages, show latest */}
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

