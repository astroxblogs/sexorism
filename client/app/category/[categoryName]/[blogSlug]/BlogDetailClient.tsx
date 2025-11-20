'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next'; // ADDED: For language detection
import BlogDetail from '../../../components/BlogDetail';
import { getBlogByCategoryAndSlug } from '../../../lib/api';
import { makeCategoryLink, makeBlogLink } from '../../../lib/paths';
import api from '../../../lib/api';
// import AdSense from '../../../components/AdSense';

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
  const [otherBlogs, setOtherBlogs] = useState<any[]>([]);
  const [otherBlogsLoading, setOtherBlogsLoading] = useState(false);
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

  // Fetch other categories' latest blogs
  useEffect(() => {
    const fetchOtherBlogs = async () => {
      if (!blog) return;

      setOtherBlogsLoading(true);
      try {
        // Get current category name
        const currentCategory = categorySlugToApiName(params.categoryName);

        // Fetch blogs excluding current category, limit to 4
        const response = await api.get('/blogs', {
          params: {
            excludeCategory: currentCategory,
            limit: 4,
            lang: lang
          }
        });

        const blogs = response.data?.blogs || [];
        setOtherBlogs(blogs);
      } catch (error) {
        console.error('Error fetching other blogs:', error);
        setOtherBlogs([]);
      } finally {
        setOtherBlogsLoading(false);
      }
    };

    fetchOtherBlogs();
  }, [blog, params.categoryName, lang]);

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
      {/* AD: Article Top Banner (below header / above content component)
      <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-0 my-4 empty:hidden">
        <AdSense slot="article_top_banner" className="ad-slot ad-slot--leaderboard w-full" />
      </div> */}

      <BlogDetail blog={blog} />

      {/* Other Categories Latest Articles */}
      {otherBlogs.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="border-t border-[var(--color-border)] pt-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-8 text-center">
              {lang === 'hi' ? 'और भी बोल्ड कंटेंट देखें' : 'Explore More From Our Bold Collection'}
            </h2>

            {otherBlogsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-accent)]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {otherBlogs.map((otherBlog, index) => (
                  <article
                    key={otherBlog._id}
                    className="group cursor-pointer bg-[var(--color-bg-primary)] rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-[var(--color-border)]"
                    onClick={() => router.push(makeBlogLink(lang === 'hi' ? 'hi' : 'en', otherBlog.category?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'uncategorized', otherBlog.slug || otherBlog._id))}
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={otherBlog.image}
                        alt={otherBlog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-2 mb-2">
                        {otherBlog.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                        <span className="bg-[var(--color-bg-secondary)] px-2 py-1 rounded-full">
                          {otherBlog.category}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AD: Article Bottom (above footer / below content component) */}
      {/* <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-0 my-6 empty:hidden">
        <AdSense slot="article_bottom" className="ad-slot ad-slot--rectangle w-full" />
      </div> */}
    </>
  );
}
