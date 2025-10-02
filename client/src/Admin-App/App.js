// FILE: client/src/Admin-App/App.js
// console.log("Admin App Loaded");
import React, { useState, useEffect, useCallback } from 'react';
// BrowserRouter is REMOVED. The main index.js now provides the router.
import { Routes, Route, useNavigate } from 'react-router-dom';

import AdminLogin from '../pages/Admin-pages/AdminLogin';
import AdminDashboard from '../pages/Admin-pages/AdminDashboard';
import OperatorDashboard from '../pages/Admin-pages/OperatorDashboard';
import AdminBlogList from '../pages/Admin-pages/AdminBlogList';
import SubscriberManagement from '../pages/Admin-pages/SubscriberManagement';
import { getAuthToken, removeAuthToken } from '../utils/Admin-utils/localStorage';
import api from '../services/Admin-service/api';
import { Toaster } from 'react-hot-toast';
import 'react-loading-skeleton/dist/skeleton.css';

// --- REVISED PrivateRoute Component ---
const PrivateRoute = ({ children, requireRole }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const verifyAdminToken = useCallback(async () => {
        const token = getAuthToken();
        if (!token) {
            // CRITICAL CHANGE: Navigate to the full path including /cms
            navigate('/cms/login');
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/api/admin/verify-token');
            if (response.status === 200) {
                const userRole = response.data?.role;
                if (!requireRole || userRole === 'admin' || userRole === requireRole) {
                    setIsAuthenticated(true);
                } else {
                    removeAuthToken();
                    navigate('/cms/login'); // CRITICAL CHANGE
                }
            } else {
                removeAuthToken();
                navigate('/cms/login'); // CRITICAL CHANGE
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            removeAuthToken();
            navigate('/cms/login'); // CRITICAL CHANGE
        } finally {
            setLoading(false);
        }
    }, [navigate, requireRole]);

    useEffect(() => {
        verifyAdminToken();
    }, [verifyAdminToken]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return isAuthenticated ? children : null;
};

function App() {
    return (
        // The <Router> component is removed from here.
        <>
            <Toaster position="top-right" reverseOrder={false} />
            <div className="App">
                <Routes>
                    {/* The paths are now RELATIVE to /cms */}
                    <Route path="login" element={<AdminLogin />} />
                    {/* The root of /cms now redirects to the login page */}
                    <Route path="/" element={<AdminLogin />} />

                    <Route
                        path="admin-dashboard"
                        element={
                            <PrivateRoute requireRole="admin">
                                <AdminDashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="admin/subscribers"
                        element={
                            <PrivateRoute requireRole="admin">
                                <SubscriberManagement />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="operator-dashboard"
                        element={
                            <PrivateRoute requireRole="operator">
                                <OperatorDashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="admin/blogs"
                        element={
                            <PrivateRoute>
                                <AdminBlogList />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </div>
        </>
    );
}

export default App;