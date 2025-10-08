import React, { useRef, useEffect, memo } from 'react';
import BlogCard from './BlogCard';
import { useTranslation } from 'react-i18next';
// ✅ STEP 1: Import the function to get the anonymous user ID
import { getVisitorId } from '../utils/localStorage';

const BlogList = ({ blogs, loadingMore, hasMore, onLoadMore, totalBlogsCount, onLikeUpdate, searchQuery }) => {
     const { t, i18n } = useTranslation();
 const lang = i18n?.resolvedLanguage || i18n?.language || 'en';
    const observerRef = useRef(null);

    // ✅ STEP 2: Get the visitorId once for the entire list
    const visitorId = getVisitorId();

    useEffect(() => {
        if (!hasMore || loadingMore || typeof window === 'undefined') return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onLoadMore(); // Trigger loading more blogs
                }
            },
            {
                root: null, // viewport
                rootMargin: '100px', // Load more when element is 100px from viewport
                threshold: 0.1, // 10% visibility
            }
        );

        const currentObserver = observerRef.current;
        if (currentObserver) {
            observer.observe(currentObserver);
        }

        return () => {
            if (currentObserver) observer.unobserve(currentObserver);
        };
    }, [hasMore, loadingMore, onLoadMore]);

    return (
      <div key={lang} className="max-w-4xl w-full mx-auto px-0">
            {blogs && blogs.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                    {blogs.map((blog, index) => {
                        const isLast = index === blogs.length - 1;
                        return (
                            <div key={blog._id} ref={isLast ? observerRef : null}>
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