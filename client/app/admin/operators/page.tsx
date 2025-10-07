'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '../../lib/api';
import { getAuthToken } from '../../utils/localStorage';
import { toast } from 'react-hot-toast';

export default function AdminOperatorsPage() {
  const [operators, setOperators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const router = useRouter();

  // Check authentication on component mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Please login to access admin operators');
      router.push('/admin/login');
      return;
    }
  }, [router]);

  // Ensure operators is always an array
  const safeOperators = Array.isArray(operators) ? operators : [];

  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOperators();
      // Handle both response formats: response.data (Axios default) and response.operators (server format)
      const responseData = response.data || (response as any).operators || [];
      setOperators(responseData);
      console.log('✅ Loaded operators:', responseData.length);
    } catch (error) {
      console.error('Error fetching operators:', error);
      toast.error('Failed to load operators');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOperator = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await apiService.createOperator({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      toast.success('Operator created successfully');
      setFormData({ username: '', email: '', password: '', confirmPassword: '' });
      setShowCreateForm(false);
      fetchOperators();
    } catch (error) {
      console.error('Error creating operator:', error);
      toast.error('Failed to create operator');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await apiService.toggleOperatorStatus(id);
      toast.success('Operator status updated');
      fetchOperators();
    } catch (error) {
      console.error('Error updating operator status:', error);
      toast.error('Failed to update operator status');
    }
  };

  const handleDeleteOperator = async (id) => {
    if (window.confirm('Are you sure you want to delete this operator?')) {
      try {
        await apiService.deleteOperator(id);
        toast.success('Operator deleted successfully');
        fetchOperators();
      } catch (error) {
        console.error('Error deleting operator:', error);
        toast.error('Failed to delete operator');
      }
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Operator Management</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            {showCreateForm ? 'Cancel' : 'Add New Operator'}
          </button>
        </div>

        {/* Create Operator Form */}
        {showCreateForm && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">Create New Operator</h2>
            <form onSubmit={handleCreateOperator} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium"
                >
                  Create Operator
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Operators List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold">All Operators</h3>
          </div>
          <div className="p-4">
            {safeOperators.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No operators found. Create your first operator above.
              </p>
            ) : (
              <div className="space-y-4">
                {safeOperators.map((operator) => (
                  <div
                    key={operator._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {operator.username}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            operator.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {operator.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {operator.email}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Created: {new Date(operator.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleStatus(operator._id)}
                          className={`px-3 py-1 text-sm rounded-md font-medium ${
                            operator.isActive
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {operator.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteOperator(operator._id)}
                          className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}