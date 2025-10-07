'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '../../lib/api';
import { getAuthToken } from '../../utils/localStorage';
import { toast } from 'react-hot-toast';

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalSubscribers: 0, activeSubscribers: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check authentication on component mount
  useEffect(() => {
    const token = getAuthToken();
    console.log('🔐 Auth token exists:', !!token);
    console.log('👤 Current role:', sessionStorage.getItem('astrox_admin_role_session'));

    if (!token) {
      toast.error('Please login to access admin subscribers');
      router.push('/admin/login');
      return;
    }
  }, [router]);

  // Ensure subscribers is always an array
  const safeSubscribers = Array.isArray(subscribers) ? subscribers : [];

  useEffect(() => {
    fetchSubscribers();
    fetchStats();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSubscribers();
      // Handle both response formats: response.data (Axios default) and response.subscribers (server format)
      const subscribersData = response.data || (response as any).subscribers || [];
      setSubscribers(subscribersData);
      console.log('✅ Loaded subscribers:', subscribersData.length);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.getSubscriberStats();
      // Handle both response formats: response.data (Axios default) and response.stats (server format)
      const statsData = response.data || (response as any).stats || { totalSubscribers: 0, activeSubscribers: 0 };
      setStats(statsData);
      console.log('✅ Loaded subscriber stats:', statsData);
    } catch (error) {
      console.error('Error fetching subscriber stats:', error);
    }
  };

  const handleExportSubscribers = () => {
    const csvContent = [
      ['Email', 'Subscribed Date', 'Status'].join(','),
      ...safeSubscribers.map(subscriber => [
        subscriber.email,
        new Date(subscriber.subscribedAt).toLocaleDateString(),
        subscriber.isActive ? 'Active' : 'Inactive'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscribers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Subscribers exported successfully');
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Subscriber Management</h1>
          <button
            onClick={handleExportSubscribers}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Export CSV
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Subscribers</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.totalSubscribers}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Active Subscribers</h3>
            <p className="text-2xl font-bold text-green-600">{stats.activeSubscribers}</p>
          </div>
        </div>

        {/* Subscribers List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold">All Subscribers</h3>
          </div>
          <div className="p-4">
            {safeSubscribers.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No subscribers found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">Email</th>
                      <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">Subscribed Date</th>
                      <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">Status</th>
                      <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeSubscribers.map((subscriber) => (
                      <tr key={subscriber._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="p-4 text-gray-900 dark:text-white">{subscriber.email}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">
                          {new Date(subscriber.subscribedAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            subscriber.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {subscriber.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">
                          {subscriber.source || 'Website'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}