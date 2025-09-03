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
       
        const controller = new AbortController();
       

        const fetchBlog = async () => {
            setLoading(true);
            setError(null);
            try {
                
                console.log(`DEBUG (BlogDetailPage): Attempting to fetch blog with slug: /api/blogs/slug/${slug}`);
                const res = await axios.get(`/api/blogs/slug/${slug}`, {
                    
                    signal: controller.signal
                  
                });
                console.log('DEBUG (BlogDetailPage): API Response received:', res.data);

                if (res.data) {
                    setBlog(res.data);
                    console.log('DEBUG (BlogDetailPage): Blog state updated to:', res.data);

                    if (res.data._id) {
                        axios.patch(`/api/blogs/${res.data._id}/views`)
                            .catch(err => console.error("Non-critical error: Failed to increment view count.", err));
                    }
                } else {
                    console.warn('DEBUG (BlogDetailPage): API response data is empty or null for slug:', slug);
                    setError(t('Blog post not found'));
                    setBlog(null);
                }

            } catch (err) {
                console.error("DEBUG (BlogDetailPage): Error fetching blog by slug:", err.response?.data || err.message);
                if (axios.isCancel(err)) {
                    console.log("Request canceled:", err.message);
                    return;
                }
           

              
                if (err.response?.status === 404) {
                    try {
                        console.log(`DEBUG (BlogDetailPage): Slug not found, trying ID: /api/blogs/${slug}`);
                        const res = await axios.get(`/api/blogs/${slug}`, {
                         
                           signal: controller.signal
                         
                        });
                        if (res.data) {
                            setBlog(res.data);
                            console.log('DEBUG (BlogDetailPage): Blog found by ID:', res.data);

                         
                            if (res.data._id) {
                                axios.patch(`/api/blogs/${res.data._id}/views`)
                                    .catch(err => console.error("Non-critical error: Failed to increment view count.", err));
                            }

                        } else {
                            setError(t('Blog post not found'));
                            setBlog(null);
                        }
                    } catch (idErr) {
                       
                        if (axios.isCancel(idErr)) {
                            console.log("Request canceled:", idErr.message);
                            return;
                        }
                        
                        console.error("DEBUG (BlogDetailPage): Error fetching blog by ID:", idErr.response?.data || idErr.message);
                        setError(t('Error loading blogs detail', { error: idErr.response?.data?.error || idErr.message }));
                        setBlog(null);
                    }
                } else {
                    console.error("DEBUG (BlogDetailPage): Error fetching blog post:", err.response?.data || err.message, err);
                    setError(t('Error loading blogs detail', { error: err.response?.data?.error || err.message }));
                    setBlog(null);
                }
            } finally {
                setLoading(false);
                console.log('DEBUG (BlogDetailPage): Loading state set to false.');
            }
        };

        if (slug) {
            fetchBlog();
        } else {
            setLoading(false);
            setError(t('blog slug missing'));
            setBlog(null);
            console.log('DEBUG (BlogDetailPage): Blog slug is missing from URL.');
        }

     
        return () => {
            controller.abort();
        };
         
    }, [slug, t]);

    
    useEffect(() => {
        console.log('DEBUG (BlogDetailPage): Current blog state after render cycle:', blog);
    }, [blog]);


    if (loading) return <div className="text-center mt-20 p-4 dark:text-gray-300">{t('loading post...')}</div>;
    if (error) return <div className="text-center mt-20 p-4 text-red-500">{error}</div>;

    
    if (!blog) return <div className="text-center mt-20 p-4 dark:text-gray-300">{t('Blog post not found')}</div>;

    console.log('DEBUG (BlogDetailPage): Rendering BlogDetail component with blog data:', blog); // NEW LOG
    return <BlogDetail blog={blog} />;
};

export default BlogDetailPage;