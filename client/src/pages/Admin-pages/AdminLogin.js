import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/Admin-service/api';
import { setAuthToken } from '../../utils/Admin-utils/localStorage';

const AdminLogin = () => {
    const { t } = useTranslation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/api/admin/login', { username, password });

            // --- THE FIX ---
            // Changed from res.data?.token to res.data?.accessToken to match the server response
            if (res.data?.accessToken) {
                setAuthToken(res.data.accessToken);
            } else {
                throw new Error("No auth token received from server.");
            }

            if (res.data?.refreshToken) {
                try {
                    sessionStorage.setItem('astrox_last_refresh_token', res.data.refreshToken);
                } catch (_) {}
            }

            if (res.data?.role) {
                try {
                    sessionStorage.setItem('astrox_admin_role_session', res.data.role);
                } catch (_) {}
            }

            const resolvedRole = res.data?.role;
            if (resolvedRole === 'operator') {
                navigate('/cms/operator-dashboard');
            } else if (resolvedRole === 'admin') {
                navigate('/cms/admin-dashboard');
            } else {
                setError(t('loginSuccessfulButNoRole'));
            }

        } catch (err) {
            console.error('Login error:', err.response?.data?.message || err.message, err);
            setError(t('invalidCredentials'));
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center">{t('Login')}</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="sr-only" htmlFor="username">Username</label>
                        <input
                            id="username"
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={t('username')}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="sr-only" htmlFor="password">Password</label>
                        <input
                            id="password"
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="password"
                            placeholder={t('password')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="text-red-500 text-center font-medium">{error}</div>}
                    <button
                        className="w-full p-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                        type="submit"
                    >
                        {t('login')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
