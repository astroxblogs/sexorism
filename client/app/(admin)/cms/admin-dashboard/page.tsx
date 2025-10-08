'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AdminBlogForm from '../../../components/AdminBlogForm'
import { AdminBlogTable } from '../../../components/AdminBlogTable'
import PendingApprovals from '../../../components/PendingApprovals'
import { apiService, setAccessToken } from '../../../lib/api'
import CategoryManagementComponent from '../../../components/CategoryManagementComponent'
import OperatorManagementComponent from '../../../components/OperatorManagementComponent'
import SettingsComponent from '../../../components/SettingsComponent'
import SubscriberManagementComponent from '../../../components/SubscriberManagementComponent'
import BlogManagementComponent from '../../../components/BlogManagementComponent'

interface Blog {
  _id: string
  title_en?: string
  title?: string
}

interface NavigationItem {
  id: string
  label: string
  icon: string
  color: string
  bgColor: string
  activeColor: string
  badge?: number
}

interface AdminNavigationItem extends NavigationItem {
  badge?: number
}

const AdminDashboard = () => {
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [activeView, setActiveView] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [role, setRole] = useState(() => {
    if (typeof window !== 'undefined') {
      try { return sessionStorage.getItem('astrox_admin_role_session') || 'admin'; } catch (_) { return 'admin'; }
    }
    return 'admin'
  })
  const [pendingCount, setPendingCount] = useState(0)

  // ✅ NEW: counts for badges/headers (defensive defaults)
  const [categoryCount, setCategoryCount] = useState(0)
  const [operatorCount, setOperatorCount] = useState(0)

  const [subscriberCount, setSubscriberCount] = useState<number>(0)
  const [totalBlogCount, setTotalBlogCount] = useState<number>(0)

  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Handle form key for reset functionality
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    // Check for blog to edit from URL params
    if (searchParams) {
      const blogToEdit = searchParams.get('edit')
      if (blogToEdit) {
        try {
          setEditingBlog(JSON.parse(decodeURIComponent(blogToEdit)))
          setActiveView('blogForm')
        } catch (e) {
          console.error('Error parsing blog to edit:', e)
        }
      }
    }
    
    // Set role from session storage
    if (typeof window !== 'undefined') {
      try {
        const r = sessionStorage.getItem('astrox_admin_role_session');
        if (r) setRole(r);
      } catch (_) {}
    }
  }, [searchParams])

  const handleSave = () => {
    setEditingBlog(null)
    setActiveView('blogList')
  }

  const handleCancel = () => {
    setEditingBlog(null)
    setFormKey(prevKey => prevKey + 1)
  }

  const handleLogout = async () => {
    try {
      await apiService.logout()
      setAccessToken(null)
      router.push('/')
    } catch (err) {
      console.error('Logout failed:', err)
      setAccessToken(null)
      router.push('/login')
    }
  }

  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await apiService.getPendingBlogs({
        params: { page: 1, limit: 1, _cacheBust: Date.now() }
      })
      setPendingCount(res.data?.totalBlogs || 0)
    } catch (e) {
      console.error("Failed to fetch pending count:", e)
      setPendingCount(0)
    }
  }, [])

  // ✅ place here, NOT inside fetchCounts
const fetchOperatorCount = useCallback(async () => {
  try {
    const res = await (apiService.getOperators?.() ?? Promise.resolve({ data: [] }))
    const payload = (res as any)?.data ?? res
    const list =
      Array.isArray(payload?.operators) ? payload.operators :
      Array.isArray(payload?.data) ? payload.data :
      Array.isArray(payload) ? payload : []
    setOperatorCount(list.length)
  } catch (e) {
    console.warn('Operators count fetch failed:', e)
    setOperatorCount(0)
  }
}, [])

useEffect(() => {
  fetchOperatorCount()
}, [fetchOperatorCount])

  // ✅ NEW: defensive fetchers for counts (will not throw if endpoints differ)
  const fetchCounts = useCallback(async () => {
    // Categories
    try {
      const res = await (apiService.getCategories?.() ?? Promise.resolve({ data: [] }))
      const list = (res as any)?.data ?? (res as any)?.categories ?? []
      setCategoryCount(Array.isArray(list) ? list.length : 0)
    } catch (e) {
      console.warn('Categories count fetch failed:', e)
      setCategoryCount(0)
    }

    // Operators



    
   // Subscribers
try {
  // getSubscribers() takes no args in your apiService typing
  const res = await (apiService.getSubscribers?.() ?? Promise.resolve({ data: [] }))

  // Be defensive about payload shape: array, { total }, { subscribers: [] }, etc.
  const payload = (res as any)?.data ?? res
  let total = 0

  if (typeof payload === 'number') {
    total = payload
  } else if (Array.isArray(payload)) {
    total = payload.length
  } else {
    total =
      payload?.total ??
      payload?.count ??
      (Array.isArray(payload?.subscribers) ? payload.subscribers.length : 0) ??
      0
  }

  setSubscriberCount(Number.isFinite(total) ? total : 0)
} catch (e) {
  console.warn('Subscribers count fetch failed:', e)
  setSubscriberCount(0)
}


    // Total blogs
    try {
      const res = await (apiService.getBlogs?.({ params: { page: 1, limit: 1 } }) ?? Promise.resolve({ data: { totalBlogs: 0 } }))
      const total = (res as any)?.data?.totalBlogs ?? (res as any)?.totalBlogs ?? 0
      setTotalBlogCount(typeof total === 'number' ? total : 0)
    } catch (e) {
      console.warn('Blogs count fetch failed:', e)
      setTotalBlogCount(0)
    }
  }, [])

  useEffect(() => {
    let intervalId: any
    if (role === 'admin') {
      fetchPendingCount()
      fetchCounts()
       fetchOperatorCount()
      intervalId = setInterval(() => {
        fetchPendingCount()
        fetchCounts()
           fetchOperatorCount()
      }, 30000)
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [role, fetchPendingCount, fetchCounts,fetchOperatorCount])

  

  const handleViewChange = (view) => {
    setActiveView(view)
  }

  // Navigation items configuration
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', color: 'text-blue-600', bgColor: 'bg-blue-50 hover:bg-blue-100', activeColor: 'bg-blue-600 text-white' },
    { id: 'blogForm', label: 'Add New Blog', icon: '✍️', color: 'text-green-600', bgColor: 'bg-green-50 hover:bg-green-100', activeColor: 'bg-green-600 text-white' },
    { id: 'blogList', label: 'Manage Blogs', icon: '📝', color: 'text-purple-600', bgColor: 'bg-purple-50 hover:bg-purple-100', activeColor: 'bg-purple-600 text-white' }
  ]

  const adminOnlyItems = role === 'admin' ? [
    {
      id: 'pendingApprovals',
      label: 'Pending Approvals',
      icon: '⏳',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 hover:bg-yellow-100',
      activeColor: 'bg-yellow-600 text-white',
      badge: pendingCount
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: '🏷️',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 hover:bg-indigo-100',
      activeColor: 'bg-indigo-600 text-white',
      // ✅ show count badge like deployed UI
      badge: categoryCount
    },
    {
      id: 'operators',
      label: 'Operators',
      icon: '👥',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 hover:bg-cyan-100',
      activeColor: 'bg-cyan-600 text-white',
      badge: operatorCount
    },
    {
      id: 'subscribers',
      label: 'Subscribers',
      icon: '📧',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 hover:bg-teal-100',
      activeColor: 'bg-teal-600 text-white',
      badge: subscriberCount
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 hover:bg-gray-100',
      activeColor: 'bg-gray-600 text-white'
    }
  ] : []
  
  const allNavigationItems: NavigationItem[] = [...navigationItems, ...adminOnlyItems]

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* ✅ Quick Stats like deployed UI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-1">Total Blogs</h3>
                <p className="text-3xl font-bold">{totalBlogCount}</p>
              </div>
              {/* <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-1">Pending Reviews</h3>
                <p className="text-3xl font-bold">{pendingCount}</p>
              </div> */}
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-1">Categories</h3>
                <p className="text-3xl font-bold">{categoryCount}</p>
              </div>
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-1">Subscribers</h3>
                <p className="text-3xl font-bold">{subscriberCount}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
                <p className="text-blue-100 mb-4">Start creating content</p>
                <button
                  onClick={() => handleViewChange('blogForm')}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  Create New Blog
                </button>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Content Management</h3>
                <p className="text-green-100 mb-4">Manage your blogs</p>
                <button
                  onClick={() => handleViewChange('blogList')}
                  className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors"
                >
                  View All Blogs
                </button>
              </div>
              {role === 'admin' && (
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">Pending Reviews</h3>
                  <p className="text-purple-100 mb-4">{pendingCount} items waiting</p>
                  <button
                    onClick={() => handleViewChange('pendingApprovals')}
                    className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors"
                  >
                    Review Now
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome to Your Dashboard</h2>
              <p className="text-gray-600">
                Select an option from the sidebar to get started. You can create new blog posts, manage existing content, and handle administrative tasks.
              </p>
            </div>
          </div>
        )
      case 'blogForm':
        return (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-800">
                {editingBlog ? `Editing: ${editingBlog.title_en || ''}` : 'Add new blog post'}
              </h2>
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
        )
      case 'blogList':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Manage Blogs</h2>
              <button
                onClick={() => handleViewChange('blogForm')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Add New Blog
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border">
              <BlogManagementComponent />
            </div>
          </div>
        )
      case 'categories':
        return (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-800">
                Category Management <span className="text-gray-400 font-normal">• {categoryCount}</span>
              </h2>
            </div>
            <div className="p-6">
              <CategoryManagementComponent />
            </div>
          </div>
        )
      case 'categoryManager':
        return (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-800">
                Category Management <span className="text-gray-400 font-normal">• {categoryCount}</span>
              </h2>
            </div>
            <div className="p-6">
              <CategoryManagementComponent />
            </div>
          </div>
        )
      case 'pendingApprovals':
        return (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-800">
                Pending Approvals <span className="text-gray-400 font-normal">• {pendingCount}</span>
              </h2>
            </div>
            <div className="p-6">
              <PendingApprovals 
                onApprovedOrRejected={fetchPendingCount}
                onEdit={(blog) => { 
                  setEditingBlog(blog); 
                  setActiveView('blogForm'); 
                }}
              />
            </div>
          </div>
        )
      case 'operators':
  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-semibold text-gray-800">
          Operator Management <span className="text-gray-400">• {operatorCount}</span>
        </h2>
      </div>
      <div className="p-6">
        <OperatorManagementComponent />
      </div>
    </div>
  );

      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-800">Admin Settings</h2>
            </div>
            <div className="p-6">
              <SettingsComponent />
            </div>
          </div>
        )
      case 'subscribers':
        return (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-800">
                Subscriber Management <span className="text-gray-400 font-normal">• {subscriberCount}</span>
              </h2>
            </div>
            <div className="p-6">
              <SubscriberManagementComponent />
            </div>
          </div>
        )
      default:
        return <div className="text-center text-gray-500">Select an option from the sidebar</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            >
              <span className="text-xl">☰</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">AstroX Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
              <span className="text-sm text-gray-600">Role:</span>
              <span className="text-sm font-medium text-gray-900 capitalize">{role}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white shadow-lg min-h-screen transition-all duration-300 flex-shrink-0 border-r`}>
          <div className="p-4">
            <nav className="space-y-2">
              {allNavigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleViewChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeView === item.id 
                      ? item.activeColor 
                      : `${item.bgColor} ${item.color}`
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
