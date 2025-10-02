import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminBlogTable from '../../components/Admin-components/AdminBlogTable';
 
import { apiService } from '../../services/Admin-service/api'; 
 
import { useTranslation } from 'react-i18next';

const ITEMS_PER_PAGE = 10;

const AdminBlogList = ({ onEdit }) => {
    const { t } = useTranslation();
    const [allBlogs, setAllBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [userRole, setUserRole] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        let role = '';
        try {
            role = sessionStorage.getItem('astrox_admin_role_session');
            if (role) {
                setUserRole(role);
            }
        } catch (e) {
            console.error('Could not retrieve user role from session storage:', e);
        }

        if (role === 'operator') {
            navigate('/admin-dashboard');
            return;
        }

        const controller = new AbortController();
        setLoading(true);
        
        // Using the new apiService to fetch blogs
        apiService.getBlogs({ params: { limit: 500 }, signal: controller.signal })
            .then(res => {
                // Initial sort to ensure blogs are always in the correct order
                const sortedBlogs = res.data.blogs.sort((a, b) => new Date(b.date) - new Date(a.date));
                setAllBlogs(sortedBlogs || []);
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
    }, [navigate]);

    const filteredBlogs = useMemo(() => {
        if (!searchQuery) {
            return allBlogs;
        }
        return allBlogs.filter(blog =>
            (blog.title_en || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (blog.createdBy?.username || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, allBlogs]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handleDelete = async (id) => {
        if (userRole !== 'admin') {
            alert('You do not have permission to delete blogs.');
            return;
        }

        // No confirmation needed here as the table component has a modal
        const originalBlogs = [...allBlogs];
        setAllBlogs(currentBlogs => currentBlogs.filter(b => b._id !== id));
        try {
            // Using the new apiService to delete blogs
            await apiService.deleteBlog(id);
        } catch (err) {
            console.error('Error deleting blog:', err.response?.data || err.message);
            alert(`${t('admin_panel.delete_error_message')}: ${err.response?.data?.error || err.message}`);
            setAllBlogs(originalBlogs);
        }
    };

    // ==========================================================
    // ============== ADDED FUNCTIONALITY START =================
    // ==========================================================
    const handleUpdateDate = async (blogId, newDate) => {
        try {
            const response = await apiService.updateBlogDate(blogId, newDate);
            const updatedBlog = response.data.blog;

            setAllBlogs(currentBlogs => {
                // Create a new list with the updated blog replacing the old one
                const updatedList = currentBlogs.map(blog =>
                    blog._id === blogId ? updatedBlog : blog
                );
                // IMPORTANT: Re-sort the entire list by date to move the updated item
                updatedList.sort((a, b) => new Date(b.date) - new Date(a.date));
                return updatedList;
            });

        } catch (err) {
            console.error('Error updating blog date:', err.response?.data || err.message);
            alert(`Failed to update date: ${err.response?.data?.error || err.message}`);
            // Note: No need to revert state, as the UI edit would have already closed.
        }
    };
    // ==========================================================
    // =============== ADDED FUNCTIONALITY END ==================
    // ==========================================================

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

    if (userRole && userRole !== 'admin') {
        return <div className="text-center p-10 dark:text-gray-200">Redirecting...</div>;
    }

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
                        placeholder={t('Search by title or author...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <AdminBlogTable
                        blogs={currentBlogs}
                        onEdit={onEdit}
                        onDelete={userRole === 'admin' ? handleDelete : null}
                        // ==========================================================
                        // ============== ADDED FUNCTIONALITY START =================
                        // ==========================================================
                        onUpdateDate={handleUpdateDate} // Pass the handler function as a prop
                        // ==========================================================
                        // =============== ADDED FUNCTIONALITY END ==================
                        // ==========================================================
                        startIndex={startIndex}
                    />
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                        <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            &lt; {t('Previous')}
                        </button>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {t('Page')} {currentPage} {t('of')} {totalPages}
                        </span>
                        <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {t('Next')} &gt;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBlogList;