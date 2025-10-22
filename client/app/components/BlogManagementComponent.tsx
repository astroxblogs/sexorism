'use client'

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '../lib/api';
import { getAuthToken } from '../utils/localStorage';
import { toast } from 'react-hot-toast';
import { AdminBlogTable } from './AdminBlogTable';
import AdminBlogForm from './AdminBlogForm';

export default function BlogManagementComponent() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);              // initial/full load
  const [searchLoading, setSearchLoading] = useState(false); // spinner for search only
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingBlog, setEditingBlog] = useState<any | null>(null); // <-- NEW
  const limit = 10;
  const router = useRouter();

  // cancel in-flight requests
  const abortRef = useRef<AbortController | null>(null);

  // auth check
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Please login to access admin blogs');
      router.push('/cms/login');
    }
  }, [router]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  // fetch data
  useEffect(() => {
    fetchBlogs({ isSearchPhase: debouncedQuery.length >= 2 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedQuery]);

  const fetchBlogs = async ({ isSearchPhase }: { isSearchPhase: boolean }) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (isSearchPhase) setSearchLoading(true);
      else setLoading(true);

      let resp;
      if (isSearchPhase) {
        resp = await apiService.searchBlogs(debouncedQuery, currentPage);
      } else {
        resp = await apiService.getBlogs({
          params: { page: currentPage, limit, sort: '-date' },
          signal: controller.signal as any,
        });
      }

      const data = resp?.data || resp;
      const items = data?.blogs || data?.data || [];
      setBlogs(Array.isArray(items) ? items : []);
      setTotalPages(data?.totalPages || 1);
    } catch (error: any) {
      if (error?.name !== 'CanceledError' && error?.message !== 'canceled') {
        console.error('Error fetching blogs:', error);
        toast.error('Failed to load blogs');
      }
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  // --- EDIT FLOW ---
  const handleEdit = (blog: any) => {
    setEditingBlog(blog);                        // show form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (_saved: any) => {
    toast.success('Blog saved successfully');
    setEditingBlog(null);                        // back to list
    await fetchBlogs({ isSearchPhase: debouncedQuery.length >= 2 });
  };

  const handleCancel = () => {
    setEditingBlog(null);                        // back to list
  };

  // delete / date update
  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteBlog(id);
      toast.success('Blog deleted successfully');
      if (blogs.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        fetchBlogs({ isSearchPhase: debouncedQuery.length >= 2 });
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    }
  };

  const handleUpdateDate = async (id: string, date: string) => {
    try {
      await apiService.updateBlogDate(id, date);
      toast.success('Blog date updated successfully');
      fetchBlogs({ isSearchPhase: debouncedQuery.length >= 2 });
    } catch (error) {
      console.error('Error updating blog date:', error);
      toast.error('Failed to update blog date');
    }
  };

  // ✅ NEW: Deactivate → moves blog to pending and refreshes list
  const handleDeactivate = async (id: string) => {
    try {
      await apiService.deactivateBlog(id);
      toast.success('Blog moved to Pending');
      // if last item on page was deactivated, move one page back
      if (blogs.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        fetchBlogs({ isSearchPhase: debouncedQuery.length >= 2 });
      }
    } catch (error) {
      console.error('Error deactivating blog:', error);
      toast.error('Failed to deactivate blog');
    }
  };

  // initial skeleton
  if (loading && blogs.length === 0) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      {!editingBlog && (
        <div className="flex items-center gap-3 justify-between">
          <input
            type="text"
            placeholder="Search by title, content, or category… (min 2 chars)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:w-1/2 border border-gray-300 rounded-md px-3 py-2"
          />
          {searchLoading && <span className="text-sm text-gray-500">Searching…</span>}
        </div>
      )}

      {/* CONDITIONAL: Form when editing, else table */}
      {editingBlog ? (
        <AdminBlogForm
          blog={editingBlog}               // existing blog prefilled
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <>
          <AdminBlogTable
            blogs={blogs}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onUpdateDate={handleUpdateDate}
            onDeactivate={handleDeactivate}   
            startIndex={(currentPage - 1) * limit}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>

              <span className="px-3 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
