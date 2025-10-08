'use client';

import React, { useEffect, useState, useCallback, memo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import BlogList from './BlogList';
import HeroCarousel from './HeroCarousel.jsx';
import SidebarSection from './SidebarSection.jsx';
import SidebarLatest from './SidebarLatest.jsx';
import SEO from './SEO.js';
import api from '../lib/api.js';
import { useBlogs } from '../context/BlogContext.js';

const INITIAL_PAGE_SIZE = 6;

const HomePage = () => {
   const { t, i18n } = useTranslation();
 const lang = i18n?.resolvedLanguage || i18n?.language || 'en';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const blogContext = useBlogs();
  const blogs = blogContext?.blogs || [];
  const setBlogs = blogContext?.setBlogs || (() => {});
  const featuredBlogs = blogContext?.featuredBlogs || [];
  const setFeaturedBlogs = blogContext?.setFeaturedBlogs || (() => {});

  // ===== CATEGORY DETECTION =====
  const isCategoryPage = pathname.startsWith('/category/');
  const categoryFromUrl = isCategoryPage ? pathname.split('/category/')[1] : null;

  // Convert slug back to category name format (e.g., "vastu-shastra" -> "Vastu Shastra")
  const convertSlugToCategoryName = (slug) => {
    if (!slug || slug === 'all') return slug;

    // Handle special case: convert slug format to category name format
    if (slug.includes('-&-')) {
      return slug
        .split('-&-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' & ');
    }

    // Convert hyphenated slug to title case
    return slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const activeCategory =
    searchParams.get('category') ||
    (categoryFromUrl ? convertSlugToCategoryName(categoryFromUrl) : null) ||
    'all';

  // ===== TAG DETECTION =====
  const isTagPage = pathname.startsWith('/tag/');
  const tagFromUrl = isTagPage ? pathname.split('/tag/')[1] : null;

  // Convert tag slug to display label (e.g., "healthy-diet" -> "Healthy Diet")
  const convertSlugToLabel = (slug) => {
    if (!slug) return '';
    const decoded = decodeURIComponent(slug);
    return decoded
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  const activeTag = tagFromUrl ? convertSlugToLabel(tagFromUrl) : '';

  // ===== SEARCH PARAMS =====
  const searchQuery = searchParams.get('q') || '';

  // ===== STATE =====
  const [sidebarSections, setSidebarSections] = useState([]);
  const [sidebarLatest, setSidebarLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogsCount, setTotalBlogsCount] = useState(0);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Innvibs",
    "url": "https://www.innvibs.com",
    "logo": "https://www.innvibs.com/logo512.png",
    "sameAs": [
      "https://www.facebook.com/your-profile",
      "https://www.twitter.com/your-profile",
      "https://www.instagram.com/your-profile",
      "https://www.linkedin.com/company/your-company"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://www.innvibs.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.innvibs.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const taglineVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.8, ease: "easeOut" } },
  };

  // ===== FEATURED BLOGS (HOMEPAGE HERO) =====
  useEffect(() => {
  const fetchFeaturedBlogs = async () => {
    // allow refetch on language change
    if (featuredBlogs.length > 0) setFeaturedBlogs([]);

      try {
         const res = await api.get('/blogs/latest'); // interceptor adds ?lang + header
        if (setFeaturedBlogs) {
          setFeaturedBlogs(res.data);
        }
      } catch (err) {
        console.error("Error fetching featured blogs:", err);
      }
    };

   fetchFeaturedBlogs();
 }, [lang]); // refetch when language changes

  // ===== SIDEBAR DATA =====
  useEffect(() => {
    let isMounted = true;

    const buildHomeSidebar = async () => {
      if (sidebarSections.length > 0) return; // Prevent multiple calls

      try {
        const catRes = await api.get('/categories');
        const categories = Array.isArray(catRes.data) ? catRes.data : [];
        const preferred = [
          'Technology', 'Health & Wellness', 'Trends', 'Fashion', 'Relationship', 'Travel',
          'Astrology', 'Vastu Shastra', 'Business & Finance', 'Sports', 'Lifestyle', 'Food & Cooking'
        ];
        const preferredPresent = preferred
          .map((name) => categories.find((c) => c.name_en === name))
          .filter(Boolean);
        const others = categories.filter((c) => !preferred.includes(c.name_en));
        const chosen = (preferredPresent.length ? preferredPresent : others).slice(0, 12);

        if (!isMounted) return;

        const sections = await Promise.all(
          chosen.map(async (cat) => {
            const res = await api.get(`/blogs?category=${encodeURIComponent(cat.name_en)}&page=1&limit=2`);
            return { title: cat.name_en, items: res.data?.blogs || [] };
          })
        );

        if (isMounted) {
          setSidebarSections(sections);
        }
      } catch (err) {
        console.error('Error building sidebar sections:', err);
        if (isMounted) {
          setSidebarSections([]);
        }
      }
    };

    const buildLatestSidebar = async () => {
      try {
        let url = '/blogs/latest';
        if (activeCategory && activeCategory.toLowerCase() !== 'all') {
          url = `/blogs?page=1&limit=5&excludeCategory=${encodeURIComponent(activeCategory)}`;
        }
        const res = await api.get(url);
        if (isMounted) {
          setSidebarLatest(res.data?.blogs || res.data || []);
        }
      } catch (err) {
        console.error('Error fetching latest for sidebar:', err);
        if (isMounted) {
          setSidebarLatest([]);
        }
      }
    };

    const loadSidebar = async () => {
      setSidebarLoading(true);
setSidebarSections([]);
   setSidebarLatest([]);
      if (searchQuery) {
        setSidebarSections([]);
        setSidebarLatest([]);
        setSidebarLoading(false);
        return;
      }

      const isCategoryView = activeCategory && activeCategory.toLowerCase() !== 'all';
      const isTagView = !!activeTag;

      if (isCategoryView) {
        setSidebarSections([]);
        await buildLatestSidebar();
      } else if (isTagView) {
        // On tag pages, we also show "Latest" instead of category sections
        setSidebarSections([]);
        await buildLatestSidebar();
      } else {
        await buildHomeSidebar();
        setSidebarLatest([]);
      }

      if (isMounted) setSidebarLoading(false);
    };

    loadSidebar();

    return () => {
      isMounted = false;
    };
 }, [activeCategory, searchQuery, activeTag, lang]);

  // ===== MAIN FEED FETCH (HOME / CATEGORY / TAG / SEARCH) =====
  const fetchBlogs = useCallback(
    async (pageToLoad = 1, append = false) => {
      if (pageToLoad === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const isCategoryView = activeCategory && activeCategory.toLowerCase() !== 'all';
        const isTagView = !!activeTag;

        if (!searchQuery && !isCategoryView && !isTagView) {
          // HOMEPAGE FEED
          const res = await api.get('/blogs/homepage-feed');
          const { blogs: newBlogs } = res.data;

          setBlogs(newBlogs || []);
          setCurrentPage(1);
          setTotalPages(1);
          setTotalBlogsCount(newBlogs?.length || 0);
        } else {
          // CATEGORY / SEARCH / TAG
          let url = '';
          if (searchQuery) {
            url = `/blogs/search?q=${encodeURIComponent(searchQuery)}&page=${pageToLoad}&limit=${INITIAL_PAGE_SIZE}&_t=${Date.now()}`;
          } else if (isCategoryView) {
            url = `/blogs?category=${encodeURIComponent(activeCategory)}&page=${pageToLoad}&limit=${INITIAL_PAGE_SIZE}`;
          } else if (isTagView) {
            // Backend should accept ?tag=<Display Name> (e.g., "Healthy Diet")
            url = `/blogs?tag=${encodeURIComponent(activeTag)}&page=${pageToLoad}&limit=${INITIAL_PAGE_SIZE}`;
          }

          const res = await api.get(url);
          const {
            blogs: newBlogs,
            currentPage: apiCurrentPage,
            totalPages: apiTotalPages,
            totalBlogs: apiTotalBlogs
          } = res.data;

          if (append) {
            setBlogs((prevBlogs) => [...prevBlogs, ...newBlogs]);
          } else {
            setBlogs(newBlogs);
          }
          setCurrentPage(apiCurrentPage);
          setTotalPages(apiTotalPages);
          setTotalBlogsCount(apiTotalBlogs);
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setBlogs([]);
        setTotalPages(0);
        setTotalBlogsCount(0);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
   [activeCategory, searchQuery, activeTag, setBlogs, lang]
  );



useEffect(() => {   // refetch first page when language changes
  if (!isInitialLoad) {     fetchBlogs(1, false);
  }
}, [lang]);


  useEffect(() => {
    if (isInitialLoad) {
      fetchBlogs(1, false);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, fetchBlogs]);

  const loadMoreBlogs = () => {
    if (currentPage < totalPages && !loadingMore) {
      fetchBlogs(currentPage + 1, true);
    }
  };

  const isSearchView = !!searchQuery;
  const isCategoryView = activeCategory && activeCategory.toLowerCase() !== 'all';
  const isTagView = !!activeTag;

  const pageTitle = isSearchView
    ? t('general.search_results_for', { query: searchQuery })
    : isCategoryView
    ? t('general.blogs_in_category', {
        category: t(
          `category.${String(activeCategory)
            .toLowerCase()
            .replace(/ & /g, '_')
            .replace(/\s+/g, '_')}`,
          { defaultValue: activeCategory }
        )
      })
    : isTagView
    ? `Curated #${activeTag} Reads`
    : '';

  if (loading) {
    return <div className="text-center py-20 dark:text-gray-200">{t('general.loading_blogs')}</div>;
  }

  const showDynamicPageTitle = isSearchView || isCategoryView || isTagView;
  const hasBlogsToDisplay = blogs?.length > 0;

  return (
    <div className="min-h-screen">
      <SEO
        title="Innvibs - Innovation & Ideas Hub"
        description="Discover innovative ideas, cutting-edge technology insights, and breakthrough concepts. Join thousands of innovators exploring the future of tech, business, and creativity."
        canonicalUrl="/"
        schema={[organizationSchema, websiteSchema]}
      />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Hide hero & welcome on category AND tag pages */}
            {!isSearchView && !isCategoryView && !isTagView && featuredBlogs.length > 0 && (
              <HeroCarousel blogs={featuredBlogs} />
            )}

            {!isSearchView && !isCategoryView && !isTagView && (
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

            {!isSearchView && !isCategoryView && !isTagView && (
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                {t('homepage.featured_posts').replace('Featured Posts', 'Latest Articles')}
              </h2>
            )}

           <BlogList
              key={`${lang}-${activeCategory}-${activeTag}-${searchQuery}-${currentPage}`}
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
                {/* Home-only sidebar sections */}
                {!isSearchView && !isCategoryView && !isTagView &&
                  sidebarSections.map((sec) => (
                    <SidebarSection
                      key={sec.title}
                      title={sec.title}
                      items={sec.items}
                      onViewMore={() => {
                        const slug = sec.title
                          .toLowerCase()
                          .replace(/\s+/g, '-')
                          .replace(/[^a-z0-9\-&]/g, '')
                          .replace(/-+/g, '-')
                          .replace(/^-+|-+$/g, '');
                        router.push(`/category/${slug}`);
                      }}
                    />
                  ))}

                {/* Category & Tag pages show "Latest" on the sidebar */}
                {!isSearchView && (isCategoryView || isTagView) && (
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

export default memo(HomePage);
