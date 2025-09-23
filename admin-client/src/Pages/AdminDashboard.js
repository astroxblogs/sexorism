import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminBlogForm from '../components/AdminBlogForm';
import AdminBlogList from './AdminBlogList';
import PendingApprovals from '../components/PendingApprovals';
import { apiService, setAccessToken } from '../services/api';
import { useTranslation } from 'react-i18next';
import CategoryManager from './CategoryManager';
import OperatorManagement from './Operatormanagement';
import AdminSetting from './Adminsetting';
import { toast } from 'react-hot-toast'


const AdminDashboard = () => {
    const { t } = useTranslation();
    const [editingBlog, setEditingBlog] = useState(null);
    const [activeView, setActiveView] = useState('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [role, setRole] = useState(() => {
        try { return sessionStorage.getItem('astrox_admin_role_session') || 'admin'; } catch (_) { return 'admin'; }
    });
    const [pendingCount, setPendingCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    
    // ✅ 1. ADD THIS NEW STATE to manage the form's key
    const [formKey, setFormKey] = useState(0);

    useEffect(() => {
        if (location.state?.blogToEdit) {
            setEditingBlog(location.state.blogToEdit);
            setActiveView('blogForm');
        }
        try { const r = sessionStorage.getItem('astrox_admin_role_session'); if (r) setRole(r); } catch (_) {}
    }, [location.state]);

 const handleSave = () => {
    setEditingBlog(null);
    setActiveView('blogList');
    toast.success('Blog saved successfully!', {
        duration: 5000, // Stays for 4 seconds
    });
};

    // ✅ 2. ADD THIS NEW HANDLER FUNCTION for the cancel button
    const handleCancel = () => {
        setEditingBlog(null); // Clear any blog that was being edited
        setFormKey(prevKey => prevKey + 1); // Increment the key to force a re-render/reset
    };

    const handleLogout = async () => {
        try {
            await apiService.logout();
            setAccessToken(null);
            navigate('/');
        } catch (err) {
            console.error('Logout failed:', err);
            setAccessToken(null);
            navigate('/login');
        }
    };

    const fetchPendingCount = useCallback(async () => {
        try {
            const res = await apiService.getPendingBlogs({
                params: { page: 1, limit: 1, _cacheBust: Date.now() }
            });
            setPendingCount(res.data?.totalBlogs || 0);
        } catch (e) {
            console.error("Failed to fetch pending count:", e);
            setPendingCount(0);
        }
    }, []);

    useEffect(() => {
        let intervalId;
        if (role === 'admin') {
            fetchPendingCount();
            intervalId = setInterval(() => {
                fetchPendingCount();
            }, 30000);
        }
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [role, fetchPendingCount]);

    const handleViewChange = (view) => {
    if (view === 'subscriberManagement') {
        navigate('/admin/subscribers');
    } else {
        setActiveView(view);
    }
};

    // Navigation items configuration (no changes here)
    const navigationItems = [ { id: 'dashboard', label: t('Dashboard'), icon: '🏠', color: 'text-blue-600', bgColor: 'bg-blue-50 hover:bg-blue-100', activeColor: 'bg-blue-600 text-white' }, { id: 'blogForm', label: t('Add New Blog'), icon: '✍️', color: 'text-green-600', bgColor: 'bg-green-50 hover:bg-green-100', activeColor: 'bg-green-600 text-white' }, { id: 'blogList', label: t('Manage Blogs'), icon: '📝', color: 'text-purple-600', bgColor: 'bg-purple-50 hover:bg-purple-100', activeColor: 'bg-purple-600 text-white' } ];
const adminOnlyItems = role === 'admin' ? [
    {
        id: 'pendingApprovals',
        label: t('Pending Approvals'),
        icon: '⏳',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 hover:bg-yellow-100',
        activeColor: 'bg-yellow-600 text-white',
        badge: pendingCount
    },
    {
        id: 'categoryManager',
        label: t('Categories'),
        icon: '🏷️',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50 hover:bg-indigo-100',
        activeColor: 'bg-indigo-600 text-white'
    },
    {
        id: 'operatorManagement',
        label: t('Operators'),
        icon: '👥',
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-50 hover:bg-cyan-100',
        activeColor: 'bg-cyan-600 text-white'
    },
    {
        id: 'subscriberManagement',
        label: t('Subscribers'),
        icon: '📧',
        color: 'text-teal-600',
        bgColor: 'bg-teal-50 hover:bg-teal-100',
        activeColor: 'bg-teal-600 text-white'
    },
    {
        id: 'adminSettings',
        label: t('Settings'),
        icon: '⚙️',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50 hover:bg-gray-100',
        activeColor: 'bg-gray-600 text-white'
    }
] : [];    
    
    const allNavigationItems = [...navigationItems, ...adminOnlyItems];

    const renderActiveView = () => {
        switch (activeView) {
            case 'dashboard':
                return ( <div className="space-y-6"> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white"> <h3 className="text-lg font-semibold mb-2">Quick Actions</h3> <p className="text-blue-100 mb-4">Start creating content</p> <button onClick={() => handleViewChange('blogForm')} className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors" > Create New Blog </button> </div> <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white"> <h3 className="text-lg font-semibold mb-2">Content Management</h3> <p className="text-green-100 mb-4">Manage your blogs</p> <button onClick={() => handleViewChange('blogList')} className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors" > View All Blogs </button> </div> {role === 'admin' && ( <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white"> <h3 className="text-lg font-semibold mb-2">Pending Reviews</h3> <p className="text-purple-100 mb-4">{pendingCount} items waiting</p> <button onClick={() => handleViewChange('pendingApprovals')} className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors" > Review Now </button> </div> )} </div> <div className="bg-white rounded-xl p-6 shadow-sm border"> <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome to Your Dashboard</h2> <p className="text-gray-600"> Select an option from the sidebar to get started. You can create new blog posts, manage existing content, and handle administrative tasks. </p> </div> </div> );
            case 'blogForm':
                return (
                    <div className="bg-white rounded-xl shadow-sm border">
                        <div className="p-6 border-b">
                            <h2 className="text-2xl font-semibold text-gray-800">
                                {editingBlog ? `${t('Editing')}: ${editingBlog.title_en || ''}` : t('Add new blog post')}
                            </h2>
                        </div>
                        <div className="p-6">
                            {/* ✅ 3. UPDATE THIS COMPONENT CALL with key and onCancel props */}
                            <AdminBlogForm 
                                key={editingBlog ? editingBlog._id : formKey}
                                blog={editingBlog} 
                                onSave={handleSave}
                                onCancel={handleCancel}
                             />
                        </div>
                    </div>
                );
            case 'blogList':
                return ( <div className="bg-white rounded-xl shadow-sm border"> <div className="p-6 border-b"> <h2 className="text-2xl font-semibold text-gray-800">{t('Manage Blogs')}</h2> </div> <div className="p-6"> <AdminBlogList onEdit={(blog) => { setEditingBlog(blog); handleViewChange('blogForm'); }} /> </div> </div> );
            case 'categoryManager':
                return ( <div className="bg-white rounded-xl shadow-sm border"> <div className="p-6 border-b"> <h2 className="text-2xl font-semibold text-gray-800">{t('Category Management')}</h2> </div> <div className="p-6"> <CategoryManager /> </div> </div> );
       case 'pendingApprovals':
    return (
        <div className="bg-white rounded-xl shadow-sm border">
            {/* ... header ... */}
            <div className="p-6">
                <PendingApprovals 
                    onApprovedOrRejected={fetchPendingCount} 
                    // ✅ ADD THIS PROP
                    // This tells the dashboard to set the blog for editing and switch views
                    onEdit={(blog) => { setEditingBlog(blog); setActiveView('blogForm'); }}
                />
            </div>
        </div>
    );
            
                case 'operatorManagement':
                return ( <div className="bg-white rounded-xl shadow-sm border"> <div className="p-6 border-b"> <h2 className="text-2xl font-semibold text-gray-800">{t('Operator Management')}</h2> </div> <div className="p-6"> <OperatorManagement /> </div> </div> );
            case 'adminSettings':
                return ( <div className="bg-white rounded-xl shadow-sm border"> <div className="p-6 border-b"> <h2 className="text-2xl font-semibold text-gray-800">{t('Admin Settings')}</h2> </div> <div className="p-6"> <AdminSetting /> </div> </div> );
            default:
                return <div className="text-center text-gray-500">Select an option from the sidebar</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-40"> <div className="flex items-center justify-between px-6 py-4"> <div className="flex items-center space-x-4"> <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden" > <span className="text-xl">☰</span> </button> <h1 className="text-2xl font-bold text-gray-900"> AstroX Admin </h1> </div> <div className="flex items-center space-x-4"> <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2"> <span className="text-sm text-gray-600">Role:</span> <span className="text-sm font-medium text-gray-900 capitalize">{role}</span> </div> <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors" > {t('Logout')} </button> </div> </div> </div>
            <div className="flex">
                {/* Sidebar */}
                <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white shadow-lg min-h-screen transition-all duration-300 flex-shrink-0 border-r`}> <div className="p-4"> <nav className="space-y-2"> {allNavigationItems.map((item) => ( <button key={item.id} onClick={() => handleViewChange(item.id)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${ activeView === item.id ? item.activeColor : `${item.bgColor} ${item.color}` }`} > <span className="text-lg">{item.icon}</span> {!sidebarCollapsed && ( <> <span className="flex-1 text-left">{item.label}</span> {item.badge && item.badge > 0 && ( <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center"> {item.badge} </span> )} </> )} </button> ))} </nav> </div> </div>
                {/* Main Content */}
                <div className="flex-1 p-6"> <div className="max-w-7xl mx-auto"> {renderActiveView()} </div> </div>
            </div>
        </div>
    );
};

export default AdminDashboard;