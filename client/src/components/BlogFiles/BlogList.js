import React, { useRef, useEffect } from 'react';
import BlogCard from './BlogCard';
import { useTranslation } from 'react-i18next';

// --- FIX: Accept the onLikeUpdate prop from the parent (Home.js) ---
const BlogList = ({ blogs, loadingMore, hasMore, onLoadMore, totalBlogsCount, onLikeUpdate }) => {
    const { t } = useTranslation();
    const observerRef = useRef(null);

    useEffect(() => {
        if (!hasMore || loadingMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onLoadMore(); // Trigger loading more blogs
                }
            },
            {
                root: null, // viewport
                rootMargin: '0px',
                threshold: 1.0, // 100% visibility
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
        <div className="max-w-4xl w-full mx-auto px-0">
            {blogs && blogs.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                    {blogs.map((blog, index) => {
                        const isLast = index === blogs.length - 1;
                        return (
                            <div key={blog._id} ref={isLast ? observerRef : null}>
                                {/* --- FIX: Pass the onLikeUpdate prop down to each BlogCard --- */}
                                <BlogCard blog={blog} onLikeUpdate={onLikeUpdate} />
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

export default BlogList;

