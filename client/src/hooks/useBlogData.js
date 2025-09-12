import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const useBlogData = (slug, initialBlog) => {
    const [blog, setBlog] = useState(initialBlog || null);
    const [loading, setLoading] = useState(!initialBlog);
    const [error, setError] = useState(null);
    const viewIncrementedRef = useRef(false);

    useEffect(() => {
        if (initialBlog) {
            setBlog(initialBlog);
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        const fetchBlog = async () => {
            setLoading(true);
            setError(null);
            try {
                // First, try fetching by slug
                let res = await axios.get(`/api/blogs/slug/${slug}`, { signal: controller.signal });

                // If no data, fallback to trying by ID
                if (!res.data) {
                    console.warn(`Blog not found by slug "${slug}", trying fallback by ID.`);
                    res = await axios.get(`/api/blogs/${slug}`, { signal: controller.signal });
                }

                if (res.data) {
                    setBlog(res.data);
                } else {
                    setError("Blog post not found.");
                }

            } catch (err) {
                if (axios.isCancel(err)) return;
                console.error("Failed to fetch blog post:", err);
                setError("Failed to load blog post. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchBlog();
        }

        return () => controller.abort();
    }, [slug, initialBlog]);

    // The view count logic remains the same, no changes needed here
    useEffect(() => {
        if (!blog?._id || viewIncrementedRef.current) return;
        const viewedKey = `viewed_blog_${blog._id}`;
        const now = Date.now();
        const TTL = 12 * 60 * 60 * 1000;
        const viewedData = localStorage.getItem(viewedKey);
        if (viewedData) {
            try {
                const parsed = JSON.parse(viewedData);
                if (parsed.expiry && now < parsed.expiry) {
                    viewIncrementedRef.current = true;
                    return;
                }
            } catch (e) { console.error("Failed to parse viewedData", e); }
        }
        viewIncrementedRef.current = true;
        axios.patch(`/api/blogs/${blog._id}/views`)
            .then(res => {
                if (res.data?.views !== undefined) {
                    setBlog(prev => prev ? { ...prev, views: res.data.views } : null);
                }
                localStorage.setItem(viewedKey, JSON.stringify({ expiry: now + TTL }));
            })
            .catch(err => {
                console.error("Failed to increment views:", err);
                viewIncrementedRef.current = false;
            });
    }, [blog?._id]);

    return { blog, loading, error };
};

export default useBlogData;