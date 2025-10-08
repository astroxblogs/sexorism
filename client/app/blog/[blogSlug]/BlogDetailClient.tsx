'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import BlogDetail from '../../components/BlogDetail';
import { getBlogBySlug } from '../../lib/api';

interface BlogDetailClientProps {
  params: {
    blogSlug: string;
  };
}

export default function BlogDetailClient({ params }: BlogDetailClientProps) {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { i18n } = useTranslation();

  // current language ('en' | 'hi' etc.)
  const lang = i18n?.resolvedLanguage || i18n?.language || 'en';

  useEffect(() => {
    const controller = new AbortController();

    const fetchBlog = async () => {
      if (!params.blogSlug) return;

      try {
        setLoading(true);
        setError(null);

        // ✅ pass language + abort signal
        const blogData = await getBlogBySlug(params.blogSlug, {
          lang,
          signal: controller.signal,
        });

        setBlog(blogData);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Error fetching blog:', err);
        setError('Blog not found');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();

    // ✅ cleanup if user switches page fast
    return () => controller.abort();
  }, [params.blogSlug, lang]); // 🔥 refetch when language changes

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Blog Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The blog post you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // ✅ key={lang} forces re-render when switching languages
  return <div key={lang}><BlogDetail blog={blog} /></div>;
}
