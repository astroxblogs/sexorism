import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useShare } from '../../context/ShareContext';
import { useTranslation } from 'react-i18next';

// Utility & API imports
import { getSubscriberId, hasSubscriberId } from '../../utils/localStorage';
import { trackUserRead, trackUserComment } from '../../services/api';

// Custom Hook for data fetching
import useBlogData from '../../hooks/useBlogData';

// Presentational Component
import BlogArticle from './BlogArticle';

const MIN_READ_DURATION_SECONDS = 30;

const BlogDetail = ({ blog: initialBlog }) => {
    const { slug } = useParams(); // Changed from id to slug
    const { i18n } = useTranslation();
    
    // Get data and state from our custom hook, passing the slug
    const { blog, loading, error } = useBlogData(slug, initialBlog);

    // Manage UI-specific state
    const [isSubscribed, setIsSubscribed] = useState(hasSubscriberId());
    const [showGatedPopup, setShowGatedPopup] = useState(false);
    
    // Manage other business logic & side effects
    const { getShareCount, setInitialShareCount } = useShare();
    const startTimeRef = useRef(null);
    const timeSpentRef = useRef(0);
    const lastActivityTimeRef = useRef(Date.now());

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
            setIsSubscribed(hasSubscriberId());
            if (hasSubscriberId() && showGatedPopup) {
                setShowGatedPopup(false);
            }
        };
        window.addEventListener('storage', updateSubscriptionStatus);
        return () => window.removeEventListener('storage', updateSubscriptionStatus);
    }, [showGatedPopup]);

    // Render loading/error states or the final component
    if (loading) return <div className="text-center mt-20 p-4 dark:text-gray-300">Loading post...</div>;
    if (error) return <div className="text-center mt-20 p-4 text-red-500">{error}</div>;
    if (!blog) return <div className="text-center mt-20 p-4 dark:text-gray-300">Blog post not found.</div>;

    return (
        <BlogArticle
            blog={blog}
            isSubscribed={isSubscribed}
            setIsSubscribed={setIsSubscribed}
            showGatedPopup={showGatedPopup}
            setShowGatedPopup={setShowGatedPopup}
            handleTrackComment={handleTrackComment}
            getShareCount={getShareCount}
            currentLang={i18n.language}
        />
    );
};

export default BlogDetail;