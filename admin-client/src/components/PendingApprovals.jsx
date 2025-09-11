import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

const PendingApprovals = ({ onApprovedOrRejected }) => {
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

    const approve = async (id) => {
        try {
            await api.post(`/api/admin/blogs/${id}/approve`);
            setBlogs(prev => prev.filter(b => b._id !== id));
            onApprovedOrRejected && onApprovedOrRejected();
        } catch (e) {
            alert('Failed to approve');
        }
    };

    const reject = async (id) => {
        try {
            await api.post(`/api/admin/blogs/${id}/reject`);
            setBlogs(prev => prev.filter(b => b._id !== id));
            onApprovedOrRejected && onApprovedOrRejected();
        } catch (e) {
            alert('Failed to reject');
        }
    };

    if (loading) return <div className="text-center p-6">Loading...</div>;
    if (error) return <div className="text-center p-6 text-red-500">{error}</div>;

    return (
        <div className="space-y-4">
            {blogs.length === 0 && <div className="text-center text-gray-500">No pending blogs</div>}
            {blogs.map(blog => (
                <div key={blog._id} className="p-4 bg-white dark:bg-gray-800 rounded shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{blog.title_en || blog.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{blog.category} • {new Date(blog.createdAt || blog.date).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => approve(blog._id)} className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700">Approve</button>
                            <button onClick={() => reject(blog._id)} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Reject</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PendingApprovals;


