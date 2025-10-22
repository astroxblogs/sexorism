'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminBlogTable } from '../../components/AdminBlogTable';
import AdminBlogForm from '../../components/AdminBlogForm';
import { apiService } from '../../lib/api';
import { getAuthToken } from '../../utils/localStorage';
import { toast } from 'react-hot-toast';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const safeBlogs = Array.isArray(blogs) ? blogs : [];

  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  // ✅ Authentication check
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Please login to access admin blogs');
      router.push('/cms/login');
    }
  }, [router]);

  // ✅ Fetch blogs
  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getBlogs({
        params: { page: currentPage, limit: 20, sort: '-date' },
      });

      const responseData = response.data || response;
      setBlogs(responseData?.blogs || []);
      setTotalPages(responseData?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Edit logic (opens form inline)
  const handleEdit = (blog: any) => {
    setEditingBlog(blog);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = (_savedBlog: any) => {
    toast.success(editingBlog ? 'Blog updated successfully' : 'Blog added successfully');
    setEditingBlog(null);
    fetchBlogs();
  };

  const handleCancel = () => {
    setEditingBlog(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await apiService.deleteBlog(id);
        toast.success('Blog deleted successfully');
        fetchBlogs();
      } catch (error) {
        console.error('Error deleting blog:', error);
        toast.error('Failed to delete blog');
      }
    }
  };

  const handleUpdateDate = async (id: string, date: string) => {
    try {
      await apiService.updateBlogDate(id, date);
      toast.success('Blog date updated successfully');
      fetchBlogs();
    } catch (error) {
      console.error('Error updating blog date:', error);
      toast.error('Failed to update blog date');
    }
  };

  // ✅ NEW: Deactivate → moves blog to "pending" then refreshes list
  const handleDeactivate = async (id: string) => {
    try {
      await apiService.deactivateBlog(id);
      toast.success('Blog moved to Pending');
      // If this was the last item on the page and not the first page, go back a page
      if (safeBlogs.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        fetchBlogs();
      }
    } catch (error) {
      console.error('Error deactivating blog:', error);
      toast.error('Failed to deactivate blog');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Blogs</h1>
        {!editingBlog && (
          <button
            onClick={() => setEditingBlog({})}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Add New Blog
          </button>
        )}
      </div>

      {/* --- Conditional Rendering: Show Form or Table --- */}
      {editingBlog ? (
        <AdminBlogForm
          blog={editingBlog._id ? editingBlog : null}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <>
          <AdminBlogTable
            blogs={safeBlogs}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onUpdateDate={handleUpdateDate}
            onDeactivate={handleDeactivate}
            startIndex={(currentPage - 1) * 20}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
