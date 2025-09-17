import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useShare } from '../../context/ShareContext';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

// Utility & API imports
import { getSubscriberId, hasSubscriberId } from '../../utils/localStorage';
import { trackUserRead, trackUserComment } from '../../services/api';

// Custom Hook for data fetching
import useBlogData from '../../hooks/useBlogData';

// Presentational Component
import BlogArticle from './BlogArticle';

const MIN_READ_DURATION_SECONDS = 30;
const POPUP_DELAY_SECONDS = 10; // 15 seconds delay for popup

const BlogDetail = ({ blog: initialBlog }) => {
    const { slug } = useParams();
    const { i18n } = useTranslation();
    
    // Get data and state from our custom hook, passing the slug
    const { blog, loading, error } = useBlogData(slug, initialBlog);

    // Manage UI-specific state
    const [isSubscribed, setIsSubscribed] = useState(hasSubscriberId());
    const [showGatedPopup, setShowGatedPopup] = useState(false);
    const [showTimedPopup, setShowTimedPopup] = useState(false); 
    
    // Manage other business logic & side effects
    const { getShareCount, setInitialShareCount } = useShare();
    const startTimeRef = useRef(null);
    const timeSpentRef = useRef(0);
    const lastActivityTimeRef = useRef(Date.now());
    const timerRef = useRef(null); 

    const sendReadTrackingData = useCallback(async (currentBlogId, currentSubscriberId, duration) => {
        if (!currentSubscriberId || !currentBlogId || duration < MIN_READ_DURATION_SECONDS) {
            return;
        }
        try {
            await trackUserRead(currentSubscriberId, currentBlogId, Math.round(duration));
        } catch (trackingError) {
            console.error('Failed to track read behavior:', trackingError);
        }
    }, []);

    const handleTrackComment = useCallback(() => {
        const subscriberId = getSubscriberId();
        if (subscriberId && blog?._id) {
            trackUserComment(subscriberId, blog._id)
                .then(() => console.log(`Comment tracked for blog ${blog._id}`))
                .catch(err => console.error("Failed to track comment:", err));
        }
    }, [blog]);

    // 15-second timer logic
    useEffect(() => {
        if (!isSubscribed && blog && !showTimedPopup) {
            timerRef.current = setTimeout(() => {
                setShowTimedPopup(true);
            }, POPUP_DELAY_SECONDS * 1000);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [blog, isSubscribed, showTimedPopup]);

    const handleTimedPopupSuccess = useCallback(() => {
        setIsSubscribed(true);
        setShowTimedPopup(false);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (blog?._id && blog.shareCount !== undefined) {
            setInitialShareCount(blog._id, blog.shareCount);
        }
    }, [blog, setInitialShareCount]);

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
        return () => clearInterval(intervalId);
    }, [blog]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            const currentSubscriberId = getSubscriberId();
            const duration = Math.round(timeSpentRef.current / 1000);
            if (currentSubscriberId && startTimeRef.current && duration > 0) {
                sendReadTrackingData(blog?._id, currentSubscriberId, duration);
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [blog, sendReadTrackingData]);

    useEffect(() => {
        const updateSubscriptionStatus = () => {
            const wasSubscribed = isSubscribed;
            const nowSubscribed = hasSubscriberId();
            setIsSubscribed(nowSubscribed);
            
            if (!wasSubscribed && nowSubscribed) {
                setShowGatedPopup(false);
                setShowTimedPopup(false);
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                    timerRef.current = null;
                }
            }
        };
        window.addEventListener('storage', updateSubscriptionStatus);
        return () => window.removeEventListener('storage', updateSubscriptionStatus);
    }, [isSubscribed]);

    // Render loading/error states
    if (loading) return <div className="text-center mt-20 p-4 dark:text-gray-300">Loading post...</div>;
    if (error) return <div className="text-center mt-20 p-4 text-red-500">{error}</div>;
    if (!blog) return <div className="text-center mt-20 p-4 dark:text-gray-300">Blog post not found.</div>;

    return (
        <>
            {/* ✅ Helmet SEO tags */}
            <Helmet>
                <title>{blog.title} - Innvibs</title>
                <meta name="description" content={blog.content?.slice(0, 150)} />
                <meta property="og:title" content={blog.title} />
                <meta property="og:description" content={blog.content?.slice(0, 150)} />
                <meta property="og:image" content={blog.image} />
                <meta property="og:url" content={`https://www.innvibs.com/blog/${blog.slug}`} />
                <meta property="og:type" content="article" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={blog.title} />
                <meta name="twitter:description" content={blog.content?.slice(0, 150)} />
                <meta name="twitter:image" content={blog.image} />
            </Helmet>

            <BlogArticle
                blog={blog}
                isSubscribed={isSubscribed}
                setIsSubscribed={setIsSubscribed}
                showGatedPopup={showGatedPopup}
                setShowGatedPopup={setShowGatedPopup}
                showTimedPopup={showTimedPopup}
                setShowTimedPopup={setShowTimedPopup}
                onTimedPopupSuccess={handleTimedPopupSuccess}
                handleTrackComment={handleTrackComment}
                getShareCount={getShareCount}
                currentLang={i18n.language}
            />
        </>
    );
};

export default BlogDetail;
