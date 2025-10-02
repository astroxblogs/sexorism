import React from 'react';
// Make sure this path is correct based on your file structure
import BlogDetail from '../../components/Public-components/BlogFiles/BlogDetail';

const BlogDetailPage = () => {
    // This page component's only job is to render the BlogDetail container.
    // BlogDetail will now handle everything else itself.
    return <BlogDetail />;
};

export default BlogDetailPage;