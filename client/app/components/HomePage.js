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

// ✅ helper to make slugs consistent (keeps "&" as -&-)
const toSlug = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/\s*&\s*/g, '-and-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-&]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

// ✅ reserved top-level routes (so we can detect clean category paths)
 const RESERVED_TOP_LEVEL = new Set([
   '', 'tag', 'search', 'about', 'contact', 'privacy', 'terms', 'admin', 'cms', '_next', 'api', 'static',
  'sitemap'
 ]);

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n?.resolvedLanguage || i18n?.language || 'en';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const blogContext = useBlogs();
  const blogs = blogContext?.blogs || [];
  const setBlogs = blogContext?.setBlogs || (() => { });
  const featuredBlogs = blogContext?.featuredBlogs || [];
  const setFeaturedBlogs = blogContext?.setFeaturedBlogs || (() => { });

  // ===== CATEGORY DETECTION (supports both legacy /category/:slug and clean /:slug) =====
  const segments = (pathname || '').split('/').filter(Boolean);

  // routes that are NOT categories
 const RESERVED = new Set(['tag', 'search', 'about', 'contact', 'privacy', 'terms', 'admin', 'cms', 'sitemap']);

  // legacy? /category/:slug
  const isLegacyCategory = segments[0] === 'category' && !!segments[1];

  // clean? /:slug (first segment exists and is not reserved)
  const isCleanCategory = !!segments[0] && !RESERVED.has(segments[0]);

  // are we on a category page?
  const isCategoryPage = Boolean(isLegacyCategory || isCleanCategory);

  // grab the raw slug
  const categorySlug = isLegacyCategory ? segments[1] : (isCleanCategory ? segments[0] : null);

  // slug -> display name your backend expects (e.g. "-and-" -> " & ", title case)
  const convertSlugToCategoryName = (slug) => {
    if (!slug) return '';
    const s = decodeURIComponent(slug).trim().toLowerCase();
    const withAmp = s.replace(/-and-/g, ' & ').replace(/-&-/g, ' & ');
    const spaced = withAmp.replace(/-/g, ' ');
    return spaced
      .split(' ')
      .map(w => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(' ')
      .replace(/\s*&\s*/g, ' & ');
  };

  const categoryFromUrl = categorySlug ? convertSlugToCategoryName(categorySlug) : null;

  const activeCategory =
    searchParams.get('category') ||
    categoryFromUrl ||
    'all';



  // ===== TAG DETECTION =====
  const isTagPage = pathname.startsWith('/tag/');
  const tagFromUrl = isTagPage ? pathname.split('/tag/')[1] : null;

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
      if (featuredBlogs.length > 0) setFeaturedBlogs([]);

      try {
        const res = await api.get('/blogs/latest');
        if (setFeaturedBlogs) {
          setFeaturedBlogs(res.data);
        }
      } catch (err) {
        console.error("Error fetching featured blogs:", err);
      }
    };

    fetchFeaturedBlogs();
  }, [lang]);


  // refetch when language changes

  // ===== SIDEBAR DATA =====
  useEffect(() => {
    let isMounted = true;

    const buildHomeSidebar = async () => {
      if (sidebarSections.length > 0) return;

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
            // Map "Health And Wellness" → "Health & Wellness" for the API
            const queryCategory = activeCategory.replace(/\bAnd\b/g, '&');
            url = `/blogs?category=${encodeURIComponent(queryCategory)}&page=${pageToLoad}&limit=${INITIAL_PAGE_SIZE}`;
          } else if (isTagView) {
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

  useEffect(() => {
    if (!isInitialLoad) {
      fetchBlogs(1, false);
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
  title="Inner Vibes: Technology, Travel, Health, Lifestyle, Trends, Sports, Fashion with Vastu & Astro"
  description="Explore technology, travel, health & wellness, lifestyle trends, sports and fashion—plus Vastu & astrology insights. Fresh stories daily from Innvibs."
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
  <div className="text-center md:text-left mt-4 md:mt-6">
    <motion.h1
      className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-snug md:leading-tight"
      variants={textVariants}
      initial="hidden"
      animate="visible"
    >
      {t('homepage.welcome_title', 'Welcome to Innvibs Blogs')}
    </motion.h1>

    <motion.p
      className="mt-2 text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto md:mx-0"
      variants={taglineVariants}
      initial="hidden"
      animate="visible"
    >
      <span className="block">
        {t('homepage.tagline_line1', 'Inner Vibes — Explore Inside, Express Outside')}
      </span>
      <span className="block">
        {t('homepage.tagline_line2', 'Your daily dose of insights into technology and more.')}
      </span>
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
                        // ✅ push clean URL without /category and keep "&" as -&-
                        const slug = toSlug(sec.title);
                        router.push(`/${slug}`);
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
