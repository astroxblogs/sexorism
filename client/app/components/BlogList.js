'use client'

import React, { useRef, useEffect, memo } from 'react';
import BlogCard from './BlogCard';
import { useTranslation } from 'react-i18next';
// ✅ STEP 1: Import the function to get the anonymous user ID
import { getVisitorId } from '../utils/localStorage';
// import AdSense from './AdSense'; // AD: domain-aware

const BlogList = ({ blogs, loadingMore, hasMore, onLoadMore, totalBlogsCount, onLikeUpdate, searchQuery }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n?.resolvedLanguage || i18n?.language || 'en';

  // Ref to the last list item for infinite scroll
  const observerRef = useRef(null);
  const ioRef = useRef(null); // keep the IntersectionObserver instance to disconnect on cleanup

  // ✅ STEP 2: Get the visitorId once for the entire list
  const visitorId = getVisitorId();

  useEffect(() => {
    // clean up any previous observer
    if (ioRef.current) {
      ioRef.current.disconnect();
      ioRef.current = null;
    }

    if (!hasMore || loadingMore || typeof window === 'undefined') return;

    // if there is no target yet (e.g., first render), do nothing
    const target = observerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          // Guard against duplicate triggers if already loading
          if (!loadingMore && typeof onLoadMore === 'function') {
            onLoadMore();
          }
        }
      },
      {
        root: null,           // viewport
        rootMargin: '100px',  // Load more when element is ~100px from viewport
        threshold: 0.1,       // 10% visibility
      }
    );

    ioRef.current = observer;
    observer.observe(target);

    return () => {
      if (ioRef.current) {
        ioRef.current.disconnect();
        ioRef.current = null;
      }
    };
  }, [hasMore, loadingMore, onLoadMore, blogs]); // include blogs so we reattach to the new last item

  return (
    <div key={lang} className="max-w-4xl w-full mx-auto px-0">
      {blogs && blogs.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
              {blogs.map((blog, index) => {
            const isLast = index === blogs.length - 1;
            return (
              <div
                key={blog._id || index}
                ref={isLast ? observerRef : null}
              >
                {/* ✅ STEP 3: Pass the visitorId down to each BlogCard */}
                <BlogCard
                  blog={blog}
                  onLikeUpdate={onLikeUpdate}
                  searchQuery={searchQuery}
                  visitorId={visitorId}
                />
              </div>
           );
         })}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">
          {loadingMore ? t('loading blogs....') : t('Sorry no blogs found')}
        </p>
      )}

      {loadingMore && (
        <div className="text-center py-3 text-gray-500 dark:text-gray-400">
          {t('loading blogs....')}
        </div>
      )}
    </div>
  );
};

export default memo(BlogList);
