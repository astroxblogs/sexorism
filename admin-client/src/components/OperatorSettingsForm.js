import React, { useState } from 'react';
import { apiService } from '../services/api';

const OperatorSettingsForm = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

// Inside src/components/OperatorSettingsForm.js

const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('1. Form submission started.'); // <-- ADD THIS

  setMessage(null);
  setLoading(true);

  try {
    const payload = {
      currentPassword,
      ...(newUsername ? { newUsername } : {}),
      ...(newPassword ? { newPassword } : {}),
    };

    console.log('2. Payload created:', payload); // <-- ADD THIS
    console.log('3. Calling the API service...'); // <-- ADD THIS

    const res = await apiService.updateOperatorCredentials(payload);

    console.log('4. API call successful:', res); // <-- ADD THIS

    setMessage({ type: 'success', text: res.data.message || 'Updated successfully!' });
    setCurrentPassword('');
    setNewUsername('');
    setNewPassword('');
  } catch (err) {
    // Modify your catch block to log the entire error object
    console.error('5. AN ERROR OCCURRED:', err); // <-- ADD THIS
    setMessage({
      type: 'error',
      text: err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Update failed. Please try again.',
    });
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Update Credentials
      </h2>

      {message && (
        <div
          className={`mb-4 p-2 rounded ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">New Username (optional)</label>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">New Password (optional)</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Credentials'}
        </button>
      </form>
    </div>
  );
};

export default OperatorSettingsForm;
