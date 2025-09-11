import React, { useEffect, useState, useMemo } from 'react';
import AdminBlogTable from '../components/AdminBlogTable';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const ITEMS_PER_PAGE = 10;

const AdminBlogList = ({ onEdit }) => {
    const { t } = useTranslation();
    // State for the master list of all blogs, fetched only once.
    const [allBlogs, setAllBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

   
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);

        api.get('/api/admin/blogs?limit=500', { signal: controller.signal })
            .then(res => {
                setAllBlogs(res.data.blogs || []);
                setError('');
            })
            .catch(err => {
                if (err.name !== 'CanceledError') {
                    console.error('Initial fetch failed:', err);
                    setError('Failed to load blogs. Please refresh the page.');
                }
            })
            .finally(() => {
                setLoading(false);
            });

        return () => controller.abort();
    }, []); // Empty array ensures this runs only once.

    // This performs a fast, client-side search whenever the query changes.
    // It filters the master 'allBlogs' list. No network calls, no flickering.
    const filteredBlogs = useMemo(() => {
        if (!searchQuery) {
            return allBlogs;
        }
        return allBlogs.filter(blog =>
            blog.title_en.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, allBlogs]);

    // When the search query changes, reset to the first page.
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);


    const handleDelete = async (id) => {
        if (window.confirm(t('admin_panel.confirm_delete'))) {
            const originalBlogs = [...allBlogs];
            // Optimistic UI update: remove the blog from the master list instantly.
            setAllBlogs(currentBlogs => currentBlogs.filter(b => b._id !== id));

            try {
                await api.delete(`/api/admin/blogs/${id}`);
            } catch (err) {
                console.error('Error deleting blog:', err.response?.data || err.message);
                alert(`${t('admin_panel.delete_error_message')}: ${err.response?.data?.error || err.message}`);
                // If the delete fails, restore the original list.
                setAllBlogs(originalBlogs);
            }
        }
    };

    // --- Pagination Logic ---
    // The pagination now works on the 'filteredBlogs' list.
    const totalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentBlogs = filteredBlogs.slice(startIndex, endIndex);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    if (loading) return <div className="text-center p-10 dark:text-gray-200">{t('loading blogs')}</div>;
    if (error) return <div className="text-center p-10 text-red-500">{t('error')}: {error}</div>;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10">
            <div className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                <div className="flex justify-between items-center mb-6 flex-wrap">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 md:mb-0">
                        {t('Added Blogs List')}
                    </h1>
                </div>

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder={t('Search blogs...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <AdminBlogTable blogs={currentBlogs} onEdit={onEdit} onDelete={handleDelete} startIndex={startIndex} />
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            &lt; {t('Previous')}
                        </button>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {t('Page')} {currentPage} {t('of')} {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {t('Next')} &gt;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBlogList;

