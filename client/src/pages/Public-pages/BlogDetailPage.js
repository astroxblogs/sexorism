'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import BlogDetail from '../../components/Public-components/BlogFiles/BlogDetail';
import useBlogData from '../../hooks/useBlogData';

const BlogDetailPage = () => {
    const params = useParams();
    const categoryName = params?.categoryName;
    const blogSlug = params?.blogSlug;

    // Use the hook to fetch blog data based on URL params
    const { blog, loading, error } = useBlogData(categoryName, blogSlug);

    if (loading) {
        return <div className="text-center py-20 dark:text-gray-200">Loading blog...</div>;
    }

    if (error) {
        return <div className="text-center py-20 text-red-500">{error}</div>;
    }

    return <BlogDetail blog={blog} />;
};

export default BlogDetailPage;