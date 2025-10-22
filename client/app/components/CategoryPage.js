// app/components/CategoryPage.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../lib/api.js';
import SEO from './SEO.js';
import HomePage from './HomePage';

const CategoryPage = ({ categoryName }) => {
  const { i18n } = useTranslation();
  const isHi = (i18n?.resolvedLanguage || i18n?.language || '').toLowerCase().startsWith('hi');
  const basePrefix = isHi ? '/hi' : '';

  // Ensure we have a decoded slug
  const categorySlug = decodeURIComponent(categoryName || '');
  
  // Treat these as NON-category routes (prevents /api/categories/sitemap)
  const RESERVED_SLUGS = new Set([
    'sitemap', 'tag', 'search', 'about', 'contact', 'privacy', 'terms', 'admin', 'cms'
  ]);

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCategoryData = async () => {
      // Skip entirely on reserved/non-category routes
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

        // 1) Try /categories/:slug
        for (const s of candidates) {
          try {
            const res = await api.get(`/categories/${s}`);
            if (res?.data) {
              cat = res.data;
              break;
            }
          } catch {}
        }

        // 2) Fallback: list & match
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

        // 3) Hydrate by ID to pull full meta fields
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
    return <div className="text-center py-20 dark:text-gray-200">Loading category…</div>;
  }
  if (error || !category) {
    return <div className="text-center py-20 text-red-500">{error || 'Could not load category.'}</div>;
  }

  const displayName =
    i18n.language === 'hi'
      ? (category.name_hi || category.name_en)
      : (category.name_en || category.name_hi);

  const metaDescriptionFallback =
    `Explore the latest articles, news, and insights in the ${category.name_en} category on Innvibs. Stay updated with our in-depth posts.`;

  // ✅ Canonical respects language prefix
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
      <HomePage />
    </>
  );
};

export default CategoryPage;
