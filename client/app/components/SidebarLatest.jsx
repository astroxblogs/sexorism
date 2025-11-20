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
        const data = await getCategories();
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
    <aside 
      key={currentLang} 
      className="relative bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden backdrop-blur-sm"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative p-6">
        {/* Modern title with gradient */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white px-5 py-2.5 rounded-xl font-sans text-sm tracking-wide uppercase mb-6 shadow-lg shadow-purple-500/30 transform hover:scale-105 transition-all duration-300">
          <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>{title}</span>
        </div>

        <ul className="space-y-6">
          {items.map((blog, idx) => {
            const categorySlug = blog.category ? slugify(blog.category) : 'uncategorized';
            const blogSlug = blog.slug || blog._id || 'unknown';
            const blogUrl = makeBlogLink(locale, categorySlug, blogSlug);

            return (
              <li 
                key={blog._id} 
                className="group animate-fade-in-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="relative bg-white dark:bg-gray-800/50 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
                  {/* Image container with overlay effect */}
                  {blog.image && (
                    <Link href={blogUrl} className="block relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 z-10"></div>
                      <img
                        src={blog.image}
                        alt={getLocalized(blog, 'title')}
                        className="w-full h-44 sm:h-48 object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                      {/* Shimmer effect on hover */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    </Link>
                  )}

                  <div className="p-4">
                    {/* Title with gradient on hover */}
                    <Link
                      href={blogUrl}
                      className="block font-sans text-[15px] sm:text-base md:text-[17px] leading-relaxed font-semibold text-gray-900 dark:text-gray-100 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 line-clamp-3"
                    >
                      {getLocalized(blog, 'title')}
                    </Link>

                    {/* Category and date with modern styling */}
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      {blog.category && (
                        <span className={`px-3 py-1 rounded-full font-medium ${getCategoryClasses(blog.category)} transform group-hover:scale-105 transition-transform duration-300 shadow-sm`}>
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
                      <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 font-medium">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {blog?.date ? new Date(blog.date).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>

                  {/* Animated bottom border */}
                  <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </div>

                {/* Modern separator */}
                {idx !== items.length - 1 && (
                  <div className="mt-6 relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700/50"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-3">
                        <svg className="w-5 h-5 text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </aside>
  );
};

export default SidebarLatest;