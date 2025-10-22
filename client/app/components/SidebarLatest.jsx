'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCategoryClasses } from '../lib/categoryColors';
import { useTranslation } from 'react-i18next';
import { getCategories } from '../lib/api';
import { makeBlogLink } from '../lib/paths';
const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-&]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const SidebarLatest = ({ title = 'Latest Updates', items = [] }) => {
  const { i18n, t } = useTranslation();
  const currentLang = i18n?.resolvedLanguage || i18n?.language || 'en';
  const basePrefix = String(currentLang).toLowerCase().startsWith('hi') ? '/hi' : '';
   const locale = String(currentLang).toLowerCase().startsWith('hi') ? 'hi' : 'en';
  const [categoryMap, setCategoryMap] = useState({});

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getCategories(); // carries ?lang + Accept-Language via axios interceptor
        if (!isMounted) return;
        const map = {};
        (Array.isArray(data) ? data : []).forEach(c => {
          map[c.name_en] = { name_en: c.name_en, name_hi: c.name_hi, slug: c.slug };
        });
        setCategoryMap(map);
      } catch {}
    })();
    return () => { isMounted = false; };
  }, [currentLang]);

  const getLocalized = (blog, field) => {
    const localized = blog[`${field}_${currentLang}`];
    if (localized) return localized;
    if (blog[`${field}_en`]) return blog[`${field}_en`];
    return blog[field] || '';
  };

  if (!items || items.length === 0) return null;

  return (
    <aside key={currentLang} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4">
      <div className="inline-block bg-black text-white px-3 py-2 rounded font-sans text-sm tracking-wide uppercase mb-4">
        {title}
      </div>
      <ul>
        {items.map((blog, idx) => {
          const categorySlug = blog.category ? slugify(blog.category) : 'uncategorized';
          const blogSlug = blog.slug || blog._id || 'unknown';
          const blogUrl = makeBlogLink(locale, categorySlug, blogSlug);

          return (
            <li key={blog._id} className="mb-6 last:mb-0">
              <Link href={blogUrl} className="block">
                {blog.image && (
                  <img
                    src={blog.image}
                    alt={getLocalized(blog, 'title')}
                    className="w-full h-44 sm:h-48 object-cover rounded"
                    loading="lazy"
                  />
                )}
              </Link>
              <Link
                href={blogUrl}
                className="mt-3 block font-sans text-[15px] sm:text-base md:text-[17px] leading-relaxed font-medium text-gray-900 dark:text-gray-100 hover:underline line-clamp-3"
              >
                {getLocalized(blog, 'title')}
              </Link>
              <div className="mt-2 flex items-center gap-2 text-[11px]">
                {blog.category && (
                  <span className={`px-2 py-0.5 rounded-full ${getCategoryClasses(blog.category)}`}>
                    {currentLang === 'hi'
                      ? (categoryMap[blog.category]?.name_hi ||
                          t(
                            `category.${String(blog.category).toLowerCase().replace(/ & /g, '_').replace(/\s+/g, '_')}`,
                            { defaultValue: blog.category }
                          ))
                      : (categoryMap[blog.category]?.name_en || blog.category)
                    }
                  </span>
                )}
                <span className="text-gray-500 dark:text-gray-400">
                  {blog?.date ? new Date(blog.date).toLocaleDateString() : ''}
                </span>
              </div>
              {idx !== items.length - 1 && (
                <div className="mt-4 border-b border-gray-200 dark:border-gray-800" />
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default SidebarLatest;
