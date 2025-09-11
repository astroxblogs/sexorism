import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminBlogForm from '../components/AdminBlogForm';
import AdminBlogList from './AdminBlogList';
import api, { setAccessToken } from '../services/api';

const OperatorDashboard = () => {
    const { t } = useTranslation();
    const [editingBlog, setEditingBlog] = useState(null);
    const navigate = useNavigate();

    const handleSave = () => {
        setEditingBlog(null);
        alert('Blog saved successfully! (Pending for approval)');
    };

    const handleLogout = async () => {
        try {
            await api.post('/api/admin/logout');
            setAccessToken(null);
            navigate('/login');
        } catch (err) {
            setAccessToken(null);
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10">
            <div className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 md:mb-0">
                        {t('Operator Dashboard')}
                    </h1>
                    <div className="flex items-center gap-4 flex-wrap">
                        <button
                            onClick={() => { setEditingBlog(null); }}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                            {t('Add New Blog')}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                            {t('Logout')}
                        </button>
                    </div>
                </div>

                <div className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200 text-center">
                        {editingBlog ? `${t('Editing')}: ${editingBlog.title_en || editingBlog.title || ''}` : t('Add new blog post')}
                    </h2>
                    <AdminBlogForm
                        key={editingBlog ? editingBlog._id : 'new-blog'}
                        blog={editingBlog}
                        onSave={handleSave}
                    />
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200 text-center">
                        {t('Added Blogs List')}
                    </h2>
                    <AdminBlogList onEdit={setEditingBlog} />
                </div>
            </div>
        </div>
    );
};

export default OperatorDashboard;


