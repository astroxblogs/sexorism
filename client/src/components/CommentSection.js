import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';

// ✅ STEP 1: Clean up imports to use our new API function
import { addComment } from '../services/api'; 
import api from '../services/api'; // Keep for the delete functionality

// ✅ STEP 2: Accept `visitorId` as a prop
const CommentSection = ({ blogId, initialComments, visitorId }) => {
    const { t } = useTranslation();
    const [comments, setComments] = useState(initialComments || []);
    const [name, setName] = useState('');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const adminToken = localStorage.getItem('adminToken');

    // Sync state if initial comments from parent change
    useEffect(() => {
        setComments(initialComments || []);
    }, [initialComments]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !comment.trim()) {
            setError('Name and comment cannot be empty.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            // ✅ STEP 3: Create a data object with all required fields
            const commentData = {
                visitorId,
                name,
                comment,
            };

            // Call our new, specific API function
            const res = await addComment(blogId, commentData);

            setComments([...comments, res.comment]);
            setName('');
            setComment('');

            // ✅ STEP 4: The old subscriber-only tracking logic is now removed.

        } catch (err) {
            console.error("Error posting comment:", err);
            setError('Failed to post comment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm(t("Are you sure you want to delete this comment?"))) {
            return;
        }

        try {
            await api.delete(`/api/blogs/${blogId}/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            setComments(comments.filter(c => c._id !== commentId));
        } catch (err) {
            console.error("Error deleting comment:", err);
            alert(t("Failed to delete comment."));
        }
    };

    return (
        <section id="comments" className="mt-10 pt-6 border-t dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-4">{t('comment')} ({comments.length})</h3>

            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 mb-8">
                <input
                    className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('name')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('Comment here')}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                />
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition-colors disabled:bg-blue-400"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : t('submit')}
                </button>
            </form>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="space-y-4">
                {comments.map((c) => (
                    <div key={c._id} className="rounded-lg bg-gray-100 dark:bg-gray-800 p-4 flex justify-between items-start">
                        <div>
                            <p className="font-bold text-gray-800 dark:text-gray-200 mb-1">{c.name}</p>
                            <p className="text-gray-700 dark:text-gray-300 mb-2">{c.comment}</p>
                            <p className="text-xs text-gray-500">{new Date(c.timestamp).toLocaleString()}</p>
                        </div>
                        {adminToken && (
                            <button
                                onClick={() => handleDelete(c._id)}
                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                                aria-label="Delete comment"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CommentSection;