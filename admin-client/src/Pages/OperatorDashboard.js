import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminBlogForm from '../components/AdminBlogForm';
import api, { setAccessToken } from '../services/api';
import OperatorSettingsForm from '../components/OperatorSettingsForm';
import { toast } from 'react-hot-toast';

// --- ICONS (Using high-quality SVGs for a professional look) ---
const ICONS = {
    overview: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    addForm: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    blogList: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    settings: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    logout: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
};

// --- UI SUB-COMPONENTS ---
const Sidebar = ({ activeView, setActiveView, handleLogout }) => { /* ... No changes here ... */
    const { t } = useTranslation();
    const navItems = [
        { id: 'overview', label: t('Overview'), icon: ICONS.overview },
        { id: 'addForm', label: t('Create Blog'), icon: ICONS.addForm },
        { id: 'blogList', label: t('My Blogs'), icon: ICONS.blogList },
        { id: 'settings', label: t('Settings'), icon: ICONS.settings }
    ];
    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen">
            <div className="p-6 border-b border-gray-200"><h1 className="text-2xl font-bold text-gray-800">Innvibs</h1><p className="text-sm text-gray-500">Operator Panel</p></div>
            <nav className="flex-1 p-4 space-y-2">{navItems.map((item) => (<button key={item.id} onClick={() => setActiveView(item.id)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${activeView === item.id ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>{item.icon}<span>{item.label}</span></button>))}</nav>
            <div className="p-4 border-t border-gray-200"><button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm text-red-600 hover:bg-red-50 transition-all duration-200">{ICONS.logout}<span>{t('Logout')}</span></button></div>
        </div>
    );
};
const Header = ({ operatorInfo, setActiveView }) => { /* ... No changes here ... */
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);
    const date = currentTime.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const time = currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    return (
        <div className="bg-white p-6 flex items-center justify-between">
            <div><h1 className="text-2xl font-bold text-gray-800">{operatorInfo ? `Welcome back, ${operatorInfo.username}!` : 'Operator Dashboard'}</h1><p className="text-gray-500">{`${date} | ${time}`}</p></div>
            <button onClick={() => setActiveView('addForm')} className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold flex items-center space-x-2 hover:bg-blue-700 transition-colors shadow-sm">{ICONS.addForm}<span>Create New Blog</span></button>
        </div>
    );
};
const OperatorBlogTable = ({ blogs, onEdit, startIndex }) => { /* ... No changes here ... */
    const { t } = useTranslation();
    return (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border">
            <table className="min-w-full"><thead className="bg-gray-50"><tr><th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">#</th><th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Title</th><th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Category</th><th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Date</th><th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Status</th><th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{blogs.length > 0 ? blogs.map((blog, index) => (<tr key={blog._id} className="hover:bg-gray-50 transition-colors"><td className="py-4 px-6 text-sm text-gray-500">{startIndex + index + 1}</td><td className="py-4 px-6 font-medium text-gray-900 truncate max-w-xs">{blog.title_en || blog.title}</td><td className="py-4 px-6"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{blog.category}</span></td><td className="py-4 px-6 text-sm text-gray-500">{new Date(blog.date).toLocaleDateString()}</td><td className="py-4 px-6"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${blog.status === 'published' ? 'bg-green-100 text-green-800' : blog.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{blog.status}</span></td><td className="py-4 px-6"><button onClick={() => onEdit(blog)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline">{t('Edit')}</button></td></tr>)) : (<tr><td colSpan="6" className="py-12 text-center"><div className="text-gray-400"><div className="text-6xl mb-4">📝</div><p className="text-lg font-medium text-gray-600 mb-2">No blogs yet</p><p className="text-sm text-gray-500">Start creating your first blog post!</p></div></td></tr>)}</tbody></table>
        </div>
    );
};

// --- MAIN DASHBOARD COMPONENT ---
const OperatorDashboard = () => {
    // --- CORE LOGIC AND STATE ---
    // const { t } = useTranslation();
    const [editingBlog, setEditingBlog] = useState(null);
    const [myBlogs, setMyBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('overview');
    const [operatorInfo, setOperatorInfo] = useState(null);
    const [stats, setStats] = useState({ total: 0, pending: 0, published: 0, rejected: 0 });
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [formKey, setFormKey] = useState(0);

    const fetchMyBlogs = useCallback(async () => { /* ... No changes here ... */
        setLoading(true);
        try {
            const url = `/api/admin/blogs?page=${currentPage}&limit=10${searchQuery ? `&q=${searchQuery}` : ''}`;
            const res = await api.get(url);
            const blogs = res.data.blogs || [];
            setMyBlogs(blogs);
            setTotalPages(res.data.totalPages || 1);
            const total = res.data.totalBlogs || 0;
            const pending = blogs.filter(b => b.status === 'pending').length;
            const published = blogs.filter(b => b.status === 'published').length;
            const rejected = blogs.filter(b => b.status === 'rejected').length;
            setStats({ total, pending, published, rejected });
        } catch (error) { console.error("Failed to fetch operator's blogs:", error); }
        finally { setLoading(false); }
    }, [currentPage, searchQuery]);

    useEffect(() => { fetchMyBlogs(); }, [fetchMyBlogs]);
    useEffect(() => { setCurrentPage(1); }, [searchQuery]);

 const handleSave = () => {
    setEditingBlog(null);
    toast.success('Blog saved successfully! It is now pending for admin approval.', {
        duration: 5000, // Stays for 5 seconds
    });
    fetchMyBlogs();
    setActiveView('blogList');
};
    const handleCancel = () => { /* ... No changes here ... */
        setEditingBlog(null);
        setFormKey(prevKey => prevKey + 1);
    };

    useEffect(() => { /* ... No changes here ... */
        const fetchOperatorProfile = async () => {
            try {
                const response = await api.get('/api/admin/profile');
                setOperatorInfo(response.data);
            } catch (error) { console.error('Failed to fetch operator profile:', error.response?.data || error.message); }
        };
        fetchOperatorProfile();
    }, []);

    const handleLogout = async () => { /* ... No changes here ... */
        try {
            await api.post('/api/admin/logout');
            setAccessToken(null);
            navigate('/login');
        } catch (err) {
            setAccessToken(null);
            navigate('/login');
        }
    };

    const handleEditClick = (blog) => { /* ... No changes here ... */
        setEditingBlog(blog);
        setActiveView('addForm');
    };

    // --- VIEW RENDERING LOGIC ---
    const renderActiveView = () => {
        switch (activeView) {
            case 'overview':
                return <OverviewView stats={stats} blogs={myBlogs} setActiveView={setActiveView} />;
            case 'addForm':
                // ✅ FIXED: Pass formKey and handleCancel as props
                return <BlogFormView
                    editingBlog={editingBlog}
                    setEditingBlog={setEditingBlog}
                    handleSave={handleSave}
                    setActiveView={setActiveView}
                    formKey={formKey}
                    handleCancel={handleCancel}
                />;
            case 'blogList':
                return <BlogListView blogs={myBlogs} loading={loading} handleEditClick={handleEditClick} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
            case 'settings':
                return <SettingsView handleLogout={handleLogout} />;
            default:
                return <div>Select an option from the navigation</div>;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar activeView={activeView} setActiveView={setActiveView} handleLogout={handleLogout} />
            <main className="flex-1 flex flex-col">
                <Header operatorInfo={operatorInfo} setActiveView={setActiveView} />
                <div className="flex-1 p-8 overflow-y-auto">{renderActiveView()}</div>
            </main>
        </div>
    );
};

// --- VIEW-SPECIFIC SUB-COMPONENTS ---

const OverviewView = ({ stats, blogs, setActiveView }) => { /* ... No changes here ... */
    return (
        <div className="space-y-8"> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"><p className="text-blue-100 text-sm font-medium">Total Blogs</p><p className="text-3xl font-bold">{stats.total}</p></div> <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg"><p className="text-yellow-100 text-sm font-medium">Pending</p><p className="text-3xl font-bold">{stats.pending}</p></div> <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg"><p className="text-green-100 text-sm font-medium">Published</p><p className="text-3xl font-bold">{stats.published}</p></div> <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg"><p className="text-red-100 text-sm font-medium">Rejected</p><p className="text-3xl font-bold">{stats.rejected}</p></div> </div> <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"> <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border p-6 space-y-4"> <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2> <div className="space-y-3"> <button onClick={() => setActiveView('addForm')} className="w-full text-left p-4 rounded-lg hover:bg-gray-100 transition-all group flex items-center justify-between"> <div className="flex items-center space-x-4"> <div className="bg-blue-100 text-blue-600 rounded-lg p-3"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg></div> <div> <h3 className="font-semibold text-gray-800">Create New Blog</h3> <p className="text-sm text-gray-500">Start with a blank page</p> </div> </div> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg> </button> <button onClick={() => setActiveView('blogList')} className="w-full text-left p-4 rounded-lg hover:bg-gray-100 transition-all group flex items-center justify-between"> <div className="flex items-center space-x-4"> <div className="bg-green-100 text-green-600 rounded-lg p-3"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg></div> <div> <h3 className="font-semibold text-gray-800">Manage Blogs</h3> <p className="text-sm text-gray-500">View and edit your posts</p> </div> </div> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg> </button> </div> </div> <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6"> <div className="flex items-center justify-between mb-4"> <h2 className="text-xl font-semibold text-gray-800">Recent Blogs</h2> <button onClick={() => setActiveView('blogList')} className="text-sm font-medium text-blue-600 hover:underline"> View All </button> </div> {blogs.slice(0, 5).length > 0 ? (<div className="divide-y divide-gray-200"> {blogs.slice(0, 5).map((blog) => (<div key={blog._id} className="py-4 flex items-center justify-between"> <div className="flex items-center space-x-3"> <div className={`h-2.5 w-2.5 rounded-full ${blog.status === 'published' ? 'bg-green-500' : blog.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`}></div> <div> <p className="font-medium text-gray-800 truncate max-w-md">{blog.title_en || blog.title}</p> <p className="text-sm text-gray-500">{new Date(blog.date).toLocaleDateString()}</p> </div> </div> <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${blog.status === 'published' ? 'bg-green-100 text-green-800' : blog.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{blog.status}</span> </div>))} </div>) : (<div className="text-center py-10"> <div className="bg-gray-100 rounded-full p-5 inline-block"><svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div> <h3 className="mt-4 text-lg font-semibold text-gray-800">No Recent Blogs</h3> <p className="mt-1 text-gray-500">Your latest blog posts will appear here.</p> </div>)} </div> </div> </div>
    )
};

// ✅ FIX: Accept formKey and handleCancel as props
const BlogFormView = ({ editingBlog, setEditingBlog, handleSave, setActiveView, formKey, handleCancel }) => (
    <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b bg-gray-50 rounded-t-xl flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">{editingBlog ? `Editing Blog` : 'Create New Blog Post'}</h2>
            {editingBlog && <button onClick={() => { setEditingBlog(null); handleCancel(); }} className="text-sm font-medium text-gray-600 hover:text-gray-800">Cancel Edit</button>}
        </div>
        <div className="p-6">
            <AdminBlogForm
                key={editingBlog ? editingBlog._id : formKey}
                blog={editingBlog}
                onSave={handleSave}
                onCancel={handleCancel}
            />
        </div>
    </div>
);

const BlogListView = ({ blogs, loading, handleEditClick, currentPage, setCurrentPage, totalPages, searchQuery, setSearchQuery }) => { /* ... No changes here ... */
    return (
        <div className="space-y-6"> <div className="bg-white rounded-xl shadow-sm border p-6"> <div className="flex items-center justify-between mb-6"> <h2 className="text-2xl font-semibold text-gray-800">My Blog Posts</h2> <div className="relative"><input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg" /><div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</div></div> </div> {loading ? <p>Loading...</p> : <OperatorBlogTable blogs={blogs} onEdit={handleEditClick} startIndex={(currentPage - 1) * 10} />} {totalPages > 1 && (<div className="flex justify-between items-center mt-6 pt-6 border-t"> <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50">Previous</button> <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span> <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50">Next</button> </div>)} </div> </div>
    )
};

const SettingsView = ({ handleLogout }) => { /* ... No changes here ... */
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b bg-gray-50 rounded-t-xl"><h2 className="text-2xl font-semibold text-gray-800">Account Settings</h2><p className="text-gray-600 mt-1">Manage your account preferences and security</p></div>
                <div className="p-8">
                    <div onClick={() => setIsModalOpen(true)} className="flex items-center justify-between p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all duration-200 group">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors"><svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg></div>
                            <div><h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Change Password</h3><p className="text-gray-500 text-sm">Update your account password for better security.</p></div>
                        </div>
                        <div className="text-gray-400 group-hover:text-blue-500 transition-colors"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></div>
                    </div>
                </div>
            </div>
            {isModalOpen && <OperatorSettingsForm onClose={() => setIsModalOpen(false)} />}
        </>
    );
};

export default OperatorDashboard;