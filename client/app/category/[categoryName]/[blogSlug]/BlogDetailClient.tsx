'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BlogDetail from '../../../components/BlogDetail';
import { getBlogByCategoryAndSlug } from '../../../lib/api';

interface BlogDetailClientProps {
  params: {
    categoryName: string;
    blogSlug: string;
  };
}

/** Turn clean URL slugs into the exact category string your API expects. */
function categorySlugToApiName(slug: string) {
  const s = decodeURIComponent(slug || '').trim().toLowerCase();

  // support both "-and-" and "-&-" URL forms → " & "
  const withAmp = s.replace(/-and-/g, ' & ').replace(/-&-/g, ' & ');

  // remaining hyphens → spaces
  const spaced = withAmp.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();

  // Title-case words so it matches your category names in DB (e.g. "Health & Wellness")
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

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);

        // 👇 normalize the category slug for the API
        const categoryForApi = categorySlugToApiName(params.categoryName);

        const blogData = await getBlogByCategoryAndSlug(categoryForApi, params.blogSlug);
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
  }, [params.categoryName, params.blogSlug]);

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
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return <BlogDetail blog={blog} />;
}
