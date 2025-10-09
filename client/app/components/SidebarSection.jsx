'use client'

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/\s*&\s*/g, '-and-')  // preserve meaning of "&"
    .replace(/\s+/g, '-')          // spaces -> hyphen
    .replace(/[^a-z0-9-]/g, '')    // remove anything not a-z 0-9 or hyphen
    .replace(/-+/g, '-')           // collapse hyphens
    .replace(/^-+|-+$/g, '');      // trim hyphens

const SidebarSection = ({ title, items = [], onViewMore }) => {
    const { i18n, t } = useTranslation();
   const currentLang = i18n?.resolvedLanguage || i18n?.language || 'en';

    const getLocalized = (blog, field) => {
        const localizedField = blog?.[`${field}_${currentLang}`];
        if (localizedField) return localizedField;
        if (blog?.[`${field}_en`]) return blog?.[`${field}_en`];
        return blog?.[field] || '';
    };

    if (!items || items.length === 0) return null;

    return (
  <aside key={currentLang} className="mb-8">
            <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
  {currentLang === 'hi'
    ? t(`category.${title.toLowerCase().replace(/ & /g, '_').replace(/\s+/g, '_')}`, { defaultValue: title })
    : t(`category.${title.toLowerCase().replace(/ & /g, '_').replace(/\s+/g, '_')}`, { defaultValue: title })
  }
 </h3>
                {onViewMore && (
                    <button
                        onClick={onViewMore}
                        className="text-blue-600 hover:underline text-sm font-medium"
                    >
                        {t('general.view_more')}
                    </button>
                )}
            </div>
            <ul className="space-y-4">
                {items.map((blog) => {
                    const categorySlug = blog.category ? slugify(blog.category) : 'uncategorized';
                    const blogSlug = blog.slug || blog._id || 'unknown';
                    const blogUrl = `/${categorySlug}/${blogSlug}`;

                    return (
                        <li key={blog._id} className="flex gap-3 items-start">
                            {blog.image && (
                                <Link href={blogUrl} className="flex-shrink-0">
                                    <img
                                        src={blog.image}
                                        alt={getLocalized(blog, 'title')}
                                        className="w-16 h-12 object-cover rounded"
                                        loading="lazy"
                                    />
                                </Link>
                            )}
                            <Link
                                href={blogUrl}
                                className="text-sm text-gray-800 dark:text-gray-200 leading-snug line-clamp-2 hover:underline"
                            >
                                {getLocalized(blog, 'title')}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
};

export default SidebarSection;