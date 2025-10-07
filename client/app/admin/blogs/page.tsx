'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminBlogTable } from '../../components/AdminBlogTable';
import { apiService } from '../../lib/api';
import { getAuthToken } from '../../utils/localStorage';
import { toast } from 'react-hot-toast';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  // Check authentication on component mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Please login to access admin blogs');
      router.push('/admin/login');
      return;
    }
  }, [router]);

  // Ensure blogs is always an array
  const safeBlogs = Array.isArray(blogs) ? blogs : [];

  useEffect(() => {
    fetchBlogs();
  }, [currentPage]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getBlogs({
        params: {
          page: currentPage,
          limit: 20,
          sort: '-date'
        }
      });

      // Handle both response formats: response.data (Axios default) and direct response (server format)
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

  const handleEdit = (blog) => {
    router.push(`/admin/blogs/edit/${blog._id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await apiService.deleteBlog(id);
        toast.success('Blog deleted successfully');
        fetchBlogs(); // Refresh the list
      } catch (error) {
        console.error('Error deleting blog:', error);
        toast.error('Failed to delete blog');
      }
    }
  };

  const handleUpdateDate = async (id, date) => {
    try {
      await apiService.updateBlogDate(id, date);
      toast.success('Blog date updated successfully');
      fetchBlogs(); // Refresh the list
    } catch (error) {
      console.error('Error updating blog date:', error);
      toast.error('Failed to update blog date');
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
        <button
          onClick={() => router.push('/admin/blogs/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Add New Blog
        </button>
      </div>

      <AdminBlogTable
        blogs={safeBlogs}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUpdateDate={handleUpdateDate}
        startIndex={(currentPage - 1) * 20}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>

            <span className="px-3 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}