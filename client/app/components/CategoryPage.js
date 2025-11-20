'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../lib/api.js';
import SEO from './SEO.js';
import HomePage from './HomePage';
import Breadcrumbs from './Breadcrumbs';

// Animated Background Component
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 via-pink-400/20 to-rose-400/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-1/3 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/15 via-cyan-400/15 to-teal-400/15 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -90, 0],
          x: [0, -30, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:72px_72px] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)]" />
    </div>
  );
};

const CategoryPage = ({ categoryName }) => {
  const { i18n } = useTranslation();
  const isHi = (i18n?.resolvedLanguage || i18n?.language || '').toLowerCase().startsWith('hi');
  const basePrefix = isHi ? '/hi' : '';

  const categorySlug = decodeURIComponent(categoryName || '');

  const RESERVED_SLUGS = new Set([
    'sitemap', 'tag', 'search', 'about', 'contact', 'privacy', 'terms', 'admin', 'cms'
  ]);

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCategoryData = async () => {
      if (!categorySlug || RESERVED_SLUGS.has(categorySlug)) {
        if (isMounted) {
          setLoading(false);
          setError(null);
          setCategory(null);
        }
        return;
      }
      setLoading(true);
      setError(null);

      const candidates = Array.from(new Set([
        categorySlug,
        categorySlug.replace(/-and-/g, '-&-'),
      ]));

      const norm = (s) => String(s || '').trim().toLowerCase();

      try {
        let cat = null;
        for (const s of candidates) {
          try {
            const res = await api.get(`/categories/${s}`);
            if (res?.data) {
              cat = res.data;
              break;
            }
          } catch {}
        }
        if (!cat) {
          try {
            const listRes = await api.get('/categories');
            const items = Array.isArray(listRes.data)
              ? listRes.data
              : (listRes.data?.categories || []);
            const nameFromCleanSlug = categorySlug
              .replace(/-and-/g, ' & ')
              .replace(/-/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            cat =
              items.find((c) => norm(c.slug) === norm(categorySlug)) ||
              items.find((c) => norm(c.slug) === norm(categorySlug.replace(/-and-/g, '-&-'))) ||
              items.find((c) => norm(c.name_en) === norm(nameFromCleanSlug)) ||
              items.find((c) => norm(c.name_hi) === norm(nameFromCleanSlug)) ||
              null;
          } catch {}
        }
        if (
          cat &&
          !(
            'metaTitle' in cat ||
            'metaTitle_en' in cat || 'metaTitle_hi' in cat ||
            'metaDescription' in cat ||
            'metaDescription_en' in cat || 'metaDescription_hi' in cat
          ) &&
          cat._id
        ) {
          try {
            const res = await api.get(`/categories/${cat._id}`);
            if (res?.data) cat = res.data;
          } catch {}
        }
        if (!cat) {
          throw new Error('not-found');
        }
        if (isMounted) setCategory(cat);
      } catch (err) {
        console.error('Error fetching category data:', err);
        if (isMounted) setError('Category not found.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategoryData();
    return () => {
      isMounted = false;
    };
  }, [categorySlug]);

  if (!categorySlug || RESERVED_SLUGS.has(categorySlug)) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <motion.div
            className="
              absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl
              bg-[var(--color-bg-secondary)]
            "
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="relative inline-block">
              <motion.div
                className="
                  w-20 h-20 border-4
                  border-[var(--color-bg-secondary)]
                  border-t-[var(--color-accent)]
                  rounded-full
                "
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="
                  absolute inset-0 w-20 h-20 border-4
                  border-transparent border-t-[var(--color-accent)]
                  rounded-full opacity-70
                "
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            <motion.p
              className="mt-6 text-lg font-semibold text-[var(--color-accent)]"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Loading content…
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center px-6"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-3xl blur-2xl bg-[color:rgba(0,0,0,0.04)]" />
            <div
              className="
                relative backdrop-blur-xl rounded-3xl px-12 py-10 shadow-xl
                bg-[var(--color-bg-primary)]
                border border-light-border
              "
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-block mb-6"
              >
                <div
                  className="
                    w-20 h-20 rounded-full flex items-center justify-center shadow-lg
                    bg-[var(--color-accent)]
                  "
                >
                  <svg className="w-10 h-10 text-[var(--color-bg-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </motion.div>
              <h2 className="text-3xl font-bold text-[var(--color-accent)] mb-3">
                Category Not Found
              </h2>
              <p className="mb-6 text-lg text-[var(--color-text-secondary)]">
                {error || 'Could not load category.'}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.history.back()}
                className="
                  px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl
                  text-[var(--color-bg-primary)]
                  bg-[var(--color-accent)]
                  transition-all duration-300
                "
              >
                Go Back
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const displayName =
    i18n.language === 'hi'
      ? (category.name_hi || category.name_en)
      : (category.name_en || category.name_hi);

  const metaDescriptionFallback =
    `Explore the latest articles, news, and insights in the ${category.name_en} category on Innvibs. Stay updated with our in-depth posts.`;

  const canonicalPath = `${basePrefix}/${categorySlug}`;

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name_en} Blogs - Innvibs`,
    description: (category.metaDescription ?? metaDescriptionFallback),
    url: `https://www.innvibs.com${canonicalPath}`,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.innvibs.com' },
      { '@type': 'ListItem', position: 2, name: category.name_en, item: `https://www.innvibs.com${canonicalPath}` },
    ],
  };

  const metaTitle =
    category?.metaTitle ??
    (isHi ? category?.metaTitle_hi : category?.metaTitle_en) ??
    undefined;

  const metaDesc =
    category?.metaDescription ??
    (isHi ? category?.metaDescription_hi : category?.metaDescription_en) ??
    undefined;

  return (
    <>
      <SEO
        title={metaTitle}
        description={metaDesc}
        canonicalUrl={canonicalPath}
        schema={[collectionPageSchema, breadcrumbSchema]}
      />

      <div className="min-h-screen relative bg-[var(--color-bg-primary)]">
        <AnimatedBackground />

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Main Content - Full Width */}
          <div className="w-full">
            {/* Category Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 dark:from-white dark:via-purple-300 dark:to-pink-300">
                {displayName}
              </h1>
              {(category.description || metaDesc) && (
                <p className="text-base md:text-lg max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
                  {category.description || metaDesc}
                </p>
              )}
              <div className="mt-5 h-1 w-24 mx-auto rounded-full bg-gradient-to-r from-purple-600 to-pink-600" />
            </motion.div>

            {/* HomePage Component with blogs */}
            <HomePage categoryFilter={category._id} categoryMode={true} />
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryPage;
