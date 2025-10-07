'use client'

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '../lib/api';
import { getAuthToken } from '../utils/localStorage';
import { toast } from 'react-hot-toast';
import { AdminBlogTable } from './AdminBlogTable';

export default function BlogManagementComponent() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);          // initial/full load
  const [searchLoading, setSearchLoading] = useState(false); // lightweight spinner for search only
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');  // debounced value
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const router = useRouter();

  // Keep a ref to abort in-flight requests when a new one starts
  const abortRef = useRef<AbortController | null>(null);

  // ---- auth check ----
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Please login to access admin blogs');
      router.push('/cms/login');
      return;
    }
  }, [router]);

  // ---- debounce the search term (350ms) ----
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query.trim());
      // reset to page 1 when the effective query changes
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  // ---- fetch whenever page or debounced query changes ----
  useEffect(() => {
    fetchBlogs({ isSearchPhase: debouncedQuery.length >= 2 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedQuery]);

  const fetchBlogs = async ({ isSearchPhase }: { isSearchPhase: boolean }) => {
    // cancel the last request if it's still running
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // show only one of the spinners
      if (isSearchPhase) {
        setSearchLoading(true);
      } else {
        setLoading(true);
      }

      let resp;

      // Use search API only when query length >= 2
      if (isSearchPhase) {
        resp = await apiService.searchBlogs(debouncedQuery, currentPage);
      } else {
        resp = await apiService.getBlogs({
          params: { page: currentPage, limit, sort: '-date' },
          signal: controller.signal as any, // axios supports AbortController via `signal`
        });
      }

      const data = resp?.data || resp;
      const items = data?.blogs || data?.data || [];

      setBlogs(Array.isArray(items) ? items : []);
      setTotalPages(data?.totalPages || 1);
    } catch (error: any) {
      // ignore aborted requests (common during quick typing)
      if (error?.name !== 'CanceledError' && error?.message !== 'canceled') {
        console.error('Error fetching blogs:', error);
        toast.error('Failed to load blogs');
      }
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const handleEdit = (blog: any) => {
    console.log('Edit blog:', blog);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteBlog(id);
      toast.success('Blog deleted successfully');
      // if we deleted the last item on the page, go back a page
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
      <div className="flex items-center gap-3 justify-between">
        <input
          type="text"
          placeholder="Search by title, content, tag, or category… (min 2 chars)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full md:w-1/2 border border-gray-300 rounded-md px-3 py-2"
        />
        {searchLoading && (
          <span className="text-sm text-gray-500">Searching…</span>
        )}
      </div>

      {/* Table */}
      <AdminBlogTable
        blogs={blogs}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUpdateDate={handleUpdateDate}
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
    </div>
  );
}
