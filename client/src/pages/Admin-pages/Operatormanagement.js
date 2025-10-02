import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../../services/Admin-service/api';

const OperatorManagement = () => {
    const { t } = useTranslation();
    const [operators, setOperators] = useState([]);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toggleLoading, setToggleLoading] = useState({});

    const fetchOperators = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await apiService.getOperators();
            setOperators(res.data.operators);
        } catch (err) {
            setError('Failed to fetch operators.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOperators();
    }, [fetchOperators]);

    const handleCreateOperator = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        if (!username || !password) {
            setError('Username and password are required.');
            return;
        }
        setIsLoading(true);
        try {
            await apiService.createOperator({ username, password });
            setMessage(`Operator '${username}' created successfully!`);
            setUsername('');
            setPassword('');
            fetchOperators(); // Refresh the list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create operator.');
        } finally {
            setIsLoading(false);
        }
    };

    // 🔥 NEW: Toggle operator status function
    const handleToggleOperatorStatus = async (id, operatorUsername, currentStatus) => {
        const action = currentStatus ? 'deactivate' : 'activate';
        const confirmMessage = `Are you sure you want to ${action} operator '${operatorUsername}'?`;
        
        if (window.confirm(confirmMessage)) {
            setToggleLoading(prev => ({ ...prev, [id]: true }));
            try {
                const response = await apiService.toggleOperatorStatus(id);
                setMessage(response.data.message);
                
                // Update the operator in the local state
                setOperators(prev => 
                    prev.map(op => 
                        op._id === id 
                            ? { ...op, isActive: !currentStatus }
                            : op
                    )
                );
                
                // Clear any previous errors
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to toggle operator status.');
            } finally {
                setToggleLoading(prev => ({ ...prev, [id]: false }));
            }
        }
    };

    // 🔥 NEW: Keep permanent delete function (optional)
    const handleDeleteOperator = async (id, operatorUsername) => {
        if (window.confirm(`Are you sure you want to PERMANENTLY delete operator '${operatorUsername}'? This action cannot be undone.`)) {
            try {
                await apiService.deleteOperator(id);
                setMessage('Operator permanently deleted successfully!');
                fetchOperators(); // Refresh the list
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete operator.');
            }
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('Operator Management')}</h2>
                <p className="text-gray-600">Manage operator accounts and their access status</p>
            </div>
            
            {/* Global Messages */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                        <span className="mr-2">⚠️</span>
                        {error}
                    </div>
                </div>
            )}
            {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                        <span className="mr-2">✅</span>
                        {message}
                    </div>
                </div>
            )}

            {/* Create Operator Form */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center mb-6">
                    <span className="text-2xl mr-3">➕</span>
                    <h3 className="text-xl font-semibold text-gray-900">{t('Create New Operator')}</h3>
                </div>
                
                <form onSubmit={handleCreateOperator} className="max-w-md">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('Username')}
                            </label>
                            <input 
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Enter username"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('Password')}
                            </label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Enter password"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={isLoading || !username || !password}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <span className="animate-spin mr-2">⏳</span>
                                    {t('Creating...')}
                                </span>
                            ) : (
                                t('Create Operator')
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Operators List */}
            <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">👥</span>
                            <h3 className="text-xl font-semibold text-gray-900">{t('Existing Operators')}</h3>
                        </div>
                        <div className="text-sm text-gray-500">
                            {operators.length} {operators.length === 1 ? 'operator' : 'operators'}
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {isLoading && operators.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="animate-spin text-3xl mb-4">⏳</div>
                            <p className="text-gray-500">{t('Loading operators...')}</p>
                        </div>
                    ) : operators.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-4">👤</div>
                            <p className="text-gray-500">No operators found. Create your first operator above.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {operators.map(op => (
                                <div 
                                    key={op._id} 
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                {op.username.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div className="flex items-center space-x-3">
                                                <h4 className="font-medium text-gray-900">{op.username}</h4>
                                                {/* Status Badge */}
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    op.isActive 
                                                        ? 'bg-green-100 text-green-800 border border-green-200' 
                                                        : 'bg-red-100 text-red-800 border border-red-200'
                                                }`}>
                                                    <span className={`w-2 h-2 rounded-full mr-1 ${
                                                        op.isActive ? 'bg-green-500' : 'bg-red-500'
                                                    }`}></span>
                                                    {op.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">Role: {op.role}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        {/* Toggle Status Button */}
                                        <button
                                            onClick={() => handleToggleOperatorStatus(op._id, op.username, op.isActive)}
                                            disabled={toggleLoading[op._id]}
                                            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                                                op.isActive
                                                    ? 'bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-200'
                                                    : 'bg-green-100 hover:bg-green-200 text-green-700 border border-green-200'
                                            }`}
                                        >
                                            {toggleLoading[op._id] ? (
                                                <span className="animate-spin mr-2">⏳</span>
                                            ) : (
                                                <span className="mr-2">
                                                    {op.isActive ? '🔒' : '🔓'}
                                                </span>
                                            )}
                                            {toggleLoading[op._id] 
                                                ? 'Updating...' 
                                                : op.isActive 
                                                    ? 'Deactivate' 
                                                    : 'Activate'
                                            }
                                        </button>

                                        {/* Permanent Delete Button (Optional - can be removed) */}
                                        <button
                                            onClick={() => handleDeleteOperator(op._id, op.username)}
                                            className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg font-medium transition-colors border border-red-200"
                                            title="Permanently delete operator"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Info Panel */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                    <span className="text-blue-500 text-xl mr-3 flex-shrink-0">ℹ️</span>
                    <div className="text-sm text-blue-700">
                        <h4 className="font-medium mb-1">Status Management</h4>
                        <ul className="space-y-1 text-blue-600">
                            <li>• <strong>Active:</strong> Operator can log in and access the system</li>
                            <li>• <strong>Inactive:</strong> Operator cannot log in, but account is preserved</li>
                            <li>• <strong>Delete:</strong> Permanently removes the operator account</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperatorManagement;