import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api'; // Correctly import the apiService

// Ensure the component name matches what AdminDashboard expects to import
const AdminSetting = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newUsername: '',
        newPassword: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setError('');

        // Basic validation
        if (!formData.currentPassword) {
            setError('Current password is required to make any changes.');
            setIsLoading(false);
            return;
        }
        if (!formData.newUsername && !formData.newPassword) {
            setError('You must provide either a new username or a new password.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await apiService.updateAdminCredentials(formData);
            setMessage(response.data.message || 'Credentials updated successfully!');
            // Clear form on success
            setFormData({
                currentPassword: '',
                newUsername: '',
                newPassword: '',
            });
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'An error occurred while updating credentials.';
            setError(errorMessage);
            console.error('Update credentials error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
                {t('Admin Settings')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label
                        htmlFor="currentPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {t('Current Password (Required)')}
                    </label>
                    <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
                    />
                </div>

                <hr className="border-gray-300 dark:border-gray-600" />

                <div>
                    <label
                        htmlFor="newUsername"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {t('New Username (Optional)')}
                    </label>
                    <input
                        type="text"
                        id="newUsername"
                        name="newUsername"
                        value={formData.newUsername}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
                    />
                </div>

                <div>
                    <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {t('New Password (Optional)')}
                    </label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
                    />
                </div>

                {message && <p className="text-green-500 text-sm text-center">{message}</p>}
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                    >
                        {isLoading ? t('Updating...') : t('Update Credentials')}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Crucial: Make sure the default export is present
export default AdminSetting;
