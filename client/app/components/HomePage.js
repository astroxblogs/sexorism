'use client';

import React, { useEffect, useState, useCallback, memo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion, useScroll } from 'framer-motion';
import { makeCategoryLink, makeBlogLink } from '../lib/paths';

import BlogList from './BlogList';
import HeroCarousel from './HeroCarousel.jsx';
import SEO from './SEO.js';
import api from '../lib/api.js';
import { useBlogs } from '../context/BlogContext.js';

const INITIAL_PAGE_SIZE = 6;

const toSlug = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/\s*&\s*/g, '-and-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-&]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

const RESERVED_TOP_LEVEL = new Set([
  '', 'hi', 'tag', 'search', 'about', 'contact', 'privacy', 'terms', 'admin', 'cms', '_next', 'api', 'static', 'sitemap'
]);

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Soft blobs – now neutral, not locked to purple/pink */}
      <motion.div
        className="
          absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl
          bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.03),transparent)]
          dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent)]
        "
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="
          absolute top-1/3 -left-40 w-96 h-96 rounded-full blur-3xl
          bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02),transparent)]
          dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent)]
        "
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -90, 0],
          x: [0, -30, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:72px_72px]" />
    </div>
  );
};

const AdBlock = ({ color = 'purple' }) => (
  <div className="w-full sm:w-44 lg:w-64 flex-shrink-0">
    {/* Ad placeholder is commented – no color impact now */}
    {/* <div className="sticky sm:static top-24 rounded-2xl border border-light-border p-6 h-40 sm:h-80 flex items-center justify-center bg-[var(--color-bg-secondary)]">
      <span className="text-center text-[var(--color-text-secondary)] text-base sm:text-lg font-semibold">
        Ad Space<br />300x400
      </span>
    </div> */}
  </div>
);

const HomePage = (props) => {
  const { categoryMode = false, categoryFilter } = props || {};
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

  const { scrollY } = useScroll();

  const rawPath = pathname || '/';
  const isHindi = rawPath === '/hi' || rawPath.startsWith('/hi/');
  const pathForRouting = isHindi ? (rawPath.slice(3) || '/') : rawPath;
  const basePrefix = isHindi ? '/hi' : '';
  const locale = isHindi ? 'hi' : 'en';

  const segments = (pathForRouting || '').split('/').filter(Boolean);
  const RESERVED = new Set(['hi', 'tag', 'search', 'about', 'contact', 'privacy', 'terms', 'admin', 'cms', 'sitemap']);
  const isLegacyCategory = segments[0] === 'category' && !!segments[1];
  const isCleanCategory = !!segments[0] && !RESERVED.has(segments[0]);
  const isCategoryPage = Boolean(isLegacyCategory || isCleanCategory);
  const categorySlug = isLegacyCategory ? segments[1] : isCleanCategory ? segments[0] : null;

  const convertSlugToCategoryName = (slug) => {
    if (!slug) return '';
    const s = decodeURIComponent(slug).trim().toLowerCase();
    const withAmp = s.replace(/-and-/g, ' & ').replace(/-&-/g, ' & ');
    const spaced = withAmp.replace(/-/g, ' ');
    return spaced
      .split(' ')
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(' ')
      .replace(/\s*&\s*/g, ' & ');
  };

  const categoryFromUrl = categorySlug ? convertSlugToCategoryName(categorySlug) : null;
  const activeCategory = searchParams.get('category') || categoryFromUrl || 'all';

  const isTagPage = pathForRouting.startsWith('/tag/');
  const tagFromUrl = isTagPage ? pathForRouting.split('/tag/')[1] : null;

  const convertSlugToLabel = (slug) => {
    if (!slug) return '';
    const decoded = decodeURIComponent(slug);
    return decoded
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  const activeTag = tagFromUrl ? convertSlugToLabel(tagFromUrl) : '';
  const searchQuery = searchParams.get('q') || '';

  const [sidebarLatest, setSidebarLatest] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogsCount, setTotalBlogsCount] = useState(0);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Category pagination state
  const [categoryCurrentPage, setCategoryCurrentPage] = useState(1);
  const [categoryTotalPages, setCategoryTotalPages] = useState(1);
  const [categoryTotalBlogs, setCategoryTotalBlogs] = useState(0);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sexorism',
    url: 'https://www.Sexorism.com',
    logo: 'https://www.Sexorism.com/logo512.png',
    sameAs: [
      'https://www.facebook.com/your-profile',
      'https://www.twitter.com/your-profile',
      'https://www.instagram.com/your-profile',
      'https://www.linkedin.com/company/your-company',
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: 'https://www.Sexorism.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.Sexorism.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  useEffect(() => {
    const fetchFeaturedBlogs = async () => {
      if (featuredBlogs.length > 0) setFeaturedBlogs([]);
      try {
        const res = await api.get('/blogs/latest');
        if (setFeaturedBlogs) {
          setFeaturedBlogs(res.data);
        }
      } catch (err) {
        console.error('Error fetching featured blogs:', err);
      }
    };
    fetchFeaturedBlogs();
  }, [lang]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

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
          const res = await api.get('/blogs/homepage-feed');
          const { blogs: newBlogs } = res.data;

          setBlogs(newBlogs || []);
          setCurrentPage(1);
          setTotalPages(1);
          setTotalBlogsCount(newBlogs?.length || 0);
        } else {
          let url = '';
          if (searchQuery) {
            url = `/blogs/search?q=${encodeURIComponent(
              searchQuery
            )}&page=${pageToLoad}&limit=${INITIAL_PAGE_SIZE}&_t=${Date.now()}`;
          } else if (isCategoryView) {
            const queryCategory = activeCategory.replace(/\bAnd\b/g, '&');
            url = `/blogs?category=${encodeURIComponent(
              queryCategory
            )}&page=${pageToLoad}&limit=${INITIAL_PAGE_SIZE}`;
          } else if (isTagView) {
            url = `/blogs?tag=${encodeURIComponent(
              activeTag
            )}&page=${pageToLoad}&limit=${INITIAL_PAGE_SIZE}`;
          }

          const res = await api.get(url);
          const {
            blogs: newBlogs,
            currentPage: apiCurrentPage,
            totalPages: apiTotalPages,
            totalBlogs: apiTotalBlogs,
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



 // Category pagination function
 const fetchCategoryBlogs = useCallback(
  async (page = 1) => {
    if (categoryLoading) return;

    setCategoryLoading(true);
    try {
      const queryCategory = activeCategory.replace(/\bAnd\b/g, '&');
      const res = await api.get(
        `/blogs?category=${encodeURIComponent(queryCategory)}&page=${page}&limit=8`
      );

      const {
        blogs: newBlogs,
        currentPage: apiCurrentPage,
        totalPages: apiTotalPages,
        totalBlogs: apiTotalBlogs,
      } = res.data;

      setBlogs(newBlogs);
      setCategoryCurrentPage(apiCurrentPage);
      setCategoryTotalPages(apiTotalPages);
      setCategoryTotalBlogs(apiTotalBlogs);
    } catch (err) {
      console.error('Error fetching category blogs:', err);
      setBlogs([]);
    } finally {
      setCategoryLoading(false);
    }
  },
  [activeCategory, categoryLoading]
);



  // Initialize category pagination when categoryMode is active
  useEffect(() => {
    if (categoryMode && activeCategory && activeCategory !== 'all') {
      setCategoryCurrentPage(1);
      fetchCategoryBlogs(1);
    }
  }, [categoryMode, activeCategory]);

  const loadMoreBlogs = () => {
    if (currentPage < totalPages && !loadingMore) {
      fetchBlogs(currentPage + 1, true);
    }
  };

  
  // Handle category page change
  const handleCategoryPageChange = (page) => {
    if (page >= 1 && page <= categoryTotalPages) {
      fetchCategoryBlogs(page);
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
        ),
      })
    : isTagView
    ? `Curated #${activeTag} Reads`
    : '';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
        <div className="relative">
          <motion.div
            className="w-16 h-16 border-4 border-[var(--color-bg-secondary)] border-t-[var(--color-accent)] rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[var(--color-accent)] rounded-full opacity-70"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </div>
    );
  }

  const showDynamicPageTitle = isSearchView || isCategoryView || isTagView;
  const hasBlogsToDisplay = blogs?.length > 0;

  return (
    <div className="min-h-screen relative bg-[var(--color-bg-primary)]">
      <AnimatedBackground />

      <SEO
        title="Sexorism: Technology, Travel, Health, Lifestyle, Trends, Sports, Fashion with Vastu & Astro"
        description="Explore technology, travel, health & wellness, lifestyle trends, sports and fashion—plus Vastu & astrology insights. Fresh stories daily from Sexorism."
        canonicalUrl={basePrefix || '/'}
        schema={[organizationSchema, websiteSchema]}
      />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 relative z-10">
        {/* Hero Section - Full Width on Homepage */}
        {!isSearchView &&
          !isCategoryView &&
          !isTagView &&
          featuredBlogs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative group mb-8"
            >
              <div className="absolute inset-0 rounded-2xl blur-xl bg-[color:rgba(0,0,0,0.04)] dark:bg-[color:rgba(255,255,255,0.06)]" />
              <div className="relative backdrop-blur-sm bg-[color:rgba(255,255,255,0.78)] dark:bg-[color:rgba(0,0,0,0.78)] rounded-2xl shadow-xl border border-light-border overflow-hidden">
                <HeroCarousel blogs={featuredBlogs} />
              </div>
            </motion.div>
          )}

        {/* Main Content */}
        <div className="w-full space-y-8">
          {/* Welcome Section - Only on Homepage */}
          {!isSearchView && !isCategoryView && !isTagView && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center relative flex flex-col items-center"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="
                  inline-flex items-center px-4 py-2 rounded-full
                  bg-[var(--color-bg-secondary)]
                  border border-light-border
                  text-sm font-medium text-[var(--color-accent)] mb-4
                "
              >
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)] opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-accent)]"></span>
                </span>
                Discover Amazing Stories
              </motion.span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[var(--color-text-primary)] mb-4 max-w-4xl">
                {t('homepage.welcome_title', 'Welcome to Sexorism Blogs')}
              </h1>
              <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-3xl">
                {t(
                  'homepage.tagline_line2',
                  'Your daily dose of insights into technology and more.'
                )}
              </p>
            </motion.div>
          )}

          {/* Dynamic Page Title */}
          {showDynamicPageTitle && (
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors duration-300 cursor-pointer"
            >
              {pageTitle}
            </motion.h2>
          )}

          {/* Section Title */}
          {!isSearchView && !isCategoryView && !isTagView && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 border-b-2 border-light-border pb-3"
            >
              <div className="flex items-center justify-center gap-2 w-full">
                <div className="w-2 h-8 bg-[var(--color-accent)] rounded-full"></div>
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] text-center">
                  {t('homepage.featured_posts').replace('Featured Posts', 'FEATURED ARTICLES')}
                </h2>
              </div>
            </motion.div>
          )}

          {/* CATEGORY PAGE special layout */}
          {categoryMode && (
            <>
              {hasBlogsToDisplay && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-12"
                >
                  {blogs.map((blog, index) => (
                    <motion.article
                      key={blog._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group cursor-pointer"
                      onClick={() =>
                        router.push(
                          makeBlogLink(
                            locale,
                            toSlug(blog.category || 'uncategorized'),
                            blog.slug || blog._id
                          )
                        )
                      }
                    >
                      <div className="flex flex-col items-center w-full">
                        <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl bg-[var(--color-bg-primary)] transition-shadow duration-300">
                          <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="w-full pt-4 text-center">
                          <h3 className="text-base font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                            {blog.title}
                          </h3>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              )}

              {/* Category Pagination */}
              {categoryTotalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-center items-center mt-12 space-x-2"
                >
                  {/* Previous Button */}
                  <button
                    onClick={() => handleCategoryPageChange(categoryCurrentPage - 1)}
                    disabled={categoryCurrentPage <= 1 || categoryLoading}
                    className="px-3 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ‹ Prev
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: categoryTotalPages }, (_, i) => i + 1)
                    .filter(page => {
                      const current = categoryCurrentPage;
                      // Show first page, last page, current page, and pages around current
                      return page === 1 ||
                             page === categoryTotalPages ||
                             (page >= current - 1 && page <= current + 1);
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-[var(--color-text-secondary)]">...</span>
                        )}
                        <button
                          onClick={() => handleCategoryPageChange(page)}
                          disabled={categoryLoading}
                          className={`px-3 py-2 rounded-lg border transition-colors ${
                            page === categoryCurrentPage
                              ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
                              : 'border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}

                  {/* Next Button */}
                  <button
                    onClick={() => handleCategoryPageChange(categoryCurrentPage + 1)}
                    disabled={categoryCurrentPage >= categoryTotalPages || categoryLoading}
                    className="px-3 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next ›
                  </button>
                </motion.div>
              )}

              {categoryLoading && (
                <div className="flex justify-center mt-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-accent)]"></div>
                </div>
              )}

              {!hasBlogsToDisplay && !categoryLoading && (
                <div className="text-center py-20">
                  <p className="text-xl text-[var(--color-text-secondary)]">
                    {t('No blogs found in this category')}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Featured Articles Grid for homepage - with dual ads */}
          {!isSearchView &&
            !isCategoryView &&
            !isTagView &&
            hasBlogsToDisplay &&
            !categoryMode && (
              <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                {/* Left Ad */}
                <AdBlock color="purple" />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {blogs.slice(0, 6).map((blog, index) => {
                    const categorySlug = toSlug(blog.category || 'uncategorized');
                    const categoryUrl = makeCategoryLink(locale, categorySlug);
                    return (
                      <motion.article
                        key={blog._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group cursor-pointer"
                        onClick={() =>
                          router.push(
                            makeBlogLink(
                              locale,
                              toSlug(blog.category || 'uncategorized'),
                              blog.slug || blog._id
                            )
                          )
                        }
                      >
                        <div className="relative overflow-hidden rounded-xl bg-[var(--color-bg-primary)] shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={blog.image}
                              alt={blog.title}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <div className="p-5">
                            <h3
                              className="
                                text-lg font-bold
                                text-[var(--color-text-primary)]
                                mb-2 line-clamp-2
                                group-hover:text-[var(--color-accent)]
                                transition-colors
                              "
                            >
                              {blog.title}
                            </h3>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </motion.div>
                {/* Right Ad */}
                <AdBlock color="pink" />
              </div>
            )}

          {/* Regular Blog List for other pages */}
          {(isSearchView || isCategoryView || isTagView) && !categoryMode && (
            <BlogList
              key={`${lang}-${activeCategory}-${activeTag}-${searchQuery}-${currentPage}`}
              blogs={blogs}
              loadingMore={loadingMore}
              hasMore={currentPage < totalPages}
              onLoadMore={loadMoreBlogs}
              totalBlogsCount={totalBlogsCount}
              searchQuery={searchQuery}
            />
          )}

          {!hasBlogsToDisplay && !loading && (
            <div className="text-center py-20">
              <p className="text-xl text-[var(--color-text-secondary)]">
                {t('No blogs')}
              </p>
            </div>
          )}

          {/* EXPLORE BY CATEGORY - with dual ads */}
          {!isSearchView &&
            !isCategoryView &&
            !isTagView &&
            categories.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-8 py-8 mt-8"
              >
                <div className="flex items-center justify-center gap-3 w-full">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-8 bg-[var(--color-accent)] rounded-full"></div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] text-center">
                      EXPLORE BY TOPICS
                    </h2>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                  <AdBlock color="blue" />
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 place-items-center">
                    {categories.map((category, index) => {
                      const categoryUrl = makeCategoryLink(locale, category.slug);
                      const displayName =
                        locale === 'hi' && category.name_hi
                          ? category.name_hi
                          : category.name_en;
                      const imageSrc =
                        category.image ||
                        'https://res.cloudinary.com/dsoeem7bp/image/upload/v1757753276/astroxhub_blog_images/default.webp';
                      return (
                        <motion.div
                          key={category._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.05, y: -4 }}
                          className="group cursor-pointer"
                          onClick={() => router.push(categoryUrl)}
                        >
                          <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 aspect-[4/3] w-full bg-[var(--color-bg-secondary)]">
                            <div className="relative overflow-hidden rounded-xl w-[260px] h-[180px] bg-[var(--color-bg-secondary)]">
                              <img
                                src={imageSrc}
                                alt={displayName}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"></div>
                              <div className="absolute bottom-2 left-0 right-0 text-center px-2">
                                <h3 className="text-white font-bold text-sm drop-shadow-md line-clamp-2">
                                  {displayName}
                                </h3>
                              </div>
                            </div>
                            <div className="absolute inset-0 bg-[color:rgba(0,0,0,0)] group-hover:bg-[color:rgba(0,0,0,0.04)] transition-all duration-300 pointer-events-none"></div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  <AdBlock color="cyan" />
                </div>
              </motion.div>
            )}
        </div>
      </main>

      {/* Scroll to Top */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: scrollY > 500 ? 1 : 0 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="
          fixed bottom-8 right-8 z-50 p-4
          rounded-full shadow-xl
          bg-[var(--color-accent)]
          text-[var(--color-bg-primary)]
        "
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </motion.button>
    </div>
  );
};

export default memo(HomePage);
