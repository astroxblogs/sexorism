import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const AdminBlogTable = ({ blogs, onEdit, onDelete, onUpdateDate, startIndex = 0 }) => {
  const { t } = useTranslation();
  const [deleteId, setDeleteId] = useState(null);
  const [editingDateId, setEditingDateId] = useState(null);

  const todayString = new Date().toISOString().split('T')[0];
  const validBlogs = blogs ? blogs.filter((blog) => blog && blog._id) : [];

  const handleConfirmDelete = (id) => {
    if (onDelete) {
      onDelete(id);
    }
    setDeleteId(null);
  };

  const handleDateChange = (blogId, newDate) => {
    const selectedDate = new Date(newDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (selectedDate > today) {
      alert("Time travel isn't a feature... yet! 😉 Please select a date from today or the past.");
      setEditingDateId(null);
      return;
    }

    if (newDate && onUpdateDate) {
      onUpdateDate(blogId, newDate);
    }
    setEditingDateId(null);
  };

  const formatDateForInput = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  return (
    <>
      {/* Table view for medium and larger screens */}
      <div className="hidden md:block overflow-x-auto rounded-lg shadow mt-8">
        <table className="min-w-full bg-white dark:bg-gray-900">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200 w-16">{t('S.No.')}</th>
              <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">{t('Title')}</th>
              <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">{t('Author')}</th>
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
                <td className="p-4 text-gray-600 dark:text-gray-300">{blog.createdBy?.username || 'N/A'}</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">{blog.category}</td>
                <td className="p-4 text-gray-500 dark:text-gray-400">
                  {editingDateId === blog._id ? (
                    <input
                      type="date"
                      defaultValue={formatDateForInput(blog.date)}
                      max={todayString}
                      onBlur={(e) => handleDateChange(blog._id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleDateChange(blog._id, e.target.value);
                        }
                      }}
                      autoFocus
                      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => setEditingDateId(blog._id)}
                    >
                      <span>{new Date(blog.date).toLocaleDateString()}</span>
                      <span className="text-gray-400 hover:text-blue-500" title="Edit Date">✏️</span>
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <button
                    className="text-green-600 hover:underline mr-4"
                    onClick={() => onEdit(blog)}
                  >
                    {t('Edit')}
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => setDeleteId(blog._id)}
                  >
                    {t('Delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card view for mobile screens */}
      <div className="md:hidden mt-4 space-y-4">
        {validBlogs.map((blog, index) => (
          <div
            key={blog._id}
            className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 relative"
          >
            <span className="absolute top-2 right-2 text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center">
              {startIndex + index + 1}
            </span>
            <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-gray-100 pr-8">
              {blog.title_en || blog.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t('Author')}: <span className="font-semibold">{blog.createdBy?.username || 'N/A'}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t('Category')}: <span className="font-semibold">{blog.category}</span>
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('Date')}:{" "}
              {editingDateId === blog._id ? (
                <input
                  type="date"
                  defaultValue={formatDateForInput(blog.date)}
                  max={todayString}
                  onBlur={(e) => handleDateChange(blog._id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleDateChange(blog._id, e.target.value);
                    }
                  }}
                  autoFocus
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                />
              ) : (
                <span
                  className="font-semibold cursor-pointer"
                  onClick={() => setEditingDateId(blog._id)}
                >
                  {new Date(blog.date).toLocaleDateString()}
                  <span className="ml-2 text-gray-400 hover:text-blue-500" title="Edit Date">
                    ✏️
                  </span>
                </span>
              )}
            </div>
            <div className="flex gap-4">
              <button
                className="text-sm text-green-600 hover:underline font-medium"
                onClick={() => onEdit(blog)}
              >
                {t('Edit')}
              </button>
              <button
                className="text-sm text-red-600 hover:underline font-medium"
                onClick={() => setDeleteId(blog._id)}
              >
                {t('Delete')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
              {t('confirm delete title')}
            </h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">{t('confirm delete message')}</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700"
                onClick={() => setDeleteId(null)}
              >
                {t('Cancel')}
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white"
                onClick={() => handleConfirmDelete(deleteId)}
              >
                {t('Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Proper export
export { AdminBlogTable };