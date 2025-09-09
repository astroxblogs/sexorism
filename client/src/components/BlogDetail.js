import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

// Utility imports
import { getSubscriberId, hasSubscriberId } from '../utils/localStorage';
// --- FIX: We no longer need trackUserLike here, as the button handles it. ---
import { trackUserRead, trackUserComment } from '../services/api';

// Component imports
import LikeButton from '../components/LikeButton.jsx';
import ShareButton from '../components/ShareButton.jsx';
import EmailSubscriptionPopup from './EmailSubscriptionPopup';
const CommentSection = React.lazy(() => import('../components/CommentSection'));


// Helper functions
const createSafeAltText = (text) => {
    if (!text) return '';
    return text.replace(/\b(image|photo|picture)\b/gi, '').replace(/\s\s+/g, ' ').trim();
};

const getLocalizedContent = (field, blogData, currentLang) => {
    const localizedField = blogData[`${field}_${currentLang}`];
    if (localizedField) {
        return localizedField;
    }
    if (blogData[`${field}_en`]) {
        return blogData[`${field}_en`];
    }
    return blogData[field] || '';
};

const MIN_READ_DURATION_SECONDS = 30;
const EXCERPT_LENGTH_CHARS = 500;

const BlogDetail = ({ blog: initialBlog }) => {
    const { id } = useParams();
    const { i18n, t } = useTranslation();
    const [blog, setBlog] = useState(initialBlog || null);
    const [loading, setLoading] = useState(!initialBlog);
    const [error, setError] = useState(null);

    const [isSubscribed, setIsSubscribed] = useState(hasSubscriberId());
    const [showGatedPopup, setShowGatedPopup] = useState(false);

    const startTimeRef = useRef(null);
    const timeSpentRef = useRef(0);
    const lastActivityTimeRef = useRef(Date.now());

    // --- FIX: The handleTrackLike function has been removed. ---
    // The LikeButton component now handles its own tracking internally,
    // which prevents the duplicate API call from happening.

    const handleTrackComment = useCallback(() => {
        const subscriberId = getSubscriberId();
        if (subscriberId && blog?._id) {
            trackUserComment(subscriberId, blog._id)
                .then(() => console.log(`Comment tracked for blog ${blog._id}`))
                .catch(err => console.error("Failed to track comment:", err));
        }
    }, [blog]);


    const sendReadTrackingData = useCallback(async (currentBlogId, currentSubscriberId, duration) => {
        if (!currentSubscriberId || !currentBlogId || duration < MIN_READ_DURATION_SECONDS) {
            console.log('DEBUG: Read tracking skipped due to conditions:', { currentSubscriberId, currentBlogId, duration });
            return;
        }
        try {
            await trackUserRead(currentSubscriberId, currentBlogId, Math.round(duration));
            console.log(`DEBUG: Read behavior for blog ${currentBlogId} tracked successfully. Duration: ${Math.round(duration)}s`);
        } catch (trackingError) {
            console.error('DEBUG: Failed to track read behavior:', trackingError);
        }
    }, []);

    useEffect(() => {
        if (!id) {
            return;
        }

        const fetchBlogAndIncrementViews = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/api/blogs/${id}`);
                setBlog(res.data);
                setError(null);

                try {
                    const v = await axios.patch(`/api/blogs/${id}/views`);
                    if (v?.data?.views !== undefined) {
                        setBlog(prev => ({ ...prev, views: v.data.views }));
                    }
                } catch (e) {
                    console.error("Failed to increment views, but showing content anyway.", e);
                }

                if (hasSubscriberId()) {
                    startTimeRef.current = Date.now();
                    timeSpentRef.current = 0;
                    lastActivityTimeRef.current = Date.now();
                    console.log('DEBUG: Read tracking timer started for blog:', id);
                }

            } catch (err) {
                console.error("Failed to fetch blog post:", err);
                setError(t('Error loading blogs detail'));
                setBlog(null);
            } finally {
                setLoading(false);
            }
        };

        if (initialBlog) {
            setBlog(initialBlog);
            setLoading(false);
            axios.patch(`/api/blogs/${id}/views`)
                .then(v => {
                    if (v?.data?.views !== undefined) {
                        setBlog(prev => ({ ...prev, views: v.data.views }));
                    }
                })
                .catch(e => console.error("Failed to increment views for initial blog.", e));

            if (hasSubscriberId()) {
                startTimeRef.current = Date.now();
            }
        } else {
            fetchBlogAndIncrementViews();
        }

        return () => {
            const currentSubscriberId = getSubscriberId();
            const currentBlogId = id;
            if (currentSubscriberId && startTimeRef.current && timeSpentRef.current > 0) {
                sendReadTrackingData(currentBlogId, currentSubscriberId, timeSpentRef.current / 1000);
            }
            startTimeRef.current = null;
            timeSpentRef.current = 0;
        };
    }, [id, initialBlog, sendReadTrackingData, t]);

    useEffect(() => {
        if (!blog || !startTimeRef.current || !hasSubscriberId()) return;

        const updateTimeSpent = () => {
            const now = Date.now();
            if (document.visibilityState === 'visible') {
                timeSpentRef.current += (now - lastActivityTimeRef.current);
            }
            lastActivityTimeRef.current = now;
        };

        const intervalId = setInterval(updateTimeSpent, 1000);
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                updateTimeSpent();
            } else {
                lastActivityTimeRef.current = Date.now();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [blog]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            const currentSubscriberId = getSubscriberId();
            const currentBlogId = id;

            if (currentSubscriberId && startTimeRef.current && timeSpentRef.current > 0) {
                const duration = Math.round(timeSpentRef.current / 1000);
                if (duration >= MIN_READ_DURATION_SECONDS) {
                    const payload = JSON.stringify({ subscriberId: currentSubscriberId, blogId: currentBlogId, duration });
                    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
                    navigator.sendBeacon(`${API_BASE_URL}/api/subscribers/track/read`, new Blob([payload], { type: 'application/json' }));
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [id]);

    useEffect(() => {
        const updateSubscriptionStatus = () => {
            setIsSubscribed(hasSubscriberId());
            if (hasSubscriberId() && showGatedPopup) {
                setShowGatedPopup(false);
            }
        };
        window.addEventListener('storage', updateSubscriptionStatus);
        return () => {
            window.removeEventListener('storage', updateSubscriptionStatus);
        };
    }, [showGatedPopup]);

    if (loading) return <div className="text-center mt-20 p-4 dark:text-gray-300">Loading post...</div>;
    if (error) return <div className="text-center mt-20 p-4 text-red-500">{error}</div>;
    if (!blog) return <div className="text-center mt-20 p-4 dark:text-gray-300">Blog post not found.</div>;

    const currentLang = i18n.language;
    const displayTitle = getLocalizedContent('title', blog, currentLang);
    const displayContent = getLocalizedContent('content', blog, currentLang);

    const rawContentHtml = marked.parse(displayContent);
    const cleanContentHtml = DOMPurify.sanitize(rawContentHtml);

    let contentToDisplay = cleanContentHtml;
    let showContentOverlay = false;

    if (!isSubscribed && blog && displayContent) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = rawContentHtml;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';

        if (textContent.length > EXCERPT_LENGTH_CHARS) {
            const excerptText = textContent.substring(0, EXCERPT_LENGTH_CHARS);
            contentToDisplay = DOMPurify.sanitize(marked.parse(excerptText + '...'));
            showContentOverlay = true;
        } else if (textContent.trim().length > 0) {
            showContentOverlay = true;
        }
    }

    const coverImage = blog.image && blog.image.trim() !== '' ? blog.image.trim() : 'https://placehold.co/800x400/666/fff?text=No+Image';
    const cleanAltTitle = createSafeAltText(displayTitle);

    return (
        <article className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-xl p-4 sm:p-6 md:p-8 mt-4 md:mt-8 mb-8 relative">
            <div className="w-full h-55 flex items-center justify-center bg-gray-100">
                <img
                    src={coverImage}
                    alt={cleanAltTitle}
                    className="w-full h-auto object-contain rounded-lg"
                    loading="lazy"
                />
            </div>

            <div className="flex items-start justify-between gap-3 mb-3 md:mb-4">
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold text-gray-900 dark:text-white leading-tight" style={{ fontFamily: 'Arial, sans-serif' }}>{displayTitle}</h1>
                <ShareButton
                    blogId={blog._id}
                    initialShareCount={blog.shareCount}
                    blogSlug={blog.slug}
                    title={blog.title}
                    url={`https://www.innvibs.com/blog/${blog.slug}`}
                />
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 md:mb-8">
                <span>Published on: {blog.date ? new Date(blog.date).toLocaleDateString() : 'Invalid Date'}</span>
                <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.562 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.865.802V10.333z"></path></svg>
                    {blog.likes || 0}
                </span>
                <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.08-3.242A8.877 8.877 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.72 14.48A6.879 6.879 0 008 15c3.314 0 6-2.686 6-6s-2.686-6-6-6a6.879 6.879 0 00-3.28.52l.995 2.985A.5.5 0 016 7h.5a.5.5 0 01.5.5v.5a.5.5 0 01-.5.5h-.5a.5.5 0 01-.5-.5v-.5a.5.5 0 01.3-.464L4.72 14.48z" clipRule="evenodd"></path></svg>
                    {blog.comments?.length || 0}
                </span>
                <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    {blog.views || 0}
                </span>
            </div>

            <div className="relative">
                <div
                    className="prose prose-base sm:prose-lg lg:prose-xl dark:prose-invert max-w-none mb-6 md:mb-8 prose-img:rounded-xl prose-img:max-h-[400px] prose-img:mx-auto"
                >
                    <div
                        dangerouslySetInnerHTML={{
                            __html: isSubscribed ? cleanContentHtml : contentToDisplay,
                        }}
                        className={`${showContentOverlay ? 'line-clamp-4' : ''}`}
                    />

                    {!isSubscribed && showContentOverlay && (
                        <div className="relative">
                            <div
                                className="absolute inset-0 top-20 backdrop-blur-sm"
                                style={{ height: "70%" }}
                            ></div>
                            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
                        </div>
                    )}
                </div>
            </div>

            {showContentOverlay && (
                <div className="flex flex-col items-center justify-center p-4 text-center -mt-16 relative z-10">
                    <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Subscribe to Read Full Article!
                    </p>
                    <button
                        onClick={() => setShowGatedPopup(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors duration-200"
                    >
                        Subscribe Now
                    </button>
                </div>
            )}

            {showGatedPopup && (
                <EmailSubscriptionPopup
                    showPopup={showGatedPopup}
                    onClose={() => setShowGatedPopup(false)}
                    onSubscribeSuccess={() => {
                        setIsSubscribed(true);
                        setShowGatedPopup(false);
                    }}
                />
            )}

            <div className="flex flex-wrap gap-2 mb-6 md:mb-8">
                {blog.tags?.map((tag) => (
                    <Link
                        key={tag}
                        to={`/tag/${encodeURIComponent(tag.toLowerCase())}`}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm font-medium rounded-full hover:bg-blue-200 dark:hover:bg-blue-600 hover:text-blue-700 dark:hover:text-blue-100 transition-colors cursor-pointer"
                    >
                        #{tag}
                    </Link>
                ))}
            </div>

            <div className="border-t dark:border-gray-700 pt-6">
                <div className="mb-8">
                    {isSubscribed ? (
                        // --- FIX: The `onLikeSuccess` prop is removed ---
                        <LikeButton
                            blogId={blog._id}
                            initialLikes={blog.likes}
                        />
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Subscribe to like this post!</p>
                    )}
                </div>
                <Suspense fallback={<div className="text-center py-10 dark:text-gray-400">Loading comments...</div>}>
                    {isSubscribed ? (
                        <CommentSection
                            blogId={blog._id}
                            initialComments={blog.comments}
                            onCommentSuccess={handleTrackComment}
                        />
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Subscribe to view and post comments!</p>
                    )}
                </Suspense>
            </div>
        </article>
    );
};

export default BlogDetail;

