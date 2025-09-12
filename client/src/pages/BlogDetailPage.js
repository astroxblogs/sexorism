import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BlogDetail from '../components/BlogDetail';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const BlogDetailPage = () => {
    const { slug } = useParams();
    const { t } = useTranslation();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!slug) {
            setLoading(false);
            setError(t('blog slug missing'));
            setBlog(null);
            console.warn('BlogDetailPage: Blog slug is missing from URL.');
            return;
        }

        const controller = new AbortController();

        const fetchBlog = async () => {
            setLoading(true);
            setError(null);

            try {
                console.log(`Fetching blog by slug: ${slug}`);
                let res = await axios.get(`/api/blogs/slug/${slug}`, { signal: controller.signal });

                if (!res.data) {
                    // fallback: try fetching by ID
                    console.log(`Slug not found, trying by ID: ${slug}`);
                    res = await axios.get(`/api/blogs/${slug}`, { signal: controller.signal });
                }

                if (res.data) {
                    setBlog(res.data);
                    console.log('Blog fetched:', res.data);
                } else {
                    setBlog(null);
                    setError(t('Blog post not found'));
                    console.warn('Blog not found for slug or ID:', slug);
                }

            } catch (err) {
                if (axios.isCancel(err)) {
                    console.log('Request canceled:', err.message);
                    return;
                }
                console.error('Error fetching blog:', err.response?.data || err.message);
                setBlog(null);
                setError(t('Error loading blogs detail', { error: err.response?.data?.error || err.message }));
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();

        return () => controller.abort();
    }, [slug, t]);

    if (loading) return <div className="text-center mt-20 p-4 dark:text-gray-300">{t('loading post...')}</div>;
    if (error) return <div className="text-center mt-20 p-4 text-red-500">{error}</div>;
    if (!blog) return <div className="text-center mt-20 p-4 dark:text-gray-300">{t('Blog post not found')}</div>;

    console.log('Rendering BlogDetail component:', blog);
    return <BlogDetail blog={blog} />;
};

export default BlogDetailPage;
