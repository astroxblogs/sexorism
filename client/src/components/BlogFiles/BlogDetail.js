import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

import { useBlogs } from '../../context/BlogContext';
import { useShare } from '../../context/ShareContext';
import api from '../../services/api';

import { hasSubscriberId } from '../../utils/localStorage';
import { incrementBlogView } from '../../services/api';
import BlogArticle from './BlogArticle';

const slugify = (text) => {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-&]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
};

const POPUP_DELAY_SECONDS = 15;

const BlogDetail = () => {
    const { categoryName, blogSlug } = useParams();
    const { i18n } = useTranslation();

    const { blogs, updateBlog } = useBlogs();
    const { getShareCount, setInitialShareCount } = useShare();

    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isSubscribed, setIsSubscribed] = useState(hasSubscriberId());
    const [showTimedPopup, setShowTimedPopup] = useState(false);
    const timerRef = useRef(null);
    const processedBlogId = useRef(null);

    useEffect(() => {
        const loadBlog = async () => {
            setLoading(true);
            const blogFromContext = blogs.find(b => b.slug === blogSlug);

            if (blogFromContext) {
                setBlog(blogFromContext);
                setLoading(false);
            } else {
                try {
                    const res = await api.get(`/api/blogs/${categoryName}/${blogSlug}`);
                    if (res.data) {
                        setBlog(res.data);
                        updateBlog(res.data);
                    } else { setError("Blog post not found."); }
                } catch (err) {
                    setError(`Failed to load blog post: ${err.message}`);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadBlog();
    // ✅ THIS IS THE FIX: We are telling the linter to ignore this line
    // because we are intentionally omitting dependencies to prevent an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blogSlug, categoryName]);

    // --- All your other hooks and logic are restored below ---

    // View Count Logic
    useEffect(() => {
        if (!blog || !blog._id || processedBlogId.current === blog._id) return;
        const COOLDOWN_PERIOD = 60 * 60 * 1000;
        const now = Date.now();
        try {
            const viewedBlogs = JSON.parse(localStorage.getItem('viewedBlogs')) || {};
            const lastViewed = viewedBlogs[blog._id];
            if (!lastViewed || now - lastViewed > COOLDOWN_PERIOD) {
                viewedBlogs[blog._id] = now;
                localStorage.setItem('viewedBlogs', JSON.stringify(viewedBlogs));
                incrementBlogView(blog._id);
            }
            processedBlogId.current = blog._id;
        } catch (e) { console.error('Error handling blog view logic:', e); }
    }, [blog]);

    // Timed Popup Logic
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
    
    // Share Count Logic
    useEffect(() => {
        if (blog?._id && blog.shareCount !== undefined) {
            setInitialShareCount(blog._id, blog.shareCount);
        }
    }, [blog, setInitialShareCount]);

    const handleTimedPopupSuccess = useCallback(() => {
        setIsSubscribed(true);
        setShowTimedPopup(false);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const generateCanonicalUrl = () => {
        if (!blog) return '';
        const categorySlug = blog.category ? slugify(blog.category) : 'uncategorized';
        const blogSlugFromData = blog.slug || blog._id;
        return `https://www.innvibs.com/category/${categorySlug}/${blogSlugFromData}`;
    };

    if (loading) return <div className="text-center mt-20 p-4 dark:text-gray-300">Loading post...</div>;
    if (error) return <div className="text-center mt-20 p-4 text-red-500">{error}</div>;
    if (!blog) return <div className="text-center mt-20 p-4 dark:text-gray-300">Blog not found.</div>;

    const canonicalUrl = generateCanonicalUrl();

    return (
        <>
            <Helmet>
                <title>{blog.title} - Innvibs</title>
                <meta name="description" content={blog.content?.slice(0, 150)} />
                <link rel="canonical" href={canonicalUrl} />
            </Helmet>
            <BlogArticle
                blog={blog}
                isSubscribed={isSubscribed}
                setIsSubscribed={setIsSubscribed}
                showTimedPopup={showTimedPopup}
                setShowTimedPopup={setShowTimedPopup}
                onTimedPopupSuccess={handleTimedPopupSuccess}
                getShareCount={getShareCount}
                currentLang={i18n.language}
            />
        </>
    );
};

export default BlogDetail;

