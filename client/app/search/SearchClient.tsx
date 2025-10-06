'use client';

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import DOMPurify from "dompurify";
import truncate from "html-truncate";
import { slugify } from "../lib/slugify";

interface Blog {
  _id: string;
  title: string;
  content: string;
  image?: string;
  category?: string;
  slug: string;
  date: string;
}

const SearchClient = () => {
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchBlogs = async () => {
      if (!query) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/blogs/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
        );
        const data = await response.json();

        setBlogs(data.blogs || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError("Failed to fetch search results.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [query, page]);

  const handlePrevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const getSnippet = (htmlContent: string, maxLength = 200) => {
    if (!htmlContent) return "";
    const truncated = truncate(htmlContent, maxLength, { ellipsis: "..." });
    return DOMPurify.sanitize(truncated);
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 animate-pulse">
          <div className="h-56 bg-gray-300 dark:bg-gray-700"></div>
          <div className="p-6 space-y-4">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-lg w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/5"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Hero Section with Search Query */}
        <div className="text-center mb-16 space-y-6">
          <div className="relative">
            <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
              Search Results
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-blue-600/20 blur-3xl -z-10 animate-pulse"></div>
          </div>

          <div className="relative inline-block">
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-medium">
              Found amazing content for:{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent font-bold text-2xl md:text-3xl">
                  "{query}"
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-violet-600/50 to-purple-600/50 rounded-full transform scale-x-0 animate-[scaleX_0.8s_ease-out_forwards]"></div>
              </span>
            </p>
          </div>

          <div className="flex justify-center">
            <div className="h-1 w-24 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"></div>
          </div>
        </div>

        {/* Loading State */}
        {loading && <LoadingSkeleton />}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <p className="text-xl text-red-600 dark:text-red-400 font-semibold">{error}</p>
          </div>
        )}

        {/* No Results State */}
        {!loading && !error && blogs.length === 0 && query && (
          <div className="flex flex-col items-center justify-center py-20 space-y-8">
            <div className="relative">
              <div className="w-40 h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:from-gray-600/50 rounded-full blur-xl animate-pulse"></div>
            </div>
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300">No Results Found</h3>
              <p className="text-lg text-gray-500 dark:text-gray-400 max-w-md">
                We couldn't find any blogs matching <span className="font-semibold text-violet-600">"{query}"</span>.
                Try searching with different keywords.
              </p>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!loading && !error && blogs.length > 0 && (
          <>
            <div className="mb-8">
              <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                Found <span className="text-violet-600 font-bold">{blogs.length}</span> amazing articles
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
              {blogs.map((blog, index) => (
                <Link
                  key={blog._id}
                  href={`/category/${blog.category ? slugify(blog.category) : "uncategorized"}/${blog.slug}`}
                  className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 transform-gpu"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: "fadeInUp 0.6s ease-out forwards"
                  }}
                >
                  {/* Hover Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-violet-500/10 group-hover:via-purple-500/10 group-hover:to-blue-500/10 transition-all duration-500 rounded-2xl"></div>

                  {/* Image Section */}
                  {blog.image && (
                    <div className="relative overflow-hidden h-56">
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-500 rounded-full shadow-lg backdrop-blur-sm">
                          {blog.category || "Uncategorized"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Content Section */}
                  <div className="relative p-6 space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300">
                      {blog.title}
                    </h2>

                    <div
                      className="text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: getSnippet(blog.content) }}
                    />

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          {new Date(blog.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center text-violet-600 dark:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-sm font-medium mr-1">Read more</span>
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Shine Effect */}
                    <div className="absolute inset-0 -top-full bg-gradient-to-b from-transparent via-white/10 to-transparent transform rotate-12 group-hover:top-full transition-all duration-1000 ease-out"></div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 py-12">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="group relative px-6 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300 transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300">Previous</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 to-purple-500/0 group-hover:from-violet-500/5 group-hover:to-purple-500/5 rounded-xl transition-all duration-300"></div>
              </button>

              <div className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-xl border border-violet-200 dark:border-violet-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Page</span>
                <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  {page}
                </span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">of</span>
                <span className="text-lg font-bold text-gray-700 dark:text-gray-300">{totalPages}</span>
              </div>

              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className="group relative px-6 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300">Next</span>
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 to-purple-500/0 group-hover:from-violet-500/5 group-hover:to-purple-500/5 rounded-xl transition-all duration-300"></div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleX {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default SearchClient;