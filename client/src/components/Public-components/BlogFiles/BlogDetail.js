import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../SEO' // Make sure this path is correct

import { useBlogs } from '../../../context/BlogContext';
import { useShare } from '../../../context/ShareContext';
import api from '../../../services/Public-service/api';
import { hasSubscriberId } from '../../../utils/Public-utils/localStorage';
import { incrementBlogView } from '../../../services/Public-service/api';
import BlogArticle from './BlogArticle';

const slugify = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-&]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
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
            setError(null);
            setBlog(null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blogSlug, categoryName]);

    // ... (All other useEffect hooks remain the same) ...
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

    const stripHtml = (html) => {
        if (!html) return "";
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    }

    // --- Loading and Error states ---
    // These must come BEFORE any code that tries to use the 'blog' object.
    if (loading) return <div className="text-center mt-20 p-4 dark:text-gray-300">Loading post...</div>;
    if (error) return <div className="text-center mt-20 p-4 text-red-500">{error}</div>;
    if (!blog) return <div className="text-center mt-20 p-4 dark:text-gray-300">Blog not found.</div>;

    // ✅ FIX: All logic that depends on the 'blog' object has been moved to AFTER the loading and error checks.
    // This ensures 'blog' is not null when this code runs.
    
    const getLocalizedField = (field) => {
        const lang = i18n.language;
        return blog[`${field}_${lang}`] || blog[`${field}_en`] || blog[field] || "";
    };

    const metaDescription = getLocalizedField('metaDescription') || stripHtml(getLocalizedField('content')).substring(0, 160);
    const categoryNameCurrentLang = blog.category ? (i18n.language === 'hi' ? blog.category.name_hi : blog.category.name_en) : 'Uncategorized';
    
    const blogPostingSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://www.innvibs.com/category/${categoryName}/${blogSlug}`
        },
        "headline": getLocalizedField('title'),
        "description": metaDescription,
        "image": blog.image,
        "author": { "@type": "Person", "name": blog.author || "Innvibs Team" },
        "publisher": {
            "@type": "Organization",
            "name": "Innvibs",
            "logo": { "@type": "ImageObject", "url": "https://www.innvibs.com/logo512.png" }
        },
        "datePublished": blog.createdAt,
        "dateModified": blog.updatedAt || blog.createdAt
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.innvibs.com"
        }, {
            "@type": "ListItem",
            "position": 2,
            "name": categoryNameCurrentLang,
            "item": `https://www.innvibs.com/category/${slugify(categoryName)}`
        }, {
            "@type": "ListItem",
            "position": 3,
            "name": getLocalizedField('title'),
            "item": `https://www.innvibs.com/category/${categoryName}/${blogSlug}`
        }]
    };
    
    return (
        <>
            <SEO
                title={`${getLocalizedField('title')} - Innvibs`}
                description={metaDescription}
                canonicalUrl={`/category/${categoryName}/${blogSlug}`}
                schema={[blogPostingSchema, breadcrumbSchema]}
            />

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