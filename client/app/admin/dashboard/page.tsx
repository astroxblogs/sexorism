'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminBlogTable } from '../../components/AdminBlogTable';
import { apiService } from '../../lib/api';
import { getAuthToken } from '../../utils/localStorage';
import { toast } from 'react-hot-toast';

export default function AdminDashboardPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalBlogs: 0, pendingBlogs: 0 });
  const router = useRouter();

  // Check authentication on component mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Please login to access admin dashboard');
      router.push('/admin/login');
      return;
    }
  }, [router]);

  // Ensure blogs is always an array
  const safeBlogs = Array.isArray(blogs) ? blogs : [];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch recent blogs for the dashboard
      const blogsResponse = await apiService.getBlogs({ params: { limit: 10, sort: '-date' } });
      setBlogs(blogsResponse.data?.blogs || []);

      // You can add more stats here if needed
      setStats({
        totalBlogs: blogsResponse.data?.totalCount || 0,
        pendingBlogs: 0 // You can fetch this separately if needed
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
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
        fetchDashboardData(); // Refresh the list
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
      fetchDashboardData(); // Refresh the list
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Blogs</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.totalBlogs}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Pending Approvals</h3>
            <p className="text-2xl font-bold text-orange-600">{stats.pendingBlogs}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Recent Blogs</h3>
            <p className="text-2xl font-bold text-green-600">{blogs.length}</p>
          </div>
        </div>
      </div>

      <AdminBlogTable
        blogs={safeBlogs}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUpdateDate={handleUpdateDate}
        startIndex={0}
      />
    </div>
  );
}