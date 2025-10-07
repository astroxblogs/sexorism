'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '../lib/api';
import { getAuthToken } from '../utils/localStorage';
import { toast } from 'react-hot-toast';

export default function SubscriberManagementComponent() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [stats, setStats] = useState<{ totalSubscribers: number; activeSubscribers: number }>({
    totalSubscribers: 0,
    activeSubscribers: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // auth guard
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Please login to access admin subscribers');
      router.push('/cms/login');
      return;
    }
  }, [router]);

  useEffect(() => {
  fetchAll();
}, []);

const fetchAll = async () => {
  try {
    setLoading(true);

    // --- list ---
    const listResp = await apiService.getSubscribers();
    const listData = listResp?.data || listResp;
    const items = listData?.subscribers || listData?.data || [];
    const safe = Array.isArray(items) ? items : [];
    setSubscribers(safe);

    // derive stats from the list as a reliable fallback
    const derivedTotal = safe.length;
    const derivedActive = safe.filter(
      (s: any) => s?.isActive === true || String(s?.status).toLowerCase() === 'active'
    ).length;

    // --- stats (server) ---
    let totalFromServer: number | undefined;
    let activeFromServer: number | undefined;

    try {
      const statsResp = await apiService.getSubscriberStats();
      const raw = statsResp?.data || statsResp;

      // Accept multiple shapes:
      // { totalSubscribers, activeSubscribers }
      // { stats: { totalSubscribers, activeSubscribers } }
      // { data: { totalSubscribers, activeSubscribers } }
      const obj =
        raw?.stats ?? raw?.data ?? raw;

      if (obj) {
        const t = obj.totalSubscribers ?? obj.total ?? obj.count;
        const a = obj.activeSubscribers ?? obj.active ?? obj.activeCount;

        if (t !== undefined) totalFromServer = Number(t);
        if (a !== undefined) activeFromServer = Number(a);
      }
    } catch (e) {
      // ignore stats endpoint errors; we'll use derived values
      console.warn('Stats endpoint not available, using derived stats.');
    }

    setStats({
      totalSubscribers:
        typeof totalFromServer === 'number' && !Number.isNaN(totalFromServer)
          ? totalFromServer
          : derivedTotal,
      activeSubscribers:
        typeof activeFromServer === 'number' && !Number.isNaN(activeFromServer)
          ? activeFromServer
          : derivedActive,
    });
  } catch (err) {
    console.error('Error loading subscribers/stats:', err);
    toast.error('Failed to load subscribers');
    setSubscribers([]);
    setStats({ totalSubscribers: 0, activeSubscribers: 0 });
  } finally {
    setLoading(false);
  }
};


  const handleExportSubscribers = () => {
    const safe = Array.isArray(subscribers) ? subscribers : [];
    const csvContent = [
      ['Email', 'Subscribed Date', 'Status', 'Source'].join(','),
      ...safe.map((s) =>
        [
          s.email,
          s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString() : '',
          s.isActive ? 'Active' : 'Inactive',
          s.source || 'Website',
        ].join(',')
      ),
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
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const safeSubscribers = Array.isArray(subscribers) ? subscribers : [];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Subscriber Management</h2>
        <button
          onClick={handleExportSubscribers}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Export CSV
        </button>
      </div>

      {/* Stats */}
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

      {/* List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">All Subscribers</h3>
        </div>
        <div className="p-4">
          {safeSubscribers.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No subscribers found.</p>
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
                  {safeSubscribers.map((s) => (
                    <tr
                      key={s._id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="p-4 text-gray-900 dark:text-white">{s.email}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">
                        {s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString() : ''}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            s.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">{s.source || 'Website'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
