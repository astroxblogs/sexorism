// client/src/pages/TagPage.js
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

// Lazy load BlogList as it's a heavier component
const BlogList = lazy(() => import('../components/BlogFiles/BlogList'));


const TagPage = () => {
    const { tagName } = useParams(); // Get the tag from the URL parameter
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBlogs, setTotalBlogs] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams(); // For pagination URL updates
    const { t } = useTranslation();

    const blogsPerPage = 10; // Consistent with Home.js pagination

    useEffect(() => {
        const fetchBlogsByTag = async () => {
            setLoading(true);
            setError(null);
            try {
                // Decode the tagName from URL format (hyphens) back to original format (spaces)
                const decodedTagName = tagName.replace(/-/g, ' ');
                const res = await api.get(`/api/blogs?tag=${encodeURIComponent(decodedTagName)}&page=${currentPage}&limit=${blogsPerPage}`);
                setBlogs(res.data.blogs);
                setCurrentPage(res.data.currentPage);
                setTotalPages(res.data.totalPages);
                setTotalBlogs(res.data.totalBlogs);
            } catch (err) {
                console.error(`Error fetching blogs for tag "${tagName}":`, err);
                setError(t('error loading blogs for tag', { tag: tagName }));
            } finally {
                setLoading(false);
            }
        };

        const urlPage = parseInt(searchParams.get('page')) || 1;

        // Always update currentPage from URL, and let it trigger re-fetch
        if (urlPage !== currentPage) {
            setCurrentPage(urlPage);
            return; // skip fetch this time, it will re-run after page state updates
        }

        fetchBlogsByTag();
    }, [tagName, currentPage, searchParams, t]);


    // Handle pagination button click
    const handleLoadMore = () => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        setSearchParams({ page: nextPage }); // Update URL search params for persistence
    };

    // Use a dynamic title for the page
    useEffect(() => {
        document.title = t('page_titles.tag_page', { tag: tagName }); // Use translation for page title
    }, [tagName, t]);

    if (loading && blogs.length === 0) { // Only show full loading if no blogs are loaded yet
        return <div className="text-center py-20 text-lg dark:text-gray-300">{t('loading blogs')}</div>;
    }

    if (error) {
        return <div className="text-center py-20 text-red-500 text-lg">{error}</div>;
    }

    // Decode the tagName from URL format (hyphens) back to display format (spaces)
    const displayTag = tagName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word

    return (
        <Suspense fallback={<div className="text-center py-20 text-lg dark:text-gray-300">{t('loading components')}</div>}>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-8 text-gray-900 dark:text-white">
                    {t('tag_page.blogs_for_tag', { tag: displayTag })} {/* Use translation */}
                </h1>

                {blogs.length === 0 && !loading && (
                    <p className="text-center text-lg text-gray-600 dark:text-gray-300">{t('tag_page.no_blogs_found_for_tag', { tag: displayTag })}</p>
                )}

                <BlogList
                    blogs={blogs}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalBlogs={totalBlogs}
                    onLoadMore={handleLoadMore}
                    isLoading={loading} // Pass loading state to BlogList
                />
            </div>
             
        </Suspense>
    );
};

export default TagPage;