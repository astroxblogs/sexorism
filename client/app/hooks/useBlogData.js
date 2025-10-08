import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getBlogByCategoryAndSlug } from '../lib/api';

const useBlogData = (categoryName, blogSlug, initialBlog) => {
  const { i18n } = useTranslation();
  const lang = i18n?.resolvedLanguage || i18n?.language || 'en';

  const [blog, setBlog] = useState(initialBlog || null);
  const [loading, setLoading] = useState(!initialBlog);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const shouldUseInitial =
      !!initialBlog &&
      // if your API returns language on the blog object, prefer strict match:
      (initialBlog.lang ? initialBlog.lang === lang : false);

    // If the initial blog matches the current language, use it; otherwise fetch
    if (shouldUseInitial) {
      setBlog(initialBlog);
      setLoading(false);
      setError(null);
      return () => controller.abort();
    }

    const fetchBlog = async () => {
      if (!categoryName || !blogSlug) return;

      setLoading(true);
      setError(null);
      // clear while switching language so UI shows skeleton/loader
      setBlog((prev) => (prev && prev.lang === lang ? prev : null));

      try {
        const blogData = await getBlogByCategoryAndSlug(
          categoryName,
          blogSlug,
          { lang, signal: controller.signal }
        );

        if (blogData) {
          // ensure the language is stored on the blog for future comparisons
          setBlog({ ...(blogData || {}), lang });
        } else {
          setError('Blog post not found.');
        }
      } catch (err) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') return;
        console.error('Failed to fetch blog post:', err);
        setError(`Failed to load blog post: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
    return () => controller.abort();

    // ⬇️ language added to deps so we refetch when user switches languages
  }, [categoryName, blogSlug, lang, initialBlog]);

  return { blog, loading, error };
};

export default useBlogData;
