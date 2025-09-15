import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const PendingApprovals = ({ onApprovedOrRejected }) => {
    const { t } = useTranslation();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPending = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/blogs/pending?limit=100');
            setBlogs(res.data?.blogs || []);
            setError('');
        } catch (e) {
            setError('Failed to load pending blogs');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPending(); }, [fetchPending]);

    const handleAction = async (id, action) => {
        try {
            if (action === 'approve') {
                await api.post(`/api/admin/blogs/${id}/approve`);
            } else {
                await api.post(`/api/admin/blogs/${id}/reject`);
            }
            // Update the UI optimistically and notify the dashboard to refresh the count
            setBlogs(prev => prev.filter(b => b._id !== id));
            onApprovedOrRejected && onApprovedOrRejected();
        } catch (e) {
            alert(`Failed to ${action} the blog.`);
        }
    };

    if (loading) return <div className="text-center p-6 dark:text-gray-200">Loading pending blogs...</div>;
    if (error) return <div className="text-center p-6 text-red-500">{error}</div>;

    return (
        <div className="overflow-x-auto">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200 text-center">
                {t('Blogs Pending Approval')}
            </h2>
            {blogs.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                    There are currently no blogs awaiting approval.
                </div>
            ) : (
                <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700">
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Author</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Title</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Category</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Submitted On</th>
                            <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {blogs.map(blog => (
                            <tr key={blog._id} className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {/* Safely access the populated username */}
                                    {blog.createdBy?.username || 'Unknown'}
                                </td>
                                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{blog.title_en || blog.title}</td>
                                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{blog.category}</td>
                                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(blog.createdAt || blog.date).toLocaleDateString()}</td>
                                <td className="py-4 px-4 whitespace-nowrap text-center text-sm font-medium">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => handleAction(blog._id, 'approve')} className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition-colors">Approve</button>
                                        <button onClick={() => handleAction(blog._id, 'reject')} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors">Reject</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PendingApprovals;
