// app/components/CategoryPage.jsx  (use .jsx or .js)
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../lib/api.js';
import SEO from './SEO.js';
import HomePage from './HomePage';

const CategoryPage = ({ categoryName }) => {
  const { i18n } = useTranslation();

  // Ensure we have a decoded slug
  const categorySlug = decodeURIComponent(categoryName || '');

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCategoryData = async () => {
  if (!categorySlug) return;
  setLoading(true);
  setError(null);

  // slug candidates: keep clean one, try & version
  const candidates = Array.from(new Set([
    categorySlug,                                  // e.g. business-and-finance
    categorySlug.replace(/-and-/g, '-&-'),         // e.g. business-&-finance
  ]));

  const norm = (s) => String(s || '').trim().toLowerCase();

  try {
    let cat = null;

    // 1) Try direct slug endpoint with candidates
    for (const s of candidates) {
      try {
        const res = await api.get(`/categories/by-slug/${s}`);
        if (res?.data) {
          cat = res.data;
          break;
        }
      } catch (_) {
        // keep trying candidates
      }
    }

    // 2) Fallback: fetch list and match by slug or name
    if (!cat) {
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
        items.find(c => norm(c.slug) === norm(categorySlug)) ||
        items.find(c => norm(c.slug) === norm(categorySlug.replace(/-and-/g, '-&-'))) ||
        items.find(c => norm(c.name_en) === norm(nameFromCleanSlug)) ||
        items.find(c => norm(c.name_hi) === norm(nameFromCleanSlug));
    }

    if (!cat) {
      throw new Error('not-found');
    }

    setCategory(cat);
  } catch (err) {
    console.error('Error fetching category data:', err);
    setError('Category not found.');
  } finally {
    setLoading(false);
  }
};


    fetchCategoryData();
    return () => {
      isMounted = false;
    };
  }, [categorySlug]);

  if (!categorySlug) {
    return <div className="text-center py-20 text-lg dark:text-gray-200">Loading…</div>;
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

  const metaDescription =
    category.metaDescription ||
    `Explore the latest articles, news, and insights in the ${category.name_en} category on Innvibs. Stay updated with our in-depth posts.`;

  // ✅ Clean URLs (no /category)
  const canonicalPath = `/${categorySlug}`;

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name_en} Blogs - Innvibs`,
    description: metaDescription,
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

  return (
    <>
      // pick meta from DB first, then fallbacks
const metaTitle =
  category?.metaTitle ||
  (i18n.language === 'hi' ? category?.metaTitle_hi : category?.metaTitle_en) ||
  `${displayName} Blogs - Latest Articles | Innvibs`;

const metaDesc =
  category?.metaDescription ||
  (i18n.language === 'hi' ? category?.metaDescription_hi : category?.metaDescription_en) ||
  metaDescription;

<SEO
  title={metaTitle}
  description={metaDesc}
  canonicalUrl={`/${categorySlug}`}   // clean canonical
  schema={[collectionPageSchema, breadcrumbSchema]}
/>

      {/* Main feed renders based on current path (HomePage already handles category/tag/search) */}
      <HomePage />
    </>
  );
};

export default CategoryPage;
