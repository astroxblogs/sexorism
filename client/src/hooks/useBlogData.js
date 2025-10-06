import { useState, useEffect } from 'react';
import api from '../services/Public-service/api';

const useBlogData = (categoryName, blogSlug, initialBlog) => {
    const [blog, setBlog] = useState(initialBlog || null);
    const [loading, setLoading] = useState(!initialBlog);
    const [error, setError] = useState(null);

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
                console.log('useBlogData: Fetching blog with:', { categoryName, blogSlug });
                const res = await api.get(`/blogs/${categoryName}/${blogSlug}`, { signal: controller.signal });
                console.log('useBlogData: API response:', res.data);

                if (res.data) {
                    setBlog(res.data);
                } else {
                    setError("Blog post not found.");
                }

            } catch (err) {
                if (err.name === 'CanceledError') return;
                console.error("Failed to fetch blog post:", err);
                setError(`Failed to load blog post: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        if (categoryName && blogSlug) {
            fetchBlog();
        }

        return () => controller.abort();
        
    }, [categoryName, blogSlug, initialBlog]);

    return { blog, loading, error };
};

export default useBlogData;