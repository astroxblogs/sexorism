import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminBlogForm from '../components/AdminBlogForm';
import api, { setAccessToken } from '../services/api';
import OperatorSettingsForm from '../components/OperatorSettingsForm';

// ---------------- TABLE COMPONENT ----------------
const OperatorBlogTable = ({ blogs, onEdit, startIndex }) => {
    const { t } = useTranslation();
    return (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border">
            <table className="min-w-full">
                <thead>
                    <tr className="bg-gray-50 border-b">
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">#</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Title</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Category</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Date</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Status</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {blogs.length > 0 ? blogs.map((blog, index) => (
                        <tr key={blog._id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-6 text-sm text-gray-500">
                                {startIndex + index + 1}
                            </td>
                            <td className="py-4 px-6">
                                <div className="font-medium text-gray-900 truncate max-w-xs">
                                    {blog.title_en || blog.title}
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {blog.category}
                                </span>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-500">
                                {new Date(blog.date).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-6">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${blog.status === 'published'
                                        ? 'bg-green-100 text-green-800'
                                        : blog.status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                    {blog.status}
                                </span>
                            </td>
                            <td className="py-4 px-6">
                                <button
                                    onClick={() => onEdit(blog)}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline"
                                >
                                    {t('Edit')}
                                </button>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="6" className="py-12 text-center">
                                <div className="text-gray-400">
                                    <div className="text-6xl mb-4">📝</div>
                                    <p className="text-lg font-medium text-gray-600 mb-2">No blogs yet</p>
                                    <p className="text-sm text-gray-500">Start creating your first blog post!</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

// ---------------- DASHBOARD COMPONENT ----------------
const OperatorDashboard = () => {
    const { t } = useTranslation();
    const [editingBlog, setEditingBlog] = useState(null);
    const [myBlogs, setMyBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('overview');
    const [operatorInfo, setOperatorInfo] = useState(null);
    const [stats, setStats] = useState({ total: 0, pending: 0, published: 0, rejected: 0 });
    const navigate = useNavigate();

    // Pagination & Search
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchMyBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const url = `/api/admin/blogs?page=${currentPage}&limit=10${searchQuery ? `&q=${searchQuery}` : ''}`;
            const res = await api.get(url);
            const blogs = res.data.blogs || [];
            setMyBlogs(blogs);
            setTotalPages(res.data.totalPages || 1);

            // Calculate stats
            const total = blogs.length;
            const pending = blogs.filter(b => b.status === 'pending').length;
            const published = blogs.filter(b => b.status === 'published').length;
            const rejected = blogs.filter(b => b.status === 'rejected').length;
            setStats({ total, pending, published, rejected });
        } catch (error) {
            console.error("Failed to fetch operator's blogs:", error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchQuery]);

    useEffect(() => {
        fetchMyBlogs();
    }, [fetchMyBlogs]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handleSave = () => {
        setEditingBlog(null);
        alert('Blog saved successfully! It is now pending for admin approval.');
        fetchMyBlogs();
        setActiveView('blogList');
    };


useEffect(() => {
    const fetchOperatorProfile = async () => {
        try {
            console.log('Fetching operator profile...'); // Debug log
            const response = await api.get('/api/admin/profile');
            console.log('Profile response:', response.data); // Debug log
            setOperatorInfo(response.data);
        } catch (error) {
            console.error('Failed to fetch operator profile:', error.response?.data || error.message); // Better error log
        }
    };

    fetchOperatorProfile();
}, []);


    const handleLogout = async () => {
        try {
            await api.post('/api/admin/logout');
            setAccessToken(null);
            navigate('/login');
        } catch (err) {
            setAccessToken(null);
            navigate('/login');
        }
    };

    const handleEditClick = (blog) => {
        setEditingBlog(blog);
        setActiveView('addForm');
    };

    const navItems = [
        { id: 'overview', label: t('Overview'), icon: '📊' },
        { id: 'addForm', label: t('Create Blog'), icon: '✏️' },
        { id: 'blogList', label: t('My Blogs'), icon: '📄' },
        { id: 'settings', label: t('Settings'), icon: '⚙️' }
    ];

    const renderActiveView = () => {
        switch (activeView) {
            case 'overview':
                return (
                    <div className="space-y-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm font-medium">Total Blogs</p>
                                        <p className="text-3xl font-bold">{stats.total}</p>
                                    </div>
                                    <div className="text-4xl opacity-80">📚</div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-yellow-100 text-sm font-medium">Pending</p>
                                        <p className="text-3xl font-bold">{stats.pending}</p>
                                    </div>
                                    <div className="text-4xl opacity-80">⏳</div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm font-medium">Published</p>
                                        <p className="text-3xl font-bold">{stats.published}</p>
                                    </div>
                                    <div className="text-4xl opacity-80">✅</div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-red-100 text-sm font-medium">Rejected</p>
                                        <p className="text-3xl font-bold">{stats.rejected}</p>
                                    </div>
                                    <div className="text-4xl opacity-80">❌</div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm border p-8">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <button
                                    onClick={() => setActiveView('addForm')}
                                    className="flex flex-col items-center p-6 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                                >
                                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">✏️</div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Create New Blog</h3>
                                    <p className="text-sm text-gray-600 text-center">Start writing your next blog post</p>
                                </button>

                                <button
                                    onClick={() => setActiveView('blogList')}
                                    className="flex flex-col items-center p-6 rounded-xl border-2 border-dashed border-green-300 hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
                                >
                                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📄</div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Manage Blogs</h3>
                                    <p className="text-sm text-gray-600 text-center">View and edit your existing posts</p>
                                </button>

                                <button
                                    onClick={() => setActiveView('settings')}
                                    className="flex flex-col items-center p-6 rounded-xl border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group"
                                >
                                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">⚙️</div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Account Settings</h3>
                                    <p className="text-sm text-gray-600 text-center">Update your profile and preferences</p>
                                </button>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Blogs</h2>
                            {myBlogs.slice(0, 3).length > 0 ? (
                                <div className="space-y-3">
                                    {myBlogs.slice(0, 3).map((blog) => (
                                        <div key={blog._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-800 truncate max-w-md">{blog.title_en || blog.title}</p>
                                                <p className="text-sm text-gray-500">{new Date(blog.date).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${blog.status === 'published' ? 'bg-green-100 text-green-800' :
                                                    blog.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {blog.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No blogs created yet. Start by creating your first blog!</p>
                            )}
                        </div>
                    </div>
                );

            case 'addForm':
                return (
                    <div className="bg-white rounded-xl shadow-sm border">
                        <div className="p-6 border-b bg-gray-50 rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-semibold text-gray-800">
                                    {editingBlog ? `Editing: ${editingBlog.title_en || ''}` : 'Create New Blog Post'}
                                </h2>
                                {editingBlog && (
                                    <button
                                        onClick={() => { setEditingBlog(null); setActiveView('overview'); }}
                                        className="text-gray-500 hover:text-gray-700 text-sm"
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="p-6">
                            <AdminBlogForm
                                key={editingBlog ? editingBlog._id : 'new-blog'}
                                blog={editingBlog}
                                onSave={handleSave}
                            />
                        </div>
                    </div>
                );

            case 'blogList':
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">My Blog Posts</h2>
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search your blogs..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            🔍
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="text-4xl mb-4">⏳</div>
                                    <p className="text-gray-600">Loading your blogs...</p>
                                </div>
                            ) : (
                                <OperatorBlogTable
                                    blogs={myBlogs}
                                    onEdit={handleEditClick}
                                    startIndex={(currentPage - 1) * 10}
                                />
                            )}

                            {totalPages > 1 && (
                                <div className="flex justify-between items-center mt-6 pt-6 border-t">
                                    <button
                                        onClick={() => setCurrentPage(p => p - 1)}
                                        disabled={currentPage === 1}
                                        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        ← Previous
                                    </button>
                                    <span className="text-sm text-gray-600 font-medium">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        disabled={currentPage === totalPages}
                                        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'settings':
                return (
                    <div className="bg-white rounded-xl shadow-sm border">
                        <div className="p-6 border-b bg-gray-50 rounded-t-xl">
                            <h2 className="text-2xl font-semibold text-gray-800">Account Settings</h2>
                            <p className="text-gray-600 mt-1">Manage your account preferences and security</p>
                        </div>
                        <div className="p-6">
                            <OperatorSettingsForm onLogout={handleLogout} />
                        </div>
                    </div>
                );

            default:
                return <div>Select an option from the navigation</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {operatorInfo ? `Hey ${operatorInfo.username || operatorInfo.name}` : 'Content Creator'}
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">Welcome back! Ready to create amazing content?</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            {t('Logout')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6">
                    <nav className="flex space-x-8">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveView(item.id)}
                                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${activeView === item.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {renderActiveView()}
            </div>
        </div>
    );
};

export default OperatorDashboard;