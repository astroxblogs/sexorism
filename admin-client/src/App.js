import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import AdminLogin from './Pages/AdminLogin';
import AdminDashboard from './Pages/AdminDashboard';
import OperatorDashboard from './Pages/OperatorDashboard';
import AdminBlogList from './Pages/AdminBlogList';
import SubscriberManagement from './Pages/SubscriberManagement';
import { getAuthToken, removeAuthToken } from './utils/localStorage';
import api from './services/api';
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
            navigate('/login');
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/api/admin/verify-token');
            if (response.status === 200) {
                const userRole = response.data?.role;

                // --- DEBUGGING LOGS ADDED ---
                // These messages will show us exactly what the component is checking.
                console.log("--- Verifying Access ---");
                console.log("Route requires role:", requireRole || "Any authenticated user");
                console.log("User's actual role from API:", userRole);

                if (!requireRole || userRole === 'admin' || userRole === requireRole) {
                    console.log("Permission Check: Access GRANTED.");
                    setIsAuthenticated(true);
                } else {
                    console.log("Permission Check: Access DENIED. Redirecting to login.");
                    removeAuthToken();
                    navigate('/login');
                }
            } else {
                removeAuthToken();
                navigate('/login');
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            removeAuthToken();
            navigate('/login');
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
      <Router >
            <Toaster position="top-right" reverseOrder={false} />
            <div className="App">
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<AdminLogin />} />
                    <Route path="/" element={<AdminLogin />} />

                    {/* Admin-only route */}
                    <Route
                        path="/admin-dashboard"  
                        element={
                            <PrivateRoute requireRole="admin">
                                <AdminDashboard />
                            </PrivateRoute>
                        }
                    />

                    {/* Subscriber Management - Admin only */}
                    <Route
                        path="/admin/subscribers"
                        element={
                            <PrivateRoute requireRole="admin">
                                <SubscriberManagement />
                            </PrivateRoute>
                        }
                    />

                    {/* Operator-only route */}
                    <Route
                        path="/operator-dashboard"
                        element={
                            <PrivateRoute requireRole="operator">
                                <OperatorDashboard />
                            </PrivateRoute>
                        }
                    />

                    {/* A route accessible by both admins and operators */}
                    <Route
                        path="/admin/blogs"
                        element={
                            <PrivateRoute>
                                <AdminBlogList />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

