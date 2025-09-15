import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const AdminBlogTable = ({ blogs, onEdit, onDelete, startIndex = 0 }) => {
    const { t } = useTranslation();
    const [deleteId, setDeleteId] = useState(null);

    const validBlogs = blogs ? blogs.filter(blog => blog) : [];

    const handleConfirmDelete = (id) => {
        onDelete(id);
        setDeleteId(null);
    };

    return (
        <>
            {/* The table view for medium and larger screens */}
            <div className="hidden md:block overflow-x-auto rounded-lg shadow mt-8">
                <table className="min-w-full bg-white dark:bg-gray-900">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200 w-16">{t('S.No.')}</th>
                            <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">{t('Title')}</th>
                            <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">{t('Author')}</th> {/* ✅ ADDED Author Header */}
                            <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">{t('Category')}</th>
                            <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">{t('Date')}</th>
                            <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">{t('Actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {validBlogs.map((blog, index) => (
                            <tr key={blog._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{startIndex + index + 1}</td>
                                <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{blog.title_en || blog.title}</td>
                                
                                {/* ✅ ADDED Author Cell. Optional chaining (?.) prevents errors if author is missing. */}
                                <td className="p-4 text-gray-600 dark:text-gray-300">{blog.createdBy?.username || 'N/A'}</td>
                                
                                <td className="p-4 text-gray-600 dark:text-gray-300">{blog.category}</td>
                                <td className="p-4 text-gray-500 dark:text-gray-400">{new Date(blog.date).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <button className="text-green-600 hover:underline mr-4" onClick={() => onEdit(blog)}>{t('Edit')}</button>
                                    <button className="text-red-600 hover:underline" onClick={() => setDeleteId(blog._id)}>{t('Delete')}</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* The card view for mobile screens */}
            <div className="md:hidden mt-4 space-y-4">
                {validBlogs.map((blog, index) => (
                    <div key={blog._id} className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 relative">
                        <span className="absolute top-2 right-2 text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center">
                            {startIndex + index + 1}
                        </span>
                        <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-gray-100 pr-8">{blog.title_en || blog.title}</h3>
                        
                        {/* ✅ ADDED Author info for mobile view */}
                        <p className="text-sm text-gray-600 dark:text-gray-300">{t('Author')}: <span className="font-semibold">{blog.createdBy?.username || 'N/A'}</span></p>

                        <p className="text-sm text-gray-600 dark:text-gray-300">{t('Category')}: <span className="font-semibold">{blog.category}</span></p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('Date')}: <span className="font-semibold">{new Date(blog.date).toLocaleDateString()}</span></p>
                        <div className="flex gap-4">
                            <button className="text-sm text-green-600 hover:underline font-medium" onClick={() => onEdit(blog)}>{t('Edit')}</button>
                            <button className="text-sm text-red-600 hover:underline font-medium" onClick={() => setDeleteId(blog._id)}>{t('Delete')}</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Delete Confirmation Modal (No changes needed here) */}
            {deleteId && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-lg max-w-sm w-full">
                        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">{t('confirm delete title')}</h2>
                        <p className="mb-6 text-gray-700 dark:text-gray-300">{t('confirm delete message')}</p>
                        <div className="flex justify-end gap-4">
                            <button className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700" onClick={() => setDeleteId(null)}>{t('Cancel')}</button>
                            <button className="px-4 py-2 rounded bg-red-600 text-white" onClick={() => handleConfirmDelete(deleteId)}>{t('Delete')}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminBlogTable;