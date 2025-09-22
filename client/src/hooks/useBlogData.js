import { useState, useEffect, useRef } from 'react';
// ✅ The service file should be imported from the correct relative path
import api from '../services/api'; 

// ✅ The hook now accepts categoryName and blogSlug
const useBlogData = (categoryName, blogSlug, initialBlog) => {
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
                // ✅ This is the critical change: building the new API URL
                const res = await api.get(`/api/blogs/${categoryName}/${blogSlug}`, { signal: controller.signal });

                if (res.data) {
                    setBlog(res.data);
                } else {
                    setError("Blog post not found.");
                }

            } catch (err) {
                 if (err.name === 'CanceledError') return;
                console.error("Failed to fetch blog post:", err);
                setError("Failed to load blog post. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        // ✅ Check for both categoryName and blogSlug before fetching
        if (categoryName && blogSlug) {
            fetchBlog();
        }

        return () => controller.abort();
        
    // ✅ Update dependencies for the useEffect hook
    }, [categoryName, blogSlug, initialBlog]);

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
        api.patch(`/api/blogs/${blog._id}/views`)
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