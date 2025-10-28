'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next'; // ADDED: For language detection
import BlogDetail from '../../../components/BlogDetail';
import { getBlogByCategoryAndSlug } from '../../../lib/api';
import AdSense from '../../../components/AdSense';

interface BlogDetailClientProps {
  params: {
    categoryName: string;
    blogSlug: string;
  };
}

/** Turn clean URL slugs into the exact category string your API expects. */
function categorySlugToApiName(slug: string) {
  const s = decodeURIComponent(slug || '').trim().toLowerCase();
  const withAmp = s.replace(/-and-/g, ' & ').replace(/-&-/g, ' & ');
  const spaced = withAmp.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
  return spaced
    .split(' ')
    .map(w => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

export default function BlogDetailClient({ params }: BlogDetailClientProps) {
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // ADDED: Get current language from i18next
  const { i18n } = useTranslation();
  const lang = (i18n?.resolvedLanguage || i18n?.language || 'en').toLowerCase();
  const basePrefix = lang.startsWith('hi') ? '/hi' : '';

  // UPDATED: Soft-rewrite is now locale-aware
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const desiredPath = `${basePrefix}/${params.categoryName}/${params.blogSlug}`;
      // Also check if the current path lacks the prefix when it should have one
      const needsPrefix = basePrefix && !window.location.pathname.startsWith(basePrefix);
      const isLegacy = window.location.pathname.startsWith('/category/');

      if (isLegacy || needsPrefix) {
        router.replace(desiredPath);
      }
    }
  }, [params.categoryName, params.blogSlug, basePrefix, router]);

  // UPDATED: Data fetching is now locale-aware
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const categoryForApi = categorySlugToApiName(params.categoryName);
        
        // Pass the current language to the API call
        const blogData = await getBlogByCategoryAndSlug(categoryForApi, params.blogSlug, lang);
        setBlog(blogData);
      } catch (err) {
        console.error('Error fetching blog:', err);
        setError('Blog not found');
      } finally {
        setLoading(false);
      }
    };

    if (params.categoryName && params.blogSlug) {
      fetchBlog();
    }
  }, [params.categoryName, params.blogSlug, lang]); // ADDED: `lang` dependency to re-fetch on language change

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Blog Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">The blog post you're looking for doesn't exist.</p>
          <button
            // UPDATED: "Go Home" button is now locale-aware
            onClick={() => router.push(basePrefix || '/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }
return (
    <>
      {/* AD: Article Top Banner (below header / above content component) */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-0 my-4 empty:hidden">
        <AdSense slot="article_top_banner" className="ad-slot ad-slot--leaderboard w-full" />
      </div>

      <BlogDetail blog={blog} />

      {/* AD: Article Bottom (above footer / below content component) */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-0 my-6 empty:hidden">
        <AdSense slot="article_bottom" className="ad-slot ad-slot--rectangle w-full" />
      </div>
    </>
  );
}
