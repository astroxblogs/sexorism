'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';

export default function AdminLogin() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/admin/login', formData);
      const { accessToken, refreshToken, role: rawRole } = response?.data || {};

      if (accessToken) {
        // cookie for server verify
        document.cookie = `token=${accessToken}; path=/; max-age=86400`;

        // cache role (used only for UX guards)
        const role = (rawRole || 'admin').toLowerCase();
        try { sessionStorage.setItem('astrox_admin_role_session', role); } catch {}

        if (refreshToken) {
          try { sessionStorage.setItem('astrox_last_refresh_token', refreshToken); } catch {}
        }

        // role-based redirect
        router.push(role === 'operator' ? '/cms/operator-dashboard' : '/cms/admin-dashboard');
      } else {
        setError('No access token returned');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Admin / Operator Login
        </h2>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
          <div className="rounded-md shadow-sm -space-y-px">
            <input id="username" name="username" type="text" required className="block w-full px-3 py-2 border rounded-t-md"
              placeholder="Username" value={formData.username} onChange={handleChange} />
            <input id="password" name="password" type="password" required className="block w-full px-3 py-2 border rounded-b-md"
              placeholder="Password" value={formData.password} onChange={handleChange} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2 px-4 rounded-md text-white bg-indigo-600 disabled:opacity-50">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
